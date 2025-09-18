import { ClaudeCodeExecutor } from './claude-executor.js';
import { SessionManager } from './session-manager.js';
import { SubscriptionDetector } from './subscription-detector.js';
import { createLogger } from '../../lib/logger.js';

/**
 * Board Executor Service - Main entry point for Claude Code integration
 * Provides a unified interface for task execution with Claude Code
 */
export class BoardExecutorService {
  constructor(options = {}) {
    this.logger = createLogger('board-executor');

    // Initialize components
    this.sessionManager = new SessionManager(options.session);
    this.subscriptionDetector = new SubscriptionDetector(options.subscription);
    this.executor = new ClaudeCodeExecutor({
      sessionManager: this.sessionManager,
      ...options.executor
    });

    // WebSocket manager for real-time updates
    this.wsManager = options.wsManager;

    // Task service for database updates
    this.taskService = options.taskService;

    // Setup event forwarding
    this._setupEventForwarding();

    this.logger.info('Board Executor Service initialized', {
      hasWSManager: !!this.wsManager
    });
  }

  /**
   * Execute a task with Claude Code
   */
  async execute({ prompt, taskId, model, dangerouslySkipPermissions, targetSession }) {
    this.logger.info('Starting task execution', {
      taskId,
      targetSession: targetSession || 'current'
    });

    // Update task status to in-progress
    if (this.taskService && taskId) {
      try {
        await this.taskService.updateTask(taskId, {
          status: 'in-progress'
        });

        this.logger.info('Task status updated to in-progress', {
          taskId,
          status: 'in-progress'
        });
      } catch (error) {
        this.logger.error('Failed to update task status to in-progress', {
          taskId,
          error: error.message
        });
      }
    }

    try {
      const result = await this.executor.execute({
        prompt,
        taskId,
        model,
        dangerouslySkipPermissions,
        targetSession
      });

      // Record execution in subscription detector
      this.subscriptionDetector.recordExecution(result.completed, result.error);

      // Store session if successful
      if (result.sessionId && result.completed) {
        this.sessionManager.storeSession(result.sessionId, taskId, {
          title: `Task ${taskId}`,
          startTime: result.startTime,
          targetSession: targetSession || 'current'
        });
      }

      this.logger.info('Task execution completed', {
        taskId,
        sessionId: result.sessionId,
        completed: result.completed
      });

      return result;

    } catch (error) {
      this.subscriptionDetector.recordExecution(false, error);
      this.logger.error('Task execution failed', {
        taskId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute a follow-up in an existing session
   */
  async executeFollowUp({ prompt, taskId, sessionId }) {
    this.logger.info('Starting follow-up execution', { taskId, sessionId });

    // Validate session exists
    if (!this.sessionManager.isValidSession(sessionId)) {
      throw new Error(`Invalid or expired session: ${sessionId}`);
    }

    try {
      const result = await this.executor.executeFollowUp({
        prompt,
        taskId,
        sessionId
      });

      // Record execution
      this.subscriptionDetector.recordExecution(result.completed, result.error);

      // Update session last used time
      if (result.completed) {
        this.sessionManager.updateSession(sessionId, {
          lastFollowUp: new Date().toISOString()
        });
      }

      this.logger.info('Follow-up execution completed', {
        taskId,
        sessionId,
        completed: result.completed
      });

      return result;

    } catch (error) {
      this.subscriptionDetector.recordExecution(false, error);
      this.logger.error('Follow-up execution failed', {
        taskId,
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get session by task ID
   */
  getSessionByTask(taskId) {
    // First check executor sessions (CLI sessions)
    const executorSession = this.executor.getSessionByTask(taskId);
    if (executorSession) {
      return executorSession;
    }

    // Fall back to session manager (stored sessions)
    return this.sessionManager.getSessionByTask(taskId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    return this.sessionManager.getAllSessions();
  }

  /**
   * Get executor active sessions
   */
  getActiveSessions() {
    return this.executor.getActiveSessions();
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(maxAge) {
    const sessionCleanup = this.sessionManager.cleanup(maxAge);
    const executorCleanup = this.executor.cleanupExpiredSessions(maxAge);

    this.logger.info('Cleanup completed', {
      expiredSessions: sessionCleanup.length,
      killedProcesses: executorCleanup.length
    });

    return {
      expiredSessions: sessionCleanup,
      killedProcesses: executorCleanup
    };
  }

  /**
   * Get subscription usage report
   */
  getSubscriptionReport() {
    const detectorReport = this.subscriptionDetector.generateUsageReport();
    const executorReport = this.executor.getSubscriptionReport();

    return {
      ...detectorReport,
      cliStatus: executorReport,
      combined: {
        overallStatus: detectorReport.hasWarnings || executorReport.overallStatus === 'warnings' ? 'warnings' : 'healthy',
        totalSessions: executorReport.totalSessions + (detectorReport.activeSessions || 0),
        recentWarnings: [...(detectorReport.recentWarnings || []), ...executorReport.recentWarnings]
      }
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      executor: this.executor.getStatus(),
      sessions: this.sessionManager.getStats(),
      subscription: this.subscriptionDetector.generateUsageReport()
    };
  }

  /**
   * Setup event forwarding to WebSocket manager
   */
  _setupEventForwarding() {
    // Forward executor events to WebSocket clients
    this.executor.on('output', (data) => {
      this.logger.info('Broadcasting execution_output via WebSocket', {
        taskId: data.taskId,
        sessionId: data.sessionId,
        chunkLength: data.chunk ? data.chunk.length : 0,
        hasWSManager: !!this.wsManager
      });

      if (this.wsManager) {
        this.wsManager.broadcast('execution_output', data);
      }
    });

    this.executor.on('structured_output', (data) => {
      if (this.wsManager) {
        this.wsManager.broadcast('structured_output', data);
      }
    });

    // Forward subscription warnings from executor (CLI manager)
    this.executor.on('subscription_warning', (data) => {
      if (this.wsManager) {
        this.wsManager.broadcast('subscription_warning', data);
      }
    });

    // Forward subscription warnings from detector
    this.subscriptionDetector.on('warning', (warning) => {
      if (this.wsManager) {
        this.wsManager.broadcast('subscription_warning', warning);
      }
    });

    // Forward execution completion events
    this.executor.on('execution_completed', async (data) => {
      // Update task status in database
      if (this.taskService && data.taskId) {
        try {
          await this.taskService.updateTask(data.taskId, {
            status: 'done',
            execution_status: 'completed'
          });

          this.logger.info('Task status updated to done', {
            taskId: data.taskId,
            status: 'done'
          });
        } catch (error) {
          this.logger.error('Failed to update task status on completion', {
            taskId: data.taskId,
            error: error.message
          });
        }
      }

      // Broadcast WebSocket event
      if (this.wsManager) {
        this.wsManager.broadcast('execution_completed', data);
      }
    });

    this.executor.on('execution_failed', async (data) => {
      // Update task status in database
      if (this.taskService && data.taskId) {
        try {
          await this.taskService.updateTask(data.taskId, {
            status: 'done',
            execution_status: 'failed'
          });

          this.logger.info('Task status updated to done (failed)', {
            taskId: data.taskId,
            status: 'done'
          });
        } catch (error) {
          this.logger.error('Failed to update task status on failure', {
            taskId: data.taskId,
            error: error.message
          });
        }
      }

      // Broadcast WebSocket event
      if (this.wsManager) {
        this.wsManager.broadcast('execution_failed', data);
      }
    });

    // Log event forwarding setup
    this.logger.debug('Event forwarding setup completed', {
      wsManagerAvailable: !!this.wsManager
    });
  }

  /**
   * Shutdown the service gracefully
   */
  async shutdown() {
    this.logger.info('Shutting down Board Executor Service');

    // Kill all active processes
    const activeSessions = this.executor.getActiveSessions();
    for (const session of activeSessions) {
      await this.executor.killSession(session.sessionId);
    }

    this.logger.info('Board Executor Service shutdown complete');
  }
}

// Export individual components for direct use if needed
export { ClaudeCodeExecutor, SessionManager, SubscriptionDetector };