import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import { colors } from '../../design/colors'
import { borders } from '../../design/borders'
import { SmartProgress } from './SmartProgress'
import { BaseComponentProps } from '../../types/components'

interface SyncFileItem {
  path: string
  status: 'new' | 'modified' | 'deleted' | 'moved'
  size?: number
  reason?: string
  selected: boolean
  timestamp?: Date
}

interface ModernSyncProps extends BaseComponentProps {
  files: SyncFileItem[]
  phase: 'selection' | 'confirm' | 'syncing' | 'complete'
  sourcePath: string
  destPath: string
  progress?: { current: number; total: number }
  onToggleFile?: (index: number) => void
  onToggleAll?: () => void
  onConfirm?: () => void
  onCancel?: () => void
  onComplete?: () => void
}

export const ModernSync: React.FC<ModernSyncProps> = ({
  files,
  phase,
  sourcePath,
  destPath,
  progress,
  onToggleFile,
  onToggleAll,
  onConfirm,
  onCancel,
  onComplete
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files
    return files.filter(file => 
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [files, searchQuery])

  // Calculate selection stats
  const selectionStats = useMemo(() => {
    const selected = files.filter(f => f.selected)
    const byStatus = {
      new: selected.filter(f => f.status === 'new').length,
      modified: selected.filter(f => f.status === 'modified').length,
      deleted: selected.filter(f => f.status === 'deleted').length,
      moved: selected.filter(f => f.status === 'moved').length,
    }
    
    return { 
      total: selected.length,
      byStatus,
      totalSize: selected.reduce((sum, f) => sum + (f.size || 0), 0)
    }
  }, [files])

  useInput((input, key) => {
    if (phase !== 'selection') return

    switch (input) {
      case 'q':
      case 'Q':
        onCancel?.()
        break
      case 'a':
      case 'A':
        onToggleAll?.()
        break
      case 'h':
      case 'H':
      case '?':
        setShowHelp(!showHelp)
        break
      case ' ':
        onToggleFile?.(selectedIndex)
        break
      case '/':
        // Toggle search mode (simplified for demo)
        break
      default:
        if (key.return) {
          if (selectionStats.total > 0) {
            onConfirm?.()
          }
        } else if (key.upArrow) {
          setSelectedIndex(Math.max(0, selectedIndex - 1))
        } else if (key.downArrow) {
          setSelectedIndex(Math.min(filteredFiles.length - 1, selectedIndex + 1))
        }
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return { icon: '✨', color: colors.semantic.state.success }
      case 'modified': return { icon: '📝', color: colors.semantic.state.warning }
      case 'deleted': return { icon: '🗑️', color: colors.semantic.state.error }
      case 'moved': return { icon: '📁', color: colors.primary[500] }
      default: return { icon: '📄', color: colors.semantic.text.secondary }
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (phase === 'selection') {
    return (
      <Box flexDirection="column">
        {/* Header */}
        <Box 
          marginBottom={1} 
          paddingX={1} 
          paddingY={1}
          borderStyle="round"
          borderColor={colors.primary[300]}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.primary[500]} bold>
              ⚡ Lerian Protocol Sync
            </Text>
            <Box marginTop={1}>
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

        {/* File list */}
        <Box 
          flexDirection="column" 
          borderStyle="single"
          borderColor={colors.neutral[300]}
          paddingX={1}
          height={Math.min(filteredFiles.length + 2, 12)}
        >
          <Box marginBottom={1} borderBottom borderColor={colors.neutral[200]}>
            <Text color={colors.semantic.text.primary} bold>
              Select files to sync ({filteredFiles.length} files)
            </Text>
          </Box>
          
          {filteredFiles.slice(0, 10).map((file, index) => {
            const isSelected = index === selectedIndex
            const statusInfo = getStatusIcon(file.status)
            
            return (
              <Box 
                key={file.path} 
                alignItems="center"
                backgroundColor={isSelected ? colors.primary[50] : undefined}
                paddingX={1}
              >
                {/* Selection indicator */}
                <Text color={isSelected ? colors.primary[500] : colors.neutral[300]}>
                  {isSelected ? '▶ ' : '  '}
                </Text>
                
                {/* Checkbox */}
                <Text color={file.selected ? colors.semantic.state.success : colors.neutral[400]}>
                  [{file.selected ? '✓' : ' '}] 
                </Text>
                
                {/* Status icon */}
                <Text color={statusInfo.color}>
                  {statusInfo.icon} 
                </Text>
                
                {/* File path */}
                <Text 
                  color={isSelected ? colors.primary[600] : colors.semantic.text.primary}
                  flexGrow={1}
                >
                  {file.path}
                </Text>
                
                {/* File size */}
                {file.size && (
                  <Text color={colors.semantic.text.tertiary} dimColor>
                    {formatFileSize(file.size)}
                  </Text>
                )}
              </Box>
            )
          })}
          
          {filteredFiles.length > 10 && (
            <Text color={colors.semantic.text.tertiary} dimColor>
              ... and {filteredFiles.length - 10} more files
            </Text>
          )}
        </Box>

        {/* Selection summary */}
        <Box 
          marginTop={1} 
          paddingX={1} 
          borderTop 
          borderColor={colors.neutral[200]}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.primary[500]} bold>
              📊 Selection Summary
            </Text>
            <Box marginTop={1}>
              <Text color={colors.semantic.text.secondary}>
                Selected: <Text color={colors.semantic.text.primary} bold>{selectionStats.total}</Text> files
                {selectionStats.byStatus.new > 0 && (
                  <Text color={colors.semantic.state.success}> • {selectionStats.byStatus.new} new</Text>
                )}
                {selectionStats.byStatus.modified > 0 && (
                  <Text color={colors.semantic.state.warning}> • {selectionStats.byStatus.modified} modified</Text>
                )}
                {selectionStats.byStatus.deleted > 0 && (
                  <Text color={colors.semantic.state.error}> • {selectionStats.byStatus.deleted} deleted</Text>
                )}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <Box 
          marginTop={1} 
          paddingX={1} 
          paddingY={1}
          borderStyle="round"
          borderColor={colors.neutral[300]}
        >
          <Text color={colors.semantic.text.secondary}>
            <Text color={colors.primary[500]}>↑↓</Text> Navigate • 
            <Text color={colors.primary[500]}> Space</Text> Toggle • 
            <Text color={colors.primary[500]}> Enter</Text> Confirm • 
            <Text color={colors.primary[500]}> a</Text> All • 
            <Text color={colors.primary[500]}> q</Text> Quit
          </Text>
        </Box>
      </Box>
    )
  }

  if (phase === 'confirm') {
    return (
      <Box flexDirection="column">
        <Box 
          paddingX={2} 
          paddingY={1}
          borderStyle="double"
          borderColor={colors.semantic.state.warning}
          marginBottom={1}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.semantic.state.warning} bold>
              ⚠️  Confirm Sync Operation
            </Text>
            <Box marginTop={1}>
              <Text color={colors.semantic.text.primary}>
                Ready to sync <Text bold>{selectionStats.total}</Text> files:
              </Text>
            </Box>
            <Box marginLeft={2} marginTop={1}>
              <Text color={colors.semantic.text.secondary}>
                From: <Text color={colors.semantic.text.primary}>{sourcePath}</Text>
              </Text>
            </Box>
            <Box marginLeft={2}>
              <Text color={colors.semantic.text.secondary}>
                To: <Text color={colors.semantic.text.primary}>{destPath}</Text>
              </Text>
            </Box>
          </Box>
        </Box>
        
        <Text color={colors.semantic.text.secondary}>
          Press <Text color={colors.semantic.state.success} bold>y</Text> to continue, 
          <Text color={colors.semantic.state.error} bold> n</Text> to cancel
        </Text>
      </Box>
    )
  }

  if (phase === 'syncing' && progress) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={2}>
          <Text color={colors.primary[500]} bold>
            ⚡ Syncing Files...
          </Text>
        </Box>
        
        <SmartProgress
          current={progress.current}
          total={progress.total}
          label="Sync Progress"
          variant="primary"
          size="lg"
          animated={true}
          showETA={true}
          showSpeed={true}
          unit="files"
        />
      </Box>
    )
  }

  if (phase === 'complete') {
    return (
      <Box flexDirection="column">
        <Box 
          paddingX={2} 
          paddingY={1}
          borderStyle="round"
          borderColor={colors.semantic.state.success}
          marginBottom={1}
        >
          <Box flexDirection="column" width="100%">
            <Text color={colors.semantic.state.success} bold>
              ✅ Sync Complete!
            </Text>
            <Box marginTop={1}>
              <Text color={colors.semantic.text.primary}>
                Successfully synced <Text bold>{selectionStats.total}</Text> files
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return null
}

export default ModernSync