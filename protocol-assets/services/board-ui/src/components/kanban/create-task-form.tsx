import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CreateTaskInput } from '@/types'
import { SubtaskChecklist, SubtaskItem } from './subtask-checklist'

interface CreateTaskFormProps {
  onCreateTask: (task: CreateTaskInput) => void
  onCancel?: () => void
  loading?: boolean
  className?: string
}

export function CreateTaskForm({ 
  onCreateTask, 
  onCancel,
  loading = false,
  className = ""
}: CreateTaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    const todos = subtasks.map(subtask => subtask.text)

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      todos
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSubtasks([])
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setSubtasks([])
    onCancel?.()
  }

  return (
    <Card className={`w-full max-w-2xl bg-white shadow-lg ${className}`}>
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-zinc-900">
          Create New Task
        </CardTitle>
        <CardDescription className="text-zinc-600">
          Add a new task to your board with details and subtasks.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-sm font-semibold text-zinc-700">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              className="h-11 border-zinc-200 focus:bg-white focus:border-accent focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-sm font-semibold text-zinc-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={4}
              className="border-zinc-200 focus:bg-white focus:border-accent focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors resize-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-zinc-700">
              Subtasks
            </Label>
            <SubtaskChecklist 
              subtasks={subtasks}
              onSubtasksChange={setSubtasks}
            />
          </div>
        </CardContent>
        
        <CardFooter className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
              className="px-6 h-10 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={loading || !title.trim()}
            className="px-8 h-10 bg-accent hover:bg-accent/90 text-zinc-900 font-medium shadow-sm"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}