/**
 * Stack Components
 * Simplified layout components for common stacking patterns
 */

import React, { ReactNode } from 'react'
import { Box, BoxProps } from './Box'
import { SpacingSize } from '../../design'

// Base stack props
export interface StackProps extends Omit<BoxProps, 'flexDirection'> {
  children: ReactNode
  spacing?: SpacingSize
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: boolean
  divider?: ReactNode
}

/**
 * VStack - Vertical stack layout
 */
export const VStack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  divider,
  ...props
}) => {
  // Process children to add dividers
  const processChildren = () => {
    if (!divider) return children

    const childrenArray = React.Children.toArray(children)
    const processedChildren: ReactNode[] = []

    childrenArray.forEach((child, index) => {
      processedChildren.push(child)
      
      // Add divider between children (but not after the last one)
      if (index < childrenArray.length - 1) {
        processedChildren.push(
          <Box key={`divider-${index}`} marginY="xs">
            {divider}
          </Box>
        )
      }
    })

    return processedChildren
  }

  return (
    <Box
      flexDirection="column"
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap ? 'wrap' : 'nowrap'}
      gap={spacing}
      {...props}
    >
      {processChildren()}
    </Box>
  )
}

/**
 * HStack - Horizontal stack layout
 */
export const HStack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  divider,
  ...props
}) => {
  // Process children to add dividers
  const processChildren = () => {
    if (!divider) return children

    const childrenArray = React.Children.toArray(children)
    const processedChildren: ReactNode[] = []

    childrenArray.forEach((child, index) => {
      processedChildren.push(child)
      
      // Add divider between children (but not after the last one)
      if (index < childrenArray.length - 1) {
        processedChildren.push(
          <Box key={`divider-${index}`} marginX="xs">
            {divider}
          </Box>
        )
      }
    })

    return processedChildren
  }

  return (
    <Box
      flexDirection="row"
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap ? 'wrap' : 'nowrap'}
      gap={spacing}
      {...props}
    >
      {processChildren()}
    </Box>
  )
}

/**
 * ZStack - Layered stack (absolute positioning)
 */
export interface ZStackProps extends Omit<BoxProps, 'flexDirection'> {
  children: ReactNode
}

export const ZStack: React.FC<ZStackProps> = ({
  children,
  position = 'relative',
  ...props
}) => {
  // Process children to add absolute positioning
  const processChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        // Add absolute positioning to all children except the first (base layer)
        if (index > 0) {
          return React.cloneElement(child, {
            position: 'absolute',
            top: 0,
            left: 0,
            ...child.props
          })
        }
      }
      return child
    })
  }

  return (
    <Box
      position={position}
      {...props}
    >
      {processChildren()}
    </Box>
  )
}

// Specialized stack variants
export interface ListStackProps extends StackProps {
  numbered?: boolean
  bulletStyle?: '•' | '-' | '→' | '▶'
}

/**
 * ListStack - Stack with list item styling
 */
export const ListStack: React.FC<ListStackProps> = ({
  children,
  numbered = false,
  bulletStyle = '•',
  spacing = 'sm',
  ...props
}) => {
  const processChildren = () => {
    return React.Children.map(children, (child, index) => (
      <Box flexDirection="row" alignItems="flex-start" gap="sm">
        <Box minWidth={3} flexShrink={0}>
          {numbered ? `${index + 1}.` : bulletStyle}
        </Box>
        <Box flexGrow={1}>
          {child}
        </Box>
      </Box>
    ))
  }

  return (
    <VStack spacing={spacing} {...props}>
      {processChildren()}
    </VStack>
  )
}

export interface StepsStackProps extends StackProps {
  currentStep?: number
  completedIcon?: string
  activeIcon?: string
  inactiveIcon?: string
}

/**
 * StepsStack - Stack with step progression indicators
 */
export const StepsStack: React.FC<StepsStackProps> = ({
  children,
  currentStep = 0,
  completedIcon = '✓',
  activeIcon = '►',
  inactiveIcon = '○',
  spacing = 'md',
  ...props
}) => {
  const processChildren = () => {
    return React.Children.map(children, (child, index) => {
      let icon = inactiveIcon
      let iconColor = '#888888'

      if (index < currentStep) {
        icon = completedIcon
        iconColor = '#22c55e' // green
      } else if (index === currentStep) {
        icon = activeIcon
        iconColor = '#0ea5e9' // blue
      }

      return (
        <Box flexDirection="row" alignItems="flex-start" gap="md">
          <Box 
            minWidth={3} 
            flexShrink={0}
            color={iconColor}
          >
            {icon}
          </Box>
          <Box flexGrow={1}>
            {child}
          </Box>
        </Box>
      )
    })
  }

  return (
    <VStack spacing={spacing} {...props}>
      {processChildren()}
    </VStack>
  )
}

// Common dividers
export const dividers = {
  line: <Box borderStyle="single" height={1} />,
  dashed: <Box borderStyle="dashed" height={1} />,
  dotted: <Box borderStyle="dotted" height={1} />,
  space: <Box height={1} />,
  bullet: '•',
  dash: '—',
  arrow: '→'
} as const

// Stack utilities
export const stackUtils = {
  /**
   * Create responsive stack based on screen size
   */
  createResponsiveStack: (
    terminalWidth: number,
    breakpoint: number = 80
  ): React.ComponentType<StackProps> => {
    return terminalWidth < breakpoint ? VStack : HStack
  },

  /**
   * Calculate optimal spacing for stacks
   */
  getOptimalSpacing: (
    itemCount: number,
    terminalHeight: number
  ): SpacingSize => {
    const availableHeight = terminalHeight - 6 // Account for headers/footers
    const spacePerItem = availableHeight / itemCount

    if (spacePerItem > 4) return 'lg'
    if (spacePerItem > 3) return 'md'
    if (spacePerItem > 2) return 'sm'
    return 'xs'
  },

  /**
   * Create auto-wrapping stack
   */
  createAutoWrapStack: (
    itemWidth: number,
    terminalWidth: number
  ): React.ComponentType<StackProps> => {
    const itemsPerRow = Math.floor((terminalWidth - 4) / itemWidth)
    return itemsPerRow === 1 ? VStack : HStack
  }
} as const

export default VStack