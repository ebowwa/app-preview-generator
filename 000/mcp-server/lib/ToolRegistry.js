/**
 * Tool Registry - Single Responsibility: Managing tool definitions and handlers
 */
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.definitions = new Map();
  }

  register(name, handler, definition) {
    this.tools.set(name, handler);
    
    // Auto-generate definition if not provided
    if (!definition) {
      definition = this.generateDefinition(name, handler);
    }
    
    this.definitions.set(name, definition);
  }

  getHandler(name) {
    return this.tools.get(name);
  }

  getToolDefinitions() {
    return Array.from(this.definitions.values());
  }

  generateDefinition(name, handler) {
    // Generate tool definition based on handler metadata
    const definitions = {
      'analyze_screenshot': {
        name: 'analyze_screenshot',
        description: 'Analyze an app screenshot and generate marketing copy',
        inputSchema: {
          type: 'object',
          properties: {
            image_base64: {
              type: 'string',
              description: 'Base64 encoded image data'
            },
            context: {
              type: 'string',
              description: 'Optional context about the app'
            },
            app_category: {
              type: 'string',
              description: 'App category',
              enum: ['productivity', 'social', 'gaming', 'finance', 'health', 'education', 'utilities', 'other']
            }
          },
          required: ['image_base64']
        }
      },
      'refine_marketing_copy': {
        name: 'refine_marketing_copy',
        description: 'Refine previously generated marketing copy',
        inputSchema: {
          type: 'object',
          properties: {
            current_copy: {
              type: 'object',
              description: 'Current marketing copy to refine'
            },
            feedback: {
              type: 'string',
              description: 'Specific feedback for refinement'
            },
            tone: {
              type: 'string',
              enum: ['professional', 'casual', 'playful', 'urgent', 'inspirational']
            }
          },
          required: ['current_copy', 'feedback']
        }
      },
      'extract_color_palette': {
        name: 'extract_color_palette',
        description: 'Extract color palette from screenshot',
        inputSchema: {
          type: 'object',
          properties: {
            image_base64: {
              type: 'string',
              description: 'Base64 encoded image data'
            },
            style: {
              type: 'string',
              enum: ['vibrant', 'muted', 'monochrome', 'complementary']
            }
          },
          required: ['image_base64']
        }
      },
      'get_session_context': {
        name: 'get_session_context',
        description: 'Get current session context and history',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    };

    return definitions[name] || {
      name,
      description: `Execute ${name}`,
      inputSchema: { type: 'object', properties: {} }
    };
  }
}