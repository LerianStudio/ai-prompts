export interface TaskCreateRequest {
  title: string
  description?: string
  todos?: string[]
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface TodoCompleteRequest {
  todoContent: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  todos: Todo[]
}

export interface Todo {
  id: string
  task_id: string
  content: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  todos?: string[]
}
