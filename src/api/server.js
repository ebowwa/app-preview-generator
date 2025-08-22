import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: image.split(',')[1]
            }
          },
          {
            type: 'text',
            text: `Analyze this app screenshot and generate App Store preview content. Return JSON:
{
  "appName": "detected app name",
  "headline": "compelling headline under 30 chars",
  "subheadline": "descriptive subheadline under 60 chars",
  "benefits": ["3 key benefits from the app"],
  "ctaText": "action-oriented button text",
  "colors": {
    "primary": "#hex color",
    "secondary": "#hex color",
    "background": "#hex color",
    "text": "#hex color"
  }
}`
          }
        ]
      }]
    });
    
    const analysis = JSON.parse(message.content[0].text);
    res.json(analysis);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze screenshot' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Claude API server running on http://localhost:${PORT}`);
  console.log('Set ANTHROPIC_API_KEY environment variable to connect to Claude');
});