export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'code_review' | 'completed' | 'failed'
  todos: Todo[]
  created_at: string
  updated_at: string
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
}