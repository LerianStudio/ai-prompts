import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, Trash2 } from 'lucide-react'
import { Task, Todo } from '@/types'
import { formatDate } from '@/lib/utils'

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onTaskUpdate: (updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
}

export function TaskDetailDialog({ 
  open, 
  onOpenChange, 
  task, 
  onTaskUpdate,
  onTaskDelete 
}: TaskDetailDialogProps) {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    if (task) {
      setTodos(task.todos || [])
    }
  }, [task])

  if (!task) return null

  const handleTodoToggle = (todoId: string, completed: boolean) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed } : todo
    )
    setTodos(updatedTodos)
    onTaskUpdate({ todos: updatedTodos })
  }

  const handleStatusChange = (newStatus: Task['status']) => {
    onTaskUpdate({ status: newStatus })
  }

  const handleDeleteClick = () => {
    if (task && onTaskDelete) {
      onTaskDelete(task.id)
      onOpenChange(false)
    }
  }

  const completedTodos = todos.filter(todo => todo.completed).length
  const totalTodos = todos.length
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const getStatusVariant = (status: Task['status'], current: Task['status']) => {
    if (status === current) {
      return status === 'completed' ? 'success' : 
             status === 'in_progress' ? 'accent' : 
             status === 'code_review' ? 'secondary' :
             'warning'
    }
    return 'outline'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-6">
              <DialogTitle className="text-2xl font-bold text-zinc-900 flex-1 min-w-0">
                {task.title}
              </DialogTitle>
              {onTaskDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs font-semibold">
                ID: {task.id}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-700">Status:</span>
              <div className="flex gap-2">
                {(['pending', 'in_progress', 'code_review', 'completed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={getStatusVariant(status, task.status)}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(task.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(task.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Tasks</h3>
              {totalTodos > 0 && (
                <Badge variant="secondary">
                  {completedTodos}/{totalTodos} completed
                </Badge>
              )}
            </div>

            {totalTodos > 0 ? (
              <>
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-zinc-600 text-center">
                    {Math.round(progressPercentage)}% complete
                  </p>
                </div>

                {/* Todo List */}
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={(checked) => handleTodoToggle(todo.id, !!checked)}
                        className="shrink-0"
                      />
                      <span 
                        className={`flex-1 text-sm ${
                          todo.completed 
                            ? 'line-through text-zinc-500' 
                            : 'text-zinc-900'
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Empty State Fallback */
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-600">No tasks have been created yet.</p>
                    <p className="text-xs text-zinc-500">
                      Tasks will appear here once they are added to this item.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}