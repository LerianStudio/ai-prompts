/**
 * Grid Components
 * Flexible grid layout system for terminal interfaces
 */

import React, { ReactNode } from 'react'
import { Box, BoxProps } from './Box'
import { SpacingSize } from '../../design'

export interface GridProps extends Omit<BoxProps, 'flexDirection'> {
  children: ReactNode
  columns?: number
  rows?: number
  gap?: SpacingSize
  columnGap?: SpacingSize
  rowGap?: SpacingSize
  autoFlow?: 'row' | 'column'
  autoFit?: boolean
  minItemWidth?: number
  minItemHeight?: number
  responsive?: boolean
  terminalWidth?: number
}

/**
 * Grid - CSS Grid-like layout for terminal interfaces
 * Uses flexbox with calculated widths to simulate grid behavior
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = 'auto',
  rows,
  gap = 'md',
  columnGap,
  rowGap,
  autoFlow = 'row',
  autoFit = false,
  minItemWidth = 10,
  minItemHeight = 3,
  responsive = false,
  terminalWidth = 80,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children)
  const itemCount = childrenArray.length

  // Calculate optimal columns if auto-fit is enabled
  const calculateColumns = (): number => {
    if (typeof columns === 'number') return columns
    
    if (autoFit || responsive) {
      const availableWidth = terminalWidth - 8 // Account for padding
      const calculatedColumns = Math.floor(availableWidth / minItemWidth)
      return Math.max(1, Math.min(calculatedColumns, itemCount))
    }
    
    // Default to square-ish grid
    return Math.ceil(Math.sqrt(itemCount))
  }

  const actualColumns = calculateColumns()
  const actualRows = rows || Math.ceil(itemCount / actualColumns)

  // Create grid items with proper sizing
  const createGridItems = () => {
    const items: ReactNode[] = []
    
    for (let row = 0; row < actualRows; row++) {
      const rowItems: ReactNode[] = []
      
      for (let col = 0; col < actualColumns; col++) {
        const index = autoFlow === 'row' 
          ? row * actualColumns + col
          : col * actualRows + row
        
        if (index < itemCount) {
          const child = childrenArray[index]
          
          rowItems.push(
            <Box
              key={`grid-item-${index}`}
              flexGrow={1}
              flexBasis={0}
              minWidth={minItemWidth}
              minHeight={minItemHeight}
            >
              {child}
            </Box>
          )
        } else {
          // Empty grid cell
          rowItems.push(
            <Box
              key={`grid-empty-${row}-${col}`}
              flexGrow={1}
              flexBasis={0}
              minWidth={minItemWidth}
              minHeight={minItemHeight}
            />
          )
        }
      }
      
      items.push(
        <Box
          key={`grid-row-${row}`}
          flexDirection="row"
          gap={columnGap || gap}
          width="100%"
        >
          {rowItems}
        </Box>
      )
    }
    
    return items
  }

  return (
    <Box
      flexDirection="column"
      gap={rowGap || gap}
      {...props}
    >
      {createGridItems()}
    </Box>
  )
}

// Specialized grid variants
export interface SimpleGridProps extends Omit<GridProps, 'autoFlow' | 'autoFit'> {
  equalHeight?: boolean
}

/**
 * SimpleGrid - Basic grid with equal-width columns
 */
export const SimpleGrid: React.FC<SimpleGridProps> = ({
  children,
  columns = 3,
  equalHeight = false,
  ...props
}) => {
  return (
    <Grid
      columns={columns}
      autoFit={false}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <Box height={equalHeight ? '100%' : undefined}>
          {child}
        </Box>
      ))}
    </Grid>
  )
}

export interface ResponsiveGridProps extends GridProps {
  breakpoints?: {
    xs?: number  // columns for extra small screens
    sm?: number  // columns for small screens  
    md?: number  // columns for medium screens
    lg?: number  // columns for large screens
    xl?: number  // columns for extra large screens
  }
}

/**
 * ResponsiveGrid - Grid with responsive column counts
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  breakpoints = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  terminalWidth = 80,
  ...props
}) => {
  // Determine columns based on terminal width
  const getResponsiveColumns = (): number => {
    if (terminalWidth >= 120 && breakpoints.xl) return breakpoints.xl
    if (terminalWidth >= 100 && breakpoints.lg) return breakpoints.lg
    if (terminalWidth >= 80 && breakpoints.md) return breakpoints.md
    if (terminalWidth >= 60 && breakpoints.sm) return breakpoints.sm
    return breakpoints.xs || 1
  }

  return (
    <Grid
      columns={getResponsiveColumns()}
      terminalWidth={terminalWidth}
      responsive={true}
      {...props}
    >
      {children}
    </Grid>
  )
}

export interface MasonryGridProps extends Omit<GridProps, 'rows' | 'autoFlow'> {
  itemHeights?: number[]
}

/**
 * MasonryGrid - Pinterest-style masonry layout
 * Note: Simplified version using equal heights per row
 */
export const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = 3,
  itemHeights = [],
  gap = 'sm',
  ...props
}) => {
  const childrenArray = React.Children.toArray(children)
  
  // Group items by columns to simulate masonry layout
  const createMasonryColumns = () => {
    const columnArrays: ReactNode[][] = Array.from(
      { length: typeof columns === 'number' ? columns : 3 }, 
      () => []
    )
    
    childrenArray.forEach((child, index) => {
      const columnIndex = index % columnArrays.length
      columnArrays[columnIndex].push(child)
    })
    
    return columnArrays.map((columnItems, columnIndex) => (
      <Box
        key={`masonry-column-${columnIndex}`}
        flexDirection="column"
        gap={gap}
        flexGrow={1}
        flexBasis={0}
      >
        {columnItems}
      </Box>
    ))
  }

  return (
    <Box
      flexDirection="row"
      gap={gap}
      {...props}
    >
      {createMasonryColumns()}
    </Box>
  )
}

// Grid item component
export interface GridItemProps extends BoxProps {
  colSpan?: number
  rowSpan?: number
  colStart?: number
  colEnd?: number
  rowStart?: number
  rowEnd?: number
}

/**
 * GridItem - Individual grid item with span control
 * Note: Simplified implementation for terminal constraints
 */
export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  ...props
}) => {
  // Calculate flex basis based on column span
  const flexBasis = colSpan > 1 ? `${colSpan * 100}%` : 0
  
  return (
    <Box
      flexGrow={colSpan}
      flexBasis={flexBasis}
      {...props}
    >
      {children}
    </Box>
  )
}

// Grid utilities
export const gridUtils = {
  /**
   * Calculate optimal grid dimensions
   */
  calculateOptimalGrid: (
    itemCount: number,
    terminalWidth: number,
    terminalHeight: number,
    minItemWidth: number = 20,
    minItemHeight: number = 3
  ) => {
    const availableWidth = terminalWidth - 4
    const availableHeight = terminalHeight - 4
    
    const maxColumns = Math.floor(availableWidth / minItemWidth)
    const maxRows = Math.floor(availableHeight / minItemHeight)
    
    // Find best fit
    let bestColumns = 1
    let bestRows = itemCount
    let bestAspectRatio = Infinity
    
    for (let cols = 1; cols <= Math.min(maxColumns, itemCount); cols++) {
      const rows = Math.ceil(itemCount / cols)
      
      if (rows <= maxRows) {
        const aspectRatio = Math.abs((cols / rows) - (terminalWidth / terminalHeight))
        
        if (aspectRatio < bestAspectRatio) {
          bestColumns = cols
          bestRows = rows
          bestAspectRatio = aspectRatio
        }
      }
    }
    
    return {
      columns: bestColumns,
      rows: bestRows,
      itemWidth: Math.floor(availableWidth / bestColumns),
      itemHeight: Math.floor(availableHeight / bestRows)
    }
  },

  /**
   * Get responsive breakpoints
   */
  getBreakpoints: () => ({
    xs: 40,
    sm: 60,
    md: 80,
    lg: 100,
    xl: 120
  }),

  /**
   * Calculate grid item sizes
   */
  calculateItemSize: (
    columns: number,
    terminalWidth: number,
    gap: number = 2
  ) => {
    const availableWidth = terminalWidth - 4 // Container padding
    const totalGapWidth = (columns - 1) * gap
    const itemWidth = Math.floor((availableWidth - totalGapWidth) / columns)
    
    return {
      width: itemWidth,
      minWidth: Math.max(10, itemWidth - 2), // Ensure minimum width
      maxWidth: itemWidth + 2 // Allow slight flexibility
    }
  },

  /**
   * Create auto-sizing grid configuration
   */
  createAutoGrid: (
    itemCount: number,
    preferredItemWidth: number,
    terminalWidth: number
  ) => {
    const availableWidth = terminalWidth - 4
    const optimalColumns = Math.floor(availableWidth / preferredItemWidth)
    const actualColumns = Math.min(optimalColumns, itemCount)
    
    return {
      columns: Math.max(1, actualColumns),
      itemWidth: Math.floor(availableWidth / Math.max(1, actualColumns)),
      rows: Math.ceil(itemCount / Math.max(1, actualColumns))
    }
  }
} as const

export default Grid