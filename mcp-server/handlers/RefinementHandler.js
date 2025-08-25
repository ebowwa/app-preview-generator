/**
 * Refinement Handler - Single Responsibility: Handling marketing copy refinement
 */
export class RefinementHandler {
  constructor(sessions) {
    this.sessions = sessions;
  }

  async execute(args) {
    const { current_copy, feedback, tone } = args;
    
    if (!current_copy || !feedback) {
      throw new Error('current_copy and feedback are required');
    }

    const sessionId = this.sessions.currentSessionId || this.sessions.createSession({
      type: 'refinement'
    });

    const refinementRequest = {
      currentCopy: current_copy,
      feedback,
      tone: tone || 'maintain',
      sessionId,
      timestamp: new Date().toISOString()
    };

    this.sessions.addRefinement(sessionId, refinementRequest);

    return {
      action: 'REFINE_COPY',
      data: {
        original: current_copy,
        instructions: feedback,
        tone,
        sessionId,
        format: 'json'
      }
    };
  }
}