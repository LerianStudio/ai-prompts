/**
 * Animation System
 * Subtle animations and transitions for enhanced TUI experience
 */

// Timing functions
export const easings = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic bezier curves (for conceptual use)
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const

// Duration scale (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000
} as const

// Animation frame characters for spinners and loading states
export const spinnerFrames = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  bounce: ['⠁', '⠂', '⠄', '⠂'],
  pulse: ['●', '○', '●', '○'],
  clock: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'],
  moon: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
  earth: ['🌍', '🌎', '🌏']
} as const

// Progress bar frames
export const progressFrames = {
  blocks: ['░', '▒', '▓', '█'],
  bars: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'],
  circles: ['○', '◔', '◑', '◕', '●'],
  squares: ['□', '◱', '◧', '▣', '■'],
  dots: ['⚬', '⚬', '⚬', '⚫']
} as const

// Text animation effects
export const textAnimations = {
  /**
   * Typewriter effect generator
   */
  typewriter: function* (text: string, delay: number = 100): Generator<string> {
    for (let i = 0; i <= text.length; i++) {
      yield text.substring(0, i)
      if (i < text.length) {
        // Simulate delay
        const start = Date.now()
        while (Date.now() - start < delay) {
          // Wait
        }
      }
    }
  },

  /**
   * Wave effect on text
   */
  wave: (text: string, frame: number): string => {
    return text
      .split('')
      .map((char, index) => {
        const offset = Math.sin((frame + index) * 0.5) * 2
        const intensity = Math.max(0, Math.min(1, (offset + 2) / 4))
        
        // Simple intensity-based styling (could be enhanced with color)
        if (intensity > 0.8) return `\u001b[1m${char}\u001b[22m` // bold
        if (intensity > 0.6) return `\u001b[2m${char}\u001b[22m` // dim
        return char
      })
      .join('')
  },

  /**
   * Blinking text effect
   */
  blink: (text: string, frame: number, interval: number = 500): string => {
    const shouldShow = Math.floor(frame / interval) % 2 === 0
    return shouldShow ? text : ' '.repeat(text.length)
  },

  /**
   * Fade effect using different character intensities
   */
  fade: (text: string, intensity: number): string => {
    if (intensity >= 1) return text
    if (intensity <= 0) return ' '.repeat(text.length)
    
    // Use Unicode block characters for fade effect
    const fadeChars = ['░', '▒', '▓', '█']
    const fadeLevel = Math.floor(intensity * fadeChars.length)
    const fadeChar = fadeChars[Math.min(fadeLevel, fadeChars.length - 1)]
    
    return text.split('').map(char => char === ' ' ? ' ' : fadeChar).join('')
  }
} as const

// Loading state animations
export class LoadingAnimation {
  private frames: string[]
  private currentFrame: number = 0
  private interval: NodeJS.Timeout | null = null
  private callback: ((frame: string) => void) | null = null

  constructor(type: keyof typeof spinnerFrames = 'dots') {
    this.frames = spinnerFrames[type]
  }

  start(callback: (frame: string) => void, speed: number = 100): void {
    this.callback = callback
    this.interval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length
      callback(this.frames[this.currentFrame])
    }, speed)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  getCurrentFrame(): string {
    return this.frames[this.currentFrame]
  }
}

// Progress animation utility
export class ProgressAnimation {
  private width: number
  private filled: number = 0
  private frames: string[]

  constructor(width: number, type: keyof typeof progressFrames = 'blocks') {
    this.width = width
    this.frames = progressFrames[type]
  }

  render(progress: number): string {
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress))
    
    // Calculate filled width
    const filledWidth = Math.floor(clampedProgress * this.width)
    const remainder = (clampedProgress * this.width) % 1
    
    let bar = ''
    
    // Add filled portion
    bar += this.frames[this.frames.length - 1].repeat(filledWidth)
    
    // Add partial fill if there's a remainder
    if (remainder > 0 && filledWidth < this.width) {
      const partialIndex = Math.floor(remainder * (this.frames.length - 1))
      bar += this.frames[partialIndex]
      bar += this.frames[0].repeat(this.width - filledWidth - 1)
    } else if (filledWidth < this.width) {
      bar += this.frames[0].repeat(this.width - filledWidth)
    }

    return bar
  }

  setWidth(width: number): void {
    this.width = width
  }
}

// Transition utilities
export const transitions = {
  /**
   * Create a smooth transition between two values
   */
  lerp: (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress
  },

  /**
   * Apply easing function to progress
   */
  ease: (progress: number, easing: keyof typeof easings = 'easeInOut'): number => {
    switch (easing) {
      case 'easeIn':
        return progress * progress
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2)
      case 'easeInOut':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
      default:
        return progress
    }
  },

  /**
   * Create a timing function
   */
  createTimer: (duration: number, callback: (progress: number) => void): (() => void) => {
    let startTime: number | null = null
    let animationId: NodeJS.Timeout | null = null

    const animate = () => {
      if (startTime === null) startTime = Date.now()
      
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      callback(progress)
      
      if (progress < 1) {
        animationId = setTimeout(animate, 16) // ~60fps
      }
    }

    animate()

    // Return cleanup function
    return () => {
      if (animationId) {
        clearTimeout(animationId)
        animationId = null
      }
    }
  }
} as const

// Export combined animations
export const animations = {
  easings,
  durations,
  spinners: spinnerFrames,
  progress: progressFrames,
  text: textAnimations,
  transitions,
  LoadingAnimation,
  ProgressAnimation
} as const

// Export types
export type SpinnerType = keyof typeof spinnerFrames
export type ProgressType = keyof typeof progressFrames
export type EasingType = keyof typeof easings
export type DurationType = keyof typeof durations