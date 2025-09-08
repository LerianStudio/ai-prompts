#!/usr/bin/env node

import { TaskManagerTool } from './board-tool.js';
import { WorkflowManagerTool } from './workflow-tools.js';

// Initialize the tools with configurable base URL
const SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3020';
const taskManager = new TaskManagerTool(SERVICE_URL);
const workflowManager = new WorkflowManagerTool(SERVICE_URL);

/**
 * MCP Tool Functions for Task Management & Workflow Orchestration
 * These functions will be called by AI agents through the MCP protocol
 */

// ===== Legacy Task Management Functions =====

/**
 * Creates a new task with todos
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string[]} todos - Array of todo items
 * @returns {Promise<object>} Task creation result
 */
export async function createTask(title, description, todos = []) {
  if (!title) {
    return {
      success: false,
      error: 'Title is required',
      message: 'Task title cannot be empty'
    };
  }

  return await taskManager.createTask(title, description, todos);
}

/**
 * Gets a task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<object>} Task data
 */
export async function getTask(taskId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  return await taskManager.getTask(taskId);
}

/**
 * Updates task status
 * @param {string} taskId - Task ID
 * @param {string} status - New status (pending, in_progress, completed, failed)
 * @returns {Promise<object>} Update result
 */
export async function updateTaskStatus(taskId, status) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  if (!status) {
    return {
      success: false,
      error: 'Status is required',
      message: 'Status cannot be empty'
    };
  }

  return await taskManager.updateTaskStatus(taskId, status);
}

/**
 * Completes a todo item by content
 * @param {string} taskId - Task ID
 * @param {string} todoContent - Todo item content to complete
 * @returns {Promise<object>} Completion result
 */
export async function completeTodoItem(taskId, todoContent) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  if (!todoContent) {
    return {
      success: false,
      error: 'Todo content is required',
      message: 'Todo content cannot be empty'
    };
  }

  return await taskManager.completeTodoItem(taskId, todoContent);
}

/**
 * Lists tasks with optional filters
 * @param {object} filters - Filter options (status, project_id)
 * @returns {Promise<object>} List of tasks
 */
export async function listTasks(filters = {}) {
  return await taskManager.listTasks(filters);
}

/**
 * Health check for the task management service
 * @returns {Promise<object>} Service health status
 */
export async function healthCheck() {
  return await taskManager.healthCheck();
}

// ===== Workflow Orchestration Functions =====

/**
 * Initialize a complete workflow from YAML definition
 * Creates all tasks upfront with proper dependency relationships
 * @param {string} workflowDefinition - YAML workflow definition
 * @returns {Promise<object>} Workflow initialization result
 */
export async function initializeWorkflow(workflowDefinition) {
  if (!workflowDefinition) {
    return {
      success: false,
      error: 'Workflow definition is required',
      message: 'Workflow definition cannot be empty'
    };
  }

  return await workflowManager.initializeWorkflow(workflowDefinition);
}

/**
 * Validate workflow definition before initialization
 * @param {string} workflowDefinition - YAML workflow definition
 * @returns {Promise<object>} Validation result with errors/warnings
 */
export async function validateWorkflow(workflowDefinition) {
  if (!workflowDefinition) {
    return {
      success: false,
      valid: false,
      error: 'Workflow definition is required',
      errors: ['Workflow definition cannot be empty'],
      message: 'Workflow definition cannot be empty'
    };
  }

  return await workflowManager.validateWorkflow(workflowDefinition);
}

/**
 * Get available work for a specific agent type
 * Returns tasks that are ready to be claimed and worked on
 * @param {string} agentType - Agent type (e.g., 'frontend-developer', 'task-breakdown-specialist')
 * @param {number} limit - Maximum number of tasks to return (default: 5)
 * @returns {Promise<object>} Available work for the agent
 */
export async function getAgentWork(agentType, limit = 5) {
  if (!agentType) {
    return {
      success: false,
      error: 'Agent type is required',
      message: 'Agent type cannot be empty'
    };
  }

  return await workflowManager.getAgentWork(agentType, limit);
}

/**
 * Claim a task for an agent (atomic operation to prevent race conditions)
 * @param {string} taskId - Task ID to claim
 * @param {string} agentId - Unique agent identifier
 * @returns {Promise<object>} Task claiming result
 */
export async function claimTask(taskId, agentId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  if (!agentId) {
    return {
      success: false,
      error: 'Agent ID is required',
      message: 'Agent ID cannot be empty'
    };
  }

  return await workflowManager.claimTask(taskId, agentId);
}

/**
 * Release a claimed task back to available status
 * @param {string} taskId - Task ID to release
 * @returns {Promise<object>} Task release result
 */
export async function releaseTask(taskId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  return await workflowManager.releaseTask(taskId);
}

/**
 * Complete a workflow task and activate dependent tasks
 * @param {string} taskId - Task ID to complete
 * @returns {Promise<object>} Completion result with activated dependencies
 */
export async function completeWorkflowTask(taskId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  return await workflowManager.completeWorkflowTask(taskId);
}

/**
 * Get workflow status and progress overview
 * @param {string} workflowId - Workflow ID
 * @returns {Promise<object>} Workflow status and progress information
 */
export async function getWorkflowStatus(workflowId) {
  if (!workflowId) {
    return {
      success: false,
      error: 'Workflow ID is required',
      message: 'Workflow ID cannot be empty'
    };
  }

  return await workflowManager.getWorkflowStatus(workflowId);
}

/**
 * List workflow tasks with enhanced filtering
 * @param {object} filters - Filter options (workflow_id, agent_type, status, available_only, etc.)
 * @returns {Promise<object>} Filtered list of workflow tasks
 */
export async function listWorkflowTasks(filters = {}) {
  return await workflowManager.listWorkflowTasks(filters);
}

/**
 * Get task with full dependency information
 * @param {string} taskId - Task ID
 * @returns {Promise<object>} Task with dependencies and dependents
 */
export async function getTaskWithDependencies(taskId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  return await workflowManager.getTaskWithDependencies(taskId);
}

// ===== Agent Helper Functions =====

/**
 * Agent workflow: Check for available work, claim a task if available
 * Convenience function for agents to get work in one operation
 * @param {string} agentType - Agent type
 * @param {string} agentId - Unique agent identifier
 * @returns {Promise<object>} Claimed task or no work available message
 */
export async function getAndClaimWork(agentType, agentId) {
  if (!agentType) {
    return {
      success: false,
      error: 'Agent type is required',
      message: 'Agent type cannot be empty'
    };
  }

  if (!agentId) {
    return {
      success: false,
      error: 'Agent ID is required',
      message: 'Agent ID cannot be empty'
    };
  }

  // Get available work
  const workResult = await workflowManager.getAgentWork(agentType, 1);
  
  if (!workResult.success || workResult.tasks.length === 0) {
    return {
      success: true,
      has_work: false,
      message: `No available work for ${agentType}`,
      ...workResult
    };
  }

  // Claim the first available task
  const taskId = workResult.tasks[0].id;
  const claimResult = await workflowManager.claimTask(taskId, agentId);
  
  return {
    success: claimResult.success,
    has_work: claimResult.success,
    claimed_task: claimResult.success ? claimResult.task : null,
    message: claimResult.success 
      ? `Successfully claimed task ${taskId} for ${agentType}`
      : `Failed to claim task: ${claimResult.error}`,
    ...claimResult
  };
}

/**
 * Agent workflow: Complete current work and get next available task
 * Convenience function for agents to complete work and get next task
 * @param {string} taskId - Current task ID to complete
 * @param {string} agentType - Agent type
 * @param {string} agentId - Unique agent identifier
 * @returns {Promise<object>} Completion result and next task if available
 */
export async function completeAndGetNext(taskId, agentType, agentId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  // Complete current task
  const completeResult = await workflowManager.completeWorkflowTask(taskId);
  
  if (!completeResult.success) {
    return {
      success: false,
      completed_task: false,
      error: completeResult.error,
      message: `Failed to complete task ${taskId}: ${completeResult.error}`
    };
  }

  // Try to get next work
  const nextWorkResult = await getAndClaimWork(agentType, agentId);
  
  return {
    success: true,
    completed_task: completeResult.task,
    activated_tasks: completeResult.activated_tasks || [],
    next_work_available: nextWorkResult.has_work,
    next_task: nextWorkResult.claimed_task,
    message: `Completed task ${taskId}. ${nextWorkResult.has_work ? 'Claimed next task.' : 'No more work available.'}`
  };
}

// CLI interface for testing
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'create':
      const [title, description, ...todos] = args;
      const result = await createTask(title, description, todos);
      console.log(JSON.stringify(result, null, 2));
      break;

    case 'get':
      const [taskId] = args;
      const task = await getTask(taskId);
      console.log(JSON.stringify(task, null, 2));
      break;

    case 'list':
      const tasks = await listTasks();
      console.log(JSON.stringify(tasks, null, 2));
      break;

    case 'health':
      const health = await healthCheck();
      console.log(JSON.stringify(health, null, 2));
      break;

    // Workflow commands
    case 'init-workflow':
      const [workflowFile] = args;
      if (!workflowFile) {
        console.error('Usage: node src/workflow-index.js init-workflow <workflow-file>');
        process.exit(1);
      }
      const fs = await import('fs');
      const workflowDef = fs.readFileSync(workflowFile, 'utf8');
      const initResult = await initializeWorkflow(workflowDef);
      console.log(JSON.stringify(initResult, null, 2));
      break;

    case 'validate-workflow':
      const [validateFile] = args;
      if (!validateFile) {
        console.error('Usage: node src/workflow-index.js validate-workflow <workflow-file>');
        process.exit(1);
      }
      const fsVal = await import('fs');
      const validateDef = fsVal.readFileSync(validateFile, 'utf8');
      const validateResult = await validateWorkflow(validateDef);
      console.log(JSON.stringify(validateResult, null, 2));
      break;

    case 'agent-work':
      const [agentType, limitStr] = args;
      if (!agentType) {
        console.error('Usage: node src/workflow-index.js agent-work <agent-type> [limit]');
        process.exit(1);
      }
      const limit = parseInt(limitStr) || 5;
      const workResult = await getAgentWork(agentType, limit);
      console.log(JSON.stringify(workResult, null, 2));
      break;

    case 'claim':
      const [claimTaskId, agentId] = args;
      if (!claimTaskId || !agentId) {
        console.error('Usage: node src/workflow-index.js claim <task-id> <agent-id>');
        process.exit(1);
      }
      const claimResult = await claimTask(claimTaskId, agentId);
      console.log(JSON.stringify(claimResult, null, 2));
      break;

    case 'complete':
      const [completeTaskId] = args;
      if (!completeTaskId) {
        console.error('Usage: node src/workflow-index.js complete <task-id>');
        process.exit(1);
      }
      const completeTaskResult = await completeWorkflowTask(completeTaskId);
      console.log(JSON.stringify(completeTaskResult, null, 2));
      break;

    case 'workflow-status':
      const [workflowId] = args;
      if (!workflowId) {
        console.error('Usage: node src/workflow-index.js workflow-status <workflow-id>');
        process.exit(1);
      }
      const statusResult = await getWorkflowStatus(workflowId);
      console.log(JSON.stringify(statusResult, null, 2));
      break;

    case 'get-claim-work':
      const [getAgentType, getAgentId] = args;
      if (!getAgentType || !getAgentId) {
        console.error('Usage: node src/workflow-index.js get-claim-work <agent-type> <agent-id>');
        process.exit(1);
      }
      const getClaimResult = await getAndClaimWork(getAgentType, getAgentId);
      console.log(JSON.stringify(getClaimResult, null, 2));
      break;

    default:
      console.log('Usage:');
      console.log('Legacy task commands:');
      console.log('  node src/workflow-index.js create "Task Title" "Description" "Todo 1" "Todo 2"');
      console.log('  node src/workflow-index.js get <task-id>');
      console.log('  node src/workflow-index.js list');
      console.log('  node src/workflow-index.js health');
      console.log('');
      console.log('Workflow orchestration commands:');
      console.log('  node src/workflow-index.js init-workflow <workflow-file.yaml>');
      console.log('  node src/workflow-index.js validate-workflow <workflow-file.yaml>');
      console.log('  node src/workflow-index.js agent-work <agent-type> [limit]');
      console.log('  node src/workflow-index.js claim <task-id> <agent-id>');
      console.log('  node src/workflow-index.js complete <task-id>');
      console.log('  node src/workflow-index.js workflow-status <workflow-id>');
      console.log('  node src/workflow-index.js get-claim-work <agent-type> <agent-id>');
      break;
  }
}