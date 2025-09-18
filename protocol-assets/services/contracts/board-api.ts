export interface TaskCreateRequest {
  title: string
  description?: string
  todos?: string[]
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  agent_prompt?: string
  agent_type?: 'claude-code'
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
  agent_prompt?: string
  agent_type?: 'claude-code'
  execution_status: 'none' | 'queued' | 'running' | 'completed' | 'failed'
  execution_log?: string
  execution_started_at?: string
  execution_completed_at?: string
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
  agent_prompt?: string
  agent_type?: 'claude-code'
}

export interface ExecuteAgentRequest {
  agent_prompt?: string
}

export interface ExecutionStatusResponse {
  execution_status: 'none' | 'queued' | 'running' | 'completed' | 'failed'
  execution_log?: string
  execution_started_at?: string
  execution_completed_at?: string
}
