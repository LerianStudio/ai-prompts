import React, { useMemo } from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../design/colors'
import { spacing } from '../../design/spacing'
import { SmartProgress } from './SmartProgress'
import { ProgressGroupProps } from '../../types/components'

export const ProgressGroup: React.FC<ProgressGroupProps> = ({
  items,
  title,
  showOverall = true,
  overallLabel = 'Overall Progress',
  variant = 'default',
  size = 'md',
  animated = true,
  maxHeight,
  style,
  onComplete,
  onItemComplete,
  onProgress,
}) => {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (items.length === 0) return { current: 0, total: 0 }
    
    const totalCurrent = items.reduce((sum, item) => sum + item.current, 0)
    const totalMax = items.reduce((sum, item) => sum + item.total, 0)
    
    return { current: totalCurrent, total: totalMax }
  }, [items])

  // Calculate completion status
  const completionStats = useMemo(() => {
    const completed = items.filter(item => item.current >= item.total).length
    const inProgress = items.filter(item => item.current > 0 && item.current < item.total).length
    const pending = items.filter(item => item.current === 0).length
    
    return { completed, inProgress, pending, total: items.length }
  }, [items])

  // Group items by status for better organization
  const groupedItems = useMemo(() => {
    const groups = {
      inProgress: items.filter(item => item.current > 0 && item.current < item.total),
      completed: items.filter(item => item.current >= item.total),
      pending: items.filter(item => item.current === 0)
    }
    
    return groups
  }, [items])

  const handleItemProgress = (index: number, current: number, total: number, percentage: number) => {
    onProgress?.(index, current, total, percentage)
  }

  const handleItemComplete = (index: number) => {
    onItemComplete?.(index)
    
    // Check if all items are complete
    const allComplete = items.every(item => item.current >= item.total)
    if (allComplete) {
      onComplete?.()
    }
  }

  const StatusSummary = () => (
    <Box marginBottom={1}>
      <Text color={colors.semantic.text.secondary}>
        {completionStats.completed > 0 && (
          <Text color={colors.semantic.state.success}>
            ✓ {completionStats.completed} completed
          </Text>
        )}
        {completionStats.completed > 0 && completionStats.inProgress > 0 && ' • '}
        {completionStats.inProgress > 0 && (
          <Text color={colors.primary[500]}>
            ⟳ {completionStats.inProgress} in progress
          </Text>
        )}
        {(completionStats.completed > 0 || completionStats.inProgress > 0) && completionStats.pending > 0 && ' • '}
        {completionStats.pending > 0 && (
          <Text color={colors.semantic.text.tertiary}>
            ○ {completionStats.pending} pending
          </Text>
        )}
      </Text>
    </Box>
  )

  const ItemGroup = ({ title, items: groupItems, showTitle = true }: { 
    title: string
    items: typeof items
    showTitle?: boolean 
  }) => {
    if (groupItems.length === 0) return null

    return (
      <Box flexDirection="column" marginBottom={showTitle ? 1 : 0}>
        {showTitle && (
          <Text color={colors.semantic.text.secondary} dimColor>
            {title} ({groupItems.length})
          </Text>
        )}
        <Box flexDirection="column" paddingLeft={showTitle ? 2 : 0}>
          {groupItems.map((item, index) => {
            const originalIndex = items.findIndex(original => original === item)
            
            return (
              <SmartProgress
                key={item.key || `progress-${originalIndex}`}
                current={item.current}
                total={item.total}
                label={item.label}
                variant={item.variant || variant}
                size={size}
                animated={animated}
                unit={item.unit}
                speedUnit={item.speedUnit}
                showETA={item.showETA}
                showSpeed={item.showSpeed}
                showRemaining={item.showRemaining}
                onProgress={(current, total, percentage) => 
                  handleItemProgress(originalIndex, current, total, percentage)
                }
                onComplete={() => handleItemComplete(originalIndex)}
                {...item.props}
              />
            )
          })}
        </Box>
      </Box>
    )
  }

  const containerStyle = {
    flexDirection: 'column' as const,
    ...(maxHeight && { 
      height: maxHeight,
      overflowY: 'auto' as const
    }),
    ...style
  }

  return (
    <Box {...containerStyle}>
      {/* Title */}
      {title && (
        <Box marginBottom={2}>
          <Text color={colors.semantic.text.primary} bold>
            {title}
          </Text>
        </Box>
      )}

      {/* Overall progress */}
      {showOverall && overallProgress.total > 0 && (
        <Box marginBottom={2}>
          <SmartProgress
            current={overallProgress.current}
            total={overallProgress.total}
            label={overallLabel}
            variant={variant}
            size={size === 'sm' ? 'md' : 'lg'}
            animated={animated}
            showETA={true}
            showSpeed={true}
            showRemaining={true}
          />
        </Box>
      )}

      {/* Status summary */}
      <StatusSummary />

      {/* Progress items grouped by status */}
      <Box flexDirection="column">
        {/* In progress items (most important) */}
        <ItemGroup 
          title="In Progress" 
          items={groupedItems.inProgress}
          showTitle={groupedItems.inProgress.length > 0 && (groupedItems.completed.length > 0 || groupedItems.pending.length > 0)}
        />

        {/* Pending items */}
        <ItemGroup 
          title="Pending" 
          items={groupedItems.pending}
          showTitle={groupedItems.pending.length > 0 && (groupedItems.completed.length > 0 || groupedItems.inProgress.length > 0)}
        />

        {/* Completed items (collapsed by default, can be expanded) */}
        {groupedItems.completed.length > 0 && (
          <Box marginTop={1}>
            <Text color={colors.semantic.text.tertiary} dimColor>
              ✓ {groupedItems.completed.length} items completed
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ProgressGroup