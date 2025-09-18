import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from './task-card'
import { Task } from '@/types'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  color: 'pending' | 'progress' | 'review' | 'completed'
  onTaskClick: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onExecuteAgent?: (taskId: string) => void
  onViewResults?: (task: Task) => void
}

const colorMap = {
  pending: 'text-amber-700',
  progress: 'text-blue-700',
  review: 'text-purple-700',
  completed: 'text-emerald-700'
}

export function KanbanColumn({ id: _, title, tasks, color, onTaskClick, onTaskDelete, onExecuteAgent, onViewResults }: KanbanColumnProps) {
  // id parameter kept for interface compatibility but no longer used for drag/drop
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold tracking-tight ${colorMap[color]}`}>
            {title}
          </h2>
          <Badge variant="secondary" className="text-xs bg-zinc-100 text-zinc-700 border-zinc-200">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 min-h-[500px] overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onDelete={onTaskDelete}
            onExecuteAgent={onExecuteAgent}
            onViewResults={onViewResults}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
            No tasks yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}