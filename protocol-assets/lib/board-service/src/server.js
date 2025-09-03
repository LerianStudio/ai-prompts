import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import * as ws from 'ws';
const { WebSocketServer } = ws;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TaskService } from './services/task-service.js';
import { DatabaseManager } from './database/database-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TaskManagementServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 3020;
    this.host = process.env.HOST || 'localhost';
    
    // Initialize database
    const dbPath = process.env.DB_PATH || join(__dirname, '../../../data/databases/task-management.db');
    this.db = new DatabaseManager(dbPath);
    this.taskService = new TaskService(this.db);
    
    // Initialize WebSocket
    this.wss = new ws.WebSocketServer({ server: this.server });
    this.clients = new Set();
    
    this.setupWebSocket();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('🔗 WebSocket client connected from', req.socket.remoteAddress);
      this.clients.add(ws);
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to task management server',
        timestamp: new Date().toISOString()
      }));
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log('📨 WebSocket message received:', message);
          
          // Handle different message types if needed
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  // Broadcast event to all connected WebSocket clients
  broadcast(event) {
    const message = JSON.stringify(event);
    let sentCount = 0;
    
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error('❌ Error sending WebSocket message:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });
    
    if (sentCount > 0) {
      console.log(`📡 Broadcast sent to ${sentCount} clients:`, event.type);
    }
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files from public directory
    const publicPath = join(__dirname, '../public');
    this.app.use(express.static(publicPath));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // API routes with /api prefix
    this.app.post('/api/tasks', this.createTask.bind(this));
    this.app.get('/api/tasks/:id', this.getTask.bind(this));
    this.app.get('/api/tasks', this.listTasks.bind(this));
    this.app.put('/api/tasks/:id', this.updateTask.bind(this));
    this.app.delete('/api/tasks/:id', this.deleteTask.bind(this));
    this.app.put('/api/tasks/:id/todos/:todoId', this.updateTodo.bind(this));
    this.app.post('/api/tasks/:id/todos/:todoId/complete', this.completeTodo.bind(this));

    // Serve React app (in development, Vite handles this)
    if (process.env.NODE_ENV === 'production') {
      // Serve built React app
      const distPath = join(__dirname, '../dist');
      this.app.use(express.static(distPath));
      
      // Handle React Router (serve index.html for all non-API routes)
      this.app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
          res.sendFile(join(distPath, 'index.html'));
        }
      });
    } else {
      // Development: serve the old HTML for now
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

    // Error handling
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    });
  }

  async createTask(req, res) {
    try {
      const { title, description, todos = [] } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const task = await this.taskService.createTask({
        title,
        description,
        todos
      });

      // Broadcast task creation event
      this.broadcast({
        type: 'task_created',
        task: task,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task', message: error.message });
    }
  }

  async getTask(req, res) {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error getting task:', error);
      res.status(500).json({ error: 'Failed to get task', message: error.message });
    }
  }

  async listTasks(req, res) {
    try {
      const { status, project_id } = req.query;
      const tasks = await this.taskService.listTasks({ status, project_id });
      res.json(tasks);
    } catch (error) {
      console.error('Error listing tasks:', error);
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

      // Broadcast task update event
      this.broadcast({
        type: 'task_updated',
        task: task,
        updates: updates,
        timestamp: new Date().toISOString()
      });

      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task', message: error.message });
    }
  }

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      // Get task before deletion for broadcast
      const taskToDelete = await this.taskService.getTask(id);
      
      const deleted = await this.taskService.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Broadcast task deletion event
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
    // Initialize database (run migrations)
    await this.db.initialize();
    
    this.server.listen(this.port, this.host, () => {
      console.log(`Task Management Service running on http://${this.host}:${this.port}`);
      console.log(`WebSocket server running on ws://${this.host}:${this.port}`);
      console.log(`Database: ${this.db.dbPath}`);
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

// Start server if run directly
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