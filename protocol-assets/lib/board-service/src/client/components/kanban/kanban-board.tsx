import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskDetailDialog } from './task-detail-dialog'
import { Task, CreateTaskInput } from '@/types'
import { Plus } from 'lucide-react'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskCreate: (task: CreateTaskInput) => void
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  loading?: boolean
}

export function KanbanBoard({ 
  tasks, 
  onTaskCreate, 
  onTaskUpdate, 
  loading = false
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Get the column ID from the droppable
    const overId = over.id as string
    const validStatuses = ['pending', 'in_progress', 'completed']
    
    let newStatus = activeTask.status
    if (validStatuses.includes(overId)) {
      newStatus = overId as Task['status']
    }

    if (newStatus !== activeTask.status) {
      onTaskUpdate(activeTask.id, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDetailDialogOpen(true)
  }

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f4f4f5'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/20 shadow-sm" style={{backgroundColor: '#feed02'}}>
        <div className="container mx-auto max-w-7xl flex h-32 items-center justify-between px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Lerian Board
            </h1>
            <p className="text-sm text-zinc-700 -mt-0.5">Task management workspace</p>
          </div>
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setCreateDialogOpen(true)} 
                  className="bg-black hover:bg-zinc-800 text-white border-zinc-700 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new task (Ctrl+N)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-12 pb-6">
        <div className="container mx-auto max-w-7xl">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              <KanbanColumn
                id="pending"
                title="Pending"
                tasks={pendingTasks}
                color="pending"
                onTaskClick={handleTaskClick}
              />
              <KanbanColumn
                id="in_progress"
                title="In Progress"
                tasks={inProgressTasks}
                color="progress"
                onTaskClick={handleTaskClick}
              />
              <KanbanColumn
                id="completed"
                title="Completed"
                tasks={completedTasks}
                color="completed"
                onTaskClick={handleTaskClick}
              />
            </div>

            <DragOverlay>
              {activeTask && (
                <TaskCard task={activeTask} onClick={() => {}} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateTask={onTaskCreate}
        loading={loading}
      />

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  )
}