import { Card, CardContent, CardHeader } from '../ui/card'
import { StatusBadge } from '../ui/status-badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { formatDate } from '../../lib/utils'
import { Task } from '../../types'
import { Trash2 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const completedTodos = task.todos.filter(todo => todo.completed).length
  const totalTodos = task.todos.length
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    onDelete(task.id)
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => onClick(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm line-clamp-2 text-zinc-900 flex-1 pr-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <StatusBadge 
              status={task.status}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        {totalTodos > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span className="font-medium">{completedTodos}/{totalTodos}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Updated {formatDate(task.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}