import { Router } from 'express';
import { asyncHandler, validateRequired, NotFoundError } from '../../../lib/utils/error-handler.js';
import { BoardExecutorService } from '../../../board-executor/src/index.js';

/**
 * Task execution routes for Claude Code integration
 */
export function createExecutionRoutes(taskService, logger, wsManager) {
  const router = Router();

  // Initialize Board Executor Service
  const executorService = new BoardExecutorService({
    wsManager,
    taskService,
    executor: {
      workingDirectory: process.cwd()
    }
  });

  /**
   * POST /api/tasks/:id/execute
   * Start executing a task with Claude Code
   */
  router.post('/:id/execute', asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { agent_prompt, target_session } = req.body;

    // Get task details
    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }

    // Check if task is already executing
    if (task.execution_status === 'running' || task.execution_status === 'queued') {
      return res.status(400).json({
        success: false,
        error: `Task is already ${task.execution_status}`
      });
    }

    try {
      // Build execution prompt
      const prompt = agent_prompt || task.agent_prompt || `
Please help me with the following task:

**Task:** ${task.title}
**Description:** ${task.description || 'No description provided'}

${task.todos && task.todos.length > 0 ? `
**Todo Items:**
${task.todos.map(todo => `- ${todo.content}`).join('\n')}
` : ''}

Please analyze this task and provide a plan for implementation.
      `.trim();

      // Update task status to queued
      await taskService.updateTask(taskId, {
        execution_status: 'queued',
        execution_started_at: new Date().toISOString(),
        status: 'in-progress'
      });

      // Start execution with Board Executor Service
      executeTaskAsync(taskId, prompt, task, taskService, executorService, wsManager, target_session)
        .catch(error => {
          logger.error('Background execution error:', error);
          // Update task status to failed
          taskService.updateTask(taskId, {
            execution_status: 'failed',
            execution_completed_at: new Date().toISOString(),
            execution_log: `Execution failed: ${error.message}`
          }).catch(updateError => {
            logger.error('Failed to update task after execution error:', updateError);
          });
        });

      res.json({
        success: true,
        data: {
          execution_status: 'queued',
          execution_started_at: new Date().toISOString(),
          message: 'Task execution started'
        }
      });

    } catch (error) {
      // Update task status to failed
      await taskService.updateTask(taskId, {
        execution_status: 'failed',
        execution_completed_at: new Date().toISOString(),
        execution_log: `Failed to start execution: ${error.message}`,
        status: 'done'
      });

      throw error;
    }
  }));

  /**
   * GET /api/tasks/:id/status
   * Get task execution status
   */
  router.get('/:id/status', asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }

    res.json({
      success: true,
      data: {
        execution_status: task.execution_status || 'none',
        execution_log: task.execution_log || null,
        execution_started_at: task.execution_started_at || null,
        execution_completed_at: task.execution_completed_at || null
      }
    });
  }));

  /**
   * POST /api/tasks/:id/execute/follow-up
   * Continue execution with follow-up prompt
   */
  router.post('/:id/execute/follow-up', asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { prompt, target_session } = req.body;

    validateRequired({ prompt });

    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }

    // Get existing session
    const session = executorService.getSessionByTask(taskId);
    if (!session) {
      return res.status(400).json({
        success: false,
        error: 'No active session found for this task. Start a new execution first.'
      });
    }

    try {
      // Update task status
      await taskService.updateTask(taskId, {
        execution_status: 'running'
      });

      // Execute follow-up (background)
      executeFollowUpAsync(taskId, prompt, session.id, task, taskService, executorService, wsManager, target_session)
        .catch(error => {
          logger.error('Follow-up execution error:', error);
        });

      res.json({
        success: true,
        data: {
          execution_status: 'running',
          session_id: session.id,
          message: 'Follow-up execution started'
        }
      });

    } catch (error) {
      await taskService.updateTask(taskId, {
        execution_status: 'failed',
        execution_completed_at: new Date().toISOString(),
        execution_log: `Follow-up execution failed: ${error.message}`,
        status: 'done'
      });

      throw error;
    }
  }));

  /**
   * GET /api/execution/sessions
   * Get active execution sessions
   */
  router.get('/sessions', asyncHandler(async (req, res) => {
    const activeSessions = executorService.getAllSessions();
    const executorSessions = executorService.getActiveSessions();

    res.json({
      success: true,
      data: {
        sessions: activeSessions,
        executor_sessions: executorSessions,
        total: activeSessions.length
      }
    });
  }));

  /**
   * GET /api/execution/available-sessions
   * Get available Claude sessions for targeting
   */
  router.get('/available-sessions', asyncHandler(async (req, res) => {
    const availableSessions = executorService.executor.getAvailableSessions();

    res.json({
      success: true,
      data: {
        available_sessions: availableSessions,
        total: availableSessions.length,
        note: 'Sessions are discovered based on recent activity in the session bridge.'
      }
    });
  }));

  /**
   * GET /api/execution/subscription-status
   * Get subscription detection status
   */
  router.get('/subscription-status', asyncHandler(async (req, res) => {
    const report = executorService.getSubscriptionReport();

    res.json({
      success: true,
      data: report
    });
  }));

  /**
   * POST /api/execution/cleanup
   * Clean up expired sessions
   */
  router.post('/cleanup', asyncHandler(async (req, res) => {
    const { maxAge } = req.body;

    const cleanup = executorService.cleanupExpiredSessions(maxAge);

    res.json({
      success: true,
      data: {
        cleaned_sessions: cleanup.expiredSessions.length,
        expired_sessions: cleanup.expiredSessions,
        killed_processes: cleanup.killedProcesses.length
      }
    });
  }));

  return router;
}

/**
 * Execute task asynchronously in background
 */
async function executeTaskAsync(taskId, prompt, task, taskService, executorService, wsManager, targetSession) {
  try {
    // Update status to running
    await taskService.updateTask(taskId, {
      execution_status: 'running',
      status: 'in-progress'
    });

    // Execute with Claude Code
    const result = await executorService.execute({
      prompt,
      taskId,
      targetSession
    });

    // Update task with results
    await taskService.updateTask(taskId, {
      execution_status: result.completed ? 'completed' : 'failed',
      execution_completed_at: result.endTime,
      execution_log: result.output || result.error,
      claude_session_id: result.sessionId,
      status: 'done'
    });

    // Broadcast completion
    wsManager.broadcast('execution_completed', {
      taskId,
      status: result.completed ? 'completed' : 'failed',
      sessionId: result.sessionId,
      subscription: result.subscription
    });

  } catch (error) {
    // Update task status to failed
    await taskService.updateTask(taskId, {
      execution_status: 'failed',
      execution_completed_at: new Date().toISOString(),
      execution_log: `Execution error: ${error.message}`,
      status: 'done'
    });

    // Broadcast failure
    wsManager.broadcast('execution_failed', {
      taskId,
      error: error.message
    });

    throw error;
  }
}

/**
 * Execute follow-up asynchronously
 */
async function executeFollowUpAsync(taskId, prompt, sessionId, task, taskService, executorService, wsManager, targetSession) {
  try {
    const result = await executorService.executeFollowUp({
      prompt,
      taskId,
      sessionId,
      targetSession
    });

    // Update task with results
    await taskService.updateTask(taskId, {
      execution_status: result.completed ? 'completed' : 'failed',
      execution_completed_at: result.endTime,
      execution_log: (task.execution_log || '') + '\n\n--- Follow-up ---\n' + (result.output || result.error),
      status: 'done'
    });

    // Broadcast completion
    wsManager.broadcast('followup_completed', {
      taskId,
      status: result.completed ? 'completed' : 'failed',
      sessionId
    });

  } catch (error) {
    await taskService.updateTask(taskId, {
      execution_status: 'failed',
      execution_completed_at: new Date().toISOString(),
      execution_log: (task.execution_log || '') + '\n\n--- Follow-up Failed ---\n' + error.message,
      status: 'done'
    });

    wsManager.broadcast('followup_failed', {
      taskId,
      error: error.message
    });

    throw error;
  }
}