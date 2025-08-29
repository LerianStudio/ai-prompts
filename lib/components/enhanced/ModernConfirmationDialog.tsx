import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import { 
  ConfirmInput, 
  Alert,
  StatusMessage,
  ThemeProvider,
  defaultTheme,
  extendTheme,
  type ComponentTheme
} from '@inkjs/ui'
import { BaseComponentProps } from '../../types/components'
import { colors } from '../../design/colors'

interface SyncFile {
  path: string
  changeType: 'new' | 'modified' | 'deleted' | 'moved'
  size?: number
  reason?: string
}

interface ConfirmationDetails {
  title: string
  message?: string
  warningLevel: 'low' | 'medium' | 'high' | 'critical'
  showFileList?: boolean
  showSizeInfo?: boolean
  showTimeEstimate?: boolean
  customActions?: Array<{
    key: string
    label: string
    description?: string
    dangerous?: boolean
  }>
}

interface ModernConfirmationDialogProps extends BaseComponentProps {
  type: 'sync' | 'delete' | 'overwrite' | 'cancel' | 'custom'
  files: SyncFile[]
  sourcePath: string
  destPath: string
  details?: ConfirmationDetails
  estimatedDuration?: number
  dryRun?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  onCustomAction?: (actionKey: string) => void
}

// Custom theme for confirmation dialogs
const confirmationTheme = extendTheme(defaultTheme, {
  components: {
    ConfirmInput: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          borderColor: colors.semantic.state.warning,
          paddingX: 1,
          paddingY: 1,
        }),
      },
    },
    Alert: {
      styles: {
        container: () => ({
          borderStyle: 'double',
          marginBottom: 1,
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

export const ModernConfirmationDialog: React.FC<ModernConfirmationDialogProps> = ({
  type,
  files = [],
  sourcePath = '',
  destPath = '',
  details,
  estimatedDuration,
  dryRun = false,
  onConfirm,
  onCancel,
  onCustomAction,
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  // Generate default confirmation details based on type
  const confirmationDetails = useMemo((): ConfirmationDetails => {
    if (details) return details

    switch (type) {
      case 'sync':
        return {
          title: dryRun ? '🔍 Dry Run Confirmation' : '⚡ Sync Confirmation',
          message: dryRun 
            ? `Preview sync operation for ${files.length} file${files.length !== 1 ? 's' : ''}`
            : `Ready to sync ${files.length} file${files.length !== 1 ? 's' : ''}`,
          warningLevel: files.length > 50 ? 'high' : files.length > 10 ? 'medium' : 'low',
          showFileList: true,
          showSizeInfo: true,
          showTimeEstimate: true,
        }
      
      case 'delete':
        return {
          title: '🗑️  Delete Confirmation',
          message: `This will permanently delete ${files.length} file${files.length !== 1 ? 's' : ''}`,
          warningLevel: 'critical',
          showFileList: true,
          showSizeInfo: false,
          showTimeEstimate: false,
        }
      
      case 'overwrite':
        return {
          title: '⚠️  Overwrite Confirmation',
          message: `This will overwrite ${files.length} existing file${files.length !== 1 ? 's' : ''}`,
          warningLevel: 'high',
          showFileList: true,
          showSizeInfo: true,
          showTimeEstimate: false,
        }
      
      case 'cancel':
        return {
          title: '🚫 Cancel Confirmation',
          message: 'Are you sure you want to cancel the sync operation?',
          warningLevel: 'low',
          showFileList: false,
          showSizeInfo: false,
          showTimeEstimate: false,
        }
      
      default:
        return {
          title: '❓ Confirmation Required',
          message: 'Please confirm this operation',
          warningLevel: 'medium',
          showFileList: false,
          showSizeInfo: false,
          showTimeEstimate: false,
        }
    }
  }, [type, files.length, dryRun, details])

  // Calculate statistics
  const stats = useMemo(() => {
    const byType = {
      new: files.filter(f => f.changeType === 'new').length,
      modified: files.filter(f => f.changeType === 'modified').length,
      deleted: files.filter(f => f.changeType === 'deleted').length,
      moved: files.filter(f => f.changeType === 'moved').length,
    }
    
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
    
    return {
      total: files.length,
      byType,
      totalSize,
      hasLargeFiles: files.some(f => (f.size || 0) > 10 * 1024 * 1024), // > 10MB
      avgFileSize: files.length > 0 ? totalSize / files.length : 0,
    }
  }, [files])

  // Handle keyboard input for custom actions
  useInput((input, key) => {
    if (confirmationDetails.customActions) {
      const action = confirmationDetails.customActions.find(a => a.key === input)
      if (action) {
        setSelectedAction(action.key)
        onCustomAction?.(action.key)
        return
      }
    }

    switch (input) {
      case 'd':
      case 'D':
        setShowDetails(!showDetails)
        break
      default:
        break
    }
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.round((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getWarningVariant = (level: string): 'info' | 'success' | 'error' | 'warning' => {
    switch (level) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'warning'
    }
  }

  const getWarningIcon = (level: string): string => {
    switch (level) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '❓'
    }
  }

  const getStatusIcon = (changeType: string): string => {
    switch (changeType) {
      case 'new': return '✨'
      case 'modified': return '📝'
      case 'deleted': return '🗑️'
      case 'moved': return '📁'
      default: return '📄'
    }
  }

  const getStatusColor = (changeType: string): string => {
    switch (changeType) {
      case 'new': return colors.semantic.state.success
      case 'modified': return colors.semantic.state.warning
      case 'deleted': return colors.semantic.state.error
      case 'moved': return colors.primary[500]
      default: return colors.semantic.text.secondary
    }
  }

  return (
    <ThemeProvider theme={confirmationTheme}>
      <Box flexDirection="column">
        {/* Main Alert */}
        <Alert variant={getWarningVariant(confirmationDetails.warningLevel)}>
          {getWarningIcon(confirmationDetails.warningLevel)} {confirmationDetails.title}
          {confirmationDetails.message && (
            <Text> - {confirmationDetails.message}</Text>
          )}
        </Alert>

        {/* Path Information */}
        <Box 
          marginBottom={1}
          borderStyle="single"
          borderColor={colors.neutral[300]}
          paddingX={1}
          paddingY={1}
        >
          <Box flexDirection="column" width="100%">
            <Box marginBottom={1}>
              <Text color={colors.semantic.text.secondary}>
                From: <Text color={colors.semantic.text.primary}>{sourcePath}</Text>
              </Text>
            </Box>
            <Box>
              <Text color={colors.semantic.text.secondary}>
                To: <Text color={colors.semantic.text.primary}>{destPath}</Text>
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Operation Summary */}
        <Box 
          marginBottom={1}
          borderStyle="single"
          borderColor={colors.neutral[300]}
          paddingX={1}
          paddingY={1}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.primary[500]} bold marginBottom={1}>
              📊 Operation Summary
            </Text>
            
            {/* File counts by type */}
            <Box marginBottom={1} flexDirection="row" columnGap={2}>
              {Object.entries(stats.byType).map(([changeType, count]) => {
                if (count === 0) return null
                return (
                  <Text key={changeType} color={getStatusColor(changeType)}>
                    {getStatusIcon(changeType)} {count}
                  </Text>
                )
              })}
            </Box>
            
            {/* Size and time info */}
            <Box flexDirection="row" justifyContent="space-between">
              {confirmationDetails.showSizeInfo && stats.totalSize > 0 && (
                <Text color={colors.semantic.text.secondary}>
                  Total size: <Text color={colors.semantic.text.primary}>
                    {formatFileSize(stats.totalSize)}
                  </Text>
                </Text>
              )}
              
              {confirmationDetails.showTimeEstimate && estimatedDuration && (
                <Text color={colors.semantic.text.secondary}>
                  Estimated time: <Text color={colors.semantic.text.primary}>
                    {formatDuration(estimatedDuration)}
                  </Text>
                </Text>
              )}
            </Box>

            {/* Warning indicators */}
            {stats.hasLargeFiles && (
              <Box marginTop={1}>
                <StatusMessage variant="warning">
                  ⚠️ Contains large files (&gt;10MB) - operation may take longer
                </StatusMessage>
              </Box>
            )}
          </Box>
        </Box>

        {/* File List (collapsible) */}
        {confirmationDetails.showFileList && files.length > 0 && (
          <Box 
            marginBottom={1}
            borderStyle="single"
            borderColor={colors.neutral[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column" width="100%">
              <Box marginBottom={1} justifyContent="space-between" alignItems="center">
                <Text color={colors.primary[500]} bold>
                  📁 Files ({files.length})
                </Text>
                <Text color={colors.semantic.text.secondary}>
                  Press <Text color={colors.primary[500]} bold>d</Text> to {showDetails ? 'hide' : 'show'} details
                </Text>
              </Box>
              
              {showDetails ? (
                <Box flexDirection="column" height={Math.min(files.length + 1, 8)}>
                  {files.slice(0, 20).map((file, index) => (
                    <Box key={file.path} alignItems="center">
                      <Text color={getStatusColor(file.changeType)} marginRight={1}>
                        {getStatusIcon(file.changeType)}
                      </Text>
                      <Text 
                        color={colors.semantic.text.primary}
                        flexGrow={1}
                      >
                        {file.path}
                      </Text>
                      {file.size && (
                        <Text color={colors.semantic.text.tertiary} dimColor>
                          {formatFileSize(file.size)}
                        </Text>
                      )}
                    </Box>
                  ))}
                  
                  {files.length > 20 && (
                    <Text color={colors.semantic.text.tertiary} dimColor>
                      ... and {files.length - 20} more files
                    </Text>
                  )}
                </Box>
              ) : (
                <Text color={colors.semantic.text.secondary}>
                  {files.slice(0, 3).map(f => f.path.split('/').pop()).join(', ')}
                  {files.length > 3 && ` and ${files.length - 3} more...`}
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Custom Actions */}
        {confirmationDetails.customActions && confirmationDetails.customActions.length > 0 && (
          <Box 
            marginBottom={1}
            borderStyle="single"
            borderColor={colors.primary[300]}
            paddingX={1}
            paddingY={1}
          >
            <Box flexDirection="column" width="100%">
              <Text color={colors.primary[500]} bold marginBottom={1}>
                🎛️ Available Actions
              </Text>
              {confirmationDetails.customActions.map(action => (
                <Box key={action.key} alignItems="center" marginBottom={1}>
                  <Text 
                    color={action.dangerous ? colors.semantic.state.error : colors.primary[500]} 
                    bold
                    marginRight={1}
                  >
                    {action.key}
                  </Text>
                  <Text 
                    color={selectedAction === action.key ? colors.primary[600] : colors.semantic.text.primary}
                    flexGrow={1}
                  >
                    {action.label}
                  </Text>
                  {action.description && (
                    <Text color={colors.semantic.text.secondary} dimColor>
                      {action.description}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Dry Run Warning */}
        {dryRun && (
          <Box marginBottom={1}>
            <StatusMessage variant="info">
              🔍 This is a dry run - no actual changes will be made
            </StatusMessage>
          </Box>
        )}

        {/* Confirmation Input */}
        <Box 
          borderStyle="double"
          borderColor={
            confirmationDetails.warningLevel === 'critical' ? colors.semantic.state.error :
            confirmationDetails.warningLevel === 'high' ? colors.semantic.state.error :
            colors.semantic.state.warning
          }
          paddingX={1}
          paddingY={1}
        >
          <Box flexDirection="column" width="100%">
            <ConfirmInput
              defaultChoice={confirmationDetails.warningLevel === 'critical' ? 'cancel' : 'confirm'}
              submitOnEnter={confirmationDetails.warningLevel !== 'critical'}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
            
            {confirmationDetails.warningLevel === 'critical' && (
              <Box marginTop={1}>
                <Text color={colors.semantic.state.error} dimColor>
                  ⚠️ This is a destructive operation. Please confirm explicitly with Y/N
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ModernConfirmationDialog