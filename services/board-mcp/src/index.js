#!/usr/bin/env node

import { TaskManagerTool } from './board-tool.js';

// Initialize the tool with configurable base URL
const SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3020';
const taskManager = new TaskManagerTool(SERVICE_URL);

/**
 * MCP Tool Functions for Task Management
 * These functions will be called by AI agents through the MCP protocol
 */

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
 * Deletes a task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<object>} Deletion result
 */
export async function deleteTask(taskId) {
  if (!taskId) {
    return {
      success: false,
      error: 'Task ID is required',
      message: 'Task ID cannot be empty'
    };
  }

  return await taskManager.deleteTask(taskId);
}

/**
 * Health check for the task management service
 * @returns {Promise<object>} Service health status
 */
export async function healthCheck() {
  return await taskManager.healthCheck();
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

    case 'delete':
      const [deleteTaskId] = args;
      const deleteResult = await deleteTask(deleteTaskId);
      console.log(JSON.stringify(deleteResult, null, 2));
      break;

    case 'list':
      const tasks = await listTasks();
      console.log(JSON.stringify(tasks, null, 2));
      break;

    case 'health':
      const health = await healthCheck();
      console.log(JSON.stringify(health, null, 2));
      break;

    default:
      console.log('Usage:');
      console.log('  node src/index.js create "Task Title" "Description" "Todo 1" "Todo 2"');
      console.log('  node src/index.js get <task-id>');
      console.log('  node src/index.js delete <task-id>');
      console.log('  node src/index.js list');
      console.log('  node src/index.js health');
      break;
  }
}