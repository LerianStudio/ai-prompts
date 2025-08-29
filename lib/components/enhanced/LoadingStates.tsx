import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../design/colors'
import { animations } from '../../design/animations'
import { BaseComponentProps, LayoutProps } from '../../types/components'

export interface LoadingSpinnerProps extends BaseComponentProps {
  variant?: 'dots' | 'spin' | 'bounce' | 'pulse' | 'bar'
  color?: string
  size?: 'sm' | 'md' | 'lg'
  speed?: 'slow' | 'normal' | 'fast'
  style?: LayoutProps
}

export interface LoadingOverlayProps extends BaseComponentProps {
  visible: boolean
  message?: string
  spinner?: LoadingSpinnerProps['variant']
  backdrop?: boolean
  style?: LayoutProps
}

export interface SkeletonProps extends BaseComponentProps {
  width?: number
  height?: number
  variant?: 'text' | 'rectangular' | 'circular'
  animated?: boolean
  style?: LayoutProps
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'dots',
  color = colors.primary[500],
  size = 'md',
  speed = 'normal',
  style,
}) => {
  const [frame, setFrame] = useState(0)

  const speeds = {
    slow: 400,
    normal: 200,
    fast: 100
  }

  const spinnerData = {
    dots: animations.spinners.dots,
    spin: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    bounce: ['⠁', '⠂', '⠄', '⠂'],
    pulse: ['●', '◐', '○', '◑'],
    bar: ['▱', '▰▱', '▰▰▱', '▰▰▰']
  }

  const sizeMap = {
    sm: 1,
    md: 2,
    lg: 3
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % spinnerData[variant].length)
    }, speeds[speed])

    return () => clearInterval(interval)
  }, [variant, speed])

  return (
    <Box {...style}>
      <Text color={color}>
        {spinnerData[variant][frame].repeat(sizeMap[size])}
      </Text>
    </Box>
  )
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  spinner = 'dots',
  backdrop = true,
  style,
  children,
}) => {
  if (!visible) return <>{children}</>

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      {...(backdrop && {
        // Terminal doesn't support true backdrop, but we can use background
        borderStyle: 'round' as const,
        borderColor: colors.neutral[200],
        backgroundColor: colors.neutral[50]
      })}
      {...style}
    >
      <LoadingSpinner variant={spinner} size="lg" />
      
      {message && (
        <Box marginTop={1}>
          <Text color={colors.semantic.text.primary}>
            {message}
          </Text>
        </Box>
      )}
      
      {children}
    </Box>
  )
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 20,
  height = 1,
  variant = 'text',
  animated = true,
  style,
}) => {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setPulse(prev => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [animated])

  const getSkeletonChar = () => {
    switch (variant) {
      case 'circular':
        return '●'
      case 'rectangular':
        return '█'
      case 'text':
      default:
        return '▓'
    }
  }

  const skeletonColor = animated && pulse 
    ? colors.neutral[200] 
    : colors.neutral[300]

  const renderSkeleton = () => {
    const char = getSkeletonChar()
    
    if (variant === 'circular') {
      return (
        <Text color={skeletonColor}>
          {char.repeat(Math.min(width, height))}
        </Text>
      )
    }

    return (
      <Box flexDirection="column">
        {Array.from({ length: height }).map((_, rowIndex) => (
          <Text key={rowIndex} color={skeletonColor}>
            {char.repeat(width)}
          </Text>
        ))}
      </Box>
    )
  }

  return (
    <Box {...style}>
      {renderSkeleton()}
    </Box>
  )
}

// Higher-order component for loading states
export interface WithLoadingProps {
  loading?: boolean
  error?: string | Error
  loadingMessage?: string
  errorMessage?: string
  spinner?: LoadingSpinnerProps['variant']
  skeletonProps?: Partial<SkeletonProps>
  showSkeleton?: boolean
}

export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  return ({
    loading = false,
    error,
    loadingMessage,
    errorMessage,
    spinner = 'dots',
    skeletonProps,
    showSkeleton = false,
    ...props
  }) => {
    if (error) {
      const displayError = typeof error === 'string' ? error : error.message
      
      return (
        <Box 
          flexDirection="column" 
          padding={1}
          borderStyle="round"
          borderColor={colors.semantic.state.error}
        >
          <Text color={colors.semantic.state.error} bold>
            ⚠️ {errorMessage || 'An error occurred'}
          </Text>
          <Text color={colors.semantic.text.secondary} dimColor>
            {displayError}
          </Text>
        </Box>
      )
    }

    if (loading) {
      if (showSkeleton) {
        return <Skeleton {...skeletonProps} />
      }
      
      return (
        <LoadingOverlay 
          visible={true} 
          message={loadingMessage}
          spinner={spinner}
        />
      )
    }

    return <WrappedComponent {...(props as P)} />
  }
}

export default {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
  withLoading
}