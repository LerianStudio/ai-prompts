/**
 * Typography Components
 * Consistent text styling with semantic meaning
 */

import React, { ReactNode } from 'react'
import { Text as InkText } from 'ink'
import { text, TypographyVariant, FontWeight } from '../../design'

// Base text component props
export interface TextProps {
  children: ReactNode
  variant?: TypographyVariant
  weight?: FontWeight
  color?: string
  dimColor?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  inverse?: boolean
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end'
  className?: string
}

/**
 * Text - Base text component with typography system integration
 */
export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight,
  color,
  dimColor = false,
  italic = false,
  underline = false,
  strikethrough = false,
  inverse = false,
  wrap = 'wrap',
  className,
  ...rest
}) => {
  // Get typography configuration
  const typography = text.typography[variant]
  
  // Apply text styling based on variant and props
  const getStyledText = (content: ReactNode): ReactNode => {
    let styledContent = content

    // Apply typography variant styling if it's a string
    if (typeof content === 'string') {
      // Apply bold if specified by variant or weight prop
      if ((typography.weight >= text.weights.bold) || (weight && text.weights[weight] >= text.weights.bold)) {
        styledContent = text.utils.bold(content)
      }

      // Apply italic
      if (italic) {
        styledContent = text.utils.italic(styledContent as string)
      }

      // Apply underline
      if (underline) {
        styledContent = text.utils.underline(styledContent as string)
      }

      // Apply strikethrough
      if (strikethrough) {
        styledContent = text.utils.strikethrough(styledContent as string)
      }
    }

    return styledContent
  }

  return (
    <InkText
      color={color}
      dimColor={dimColor}
      inverse={inverse}
      wrap={wrap}
      {...rest}
    >
      {getStyledText(children)}
    </InkText>
  )
}

// Heading components
export interface HeadingProps extends Omit<TextProps, 'variant'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * Heading - Semantic heading component
 */
export const Heading: React.FC<HeadingProps> = ({ level = 1, children, ...props }) => {
  const variants: Record<number, TypographyVariant> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6'
  }

  return (
    <Text variant={variants[level]} {...props}>
      {children}
    </Text>
  )
}

// Specialized text components
export interface LabelProps extends Omit<TextProps, 'variant'> {}

/**
 * Label - UI label text
 */
export const Label: React.FC<LabelProps> = ({ children, ...props }) => (
  <Text variant="label" {...props}>
    {children}
  </Text>
)

export interface CaptionProps extends Omit<TextProps, 'variant'> {}

/**
 * Caption - Small descriptive text
 */
export const Caption: React.FC<CaptionProps> = ({ children, ...props }) => (
  <Text variant="caption" dimColor {...props}>
    {children}
  </Text>
)

export interface CodeProps extends Omit<TextProps, 'variant'> {
  inline?: boolean
}

/**
 * Code - Monospace code text
 */
export const Code: React.FC<CodeProps> = ({ children, inline = true, ...props }) => (
  <Text variant={inline ? 'code' : 'codeBlock'} {...props}>
    {children}
  </Text>
)

// Link component
export interface LinkProps extends Omit<TextProps, 'variant' | 'color'> {
  href?: string
  onPress?: () => void
}

/**
 * Link - Interactive link text
 */
export const Link: React.FC<LinkProps> = ({ 
  children, 
  href, 
  onPress,
  underline = true,
  ...props 
}) => {
  // Handle link press
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else if (href) {
      // In a real implementation, you might open the URL
      console.log(`Opening: ${href}`)
    }
  }

  return (
    <Text
      variant="body"
      color="#0ea5e9"
      underline={underline}
      {...props}
    >
      {children}
    </Text>
  )
}

// Text formatting utilities
export const formatUtils = {
  /**
   * Apply consistent status colors
   */
  status: {
    success: (text: string) => `\u001b[32m${text}\u001b[39m`, // green
    warning: (text: string) => `\u001b[33m${text}\u001b[39m`, // yellow
    error: (text: string) => `\u001b[31m${text}\u001b[39m`, // red
    info: (text: string) => `\u001b[36m${text}\u001b[39m`, // cyan
    muted: (text: string) => `\u001b[90m${text}\u001b[39m` // gray
  },

  /**
   * Apply semantic highlighting
   */
  highlight: {
    brand: (text: string) => `\u001b[94m${text}\u001b[39m`, // bright blue
    accent: (text: string) => `\u001b[95m${text}\u001b[39m`, // bright magenta
    focus: (text: string) => `\u001b[96m${text}\u001b[39m` // bright cyan
  },

  /**
   * Format file paths with proper styling
   */
  filePath: (path: string): string => {
    const parts = path.split('/')
    const fileName = parts[parts.length - 1]
    const directory = parts.slice(0, -1).join('/')
    
    if (directory) {
      return `${text.utils.dim(directory + '/')}${text.utils.bold(fileName)}`
    }
    
    return text.utils.bold(fileName)
  },

  /**
   * Format timestamps
   */
  timestamp: (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than a minute
    if (diff < 60000) {
      return text.utils.dim('just now')
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return text.utils.dim(`${minutes}m ago`)
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return text.utils.dim(`${hours}h ago`)
    }
    
    // Format as date
    return text.utils.dim(date.toLocaleDateString())
  },

  /**
   * Format file sizes
   */
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    const formatted = size < 10 ? size.toFixed(1) : Math.round(size).toString()
    return text.utils.dim(`${formatted}${units[unitIndex]}`)
  }
} as const

// Status text components
export const StatusText: React.FC<{ status: keyof typeof formatUtils.status; children: string }> = ({ 
  status, 
  children 
}) => (
  <Text>{formatUtils.status[status](children)}</Text>
)

export const HighlightText: React.FC<{ variant: keyof typeof formatUtils.highlight; children: string }> = ({ 
  variant, 
  children 
}) => (
  <Text>{formatUtils.highlight[variant](children)}</Text>
)

// Export all components
export {
  text as textSystem,
  formatUtils as textFormatUtils
}

export default Text