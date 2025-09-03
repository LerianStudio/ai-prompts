import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from './task-card'
import { Task } from '@/types'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  color: 'pending' | 'progress' | 'completed'
  onTaskClick: (task: Task) => void
}

const colorMap = {
  pending: 'text-amber-600',
  progress: 'text-accent-dark', 
  completed: 'text-emerald-600'
}

export function KanbanColumn({ id, title, tasks, color, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold tracking-tight ${colorMap[color]}`}>
            {title}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent 
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[500px] overflow-y-auto"
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
            No tasks yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}