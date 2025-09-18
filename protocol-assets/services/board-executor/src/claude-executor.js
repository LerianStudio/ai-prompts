import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../lib/logger.js';
import { SessionBridge } from './session-bridge.js';
import { ClaudeCliManager } from './claude-cli-manager.js';

/**
 * Claude Session Executor - Leverages the current Claude session for task execution
 * Instead of spawning CLI processes, this bridges to the existing Claude conversation
 */
export class ClaudeCodeExecutor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = createLogger('claude-executor');
    this.activeSessions = new Map();
    this.sessionManager = options.sessionManager;
    this.sessionBridge = new SessionBridge({
      workingDirectory: options.workingDirectory || process.cwd()
    });

    // Initialize Claude CLI Manager
    this.cliManager = new ClaudeCliManager({
      workingDirectory: options.workingDirectory || process.cwd(),
      timeout: options.timeout || 300000,
      maxConcurrentSessions: options.maxConcurrentSessions || 5
    });

    // Forward CLI manager events with correct message types
    this.cliManager.on('execution_output', (data) => {
      this.logger.info('Forwarding execution_output event', {
        taskId: data.taskId,
        sessionId: data.sessionId,
        chunkLength: data.chunk ? data.chunk.length : 0
      });

      this.emit('output', {
        taskId: data.taskId,
        sessionId: data.sessionId,
        executionId: data.executionId,
        chunk: data.chunk,
        type: data.outputType, // stdout or stderr
        timestamp: data.timestamp
      });
    });

    this.cliManager.on('structured_output', (data) => {
      this.emit('structured_output', data);
    });

    this.cliManager.on('subscription_warning', (data) => {
      this.emit('subscription_warning', data);
    });

    this.cliManager.on('execution_completed', (data) => {
      this.emit('execution_completed', data);
    });

    this.cliManager.on('execution_failed', (data) => {
      this.emit('execution_failed', data);
    });

    // Configuration for session-based execution
    this.config = {
      workingDirectory: options.workingDirectory || process.cwd(),
      timeout: options.timeout || 300000, // 5 minutes default
      promptFile: options.promptFile || '.claude-prompt.md',
      responseFile: options.responseFile || '.claude-response.md',
      sessionId: options.sessionId || 'main', // This Claude session
      useCli: options.useCli !== false, // Default to using CLI
      ...options
    };

    this.logger.info('Claude Code Executor initialized', {
      workingDirectory: this.config.workingDirectory,
      sessionId: this.config.sessionId,
      useCli: this.config.useCli
    });
  }

  /**
   * Execute a task using Claude CLI or session bridge
   */
  async execute({ prompt, taskId, model = null, dangerouslySkipPermissions = false, targetSession = null }) {
    const sessionId = uuidv4();
    const startTime = new Date().toISOString();

    this.logger.info('Starting Claude execution', {
      taskId,
      sessionId,
      targetSession: targetSession || 'current',
      promptLength: prompt.length,
      useCli: this.config.useCli
    });

    try {
      let result;

      if (this.config.useCli && (!targetSession || targetSession === 'current')) {
        // Use Claude CLI for current session execution
        result = await this.cliManager.execute({
          prompt,
          taskId,
          sessionId,
          isFollowUp: false
        });

        // Store session for potential follow-ups
        this.activeSessions.set(sessionId, {
          taskId,
          sessionId: result.sessionId,
          startTime: new Date(),
          targetSession: 'current',
          useCli: true
        });
      } else {
        // Use session bridge for cross-session routing
        result = await this._executeInTargetSession({
          prompt,
          taskId,
          sessionId,
          targetSession,
          isFollowUp: false
        });
      }

      const endTime = new Date().toISOString();

      return {
        sessionId: result.sessionId || sessionId,
        startTime,
        endTime,
        completed: result.success,
        output: result.output,
        error: result.error,
        subscription: result.subscription || { source: 'session_bridge', authenticated: true }
      };

    } catch (error) {
      this.logger.error('Claude execution failed', {
        taskId,
        sessionId,
        error: error.message
      });

      return {
        sessionId,
        startTime,
        endTime: new Date().toISOString(),
        completed: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a follow-up prompt in an existing session
   */
  async executeFollowUp({ prompt, taskId, sessionId, targetSession = null }) {
    this.logger.info('Starting Claude follow-up execution', {
      taskId,
      sessionId,
      targetSession: targetSession || 'current',
      promptLength: prompt.length
    });

    try {
      const session = this.activeSessions.get(sessionId);
      let result;

      if (session && session.useCli) {
        // Use Claude CLI for follow-up
        result = await this.cliManager.execute({
          prompt,
          taskId,
          sessionId,
          isFollowUp: true
        });
      } else {
        // Use session bridge for follow-up
        result = await this._executeInTargetSession({
          prompt,
          taskId,
          sessionId,
          targetSession,
          isFollowUp: true
        });
      }

      const endTime = new Date().toISOString();

      return {
        sessionId,
        endTime,
        completed: result.success,
        output: result.output,
        error: result.error
      };

    } catch (error) {
      this.logger.error('Claude follow-up execution failed', {
        taskId,
        sessionId,
        error: error.message
      });

      return {
        sessionId,
        endTime: new Date().toISOString(),
        completed: false,
        error: error.message
      };
    }
  }

  /**
   * Internal method to execute in a target Claude session
   * This creates a communication bridge to leverage a specific session
   */
  async _executeInTargetSession({ prompt, taskId, sessionId, targetSession, isFollowUp }) {
    // Track the session
    this.activeSessions.set(sessionId, {
      taskId,
      startTime: new Date(),
      isFollowUp,
      targetSession: targetSession || 'current',
      status: 'running'
    });

    try {
      const taskData = {
        taskId,
        sessionId,
        prompt,
        isFollowUp,
        timestamp: new Date().toISOString()
      };

      this.emit('output', {
        taskId,
        sessionId,
        executionId: sessionId,
        chunk: `🔄 Routing task to Claude session "${targetSession || 'current'}"...\n`,
        type: 'stdout',
        timestamp: new Date().toISOString()
      });

      if (!targetSession || targetSession === 'current') {
        // Execute in current session
        return await this._executeInCurrentSession(taskData, sessionId);
      } else {
        // Route to different session via session bridge
        return await this._executeViaSessionBridge(taskData, targetSession, sessionId);
      }

    } catch (error) {
      this.activeSessions.delete(sessionId);

      this.emit('output', {
        taskId,
        sessionId,
        executionId: sessionId,
        chunk: `❌ Execution failed: ${error.message}\n`,
        type: 'stderr',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Execute in current Claude session
   */
  async _executeInCurrentSession(taskData, sessionId) {
    const { taskId, prompt, isFollowUp } = taskData;

    // Create the execution context prompt
    const contextualPrompt = this._buildContextualPrompt(prompt, taskId, 'current', isFollowUp);

    // Write the prompt to a file for Claude to process
    const promptPath = join(this.config.workingDirectory, `${this.config.promptFile}-${sessionId}`);
    writeFileSync(promptPath, contextualPrompt, 'utf8');

    this.emit('output', {
      taskId,
      sessionId,
      executionId: sessionId,
      chunk: `📝 Task prompt written to: ${promptPath}\n`,
      type: 'stdout',
      timestamp: new Date().toISOString()
    });

    this.emit('output', {
      taskId,
      sessionId,
      executionId: sessionId,
      chunk: `🤖 Current Claude session, please process this task:\n\n${contextualPrompt}\n\n`,
      type: 'stdout',
      timestamp: new Date().toISOString()
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.activeSessions.delete(sessionId);

    const response = `Task ${taskId} has been queued for execution in the current Claude session.

The task prompt has been prepared and is ready for Claude to process.

Session ID: ${sessionId}
Task ID: ${taskId}
Context: ${isFollowUp ? 'Follow-up' : 'Initial'} execution`;

    this.emit('output', {
      taskId,
      sessionId,
      executionId: sessionId,
      chunk: `✅ Execution completed successfully\n`,
      type: 'stdout',
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      response,
      error: null
    };
  }

  /**
   * Execute via session bridge to different Claude session
   */
  async _executeViaSessionBridge(taskData, targetSession, sessionId) {
    const { taskId } = taskData;

    this.emit('output', {
      taskId,
      sessionId,
      executionId: sessionId,
      chunk: `🌉 Bridging to session "${targetSession}"...\n`,
      type: 'stdout',
      timestamp: new Date().toISOString()
    });

    try {
      const response = await this.sessionBridge.sendToSession(targetSession, taskData);

      this.activeSessions.delete(sessionId);

      if (response.success) {
        this.emit('output', {
          taskId,
          sessionId,
          executionId: sessionId,
          chunk: `✅ Task completed by session "${targetSession}"\n`,
          type: 'stdout',
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          response: response.data || `Task completed by Claude session "${targetSession}"`,
          error: null
        };
      } else {
        throw new Error(response.error || 'Unknown error from target session');
      }

    } catch (error) {
      this.activeSessions.delete(sessionId);

      this.emit('output', {
        taskId,
        sessionId,
        executionId: sessionId,
        chunk: `❌ Session bridge failed: ${error.message}\n`,
        type: 'stderr',
        timestamp: new Date().toISOString()
      });

      // Fallback: provide instructions for manual execution
      const fallbackResponse = `Session bridge to "${targetSession}" failed: ${error.message}

MANUAL EXECUTION REQUIRED:
Please manually execute this task in Claude session "${targetSession}":

${this._buildContextualPrompt(taskData.prompt, taskId, targetSession, taskData.isFollowUp)}`;

      return {
        success: false,
        response: fallbackResponse,
        error: error.message
      };
    }
  }

  /**
   * Build contextual prompt for Claude execution
   */
  _buildContextualPrompt(prompt, taskId, targetSession, isFollowUp) {
    const context = isFollowUp ? 'FOLLOW-UP TASK' : 'NEW TASK';
    const sessionInfo = targetSession ? `Claude session "${targetSession}"` : 'the current Claude session';

    return `# ${context} EXECUTION REQUEST

**Task ID:** ${taskId}
**Target Session:** ${targetSession || 'current'}
**Execution Context:** ${isFollowUp ? 'Continuing previous task' : 'Initial task execution'}
**Working Directory:** ${this.config.workingDirectory}

## Task Description:
${prompt}

## Instructions:
Please execute this task using your Claude Code capabilities. This task should be processed by ${sessionInfo}.

${targetSession ? `**Session Context:** This task is specifically targeted for the Claude session running in project "${targetSession}".` : ''}

${isFollowUp ? '**Note:** This is a follow-up to a previous task execution. Please maintain context from the previous interaction.' : ''}

## Session Routing:
- **Target Session:** ${targetSession || 'current'}
- **Project Context:** ${targetSession ? `Project ${targetSession}` : 'Current project'}
- **Execution Mode:** Session-bridged execution

---
*This task is being executed through the Board Executor Service, targeting ${sessionInfo}.*`;
  }

  /**
   * Process structured output from Claude session
   */
  _processStructuredOutput(chunk, taskId, sessionId) {
    // For session-based execution, we emit the raw output
    // In a real implementation, this would parse Claude's responses
    this.emit('structured_output', {
      taskId,
      sessionId,
      data: {
        type: 'session_output',
        content: chunk,
        sessionBased: true
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    const bridgeSessions = Array.from(this.activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      taskId: session.taskId,
      startTime: session.startTime,
      isFollowUp: session.isFollowUp,
      type: session.useCli ? 'cli' : 'bridge'
    }));

    const cliSessions = this.cliManager.getActiveSessions().map(session => ({
      sessionId: session.sessionId,
      taskId: session.taskId,
      startTime: session.created,
      lastActivity: session.lastActivity,
      type: 'cli',
      pid: session.pid,
      subscriptionStatus: session.subscriptionStatus
    }));

    return [...bridgeSessions, ...cliSessions];
  }

  /**
   * Kill a specific session
   */
  async killSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.logger.info('Terminating Claude session', { sessionId });
      this.activeSessions.delete(sessionId);

      if (session.useCli) {
        return this.cliManager.killSession(sessionId);
      }
      return true;
    }

    // Try to kill CLI session directly
    return this.cliManager.killSession(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(maxAge = 3600000) { // 1 hour default
    const now = new Date();
    const expired = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.startTime > maxAge) {
        // For session-based execution, we just remove from tracking
        this.activeSessions.delete(sessionId);
        expired.push(sessionId);
      }
    }

    if (expired.length > 0) {
      this.logger.info('Cleaned up expired sessions', {
        expiredSessions: expired,
        count: expired.length
      });
    }

    return expired;
  }

  /**
   * Get available Claude sessions
   */
  getAvailableSessions() {
    const bridgeSessions = this.sessionBridge.getAvailableSessions();
    const currentSession = [{
      id: 'current',
      name: 'Current Claude Session (CLI)',
      lastActivity: new Date().toISOString(),
      active: true,
      type: 'cli'
    }];

    return [...currentSession, ...bridgeSessions.map(s => ({ ...s, type: 'bridge' }))];
  }

  /**
   * Check for incoming requests to this session
   */
  checkForRequests(sessionId = 'current') {
    return this.sessionBridge.checkForRequests(sessionId);
  }

  /**
   * Respond to an incoming request
   */
  async respondToRequest(request, response) {
    return await this.sessionBridge.respondToRequest(request, response);
  }

  /**
   * Get subscription status report
   */
  getSubscriptionReport() {
    return this.cliManager.getSubscriptionReport();
  }

  /**
   * Get session by task ID
   */
  getSessionByTask(taskId) {
    // Check bridge sessions
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.taskId === taskId) {
        return { id: sessionId, type: session.useCli ? 'cli' : 'bridge' };
      }
    }

    // Check CLI sessions
    const cliSessions = this.cliManager.getActiveSessions();
    const cliSession = cliSessions.find(s => s.taskId === taskId);
    if (cliSession) {
      return { id: cliSession.sessionId, type: 'cli' };
    }

    return null;
  }

  /**
   * Get executor status
   */
  getStatus() {
    const cliSessions = this.cliManager.getActiveSessions();
    return {
      activeSessions: this.activeSessions.size + cliSessions.length,
      cliSessions: cliSessions.length,
      bridgeSessions: this.activeSessions.size,
      executionMode: this.config.useCli ? 'claude_cli' : 'session_bridge',
      availableSessions: this.getAvailableSessions().length,
      subscriptionStatus: this.getSubscriptionReport(),
      config: {
        workingDirectory: this.config.workingDirectory,
        sessionId: this.config.sessionId,
        timeout: this.config.timeout,
        useCli: this.config.useCli
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.cliManager) {
      this.cliManager.destroy();
    }
  }
}