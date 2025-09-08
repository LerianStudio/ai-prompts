/**
 * Field mapping utilities to standardize data structures
 * between database, API, and frontend layers
 */

/**
 * Maps database todo structure to frontend expected format
 * Database: { id, task_id, content, status, sort_order, created_at, updated_at }
 * Frontend: { id, text, completed }
 */
export function mapTodoForFrontend(dbTodo) {
  if (!dbTodo) return null;
  
  return {
    id: dbTodo.id,
    text: dbTodo.content,  // Database 'content' -> Frontend 'text'
    completed: dbTodo.status === 'completed'
  };
}

/**
 * Maps frontend todo structure to database format
 * Frontend: { id, text, completed }
 * Database: { id, content, status }
 */
export function mapTodoForDatabase(frontendTodo) {
  if (!frontendTodo) return null;
  
  return {
    id: frontendTodo.id,
    content: frontendTodo.text,  // Frontend 'text' -> Database 'content'
    status: frontendTodo.completed ? 'completed' : 'pending'
  };
}

/**
 * Maps database task structure with todos for frontend
 */
export function mapTaskForFrontend(dbTask, dbTodos = []) {
  if (!dbTask) return null;
  
  const mappedTodos = dbTodos.map(mapTodoForFrontend);
  
  return {
    ...dbTask,
    todos: mappedTodos
  };
}

/**
 * Maps array of database todos for frontend consumption
 */
export function mapTodosForFrontend(dbTodos) {
  if (!Array.isArray(dbTodos)) return [];
  return dbTodos.map(mapTodoForFrontend);
}

/**
 * Maps array of frontend todos for database operations
 */
export function mapTodosForDatabase(frontendTodos) {
  if (!Array.isArray(frontendTodos)) return [];
  return frontendTodos.map(mapTodoForDatabase);
}

/**
 * Legacy field mapping for backward compatibility
 * Handles both old and new field names
 */
export function normalizeTask(task) {
  if (!task) return null;
  
  // Handle todos with either 'text' or 'content' field
  if (task.todos && Array.isArray(task.todos)) {
    task.todos = task.todos.map(todo => {
      // If has 'content' but missing 'text', map it
      if (todo.content && !todo.text) {
        return { ...todo, text: todo.content };
      }
      // If has 'text' but missing 'content', map it
      if (todo.text && !todo.content) {
        return { ...todo, content: todo.text };
      }
      return todo;
    });
  }
  
  return task;
}

/**
 * Validates that a todo object has the required fields for frontend
 */
export function validateTodoForFrontend(todo) {
  if (!todo || typeof todo !== 'object') {
    return { valid: false, error: 'Todo must be an object' };
  }
  
  if (!todo.id) {
    return { valid: false, error: 'Todo must have an id' };
  }
  
  if (!todo.text && !todo.content) {
    return { valid: false, error: 'Todo must have text or content field' };
  }
  
  if (typeof todo.completed !== 'boolean' && !todo.status) {
    return { valid: false, error: 'Todo must have completed boolean or status field' };
  }
  
  return { valid: true };
}

/**
 * Migration helper: detects if data uses old or new field names
 */
export function detectFieldFormat(data) {
  if (!data) return 'unknown';
  
  if (Array.isArray(data)) {
    if (data.length === 0) return 'unknown';
    return detectFieldFormat(data[0]);
  }
  
  if (data.todos && Array.isArray(data.todos) && data.todos.length > 0) {
    return detectFieldFormat(data.todos[0]);
  }
  
  if (data.content && !data.text) return 'database';
  if (data.text && !data.content) return 'frontend';
  if (data.content && data.text) return 'mixed';
  
  return 'unknown';
}