import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { KanbanColumn } from './kanban-column'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskDetailDialog } from './task-detail-dialog'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'
import { Task, CreateTaskInput } from '@/types'
import { Plus } from 'lucide-react'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskCreate: (task: CreateTaskInput) => void
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  loading?: boolean
}

export function KanbanBoard({ 
  tasks, 
  onTaskCreate, 
  onTaskUpdate, 
  onTaskDelete,
  loading = false
}: KanbanBoardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress')
  const codeReviewTasks = tasks.filter(task => task.status === 'code_review')
  const completedTasks = tasks.filter(task => task.status === 'completed')

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

  const handleDeleteClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setTaskToDelete(task)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return
    
    try {
      setDeleteLoading(true)
      await onTaskDelete(taskToDelete.id)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f4f4f5'}}>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/20 shadow-sm" style={{backgroundColor: '#feed02'}}>
        <div className="container mx-auto max-w-7xl flex h-32 items-center justify-between px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Lerian Protocol
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

      <main className="flex-1 px-6 pt-12 pb-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
            <KanbanColumn
              id="pending"
              title="Pending"
              tasks={pendingTasks}
              color="pending"
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteClick}
            />
            <KanbanColumn
              id="in_progress"
              title="In Progress"
              tasks={inProgressTasks}
              color="progress"
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteClick}
            />
            <KanbanColumn
              id="code_review"
              title="Code Review"
              tasks={codeReviewTasks}
              color="review"
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteClick}
            />
            <KanbanColumn
              id="completed"
              title="Completed"
              tasks={completedTasks}
              color="completed"
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteClick}
            />
          </div>
        </div>
      </main>

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
        onTaskDelete={handleDeleteClick}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={taskToDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  )
}