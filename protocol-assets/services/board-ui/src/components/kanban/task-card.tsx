import { Card, CardContent, CardHeader } from '../ui/card'
import { StatusBadge } from '../ui/status-badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { formatDate } from '../../lib/utils'
import { Task } from '../../types'
import { Trash2, Bot, Loader2, FileText } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onDelete: (taskId: string) => void
  onExecuteAgent?: (taskId: string) => void
  onViewResults?: (task: Task) => void
}

export function TaskCard({ task, onClick, onDelete, onExecuteAgent, onViewResults }: TaskCardProps) {
  const completedTodos = task.todos.filter(todo => todo.completed).length
  const totalTodos = task.todos.length
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const getBorderColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'border-l-amber-500'
      case 'in_progress': return 'border-l-blue-500'
      case 'code_review': return 'border-l-purple-500'
      case 'completed': return 'border-l-emerald-500'
      default: return 'border-l-zinc-300'
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    onDelete(task.id)
  }

  const handleExecuteAgent = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    onExecuteAgent?.(task.id)
  }

  const handleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    onViewResults?.(task)
  }

  const isExecuting = task.execution_status === 'running' || task.execution_status === 'queued'
  const executionStatus = task.execution_status || 'none'

  // Debug logging
  console.log('TaskCard Debug:', {
    taskId: task.id,
    title: task.title,
    hasAgentPrompt: !!task.agent_prompt,
    agentPromptValue: task.agent_prompt,
    executionStatus: task.execution_status,
    hasOnExecuteAgent: !!onExecuteAgent
  })

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all duration-200 group border-l-4 ${getBorderColor(task.status)}`}
      onClick={() => onClick(task)}
    >
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-base text-zinc-900 leading-relaxed">
          {task.title}
        </h3>
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

        {task.agent_prompt && (
          <div className="mb-3 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecuteAgent}
              disabled={isExecuting || !onExecuteAgent}
              className="w-full h-8 text-xs border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  {executionStatus === 'queued' ? 'Queued...' : 'Executing...'}
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3 mr-1" />
                  Execute Agent
                </>
              )}
            </Button>

            {(executionStatus === 'completed' || executionStatus === 'failed') && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewResults}
                  className="w-full h-8 text-xs text-zinc-600 hover:bg-zinc-50"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View Results
                </Button>
                {executionStatus === 'completed' && (
                  <p className="text-xs text-green-600">✓ Agent executed successfully</p>
                )}
                {executionStatus === 'failed' && (
                  <p className="text-xs text-red-600">✗ Agent execution failed</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <StatusBadge
            status={task.status}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}