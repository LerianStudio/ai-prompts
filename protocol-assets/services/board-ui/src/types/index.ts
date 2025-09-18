export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'code_review' | 'completed' | 'failed'
  todos: Todo[]
  created_at: string
  updated_at: string
  agent_prompt?: string
  agent_type?: 'claude-code'
  execution_status?: 'none' | 'queued' | 'running' | 'completed' | 'failed'
  execution_log?: string
  execution_started_at?: string
  execution_completed_at?: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
}

export interface CreateTaskInput {
  title: string
  description: string
  todos: string[]
  agent_prompt?: string
  agent_type?: 'claude-code'
}