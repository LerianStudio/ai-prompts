import { randomUUID } from 'crypto';

export class TaskService {
  constructor(databaseManager) {
    this.dbManager = databaseManager;
  }

  async createTask({ title, description, todos = [] }) {
    const taskId = randomUUID();
    const now = new Date().toISOString();

    return this.dbManager.transaction(async () => {
      // Create task
      await this.dbManager.run(`
        INSERT INTO tasks (id, title, description, status, created_at, updated_at)
        VALUES (?, ?, ?, 'pending', ?, ?)
      `, [taskId, title, description, now, now]);

      // Create todos
      if (todos.length > 0) {
        for (let index = 0; index < todos.length; index++) {
          const todoId = randomUUID();
          const content = typeof todos[index] === 'string' ? todos[index] : todos[index].content;
          await this.dbManager.run(`
            INSERT INTO todos (id, task_id, content, status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', ?, ?, ?)
          `, [todoId, taskId, content, index, now, now]);
        }
      }

      // Return created task with todos
      return this.getTask(taskId);
    });
  }

  async getTask(taskId) {
    const task = await this.dbManager.get(`
      SELECT * FROM tasks WHERE id = ?
    `, [taskId]);

    if (!task) {
      return null;
    }

    const todos = await this.dbManager.all(`
      SELECT * FROM todos WHERE task_id = ? ORDER BY sort_order
    `, [taskId]);

    // Map database 'content' field to frontend expected 'text' field
    const mappedTodos = todos.map(todo => ({
      id: todo.id,
      text: todo.content,
      completed: todo.status === 'completed'
    }));

    return {
      ...task,
      todos: mappedTodos
    };
  }

  async listTasks(filters = {}) {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.project_id) {
      query += ' AND project_id = ?';
      params.push(filters.project_id);
    }

    query += ' ORDER BY created_at DESC';

    const tasks = await this.dbManager.all(query, params);

    // Get todos for each task
    const tasksWithTodos = [];
    for (const task of tasks) {
      const todos = await this.dbManager.all(`
        SELECT * FROM todos WHERE task_id = ? ORDER BY sort_order
      `, [task.id]);
      
      // Map database 'content' field to frontend expected 'text' field
      const mappedTodos = todos.map(todo => ({
        id: todo.id,
        text: todo.content,
        completed: todo.status === 'completed'
      }));
      
      tasksWithTodos.push({ ...task, todos: mappedTodos });
    }

    return tasksWithTodos;
  }

  async updateTask(taskId, updates) {
    const now = new Date().toISOString();
    
    // Handle todos update separately
    if (updates.todos) {
      const todos = updates.todos;
      
      return this.dbManager.transaction(async () => {
        // Update each todo
        for (const todo of todos) {
          if (todo.id) {
            const newStatus = todo.completed ? 'completed' : 'pending';
            await this.dbManager.run(`
              UPDATE todos 
              SET status = ?, updated_at = ?
              WHERE id = ? AND task_id = ?
            `, [newStatus, now, todo.id, taskId]);
          }
        }

        // Check if all todos are completed and update task status accordingly
        const pendingTodos = await this.dbManager.get(`
          SELECT COUNT(*) as count FROM todos 
          WHERE task_id = ? AND status = 'pending'
        `, [taskId]);

        const completedTodos = await this.dbManager.get(`
          SELECT COUNT(*) as count FROM todos 
          WHERE task_id = ? AND status = 'completed'
        `, [taskId]);

        // Update task status based on todo completion
        if (pendingTodos.count === 0 && completedTodos.count > 0) {
          // All todos are completed
          await this.dbManager.run(`
            UPDATE tasks 
            SET status = 'completed', updated_at = ?
            WHERE id = ?
          `, [now, taskId]);
        } else if (completedTodos.count > 0 && pendingTodos.count > 0) {
          // Some todos completed, task should be in progress
          await this.dbManager.run(`
            UPDATE tasks 
            SET status = 'in_progress', updated_at = ?
            WHERE id = ? AND status = 'pending'
          `, [now, taskId]);
        }

        return this.getTask(taskId);
      });
    }

    // Handle regular task field updates
    const allowedUpdates = ['title', 'description', 'status'];
    const updateFields = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updateFields.length === 0) {
      return this.getTask(taskId);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = ?');
    params.push(now);
    params.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    const result = await this.dbManager.run(query, params);

    if (result.changes === 0) {
      return null;
    }

    return this.getTask(taskId);
  }

  async updateTodo(taskId, todoId, updates) {
    const now = new Date().toISOString();
    const { completed } = updates;

    if (completed === undefined) {
      return this.getTask(taskId);
    }

    const newStatus = completed ? 'completed' : 'pending';

    const result = await this.dbManager.run(`
      UPDATE todos 
      SET status = ?, updated_at = ?
      WHERE id = ? AND task_id = ?
    `, [newStatus, now, todoId, taskId]);

    if (result.changes === 0) {
      return null;
    }

    // Check if all todos are completed and update task status
    if (completed) {
      const pendingTodos = await this.dbManager.get(`
        SELECT COUNT(*) as count FROM todos 
        WHERE task_id = ? AND status = 'pending'
      `, [taskId]);

      if (pendingTodos.count === 0) {
        await this.updateTask(taskId, { status: 'completed' });
      }
    } else {
      // If todo is marked as not completed, ensure task isn't marked as completed
      const task = await this.dbManager.get(`
        SELECT status FROM tasks WHERE id = ?
      `, [taskId]);
      
      if (task && task.status === 'completed') {
        await this.updateTask(taskId, { status: 'in_progress' });
      }
    }

    return this.getTask(taskId);
  }

  async completeTodo(taskId, todoId) {
    const now = new Date().toISOString();

    const result = await this.dbManager.run(`
      UPDATE todos 
      SET status = 'completed', updated_at = ?
      WHERE id = ? AND task_id = ?
    `, [now, todoId, taskId]);

    if (result.changes === 0) {
      return null;
    }

    // Check if all todos are completed and update task status
    const pendingTodos = await this.dbManager.get(`
      SELECT COUNT(*) as count FROM todos 
      WHERE task_id = ? AND status = 'pending'
    `, [taskId]);

    if (pendingTodos.count === 0) {
      await this.updateTask(taskId, { status: 'completed' });
    }

    return this.getTask(taskId);
  }

  async completeTodoByContent(taskId, todoContent) {
    const todo = await this.dbManager.get(`
      SELECT id FROM todos 
      WHERE task_id = ? AND content = ? AND status = 'pending'
      ORDER BY sort_order
      LIMIT 1
    `, [taskId, todoContent]);

    if (!todo) {
      throw new Error(`Todo with content "${todoContent}" not found or already completed`);
    }

    return this.completeTodo(taskId, todo.id);
  }

  async getTaskStats() {
    const stats = await this.dbManager.all(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks 
      GROUP BY status
    `);

    const todoStats = await this.dbManager.all(`
      SELECT 
        status,
        COUNT(*) as count
      FROM todos 
      GROUP BY status  
    `);

    return {
      tasks: stats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {}),
      todos: todoStats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {})
    };
  }
}