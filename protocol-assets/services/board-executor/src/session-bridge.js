import { EventEmitter } from 'events';
import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../lib/logger.js';

/**
 * Session Bridge - Facilitates communication between Claude sessions
 * Creates a file-based communication protocol for session routing
 */
export class SessionBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = createLogger('session-bridge');
    this.config = {
      workingDirectory: options.workingDirectory || process.cwd(),
      sessionDirectory: options.sessionDirectory || '.claude-sessions',
      pollingInterval: options.pollingInterval || 1000,
      responseTimeout: options.responseTimeout || 30000,
      ...options
    };

    // Ensure session directory exists
    this.sessionDir = join(this.config.workingDirectory, this.config.sessionDirectory);
    this._ensureSessionDirectory();

    this.logger.info('Session Bridge initialized', {
      sessionDirectory: this.sessionDir,
      pollingInterval: this.config.pollingInterval
    });
  }

  /**
   * Send a task to a specific Claude session
   */
  async sendToSession(targetSession, taskData) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.info('Sending task to session', {
      targetSession,
      requestId,
      taskId: taskData.taskId
    });

    try {
      // Create session request file
      const requestFile = join(this.sessionDir, `${targetSession}_request_${requestId}.json`);
      const requestData = {
        requestId,
        targetSession,
        timestamp: new Date().toISOString(),
        type: 'task_execution',
        data: taskData,
        responseExpected: true,
        responseFile: `${targetSession}_response_${requestId}.json`
      };

      writeFileSync(requestFile, JSON.stringify(requestData, null, 2), 'utf8');

      this.emit('request_sent', {
        targetSession,
        requestId,
        requestFile
      });

      // Wait for response
      const response = await this._waitForResponse(targetSession, requestId);

      this.logger.info('Received response from session', {
        targetSession,
        requestId,
        success: response.success
      });

      return response;

    } catch (error) {
      this.logger.error('Failed to send task to session', {
        targetSession,
        requestId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check for incoming requests for this session
   */
  checkForRequests(sessionId = 'current') {
    const requestPattern = `${sessionId}_request_`;
    const files = this._getSessionFiles().filter(file => file.includes(requestPattern));

    const requests = [];
    for (const file of files) {
      try {
        const filePath = join(this.sessionDir, file);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        requests.push({
          file: filePath,
          ...data
        });
      } catch (error) {
        this.logger.warn('Failed to read request file', { file, error: error.message });
      }
    }

    if (requests.length > 0) {
      this.logger.info('Found incoming requests', {
        sessionId,
        requestCount: requests.length
      });
    }

    return requests;
  }

  /**
   * Respond to a request
   */
  async respondToRequest(request, response) {
    try {
      const responseFile = join(this.sessionDir, request.responseFile);
      const responseData = {
        requestId: request.requestId,
        timestamp: new Date().toISOString(),
        success: response.success,
        data: response.data,
        error: response.error || null
      };

      writeFileSync(responseFile, JSON.stringify(responseData, null, 2), 'utf8');

      // Clean up request file
      if (existsSync(request.file)) {
        unlinkSync(request.file);
      }

      this.logger.info('Response sent', {
        requestId: request.requestId,
        responseFile
      });

      this.emit('response_sent', {
        requestId: request.requestId,
        success: response.success
      });

    } catch (error) {
      this.logger.error('Failed to send response', {
        requestId: request.requestId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get available sessions (based on recent activity)
   */
  getAvailableSessions() {
    const files = this._getSessionFiles();
    const sessions = new Set();

    // Extract session IDs from file names
    for (const file of files) {
      const parts = file.split('_');
      if (parts.length >= 2) {
        sessions.add(parts[0]);
      }
    }

    // Add current session
    sessions.add('current');

    const sessionList = Array.from(sessions).map(sessionId => ({
      id: sessionId,
      name: sessionId === 'current' ? 'Current Session' : `Session ${sessionId}`,
      lastActivity: this._getLastActivity(sessionId),
      active: this._isSessionActive(sessionId)
    }));

    this.logger.debug('Available sessions', {
      sessions: sessionList.map(s => s.id),
      total: sessionList.length
    });

    return sessionList;
  }

  /**
   * Clean up old session files
   */
  cleanup(maxAge = 3600000) { // 1 hour default
    const cutoff = Date.now() - maxAge;
    const files = this._getSessionFiles();
    const cleaned = [];

    for (const file of files) {
      try {
        const filePath = join(this.sessionDir, file);
        const stats = statSync(filePath);

        if (stats.mtime.getTime() < cutoff) {
          unlinkSync(filePath);
          cleaned.push(file);
        }
      } catch (error) {
        this.logger.warn('Failed to clean file', { file, error: error.message });
      }
    }

    if (cleaned.length > 0) {
      this.logger.info('Cleaned up old session files', {
        count: cleaned.length,
        files: cleaned
      });
    }

    return cleaned;
  }

  /**
   * Wait for response from target session
   */
  async _waitForResponse(targetSession, requestId) {
    const responseFile = join(this.sessionDir, `${targetSession}_response_${requestId}.json`);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkResponse = () => {
        try {
          if (existsSync(responseFile)) {
            const response = JSON.parse(readFileSync(responseFile, 'utf8'));

            // Clean up response file
            unlinkSync(responseFile);

            resolve(response);
            return;
          }

          // Check timeout
          if (Date.now() - startTime > this.config.responseTimeout) {
            reject(new Error(`Response timeout for session ${targetSession}`));
            return;
          }

          // Continue polling
          setTimeout(checkResponse, this.config.pollingInterval);

        } catch (error) {
          reject(error);
        }
      };

      checkResponse();
    });
  }

  /**
   * Ensure session directory exists
   */
  _ensureSessionDirectory() {
    try {
      if (!existsSync(this.sessionDir)) {
        mkdirSync(this.sessionDir, { recursive: true });
      }
    } catch (error) {
      this.logger.error('Failed to create session directory', {
        directory: this.sessionDir,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get session files
   */
  _getSessionFiles() {
    try {
      return readdirSync(this.sessionDir).filter(file =>
        file.endsWith('.json') && (file.includes('_request_') || file.includes('_response_'))
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Get last activity for a session
   */
  _getLastActivity(sessionId) {
    const files = this._getSessionFiles().filter(file => file.startsWith(sessionId));
    let lastActivity = null;

    for (const file of files) {
      try {
        const filePath = join(this.sessionDir, file);
        const stats = statSync(filePath);
        if (!lastActivity || stats.mtime > lastActivity) {
          lastActivity = stats.mtime;
        }
      } catch (error) {
        // Ignore error
      }
    }

    return lastActivity ? lastActivity.toISOString() : null;
  }

  /**
   * Check if session is active (recent activity)
   */
  _isSessionActive(sessionId) {
    const lastActivity = this._getLastActivity(sessionId);
    if (!lastActivity) return sessionId === 'current';

    const activityTime = new Date(lastActivity).getTime();
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    return activityTime > fiveMinutesAgo;
  }
}