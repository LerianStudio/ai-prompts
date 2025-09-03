import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '../ui/card'
import { StatusBadge } from '../ui/status-badge'
import { Progress } from '../ui/progress'
import { formatDate } from '../../lib/utils'
import { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const completedTodos = task.todos.filter(todo => todo.completed).length
  const totalTodos = task.todos.length
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
      onClick={() => onClick(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm line-clamp-2 text-zinc-900">
            {task.title}
          </h3>
          <StatusBadge 
            status={task.status}
            className="ml-2"
          />
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