import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { colors } from '../../design/colors'
import { useKeyboardShortcuts } from './KeyboardShortcuts'
import { BaseComponentProps } from '../../types/components'

export interface QuickAction {
  key: string
  label: string
  description?: string
  icon?: string
  action: () => void
  category?: string
  color?: string
  disabled?: boolean
  danger?: boolean
}

export interface QuickActionsProps extends BaseComponentProps {
  actions: QuickAction[]
  title?: string
  showIcons?: boolean
  showDescriptions?: boolean
  columns?: number
  maxHeight?: number
  visible?: boolean
  onClose?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = 'Quick Actions',
  showIcons = true,
  showDescriptions = true,
  columns = 2,
  maxHeight = 15,
  visible = true,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { registerShortcut } = useKeyboardShortcuts()

  // Register shortcuts for all actions
  useEffect(() => {
    const cleanupFunctions = actions.map(action => 
      registerShortcut({
        key: action.key,
        label: action.label,
        description: action.description,
        action: action.action,
        category: action.category || 'Quick Actions',
        disabled: action.disabled,
        global: false, // Only active when QuickActions is visible
      })
    )

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [actions, registerShortcut])

  useInput((input, key) => {
    if (!visible) return

    if (key.escape && onClose) {
      onClose()
      return
    }

    // Handle arrow navigation
    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - columns))
    } else if (key.downArrow) {
      const maxIndex = Math.max(0, actions.length - 1)
      setSelectedIndex(Math.min(maxIndex, selectedIndex + columns))
    } else if (key.leftArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1))
    } else if (key.rightArrow) {
      const maxIndex = Math.max(0, actions.length - 1)
      setSelectedIndex(Math.min(maxIndex, selectedIndex + 1))
    } else if (key.return) {
      // Execute selected action
      const action = actions[selectedIndex]
      if (action && !action.disabled) {
        action.action()
      }
    }

    // Handle direct key shortcuts
    const action = actions.find(a => 
      a.key.toLowerCase() === input.toLowerCase() && !a.disabled
    )
    if (action) {
      action.action()
    }
  })

  if (!visible) return null

  // Group actions into rows
  const rows = []
  for (let i = 0; i < actions.length; i += columns) {
    rows.push(actions.slice(i, i + columns))
  }

  const ActionCard = ({ action, index, isSelected }: { 
    action: QuickAction
    index: number
    isSelected: boolean 
  }) => {
    const borderColor = action.danger 
      ? colors.semantic.state.error 
      : action.color 
        ? action.color 
        : isSelected 
          ? colors.primary[400]
          : colors.neutral[300]

    const textColor = action.disabled
      ? colors.semantic.text.disabled
      : action.danger
        ? colors.semantic.state.error
        : isSelected
          ? colors.primary[600]
          : colors.semantic.text.primary

    return (
      <Box
        flexGrow={1}
        marginX={1}
        marginY={0.5}
        paddingX={2}
        paddingY={1}
        borderStyle={isSelected ? 'double' : 'single'}
        borderColor={borderColor}
        backgroundColor={isSelected ? colors.primary[50] : undefined}
        opacity={action.disabled ? 0.5 : 1}
      >
        <Box flexDirection="column" width="100%">
          {/* Header with icon and key */}
          <Box alignItems="center" justifyContent="space-between" marginBottom={0.5}>
            <Box alignItems="center">
              {showIcons && action.icon && (
                <Text color={textColor} marginRight={1}>
                  {action.icon}
                </Text>
              )}
              <Text color={textColor} bold={!action.disabled}>
                {action.label}
              </Text>
            </Box>
            
            {/* Key indicator */}
            <Text 
              color={isSelected ? colors.primary[500] : colors.semantic.text.tertiary}
              backgroundColor={isSelected ? colors.primary[100] : colors.neutral[100]}
              bold
            >
              {action.key.toUpperCase()}
            </Text>
          </Box>
          
          {/* Description */}
          {showDescriptions && action.description && (
            <Text 
              color={action.disabled ? colors.semantic.text.disabled : colors.semantic.text.secondary} 
              dimColor={!isSelected}
            >
              {action.description}
            </Text>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" maxHeight={maxHeight}>
      {/* Title */}
      {title && (
        <Box marginBottom={1} alignItems="center" justifyContent="center">
          <Text color={colors.primary[500]} bold>
            {title}
          </Text>
        </Box>
      )}

      {/* Actions grid */}
      <Box flexDirection="column" overflowY="auto">
        {rows.map((row, rowIndex) => (
          <Box key={rowIndex} alignItems="stretch">
            {row.map((action, colIndex) => {
              const actionIndex = rowIndex * columns + colIndex
              return (
                <ActionCard
                  key={action.key}
                  action={action}
                  index={actionIndex}
                  isSelected={actionIndex === selectedIndex}
                />
              )
            })}
            
            {/* Fill empty columns */}
            {row.length < columns && (
              <Box flexGrow={row.length === 1 ? columns - 1 : 0} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box 
        marginTop={1} 
        borderTop 
        borderColor={colors.neutral[200]} 
        paddingTop={1}
        justifyContent="center"
      >
        <Text color={colors.semantic.text.tertiary} dimColor>
          Use arrow keys to navigate • Enter to execute • ESC to close
        </Text>
      </Box>
    </Box>
  )
}

// Predefined action sets
export const syncActions: QuickAction[] = [
  {
    key: 'a',
    label: 'Select All',
    description: 'Select all files for sync',
    icon: '☑️',
    action: () => console.log('Select all'),
    category: 'Selection',
  },
  {
    key: 'c',
    label: 'Clear Selection',
    description: 'Clear all selected files',
    icon: '☐',
    action: () => console.log('Clear selection'),
    category: 'Selection',
  },
  {
    key: 'i',
    label: 'Invert Selection',
    description: 'Invert current selection',
    icon: '🔄',
    action: () => console.log('Invert selection'),
    category: 'Selection',
  },
  {
    key: 'f',
    label: 'Filter Files',
    description: 'Filter files by type or status',
    icon: '🔍',
    action: () => console.log('Filter files'),
    category: 'Navigation',
  },
  {
    key: 's',
    label: 'Start Sync',
    description: 'Begin synchronization process',
    icon: '⚡',
    action: () => console.log('Start sync'),
    category: 'Action',
    color: colors.semantic.state.success,
  },
  {
    key: 'd',
    label: 'Delete All',
    description: 'Delete selected files (dangerous)',
    icon: '🗑️',
    action: () => console.log('Delete all'),
    category: 'Action',
    danger: true,
  },
]

export default QuickActions