#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TaskManagerTool } from './board-tool.js';
import { createErrorResponse } from './utils/jsonrpc-errors.js';
import { createLogger } from '../../lib/logger.js';
import { validateConfig } from '../../lib/config.js';

const logger = createLogger('board-mcp-server');
const config = validateConfig('board-mcp', logger);
const taskManager = new TaskManagerTool(config.serviceUrl);

logger.info('MCP server initializing', {
  serviceUrl: config.serviceUrl,
  environment: config.NODE_ENV,
  nodeVersion: process.version,
  platform: process.platform
});

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
    name: 'deleteTask',
    description: 'Delete a task by ID',
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
        }
      },
      required: ['taskId'],
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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

function validateToolArguments(toolName, args) {
  const tool = tools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  const schema = tool.inputSchema;
  const required = schema.required || [];
  
  for (const requiredField of required) {
    if (!(requiredField in args)) {
      throw new Error(`Missing required field: ${requiredField}`);
    }
  }
  
  return true;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
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
      
      case 'deleteTask':
        result = await taskManager.deleteTask(args.taskId);
        break;
      
      case 'healthCheck':
        result = await taskManager.healthCheck();
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    if (result.success === false) {
      throw new Error(result.message || result.error || 'Operation failed');
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
    logger.error(`MCP tool execution failed: ${name}`, {
      tool: name,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      args: Object.keys(args || {})
    });
    
    return createErrorResponse(error, name);
  }
});

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await server.close();
    logger.info('MCP server stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('MCP server started successfully', {
      capabilities: Object.keys(server.capabilities || {}),
      toolCount: tools.length
    });
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'];
    signals.forEach(signal => {
      process.on(signal, () => shutdown(signal));
    });
    process.on('uncaughtException', (error) => {
      logger.fatal('Uncaught exception', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.fatal('Unhandled rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack
      });
      shutdown('UNHANDLED_REJECTION');
    });
    
  } catch (error) {
    logger.fatal('Failed to start MCP server', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.fatal('Fatal error in main', error);
  process.exit(1);
});