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


