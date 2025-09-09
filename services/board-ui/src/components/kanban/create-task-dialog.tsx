import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { CreateTaskForm } from './create-task-form'
import { CreateTaskInput } from '@/types'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTask: (task: CreateTaskInput) => void
  loading?: boolean
}

export function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  onCreateTask, 
  loading = false 
}: CreateTaskDialogProps) {
  const handleTaskCreate = (task: CreateTaskInput) => {
    onCreateTask(task)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-transparent border-none shadow-none">
        <CreateTaskForm
          onCreateTask={handleTaskCreate}
          onCancel={handleCancel}
          loading={loading}
          className="mx-auto"
        />
      </DialogContent>
    </Dialog>
  )
}