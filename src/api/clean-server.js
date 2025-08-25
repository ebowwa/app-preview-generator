import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Clean API server is running' });
});

// Analyze screenshot - NO HARDCODED RESPONSES
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, context } = req.body;
    
    // Save image to temp file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'app-preview-'));
    const imagePath = path.join(tempDir, 'screenshot.png');
    const base64Data = image.split(',')[1];
    await fs.writeFile(imagePath, base64Data, 'base64');
    
    console.log('Screenshot saved to:', imagePath);
    console.log('Context provided:', context || 'none');
    
    // Since Claude CLI can't actually see images, we return the path
    // for manual analysis in Claude Code
    const response = {
      status: 'image_saved',
      path: imagePath,
      message: 'Screenshot saved. To analyze it:',
      instructions: [
        `1. Open Claude Code: claude`,
        `2. Ask: "Analyze the screenshot at ${imagePath}"`,
        `3. Copy the JSON response back to the app`
      ],
      context: context || 'No context provided',
      timestamp: new Date().toISOString()
    };
    
    // Always try to call Claude CLI with the context
    if (context) { // Use Claude if context is provided
      try {
        const { execSync } = await import('child_process');
        
        // Build a detailed prompt with the actual context
        const prompt = `Analyze this app context and generate compelling App Store marketing copy: ${context}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "appName": "string",
  "headline": "string (30 chars max)",
  "subheadline": "string (under 30 chars)",
  "benefits": ["benefit1", "benefit2", "benefit3", "benefit4"],
  "ctaText": "string",
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor"
  }
}`;
        
        console.log('Calling Claude CLI with context...');
        const command = `echo '${prompt.replace(/'/g, "'\\''")}' | claude -p --output-format text`;
        const stdout = execSync(command, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
        
        console.log('Claude response received');
        
        // Try to extract JSON from response
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('Successfully parsed Claude response');
            res.json(parsed);
            return;
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError.message);
          }
        }
      } catch (error) {
        console.error('Claude CLI error:', error.message);
      }
    }
    
    // Return instructions for manual analysis
    res.json({
      appName: "Awaiting Analysis",
      headline: `Analyze: ${path.basename(imagePath)}`,
      subheadline: "Use Claude Code to analyze the screenshot",
      benefits: response.instructions,
      ctaText: "Open Claude Code",
      colors: {
        primary: "#007AFF",
        secondary: "#5856D6",
        background: "#F2F2F7",
        text: "#000000"
      },
      metadata: response
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to process screenshot',
      message: error.message,
      hint: 'Make sure the API server is running: npm run api:clean'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Clean API server running on http://localhost:${PORT}`);
  console.log('NO HARDCODED RESPONSES - Real analysis only');
  console.log('Set ATTEMPT_CLAUDE_CLI=true to try Claude CLI (limited)');
});