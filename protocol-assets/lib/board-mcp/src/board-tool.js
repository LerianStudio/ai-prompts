import fetch from 'node-fetch';

export class TaskManagerTool {
  constructor(baseUrl = 'http://localhost:3020') {
    this.baseUrl = this.validateAndSanitizeUrl(baseUrl);
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.rateLimitThreshold = 100; // requests per minute
  }

  /**
   * Validate and sanitize base URL
   */
  validateAndSanitizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
      }
      return parsedUrl.toString().replace(/\/+$/, ''); // Remove trailing slashes
    } catch (error) {
      throw new Error(`Invalid base URL: ${error.message}`);
    }
  }

  /**
   * Rate limiting check
   */
  checkRateLimit() {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    if (this.lastRequestTime < minuteAgo) {
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.rateLimitThreshold) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }

  /**
   * Input sanitization for string values
   */
  sanitizeString(input, maxLength = 1000) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Basic sanitization - remove potentially harmful characters
    const sanitized = input
      .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
    
    if (sanitized.length > maxLength) {
      throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitized;
  }

  /**
   * Validate task ID format
   */
  validateTaskId(taskId) {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Task ID is required and must be a string');
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(taskId)) {
      throw new Error('Task ID contains invalid characters. Only alphanumeric, hyphen, and underscore are allowed');
    }
    
    if (taskId.length > 50) {
      throw new Error('Task ID exceeds maximum length of 50 characters');
    }
    
    return taskId;
  }

  /**
   * Enhanced fetch with error handling and security headers
   */
  async secureFetch(url, options = {}) {
    this.checkRateLimit();
    
    const defaultHeaders = {
      'User-Agent': 'Lerian-Board-MCP/1.0.0',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    };
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      timeout: 30000 // 30 second timeout
    };
    
    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error(`HTTP request failed for ${url}:`, error.message);
      throw new Error(`Network request failed: ${error.message}`);
    }
  }

  async createTask(title, description = '', todos = []) {
    try {
      // Input validation and sanitization
      if (!title) {
        throw new Error('Task title is required');
      }
      
      const sanitizedTitle = this.sanitizeString(title, 200);
      const sanitizedDescription = this.sanitizeString(description, 1000);
      
      if (!Array.isArray(todos)) {
        throw new Error('Todos must be an array');
      }
      
      if (todos.length > 50) {
        throw new Error('Maximum of 50 todo items allowed');
      }
      
      const sanitizedTodos = todos.map((todo, index) => {
        if (typeof todo !== 'string') {
          throw new Error(`Todo item at index ${index} must be a string`);
        }
        return this.sanitizeString(todo, 500);
      });

      const response = await this.secureFetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: sanitizedTitle,
          description: sanitizedDescription,
          todos: sanitizedTodos
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const task = await response.json();
      return {
        success: true,
        task_id: task.id,
        task: task,
        message: `Created task "${sanitizedTitle}" with ${sanitizedTodos.length} todos`
      };
    } catch (error) {
      console.error('CreateTask error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32001,
        message: `Failed to create task: ${error.message}`
      };
    }
  }

  async getTask(taskId) {
    try {
      // Input validation
      const validatedTaskId = this.validateTaskId(taskId);

      const response = await this.secureFetch(`${this.baseUrl}/tasks/${validatedTaskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${validatedTaskId} not found`);
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const task = await response.json();
      return {
        success: true,
        task: task,
        message: `Retrieved task "${task.title}" (${task.status})`
      };
    } catch (error) {
      console.error('GetTask error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32002,
        message: `Failed to get task: ${error.message}`
      };
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      // Input validation
      const validatedTaskId = this.validateTaskId(taskId);
      
      const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
      if (!status || !validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const response = await this.secureFetch(`${this.baseUrl}/tasks/${validatedTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${validatedTaskId} not found`);
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const task = await response.json();
      return {
        success: true,
        task: task,
        message: `Updated task "${task.title}" status to "${status}"`
      };
    } catch (error) {
      console.error('UpdateTaskStatus error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32003,
        message: `Failed to update task status: ${error.message}`
      };
    }
  }

  async completeTodoItem(taskId, todoContent) {
    try {
      // Input validation
      const validatedTaskId = this.validateTaskId(taskId);
      const sanitizedTodoContent = this.sanitizeString(todoContent, 500);

      // First get the task to find the todo ID by content
      const taskResponse = await this.getTask(validatedTaskId);
      if (!taskResponse.success) {
        return taskResponse;
      }

      const task = taskResponse.task;
      const todo = task.todos.find(t => t.content === sanitizedTodoContent && t.status === 'pending');
      
      if (!todo) {
        throw new Error(`Todo item "${sanitizedTodoContent}" not found or already completed`);
      }

      const response = await this.secureFetch(`${this.baseUrl}/tasks/${validatedTaskId}/todos/${todo.id}/complete`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updatedTask = await response.json();
      return {
        success: true,
        task: updatedTask,
        message: `Completed todo "${sanitizedTodoContent}" for task "${updatedTask.title}"`
      };
    } catch (error) {
      console.error('CompleteTodoItem error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32004,
        message: `Failed to complete todo: ${error.message}`
      };
    }
  }

  async listTasks(filters = {}) {
    try {
      // Input validation for filters
      if (filters && typeof filters !== 'object') {
        throw new Error('Filters must be an object');
      }

      const params = new URLSearchParams();
      
      if (filters.status) {
        const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
        if (!validStatuses.includes(filters.status)) {
          throw new Error(`Invalid status filter. Must be one of: ${validStatuses.join(', ')}`);
        }
        params.append('status', filters.status);
      }
      
      if (filters.project_id) {
        const validatedProjectId = this.validateTaskId(filters.project_id);
        params.append('project_id', validatedProjectId);
      }

      const url = `${this.baseUrl}/tasks${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.secureFetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const tasks = await response.json();
      return {
        success: true,
        tasks: tasks,
        count: tasks.length,
        filters: filters,
        message: `Found ${tasks.length} tasks`
      };
    } catch (error) {
      console.error('ListTasks error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32005,
        message: `Failed to list tasks: ${error.message}`
      };
    }
  }

  // Utility method for health checking the service
  async healthCheck() {
    try {
      const response = await this.secureFetch(`${this.baseUrl}/health`);
      
      let health;
      try {
        health = await response.json();
      } catch (jsonError) {
        // Handle cases where health endpoint doesn't return JSON
        health = {
          status: response.ok ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: response.ok,
        health,
        status_code: response.status,
        message: response.ok ? 'Service is healthy' : 'Service is unhealthy'
      };
    } catch (error) {
      console.error('HealthCheck error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32006,
        message: `Health check failed: ${error.message}`
      };
    }
  }
}