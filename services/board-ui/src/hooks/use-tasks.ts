import { useState, useEffect, useCallback, useRef } from 'react'
import { Task, CreateTaskInput } from '@/types'
import { api, ApiError } from '@/lib/api'

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  createTask: (task: CreateTaskInput) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const setErrorWithDelay = useCallback((errorMessage: string, delay: number = 1000) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }

    errorTimeoutRef.current = setTimeout(() => {
      setError(errorMessage)
    }, delay)
  }, [])

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }
    setError(null)
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      clearError()
      const fetchedTasks = await api.getTasks()
      setTasks(fetchedTasks)
      console.log('✅ Tasks refreshed successfully')
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Error loading tasks'
      setErrorWithDelay(errorMessage, 500) // Short delay to allow for potential WebSocket updates
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [clearError, setErrorWithDelay])

  const createTask = async (taskInput: CreateTaskInput) => {
    try {
      setError(null)
      const newTask = await api.createTask(taskInput)
      setTasks(prev => [newTask, ...prev])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create task')
      }
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null)
      const updatedTask = await api.updateTask(id, updates)
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to update task')
      }
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      clearError()
      await api.deleteTask(id)
      console.log('✅ Delete API call completed, WebSocket will update UI state')
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete task'
      setErrorWithDelay(errorMessage, 0)
      console.error('Error deleting task:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}