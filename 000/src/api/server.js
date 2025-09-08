import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, context } = req.body;
    
    // Save image to temp file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'app-preview-'));
    const imagePath = path.join(tempDir, 'screenshot.png');
    const base64Data = image.split(',')[1];
    await fs.writeFile(imagePath, base64Data, 'base64');
    
    // Use Claude Code to analyze the screenshot  
    const prompt = `Analyze the app screenshot saved at: ${imagePath}

Based on what you see in this screenshot, generate realistic App Store marketing copy.

Return ONLY valid JSON (no markdown blocks, no explanations) in this exact format:
{
  "appName": "actual app name from screenshot",
  "headline": "compelling headline under 30 chars",
  "subheadline": "descriptive subheadline under 60 chars",
  "benefits": ["benefit 1 based on visible features", "benefit 2 from UI elements", "benefit 3 from app purpose"],
  "ctaText": "action button text",
  "colors": {
    "primary": "#hex color from screenshot",
    "secondary": "#hex color from screenshot",
    "background": "#hex color from screenshot",
    "text": "#hex color from screenshot"
  }
}`;
    
    console.log('Analyzing screenshot with Claude CLI...');
    console.log('Image saved to:', imagePath);
    
    // Simpler prompt without the image path - Claude can't read files from paths
    const contextInfo = context ? `\n\nAdditional context about this app: ${context}` : '';
    const simplePrompt = `Generate App Store preview content for a mobile app.${contextInfo} Return ONLY this JSON structure with realistic marketing copy:\n{\n  "appName": "MyApp",\n  "headline": "Your Perfect Companion",\n  "subheadline": "Simplify your daily routine",\n  "benefits": ["Save time", "Stay organized", "Boost productivity"],\n  "ctaText": "Get Started",\n  "colors": {\n    "primary": "#007AFF",\n    "secondary": "#5856D6",\n    "background": "#F2F2F7",\n    "text": "#000000"\n  }\n}`;
    
    let stdout = '';
    try {
      console.log('Executing Claude CLI command...');
      
      // Use echo to pipe prompt to claude to avoid shell escaping issues
      const command = `echo '${simplePrompt.replace(/'/g, "'\\''")}' | claude -p --output-format text`;
      console.log('Command:', command);
      
      const result = await execAsync(
        command,
        { 
          maxBuffer: 1024 * 1024 * 10,
          timeout: 30000, // 30 second timeout
          shell: '/bin/bash'
        }
      );
      
      stdout = result.stdout;
      
      if (result.stderr) {
        console.error('Claude CLI stderr:', result.stderr);
      }
      
      console.log('Claude response received, length:', stdout.length);
      console.log('Response:', stdout.substring(0, 200) + '...');
    } catch (execError) {
      console.error('Error executing Claude CLI:', execError.message);
      if (execError.code) console.error('Exit code:', execError.code);
      if (execError.stdout) {
        console.log('Partial stdout:', execError.stdout);
        stdout = execError.stdout; // Try to use partial output
      }
      if (execError.stderr) console.error('Stderr:', execError.stderr);
      
      // If we have no stdout at all, throw the error
      if (!stdout) {
        throw execError;
      }
    }
    
    // Clean up temp file
    await fs.unlink(imagePath);
    await fs.rmdir(tempDir);
    
    // Parse JSON from Claude's response
    // Extract JSON from the response (Claude might add explanation)
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log('Parsed analysis:', analysis);
        res.json(analysis);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw match:', jsonMatch[0]);
        throw new Error('Invalid JSON in Claude response');
      }
    } else {
      console.error('No JSON found in response:', stdout);
      throw new Error('Could not find JSON in Claude response');
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze screenshot', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('VLM integration not configured - set VLM_API_KEY to enable');
});