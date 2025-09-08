#!/usr/bin/env node

// Minimal MCP server that actually works with Claude
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create server
const server = new Server(
  {
    name: 'app-preview-simple',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add screenshot analysis tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'analyze_screenshot',
      description: 'Analyze an app screenshot and generate marketing copy. Provide the file path to a saved screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          image_path: {
            type: 'string',
            description: 'File path to the screenshot image'
          },
          context: {
            type: 'string',
            description: 'Optional context about the app'
          }
        },
        required: ['image_path']
      }
    },
    {
      name: 'refine_copy',
      description: 'Refine marketing copy based on feedback',
      inputSchema: {
        type: 'object',
        properties: {
          current_copy: {
            type: 'string',
            description: 'Current marketing copy JSON'
          },
          feedback: {
            type: 'string',
            description: 'Feedback for improvement'
          }
        },
        required: ['current_copy', 'feedback']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'analyze_screenshot') {
    const imagePath = args.image_path;
    const context = args.context || '';
    
    // Return instructions for Claude Code to analyze the image
    const instructions = `Please analyze the screenshot at: ${imagePath}

${context ? `Context: ${context}\n\n` : ''}Based on what you see in this app screenshot, generate App Store marketing copy.

Return ONLY valid JSON in this exact format:
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
    
    return {
      content: [
        {
          type: 'text',
          text: instructions
        }
      ]
    };
  }
  
  if (name === 'refine_copy') {
    const instructions = `Please refine this marketing copy based on the feedback:\n\nCurrent copy: ${args.current_copy}\n\nFeedback: ${args.feedback}\n\nReturn the improved JSON with the same structure.`;
    
    return {
      content: [
        {
          type: 'text',
          text: instructions
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Don't log to stdout - it interferes with the protocol
  console.error('Simple MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});