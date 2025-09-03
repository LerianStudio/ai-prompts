import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

export interface SubtaskItem {
  id: string
  text: string
  completed: boolean
}

interface SubtaskChecklistProps {
  subtasks: SubtaskItem[]
  onSubtasksChange: (subtasks: SubtaskItem[]) => void
  className?: string
}

export function SubtaskChecklist({ 
  subtasks, 
  onSubtasksChange, 
  className = "" 
}: SubtaskChecklistProps) {
  const [newSubtaskText, setNewSubtaskText] = useState('')

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return

    const newSubtask: SubtaskItem = {
      id: crypto.randomUUID(),
      text: newSubtaskText.trim(),
      completed: false
    }

    onSubtasksChange([...subtasks, newSubtask])
    setNewSubtaskText('')
  }

  const removeSubtask = (id: string) => {
    onSubtasksChange(subtasks.filter(subtask => subtask.id !== id))
  }

  const updateSubtask = (id: string, updates: Partial<SubtaskItem>) => {
    onSubtasksChange(
      subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, ...updates } : subtask
      )
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add new subtask input */}
      <div className="relative">
        <Input
          value={newSubtaskText}
          onChange={(e) => setNewSubtaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new subtask..."
          className="pr-10 border-zinc-200 focus:bg-white focus:border-accent focus:ring-0 transition-colors"
        />
        <button
          type="button"
          onClick={addSubtask}
          disabled={!newSubtaskText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-accent hover:bg-accent/90 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Subtasks list */}
      {subtasks.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-zinc-700">
            Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length} completed)
          </Label>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded-md border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
              >
                <Checkbox
                  id={subtask.id}
                  checked={subtask.completed}
                  onCheckedChange={(checked) => 
                    updateSubtask(subtask.id, { completed: !!checked })
                  }
                  className="shrink-0"
                />
                
                <div className="flex-1 relative">
                  <Input
                    value={subtask.text}
                    onChange={(e) => 
                      updateSubtask(subtask.id, { text: e.target.value })
                    }
                    className={`pr-8 h-9 border-zinc-200 bg-white focus:bg-white focus:border-accent focus:ring-0 text-sm transition-all ${
                      subtask.completed 
                        ? 'line-through text-zinc-500 bg-zinc-50' 
                        : 'text-zinc-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subtasks.length === 0 && (
        <p className="text-sm text-zinc-500 italic">
          No subtasks added yet. Use the input above to add subtasks.
        </p>
      )}
    </div>
  )
}