import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Task } from '../../types'
import { formatDate } from '../../lib/utils'
import { Copy, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { useState } from 'react'

interface ExecutionResultsModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

export function ExecutionResultsModal({ task, isOpen, onClose }: ExecutionResultsModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyResults = async () => {
    if (task.execution_log) {
      await navigator.clipboard.writeText(task.execution_log)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusIcon = () => {
    switch (task.execution_status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'running':
      case 'queued':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <FileText className="h-5 w-5 text-zinc-400" />
    }
  }

  const getStatusText = () => {
    switch (task.execution_status) {
      case 'completed':
        return 'Execution Completed'
      case 'failed':
        return 'Execution Failed'
      case 'running':
        return 'Execution Running'
      case 'queued':
        return 'Execution Queued'
      default:
        return 'No Execution'
    }
  }

  const executionDuration = task.execution_started_at && task.execution_completed_at
    ? Math.round((new Date(task.execution_completed_at).getTime() - new Date(task.execution_started_at).getTime()) / 1000)
    : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Agent Execution Results
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Task Info */}
          <div className="bg-zinc-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-zinc-600 text-sm mb-3">{task.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-zinc-700">Status:</span>
                <span className={`ml-2 ${
                  task.execution_status === 'completed' ? 'text-green-600' :
                  task.execution_status === 'failed' ? 'text-red-600' :
                  task.execution_status === 'running' ? 'text-blue-600' :
                  'text-zinc-500'
                }`}>
                  {getStatusText()}
                </span>
              </div>

              {task.execution_started_at && (
                <div>
                  <span className="font-medium text-zinc-700">Started:</span>
                  <span className="ml-2 text-zinc-600">
                    {formatDate(task.execution_started_at)}
                  </span>
                </div>
              )}

              {task.execution_completed_at && (
                <div>
                  <span className="font-medium text-zinc-700">Completed:</span>
                  <span className="ml-2 text-zinc-600">
                    {formatDate(task.execution_completed_at)}
                  </span>
                </div>
              )}

              {executionDuration && (
                <div>
                  <span className="font-medium text-zinc-700">Duration:</span>
                  <span className="ml-2 text-zinc-600">{executionDuration}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Prompt */}
          {task.agent_prompt && (
            <div>
              <h4 className="font-medium text-zinc-700 mb-2">Agent Prompt:</h4>
              <div className="bg-zinc-100 p-3 rounded-lg">
                <pre className="text-sm text-zinc-700 whitespace-pre-wrap font-mono">
                  {task.agent_prompt}
                </pre>
              </div>
            </div>
          )}

          {/* Execution Results */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-zinc-700">Execution Output:</h4>
              {task.execution_log && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyResults}
                  className="h-8"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>

            <div className="flex-1 min-h-[200px] max-h-[300px] bg-zinc-900 rounded-lg p-4 overflow-auto">
              {task.execution_log ? (
                <pre className="text-sm text-zinc-100 whitespace-pre-wrap font-mono">
                  {task.execution_log}
                </pre>
              ) : task.execution_status === 'running' || task.execution_status === 'queued' ? (
                <div className="text-zinc-400 italic">
                  Execution in progress... Results will appear here when completed.
                </div>
              ) : (
                <div className="text-zinc-400 italic">
                  No execution results available.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}