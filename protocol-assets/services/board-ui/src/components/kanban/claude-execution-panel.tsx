import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Progress } from '../ui/progress';
import {
  Play,
  Square,
  MessageSquare,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ClaudeExecutionPanelProps {
  task: Task;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

interface ExecutionLog {
  timestamp: string;
  type: 'stdout' | 'stderr' | 'structured' | 'system';
  content: string;
  executionId?: string;
}

interface SubscriptionWarning {
  type: string;
  title: string;
  message: string;
  recommendations: string[];
  timestamp: string;
}

export function ClaudeExecutionPanel({ task, onTaskUpdate }: ClaudeExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [subscriptionWarning, setSubscriptionWarning] = useState<SubscriptionWarning | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsUrl = `ws://localhost:3020`;
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);

          // Auto-reconnect after 5 seconds
          reconnectTimer = setTimeout(() => {
            connect();
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    if (data.taskId !== task.id) return;

    switch (data.type) {
      case 'execution_output':
      case 'stdout':
        setExecutionLogs(prev => [...prev, {
          timestamp: data.timestamp,
          type: data.outputType || 'stdout',
          content: data.chunk,
          executionId: data.executionId
        }]);
        break;

      case 'structured_output':
        setExecutionLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          type: 'structured',
          content: JSON.stringify(data.data, null, 2),
          executionId: data.executionId
        }]);
        break;

      case 'subscription_warning':
        if (data.warning) {
          setSubscriptionWarning(data.warning);
        }
        break;

      case 'execution_completed':
        setIsExecuting(false);
        setSessionId(data.sessionId);
        onTaskUpdate(task.id, {
          execution_status: 'completed',
          claude_session_id: data.sessionId,
          status: 'done' // Move task to done column
        });
        break;

      case 'execution_failed':
        setIsExecuting(false);
        onTaskUpdate(task.id, {
          execution_status: 'failed',
          status: 'done' // Move failed tasks to done column with error indicator
        });
        break;

      case 'followup_completed':
        setIsExecuting(false);
        onTaskUpdate(task.id, {
          execution_status: 'completed',
          status: 'done'
        });
        break;

      case 'followup_failed':
        setIsExecuting(false);
        onTaskUpdate(task.id, {
          execution_status: 'failed',
          status: 'done'
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const startExecution = async () => {
    try {
      setIsExecuting(true);
      setExecutionLogs([]);
      setSubscriptionWarning(null);

      const response = await fetch(`/api/execution/${task.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_prompt: customPrompt.trim() || undefined
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start execution');
      }

      onTaskUpdate(task.id, {
        execution_status: 'queued',
        status: 'in-progress' // Move task to in-progress column
      });

    } catch (error) {
      console.error('Execution error:', error);
      setIsExecuting(false);
      setExecutionLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        type: 'stderr',
        content: `Error: ${error.message}`
      }]);
    }
  };

  const sendFollowUp = async () => {
    if (!customPrompt.trim() || !sessionId) return;

    try {
      setIsExecuting(true);

      const response = await fetch(`/api/execution/${task.id}/execute/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt.trim()
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send follow-up');
      }

      setCustomPrompt('');
      onTaskUpdate(task.id, {
        execution_status: 'running',
        status: 'in-progress'
      });

    } catch (error) {
      console.error('Follow-up error:', error);
      setIsExecuting(false);
    }
  };

  const stopExecution = async () => {
    // TODO: Implement execution cancellation
    setIsExecuting(false);
  };

  const getStatusIcon = () => {
    switch (task.execution_status) {
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const variant = {
      'none': 'secondary' as const,
      'queued': 'default' as const,
      'running': 'default' as const,
      'completed': 'default' as const,
      'failed': 'destructive' as const
    };

    return (
      <Badge variant={variant[task.execution_status || 'none']}>
        {getStatusIcon()}
        <span className="ml-1 capitalize">
          {task.execution_status === 'none' ? 'Ready' : task.execution_status}
        </span>
      </Badge>
    );
  };

  const canExecute = !isExecuting &&
    (task.execution_status === 'none' || task.execution_status === 'failed' || task.execution_status === 'completed');

  const canFollowUp = !isExecuting && sessionId && task.execution_status === 'completed';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Claude Code Execution
            </CardTitle>
            <CardDescription>
              Execute tasks using Claude Code with subscription management
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="execution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
          </TabsList>

          <TabsContent value="execution" className="space-y-4">
            {/* Subscription Warning */}
            {subscriptionWarning && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                  {subscriptionWarning.title}
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">{subscriptionWarning.message}</p>
                  {subscriptionWarning.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {subscriptionWarning.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Task Information */}
            <div className="space-y-2">
              <h4 className="font-medium">Task: {task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              {task.todos && task.todos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Todos:</p>
                  <ul className="text-sm space-y-1">
                    {task.todos.map((todo) => (
                      <li key={todo.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          disabled
                          className="h-3 w-3"
                        />
                        <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                          {todo.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Separator />

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {canFollowUp ? 'Follow-up Prompt' : 'Custom Prompt (Optional)'}
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  canFollowUp
                    ? "Send additional instructions or questions..."
                    : "Override the default prompt or provide specific instructions..."
                }
                rows={4}
                disabled={isExecuting}
              />
            </div>

            {/* Execution Progress */}
            {(isExecuting || task.execution_status === 'running') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Executing with Claude Code...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canFollowUp ? (
                <Button
                  onClick={sendFollowUp}
                  disabled={!customPrompt.trim() || isExecuting}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Follow-up
                </Button>
              ) : (
                <Button
                  onClick={startExecution}
                  disabled={!canExecute}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Execute with Claude
                </Button>
              )}

              {isExecuting && (
                <Button
                  onClick={stopExecution}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <ScrollArea className="h-96 w-full rounded border p-4">
              {executionLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No execution logs yet. Start an execution to see output here.
                </p>
              ) : (
                <div className="space-y-2">
                  {executionLogs.map((log, idx) => (
                    <div key={idx} className="font-mono text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={log.type === 'stderr' ? 'destructive' : 'secondary'}
                          className="px-1 py-0 text-xs"
                        >
                          {log.type}
                        </Badge>
                        <span className="text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap text-gray-800 pl-4 border-l-2 border-gray-200">
                        {log.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="session" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Session Information
              </h4>

              {sessionId ? (
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  <div>
                    <span className="text-sm font-medium">Session ID:</span>
                    <code className="ml-2 text-xs bg-white px-2 py-1 rounded">
                      {sessionId}
                    </code>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <span className="ml-2 text-sm">Active - ready for follow-up prompts</span>
                  </div>
                  {task.execution_started_at && (
                    <div>
                      <span className="text-sm font-medium">Started:</span>
                      <span className="ml-2 text-sm">
                        {new Date(task.execution_started_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No active session. Start an execution to create a Claude Code session.
                </p>
              )}

              {task.claude_session_id && (
                <div className="mt-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Session Available</AlertTitle>
                    <AlertDescription>
                      This task has an existing Claude Code session. You can continue the
                      conversation using follow-up prompts.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}