import React, { Component, ReactNode } from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../design/colors'
import { spacing } from '../../design/spacing'
import { borders } from '../../design/borders'
import { ErrorBoundaryProps } from '../../types/components'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
  errorId: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    })
    
    this.props.onError?.(error, errorInfo)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Error info:', errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          flexDirection="column"
          padding={2}
          borderStyle="round"
          borderColor={colors.semantic.state.error}
        >
          <Box marginBottom={1}>
            <Text color={colors.semantic.state.error} bold>
              ⚠️ Something went wrong
            </Text>
          </Box>
          
          {this.state.error && (
            <Box flexDirection="column" marginBottom={1}>
              <Text color={colors.semantic.text.primary}>
                Error: {this.state.error.message}
              </Text>
              
              {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                <Box marginTop={1}>
                  <Text color={colors.semantic.text.tertiary} dimColor>
                    Stack trace:
                  </Text>
                  <Text color={colors.semantic.text.tertiary}>
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </Text>
                </Box>
              )}
            </Box>
          )}
          
          <Box>
            <Text color={colors.semantic.text.secondary} dimColor>
              Error ID: {this.state.errorId}
            </Text>
          </Box>
          
          {this.props.showRetry !== false && (
            <Box marginTop={1}>
              <Text color={colors.semantic.text.tertiary} dimColor>
                Press r to retry, or restart the application
              </Text>
            </Box>
          )}
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary