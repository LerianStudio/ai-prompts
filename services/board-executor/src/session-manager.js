import { createLogger } from '../../lib/logger.js';

/**
 * Session Manager - Handles Claude Code session persistence and management
 * Tracks active sessions and provides session lookup by task ID
 */
export class SessionManager {
  constructor(options = {}) {
    this.logger = createLogger('session-manager');
    this.sessions = new Map(); // sessionId -> session data
    this.taskSessions = new Map(); // taskId -> sessionId
    this.maxSessions = options.maxSessions || 1000;
    this.sessionTimeout = options.sessionTimeout || 3600000; // 1 hour
  }

  /**
   * Store a new session
   */
  storeSession(sessionId, taskId, metadata = {}) {
    const session = {
      id: sessionId,
      taskId,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      metadata: {
        title: metadata.title || 'Untitled Task',
        startTime: metadata.startTime || new Date().toISOString(),
        targetSession: metadata.targetSession || 'current',
        ...metadata
      }
    };

    this.sessions.set(sessionId, session);
    this.taskSessions.set(taskId, sessionId);

    this.logger.debug('Session stored', {
      sessionId,
      taskId,
      metadata: session.metadata
    });

    // Clean up old sessions if we exceed the limit
    this._cleanupOldSessions();

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Update last used time
      session.lastUsedAt = new Date();
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  /**
   * Get session by task ID
   */
  getSessionByTask(taskId) {
    const sessionId = this.taskSessions.get(taskId);
    if (sessionId) {
      return this.getSession(sessionId);
    }
    return null;
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      taskId: session.taskId,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt.toISOString(),
      metadata: session.metadata
    }));
  }

  /**
   * Update session metadata
   */
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.metadata = { ...session.metadata, ...updates };
      session.lastUsedAt = new Date();
      this.sessions.set(sessionId, session);

      this.logger.debug('Session updated', {
        sessionId,
        updates
      });

      return session;
    }
    return null;
  }

  /**
   * Remove session
   */
  removeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.taskSessions.delete(session.taskId);

      this.logger.debug('Session removed', {
        sessionId,
        taskId: session.taskId
      });

      return true;
    }
    return false;
  }

  /**
   * Clean up expired sessions
   */
  cleanup(maxAge = null) {
    const cutoff = new Date(Date.now() - (maxAge || this.sessionTimeout));
    const expired = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastUsedAt < cutoff) {
        this.sessions.delete(sessionId);
        this.taskSessions.delete(session.taskId);
        expired.push({
          sessionId,
          taskId: session.taskId,
          lastUsedAt: session.lastUsedAt.toISOString()
        });
      }
    }

    if (expired.length > 0) {
      this.logger.info('Cleaned up expired sessions', {
        count: expired.length,
        cutoff: cutoff.toISOString()
      });
    }

    return expired;
  }

  /**
   * Clean up old sessions when limit is exceeded
   */
  _cleanupOldSessions() {
    if (this.sessions.size <= this.maxSessions) {
      return;
    }

    // Sort sessions by last used time and remove oldest
    const sortedSessions = Array.from(this.sessions.entries())
      .sort(([, a], [, b]) => a.lastUsedAt - b.lastUsedAt);

    const toRemove = sortedSessions.slice(0, this.sessions.size - this.maxSessions);

    for (const [sessionId, session] of toRemove) {
      this.sessions.delete(sessionId);
      this.taskSessions.delete(session.taskId);
    }

    if (toRemove.length > 0) {
      this.logger.info('Cleaned up old sessions due to limit', {
        removedCount: toRemove.length,
        limit: this.maxSessions
      });
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    const now = new Date();
    const recentSessions = Array.from(this.sessions.values())
      .filter(session => now - session.lastUsedAt < 300000) // 5 minutes
      .length;

    return {
      totalSessions: this.sessions.size,
      recentSessions,
      maxSessions: this.maxSessions,
      sessionTimeout: this.sessionTimeout
    };
  }

  /**
   * Check if session exists and is valid
   */
  isValidSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Check if session is not expired
    const now = new Date();
    const isExpired = now - session.lastUsedAt > this.sessionTimeout;

    if (isExpired) {
      this.removeSession(sessionId);
      return false;
    }

    return true;
  }
}