import { randomUUID } from 'crypto';
import { mapTodoForFrontend, mapTaskForFrontend } from '../utils/field-mapping.js';
import { TaskService } from './task-service.js';

/**
 * Enhanced TaskService with workflow orchestration capabilities
 * Extends the base TaskService with dependency management and agent coordination
 */
export class EnhancedTaskService extends TaskService {
  constructor(databaseManager) {
    super(databaseManager);
  }

  /**
   * Create a workflow-aware task with metadata and dependencies
   */
  async createWorkflowTask({ 
    title, 
    description, 
    todos = [],
    workflow_id,
    step_id,
    agent_type,
    priority = 0,
    estimated_duration,
    dependencies = [],
    status = 'pending'
  }) {
    const taskId = randomUUID();
    const now = new Date().toISOString();

    if (dependencies.length > 0) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const dep of dependencies) {
        if (!uuidRegex.test(dep)) {
          throw new Error(`Invalid dependency ID format: ${dep}`);
        }
      }
      
      const placeholders = dependencies.map(() => '?').join(',');
      const existingTasks = await this.dbManager.all(
        `SELECT id FROM tasks WHERE id IN (${placeholders})`,
        dependencies
      );
      
      if (existingTasks.length !== dependencies.length) {
        const existingIds = existingTasks.map(t => t.id);
        const missingIds = dependencies.filter(id => !existingIds.includes(id));
        throw new Error(`Dependency tasks not found: ${missingIds.join(', ')}`);
      }
    }

    return this.dbManager.transaction(async () => {
      try {
        const initialStatus = dependencies.length > 0 ? 'blocked' : status;

        await this.dbManager.run(`
          INSERT INTO tasks (
            id, title, description, status, workflow_id, step_id, 
            agent_type, priority, estimated_duration, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          taskId, title, description, initialStatus, workflow_id, 
          step_id, agent_type, priority, estimated_duration, now, now
        ]);

        if (todos.length > 0) {
          for (let index = 0; index < todos.length; index++) {
            const todoId = randomUUID();
            const content = typeof todos[index] === 'string' ? todos[index] : todos[index].content;
            
            if (!content || content.trim().length === 0) {
              throw new Error(`Todo item at index ${index} cannot be empty`);
            }
            
            await this.dbManager.run(`
              INSERT INTO todos (id, task_id, content, status, sort_order, created_at, updated_at)
              VALUES (?, ?, ?, 'pending', ?, ?, ?)
            `, [todoId, taskId, content.trim(), index, now, now]);
          }
        }

        if (dependencies.length > 0) {
          for (const depTaskId of dependencies) {
            const depId = randomUUID();
            await this.dbManager.run(`
              INSERT INTO task_dependencies (id, task_id, depends_on_task_id, created_at)
              VALUES (?, ?, ?, ?)
            `, [depId, taskId, depTaskId, now]);
          }
        }

        return this.getTaskWithDependencies(taskId);
      } catch (error) {
        throw new Error(`Failed to create workflow task: ${error.message}`);
      }
    });
  }

  /**
   * Get task with dependency information
   */
  async getTaskWithDependencies(taskId) {
    const task = await this.dbManager.get(`
      SELECT * FROM tasks_with_dependencies WHERE id = ?
    `, [taskId]);

    if (!task) {
      return null;
    }

    const todos = await this.dbManager.all(`
      SELECT * FROM todos WHERE task_id = ? ORDER BY sort_order
    `, [taskId]);

    // Get dependency details
    const dependencies = await this.dbManager.all(`
      SELECT t.id, t.title, t.status, t.step_id
      FROM task_dependencies td
      JOIN tasks t ON td.depends_on_task_id = t.id
      WHERE td.task_id = ?
      ORDER BY t.priority DESC
    `, [taskId]);

    const dependents = await this.dbManager.all(`
      SELECT t.id, t.title, t.status, t.step_id  
      FROM task_dependencies td
      JOIN tasks t ON td.task_id = t.id
      WHERE td.depends_on_task_id = ?
      ORDER BY t.priority DESC
    `, [taskId]);

    // Map to frontend format and add dependency info
    const mappedTask = mapTaskForFrontend(task, todos);
    return {
      ...mappedTask,
      dependencies,
      dependents,
      has_pending_dependencies: task.has_pending_dependencies === 1,
      total_dependencies: task.total_dependencies,
      completed_dependencies: task.completed_dependencies
    };
  }

  /**
   * Update task status and trigger dependency resolution
   */
  async updateTaskStatus(taskId, status, metadata = {}) {
    const now = new Date().toISOString();
    
    return this.dbManager.transaction(async () => {
      // Update task status
      const updateFields = ['status = ?', 'updated_at = ?'];
      const params = [status, now];
      
      if (metadata.assignee) {
        updateFields.push('assignee = ?');
        params.push(metadata.assignee);
      }
      
      if (metadata.assignee && status === 'in_progress') {
        updateFields.push('claimed_at = ?');
        params.push(now);
      }
      
      params.push(taskId);
      
      const result = await this.dbManager.run(`
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, params);

      if (result.changes === 0) {
        throw new Error(`Task ${taskId} not found`);
      }

      // If task is completed or failed, activate dependent tasks
      if (status === 'completed' || status === 'failed') {
        await this.activateDependentTasks(taskId);
      }

      return this.getTaskWithDependencies(taskId);
    });
  }

  /**
   * Activate tasks that were waiting for this dependency
   */
  async activateDependentTasks(completedTaskId) {
    // Find all tasks that depend on this completed task
    const dependentTasks = await this.dbManager.all(`
      SELECT DISTINCT t.id
      FROM task_dependencies td
      JOIN tasks t ON td.task_id = t.id
      WHERE td.depends_on_task_id = ? AND t.status = 'blocked'
    `, [completedTaskId]);

    const activatedTasks = [];

    for (const { id: taskId } of dependentTasks) {
      // Check if all dependencies are now satisfied
      const pendingDeps = await this.dbManager.get(`
        SELECT COUNT(*) as count
        FROM task_dependencies td
        JOIN tasks dep ON td.depends_on_task_id = dep.id
        WHERE td.task_id = ? AND dep.status NOT IN ('completed', 'failed')
      `, [taskId]);

      if (pendingDeps.count === 0) {
        // All dependencies satisfied, activate task
        await this.dbManager.run(`
          UPDATE tasks 
          SET status = 'pending', updated_at = ?
          WHERE id = ?
        `, [new Date().toISOString(), taskId]);
        
        activatedTasks.push(taskId);
      }
    }

    return activatedTasks;
  }

  /**
   * Claim a task for an agent (atomic operation to prevent race conditions)
   */
  async claimTask(taskId, agentId) {
    const now = new Date().toISOString();
    
    const result = await this.dbManager.run(`
      UPDATE tasks 
      SET status = 'in_progress', assignee = ?, claimed_at = ?, updated_at = ?
      WHERE id = ? AND status = 'pending' AND (assignee IS NULL OR assignee = '')
    `, [agentId, now, now, taskId]);

    if (result.changes === 0) {
      return null; // Task was already claimed or doesn't exist
    }

    return this.getTaskWithDependencies(taskId);
  }

  /**
   * Release a claimed task back to pending status
   */
  async releaseTask(taskId) {
    const now = new Date().toISOString();
    
    const result = await this.dbManager.run(`
      UPDATE tasks 
      SET status = 'pending', assignee = NULL, claimed_at = NULL, updated_at = ?
      WHERE id = ? AND status = 'in_progress'
    `, [now, taskId]);

    if (result.changes === 0) {
      return null;
    }

    return this.getTaskWithDependencies(taskId);
  }

  /**
   * Get available tasks for a specific agent type
   */
  async getAvailableWorkForAgent(agentType, limit = 10) {
    const tasks = await this.dbManager.all(`
      SELECT t.*, 
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM task_dependencies td 
            JOIN tasks dep ON td.depends_on_task_id = dep.id 
            WHERE td.task_id = t.id AND dep.status NOT IN ('completed', 'failed')
          ) THEN 1 
          ELSE 0 
        END as has_pending_dependencies
      FROM tasks t
      WHERE t.agent_type = ? 
        AND t.status = 'pending' 
        AND (t.assignee IS NULL OR t.assignee = '')
        AND NOT EXISTS (
          SELECT 1 FROM task_dependencies td 
          JOIN tasks dep ON td.depends_on_task_id = dep.id 
          WHERE td.task_id = t.id AND dep.status NOT IN ('completed', 'failed')
        )
      ORDER BY t.priority DESC, t.created_at ASC
      LIMIT ?
    `, [agentType, limit]);

    return tasks;
  }

  /**
   * Get workflow progress overview
   */
  async getWorkflowProgress(workflowId) {
    const stats = await this.dbManager.get(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_tasks,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_tasks
      FROM tasks
      WHERE workflow_id = ?
    `, [workflowId]);

    const tasksByAgent = await this.dbManager.all(`
      SELECT 
        agent_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active
      FROM tasks
      WHERE workflow_id = ?
      GROUP BY agent_type
      ORDER BY agent_type
    `, [workflowId]);

    return {
      ...stats,
      completion_percentage: stats.total_tasks > 0 ? 
        Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0,
      agents: tasksByAgent
    };
  }

  /**
   * List tasks with enhanced filtering for workflow management
   */
  async listWorkflowTasks(filters = {}) {
    let query = `
      SELECT t.*, 
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM task_dependencies td 
            JOIN tasks dep ON td.depends_on_task_id = dep.id 
            WHERE td.task_id = t.id AND dep.status NOT IN ('completed', 'failed')
          ) THEN 1 
          ELSE 0 
        END as has_pending_dependencies,
        (SELECT COUNT(*) FROM task_dependencies WHERE task_id = t.id) as total_dependencies
      FROM tasks t
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.workflow_id) {
      query += ' AND t.workflow_id = ?';
      params.push(filters.workflow_id);
    }

    if (filters.agent_type) {
      query += ' AND t.agent_type = ?';
      params.push(filters.agent_type);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query += ` AND t.status IN (${filters.status.map(() => '?').join(',')})`;
        params.push(...filters.status);
      } else {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }
    }

    if (filters.available_only) {
      query += ` AND t.status = 'pending' 
                 AND (t.assignee IS NULL OR t.assignee = '')
                 AND NOT EXISTS (
                   SELECT 1 FROM task_dependencies td 
                   JOIN tasks dep ON td.depends_on_task_id = dep.id 
                   WHERE td.task_id = t.id AND dep.status NOT IN ('completed', 'failed')
                 )`;
    }

    query += ' ORDER BY t.priority DESC, t.created_at ASC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const tasks = await this.dbManager.all(query, params);
    
    // Get todos for each task if requested
    if (filters.include_todos) {
      for (const task of tasks) {
        task.todos = await this.dbManager.all(`
          SELECT * FROM todos WHERE task_id = ? ORDER BY sort_order
        `, [task.id]);
      }
    }

    return tasks.map(task => ({
      ...mapTaskForFrontend(task, task.todos || []),
      has_pending_dependencies: task.has_pending_dependencies === 1,
      total_dependencies: task.total_dependencies
    }));
  }
}