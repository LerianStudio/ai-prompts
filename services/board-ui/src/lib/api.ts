import { Task, CreateTaskInput } from '@/types'

const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(`API Error: ${response.statusText}`, response.status)
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  // For non-JSON responses, return text or undefined
  const text = await response.text()
  return (text || undefined) as T
}

export const api = {
  // Get all tasks
  getTasks: (): Promise<Task[]> => 
    fetchApi<Task[]>('/tasks'),

  // Create a new task
  createTask: (task: CreateTaskInput): Promise<Task> =>
    fetchApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  // Update a task
  updateTask: (id: string, updates: Partial<Task>): Promise<Task> =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete a task
  deleteTask: (id: string): Promise<void> =>
    fetchApi<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Update a specific todo item
  updateTodo: (taskId: string, todoId: string, completed: boolean): Promise<Task> =>
    fetchApi<Task>(`/tasks/${taskId}/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    }),
}