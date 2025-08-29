import React, { useMemo, useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../design/colors'
import { typography } from '../../design/typography'
import { spacing } from '../../design/spacing'
import { animations } from '../../design/animations'
import { SmartProgressProps } from '../../types/components'

interface ETACalculation {
  eta: number
  speed: number
  remaining: number
  formatted: {
    eta: string
    speed: string
    remaining: string
    elapsed: string
  }
}

interface ProgressHistory {
  timestamp: number
  value: number
}

const HISTORY_SIZE = 10
const MIN_SAMPLES = 3
const SMOOTHING_FACTOR = 0.7

export const SmartProgress: React.FC<SmartProgressProps> = ({
  current = 0,
  total = 100,
  label = 'Progress',
  showPercentage = true,
  showETA = true,
  showSpeed = true,
  showRemaining = true,
  showElapsed = true,
  unit = 'items',
  speedUnit = 'items/sec',
  variant = 'default',
  size = 'md',
  animated = true,
  showBar = true,
  barWidth,
  precision = 1,
  smoothing = true,
  minUpdateInterval = 100,
  style,
  className,
  onComplete,
  onProgress,
}) => {
  const [history, setHistory] = useState<ProgressHistory[]>([])
  const [startTime] = useState(Date.now())
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [animationFrame, setAnimationFrame] = useState(0)

  // Calculate progress percentage
  const percentage = useMemo(() => {
    if (total === 0) return 0
    return Math.min(100, Math.max(0, (current / total) * 100))
  }, [current, total])

  // Update history for ETA calculations
  useEffect(() => {
    const now = Date.now()
    
    // Throttle updates based on minUpdateInterval
    if (now - lastUpdate < minUpdateInterval) return
    
    setHistory(prev => {
      const newHistory = [...prev, { timestamp: now, value: current }]
      
      // Keep only recent history
      if (newHistory.length > HISTORY_SIZE) {
        return newHistory.slice(-HISTORY_SIZE)
      }
      
      return newHistory
    })
    
    setLastUpdate(now)
    
    // Call progress callback
    onProgress?.(current, total, percentage)
    
    // Call complete callback
    if (current >= total && onComplete) {
      onComplete()
    }
  }, [current, total, percentage, minUpdateInterval, lastUpdate, onComplete, onProgress])

  // Calculate ETA and speed
  const etaCalculation = useMemo((): ETACalculation => {
    const now = Date.now()
    const elapsed = (now - startTime) / 1000
    
    if (history.length < MIN_SAMPLES || current >= total) {
      return {
        eta: 0,
        speed: 0,
        remaining: total - current,
        formatted: {
          eta: '--',
          speed: '--',
          remaining: formatNumber(total - current, unit),
          elapsed: formatDuration(elapsed)
        }
      }
    }

    // Calculate speed using linear regression or simple average
    let speed: number
    
    if (smoothing && history.length >= MIN_SAMPLES) {
      // Use weighted moving average for smoother calculations
      const recent = history.slice(-MIN_SAMPLES)
      const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000
      const valueSpan = recent[recent.length - 1].value - recent[0].value
      
      speed = timeSpan > 0 ? valueSpan / timeSpan : 0
      
      // Apply smoothing factor
      if (history.length > MIN_SAMPLES) {
        const prevSpeed = history.length >= 4 ? 
          ((history[history.length - 2].value - history[history.length - 4].value) / 
           ((history[history.length - 2].timestamp - history[history.length - 4].timestamp) / 1000)) : speed
        speed = prevSpeed * SMOOTHING_FACTOR + speed * (1 - SMOOTHING_FACTOR)
      }
    } else {
      // Simple speed calculation
      const timeSpan = (now - history[0].timestamp) / 1000
      const valueSpan = current - history[0].value
      speed = timeSpan > 0 ? valueSpan / timeSpan : 0
    }

    const remaining = total - current
    const eta = speed > 0 ? remaining / speed : 0

    return {
      eta,
      speed: Math.max(0, speed),
      remaining,
      formatted: {
        eta: eta > 0 && eta < Infinity ? formatDuration(eta) : '--',
        speed: speed > 0 ? formatNumber(speed, speedUnit) : '--',
        remaining: formatNumber(remaining, unit),
        elapsed: formatDuration(elapsed)
      }
    }
  }, [history, current, total, startTime, smoothing, unit, speedUnit])

  // Animation for progress bar
  useEffect(() => {
    if (!animated) return
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % animations.spinners.dots.length)
    }, 200)
    
    return () => clearInterval(interval)
  }, [animated])

  // Calculate dimensions
  const progressBarWidth = barWidth || (process.stdout.columns ? Math.min(40, process.stdout.columns - 20) : 40)
  const filledWidth = Math.round((percentage / 100) * progressBarWidth)
  
  // Get theme colors based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          bar: colors.semantic.state.success,
          text: colors.semantic.text.primary,
          accent: colors.semantic.state.success
        }
      case 'warning':
        return {
          bar: colors.semantic.state.warning,
          text: colors.semantic.text.primary,
          accent: colors.semantic.state.warning
        }
      case 'error':
        return {
          bar: colors.semantic.state.error,
          text: colors.semantic.text.primary,
          accent: colors.semantic.state.error
        }
      default:
        return {
          bar: colors.primary[500],
          text: colors.semantic.text.primary,
          accent: colors.primary[400]
        }
    }
  }

  const variantColors = getVariantColors()

  // Progress bar component
  const ProgressBar = () => {
    if (!showBar) return null

    const filled = '█'.repeat(filledWidth)
    const empty = '░'.repeat(progressBarWidth - filledWidth)
    
    return (
      <Box>
        <Text color={variantColors.bar}>
          {filled}
        </Text>
        <Text color={colors.neutral[300]}>
          {empty}
        </Text>
        {animated && current < total && (
          <Text color={variantColors.accent}>
            {' '}
            {animations.spinners.dots[animationFrame]}
          </Text>
        )}
      </Box>
    )
  }

  // Stats component
  const Stats = () => {
    const stats = []
    
    if (showPercentage) {
      stats.push(`${percentage.toFixed(precision)}%`)
    }
    
    if (showETA && etaCalculation.formatted.eta !== '--') {
      stats.push(`ETA ${etaCalculation.formatted.eta}`)
    }
    
    if (showSpeed && etaCalculation.formatted.speed !== '--') {
      stats.push(`${etaCalculation.formatted.speed}`)
    }
    
    if (showRemaining) {
      stats.push(`${etaCalculation.formatted.remaining} left`)
    }
    
    if (showElapsed) {
      stats.push(`${etaCalculation.formatted.elapsed} elapsed`)
    }

    return stats.length > 0 ? (
      <Text color={colors.semantic.text.secondary} dimColor>
        {stats.join(' • ')}
      </Text>
    ) : null
  }

  const sizeStyles = {
    sm: { marginY: 0 },
    md: { marginY: 1 },
    lg: { marginY: 1 }
  }

  return (
    <Box
      flexDirection="column"
      {...sizeStyles[size]}
      {...style}
    >
      {/* Label and current/total */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color={variantColors.text} bold={size === 'lg'}>
          {label}
        </Text>
        <Text color={colors.semantic.text.secondary}>
          {formatNumber(current, unit)} / {formatNumber(total, unit)}
        </Text>
      </Box>

      {/* Progress bar */}
      <ProgressBar />

      {/* Stats */}
      <Box marginTop={1}>
        <Stats />
      </Box>
    </Box>
  )
}

// Utility functions
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
}

function formatNumber(num: number, unit: string = ''): string {
  if (num < 1000) {
    return `${Math.round(num)}${unit ? ' ' + unit : ''}`
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K${unit ? ' ' + unit : ''}`
  } else {
    return `${(num / 1000000).toFixed(1)}M${unit ? ' ' + unit : ''}`
  }
}

export default SmartProgress