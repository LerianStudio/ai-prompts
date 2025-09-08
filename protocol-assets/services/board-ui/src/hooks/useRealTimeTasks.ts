/**
 * Real-time Task Management Hooks
 * 
 * Custom React hooks for managing real-time task updates using WebSockets
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Import types from the existing React app
import { Task, Todo, CreateTaskInput } from '@/types';

interface WebSocketMessage {
  type: 'connection' | 'task_created' | 'task_updated' | 'task_deleted' | 'todo_updated' | 'ping' | 'pong';
  task?: Task;
  taskId?: string;
  updates?: Partial<Task>;
  timestamp: string;
  message?: string;
}

interface UseRealTimeTasksOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  wsUrl?: string;
}

interface UseRealTimeTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Actions
  refreshTasks: () => Promise<void>;
  createTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // WebSocket controls
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

// Environment-based configuration with fallbacks for development
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3020/api';
const WS_BASE_URL = import.meta.env?.VITE_WS_BASE_URL || 'ws://localhost:3020';

// Helper function to transform API data to React app format
function transformApiTaskToAppTask(apiTask: any): Task {
  return {
    ...apiTask,
    description: apiTask.description || '', // Ensure description is always a string
    todos: apiTask.todos?.map((todo: any) => ({
      id: todo.id,
      text: todo.content,
      completed: todo.status === 'completed'
    })) || []
  };
}

// Helper function to transform React app data to API format  
function transformAppTaskToApiTask(appTask: CreateTaskInput): any {
  return {
    title: appTask.title,
    description: appTask.description,
    todos: appTask.todos.map((todoText: string, index: number) => ({
      content: todoText,
      status: 'pending',
      sort_order: index
    }))
  };
}

/**
 * Main hook for real-time task management
 */
export function useRealTimeTasks(options: UseRealTimeTasksOptions = {}): UseRealTimeTasksReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    wsUrl = WS_BASE_URL
  } = options;

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const intentionalDisconnectRef = useRef(false);

  // WebSocket event handlers
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', message);

      switch (message.type) {
        case 'connection':
          console.log('✅ WebSocket connected');
          setConnected(true);
          setWsStatus('connected');
          setError(null);
          reconnectAttemptsRef.current = 0;
          break;

        case 'task_created':
          if (message.task) {
            const transformedTask = transformApiTaskToAppTask(message.task);
            setTasks(prevTasks => [transformedTask, ...prevTasks]);
            console.log('➕ Task created via WebSocket:', message.task.title);
          }
          break;

        case 'task_updated':
          if (message.task) {
            const transformedTask = transformApiTaskToAppTask(message.task);
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === message.task!.id ? transformedTask : task
              )
            );
            console.log('📝 Task updated via WebSocket:', message.task.title);
          }
          break;

        case 'task_deleted':
          if (message.taskId) {
            setTasks(prevTasks => 
              prevTasks.filter(task => task.id !== message.taskId)
            );
            console.log('🗑️ Task deleted via WebSocket:', message.taskId);
          }
          break;

        case 'pong':
          console.log('🏓 WebSocket pong received');
          break;
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, []);

  const handleWebSocketOpen = useCallback(() => {
    console.log('🔗 WebSocket connection opened');
    setConnected(true);
    setWsStatus('connected');
    setError(null);
    reconnectAttemptsRef.current = 0;

    // Start ping interval
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, 30000); // Ping every 30 seconds
  }, []);

  const handleWebSocketClose = useCallback(() => {
    console.log('🔌 WebSocket connection closed');
    setConnected(false);
    setWsStatus('disconnected');
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Only attempt to reconnect if this was NOT an intentional disconnect
    if (!intentionalDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
      console.log(`🔄 Attempting to reconnect... (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, reconnectInterval);
    } else if (intentionalDisconnectRef.current) {
      console.log('✅ Intentional disconnect - no reconnection attempted');
      intentionalDisconnectRef.current = false; // Reset flag
    } else {
      console.log('❌ Max reconnection attempts reached');
      setWsStatus('error');
      setError('Connection lost and max reconnection attempts reached');
    }
  }, [reconnectInterval, maxReconnectAttempts]);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('❌ WebSocket error:', error);
    setWsStatus('error');
    setError('WebSocket connection error');
  }, []);

  // WebSocket connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      console.log('🔄 Connecting to WebSocket:', wsUrl);
      setWsStatus('connecting');
      
      // Reset intentional disconnect flag on new connections
      intentionalDisconnectRef.current = false;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.addEventListener('open', handleWebSocketOpen);
      wsRef.current.addEventListener('message', handleWebSocketMessage);
      wsRef.current.addEventListener('close', handleWebSocketClose);
      wsRef.current.addEventListener('error', handleWebSocketError);
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setWsStatus('error');
      setError('Failed to create WebSocket connection');
    }
  }, [wsUrl, handleWebSocketOpen, handleWebSocketMessage, handleWebSocketClose, handleWebSocketError]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');
    
    // Mark as intentional disconnect to prevent auto-reconnect
    intentionalDisconnectRef.current = true;
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.removeEventListener('open', handleWebSocketOpen);
      wsRef.current.removeEventListener('message', handleWebSocketMessage);
      wsRef.current.removeEventListener('close', handleWebSocketClose);
      wsRef.current.removeEventListener('error', handleWebSocketError);
      
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
    setWsStatus('disconnected');
  }, [handleWebSocketOpen, handleWebSocketMessage, handleWebSocketClose, handleWebSocketError]);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // API functions
  const refreshTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const fetchedTasks = await response.json();
      setTasks(fetchedTasks.map(transformApiTaskToAppTask));
      
      console.log(`📋 Refreshed ${fetchedTasks.length} tasks`);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: CreateTaskInput): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformAppTaskToApiTask(taskData)),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const newTask: Task = await response.json();
      
      // Note: The WebSocket will handle adding this to the state
      console.log('✅ Task created:', newTask.title);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask: Task = await response.json();
      
      // Note: The WebSocket will handle updating this in the state
      console.log('✅ Task updated:', updatedTask.title);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      // Note: The WebSocket will handle removing this from the state
      console.log('✅ Task deleted:', taskId);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }, []);

  // Effects
  useEffect(() => {
    // Initial data fetch
    refreshTasks();
  }, []); // Only run once on mount

  useEffect(() => {
    // Auto-connect WebSocket
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only depend on autoConnect

  return {
    tasks,
    loading,
    error,
    connected,
    wsStatus,
    
    // Actions
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    
    // WebSocket controls
    connect,
    disconnect,
    reconnect,
  };
}

/**
 * Lightweight hook for WebSocket connection status only
 */
export function useWebSocketStatus(wsUrl: string = WS_BASE_URL) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [connected, setConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intentionalDisconnectRef = useRef(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    intentionalDisconnectRef.current = false;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setStatus('connected');
      setConnected(true);
    };
    
    wsRef.current.onclose = () => {
      setStatus('disconnected');
      setConnected(false);
    };
    
    wsRef.current.onerror = () => {
      setStatus('error');
      setConnected(false);
    };
  }, [wsUrl]);

  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []); // Remove dependency on connect/disconnect to prevent recreation

  return { status, connected, connect, disconnect };
}

export type { Task, Todo, WebSocketMessage, UseRealTimeTasksReturn };