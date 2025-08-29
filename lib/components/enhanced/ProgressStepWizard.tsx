import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../design/colors'
import { SmartProgress } from './SmartProgress'
import { BaseComponentProps, LayoutProps } from '../../types/components'

export interface StepItem {
  key: string
  label: string
  description?: string
  current: number
  total: number
  unit?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  error?: string
  estimatedDuration?: number
}

export interface ProgressStepWizardProps extends BaseComponentProps {
  steps: StepItem[]
  activeStepIndex: number
  title?: string
  showOverallProgress?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  style?: LayoutProps
  onStepComplete?: (stepIndex: number, step: StepItem) => void
  onAllComplete?: () => void
  onStepError?: (stepIndex: number, error: string) => void
}

export const ProgressStepWizard: React.FC<ProgressStepWizardProps> = ({
  steps,
  activeStepIndex,
  title,
  showOverallProgress = true,
  variant = 'default',
  size = 'md',
  animated = true,
  style,
  onStepComplete,
  onAllComplete,
  onStepError,
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    const totalCurrent = steps.reduce((sum, step) => sum + step.current, 0)
    const totalMax = steps.reduce((sum, step) => sum + step.total, 0)
    return { current: totalCurrent, total: totalMax }
  }, [steps])

  // Track step completion
  useEffect(() => {
    steps.forEach((step, index) => {
      if (step.status === 'completed' && !completedSteps.has(index)) {
        setCompletedSteps(prev => new Set(prev).add(index))
        onStepComplete?.(index, step)
      }
      
      if (step.status === 'error') {
        onStepError?.(index, step.error || 'Unknown error')
      }
    })

    // Check if all steps are complete
    const allComplete = steps.every(step => step.status === 'completed')
    if (allComplete && steps.length > 0) {
      onAllComplete?.()
    }
  }, [steps, completedSteps, onStepComplete, onAllComplete, onStepError])

  const getStepIcon = (step: StepItem, index: number) => {
    switch (step.status) {
      case 'completed':
        return <Text color={colors.semantic.state.success}>✓</Text>
      case 'error':
        return <Text color={colors.semantic.state.error}>✗</Text>
      case 'running':
        return <Text color={colors.primary[500]}>⟳</Text>
      case 'pending':
        return index === activeStepIndex ? 
          <Text color={colors.primary[300]}>○</Text> : 
          <Text color={colors.neutral[300]}>○</Text>
      default:
        return <Text color={colors.neutral[300]}>○</Text>
    }
  }

  const getStepProgress = (step: StepItem, index: number) => {
    if (step.status === 'running' || (index === activeStepIndex && step.current > 0)) {
      return (
        <Box marginLeft={2} marginTop={1}>
          <SmartProgress
            current={step.current}
            total={step.total}
            label=""
            variant={step.status === 'error' ? 'error' : variant}
            size={size === 'lg' ? 'md' : 'sm'}
            animated={animated && step.status === 'running'}
            unit={step.unit}
            showETA={true}
            showSpeed={false}
            showRemaining={true}
            barWidth={30}
          />
        </Box>
      )
    }
    return null
  }

  const StepList = () => (
    <Box flexDirection="column">
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex
        const isCompleted = step.status === 'completed'
        const hasError = step.status === 'error'
        
        return (
          <Box key={step.key} flexDirection="column" marginBottom={1}>
            {/* Step header */}
            <Box alignItems="flex-start">
              {/* Icon */}
              <Box marginRight={2} alignItems="center" justifyContent="center" minWidth={3}>
                {getStepIcon(step, index)}
              </Box>
              
              {/* Step info */}
              <Box flexDirection="column" flexGrow={1}>
                <Box alignItems="center" justifyContent="space-between">
                  <Text
                    color={
                      hasError ? colors.semantic.state.error :
                      isCompleted ? colors.semantic.state.success :
                      isActive ? colors.semantic.text.primary :
                      colors.semantic.text.secondary
                    }
                    bold={isActive}
                  >
                    {step.label}
                  </Text>
                  
                  {/* Status indicator */}
                  <Text 
                    color={
                      hasError ? colors.semantic.state.error :
                      isCompleted ? colors.semantic.state.success :
                      step.status === 'running' ? colors.primary[500] :
                      colors.semantic.text.tertiary
                    }
                    dimColor={!isActive && !isCompleted && !hasError}
                  >
                    {step.status === 'running' && '●'}
                    {step.status === 'completed' && 'Done'}
                    {step.status === 'error' && 'Failed'}
                    {step.status === 'pending' && isActive && 'Current'}
                  </Text>
                </Box>
                
                {/* Description */}
                {step.description && (
                  <Text 
                    color={colors.semantic.text.tertiary}
                    dimColor
                  >
                    {step.description}
                  </Text>
                )}
                
                {/* Error message */}
                {hasError && step.error && (
                  <Text color={colors.semantic.state.error}>
                    Error: {step.error}
                  </Text>
                )}
              </Box>
            </Box>
            
            {/* Progress bar */}
            {getStepProgress(step, index)}
            
            {/* Connector line to next step */}
            {index < steps.length - 1 && (
              <Box marginLeft={1} height={1}>
                <Text color={colors.neutral[200]}>│</Text>
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )

  return (
    <Box flexDirection="column" {...style}>
      {/* Title */}
      {title && (
        <Box marginBottom={2}>
          <Text color={colors.semantic.text.primary} bold>
            {title}
          </Text>
        </Box>
      )}

      {/* Overall progress */}
      {showOverallProgress && (
        <Box marginBottom={3}>
          <SmartProgress
            current={overallProgress.current}
            total={overallProgress.total}
            label="Overall Progress"
            variant={variant}
            size={size === 'sm' ? 'md' : 'lg'}
            animated={animated}
            showETA={true}
            showSpeed={true}
            showRemaining={true}
          />
        </Box>
      )}

      {/* Step list */}
      <StepList />
      
      {/* Summary */}
      <Box marginTop={2}>
        <Text color={colors.semantic.text.secondary} dimColor>
          Step {Math.min(activeStepIndex + 1, steps.length)} of {steps.length}
          {completedSteps.size > 0 && ` • ${completedSteps.size} completed`}
          {steps.some(s => s.status === 'error') && (
            <Text color={colors.semantic.state.error}>
              {' '}• {steps.filter(s => s.status === 'error').length} failed
            </Text>
          )}
        </Text>
      </Box>
    </Box>
  )
}

export default ProgressStepWizard