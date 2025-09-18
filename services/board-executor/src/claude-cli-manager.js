import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../../lib/logger.js';

/**
 * Claude CLI Process Manager - Manages actual Claude CLI processes
 * Handles process lifecycle, streaming communication, and session management
 */
export class ClaudeCliManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = createLogger('claude-cli-manager');
    this.activeSessions = new Map();
    this.config = {
      workingDirectory: options.workingDirectory || process.cwd(),
      timeout: options.timeout || 300000, // 5 minutes default
      claudeCommand: options.claudeCommand || '/home/gc4str0/.claude/local/claude',
      maxConcurrentSessions: options.maxConcurrentSessions || 5,
      sessionIdleTimeout: options.sessionIdleTimeout || 600000, // 10 minutes
      ...options
    };

    this.logger.info('Claude CLI Manager initialized', {
      workingDirectory: this.config.workingDirectory,
      maxConcurrentSessions: this.config.maxConcurrentSessions
    });

    // Cleanup idle sessions periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleSessions();
    }, 60000); // Check every minute
  }

  /**
   * Execute a task using Claude CLI
   */
  async execute({ prompt, taskId, sessionId = null, isFollowUp = false }) {
    const executionId = sessionId || uuidv4();

    this.logger.info('Starting Claude CLI execution', {
      taskId,
      executionId,
      isFollowUp,
      promptLength: prompt.length
    });

    try {
      let session;

      if (isFollowUp && sessionId) {
        // Use existing session
        session = this.activeSessions.get(sessionId);
        if (!session) {
          throw new Error(`Session ${sessionId} not found or expired`);
        }
        this.logger.info('Using existing session for follow-up', { sessionId });
      } else {
        // Create new session
        session = await this.createSession(executionId, taskId);
      }

      // Send prompt to Claude
      const result = await this.sendPrompt(session, prompt, taskId);

      // Update session last activity
      session.lastActivity = new Date();

      return {
        sessionId: executionId,
        success: result.success,
        output: result.output,
        error: result.error,
        subscription: result.subscription
      };

    } catch (error) {
      this.logger.error('Claude CLI execution failed', {
        taskId,
        executionId,
        error: error.message
      });

      // Clean up failed session
      if (sessionId) {
        this.killSession(sessionId);
      }

      throw error;
    }
  }

  /**
   * Create a new Claude CLI session
   */
  async createSession(sessionId, taskId) {
    if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
      throw new Error('Maximum concurrent sessions reached');
    }

    this.logger.info('Creating new Claude CLI session', { sessionId, taskId });

    const claudeProcess = spawn(this.config.claudeCommand, [
      '--print',
      '--dangerously-skip-permissions'
    ], {
      cwd: this.config.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const session = {
      id: sessionId,
      taskId,
      process: claudeProcess,
      created: new Date(),
      lastActivity: new Date(),
      buffer: '',
      fullOutput: '',
      pendingResponse: null,
      subscriptionStatus: {
        authenticated: false,
        hasWarnings: false,
        lastWarning: null
      }
    };

    // Set up process event handlers
    this.setupProcessHandlers(session);

    // Store session
    this.activeSessions.set(sessionId, session);

    this.logger.info('Claude CLI session created successfully', {
      sessionId,
      pid: claudeProcess.pid
    });

    return session;
  }

  /**
   * Set up event handlers for Claude process
   */
  setupProcessHandlers(session) {
    const { process: claudeProcess, id: sessionId } = session;

    claudeProcess.stdout.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      this.logger.debug('Claude CLI stdout chunk received', {
        sessionId,
        chunkLength: chunkStr.length,
        chunk: chunkStr.substring(0, 200) + (chunkStr.length > 200 ? '...' : ''),
        bufferLengthBefore: session.buffer.length
      });

      session.buffer += chunkStr;
      this.processOutput(session);

      this.logger.debug('After processing stdout chunk', {
        sessionId,
        bufferLengthAfter: session.buffer.length,
        fullOutputLength: session.fullOutput ? session.fullOutput.length : 0
      });
    });

    claudeProcess.stderr.on('data', (chunk) => {
      const errorOutput = chunk.toString();
      this.logger.warn('Claude CLI stderr', { sessionId, error: errorOutput });

      this.emit('execution_output', {
        taskId: session.taskId,
        sessionId,
        executionId: sessionId,
        chunk: errorOutput,
        outputType: 'stderr',
        timestamp: new Date().toISOString()
      });
    });

    claudeProcess.on('exit', (code, signal) => {
      this.logger.info('Claude CLI process exited', {
        sessionId,
        code,
        signal
      });

      const fullOutput = session.fullOutput || session.buffer || 'Execution completed successfully';

      this.logger.debug('Process exit handler details', {
        sessionId,
        exitCode: code,
        bufferLength: session.buffer ? session.buffer.length : 0,
        fullOutputLength: session.fullOutput ? session.fullOutput.length : 0,
        finalOutputLength: fullOutput.length,
        bufferContent: session.buffer ? session.buffer.substring(0, 100) + '...' : 'empty',
        fullOutputContent: session.fullOutput ? session.fullOutput.substring(0, 100) + '...' : 'empty'
      });

      if (code === 0) {
        // Success: emit the complete output to the UI
        this.logger.info('Emitting execution_output event', {
          sessionId,
          taskId: session.taskId,
          outputLength: fullOutput.length
        });

        this.emit('execution_output', {
          taskId: session.taskId,
          sessionId: session.id,
          executionId: session.id,
          chunk: fullOutput,
          outputType: 'stdout',
          timestamp: new Date().toISOString()
        });

        // Emit completion event
        this.logger.info('Emitting execution_completed event', {
          sessionId,
          taskId: session.taskId
        });

        this.emit('execution_completed', {
          taskId: session.taskId,
          sessionId: session.id,
          executionId: session.id,
          timestamp: new Date().toISOString()
        });
      } else {
        // Error: emit error output
        this.emit('execution_output', {
          taskId: session.taskId,
          sessionId: session.id,
          executionId: session.id,
          chunk: `Error: Claude process exited with code ${code}\n${fullOutput}`,
          outputType: 'stderr',
          timestamp: new Date().toISOString()
        });

        // Emit failure event
        this.emit('execution_failed', {
          taskId: session.taskId,
          sessionId: session.id,
          executionId: session.id,
          timestamp: new Date().toISOString()
        });
      }

      if (session.pendingResponse) {
        if (code === 0) {
          session.pendingResponse.resolve({
            success: true,
            output: fullOutput,
            subscription: session.subscriptionStatus
          });
        } else {
          session.pendingResponse.reject(
            new Error(`Claude process exited with code ${code}`)
          );
        }
        session.pendingResponse = null;
      }

      // Clean up session
      this.activeSessions.delete(sessionId);

      this.emit('session_ended', { sessionId, code, signal });
    });

    claudeProcess.on('error', (error) => {
      this.logger.error('Claude CLI process error', {
        sessionId,
        error: error.message
      });

      this.activeSessions.delete(sessionId);

      if (session.pendingResponse) {
        session.pendingResponse.reject(error);
      }
    });
  }

  /**
   * Process output from Claude CLI
   */
  processOutput(session) {
    // Accumulate all output for batch processing when complete
    session.fullOutput = (session.fullOutput || '') + session.buffer;

    // Clear the buffer after accumulating to avoid duplicate data
    session.buffer = '';

    // For --print mode, we'll emit output when the process completes
    // This avoids partial output chunks and ensures we get the complete response
  }

  /**
   * Handle structured message from Claude CLI
   */
  handleClaudeMessage(session, message) {
    const { taskId, id: sessionId } = session;

    switch (message.type) {
      case 'message':
        // Claude's response message
        if (message.content) {
          this.emit('execution_output', {
            taskId,
            sessionId,
            executionId: sessionId,
            chunk: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
            outputType: 'stdout',
            timestamp: new Date().toISOString()
          });
        }

        // Check if this completes a pending response
        if (session.pendingResponse) {
          session.pendingResponse.resolve({
            success: true,
            output: message.content,
            subscription: session.subscriptionStatus
          });
          session.pendingResponse = null;
        }
        break;

      case 'tool_call':
        // Claude is using a tool
        this.emit('structured_output', {
          taskId,
          sessionId,
          executionId: sessionId,
          data: {
            type: 'tool_call',
            tool: message.tool,
            parameters: message.parameters
          },
          timestamp: new Date().toISOString()
        });
        break;

      case 'tool_result':
        // Tool execution result
        this.emit('execution_output', {
          taskId,
          sessionId,
          executionId: sessionId,
          chunk: `Tool ${message.tool}: ${message.result}\n`,
          outputType: 'stdout',
          timestamp: new Date().toISOString()
        });
        break;

      case 'error':
        // Claude error
        this.logger.error('Claude CLI error message', {
          sessionId,
          error: message.error
        });

        // Check for subscription-related errors
        this.detectSubscriptionIssues(session, message.error);

        this.emit('execution_output', {
          taskId,
          sessionId,
          executionId: sessionId,
          chunk: `Error: ${message.error}\n`,
          outputType: 'stderr',
          timestamp: new Date().toISOString()
        });

        if (session.pendingResponse) {
          session.pendingResponse.resolve({
            success: false,
            error: message.error,
            subscription: session.subscriptionStatus
          });
          session.pendingResponse = null;
        }
        break;

      case 'status':
        // Status update from Claude
        this.logger.debug('Claude CLI status', { sessionId, status: message.status });

        if (message.status === 'ready') {
          session.subscriptionStatus.authenticated = true;
        }
        break;

      default:
        this.logger.debug('Unknown Claude CLI message type', {
          sessionId,
          type: message.type,
          message
        });
    }
  }

  /**
   * Detect subscription-related issues from error messages
   */
  detectSubscriptionIssues(session, errorMessage) {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('rate limit') || lowerError.includes('quota exceeded')) {
      session.subscriptionStatus.hasWarnings = true;
      session.subscriptionStatus.lastWarning = {
        type: 'rate_limit',
        title: 'Rate Limit Exceeded',
        message: 'You have reached your usage limit. Please wait or upgrade your plan.',
        recommendations: [
          'Wait for your usage to reset',
          'Consider upgrading to Claude Pro',
          'Optimize your prompts to be more efficient'
        ],
        timestamp: new Date().toISOString()
      };

      this.emit('subscription_warning', {
        taskId: session.taskId,
        sessionId: session.id,
        warning: session.subscriptionStatus.lastWarning
      });
    } else if (lowerError.includes('authentication') || lowerError.includes('unauthorized')) {
      session.subscriptionStatus.authenticated = false;
      session.subscriptionStatus.hasWarnings = true;
      session.subscriptionStatus.lastWarning = {
        type: 'authentication',
        title: 'Authentication Required',
        message: 'Please log in to Claude CLI to continue.',
        recommendations: [
          'Run "claude auth login" in your terminal',
          'Check your API key configuration',
          'Verify your Claude account is active'
        ],
        timestamp: new Date().toISOString()
      };

      this.emit('subscription_warning', {
        taskId: session.taskId,
        sessionId: session.id,
        warning: session.subscriptionStatus.lastWarning
      });
    }
  }

  /**
   * Send a prompt to Claude CLI session
   */
  async sendPrompt(session, prompt, taskId) {
    return new Promise((resolve, reject) => {
      session.pendingResponse = { resolve, reject };

      try {
        // Send the prompt and close stdin to signal end of input
        session.process.stdin.write(prompt);
        session.process.stdin.end();

        this.logger.debug('Sent prompt to Claude CLI and closed stdin', {
          sessionId: session.id,
          taskId,
          promptLength: prompt.length
        });

        // Set timeout for response
        setTimeout(() => {
          if (session.pendingResponse) {
            session.pendingResponse.reject(new Error('Claude CLI response timeout'));
            session.pendingResponse = null;
          }
        }, this.config.timeout);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Kill a specific session
   */
  killSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.logger.info('Killing Claude CLI session', { sessionId });

      try {
        session.process.kill('SIGTERM');
      } catch (error) {
        this.logger.warn('Failed to kill Claude process gracefully', {
          sessionId,
          error: error.message
        });

        try {
          session.process.kill('SIGKILL');
        } catch (killError) {
          this.logger.error('Failed to force kill Claude process', {
            sessionId,
            error: killError.message
          });
        }
      }

      this.activeSessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Clean up idle sessions
   */
  cleanupIdleSessions() {
    const now = new Date();
    const expiredSessions = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > this.config.sessionIdleTimeout) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.logger.info('Cleaning up idle session', { sessionId });
      this.killSession(sessionId);
    }

    return expiredSessions;
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      taskId: session.taskId,
      created: session.created,
      lastActivity: session.lastActivity,
      pid: session.process.pid,
      subscriptionStatus: session.subscriptionStatus
    }));
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get subscription status for all sessions
   */
  getSubscriptionReport() {
    const sessions = this.getActiveSessions();
    const warnings = sessions
      .filter(s => s.subscriptionStatus.hasWarnings)
      .map(s => s.subscriptionStatus.lastWarning);

    return {
      totalSessions: sessions.length,
      authenticatedSessions: sessions.filter(s => s.subscriptionStatus.authenticated).length,
      sessionsWithWarnings: sessions.filter(s => s.subscriptionStatus.hasWarnings).length,
      recentWarnings: warnings.slice(-5), // Last 5 warnings
      overallStatus: warnings.length === 0 ? 'healthy' : 'warnings'
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Kill all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      this.killSession(sessionId);
    }

    this.logger.info('Claude CLI Manager destroyed');
  }
}