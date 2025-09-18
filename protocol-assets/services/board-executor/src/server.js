import express from 'express';
import cors from 'cors';
import path from 'path';
import { BoardExecutorService } from './index.js';
import { createLogger } from '../../lib/logger.js';

const logger = createLogger('board-executor-server');

// Configuration
const PORT = process.env.PORT || 3025;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Board Executor Service
// Use explicit PROJECT_ROOT for target project (not relative paths)
const projectRoot = process.env.PROJECT_ROOT || process.cwd();

// Ensure we're working with the target project root, not the services directory
const targetProjectRoot = path.resolve(projectRoot);

logger.info('Board Executor working directory configured', {
  projectRoot: targetProjectRoot,
  currentDir: process.cwd(),
  protocolAssetsPath: path.join(targetProjectRoot, 'protocol-assets'),
  servicesLocation: 'protocol-assets/services'
});

const executorService = new BoardExecutorService({
  executor: {
    workingDirectory: targetProjectRoot  // Files created in target project root
  }
});

// Routes
app.post('/execute', async (req, res) => {
  try {
    const { prompt, agentPrompt, taskId, model, dangerouslySkipPermissions, targetSession } = req.body;

    // Use agentPrompt if provided, otherwise fall back to prompt
    const executionPrompt = agentPrompt || prompt;

    logger.info('Received execution request', {
      taskId,
      promptLength: executionPrompt?.length
    });

    const result = await executorService.execute({
      prompt: executionPrompt,
      taskId,
      model,
      dangerouslySkipPermissions,
      targetSession
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Execution failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/execute-followup', async (req, res) => {
  try {
    const { prompt, taskId, sessionId } = req.body;

    logger.info('Received follow-up execution request', {
      taskId,
      sessionId,
      promptLength: prompt?.length
    });

    const result = await executorService.executeFollowUp({
      prompt,
      taskId,
      sessionId
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Follow-up execution failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'board-executor',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Board Executor Server started', {
    port: PORT,
    environment: NODE_ENV,
    endpoints: [
      'POST /execute',
      'POST /execute-followup',
      'GET /health'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await executorService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await executorService.shutdown();
  process.exit(0);
});