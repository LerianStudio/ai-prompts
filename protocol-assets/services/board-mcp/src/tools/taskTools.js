import { v4 as uuidv4 } from 'uuid';

/**
 * Task management tools for MCP server
 * Provides CRUD operations and execution capabilities for board tasks
 */
export class TaskTools {
  /**
   * Get all available tools with their schemas
   */
  static getTools() {
    return {
      list_tasks: {
        handler: this.list_tasks.bind(this),
        schema: {
          name: 'list_tasks',
          description: 'List tasks from the board with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'failed'],
                description: 'Filter tasks by status'
              },
              limit: {
                type: 'number',
                default: 50,
                description: 'Maximum number of tasks to return'
              },
              offset: {
                type: 'number',
                default: 0,
                description: 'Number of tasks to skip for pagination'
              }
            }
          }
        }
      },

      create_task: {
        handler: this.create_task.bind(this),
        schema: {
          name: 'create_task',
          description: 'Create a new task in the board',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Task title (required)'
              },
              description: {
                type: 'string',
                description: 'Optional task description'
              },
              todos: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of todo items'
              },
              agent_prompt: {
                type: 'string',
                description: 'Optional prompt for Claude Code execution'
              }
            },
            required: ['title']
          }
        }
      },

      update_task: {
        handler: this.update_task.bind(this),
        schema: {
          name: 'update_task',
          description: 'Update an existing task',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to update (required)'
              },
              title: {
                type: 'string',
                description: 'New task title'
              },
              description: {
                type: 'string',
                description: 'New task description'
              },
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'failed'],
                description: 'New task status'
              }
            },
            required: ['taskId']
          }
        }
      },

      delete_task: {
        handler: this.delete_task.bind(this),
        schema: {
          name: 'delete_task',
          description: 'Delete a task from the board',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to delete (required)'
              }
            },
            required: ['taskId']
          }
        }
      },

      start_task_execution: {
        handler: this.start_task_execution.bind(this),
        schema: {
          name: 'start_task_execution',
          description: 'Start executing a task with Claude Code',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to execute (required)'
              },
              prompt: {
                type: 'string',
                description: 'Optional custom prompt for execution'
              }
            },
            required: ['taskId']
          }
        }
      },

      get_task_status: {
        handler: this.get_task_status.bind(this),
        schema: {
          name: 'get_task_status',
          description: 'Get current execution status of a task',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to check (required)'
              }
            },
            required: ['taskId']
          }
        }
      },

      complete_todo: {
        handler: this.complete_todo.bind(this),
        schema: {
          name: 'complete_todo',
          description: 'Mark a todo item as completed',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID containing the todo'
              },
              todoContent: {
                type: 'string',
                description: 'Content of the todo to complete'
              }
            },
            required: ['taskId', 'todoContent']
          }
        }
      }
    };
  }

  /**
   * List tasks with optional filtering
   */
  static async list_tasks(params, context) {
    try {
      const { status, limit = 50, offset = 0 } = params;

      // Call board API to get tasks
      const apiUrl = `${context.boardApiUrl}/api/tasks`;
      const queryParams = new URLSearchParams();

      if (status) queryParams.append('status', status);
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${apiUrl}?${queryParams}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to list tasks');
      }

      const summary = `Found ${result.data.length} task(s)`;
      const details = result.data.map(task => {
        const todoCount = task.todos ? task.todos.length : 0;
        const completedTodos = task.todos ? task.todos.filter(t => t.completed).length : 0;

        return `• **${task.title}** (${task.status})
  - ID: ${task.id}
  - Description: ${task.description || 'No description'}
  - Todos: ${completedTodos}/${todoCount} completed
  - Created: ${new Date(task.created_at).toLocaleDateString()}`;
      }).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `${summary}\n\n${details}`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error listing tasks: ${error.message}`
        }]
      };
    }
  }

  /**
   * Create a new task
   */
  static async create_task(params, context) {
    try {
      const { title, description, todos, agent_prompt } = params;

      // Call board API to create task
      const response = await fetch(`${context.boardApiUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          todos,
          agent_prompt,
          agent_type: 'claude-code'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create task');
      }

      const task = result.data;

      // Broadcast update via WebSocket
      context.broadcast('task_created', task);

      const todoText = todos && todos.length > 0 ?
        `\nTodos created:\n${todos.map(t => `  - ${t}`).join('\n')}` : '';

      return {
        content: [{
          type: 'text',
          text: `✅ Task "${title}" created successfully!

**Task Details:**
- ID: ${task.id}
- Status: ${task.status}
- Created: ${new Date(task.created_at).toLocaleString()}${todoText}

You can now execute this task using: start_task_execution with taskId "${task.id}"`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error creating task: ${error.message}`
        }]
      };
    }
  }

  /**
   * Update an existing task
   */
  static async update_task(params, context) {
    try {
      const { taskId, title, description, status } = params;

      // Call board API to update task
      const response = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update task');
      }

      const task = result.data;

      // Broadcast update via WebSocket
      context.broadcast('task_updated', task);

      const changes = [];
      if (title) changes.push(`title → "${title}"`);
      if (description) changes.push(`description → "${description}"`);
      if (status) changes.push(`status → "${status}"`);

      return {
        content: [{
          type: 'text',
          text: `✅ Task updated successfully!

**Changes made:**
${changes.map(c => `- ${c}`).join('\n')}

**Updated Task:**
- ID: ${task.id}
- Title: ${task.title}
- Status: ${task.status}
- Updated: ${new Date(task.updated_at).toLocaleString()}`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error updating task: ${error.message}`
        }]
      };
    }
  }

  /**
   * Delete a task
   */
  static async delete_task(params, context) {
    try {
      const { taskId } = params;

      // Get task details before deletion for confirmation message
      const getResponse = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}`);
      const taskTitle = getResponse.ok ?
        (await getResponse.json()).data?.title : 'Unknown';

      // Call board API to delete task
      const response = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete task');
      }

      // Broadcast update via WebSocket
      context.broadcast('task_deleted', { id: taskId, title: taskTitle });

      return {
        content: [{
          type: 'text',
          text: `✅ Task "${taskTitle}" (${taskId}) has been deleted successfully.`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error deleting task: ${error.message}`
        }]
      };
    }
  }

  /**
   * Start task execution with Claude Code
   */
  static async start_task_execution(params, context) {
    try {
      const { taskId, prompt } = params;

      // Call board API to start execution
      const response = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_prompt: prompt
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start task execution');
      }

      const executionData = result.data;

      // Broadcast execution start via WebSocket
      context.broadcast('execution_started', { taskId, executionData });

      return {
        content: [{
          type: 'text',
          text: `🚀 Task execution started successfully!

**Execution Details:**
- Task ID: ${taskId}
- Execution Status: ${executionData.execution_status}
- Started: ${new Date(executionData.execution_started_at).toLocaleString()}

The task is now being executed with Claude Code. You can monitor progress using get_task_status or watch the real-time updates in the UI.`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error starting task execution: ${error.message}`
        }]
      };
    }
  }

  /**
   * Get task execution status
   */
  static async get_task_status(params, context) {
    try {
      const { taskId } = params;

      // Call board API to get task status
      const response = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}/status`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get task status');
      }

      const statusData = result.data;

      const statusEmoji = {
        none: '⚪',
        queued: '🟡',
        running: '🔵',
        completed: '✅',
        failed: '❌'
      };

      const emoji = statusEmoji[statusData.execution_status] || '❓';

      let statusText = `${emoji} **Task Execution Status**

**Task ID:** ${taskId}
**Status:** ${statusData.execution_status}`;

      if (statusData.execution_started_at) {
        statusText += `\n**Started:** ${new Date(statusData.execution_started_at).toLocaleString()}`;
      }

      if (statusData.execution_completed_at) {
        statusText += `\n**Completed:** ${new Date(statusData.execution_completed_at).toLocaleString()}`;
      }

      if (statusData.execution_log) {
        const logPreview = statusData.execution_log.slice(0, 200);
        statusText += `\n\n**Recent Log Output:**\n\`\`\`\n${logPreview}${statusData.execution_log.length > 200 ? '...' : ''}\n\`\`\``;
      }

      return {
        content: [{
          type: 'text',
          text: statusText
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error getting task status: ${error.message}`
        }]
      };
    }
  }

  /**
   * Complete a todo item
   */
  static async complete_todo(params, context) {
    try {
      const { taskId, todoContent } = params;

      // Call board API to complete todo
      const response = await fetch(`${context.boardApiUrl}/api/tasks/${taskId}/todos/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todoContent
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete todo');
      }

      // Broadcast update via WebSocket
      context.broadcast('todo_completed', { taskId, todoContent });

      return {
        content: [{
          type: 'text',
          text: `✅ Todo completed successfully!

**Completed:** "${todoContent}"
**Task ID:** ${taskId}

The todo has been marked as completed in the task.`
        }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `❌ Error completing todo: ${error.message}`
        }]
      };
    }
  }
}