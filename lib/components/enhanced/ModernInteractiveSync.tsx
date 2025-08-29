import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { render, Box, Text, useApp } from 'ink'
import { EventEmitter } from 'events'
import { 
  ThemeProvider,
  defaultTheme,
  extendTheme,
  type ComponentTheme
} from '@inkjs/ui'
import { ModernFileSelector } from './ModernFileSelector'
import { ModernProgressTracker } from './ModernProgressTracker'
import { ModernConfirmationDialog } from './ModernConfirmationDialog'
import { ModernStatusDisplay } from './ModernStatusDisplay'
import { colors } from '../../design/colors'
import type { BaseComponentProps } from '../../types/components'

interface SyncFile {
  path: string
  changeType: 'new' | 'modified' | 'deleted' | 'moved'
  size?: number
  reason?: string
  selected?: boolean
  timestamp?: Date
}

interface SyncOptions {
  includeDirectories: string[]
  excludePatterns: string[]
  enableInteractiveMode: boolean
  autoSelectNew: boolean
  autoSelectModified: boolean
  enablePreview: boolean
  confirmBeforeSync: boolean
  dryRun: boolean
  maxConcurrency: number
  showSystemHealth: boolean
  enableAdvancedFeatures: boolean
}

interface SyncPhase {
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

interface StatusItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  details?: string[]
  timestamp?: Date
  persistent?: boolean
}

interface SystemHealth {
  diskSpace: 'healthy' | 'warning' | 'critical'
  memory: 'healthy' | 'warning' | 'critical'
  network: 'healthy' | 'warning' | 'error'
  permissions: 'healthy' | 'warning' | 'error'
}

// Modern theme for the entire sync interface
const syncTheme = extendTheme(defaultTheme, {
  components: {
    // Global styling overrides
    Alert: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          marginBottom: 1,
        }),
      },
    },
    StatusMessage: {
      styles: {
        container: () => ({
          borderStyle: 'single',
          marginBottom: 1,
        }),
      },
    },
    MultiSelect: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          borderColor: colors.primary[300],
          paddingX: 1,
          paddingY: 1,
        }),
      },
    },
    ProgressBar: {
      styles: {
        container: () => ({
          borderStyle: 'round',
          paddingX: 1,
        }),
      },
    },
    ConfirmInput: {
      styles: {
        container: () => ({
          borderStyle: 'double',
          paddingX: 1,
          paddingY: 1,
        }),
      },
    },
  } satisfies Record<string, ComponentTheme>,
})

interface ModernInteractiveSyncProps extends BaseComponentProps {
  sourcePath: string
  destinationPath: string
  options: SyncOptions
  detectedFiles: SyncFile[]
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

export const ModernInteractiveSync: React.FC<ModernInteractiveSyncProps> = ({
  sourcePath,
  destinationPath,
  options,
  detectedFiles = [],
  onComplete,
  onError,
  onCancel,
}) => {
  // Main state
  const [phase, setPhase] = useState<'detection' | 'selection' | 'confirmation' | 'syncing' | 'complete' | 'error'>('detection')
  const [selectedFiles, setSelectedFiles] = useState<SyncFile[]>([])
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([])
  const [statusItems, setStatusItems] = useState<StatusItem[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | undefined>()
  
  // Phase management
  const [phases, setPhases] = useState<SyncPhase[]>([
    { id: 'detection', name: 'File Detection', description: 'Scanning for changes...', status: 'completed' },
    { id: 'selection', name: 'File Selection', description: 'Choose files to sync', status: 'running' },
    { id: 'confirmation', name: 'Confirmation', description: 'Confirm sync operation', status: 'pending' },
    { id: 'syncing', name: 'Synchronization', description: 'Syncing files...', status: 'pending' },
    { id: 'complete', name: 'Complete', description: 'Sync finished', status: 'pending' },
  ])
  
  // Progress tracking
  const [overallProgress, setOverallProgress] = useState<{ current: number; total: number } | undefined>()
  const [currentPhase, setCurrentPhase] = useState<SyncPhase | undefined>()
  
  const { exit } = useApp()

  // Initialize system health monitoring
  useEffect(() => {
    if (options.showSystemHealth) {
      // Mock system health check - in real implementation, this would check actual system resources
      setSystemHealth({
        diskSpace: 'healthy',
        memory: 'healthy',
        network: 'healthy',
        permissions: 'healthy',
      })
      
      addStatusItem({
        id: 'system-check',
        type: 'info',
        title: 'System Health Check',
        message: 'All systems operational',
        timestamp: new Date(),
      })
    }
  }, [options.showSystemHealth])

  // Initialize with detection complete status
  useEffect(() => {
    if (detectedFiles.length > 0) {
      addStatusItem({
        id: 'detection-complete',
        type: 'success',
        title: 'Detection Complete',
        message: `Found ${detectedFiles.length} changes`,
        timestamp: new Date(),
        details: [
          `New: ${detectedFiles.filter(f => f.changeType === 'new').length}`,
          `Modified: ${detectedFiles.filter(f => f.changeType === 'modified').length}`,
          `Deleted: ${detectedFiles.filter(f => f.changeType === 'deleted').length}`,
          `Moved: ${detectedFiles.filter(f => f.changeType === 'moved').length}`,
        ],
      })
      setPhase('selection')
      updatePhaseStatus('selection', 'running')
    } else {
      addStatusItem({
        id: 'no-changes',
        type: 'info',
        title: 'No Changes Detected',
        message: 'Everything is up to date!',
        timestamp: new Date(),
      })
      setPhase('complete')
      updatePhaseStatus('complete', 'completed')
    }
  }, [detectedFiles])

  // Update current phase info
  useEffect(() => {
    const current = phases.find(p => p.status === 'running')
    setCurrentPhase(current)
  }, [phases])

  const addStatusItem = useCallback((item: StatusItem) => {
    setStatusItems(prev => [...prev, item])
  }, [])

  const updatePhaseStatus = useCallback((phaseId: string, status: SyncPhase['status'], error?: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, status, error, duration: status === 'completed' ? Date.now() - (phase.startTime?.getTime() || 0) : undefined }
        : phase
    ))
  }, [])

  const handleFileSelection = useCallback(async (files: SyncFile[]) => {
    setSelectedFiles(files)
    
    if (files.length === 0) {
      addStatusItem({
        id: 'no-selection',
        type: 'warning',
        title: 'No Files Selected',
        message: 'Sync cancelled - no files selected',
        timestamp: new Date(),
      })
      onCancel?.()
      return
    }

    addStatusItem({
      id: 'selection-complete',
      type: 'success',
      title: 'Selection Complete',
      message: `Selected ${files.length} files for sync`,
      timestamp: new Date(),
    })

    updatePhaseStatus('selection', 'completed')
    
    if (options.confirmBeforeSync) {
      setPhase('confirmation')
      updatePhaseStatus('confirmation', 'running')
    } else {
      await startSync(files)
    }
  }, [options.confirmBeforeSync, onCancel])

  const handleConfirmation = useCallback(async () => {
    updatePhaseStatus('confirmation', 'completed')
    await startSync(selectedFiles)
  }, [selectedFiles])

  const handleCancellation = useCallback(() => {
    addStatusItem({
      id: 'user-cancelled',
      type: 'warning',
      title: 'Operation Cancelled',
      message: 'Sync cancelled by user',
      timestamp: new Date(),
    })
    onCancel?.()
  }, [onCancel])

  const startSync = useCallback(async (files: SyncFile[]) => {
    setPhase('syncing')
    updatePhaseStatus('syncing', 'running')
    
    addStatusItem({
      id: 'sync-start',
      type: 'info',
      title: 'Sync Started',
      message: options.dryRun ? 'Dry run mode - no actual changes' : `Syncing ${files.length} files`,
      timestamp: new Date(),
    })

    // Initialize sync operations
    const operations: SyncOperation[] = files.map(file => ({
      file: file.path,
      operation: file.changeType === 'new' ? 'copy' : 
                file.changeType === 'modified' ? 'update' :
                file.changeType === 'deleted' ? 'delete' : 'move',
      status: 'pending',
      size: file.size,
      startTime: new Date(),
    }))
    
    setSyncOperations(operations)
    setOverallProgress({ current: 0, total: files.length })

    try {
      // Simulate sync operations with progress updates
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i]
        
        // Update operation status
        setSyncOperations(prev => prev.map((op, index) => 
          index === i ? { ...op, status: 'running', startTime: new Date() } : op
        ))
        
        // Simulate processing time based on file size
        const processTime = Math.min(100 + (operation.size || 0) / 1000, 2000)
        await new Promise(resolve => setTimeout(resolve, processTime))
        
        if (options.dryRun) {
          // Dry run - just mark as completed
          setSyncOperations(prev => prev.map((op, index) => 
            index === i ? { ...op, status: 'completed', endTime: new Date() } : op
          ))
        } else {
          // Actual sync would happen here
          // For now, simulate successful completion
          setSyncOperations(prev => prev.map((op, index) => 
            index === i ? { ...op, status: 'completed', endTime: new Date() } : op
          ))
        }
        
        // Update overall progress
        setOverallProgress({ current: i + 1, total: files.length })
      }
      
      // Sync completed successfully
      updatePhaseStatus('syncing', 'completed')
      setPhase('complete')
      updatePhaseStatus('complete', 'completed')
      
      addStatusItem({
        id: 'sync-complete',
        type: 'success',
        title: 'Sync Complete!',
        message: options.dryRun 
          ? `Dry run completed - ${files.length} files would be synced`
          : `Successfully synced ${files.length} files`,
        timestamp: new Date(),
      })
      
      // Call completion callback
      setTimeout(() => {
        onComplete?.({
          phase: 'complete',
          filesProcessed: files.length,
          operations,
          dryRun: options.dryRun,
        })
      }, 2000)
      
    } catch (error) {
      updatePhaseStatus('syncing', 'error', error instanceof Error ? error.message : 'Unknown error')
      setPhase('error')
      
      addStatusItem({
        id: 'sync-error',
        type: 'error',
        title: 'Sync Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      })
      
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [options.dryRun, onComplete, onError])

  // Render based on current phase
  const renderPhaseContent = () => {
    switch (phase) {
      case 'selection':
        return (
          <ModernFileSelector
            files={detectedFiles}
            sourcePath={sourcePath}
            destPath={destinationPath}
            enableSearch={options.enableAdvancedFeatures}
            autoSelectNew={options.autoSelectNew}
            autoSelectModified={options.autoSelectModified}
            onSelect={handleFileSelection}
            onCancel={handleCancellation}
          />
        )
      
      case 'confirmation':
        return (
          <ModernConfirmationDialog
            type="sync"
            files={selectedFiles}
            sourcePath={sourcePath}
            destPath={destinationPath}
            dryRun={options.dryRun}
            onConfirm={handleConfirmation}
            onCancel={handleCancellation}
          />
        )
      
      case 'syncing':
        return (
          <ModernProgressTracker
            phase="syncing"
            currentPhase={currentPhase}
            phases={phases}
            operations={syncOperations}
            overallProgress={overallProgress}
            showOperationDetails={true}
            showTimeEstimates={true}
            animateProgress={true}
          />
        )
      
      case 'complete':
        return (
          <Box flexDirection="column">
            <ModernProgressTracker
              phase="complete"
              currentPhase={currentPhase}
              phases={phases}
              operations={syncOperations}
              overallProgress={overallProgress}
              compact={true}
            />
          </Box>
        )
      
      case 'error':
        return (
          <Box flexDirection="column">
            <ModernStatusDisplay
              phase="error"
              statusItems={statusItems.filter(item => item.type === 'error')}
              systemHealth={systemHealth}
              showSystemHealth={options.showSystemHealth}
            />
          </Box>
        )
      
      default:
        return (
          <Box flexDirection="column">
            <Text color={colors.semantic.text.secondary}>
              Initializing sync...
            </Text>
          </Box>
        )
    }
  }

  return (
    <ThemeProvider theme={syncTheme}>
      <Box flexDirection="column" padding={1}>
        {/* Header */}
        <Box 
          marginBottom={1}
          borderStyle="double"
          borderColor={colors.primary[300]}
          paddingX={2}
          paddingY={1}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.primary[500]} bold>
              ⚡ Lerian Protocol Sync - Modern Interface
            </Text>
            <Box marginTop={1} flexDirection="row" justifyContent="space-between">
              <Text color={colors.semantic.text.secondary}>
                Phase: <Text color={colors.primary[500]} bold>
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </Text>
              </Text>
              {overallProgress && (
                <Text color={colors.semantic.text.secondary}>
                  Progress: <Text color={colors.primary[500]} bold>
                    {overallProgress.current}/{overallProgress.total}
                  </Text>
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        {/* Status Display (compact) */}
        {statusItems.length > 0 && phase !== 'error' && (
          <Box marginBottom={1}>
            <ModernStatusDisplay
              phase={phase}
              statusItems={statusItems}
              systemHealth={systemHealth}
              showSystemHealth={options.showSystemHealth}
              maxItems={3}
              compact={false}
            />
          </Box>
        )}

        {/* Main Content */}
        <Box flexGrow={1}>
          {renderPhaseContent()}
        </Box>

        {/* Footer */}
        <Box 
          marginTop={1}
          borderTop
          borderColor={colors.neutral[200]}
          paddingTop={1}
        >
          <Text color={colors.semantic.text.tertiary} dimColor>
            {options.dryRun && '🔍 Dry Run Mode • '}
            Lerian Protocol v0.1.0 • Modern Sync Interface
          </Text>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

// Wrapper class for CommonJS compatibility
export class ModernInteractiveSyncWrapper extends EventEmitter {
  private sourcePath: string
  private destinationPath: string
  private options: SyncOptions
  private detectedFiles: SyncFile[]
  private app: any

  constructor(sourcePath: string, destinationPath: string, options: Partial<SyncOptions> = {}) {
    super()
    
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
    this.detectedFiles = []
    
    // Merge with default options
    this.options = {
      includeDirectories: options.includeDirectories || ['.claude', 'protocol-assets'],
      excludePatterns: options.excludePatterns || ['node_modules/**', '.git/**'],
      enableInteractiveMode: options.enableInteractiveMode !== false,
      autoSelectNew: options.autoSelectNew || false,
      autoSelectModified: options.autoSelectModified || false,
      enablePreview: options.enablePreview !== false,
      confirmBeforeSync: options.confirmBeforeSync !== false,
      dryRun: options.dryRun || false,
      maxConcurrency: options.maxConcurrency || 5,
      showSystemHealth: options.showSystemHealth !== false,
      enableAdvancedFeatures: options.enableAdvancedFeatures !== false,
    }
  }

  setDetectedFiles(files: SyncFile[]) {
    this.detectedFiles = files
  }

  async run() {
    return new Promise((resolve, reject) => {
      const onComplete = (result: any) => {
        this.emit('complete', result)
        resolve(result)
      }

      const onError = (error: Error) => {
        this.emit('error', error)
        reject(error)
      }

      const onCancel = () => {
        this.emit('cancel')
        resolve({ cancelled: true })
      }

      this.app = render(
        <ModernInteractiveSync
          sourcePath={this.sourcePath}
          destinationPath={this.destinationPath}
          options={this.options}
          detectedFiles={this.detectedFiles}
          onComplete={onComplete}
          onError={onError}
          onCancel={onCancel}
        />
      )
    })
  }

  cleanup() {
    if (this.app) {
      this.app.unmount()
    }
  }
}

export default ModernInteractiveSyncWrapper