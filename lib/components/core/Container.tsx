/**
 * Container Component
 * Responsive container with max-width constraints
 */

import React, { ReactNode } from 'react'
import { Box, BoxProps } from './Box'
import { spacing, SpacingSize } from '../../design'

export interface ContainerProps extends Omit<BoxProps, 'width' | 'maxWidth'> {
  children: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centerContent?: boolean
  responsive?: boolean
  terminalWidth?: number
}

// Container size configurations
const containerSizes = {
  xs: { maxWidth: 30, padding: 'xs' as SpacingSize },
  sm: { maxWidth: 50, padding: 'sm' as SpacingSize },
  md: { maxWidth: 80, padding: 'md' as SpacingSize },
  lg: { maxWidth: 100, padding: 'md' as SpacingSize },
  xl: { maxWidth: 120, padding: 'lg' as SpacingSize },
  full: { maxWidth: undefined, padding: 'md' as SpacingSize }
} as const

/**
 * Container - Responsive content container with max-width constraints
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'md',
  centerContent = true,
  responsive = true,
  terminalWidth = 80,
  padding,
  ...props
}) => {
  // Get container configuration
  const config = containerSizes[size]
  
  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (!responsive) {
      return {
        width: config.maxWidth,
        padding: padding || config.padding
      }
    }

    // Adjust size based on terminal width
    let adjustedSize = size
    
    if (terminalWidth < 60) {
      adjustedSize = 'xs'
    } else if (terminalWidth < 80) {
      adjustedSize = 'sm'
    } else if (terminalWidth < 100) {
      adjustedSize = 'md'
    } else if (terminalWidth < 120) {
      adjustedSize = 'lg'
    } else {
      adjustedSize = 'xl'
    }

    const adjustedConfig = containerSizes[adjustedSize]
    
    // Ensure container doesn't exceed terminal width
    const maxWidth = adjustedConfig.maxWidth 
      ? Math.min(adjustedConfig.maxWidth, terminalWidth - 4) // Leave some margin
      : terminalWidth - 4

    return {
      width: maxWidth,
      padding: padding || adjustedConfig.padding
    }
  }

  const dimensions = getResponsiveDimensions()

  return (
    <Box
      width={dimensions.width}
      padding={dimensions.padding}
      marginX={centerContent ? 'auto' : undefined}
      alignSelf={centerContent ? 'center' : undefined}
      {...props}
    >
      {children}
    </Box>
  )
}

// Specialized container variants
export interface SectionProps extends ContainerProps {
  title?: string
  subtitle?: string
  divider?: boolean
}

/**
 * Section - Content section with optional title and divider
 */
export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  divider = false,
  marginBottom = 'lg',
  ...props
}) => {
  return (
    <Container marginBottom={marginBottom} {...props}>
      {(title || subtitle) && (
        <Box marginBottom="md" flexDirection="column">
          {title && (
            <Box marginBottom="xs">
              {title}
            </Box>
          )}
          {subtitle && (
            <Box>
              {subtitle}
            </Box>
          )}
        </Box>
      )}
      
      {divider && (
        <Box 
          marginBottom="md"
          borderStyle="single"
          borderColor="#e5e5e5"
          height={1}
        />
      )}
      
      {children}
    </Container>
  )
}

export interface MainProps extends ContainerProps {
  header?: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: number
}

/**
 * Main - Application main layout container
 */
export const Main: React.FC<MainProps> = ({
  children,
  header,
  footer,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 25,
  size = 'full',
  ...props
}) => {
  const hasSidebar = Boolean(sidebar)
  
  return (
    <Container 
      size={size}
      flexDirection="column"
      height="100%"
      {...props}
    >
      {/* Header */}
      {header && (
        <Box 
          borderStyle="single"
          borderColor="#e5e5e5"
          padding="sm"
          marginBottom="sm"
        >
          {header}
        </Box>
      )}

      {/* Main content area */}
      <Box flexGrow={1} flexDirection="row">
        {/* Left sidebar */}
        {hasSidebar && sidebarPosition === 'left' && (
          <Box 
            width={sidebarWidth}
            borderStyle="single"
            borderColor="#e5e5e5"
            padding="sm"
            marginRight="sm"
            flexShrink={0}
          >
            {sidebar}
          </Box>
        )}

        {/* Main content */}
        <Box flexGrow={1}>
          {children}
        </Box>

        {/* Right sidebar */}
        {hasSidebar && sidebarPosition === 'right' && (
          <Box 
            width={sidebarWidth}
            borderStyle="single"
            borderColor="#e5e5e5"
            padding="sm"
            marginLeft="sm"
            flexShrink={0}
          >
            {sidebar}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {footer && (
        <Box 
          borderStyle="single"
          borderColor="#e5e5e5"
          padding="sm"
          marginTop="sm"
        >
          {footer}
        </Box>
      )}
    </Container>
  )
}

// Content wrapper for articles and documents
export interface ArticleProps extends ContainerProps {
  maxWidth?: number
}

/**
 * Article - Content wrapper optimized for reading
 */
export const Article: React.FC<ArticleProps> = ({
  children,
  maxWidth = 70, // Optimal reading width
  centerContent = true,
  padding = 'lg',
  ...props
}) => {
  return (
    <Box
      maxWidth={maxWidth}
      padding={padding}
      marginX={centerContent ? 'auto' : undefined}
      flexDirection="column"
      {...props}
    >
      {children}
    </Box>
  )
}

// Container utilities
export const containerUtils = {
  /**
   * Calculate optimal container size for content
   */
  getOptimalSize: (
    contentWidth: number, 
    terminalWidth: number
  ): keyof typeof containerSizes => {
    const availableWidth = terminalWidth - 8 // Account for padding and margins
    
    if (contentWidth <= 30 && availableWidth >= 30) return 'xs'
    if (contentWidth <= 50 && availableWidth >= 50) return 'sm' 
    if (contentWidth <= 80 && availableWidth >= 80) return 'md'
    if (contentWidth <= 100 && availableWidth >= 100) return 'lg'
    if (availableWidth >= 120) return 'xl'
    
    return 'full'
  },

  /**
   * Get responsive breakpoints
   */
  getBreakpoints: () => ({
    xs: 30,
    sm: 50,
    md: 80,
    lg: 100,
    xl: 120
  }),

  /**
   * Calculate grid layout for containers
   */
  calculateGrid: (
    itemCount: number,
    terminalWidth: number,
    minItemWidth: number = 25
  ) => {
    const availableWidth = terminalWidth - 8
    const maxColumns = Math.floor(availableWidth / minItemWidth)
    const optimalColumns = Math.min(maxColumns, itemCount)
    
    return {
      columns: optimalColumns,
      itemWidth: Math.floor(availableWidth / optimalColumns),
      rows: Math.ceil(itemCount / optimalColumns)
    }
  }
} as const

export default Container