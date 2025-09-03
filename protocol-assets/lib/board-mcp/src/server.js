#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TaskManagerTool } from './board-tool.js';

// Initialize the task manager tool
const SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3020';
const taskManager = new TaskManagerTool(SERVICE_URL);

// Create MCP server
const server = new Server({
  name: 'lerian-board',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    completions: {},
    batching: true
  }
});

// Define available tools
const tools = [
  {
    name: 'createTask',
    description: 'Create a new task with todo items',
    annotations: {
      destructive: true,
      idempotent: false
    },
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Task title',
          minLength: 1,
          maxLength: 200
        },
        description: { 
          type: 'string', 
          description: 'Task description',
          maxLength: 1000
        },
        todos: { 
          type: 'array', 
          items: { 
            type: 'string',
            minLength: 1,
            maxLength: 500
          },
          description: 'Array of todo items',
          maxItems: 50
        }
      },
      required: ['title'],
      additionalProperties: false
    }
  },
  {
    name: 'getTask',
    description: 'Get a task by ID',
    annotations: {
      destructive: false,
      readOnly: true,
      idempotent: true
    },
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { 
          type: 'string', 
          description: 'Task ID',
          pattern: '^[a-zA-Z0-9-_]+$'
        }
      },
      required: ['taskId'],
      additionalProperties: false
    }
  },
  {
    name: 'updateTaskStatus',
    description: 'Update task status',
    annotations: {
      destructive: true,
      idempotent: true
    },
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { 
          type: 'string', 
          description: 'Task ID',
          pattern: '^[a-zA-Z0-9-_]+$'
        },
        status: { 
          type: 'string', 
          enum: ['pending', 'in_progress', 'completed', 'failed'],
          description: 'New task status'
        }
      },
      required: ['taskId', 'status'],
      additionalProperties: false
    }
  },
  {
    name: 'completeTodoItem',
    description: 'Complete a todo item by content',
    annotations: {
      destructive: true,
      idempotent: true
    },
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { 
          type: 'string', 
          description: 'Task ID',
          pattern: '^[a-zA-Z0-9-_]+$'
        },
        todoContent: { 
          type: 'string', 
          description: 'Todo item content to complete',
          minLength: 1,
          maxLength: 500
        }
      },
      required: ['taskId', 'todoContent'],
      additionalProperties: false
    }
  },
  {
    name: 'listTasks',
    description: 'List tasks with optional filters',
    annotations: {
      destructive: false,
      readOnly: true,
      idempotent: true
    },
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['pending', 'in_progress', 'completed', 'failed'],
              description: 'Filter by task status' 
            },
            project_id: { 
              type: 'string', 
              description: 'Filter by project ID',
              pattern: '^[a-zA-Z0-9-_]+$'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  {
    name: 'healthCheck',
    description: 'Check if the task management service is healthy',
    annotations: {
      destructive: false,
      readOnly: true,
      idempotent: true
    },
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  }
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

/**
 * Validate tool arguments against schema
 */
function validateToolArguments(toolName, args) {
  const tool = tools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  // Basic validation - additional JSON Schema validation could be added here
  const schema = tool.inputSchema;
  const required = schema.required || [];
  
  for (const requiredField of required) {
    if (!(requiredField in args)) {
      throw new Error(`Missing required field: ${requiredField}`);
    }
  }
  
  return true;
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Validate arguments against schema
    validateToolArguments(name, args);
    
    let result;
    
    switch (name) {
      case 'createTask':
        result = await taskManager.createTask(args.title, args.description || '', args.todos || []);
        break;
      
      case 'getTask':
        result = await taskManager.getTask(args.taskId);
        break;
      
      case 'updateTaskStatus':
        result = await taskManager.updateTaskStatus(args.taskId, args.status);
        break;
      
      case 'completeTodoItem':
        result = await taskManager.completeTodoItem(args.taskId, args.todoContent);
        break;
      
      case 'listTasks':
        result = await taskManager.listTasks(args.filters || {});
        break;
      
      case 'healthCheck':
        result = await taskManager.healthCheck();
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result.message || 'Operation completed successfully'
        }
      ],
      data: result
    };
    
  } catch (error) {
    // Log error to stderr (not stdout) to maintain protocol integrity
    console.error(`MCP Tool Error [${name}]:`, error.message);
    
    return {
      content: [
        {
          type: 'text',
          text: `Failed to execute ${name}: ${error.message}`
        }
      ],
      isError: true,
      data: {
        success: false,
        error: error.message,
        errorCode: -32000, // JSON-RPC server error code
        tool: name
      }
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch(console.error);