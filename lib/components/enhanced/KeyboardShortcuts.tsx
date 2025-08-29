import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Box, Text, useInput } from 'ink'
import { colors } from '../../design/colors'
import { BaseComponentProps } from '../../types/components'

export interface KeyboardShortcut {
  key: string
  label: string
  description?: string
  action: () => void
  category?: string
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta'
  global?: boolean
  disabled?: boolean
}

export interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[]
  registerShortcut: (shortcut: KeyboardShortcut) => () => void
  executeShortcut: (key: string, modifier?: string) => boolean
  isHelpVisible: boolean
  showHelp: () => void
  hideHelp: () => void
  toggleHelp: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null)

export interface KeyboardShortcutsProviderProps {
  children: ReactNode
  globalShortcuts?: KeyboardShortcut[]
  helpKey?: string
  helpModifier?: 'ctrl' | 'alt' | 'shift' | 'meta'
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
  globalShortcuts = [],
  helpKey = '?',
  helpModifier,
}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(globalShortcuts)
  const [isHelpVisible, setIsHelpVisible] = useState(false)

  const registerShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev, shortcut])
    
    // Return cleanup function
    return () => {
      setShortcuts(prev => prev.filter(s => s !== shortcut))
    }
  }

  const executeShortcut = (key: string, modifier?: string): boolean => {
    const shortcut = shortcuts.find(s => 
      s.key.toLowerCase() === key.toLowerCase() &&
      s.modifier === modifier &&
      !s.disabled
    )

    if (shortcut) {
      shortcut.action()
      return true
    }

    return false
  }

  const showHelp = () => setIsHelpVisible(true)
  const hideHelp = () => setIsHelpVisible(false)
  const toggleHelp = () => setIsHelpVisible(prev => !prev)

  // Handle global keyboard input
  useInput((input, key) => {
    // Check for help key
    if (input === helpKey && (!helpModifier || key[helpModifier])) {
      toggleHelp()
      return
    }

    // Check for escape to close help
    if (key.escape && isHelpVisible) {
      hideHelp()
      return
    }

    // Execute shortcuts (only if help is not visible or shortcut is global)
    const modifier = key.ctrl ? 'ctrl' : 
                     key.alt ? 'alt' : 
                     key.shift ? 'shift' : 
                     key.meta ? 'meta' : undefined

    const executed = executeShortcut(input, modifier)
    
    // If help is visible and a shortcut was executed, hide help
    if (executed && isHelpVisible) {
      hideHelp()
    }
  })

  const contextValue: KeyboardShortcutsContextType = {
    shortcuts,
    registerShortcut,
    executeShortcut,
    isHelpVisible,
    showHelp,
    hideHelp,
    toggleHelp,
  }

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      {isHelpVisible && <KeyboardHelp />}
    </KeyboardShortcutsContext.Provider>
  )
}

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider')
  }
  return context
}

// Hook for registering shortcuts
export const useShortcut = (shortcut: KeyboardShortcut) => {
  const { registerShortcut } = useKeyboardShortcuts()

  useEffect(() => {
    const cleanup = registerShortcut(shortcut)
    return cleanup
  }, [shortcut.key, shortcut.modifier, shortcut.disabled])
}

// Help overlay component
export const KeyboardHelp: React.FC = () => {
  const { shortcuts, hideHelp } = useKeyboardShortcuts()

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(shortcut)
    return groups
  }, {} as Record<string, KeyboardShortcut[]>)

  const formatKey = (key: string, modifier?: string) => {
    const parts = []
    if (modifier) {
      parts.push(modifier.charAt(0).toUpperCase() + modifier.slice(1))
    }
    parts.push(key.toUpperCase())
    return parts.join('+')
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor={colors.neutral[900] + '80'} // Semi-transparent overlay
    >
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={colors.primary[400]}
        backgroundColor={colors.neutral[50]}
        paddingX={3}
        paddingY={2}
        maxWidth={80}
        maxHeight={24}
      >
        {/* Header */}
        <Box marginBottom={2} alignItems="center" justifyContent="space-between">
          <Text color={colors.primary[500]} bold>
            ⌨️  Keyboard Shortcuts
          </Text>
          <Text color={colors.semantic.text.tertiary}>
            Press ESC to close
          </Text>
        </Box>

        {/* Shortcuts list */}
        <Box flexDirection="column" overflowY="auto">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <Box key={category} flexDirection="column" marginBottom={1}>
              {/* Category header */}
              <Text color={colors.semantic.text.primary} bold underline>
                {category}
              </Text>
              
              {/* Shortcuts in category */}
              <Box flexDirection="column" marginLeft={1} marginTop={1}>
                {categoryShortcuts
                  .filter(s => !s.disabled)
                  .map((shortcut, index) => (
                    <Box key={index} alignItems="center" marginBottom={0.5}>
                      {/* Key combination */}
                      <Box minWidth={12}>
                        <Text 
                          color={colors.primary[600]} 
                          backgroundColor={colors.primary[100]}
                          bold
                        >
                          {formatKey(shortcut.key, shortcut.modifier)}
                        </Text>
                      </Box>
                      
                      {/* Arrow */}
                      <Text color={colors.semantic.text.tertiary} marginX={1}>
                        →
                      </Text>
                      
                      {/* Description */}
                      <Box flexDirection="column">
                        <Text color={colors.semantic.text.primary}>
                          {shortcut.label}
                        </Text>
                        {shortcut.description && (
                          <Text color={colors.semantic.text.secondary} dimColor>
                            {shortcut.description}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  ))
                }
              </Box>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box marginTop={2} borderTop borderColor={colors.neutral[200]} paddingTop={1}>
          <Text color={colors.semantic.text.secondary} dimColor>
            Tip: Press ? at any time to show this help
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

// Predefined common shortcuts
export const commonShortcuts = {
  help: (action: () => void): KeyboardShortcut => ({
    key: '?',
    label: 'Show help',
    description: 'Display keyboard shortcuts',
    action,
    category: 'General',
    global: true,
  }),

  quit: (action: () => void): KeyboardShortcut => ({
    key: 'q',
    label: 'Quit',
    description: 'Exit the application',
    action,
    category: 'General',
    global: true,
  }),

  refresh: (action: () => void): KeyboardShortcut => ({
    key: 'r',
    label: 'Refresh',
    description: 'Refresh current view',
    action,
    category: 'General',
  }),

  search: (action: () => void): KeyboardShortcut => ({
    key: '/',
    label: 'Search',
    description: 'Open search dialog',
    action,
    category: 'Navigation',
  }),

  selectAll: (action: () => void): KeyboardShortcut => ({
    key: 'a',
    modifier: 'ctrl',
    label: 'Select all',
    description: 'Select all items',
    action,
    category: 'Selection',
  }),

  copy: (action: () => void): KeyboardShortcut => ({
    key: 'c',
    modifier: 'ctrl',
    label: 'Copy',
    description: 'Copy selection',
    action,
    category: 'Edit',
  }),

  paste: (action: () => void): KeyboardShortcut => ({
    key: 'v',
    modifier: 'ctrl',
    label: 'Paste',
    description: 'Paste from clipboard',
    action,
    category: 'Edit',
  }),
}

export default {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  useShortcut,
  KeyboardHelp,
  commonShortcuts,
}