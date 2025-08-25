#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Store for conversation context and screenshot data
const conversationContext = {
  screenshots: new Map(),
  analysisHistory: [],
  currentSession: null
};

// Create MCP server
const server = new Server(
  {
    name: 'app-preview-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'analyze_screenshot',
      description: 'Analyze an app screenshot and generate marketing copy. Provide base64 image data and optional context.',
      inputSchema: {
        type: 'object',
        properties: {
          image_base64: {
            type: 'string',
            description: 'Base64 encoded image data (without data URL prefix)'
          },
          context: {
            type: 'string',
            description: 'Optional context about the app (target audience, key features, competitors, etc.)'
          },
          app_category: {
            type: 'string',
            description: 'App category (productivity, social, gaming, finance, etc.)',
            enum: ['productivity', 'social', 'gaming', 'finance', 'health', 'education', 'entertainment', 'utilities', 'other']
          }
        },
        required: ['image_base64']
      }
    },
    {
      name: 'refine_marketing_copy',
      description: 'Refine previously generated marketing copy based on feedback',
      inputSchema: {
        type: 'object',
        properties: {
          current_copy: {
            type: 'object',
            description: 'Current marketing copy to refine',
            properties: {
              appName: { type: 'string' },
              headline: { type: 'string' },
              subheadline: { type: 'string' },
              benefits: { type: 'array', items: { type: 'string' } },
              ctaText: { type: 'string' }
            }
          },
          feedback: {
            type: 'string',
            description: 'Specific feedback or direction for refinement'
          },
          tone: {
            type: 'string',
            description: 'Desired tone',
            enum: ['professional', 'casual', 'playful', 'urgent', 'inspirational', 'technical']
          }
        },
        required: ['current_copy', 'feedback']
      }
    },
    {
      name: 'extract_color_palette',
      description: 'Extract a color palette from the screenshot for the preview design',
      inputSchema: {
        type: 'object',
        properties: {
          image_base64: {
            type: 'string',
            description: 'Base64 encoded image data'
          },
          style: {
            type: 'string',
            description: 'Color extraction style',
            enum: ['vibrant', 'muted', 'monochrome', 'complementary']
          }
        },
        required: ['image_base64']
      }
    },
    {
      name: 'generate_alternatives',
      description: 'Generate multiple alternative versions of marketing copy for A/B testing',
      inputSchema: {
        type: 'object',
        properties: {
          base_copy: {
            type: 'object',
            description: 'Base marketing copy to create alternatives from'
          },
          num_alternatives: {
            type: 'number',
            description: 'Number of alternatives to generate (1-5)',
            minimum: 1,
            maximum: 5
          },
          variation_focus: {
            type: 'string',
            description: 'What to vary',
            enum: ['headlines', 'benefits', 'cta', 'all']
          }
        },
        required: ['base_copy']
      }
    },
    {
      name: 'get_session_context',
      description: 'Get the current session context and analysis history',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze_screenshot': {
        // Save screenshot to temp file for Claude to analyze
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-screenshot-'));
        const imagePath = path.join(tempDir, 'screenshot.png');
        await fs.writeFile(imagePath, args.image_base64, 'base64');
        
        // Store in context
        const sessionId = Date.now().toString();
        conversationContext.screenshots.set(sessionId, imagePath);
        conversationContext.currentSession = sessionId;
        
        // Build analysis prompt
        const contextInfo = args.context ? `\nAdditional context: ${args.context}` : '';
        const categoryInfo = args.app_category ? `\nApp category: ${args.app_category}` : '';
        
        const result = {
          appName: "App Name (Analyze the screenshot at " + imagePath + ")",
          headline: "Compelling headline based on the app's main value proposition",
          subheadline: "Descriptive subheadline that expands on the headline",
          benefits: [
            "Key benefit 1 visible in the screenshot",
            "Key benefit 2 based on the UI/UX",
            "Key benefit 3 from the app's features"
          ],
          ctaText: "Action-oriented button text",
          colors: {
            primary: "#007AFF",
            secondary: "#5856D6",
            background: "#F2F2F7",
            text: "#000000"
          },
          analysis_notes: `Screenshot saved at: ${imagePath}${contextInfo}${categoryInfo}\n\nTo properly analyze this, Claude Code needs to view the image and understand the app's purpose, target audience, and unique features.`,
          session_id: sessionId
        };
        
        // Store in history
        conversationContext.analysisHistory.push({
          timestamp: new Date().toISOString(),
          type: 'analyze_screenshot',
          result
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'refine_marketing_copy': {
        const { current_copy, feedback, tone } = args;
        
        const refinementPrompt = `
Current marketing copy: ${JSON.stringify(current_copy, null, 2)}
Feedback: ${feedback}
${tone ? `Desired tone: ${tone}` : ''}

Please refine the marketing copy based on this feedback.`;
        
        // In a real implementation, this would interact with Claude
        const refined = {
          ...current_copy,
          headline: current_copy.headline + " (Refined)",
          refined_based_on: feedback,
          tone_applied: tone || 'original',
          session_id: conversationContext.currentSession
        };
        
        conversationContext.analysisHistory.push({
          timestamp: new Date().toISOString(),
          type: 'refine_marketing_copy',
          input: { current_copy, feedback, tone },
          result: refined
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(refined, null, 2)
            }
          ]
        };
      }
      
      case 'extract_color_palette': {
        const { image_base64, style } = args;
        
        // Save image for analysis
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-colors-'));
        const imagePath = path.join(tempDir, 'screenshot.png');
        await fs.writeFile(imagePath, image_base64, 'base64');
        
        const palette = {
          primary: "#007AFF",
          secondary: "#5856D6",
          accent: "#FF375F",
          background: "#FFFFFF",
          surface: "#F2F2F7",
          text: "#000000",
          textSecondary: "#8E8E93",
          success: "#34C759",
          warning: "#FF9500",
          error: "#FF3B30",
          style_applied: style || 'auto',
          image_path: imagePath,
          note: "Color palette should be extracted from the actual screenshot"
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(palette, null, 2)
            }
          ]
        };
      }
      
      case 'generate_alternatives': {
        const { base_copy, num_alternatives = 3, variation_focus = 'all' } = args;
        
        const alternatives = [];
        for (let i = 0; i < num_alternatives; i++) {
          alternatives.push({
            version: `Alternative ${i + 1}`,
            ...base_copy,
            headline: `${base_copy.headline} - Variant ${i + 1}`,
            variation_focus,
            session_id: conversationContext.currentSession
          });
        }
        
        conversationContext.analysisHistory.push({
          timestamp: new Date().toISOString(),
          type: 'generate_alternatives',
          input: { base_copy, num_alternatives, variation_focus },
          result: alternatives
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(alternatives, null, 2)
            }
          ]
        };
      }
      
      case 'get_session_context': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                current_session: conversationContext.currentSession,
                screenshots_analyzed: conversationContext.screenshots.size,
                history_length: conversationContext.analysisHistory.length,
                recent_analyses: conversationContext.analysisHistory.slice(-5)
              }, null, 2)
            }
          ]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name
          })
        }
      ]
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('App Preview MCP Server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});