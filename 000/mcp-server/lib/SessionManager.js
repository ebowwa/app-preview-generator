/**
 * Session Manager - Single Responsibility: Managing analysis sessions and history
 */
export class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.history = [];
    this.currentSessionId = null;
  }

  createSession(metadata = {}) {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      metadata,
      analyses: [],
      refinements: []
    };
    
    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;
    
    return sessionId;
  }

  addAnalysis(sessionId, analysis) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.analyses.push({
        timestamp: new Date().toISOString(),
        ...analysis
      });
      
      this.history.push({
        type: 'analysis',
        sessionId,
        timestamp: new Date().toISOString(),
        data: analysis
      });
    }
  }

  addRefinement(sessionId, refinement) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.refinements.push({
        timestamp: new Date().toISOString(),
        ...refinement
      });
      
      this.history.push({
        type: 'refinement',
        sessionId,
        timestamp: new Date().toISOString(),
        data: refinement
      });
    }
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getCurrentSession() {
    return this.currentSessionId ? this.sessions.get(this.currentSessionId) : null;
  }

  getContext() {
    return {
      currentSessionId: this.currentSessionId,
      totalSessions: this.sessions.size,
      historyLength: this.history.length,
      recentHistory: this.history.slice(-10),
      currentSession: this.getCurrentSession()
    };
  }

  clearOldSessions(maxAge = 3600000) { // 1 hour
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      const age = now - new Date(session.createdAt).getTime();
      if (age > maxAge) {
        this.sessions.delete(id);
      }
    }
  }
}