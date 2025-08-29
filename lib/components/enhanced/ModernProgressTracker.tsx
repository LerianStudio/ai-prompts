import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text } from 'ink'
import { 
  ProgressBar, 
  Spinner, 
  StatusMessage,
  ThemeProvider,
  defaultTheme,
  extendTheme,
  type ComponentTheme
} from '@inkjs/ui'
import { BaseComponentProps } from '../../types/components'
import { colors } from '../../design/colors'

interface ProgressPhase {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: { current: number; total: number }
  error?: string
  duration?: number
  startTime?: Date
}

interface SyncOperation {
  file: string
  operation: 'copy' | 'update' | 'delete' | 'move'
  status: 'pending' | 'running' | 'completed' | 'error'
  size?: number
  error?: string
  startTime?: Date
  endTime?: Date
}

interface ModernProgressTrackerProps extends BaseComponentProps {
  phase: 'detection' | 'selection' | 'confirmation' | 'syncing' | 'complete' | 'error'
  currentPhase?: ProgressPhase
  phases?: ProgressPhase[]
  operations?: SyncOperation[]
  overallProgress?: { current: number; total: number }
  showOperationDetails?: boolean
  showTimeEstimates?: boolean
  compact?: boolean
  animateProgress?: boolean
}

// Custom theme for progress components
const progressTheme = extendTheme(defaultTheme, {
  components: {
    ProgressBar: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          borderColor: colors.primary[300],
          paddingX: 1,
        }),
        bar: ({ value }) => ({
          backgroundColor: value >= 100 ? colors.semantic.state.success : colors.primary[500],
        }),
        track: () => ({
          backgroundColor: colors.neutral[200],
        }),
      },
    },
    Spinner: {
      styles: {
        container: () => ({
          gap: 1,
        }),
        frame: () => ({
          color: colors.primary[500],
        }),
        label: () => ({
          color: colors.semantic.text.primary,
        }),
      },
    },
    StatusMessage: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          marginBottom: 1,
        }),
      },
    },
  } satisfies Record<string, ComponentTheme>,
})

export const ModernProgressTracker: React.FC<ModernProgressTrackerProps> = ({
  phase,
  currentPhase,
  phases = [],
  operations = [],
  overallProgress,
  showOperationDetails = true,
  showTimeEstimates = true,
  compact = false,
  animateProgress = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [startTime] = useState(new Date())

  // Animate progress bar for better UX
  useEffect(() => {
    if (!animateProgress || !overallProgress) return

    const targetProgress = Math.round((overallProgress.current / overallProgress.total) * 100)
    
    if (targetProgress === animatedProgress) return

    const duration = 300 // ms
    const steps = 20
    const stepSize = (targetProgress - animatedProgress) / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setAnimatedProgress(prev => {
        const newValue = prev + stepSize
        if (currentStep >= steps) {
          clearInterval(interval)
          return targetProgress
        }
        return Math.round(newValue)
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [overallProgress, animateProgress, animatedProgress])

  // Calculate statistics
  const stats = useMemo(() => {
    const completedOps = operations.filter(op => op.status === 'completed')
    const errorOps = operations.filter(op => op.status === 'error')
    const runningOps = operations.filter(op => op.status === 'running')
    
    const totalSize = operations.reduce((sum, op) => sum + (op.size || 0), 0)
    const completedSize = completedOps.reduce((sum, op) => sum + (op.size || 0), 0)
    
    const totalDuration = Date.now() - startTime.getTime()
    const avgOpTime = completedOps.length > 0 
      ? completedOps.reduce((sum, op) => {
          if (op.startTime && op.endTime) {
            return sum + (op.endTime.getTime() - op.startTime.getTime())
          }
          return sum
        }, 0) / completedOps.length
      : 0

    const remainingOps = operations.length - completedOps.length - errorOps.length
    const estimatedTimeRemaining = remainingOps > 0 && avgOpTime > 0
      ? remainingOps * avgOpTime
      : 0

    return {
      completed: completedOps.length,
      errors: errorOps.length,
      running: runningOps.length,
      total: operations.length,
      totalSize,
      completedSize,
      completionRate: operations.length > 0 ? (completedOps.length / operations.length) * 100 : 0,
      totalDuration,
      estimatedTimeRemaining,
      avgOpTime,
    }
  }, [operations, startTime])

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getPhaseIcon = (phase: string): string => {
    switch (phase) {
      case 'detection': return '🔍'
      case 'selection': return '🎯'
      case 'confirmation': return '❓'
      case 'syncing': return '⚡'
      case 'complete': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  const getOperationIcon = (operation: string): string => {
    switch (operation) {
      case 'copy': return '📋'
      case 'update': return '📝'
      case 'delete': return '🗑️'
      case 'move': return '📁'
      default: return '📄'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colors.semantic.state.success
      case 'error': return colors.semantic.state.error
      case 'running': return colors.primary[500]
      case 'pending': return colors.semantic.text.secondary
      default: return colors.semantic.text.primary
    }
  }

  if (compact) {
    return (
      <ThemeProvider theme={progressTheme}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          {phase === 'syncing' && currentPhase?.status === 'running' ? (
            <Spinner />
          ) : (
            <Text color={getStatusColor(currentPhase?.status || 'pending')}>
              {getPhaseIcon(phase)}
            </Text>
          )}
          
          <Text color={colors.semantic.text.primary}>
            {currentPhase?.name || `${phase.charAt(0).toUpperCase()}${phase.slice(1)}`}
          </Text>
          
          {overallProgress && (
            <Text color={colors.semantic.text.secondary}>
              ({overallProgress.current}/{overallProgress.total})
            </Text>
          )}
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={progressTheme}>
      <Box flexDirection="column">
        {/* Current Phase Status */}
        <Box marginBottom={1}>
          <StatusMessage 
            variant={
              currentPhase?.status === 'error' ? 'error' :
              currentPhase?.status === 'completed' ? 'success' :
              phase === 'syncing' ? 'info' : 'warning'
            }
          >
            {getPhaseIcon(phase)} {currentPhase?.name || `${phase.charAt(0).toUpperCase()}${phase.slice(1)}`}
            {currentPhase?.description && ` - ${currentPhase.description}`}
          </StatusMessage>
        </Box>

        {/* Overall Progress Bar */}
        {overallProgress && phase === 'syncing' && (
          <Box marginBottom={1}>
            <Box flexDirection="column">
              <Box marginBottom={1}>
                <Text color={colors.primary[500]} bold>
                  Overall Progress
                </Text>
              </Box>
              <ProgressBar 
                value={animateProgress ? animatedProgress : Math.round((overallProgress.current / overallProgress.total) * 100)}
              />
              <Box marginTop={1} justifyContent="space-between">
                <Text color={colors.semantic.text.secondary}>
                  {overallProgress.current} / {overallProgress.total} operations
                </Text>
                {showTimeEstimates && stats.estimatedTimeRemaining > 0 && (
                  <Text color={colors.semantic.text.secondary}>
                    ETA: {formatDuration(stats.estimatedTimeRemaining)}
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Phase Progress (for multi-phase operations) */}
        {phases.length > 1 && (
          <Box 
            marginBottom={1}
            borderStyle="single"
            borderColor={colors.neutral[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                📋 Phase Progress
              </Text>
              {phases.map((phaseInfo, index) => (
                <Box key={phaseInfo.id} alignItems="center" marginBottom={1}>
                  <Text color={getStatusColor(phaseInfo.status)} marginRight={1}>
                    {phaseInfo.status === 'running' ? '▶' : 
                     phaseInfo.status === 'completed' ? '✅' :
                     phaseInfo.status === 'error' ? '❌' : '⏸'}
                  </Text>
                  <Text 
                    color={phaseInfo.status === 'running' ? colors.primary[600] : colors.semantic.text.primary}
                    flexGrow={1}
                  >
                    {phaseInfo.name}
                  </Text>
                  {phaseInfo.duration && (
                    <Text color={colors.semantic.text.tertiary} dimColor>
                      {formatDuration(phaseInfo.duration)}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Operation Details */}
        {showOperationDetails && operations.length > 0 && phase === 'syncing' && (
          <Box 
            marginBottom={1}
            borderStyle="single"
            borderColor={colors.neutral[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                🔄 File Operations
              </Text>
              
              {/* Statistics */}
              <Box marginBottom={1} flexDirection="row" columnGap={2}>
                <Text color={colors.semantic.state.success}>
                  ✅ {stats.completed}
                </Text>
                <Text color={colors.primary[500]}>
                  ⚡ {stats.running}
                </Text>
                {stats.errors > 0 && (
                  <Text color={colors.semantic.state.error}>
                    ❌ {stats.errors}
                  </Text>
                )}
                <Text color={colors.semantic.text.secondary}>
                  📊 {stats.completionRate.toFixed(1)}%
                </Text>
              </Box>

              {/* Recent operations */}
              <Box flexDirection="column" height={Math.min(operations.length + 1, 6)}>
                {operations.slice(-5).map((operation, index) => (
                  <Box key={`${operation.file}-${index}`} alignItems="center">
                    <Text color={getStatusColor(operation.status)} marginRight={1}>
                      {operation.status === 'running' ? (
                        <Spinner />
                      ) : operation.status === 'completed' ? '✅' :
                        operation.status === 'error' ? '❌' : '⏳'}
                    </Text>
                    
                    <Text color={colors.semantic.text.tertiary} marginRight={1}>
                      {getOperationIcon(operation.operation)}
                    </Text>
                    
                    <Text 
                      color={operation.status === 'running' ? colors.primary[600] : colors.semantic.text.primary}
                      flexGrow={1}
                    >
                      {operation.file}
                    </Text>
                    
                    {operation.size && (
                      <Text color={colors.semantic.text.tertiary} dimColor marginLeft={1}>
                        {formatFileSize(operation.size)}
                      </Text>
                    )}
                  </Box>
                ))}
                
                {operations.length > 5 && (
                  <Text color={colors.semantic.text.tertiary} dimColor>
                    ... and {operations.length - 5} more operations
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Performance Statistics */}
        {showTimeEstimates && stats.completed > 0 && phase === 'syncing' && (
          <Box 
            borderStyle="single"
            borderColor={colors.neutral[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                ⏱️ Performance Metrics
              </Text>
              
              <Box flexDirection="row" justifyContent="space-between">
                <Box flexDirection="column">
                  <Text color={colors.semantic.text.secondary}>
                    Elapsed: <Text color={colors.semantic.text.primary}>{formatDuration(stats.totalDuration)}</Text>
                  </Text>
                  {stats.avgOpTime > 0 && (
                    <Text color={colors.semantic.text.secondary}>
                      Avg/file: <Text color={colors.semantic.text.primary}>{formatDuration(stats.avgOpTime)}</Text>
                    </Text>
                  )}
                </Box>
                
                <Box flexDirection="column" alignItems="flex-end">
                  {stats.totalSize > 0 && (
                    <Text color={colors.semantic.text.secondary}>
                      Data: <Text color={colors.semantic.text.primary}>
                        {formatFileSize(stats.completedSize)}/{formatFileSize(stats.totalSize)}
                      </Text>
                    </Text>
                  )}
                  <Text color={colors.semantic.text.secondary}>
                    Rate: <Text color={colors.semantic.text.primary}>
                      {stats.totalDuration > 0 ? 
                        (stats.completed / (stats.totalDuration / 1000)).toFixed(1) : 0
                      } files/sec
                    </Text>
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Error Display */}
        {currentPhase?.error && (
          <Box marginTop={1}>
            <StatusMessage variant="error">
              Error: {currentPhase.error}
            </StatusMessage>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default ModernProgressTracker