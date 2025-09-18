import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/hooks/use-tasks'
import { useWebSocketManager } from '@/hooks/use-websocket-manager'
import { ErrorBoundary, TaskErrorBoundary } from '@/components/error-boundary'
import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useEffect } from 'react'

function App() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch, executeAgent } = useTasks()

  // Use the enhanced WebSocket manager
  const { status: wsStatus, isConnected, reset: resetWebSocket } = useWebSocketManager({
    maxReconnectAttempts: 10,
    baseReconnectDelay: 1000,
    maxReconnectDelay: 30000,
    heartbeatInterval: 30000,
    connectionTimeout: 10000,
    autoConnect: true
  })

  // Listen for WebSocket task updates
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      console.log('🔄 Refreshing tasks due to WebSocket update:', event.detail.type)
      void refetch()
    }

    window.addEventListener('wsTaskUpdate', handleTaskUpdate as EventListener)

    return () => {
      window.removeEventListener('wsTaskUpdate', handleTaskUpdate as EventListener)
    }
  }, [refetch])

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
          {/* WebSocket Status Indicator */}
          <div className="fixed top-4 right-4 z-50">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isConnected
                ? 'bg-green-100 text-green-800 border border-green-200'
                : wsStatus?.connectionState === 'RECONNECTING'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </>
              ) : wsStatus?.connectionState === 'RECONNECTING' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reconnecting ({wsStatus.reconnectAttempts}/{wsStatus.maxReconnectAttempts})</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnected</span>
                  {wsStatus?.circuitBreaker.state === 'OPEN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetWebSocket}
                      className="ml-2 h-6"
                    >
                      Retry
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <TaskErrorBoundary>
            <KanbanBoard
              tasks={tasks}
              onTaskCreate={createTask}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
              onExecuteAgent={executeAgent}
            />
          </TaskErrorBoundary>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App