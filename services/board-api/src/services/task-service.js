import { randomUUID } from 'crypto';
import { mapTodoForFrontend, mapTaskForFrontend } from '../utils/field-mapping.js';

export class TaskService {
  constructor(databaseManager) {
    this.dbManager = databaseManager;
  }

  async createTask({ title, description, todos = [], agent_prompt, agent_type }) {
    const taskId = randomUUID();
    const now = new Date().toISOString();

    return this.dbManager.transaction(async () => {
      await this.dbManager.run(`
        INSERT INTO tasks (id, title, description, status, agent_prompt, agent_type, execution_status, created_at, updated_at)
        VALUES ($1, $2, $3, 'pending', $4, $5, 'none', $6, $7)
      `, [taskId, title, description, agent_prompt, agent_type, now, now]);

      if (todos.length > 0) {
        for (let index = 0; index < todos.length; index++) {
          const todoId = randomUUID();
          const content = typeof todos[index] === 'string' ? todos[index] : todos[index].content;
          await this.dbManager.run(`
            INSERT INTO todos (id, task_id, content, status, sort_order, created_at, updated_at)
            VALUES ($1, $2, $3, 'pending', $4, $5, $6)
          `, [todoId, taskId, content, index, now, now]);
        }
      }

      return this.getTask(taskId);
    });
  }

  async getTask(taskId) {
    const task = await this.dbManager.get(`
      SELECT * FROM tasks WHERE id = $1
    `, [taskId]);

    if (!task) {
      return null;
    }

    const todos = await this.dbManager.all(`
      SELECT * FROM todos WHERE task_id = $1 ORDER BY sort_order
    `, [taskId]);

    return mapTaskForFrontend(task, todos);
  }

  async listTasks(filters = {}) {
    let query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        t.created_at,
        t.updated_at,
        t.agent_prompt,
        t.agent_type,
        t.execution_status,
        t.execution_log,
        t.execution_started_at,
        t.execution_completed_at,
        td.id as todo_id,
        td.content as todo_content,
        td.status as todo_status,
        td.sort_order as todo_sort_order,
        td.created_at as todo_created_at,
        td.updated_at as todo_updated_at
      FROM tasks t
      LEFT JOIN todos td ON t.id = td.task_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND t.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.project_id) {
      query += ` AND t.project_id = $${params.length + 1}`;
      params.push(filters.project_id);
    }

    query += ' ORDER BY t.created_at DESC, td.sort_order ASC';

    const rows = await this.dbManager.all(query, params);

    if (rows.length === 0) {
      return [];
    }

    const tasksMap = new Map();
    
    for (const row of rows) {
      const taskId = row.id;
      
      if (!tasksMap.has(taskId)) {
        const task = {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          project_id: row.project_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          agent_prompt: row.agent_prompt,
          agent_type: row.agent_type,
          execution_status: row.execution_status,
          execution_log: row.execution_log,
          execution_started_at: row.execution_started_at,
          execution_completed_at: row.execution_completed_at
        };
        tasksMap.set(taskId, task);
      }
      
      if (row.todo_id) {
        const task = tasksMap.get(taskId);
        if (!task.todos) {
          task.todos = [];
        }
        task.todos.push({
          id: row.todo_id,
          task_id: taskId,
          content: row.todo_content,
          status: row.todo_status,
          sort_order: row.todo_sort_order,
          created_at: row.todo_created_at,
          updated_at: row.todo_updated_at
        });
      }
    }

    const tasksWithTodos = Array.from(tasksMap.values()).map(task => {
      const todos = task.todos || [];
      delete task.todos;
      return mapTaskForFrontend(task, todos);
    });

    return tasksWithTodos;
  }

  async updateTask(taskId, updates) {
    const now = new Date().toISOString();
    
    if (updates.todos) {
      const todos = updates.todos;
      
      return this.dbManager.transaction(async () => {
        for (const todo of todos) {
          if (todo.id) {
            const newStatus = todo.completed ? 'completed' : 'pending';
            await this.dbManager.run(`
              UPDATE todos
              SET status = $1, updated_at = $2
              WHERE id = $3 AND task_id = $4
            `, [newStatus, now, todo.id, taskId]);
          }
        }

        const pendingTodos = await this.dbManager.get(`
          SELECT COUNT(*) as count FROM todos
          WHERE task_id = $1 AND status = 'pending'
        `, [taskId]);

        const completedTodos = await this.dbManager.get(`
          SELECT COUNT(*) as count FROM todos
          WHERE task_id = $1 AND status = 'completed'
        `, [taskId]);

        if (pendingTodos.count === 0 && completedTodos.count > 0) {
          await this.dbManager.run(`
            UPDATE tasks
            SET status = 'completed', updated_at = $1
            WHERE id = $2
          `, [now, taskId]);
        } else if (completedTodos.count > 0 && pendingTodos.count > 0) {
          await this.dbManager.run(`
            UPDATE tasks
            SET status = 'in_progress', updated_at = $1
            WHERE id = $2 AND status = 'pending'
          `, [now, taskId]);
        }

        return this.getTask(taskId);
      });
    }

    const allowedUpdates = ['title', 'description', 'status', 'execution_status', 'execution_log', 'execution_started_at', 'execution_completed_at'];
    const updateFields = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${params.length + 1}`);
        params.push(value);
      }
    }

    if (updateFields.length === 0) {
      return this.getTask(taskId);
    }

    updateFields.push(`updated_at = $${params.length + 1}`);
    params.push(now);
    params.push(taskId);

    const query = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${params.length}
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
      SET status = $1, updated_at = $2
      WHERE id = $3 AND task_id = $4
    `, [newStatus, now, todoId, taskId]);

    if (result.changes === 0) {
      return null;
    }

    if (completed) {
      const pendingTodos = await this.dbManager.get(`
        SELECT COUNT(*) as count FROM todos
        WHERE task_id = $1 AND status = 'pending'
      `, [taskId]);

      if (pendingTodos.count === 0) {
        await this.updateTask(taskId, { status: 'completed' });
      }
    } else {
      const task = await this.dbManager.get(`
        SELECT status FROM tasks WHERE id = $1
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
      SET status = 'completed', updated_at = $1
      WHERE id = $2 AND task_id = $3
    `, [now, todoId, taskId]);

    if (result.changes === 0) {
      return null;
    }

    const pendingTodos = await this.dbManager.get(`
      SELECT COUNT(*) as count FROM todos
      WHERE task_id = $1 AND status = 'pending'
    `, [taskId]);

    if (pendingTodos.count === 0) {
      await this.updateTask(taskId, { status: 'completed' });
    }

    return this.getTask(taskId);
  }

  async completeTodoByContent(taskId, todoContent) {
    const todo = await this.dbManager.get(`
      SELECT id FROM todos
      WHERE task_id = $1 AND content = $2 AND status = 'pending'
      ORDER BY sort_order
      LIMIT 1
    `, [taskId, todoContent]);

    if (!todo) {
      throw new Error(`Todo with content "${todoContent}" not found or already completed`);
    }

    return this.completeTodo(taskId, todo.id);
  }

  async deleteTask(taskId) {
    return this.dbManager.transaction(async () => {
      await this.dbManager.run(`
        DELETE FROM todos WHERE task_id = $1
      `, [taskId]);

      const result = await this.dbManager.run(`
        DELETE FROM tasks WHERE id = $1
      `, [taskId]);

      if (result.changes === 0) {
        return null;
      }

      return { success: true, deletedId: taskId };
    });
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