/**
 * Layout Component
 * Modern flexbox-based layout system for TUI
 */

import React, { ReactNode } from 'react'
import { Box } from 'ink'
import { spacing, SpacingSize } from '../../design'

// Layout component props
export interface LayoutProps {
  children: ReactNode
  direction?: 'row' | 'column'
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: SpacingSize
  padding?: SpacingSize
  margin?: SpacingSize
  width?: number | string
  height?: number | string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
  className?: string
}

/**
 * Layout - Foundation layout component with flexbox support
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  direction = 'row',
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
  gap = 'none',
  padding = 'none',
  margin = 'none',
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  flexGrow,
  flexShrink,
  flexBasis,
  className,
  ...rest
}) => {
  // Convert spacing tokens to actual values
  const getSpacing = (size: SpacingSize): number => {
    return spacing.component[size] || 0
  }

  return (
    <Box
      flexDirection={direction}
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap}
      gap={getSpacing(gap)}
      padding={getSpacing(padding)}
      margin={getSpacing(margin)}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      flexBasis={flexBasis}
      {...rest}
    >
      {children}
    </Box>
  )
}

// Specialized layout components
export interface FlexProps extends Omit<LayoutProps, 'direction'> {
  direction?: 'row' | 'column'
}

/**
 * Flex - Shorthand for flexbox layouts
 */
export const Flex: React.FC<FlexProps> = ({ direction = 'row', ...props }) => (
  <Layout direction={direction} {...props} />
)

/**
 * VStack - Vertical stack layout
 */
export const VStack: React.FC<Omit<LayoutProps, 'direction'>> = (props) => (
  <Layout direction="column" {...props} />
)

/**
 * HStack - Horizontal stack layout
 */
export const HStack: React.FC<Omit<LayoutProps, 'direction'>> = (props) => (
  <Layout direction="row" {...props} />
)

/**
 * Center - Center content both horizontally and vertically
 */
export const Center: React.FC<Omit<LayoutProps, 'align' | 'justify'>> = (props) => (
  <Layout align="center" justify="center" {...props} />
)

/**
 * Spacer - Flexible space component
 */
export const Spacer: React.FC = () => (
  <Box flexGrow={1} />
)

// Layout utilities
export const layoutUtils = {
  /**
   * Calculate responsive layout based on terminal dimensions
   */
  getResponsiveLayout: (terminalWidth: number, terminalHeight: number) => {
    // Breakpoints for different layout strategies
    if (terminalWidth < 60) {
      return {
        containerPadding: 'xs' as SpacingSize,
        direction: 'column' as const,
        gap: 'xs' as SpacingSize
      }
    }
    
    if (terminalWidth < 100) {
      return {
        containerPadding: 'sm' as SpacingSize,
        direction: 'column' as const,
        gap: 'sm' as SpacingSize
      }
    }
    
    return {
      containerPadding: 'md' as SpacingSize,
      direction: 'row' as const,
      gap: 'md' as SpacingSize
    }
  },

  /**
   * Get optimal column count for grid layouts
   */
  getOptimalColumns: (terminalWidth: number, itemMinWidth: number = 20): number => {
    const availableWidth = terminalWidth - 4 // Account for padding
    return Math.max(1, Math.floor(availableWidth / itemMinWidth))
  },

  /**
   * Calculate container dimensions with aspect ratio
   */
  calculateDimensions: (
    terminalWidth: number,
    terminalHeight: number,
    aspectRatio: number = 16/9
  ) => {
    const maxWidth = Math.floor(terminalWidth * 0.9)
    const maxHeight = Math.floor(terminalHeight * 0.8)
    
    // Calculate based on aspect ratio
    let width = maxWidth
    let height = Math.floor(width / aspectRatio)
    
    if (height > maxHeight) {
      height = maxHeight
      width = Math.floor(height * aspectRatio)
    }
    
    return { width, height }
  }
} as const

export default Layout