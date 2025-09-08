import fetch from 'node-fetch';
import { NetworkError, ValidationError, NotFoundError, RateLimitError, convertToJsonRpcError } from './utils/jsonrpc-errors.js';
import { getServiceConfig } from '../../../shared/lib/config.js';

export class TaskManagerTool {
  constructor(baseUrl) {
    if (!baseUrl) {
      const config = getServiceConfig('board-mcp');
      baseUrl = config.serviceUrl;
    }
    this.baseUrl = this.validateAndSanitizeUrl(baseUrl);
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.rateLimitThreshold = 100;
  }

  validateAndSanitizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new ValidationError('protocol', 'Only HTTP and HTTPS protocols are allowed', parsedUrl.protocol);
      }
      return parsedUrl.toString().replace(/\/+$/, '');
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError('baseUrl', `Invalid base URL: ${error.message}`, url);
    }
  }

  checkRateLimit() {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    if (this.lastRequestTime < minuteAgo) {
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.rateLimitThreshold) {
      throw new RateLimitError(this.rateLimitThreshold, '1 minute', 60);
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }

  /**
   * Validate and clean input strings with minimal sanitization
   * Only removes actual security threats while preserving legitimate content
   */
  validateAndCleanString(input, maxLength = 1000, fieldName = 'input') {
    if (typeof input !== 'string') {
      throw new ValidationError(fieldName, 'Input must be a string', typeof input);
    }
    
    // Only remove control characters that pose security risks
    // Preserve legitimate punctuation, quotes, and special characters
    let cleaned = input
      // Remove only dangerous control characters (keep newlines and tabs for formatting)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize Unicode to prevent bypass attempts
      .normalize('NFC')
      // Clean up excessive whitespace but preserve intentional formatting
      .replace(/\s{3,}/g, '  ') // Reduce 3+ spaces to 2
      .trim();

    // Check for dangerous script injection patterns (more targeted)
    if (this.containsScriptInjection(cleaned)) {
      throw new ValidationError(fieldName, 'Input contains potentially dangerous script patterns', cleaned.substring(0, 50));
    }
    
    if (cleaned.length === 0) {
      throw new ValidationError(fieldName, 'Input cannot be empty after cleaning', input.substring(0, 50));
    }
    
    if (cleaned.length > maxLength) {
      throw new ValidationError(fieldName, `Input exceeds maximum length of ${maxLength} characters`, cleaned.length);
    }
    
    return cleaned;
  }

  /**
   * Check for script injection patterns that could be dangerous in web contexts
   * More targeted than previous implementation to avoid false positives
   */
  containsScriptInjection(input) {
    const dangerousPatterns = [
      // Script protocols
      /javascript\s*:/i,
      /data\s*:\s*text\/html/i,
      /vbscript\s*:/i,
      
      // Direct script execution patterns
      /<script[\s>]/i,
      /<\/script>/i,
      
      // Event handlers only when they appear to be HTML attributes
      /on\w+\s*=\s*["'][^"']*["']/i,
      
      // Function calls that are commonly used in XSS
      /eval\s*\([^)]*["'].*["']/i, // eval with string literals
      /setTimeout\s*\([^)]*["'].*["']/i, // setTimeout with string literals
      /setInterval\s*\([^)]*["'].*["']/i, // setInterval with string literals
      
      // HTML/XML entities that might be used to bypass filters
      /&\s*#\s*x?\d+\s*;/i,
      
      // CSS expression (old IE vulnerability)
      /expression\s*\(/i,
      
      // Import statements that could load malicious content
      /@import\s+["']?javascript:/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

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
      timeout: 30000
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
      if (!title) {
        throw new Error('Task title is required');
      }
      
      const validatedTitle = this.validateAndCleanString(title, 200, 'title');
      const validatedDescription = description ? this.validateAndCleanString(description, 1000, 'description') : '';
      
      if (!Array.isArray(todos)) {
        throw new Error('Todos must be an array');
      }
      
      if (todos.length > 50) {
        throw new Error('Maximum of 50 todo items allowed');
      }
      
      const validatedTodos = todos.map((todo, index) => {
        if (typeof todo !== 'string') {
          throw new Error(`Todo item at index ${index} must be a string`);
        }
        return this.validateAndCleanString(todo, 500, `todo[${index}]`);
      });

      const response = await this.secureFetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: validatedTitle,
          description: validatedDescription,
          todos: validatedTodos
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
        message: `Created task "${validatedTitle}" with ${validatedTodos.length} todos`
      };
    } catch (error) {
      console.error('CreateTask error:', error.message);
      const jsonRpcError = convertToJsonRpcError(error, 'createTask');
      return {
        success: false,
        error: jsonRpcError,
        message: `Failed to create task: ${jsonRpcError.message}`
      };
    }
  }

  async getTask(taskId) {
    try {
      const validatedTaskId = this.validateTaskId(taskId);

      const response = await this.secureFetch(`${this.baseUrl}/api/tasks/${validatedTaskId}`);
      
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

      const response = await this.secureFetch(`${this.baseUrl}/api/tasks/${validatedTaskId}`, {
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
      const validatedTodoContent = this.validateAndCleanString(todoContent, 500, 'todoContent');

      // First get the task to find the todo ID by content
      const taskResponse = await this.getTask(validatedTaskId);
      if (!taskResponse.success) {
        return taskResponse;
      }

      const task = taskResponse.task;
      const todo = task.todos.find(t => t.content === validatedTodoContent && t.status === 'pending');
      
      if (!todo) {
        throw new Error(`Todo item "${validatedTodoContent}" not found or already completed`);
      }

      const response = await this.secureFetch(`${this.baseUrl}/api/tasks/${validatedTaskId}/todos/${todo.id}/complete`, {
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
        message: `Completed todo "${validatedTodoContent}" for task "${updatedTask.title}"`
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

      const url = `${this.baseUrl}/api/tasks${params.toString() ? '?' + params.toString() : ''}`;
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

  async deleteTask(taskId) {
    try {
      // Input validation
      const validatedTaskId = this.validateTaskId(taskId);

      // Get task info before deletion for confirmation message
      const taskResponse = await this.getTask(validatedTaskId);
      const taskTitle = taskResponse.success ? taskResponse.task.title : validatedTaskId;

      const response = await this.secureFetch(`${this.baseUrl}/api/tasks/${validatedTaskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Task with ID ${validatedTaskId} not found`);
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return {
        success: true,
        task_id: validatedTaskId,
        message: `Deleted task "${taskTitle}"`
      };
    } catch (error) {
      console.error('DeleteTask error:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: -32007,
        message: `Failed to delete task: ${error.message}`
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