import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import * as ws from 'ws';
const { WebSocketServer } = ws;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TaskService } from './services/task-service.js';
import { DatabaseManager } from './database/database-manager.js';
import { createLogger } from '../../lib/logger.js';
import { validateConfig } from '../../lib/config.js';
import { 
  createErrorHandler, 
  asyncHandler, 
  ValidationError, 
  NotFoundError,
  validateRequired,
  validateLength,
  validateType 
} from '../../lib/utils/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TaskManagementServer {
  constructor() {
    this.logger = createLogger('board-api-server');
    this.config = validateConfig('board-api', this.logger);
    
    this.app = express();
    this.server = createServer(this.app);
    this.port = this.config.port;
    this.host = this.config.host;
    
    this.db = new DatabaseManager(this.config.dbPath);
    this.taskService = new TaskService(this.db);
    
    this.wss = new ws.WebSocketServer({ server: this.server });
    this.clients = new Set();
    
    this.setupWebSocket();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      this.logger.info('WebSocket client connected', { 
        remoteAddress: req.socket.remoteAddress,
        timestamp: new Date().toISOString()
      });
      this.clients.add(ws);
      
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to task management server',
        timestamp: new Date().toISOString()
      }));
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.logger.debug('WebSocket message received', { 
            messageType: message.type,
            clientMessage: message
          });
          
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          this.logger.error('Error parsing WebSocket message', { 
            error: error.message,
            data: data.toString().substring(0, 100) 
          });
        }
      });
      
      ws.on('close', () => {
        this.logger.info('WebSocket client disconnected');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        this.logger.error('WebSocket error', { error: error.message });
        this.clients.delete(ws);
      });
    });
  }

  broadcast(event) {
    const message = JSON.stringify(event);
    let sentCount = 0;
    
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          this.logger.error('Error sending WebSocket message', { error: error.message });
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });
    
    if (sentCount > 0) {
      this.logger.debug('WebSocket broadcast sent', { 
        clientCount: sentCount,
        eventType: event.type
      });
    }
  }

  setupMiddleware() {
    const defaultOrigins = process.env.NODE_ENV === 'production' 
      ? []
      : [
          `http://localhost:${process.env.FRONTEND_PORT || '5173'}`,
          `http://localhost:${this.port}`,
          `http://127.0.0.1:${process.env.FRONTEND_PORT || '5173'}`,
          `http://127.0.0.1:${this.port}`
        ];
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : defaultOrigins;
    
    if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_CORS_LOGGING !== 'false') {
      this.logger.debug('CORS configuration', { allowedOrigins });
    }
    
    this.app.use(cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200
    }));
    
    const requestLimit = process.env.API_REQUEST_LIMIT || '1mb';
    this.app.use(express.json({ 
      limit: requestLimit
    }));
    this.app.use(express.urlencoded({ 
      extended: true,
      limit: requestLimit
    }));
    
    const publicPath = join(__dirname, '../public');
    this.app.use(express.static(publicPath));
    
    if (process.env.ENABLE_REQUEST_LOGGING !== 'false') {
      this.app.use((req, res, next) => {
        this.logger.debug('HTTP Request', {
          method: req.method,
          path: req.path,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent')
        });
        next();
      });
    }
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    this.app.post('/api/tasks', asyncHandler(this.createTask.bind(this)));
    this.app.get('/api/tasks/:id', asyncHandler(this.getTask.bind(this)));
    this.app.get('/api/tasks', asyncHandler(this.listTasks.bind(this)));
    this.app.put('/api/tasks/:id', asyncHandler(this.updateTask.bind(this)));
    this.app.delete('/api/tasks/:id', asyncHandler(this.deleteTask.bind(this)));
    this.app.put('/api/tasks/:id/todos/:todoId', asyncHandler(this.updateTodo.bind(this)));
    this.app.post('/api/tasks/:id/todos/:todoId/complete', asyncHandler(this.completeTodo.bind(this)));

    if (process.env.NODE_ENV === 'production') {
      const distPath = join(__dirname, '../dist');
      this.app.use(express.static(distPath));
      
      this.app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
          res.sendFile(join(distPath, 'index.html'));
        }
      });
    } else {
      this.app.get('/', (req, res) => {
        res.send(`
          <html>
            <body>
              <h1>Task Management Service</h1>
              <p>React app is running on Vite dev server (usually port 5173)</p>
              <p>API server is running on port ${this.port}</p>
            </body>
          </html>
        `);
      });
    }

    this.app.use(createErrorHandler('board-api'));
  }

  async createTask(req, res) {
    const { title, description, todos = [] } = req.body;
    
    validateRequired({ title }, ['title']);
    
    validateLength(title, 'title', 1, 200);
    if (description) {
      validateLength(description, 'description', 0, 1000);
    }
    validateType(todos, 'todos', 'array');
    
    if (todos.length > 50) {
      throw new ValidationError('todos', 'Maximum of 50 todo items allowed', todos.length);
    }
    
    todos.forEach((todo, index) => {
      validateType(todo, `todos[${index}]`, 'string');
      validateLength(todo, `todos[${index}]`, 1, 500);
    });

    const task = await this.taskService.createTask({
      title,
      description,
      todos
    });

    this.broadcast({
      type: 'task_created',
      task: task,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(task);
  }

  async getTask(req, res) {
    const { id } = req.params;
    
    validateRequired({ id }, ['id']);
    validateLength(id, 'id', 1, 50);
    
    const task = await this.taskService.getTask(id);
    
    if (!task) {
      throw new NotFoundError('Task', id);
    }

    res.json(task);
  }

  async listTasks(req, res) {
    try {
      const { status, project_id } = req.query;
      const tasks = await this.taskService.listTasks({ status, project_id });
      res.json(tasks);
    } catch (error) {
      this.logger.error('Error listing tasks', { error: error.message });
      res.status(500).json({ error: 'Failed to list tasks', message: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await this.taskService.updateTask(id, updates);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      this.broadcast({
        type: 'task_updated',
        task: task,
        updates: updates,
        timestamp: new Date().toISOString()
      });

      res.json(task);
    } catch (error) {
      this.logger.error('Error updating task', { error: error.message });
      res.status(500).json({ error: 'Failed to update task', message: error.message });
    }
  }

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      const taskToDelete = await this.taskService.getTask(id);
      
      const deleted = await this.taskService.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      this.broadcast({
        type: 'task_deleted',
        taskId: id,
        task: taskToDelete,
        timestamp: new Date().toISOString()
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task', message: error.message });
    }
  }

  async updateTodo(req, res) {
    try {
      const { id, todoId } = req.params;
      const { completed } = req.body;
      
      const task = await this.taskService.updateTodo(id, todoId, { completed });
      
      if (!task) {
        return res.status(404).json({ error: 'Task or todo not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Failed to update todo', message: error.message });
    }
  }

  async completeTodo(req, res) {
    try {
      const { id, todoId } = req.params;
      const result = await this.taskService.completeTodo(id, todoId);
      
      if (!result) {
        return res.status(404).json({ error: 'Task or todo not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Error completing todo:', error);
      res.status(500).json({ error: 'Failed to complete todo', message: error.message });
    }
  }

  async start() {
    await this.db.initialize();
    
    this.server.listen(this.port, this.host, () => {
      this.logger.info('Task Management Service started', {
        httpUrl: `http://${this.host}:${this.port}`,
        wsUrl: `ws://${this.host}:${this.port}`,
        database: this.db.dbPath,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.db) {
      this.db.close();
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = new TaskManagementServer();
  
  process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await server.stop();
    process.exit(0);
  });
  
  server.start().catch(console.error);
}

export { TaskManagementServer };