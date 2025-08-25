/**
 * Analysis Handler - Single Responsibility: Handling screenshot analysis requests
 */
export class AnalysisHandler {
  constructor(storage, sessions) {
    this.storage = storage;
    this.sessions = sessions;
  }

  async execute(args) {
    const { image_base64, context, app_category } = args;
    
    if (!image_base64) {
      throw new Error('image_base64 is required');
    }

    // Save image to filesystem
    const imageFile = await this.storage.saveImage(image_base64);
    
    // Create or get session
    const sessionId = this.sessions.currentSessionId || this.sessions.createSession({
      category: app_category,
      context
    });

    // Build analysis request
    const analysisRequest = {
      instruction: 'ANALYZE_SCREENSHOT',
      imagePath: imageFile.path,
      context: context || '',
      category: app_category || 'unknown',
      sessionId,
      timestamp: new Date().toISOString()
    };

    // Store in session
    this.sessions.addAnalysis(sessionId, analysisRequest);

    // Return structured request for Claude to process
    // NO HARDCODED RESPONSES - just the actual request
    return {
      action: 'ANALYZE_IMAGE',
      data: {
        path: imageFile.path,
        prompt: this.buildAnalysisPrompt(context, app_category),
        sessionId,
        format: 'json'
      }
    };
  }

  buildAnalysisPrompt(context, category) {
    const base = `Analyze the app screenshot at the specified path and generate App Store marketing copy.`;
    const contextPart = context ? `\nApp context: ${context}` : '';
    const categoryPart = category ? `\nApp category: ${category}` : '';
    
    return `${base}${contextPart}${categoryPart}

Return a JSON object with:
- appName: The actual app name from the screenshot
- headline: Compelling headline (max 30 chars)
- subheadline: Descriptive subheadline (max 60 chars)  
- benefits: Array of 3 key benefits based on visible features
- ctaText: Action-oriented button text
- colors: Object with primary, secondary, background, text hex colors from the screenshot`;
  }
}