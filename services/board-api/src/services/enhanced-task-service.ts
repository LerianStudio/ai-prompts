/**
 * Enhanced Task Service with async operations, connection pooling, and comprehensive error handling
 */

import Database from 'better-sqlite3';
import { Task, CreateTaskParams, UpdateTaskParams, ListTasksParams, DeleteTaskParams, TaskServiceError } from '../../board-mcp/src/types.js';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

interface DatabaseOptions {
  filename: string;
  readonly?: boolean;
  fileMustExist?: boolean;
  timeout?: number;
  verbose?: (message: string) => void;
}

/**
 * Enhanced Task Service with proper async operations and error handling
 */
export class EnhancedTaskService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private readonly: boolean;
  private isInitialized: boolean = false;

  // Prepared statements for performance
  private statements: {
    createTask?: Database.Statement;
    updateTask?: Database.Statement;
    deleteTask?: Database.Statement;
    getTask?: Database.Statement;
    listTasks?: Database.Statement;
    countTasks?: Database.Statement;
  } = {};

  constructor(dbPath?: string, readonly: boolean = false) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'kanban.db');
    this.readonly = readonly;
  }

  /**
   * Initialize the database and prepare statements
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Database options
      const options: DatabaseOptions = {
        filename: this.dbPath,
        readonly: this.readonly,
        timeout: 30000,
        verbose: process.env.NODE_ENV === 'development' ? 
          (message: string) => console.error(`[DB] ${message}`) : undefined
      };

      this.db = new Database(this.dbPath, options);

      // Configure database
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');
      this.db.pragma('temp_store = memory');
      this.db.pragma('foreign_keys = ON');

      // Create tables if not readonly
      if (!this.readonly) {
        await this.createTables();
      }

      // Prepare statements
      this.prepareStatements();

      this.isInitialized = true;
      console.error('[TaskService] Database initialized successfully');

    } catch (error) {
      console.error('[TaskService] Failed to initialize database:', error);
      throw new TaskServiceError({
        code: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize database',
        details: error
      });
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT chk_status CHECK (status IN ('todo', 'in-progress', 'done')),
        CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high'))
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
    `;

    try {
      this.db.exec(createTableSQL);
      this.db.exec(createIndexSQL);
    } catch (error) {
      throw new TaskServiceError({
        code: 'TABLE_CREATION_FAILED',
        message: 'Failed to create database tables',
        details: error
      });
    }
  }

  /**
   * Prepare SQL statements for better performance
   */
  private prepareStatements(): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.statements.createTask = this.db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      this.statements.updateTask = this.db.prepare(`
        UPDATE tasks 
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            status = COALESCE(?, status),
            priority = COALESCE(?, priority),
            updated_at = ?
        WHERE id = ?
      `);

      this.statements.deleteTask = this.db.prepare(`
        DELETE FROM tasks WHERE id = ?
      `);

      this.statements.getTask = this.db.prepare(`
        SELECT * FROM tasks WHERE id = ?
      `);

      // Dynamic query building for list tasks will be handled in the method
      this.statements.countTasks = this.db.prepare(`
        SELECT COUNT(*) as count FROM tasks
      `);

    } catch (error) {
      throw new TaskServiceError({
        code: 'STATEMENT_PREPARATION_FAILED',
        message: 'Failed to prepare SQL statements',
        details: error
      });
    }
  }

  /**
   * Create a new task
   */
  async createTask(params: CreateTaskParams): Promise<Task> {
    await this.ensureInitialized();
    
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = params.status || 'todo';
    const priority = params.priority || 'medium';

    try {
      // Check for duplicate titles
      const existing = this.db!.prepare('SELECT id FROM tasks WHERE title = ?').get(params.title);
      if (existing) {
        throw new TaskServiceError({
          code: 'TASK_ALREADY_EXISTS',
          message: 'A task with this title already exists',
          details: { title: params.title, existingId: existing.id }
        });
      }

      const info = this.statements.createTask!.run(
        id, 
        params.title, 
        params.description || null, 
        status, 
        priority, 
        now, 
        now
      );

      if (info.changes === 0) {
        throw new TaskServiceError({
          code: 'CREATE_FAILED',
          message: 'Failed to create task',
          details: { params }
        });
      }

      const task = this.statements.getTask!.get(id) as Task;
      if (!task) {
        throw new TaskServiceError({
          code: 'CREATE_VERIFICATION_FAILED',
          message: 'Task created but could not be retrieved',
          details: { id }
        });
      }

      console.error(`[TaskService] Created task: ${id}`);
      return task;

    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      
      console.error('[TaskService] Create task error:', error);
      throw new TaskServiceError({
        code: 'CREATE_ERROR',
        message: 'Unexpected error creating task',
        details: error
      });
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(params: UpdateTaskParams): Promise<Task> {
    await this.ensureInitialized();
    
    const now = new Date().toISOString();

    try {
      // Check if task exists
      const existing = this.statements.getTask!.get(params.id) as Task;
      if (!existing) {
        throw new TaskServiceError({
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
          details: { id: params.id }
        });
      }

      // Check for duplicate titles if title is being updated
      if (params.title && params.title !== existing.title) {
        const duplicate = this.db!.prepare('SELECT id FROM tasks WHERE title = ? AND id != ?')
          .get(params.title, params.id);
        if (duplicate) {
          throw new TaskServiceError({
            code: 'TASK_TITLE_EXISTS',
            message: 'A task with this title already exists',
            details: { title: params.title, existingId: duplicate.id }
          });
        }
      }

      const info = this.statements.updateTask!.run(
        params.title || null,
        params.description !== undefined ? params.description : null,
        params.status || null,
        params.priority || null,
        now,
        params.id
      );

      if (info.changes === 0) {
        throw new TaskServiceError({
          code: 'UPDATE_FAILED',
          message: 'No changes made to task',
          details: { id: params.id, params }
        });
      }

      const task = this.statements.getTask!.get(params.id) as Task;
      if (!task) {
        throw new TaskServiceError({
          code: 'UPDATE_VERIFICATION_FAILED',
          message: 'Task updated but could not be retrieved',
          details: { id: params.id }
        });
      }

      console.error(`[TaskService] Updated task: ${params.id}`);
      return task;

    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      
      console.error('[TaskService] Update task error:', error);
      throw new TaskServiceError({
        code: 'UPDATE_ERROR',
        message: 'Unexpected error updating task',
        details: error
      });
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(params: DeleteTaskParams): Promise<{ success: boolean }> {
    await this.ensureInitialized();

    try {
      // Check if task exists
      const existing = this.statements.getTask!.get(params.id) as Task;
      if (!existing) {
        throw new TaskServiceError({
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
          details: { id: params.id }
        });
      }

      const info = this.statements.deleteTask!.run(params.id);

      if (info.changes === 0) {
        throw new TaskServiceError({
          code: 'DELETE_FAILED',
          message: 'Failed to delete task',
          details: { id: params.id }
        });
      }

      console.error(`[TaskService] Deleted task: ${params.id}`);
      return { success: true };

    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      
      console.error('[TaskService] Delete task error:', error);
      throw new TaskServiceError({
        code: 'DELETE_ERROR',
        message: 'Unexpected error deleting task',
        details: error
      });
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    await this.ensureInitialized();

    try {
      const task = this.statements.getTask!.get(id) as Task;
      
      if (!task) {
        throw new TaskServiceError({
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
          details: { id }
        });
      }

      return task;

    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error;
      }
      
      console.error('[TaskService] Get task error:', error);
      throw new TaskServiceError({
        code: 'GET_ERROR',
        message: 'Unexpected error retrieving task',
        details: error
      });
    }
  }

  /**
   * List tasks with optional filtering and pagination
   */
  async listTasks(params: ListTasksParams = {}): Promise<{
    tasks: Task[];
    total: number;
    offset: number;
    limit: number;
  }> {
    await this.ensureInitialized();

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    try {
      // Build dynamic query
      let whereClause = '';
      let queryParams: any[] = [];
      
      if (params.status) {
        whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?';
        queryParams.push(params.status);
      }
      
      if (params.priority) {
        whereClause += whereClause ? ' AND priority = ?' : ' WHERE priority = ?';
        queryParams.push(params.priority);
      }

      // Count total matching tasks
      const countQuery = `SELECT COUNT(*) as count FROM tasks${whereClause}`;
      const countResult = this.db!.prepare(countQuery).get(...queryParams) as { count: number };
      const total = countResult.count;

      // Get paginated tasks
      const tasksQuery = `
        SELECT * FROM tasks${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const tasks = this.db!.prepare(tasksQuery).all(...queryParams, limit, offset) as Task[];

      console.error(`[TaskService] Listed ${tasks.length} of ${total} tasks`);

      return {
        tasks,
        total,
        offset,
        limit
      };

    } catch (error) {
      console.error('[TaskService] List tasks error:', error);
      throw new TaskServiceError({
        code: 'LIST_ERROR',
        message: 'Unexpected error listing tasks',
        details: error
      });
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalTasks: number;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
  }> {
    await this.ensureInitialized();

    try {
      const totalResult = this.statements.countTasks!.get() as { count: number };
      const total = totalResult.count;

      const statusStats = this.db!.prepare(`
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
      `).all() as { status: string; count: number }[];

      const priorityStats = this.db!.prepare(`
        SELECT priority, COUNT(*) as count 
        FROM tasks 
        GROUP BY priority
      `).all() as { priority: string; count: number }[];

      return {
        totalTasks: total,
        tasksByStatus: statusStats.reduce((acc, { status, count }) => {
          acc[status] = count;
          return acc;
        }, {} as Record<string, number>),
        tasksByPriority: priorityStats.reduce((acc, { priority, count }) => {
          acc[priority] = count;
          return acc;
        }, {} as Record<string, number>)
      };

    } catch (error) {
      console.error('[TaskService] Get stats error:', error);
      throw new TaskServiceError({
        code: 'STATS_ERROR',
        message: 'Unexpected error getting statistics',
        details: error
      });
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
        this.isInitialized = false;
        console.error('[TaskService] Database connection closed');
      }
    } catch (error) {
      console.error('[TaskService] Error closing database:', error);
    }
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

export default EnhancedTaskService;