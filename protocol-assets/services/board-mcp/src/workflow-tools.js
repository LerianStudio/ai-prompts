import fetch from 'node-fetch';
import { TaskManagerTool } from './board-tool.js';
import { NetworkError, ValidationError, NotFoundError, convertToJsonRpcError } from './utils/jsonrpc-errors.js';

/**
 * Extended MCP tools for workflow orchestration and agent coordination
 * Provides kanban-style workflow management with dependency tracking
 */
export class WorkflowManagerTool extends TaskManagerTool {
  constructor(baseUrl = 'http://localhost:3020') {
    super(baseUrl);
  }

  /**
   * Initialize a complete workflow from YAML definition
   * Creates all tasks upfront with proper dependencies
   */
  async initializeWorkflow(workflowDefinition) {
    this.checkRateLimit();

    try {
      if (typeof workflowDefinition === 'string') {
        // Validate YAML structure
        if (!workflowDefinition.trim().startsWith('workflow:')) {
          throw new ValidationError('workflowDefinition', 'Workflow definition must start with "workflow:"', workflowDefinition);
        }
      } else {
        throw new ValidationError('workflowDefinition', 'Expected string workflow definition', typeof workflowDefinition);
      }

      const response = await fetch(`${this.baseUrl}/api/workflows/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow: workflowDefinition
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('workflow endpoint', '/api/workflows/initialize');
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const result = await response.json();
      
      return {
        success: true,
        workflow_id: result.workflow_id,
        workflow_name: result.workflow_name,
        total_tasks: result.total_tasks,
        tasks: result.tasks,
        message: result.message || `Initialized workflow with ${result.total_tasks} tasks`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Get available work for a specific agent type
   * Returns tasks that are ready to be claimed and worked on
   */
  async getAgentWork(agentType, limit = 5) {
    this.checkRateLimit();

    try {
      if (!agentType || typeof agentType !== 'string') {
        throw new ValidationError('agentType', 'Agent type must be a non-empty string', agentType);
      }

      const sanitizedAgentType = this.sanitizeString(agentType, 100);
      const sanitizedLimit = Math.max(1, Math.min(20, parseInt(limit) || 5));

      const response = await fetch(`${this.baseUrl}/api/agents/${encodeURIComponent(sanitizedAgentType)}/work?limit=${sanitizedLimit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('agent work endpoint', `/api/agents/${sanitizedAgentType}/work`);
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const tasks = await response.json();

      return {
        success: true,
        agent_type: sanitizedAgentType,
        available_tasks: tasks.length,
        tasks: tasks,
        message: `Found ${tasks.length} available tasks for ${sanitizedAgentType}`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Claim a task for an agent (atomic operation to prevent race conditions)
   */
  async claimTask(taskId, agentId) {
    this.checkRateLimit();

    try {
      if (!taskId || typeof taskId !== 'string') {
        throw new ValidationError('taskId', 'Task ID must be a non-empty string', taskId);
      }
      if (!agentId || typeof agentId !== 'string') {
        throw new ValidationError('agentId', 'Agent ID must be a non-empty string', agentId);
      }

      const sanitizedTaskId = this.sanitizeString(taskId, 36);
      const sanitizedAgentId = this.sanitizeString(agentId, 100);

      const response = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(sanitizedTaskId)}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: sanitizedAgentId
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('task', sanitizedTaskId);
        }
        if (response.status === 409) {
          return {
            success: false,
            error: 'Task already claimed',
            message: 'This task is already being worked on by another agent'
          };
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const task = await response.json();

      return {
        success: true,
        task_id: sanitizedTaskId,
        agent_id: sanitizedAgentId,
        task: task,
        message: `Successfully claimed task for ${sanitizedAgentId}`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Release a claimed task back to available status
   */
  async releaseTask(taskId) {
    this.checkRateLimit();

    try {
      if (!taskId || typeof taskId !== 'string') {
        throw new ValidationError('taskId', 'Task ID must be a non-empty string', taskId);
      }

      const sanitizedTaskId = this.sanitizeString(taskId, 36);

      const response = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(sanitizedTaskId)}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('task', sanitizedTaskId);
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const task = await response.json();

      return {
        success: true,
        task_id: sanitizedTaskId,
        task: task,
        message: `Task ${sanitizedTaskId} released and available for other agents`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Get workflow status and progress overview
   */
  async getWorkflowStatus(workflowId) {
    this.checkRateLimit();

    try {
      if (!workflowId || typeof workflowId !== 'string') {
        throw new ValidationError('workflowId', 'Workflow ID must be a non-empty string', workflowId);
      }

      const sanitizedWorkflowId = this.sanitizeString(workflowId, 36);

      const response = await fetch(`${this.baseUrl}/api/workflows/${encodeURIComponent(sanitizedWorkflowId)}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('workflow', sanitizedWorkflowId);
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const status = await response.json();

      return {
        success: true,
        workflow_id: sanitizedWorkflowId,
        ...status,
        message: `Workflow is ${status.completion_percentage}% complete (${status.completed_tasks}/${status.total_tasks} tasks)`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * List workflow tasks with enhanced filtering
   */
  async listWorkflowTasks(filters = {}) {
    this.checkRateLimit();

    try {
      const queryParams = new URLSearchParams();

      if (filters.workflow_id) {
        queryParams.append('workflow_id', this.sanitizeString(filters.workflow_id, 36));
      }
      if (filters.agent_type) {
        queryParams.append('agent_type', this.sanitizeString(filters.agent_type, 100));
      }
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(status => {
            if (['pending', 'in_progress', 'completed', 'failed', 'blocked', 'waiting'].includes(status)) {
              queryParams.append('status', status);
            }
          });
        } else if (typeof filters.status === 'string') {
          if (['pending', 'in_progress', 'completed', 'failed', 'blocked', 'waiting'].includes(filters.status)) {
            queryParams.append('status', filters.status);
          }
        }
      }
      if (filters.available_only) {
        queryParams.append('available_only', 'true');
      }
      if (filters.include_todos) {
        queryParams.append('include_todos', 'true');
      }
      if (filters.limit) {
        queryParams.append('limit', Math.max(1, Math.min(100, parseInt(filters.limit) || 10)));
      }

      const response = await fetch(`${this.baseUrl}/api/workflows/tasks?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const tasks = await response.json();

      return {
        success: true,
        count: tasks.length,
        filters: filters,
        tasks: tasks,
        message: `Found ${tasks.length} tasks matching filters`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Complete a workflow task and activate dependent tasks
   */
  async completeWorkflowTask(taskId) {
    this.checkRateLimit();

    try {
      if (!taskId || typeof taskId !== 'string') {
        throw new ValidationError('taskId', 'Task ID must be a non-empty string', taskId);
      }

      const sanitizedTaskId = this.sanitizeString(taskId, 36);

      const response = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(sanitizedTaskId)}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('task', sanitizedTaskId);
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const result = await response.json();

      return {
        success: true,
        task_id: sanitizedTaskId,
        task: result.task,
        activated_tasks: result.activated_dependent_tasks || [],
        message: `Task completed. ${result.activated_dependent_tasks?.length || 0} dependent tasks activated.`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Get task with full dependency information
   */
  async getTaskWithDependencies(taskId) {
    this.checkRateLimit();

    try {
      if (!taskId || typeof taskId !== 'string') {
        throw new ValidationError('taskId', 'Task ID must be a non-empty string', taskId);
      }

      const sanitizedTaskId = this.sanitizeString(taskId, 36);

      const response = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(sanitizedTaskId)}/dependencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError('task', sanitizedTaskId);
        }
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const task = await response.json();

      return {
        success: true,
        task_id: sanitizedTaskId,
        task: task,
        message: `Task has ${task.total_dependencies || 0} total dependencies, ${task.dependencies?.length || 0} blocking`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }

  /**
   * Validate workflow definition before initialization
   */
  async validateWorkflow(workflowDefinition) {
    this.checkRateLimit();

    try {
      if (typeof workflowDefinition !== 'string') {
        throw new ValidationError('workflowDefinition', 'Expected string workflow definition', typeof workflowDefinition);
      }

      const response = await fetch(`${this.baseUrl}/api/workflows/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow: workflowDefinition
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new NetworkError(`HTTP ${response.status}`, errorData.error || response.statusText);
      }

      const result = await response.json();

      return {
        success: result.valid,
        valid: result.valid,
        errors: result.errors || [],
        warnings: result.warnings || [],
        message: result.valid ? 'Workflow definition is valid' : `Workflow has ${result.errors?.length || 0} errors`
      };

    } catch (error) {
      return convertToJsonRpcError(error);
    }
  }
}