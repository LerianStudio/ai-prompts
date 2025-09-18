import { EventEmitter } from 'events';
import WebSocket, { WebSocketServer } from 'ws';

/**
 * Model Context Protocol (MCP) Server for task management
 * Implements JSON-RPC 2.0 protocol for Claude Code integration
 */
export class MCPServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      port: parseInt(process.env.MCP_SERVER_PORT) || 3002,
      host: process.env.MCP_HOST || 'localhost',
      ...options
    };

    this.tools = new Map();
    this.clients = new Set();
    this.context = null;
    this.server = null;
    this.currentRequestId = null;
  }

  /**
   * Initialize MCP server
   */
  async initialize(context) {
    this.context = context;

    // Create WebSocket server for JSON-RPC communication
    this.server = new WebSocketServer({
      port: this.options.port,
      host: this.options.host
    });

    this.server.on('connection', (ws, request) => {
      this._handleConnection(ws, request);
    });

    this.server.on('error', (error) => {
      this.emit('error', error);
    });

    console.log(`MCP Server listening on ${this.options.host}:${this.options.port}`);
    this.emit('ready');
  }

  /**
   * Register MCP tools
   */
  registerTool(name, handler, schema) {
    this.tools.set(name, { handler, schema });
  }

  /**
   * Register multiple tools from a tools class
   */
  registerTools(toolsClass) {
    const tools = toolsClass.getTools();
    for (const [name, config] of Object.entries(tools)) {
      this.registerTool(name, config.handler, config.schema);
    }
  }

  /**
   * Handle WebSocket connection
   * @private
   */
  _handleConnection(ws, request) {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`MCP client connected: ${clientId}`);
    this.clients.add(ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const response = await this._handleMessage(message, clientId);

        if (response) {
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        console.error('Message handling error:', error);
        const errorResponse = this._createErrorResponse(-32700, 'Parse error');
        ws.send(JSON.stringify(errorResponse));
      }
    });

    ws.on('close', () => {
      console.log(`MCP client disconnected: ${clientId}`);
      this.clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
      this.clients.delete(ws);
    });

    // Send server info on connection
    this._sendServerInfo(ws);
  }

  /**
   * Handle incoming JSON-RPC message
   * @private
   */
  async _handleMessage(message, clientId) {
    this.currentRequestId = message.id;

    // Handle different message types
    switch (message.method) {
      case 'initialize':
        return this._handleInitialize(message.params);

      case 'tools/list':
        return this._handleToolsList();

      case 'tools/call':
        return await this._handleToolCall(message.params, clientId);

      case 'notifications/initialized':
        // Client initialization complete
        return null;

      default:
        return this._createErrorResponse(-32601, 'Method not found');
    }
  }

  /**
   * Handle initialize request
   * @private
   */
  _handleInitialize(params) {
    return this._createSuccessResponse({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'board-mcp',
        version: '1.0.0'
      }
    });
  }

  /**
   * Handle tools list request
   * @private
   */
  _handleToolsList() {
    const toolList = Array.from(this.tools.entries()).map(([name, config]) => ({
      name,
      description: config.schema.description,
      inputSchema: config.schema.inputSchema
    }));

    return this._createSuccessResponse({
      tools: toolList
    });
  }

  /**
   * Handle tool call request
   * @private
   */
  async _handleToolCall(params, clientId) {
    const { name, arguments: args } = params;

    // Validate tool exists
    if (!this.tools.has(name)) {
      return this._createErrorResponse(-32601, `Tool not found: ${name}`);
    }

    try {
      const tool = this.tools.get(name);

      // Validate arguments against schema if provided
      if (tool.schema.inputSchema) {
        this._validateArguments(args, tool.schema.inputSchema);
      }

      // Execute tool
      const result = await tool.handler(args, this.context, clientId);

      // Ensure result has proper MCP format
      if (!result.content) {
        return this._createSuccessResponse({
          content: [{
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result)
          }]
        });
      }

      return this._createSuccessResponse(result);

    } catch (error) {
      console.error(`Tool execution error (${name}):`, error);
      return this._createErrorResponse(-32603, `Tool execution failed: ${error.message}`);
    }
  }

  /**
   * Send server info to client
   * @private
   */
  _sendServerInfo(ws) {
    const serverInfo = {
      jsonrpc: '2.0',
      method: 'notifications/message',
      params: {
        level: 'info',
        logger: 'board-mcp',
        data: {
          message: 'MCP Server ready for task management operations',
          capabilities: ['create_task', 'list_tasks', 'update_task', 'delete_task', 'start_task_execution', 'get_task_status']
        }
      }
    };

    ws.send(JSON.stringify(serverInfo));
  }

  /**
   * Validate tool arguments against JSON schema
   * @private
   */
  _validateArguments(args, schema) {
    // Basic validation - in production, use a proper JSON schema validator
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in args)) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }

    // Type validation for basic types
    if (schema.properties) {
      for (const [key, value] of Object.entries(args)) {
        const propSchema = schema.properties[key];
        if (propSchema && propSchema.type) {
          const actualType = typeof value;
          const expectedType = propSchema.type;

          if (expectedType === 'array' && !Array.isArray(value)) {
            throw new Error(`Parameter ${key} must be an array`);
          } else if (expectedType !== 'array' && actualType !== expectedType) {
            throw new Error(`Parameter ${key} must be of type ${expectedType}, got ${actualType}`);
          }
        }
      }
    }
  }

  /**
   * Create success response
   * @private
   */
  _createSuccessResponse(result) {
    return {
      jsonrpc: '2.0',
      result,
      id: this.currentRequestId
    };
  }

  /**
   * Create error response
   * @private
   */
  _createErrorResponse(code, message, data = null) {
    const error = { code, message };
    if (data) error.data = data;

    return {
      jsonrpc: '2.0',
      error,
      id: this.currentRequestId
    };
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event, data) {
    const message = JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/message',
      params: {
        level: 'info',
        logger: 'board-mcp',
        data: { event, data, timestamp: new Date().toISOString() }
      }
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Close server
   */
  async close() {
    if (this.server) {
      // Close all client connections
      this.clients.forEach(client => {
        client.close();
      });

      // Close server
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('MCP Server closed');
          resolve();
        });
      });
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: !!this.server,
      port: this.options.port,
      host: this.options.host,
      connectedClients: this.clients.size,
      registeredTools: Array.from(this.tools.keys()),
      uptime: process.uptime()
    };
  }
}