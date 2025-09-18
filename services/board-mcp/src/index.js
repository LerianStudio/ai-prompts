#!/usr/bin/env node

import { MCPServer } from './mcpServer.js';
import { TaskTools } from './tools/taskTools.js';

/**
 * Board MCP Server - Entry point
 * Provides Model Context Protocol interface for Claude Code task management
 */

// Configuration from environment variables
const CONFIG = {
  boardApiUrl: process.env.BOARD_API_URL || 'http://localhost:3001',
  mcpPort: parseInt(process.env.MCP_SERVER_PORT) || 3002,
  mcpHost: process.env.MCP_HOST || 'localhost'
};

/**
 * Create and configure the MCP server
 */
async function createServer() {
  const server = new MCPServer({
    port: CONFIG.mcpPort,
    host: CONFIG.mcpHost
  });

  // Create context for tools
  const context = {
    boardApiUrl: CONFIG.boardApiUrl,
    broadcast: (event, data) => server.broadcast(event, data),
    config: CONFIG
  };

  // Register task management tools
  server.registerTools(TaskTools);

  // Handle server events
  server.on('ready', () => {
    console.log('✅ Board MCP Server ready');
    console.log(`🔗 Board API: ${CONFIG.boardApiUrl}`);
    console.log(`📡 MCP Server: ${CONFIG.mcpHost}:${CONFIG.mcpPort}`);
    console.log('🛠️  Registered tools:', Object.keys(TaskTools.getTools()).join(', '));
  });

  server.on('error', (error) => {
    console.error('❌ MCP Server error:', error);
  });

  // Initialize server
  await server.initialize(context);

  return server;
}

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    try {
      await server.close();
      console.log('✅ Server closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

/**
 * Health check endpoint for monitoring
 */
function setupHealthCheck(server) {
  // Simple HTTP server for health checks
  import('http').then(http => {
    const healthServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        const status = server.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          server: status
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const healthPort = CONFIG.mcpPort + 1;
    healthServer.listen(healthPort, CONFIG.mcpHost, () => {
      console.log(`💊 Health check available at http://${CONFIG.mcpHost}:${healthPort}/health`);
    });
  });
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log('🚀 Starting Board MCP Server...');

    // Validate configuration
    if (!CONFIG.boardApiUrl) {
      throw new Error('BOARD_API_URL environment variable is required');
    }

    // Create and start server
    const server = await createServer();

    // Setup health monitoring
    setupHealthCheck(server);

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    console.log('🎉 Board MCP Server is running successfully!');
    console.log('💡 To use with Claude Code:');
    console.log('   1. Ensure .mcp.json contains this server configuration');
    console.log('   2. Run: claude "List my tasks"');
    console.log('   3. Claude Code will automatically discover and use the task management tools');

  } catch (error) {
    console.error('❌ Failed to start Board MCP Server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}