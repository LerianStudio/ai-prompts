import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/hooks/use-tasks'
import { getWebSocketUrl } from '@/config/environment'
import { ErrorBoundary, TaskErrorBoundary } from '@/components/error-boundary'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useRef } from 'react'

function App() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks()
  
  // Add WebSocket connection inline
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const intentionalDisconnectRef = useRef(false)
  
  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return // Already connected
      }
      
      console.log('🔄 Connecting to WebSocket...')
      intentionalDisconnectRef.current = false
      
      wsRef.current = new WebSocket(getWebSocketUrl())
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected')
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 WebSocket message:', message)
          
          // Refresh tasks when we get real-time updates
          if (message.type === 'task_created' || message.type === 'task_updated' || message.type === 'task_deleted') {
            console.log('🔄 Refreshing tasks due to WebSocket update:', message.type)
            void refetch()
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        
        // Only reconnect if not intentional disconnect
        if (!intentionalDisconnectRef.current) {
          console.log('🔄 Reconnecting in 3 seconds...')
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }
    }
    
    connectWebSocket()
    
    return () => {
      console.log('🔌 Cleaning up WebSocket connection')
      intentionalDisconnectRef.current = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [refetch]) // Include refetch in dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-zinc-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Loading tasks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading tasks</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
                className="border-red-200 hover:border-red-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-zinc-50">
          <TaskErrorBoundary>
            <KanbanBoard 
              tasks={tasks}
              onTaskCreate={createTask}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
            />
          </TaskErrorBoundary>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App