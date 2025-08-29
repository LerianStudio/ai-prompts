import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text } from 'ink'
import { 
  Alert, 
  StatusMessage,
  Badge,
  ThemeProvider,
  defaultTheme,
  extendTheme,
  type ComponentTheme
} from '@inkjs/ui'
import { BaseComponentProps } from '../../types/components'
import { colors } from '../../design/colors'

interface StatusItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  details?: string[]
  timestamp?: Date
  persistent?: boolean
  actions?: Array<{
    key: string
    label: string
    handler: () => void
  }>
}

interface SystemHealth {
  diskSpace: 'healthy' | 'warning' | 'critical'
  memory: 'healthy' | 'warning' | 'critical'
  network: 'healthy' | 'warning' | 'error'
  permissions: 'healthy' | 'warning' | 'error'
}

interface ModernStatusDisplayProps extends BaseComponentProps {
  phase: 'initialization' | 'detection' | 'selection' | 'confirmation' | 'syncing' | 'complete' | 'error'
  statusItems: StatusItem[]
  systemHealth?: SystemHealth
  showSystemHealth?: boolean
  showTimestamps?: boolean
  maxItems?: number
  autoHide?: boolean
  autoHideDelay?: number
  compact?: boolean
}

// Custom theme for status components
const statusTheme = extendTheme(defaultTheme, {
  components: {
    Alert: {
      styles: {
        container: ({ variant }) => ({
          borderStyle: 'round',
          borderColor: 
            variant === 'error' ? colors.semantic.state.error :
            variant === 'warning' ? colors.semantic.state.warning :
            variant === 'success' ? colors.semantic.state.success :
            colors.primary[300],
          marginBottom: 1,
        }),
        icon: ({ variant }) => ({
          color: 
            variant === 'error' ? colors.semantic.state.error :
            variant === 'warning' ? colors.semantic.state.warning :
            variant === 'success' ? colors.semantic.state.success :
            colors.primary[500],
        }),
        content: () => ({
          color: colors.semantic.text.primary,
        }),
      },
    },
    StatusMessage: {
      styles: {
        container: ({ variant }) => ({
          borderStyle: 'single',
          borderColor: 
            variant === 'error' ? colors.semantic.state.error :
            variant === 'warning' ? colors.semantic.state.warning :
            variant === 'success' ? colors.semantic.state.success :
            colors.primary[300],
          paddingX: 1,
          marginBottom: 1,
        }),
        icon: ({ variant }) => ({
          color: 
            variant === 'error' ? colors.semantic.state.error :
            variant === 'warning' ? colors.semantic.state.warning :
            variant === 'success' ? colors.semantic.state.success :
            colors.primary[500],
        }),
        content: () => ({
          color: colors.semantic.text.primary,
        }),
      },
    },
    Badge: {
      styles: {
        container: () => ({
          borderStyle: 'single',
          paddingX: 1,
        }),
      },
    },
  } satisfies Record<string, ComponentTheme>,
})

export const ModernStatusDisplay: React.FC<ModernStatusDisplayProps> = ({
  phase,
  statusItems = [],
  systemHealth,
  showSystemHealth = false,
  showTimestamps = true,
  maxItems = 10,
  autoHide = false,
  autoHideDelay = 5000,
  compact = false,
}) => {
  const [visibleItems, setVisibleItems] = useState<StatusItem[]>(statusItems)
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set())

  // Auto-hide non-persistent items
  useEffect(() => {
    if (!autoHide) return

    const timer = setTimeout(() => {
      const itemsToHide = statusItems
        .filter(item => !item.persistent)
        .map(item => item.id)
      
      setHiddenItemIds(prev => new Set([...prev, ...itemsToHide]))
    }, autoHideDelay)

    return () => clearTimeout(timer)
  }, [statusItems, autoHide, autoHideDelay])

  // Filter visible items
  useEffect(() => {
    const filtered = statusItems
      .filter(item => !hiddenItemIds.has(item.id))
      .slice(-maxItems)
    
    setVisibleItems(filtered)
  }, [statusItems, hiddenItemIds, maxItems])

  // Group items by type
  const groupedItems = useMemo(() => {
    const groups = {
      error: visibleItems.filter(item => item.type === 'error'),
      warning: visibleItems.filter(item => item.type === 'warning'),
      success: visibleItems.filter(item => item.type === 'success'),
      info: visibleItems.filter(item => item.type === 'info'),
    }
    
    return groups
  }, [visibleItems])

  // Calculate system health summary
  const healthSummary = useMemo(() => {
    if (!systemHealth) return null
    
    const issues = Object.entries(systemHealth).filter(([, status]) => 
      status === 'warning' || status === 'error' || status === 'critical'
    )
    
    const criticalIssues = issues.filter(([, status]) => 
      status === 'error' || status === 'critical'
    )
    
    return {
      hasIssues: issues.length > 0,
      hasCritical: criticalIssues.length > 0,
      issueCount: issues.length,
      criticalCount: criticalIssues.length,
    }
  }, [systemHealth])

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return timestamp.toLocaleTimeString()
  }

  const getPhaseIcon = (phase: string): string => {
    switch (phase) {
      case 'initialization': return '🔄'
      case 'detection': return '🔍'
      case 'selection': return '🎯'
      case 'confirmation': return '❓'
      case 'syncing': return '⚡'
      case 'complete': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'complete': return colors.semantic.state.success
      case 'error': return colors.semantic.state.error
      case 'syncing': return colors.primary[500]
      default: return colors.semantic.text.primary
    }
  }

  const getHealthIcon = (status: string): string => {
    switch (status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '🚨'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'healthy': return colors.semantic.state.success
      case 'warning': return colors.semantic.state.warning
      case 'critical': return colors.semantic.state.error
      case 'error': return colors.semantic.state.error
      default: return colors.semantic.text.secondary
    }
  }

  const getSystemComponentName = (component: string): string => {
    switch (component) {
      case 'diskSpace': return 'Disk Space'
      case 'memory': return 'Memory'
      case 'network': return 'Network'
      case 'permissions': return 'Permissions'
      default: return component
    }
  }

  if (compact) {
    return (
      <ThemeProvider theme={statusTheme}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          {/* Phase indicator */}
          <Text color={getPhaseColor(phase)}>
            {getPhaseIcon(phase)}
          </Text>
          
          {/* Status summary */}
          {groupedItems.error.length > 0 && (
            <Badge color="red">{groupedItems.error.length}</Badge>
          )}
          {groupedItems.warning.length > 0 && (
            <Badge color="yellow">{groupedItems.warning.length}</Badge>
          )}
          {groupedItems.success.length > 0 && (
            <Badge color="green">{groupedItems.success.length}</Badge>
          )}
          
          {/* System health indicator */}
          {showSystemHealth && healthSummary?.hasCritical && (
            <Text color={colors.semantic.state.error}>🚨</Text>
          )}
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={statusTheme}>
      <Box flexDirection="column">
        {/* Current Phase */}
        <Box marginBottom={1}>
          <StatusMessage 
            variant={
              phase === 'error' ? 'error' :
              phase === 'complete' ? 'success' :
              phase === 'syncing' ? 'info' : 'warning'
            }
          >
            {getPhaseIcon(phase)} Current Phase: {phase.charAt(0).toUpperCase() + phase.slice(1)}
          </StatusMessage>
        </Box>

        {/* System Health */}
        {showSystemHealth && systemHealth && (
          <Box 
            marginBottom={1}
            borderStyle="single"
            borderColor={
              healthSummary?.hasCritical ? colors.semantic.state.error :
              healthSummary?.hasIssues ? colors.semantic.state.warning :
              colors.semantic.state.success
            }
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column" width="100%">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                🔧 System Health
              </Text>
              
              <Box flexDirection="row" columnGap={2}>
                {Object.entries(systemHealth).map(([component, status]) => (
                  <Box key={component} alignItems="center">
                    <Text color={getHealthColor(status)} marginRight={1}>
                      {getHealthIcon(status)}
                    </Text>
                    <Text 
                      color={
                        status === 'healthy' ? colors.semantic.text.secondary : 
                        getHealthColor(status)
                      }
                    >
                      {getSystemComponentName(component)}
                    </Text>
                  </Box>
                ))}
              </Box>
              
              {healthSummary?.hasIssues && (
                <Box marginTop={1}>
                  <Text color={
                    healthSummary.hasCritical ? colors.semantic.state.error :
                    colors.semantic.state.warning
                  }>
                    {healthSummary.hasCritical ? '🚨' : '⚠️'} {healthSummary.issueCount} system issue{healthSummary.issueCount !== 1 ? 's' : ''} detected
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Error Messages (highest priority) */}
        {groupedItems.error.length > 0 && (
          <Box marginBottom={1}>
            {groupedItems.error.map(item => (
              <Alert key={item.id} variant="error">
                {item.title}
                {item.message && ` - ${item.message}`}
                {showTimestamps && item.timestamp && (
                  <Text dimColor> ({formatTimestamp(item.timestamp)})</Text>
                )}
              </Alert>
            ))}
          </Box>
        )}

        {/* Warning Messages */}
        {groupedItems.warning.length > 0 && (
          <Box marginBottom={1}>
            {groupedItems.warning.map(item => (
              <Alert key={item.id} variant="warning">
                {item.title}
                {item.message && ` - ${item.message}`}
                {showTimestamps && item.timestamp && (
                  <Text dimColor> ({formatTimestamp(item.timestamp)})</Text>
                )}
              </Alert>
            ))}
          </Box>
        )}

        {/* Success Messages */}
        {groupedItems.success.length > 0 && (
          <Box marginBottom={1}>
            {groupedItems.success.map(item => (
              <StatusMessage key={item.id} variant="success">
                {item.title}
                {item.message && ` - ${item.message}`}
                {showTimestamps && item.timestamp && (
                  <Text dimColor> ({formatTimestamp(item.timestamp)})</Text>
                )}
              </StatusMessage>
            ))}
          </Box>
        )}

        {/* Info Messages */}
        {groupedItems.info.length > 0 && (
          <Box marginBottom={1}>
            {groupedItems.info.map(item => (
              <StatusMessage key={item.id} variant="info">
                {item.title}
                {item.message && ` - ${item.message}`}
                {showTimestamps && item.timestamp && (
                  <Text dimColor> ({formatTimestamp(item.timestamp)})</Text>
                )}
              </StatusMessage>
            ))}
          </Box>
        )}

        {/* Message Details (expandable) */}
        {visibleItems.some(item => item.details && item.details.length > 0) && (
          <Box 
            borderStyle="single"
            borderColor={colors.neutral[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column" width="100%">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                📋 Message Details
              </Text>
              
              {visibleItems.filter(item => item.details && item.details.length > 0).map(item => (
                <Box key={`${item.id}-details`} flexDirection="column" marginBottom={1}>
                  <Text color={colors.semantic.text.primary} bold>
                    {item.title}:
                  </Text>
                  <Box marginLeft={2} flexDirection="column">
                    {item.details!.map((detail, index) => (
                      <Text key={index} color={colors.semantic.text.secondary}>
                        • {detail}
                      </Text>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Summary Statistics */}
        {visibleItems.length > 0 && (
          <Box 
            marginTop={1}
            borderTop
            borderColor={colors.neutral[200]}
            paddingTop={1}
          >
            <Text color={colors.semantic.text.secondary}>
              Status: {groupedItems.error.length > 0 ? (
                <Text color={colors.semantic.state.error}>
                  {groupedItems.error.length} error{groupedItems.error.length !== 1 ? 's' : ''}
                </Text>
              ) : groupedItems.warning.length > 0 ? (
                <Text color={colors.semantic.state.warning}>
                  {groupedItems.warning.length} warning{groupedItems.warning.length !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text color={colors.semantic.state.success}>All systems operational</Text>
              )}
              
              {hiddenItemIds.size > 0 && (
                <Text color={colors.semantic.text.tertiary}>
                  {' '}(+{hiddenItemIds.size} hidden)
                </Text>
              )}
            </Text>
          </Box>
        )}

        {/* No Status Items */}
        {visibleItems.length === 0 && (
          <Box>
            <StatusMessage variant="info">
              ℹ️ No status messages to display
            </StatusMessage>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default ModernStatusDisplay