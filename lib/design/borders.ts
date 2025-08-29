/**
 * Border System
 * Modern border styles and utilities for terminal interfaces
 */

// Border width scale
export const borderWidths = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  8: 8
} as const

// Border radius scale (for conceptual use in TUI)
export const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  full: 9999
} as const

// ASCII border character sets
export const borderStyles = {
  none: {
    topLeft: ' ',
    top: ' ',
    topRight: ' ',
    right: ' ',
    bottomRight: ' ',
    bottom: ' ',
    bottomLeft: ' ',
    left: ' '
  },

  single: {
    topLeft: '┌',
    top: '─',
    topRight: '┐',
    right: '│',
    bottomRight: '┘',
    bottom: '─',
    bottomLeft: '└',
    left: '│'
  },

  double: {
    topLeft: '╔',
    top: '═',
    topRight: '╗',
    right: '║',
    bottomRight: '╝',
    bottom: '═',
    bottomLeft: '╚',
    left: '║'
  },

  rounded: {
    topLeft: '╭',
    top: '─',
    topRight: '╮',
    right: '│',
    bottomRight: '╯',
    bottom: '─',
    bottomLeft: '╰',
    left: '│'
  },

  thick: {
    topLeft: '┏',
    top: '━',
    topRight: '┓',
    right: '┃',
    bottomRight: '┛',
    bottom: '━',
    bottomLeft: '┗',
    left: '┃'
  },

  dotted: {
    topLeft: '┌',
    top: '┄',
    topRight: '┐',
    right: '┊',
    bottomRight: '┘',
    bottom: '┄',
    bottomLeft: '└',
    left: '┊'
  },

  dashed: {
    topLeft: '┌',
    top: '┅',
    topRight: '┐',
    right: '┋',
    bottomRight: '┘',
    bottom: '┅',
    bottomLeft: '└',
    left: '┋'
  },

  // Classic ASCII style
  classic: {
    topLeft: '+',
    top: '-',
    topRight: '+',
    right: '|',
    bottomRight: '+',
    bottom: '-',
    bottomLeft: '+',
    left: '|'
  },

  // Modern minimalist
  minimal: {
    topLeft: '┌',
    top: '─',
    topRight: '┐',
    right: '│',
    bottomRight: '┘',
    bottom: '─',
    bottomLeft: '└',
    left: '│'
  }
} as const

// Border component configurations
export const borderComponents = {
  // Card borders
  card: {
    style: borderStyles.rounded,
    width: borderWidths[1],
    padding: 1
  },

  // Panel borders
  panel: {
    style: borderStyles.single,
    width: borderWidths[1],
    padding: 2
  },

  // Modal borders
  modal: {
    style: borderStyles.double,
    width: borderWidths[2],
    padding: 2
  },

  // Input borders
  input: {
    style: borderStyles.single,
    width: borderWidths[1],
    padding: 1
  },

  // Button borders
  button: {
    style: borderStyles.rounded,
    width: borderWidths[1],
    padding: 1
  },

  // Table borders
  table: {
    style: borderStyles.single,
    width: borderWidths[1],
    padding: 0
  },

  // Code block borders
  code: {
    style: borderStyles.rounded,
    width: borderWidths[1],
    padding: 1
  }
} as const

// Border utility functions
export const borderUtils = {
  /**
   * Create a border box with specified dimensions
   */
  createBox: (
    width: number,
    height: number,
    style: keyof typeof borderStyles = 'single'
  ): string[] => {
    const chars = borderStyles[style]
    const lines: string[] = []

    // Top line
    lines.push(chars.topLeft + chars.top.repeat(width - 2) + chars.topRight)

    // Middle lines
    for (let i = 0; i < height - 2; i++) {
      lines.push(chars.left + ' '.repeat(width - 2) + chars.right)
    }

    // Bottom line
    if (height > 1) {
      lines.push(chars.bottomLeft + chars.bottom.repeat(width - 2) + chars.bottomRight)
    }

    return lines
  },

  /**
   * Create a border with title
   */
  createTitledBox: (
    width: number,
    height: number,
    title: string,
    style: keyof typeof borderStyles = 'single',
    titleAlign: 'left' | 'center' | 'right' = 'left'
  ): string[] => {
    const chars = borderStyles[style]
    const lines: string[] = []
    
    // Calculate title positioning
    const maxTitleLength = width - 4 // Account for border and padding
    const truncatedTitle = title.length > maxTitleLength 
      ? title.substring(0, maxTitleLength - 1) + '…'
      : title

    let titleLine = chars.topLeft
    const remainingWidth = width - 2 - truncatedTitle.length
    
    switch (titleAlign) {
      case 'center':
        const leftPadding = Math.floor(remainingWidth / 2)
        const rightPadding = remainingWidth - leftPadding
        titleLine += chars.top.repeat(leftPadding) + truncatedTitle + chars.top.repeat(rightPadding)
        break
      
      case 'right':
        titleLine += chars.top.repeat(remainingWidth) + truncatedTitle
        break
      
      default: // left
        titleLine += truncatedTitle + chars.top.repeat(remainingWidth)
    }
    
    titleLine += chars.topRight
    lines.push(titleLine)

    // Middle lines
    for (let i = 0; i < height - 2; i++) {
      lines.push(chars.left + ' '.repeat(width - 2) + chars.right)
    }

    // Bottom line
    if (height > 1) {
      lines.push(chars.bottomLeft + chars.bottom.repeat(width - 2) + chars.bottomRight)
    }

    return lines
  },

  /**
   * Create horizontal separator
   */
  createSeparator: (
    width: number,
    style: keyof typeof borderStyles = 'single',
    withConnectors: boolean = false
  ): string => {
    const chars = borderStyles[style]
    
    if (withConnectors) {
      return chars.left + chars.bottom.repeat(width - 2) + chars.right
    }
    
    return chars.bottom.repeat(width)
  },

  /**
   * Apply border to text content
   */
  wrapContent: (
    content: string[],
    style: keyof typeof borderStyles = 'single',
    padding: number = 1,
    title?: string
  ): string[] => {
    const maxContentWidth = Math.max(...content.map(line => line.length))
    const boxWidth = maxContentWidth + (padding * 2) + 2
    const boxHeight = content.length + (padding * 2) + 2

    let box: string[]
    
    if (title) {
      box = borderUtils.createTitledBox(boxWidth, boxHeight, title, style)
    } else {
      box = borderUtils.createBox(boxWidth, boxHeight, style)
    }

    // Insert content with padding
    const chars = borderStyles[style]
    for (let i = 0; i < content.length; i++) {
      const lineIndex = i + padding + 1
      const paddedContent = ' '.repeat(padding) + 
                          content[i].padEnd(maxContentWidth) + 
                          ' '.repeat(padding)
      
      box[lineIndex] = chars.left + paddedContent + chars.right
    }

    return box
  }
} as const

// Semantic border configurations
export const borders = {
  styles: borderStyles,
  components: borderComponents,
  widths: borderWidths,
  radius: borderRadius,
  utils: borderUtils
} as const

// Export types
export type BorderStyle = keyof typeof borderStyles
export type BorderWidth = keyof typeof borderWidths
export type BorderRadius = keyof typeof borderRadius
export type BorderComponent = keyof typeof borderComponents