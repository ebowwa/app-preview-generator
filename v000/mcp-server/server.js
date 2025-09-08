#!/usr/bin/env node

/**
 * MCP Server for App Preview Generator
 * 
 * Architecture:
 * - Protocol Layer: Handles MCP communication
 * - Tool Registry: Manages available tools
 * - Handler Layer: Executes tool-specific logic
 * - Storage Layer: Manages temporary file storage
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import composable modules
import { ToolRegistry } from './lib/ToolRegistry.js';
import { StorageManager } from './lib/StorageManager.js';
import { AnalysisHandler } from './handlers/AnalysisHandler.js';
import { RefinementHandler } from './handlers/RefinementHandler.js';
import { ColorExtractionHandler } from './handlers/ColorExtractionHandler.js';
import { SessionManager } from './lib/SessionManager.js';

// Initialize components (Dependency Injection)
const storage = new StorageManager();
const sessions = new SessionManager();
const toolRegistry = new ToolRegistry();

// Register tool handlers (Composable)
toolRegistry.register('analyze_screenshot', new AnalysisHandler(storage, sessions));
toolRegistry.register('refine_marketing_copy', new RefinementHandler(sessions));
toolRegistry.register('extract_color_palette', new ColorExtractionHandler(storage));
toolRegistry.register('get_session_context', {
  execute: async () => sessions.getContext()
});

// Create MCP server
const server = new Server(
  {
    name: 'app-preview-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolRegistry.getToolDefinitions()
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    const handler = toolRegistry.getHandler(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    const result = await handler.execute(args);
    
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    // No fallbacks, just proper error handling
    console.error(`Tool execution error [${name}]:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: error.message,
            tool: name
          })
        }
      ]
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server v2.0 started - Clean architecture, no fallbacks');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await storage.cleanup();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});