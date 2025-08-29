
const chalk = require('chalk')
const TerminalDetector = require('../utils/terminal')

class ProgressIndicator {
  constructor(options = {}) {
    this.options = {
      showPercentage: options.showPercentage !== false,
      showETA: options.showETA !== false,
      showSpeed: options.showSpeed !== false,
      showCurrentFile: options.showCurrentFile !== false,
      animationSpeed: options.animationSpeed || 150, // ms
      updateThreshold: options.updateThreshold || 50, // ms minimum between updates
      ...options
    }
    
    // Terminal configuration
    this.terminalConfig = TerminalDetector.getOptimalConfig(options.terminalOverrides)
    this.width = this.terminalConfig.maxWidth
    
    // Progress state
    this.mode = 'determinate' // 'determinate', 'indeterminate', 'completed', 'error'
    this.totalItems = 0
    this.completedItems = 0
    this.currentItem = null
    this.lastUpdate = 0
    
    this.startTime = null
    this.endTime = null
    this.statistics = {
      speed: 0, // items per second
      eta: 0, // estimated time remaining in ms
      throughput: 0, // bytes per second
      totalBytes: 0,
      processedBytes: 0
    }
    
    // Animation state
    this.animationFrame = 0
    this.animationTimer = null
    this.lastAnimationUpdate = 0
    
    // Rolling averages for smooth metrics
    this.speedHistory = []
    this.throughputHistory = []
    this.maxHistorySize = 10
    
    // Display state
    this.isVisible = false
    this.lastRenderedLines = 0
    
    this.setupAnimationChars()
    this.bindSignalHandlers()
  }

  /**
   * Setup animation characters based on terminal capabilities
   */
  setupAnimationChars() {
    if (this.terminalConfig.useUnicode) {
      this.spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      this.progressChars = {
        filled: '█',
        partial: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
        empty: '░',
        border: ['▐', '▌']
      }
    } else {
      this.spinnerChars = ['|', '/', '-', '\\']
      this.progressChars = {
        filled: '=',
        partial: ['-'],
        empty: '-',
        border: ['[', ']']
      }
    }
  }

  /**
   * Bind signal handlers for graceful cleanup
   */
  bindSignalHandlers() {
    const cleanup = () => {
      this.stop()
      process.exit(0)
    }
    
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
  }

  /**
   * Start progress tracking
   * @param {number} total - Total number of items to process
   * @param {Object} options - Additional options
   */
  start(total = 0, options = {}) {
    this.mode = total > 0 ? 'determinate' : 'indeterminate'
    this.totalItems = total
    this.completedItems = 0
    this.currentItem = null
    this.startTime = Date.now()
    this.endTime = null
    this.isVisible = true
    
    // Initialize statistics
    this.statistics = {
      speed: 0,
      eta: 0,
      throughput: 0,
      totalBytes: options.totalBytes || 0,
      processedBytes: 0
    }
    
    // Clear histories
    this.speedHistory = []
    this.throughputHistory = []
    
    // Start animation
    this.startAnimation()
    
    // Initial render
    this.render()
  }

  /**
   * Update progress
   * @param {number} completed - Number of completed items
   * @param {Object} currentItem - Current item being processed
   * @param {Object} stats - Additional statistics
   */
  update(completed = null, currentItem = null, stats = {}) {
    const now = Date.now()
    
    // Throttle updates
    if (now - this.lastUpdate < this.options.updateThreshold) {
      return
    }
    
    this.lastUpdate = now
    
    if (completed !== null) {
      this.completedItems = completed
    }
    
    if (currentItem) {
      this.currentItem = currentItem
    }
    
    // Update statistics
    if (stats.processedBytes !== undefined) {
      this.statistics.processedBytes = stats.processedBytes
    }
    
    this.calculateStatistics()
    this.render()
  }

  /**
   * Increment progress by one
   * @param {Object} currentItem - Current item being processed
   * @param {Object} stats - Additional statistics
   */
  increment(currentItem = null, stats = {}) {
    this.update(this.completedItems + 1, currentItem, stats)
  }

  /**
   * Set current operation details
   * @param {Object} item - Current item details
   */
  setCurrentItem(item) {
    this.currentItem = item
    this.render()
  }

  /**
   * Set progress mode
   * @param {string} mode - Progress mode ('determinate', 'indeterminate', 'completed', 'error')
   */
  setMode(mode) {
    this.mode = mode
    this.render()
  }

  /**
   * Complete progress tracking
   * @param {Object} finalStats - Final statistics
   */
  complete(finalStats = {}) {
    this.mode = 'completed'
    this.endTime = Date.now()
    this.completedItems = this.totalItems
    
    // Update final statistics
    Object.assign(this.statistics, finalStats)
    this.calculateStatistics()
    
    this.stopAnimation()
    this.render()
    
    // Move cursor to next line for final display
    if (this.isVisible) {
      process.stdout.write('\n')
    }
  }

  /**
   * Set error state
   * @param {Error|string} error - Error information
   */
  setError(error) {
    this.mode = 'error'
    this.error = error
    this.stopAnimation()
    this.render()
  }

  /**
   * Stop progress tracking and cleanup
   */
  stop() {
    this.isVisible = false
    this.stopAnimation()
    this.clearDisplay()
  }

  /**
   * Calculate performance statistics
   */
  calculateStatistics() {
    if (!this.startTime || this.completedItems === 0) {return}
    
    const elapsedTime = (this.endTime || Date.now()) - this.startTime
    const elapsedSeconds = elapsedTime / 1000
    
    // Calculate current speed (items per second)
    const currentSpeed = this.completedItems / elapsedSeconds
    
    // Update rolling average for speed
    this.speedHistory.push(currentSpeed)
    if (this.speedHistory.length > this.maxHistorySize) {
      this.speedHistory.shift()
    }
    
    this.statistics.speed = this.speedHistory.reduce((a, b) => a + b, 0) / this.speedHistory.length
    
    // Calculate throughput if byte information is available
    if (this.statistics.processedBytes > 0) {
      const currentThroughput = this.statistics.processedBytes / elapsedSeconds
      
      this.throughputHistory.push(currentThroughput)
      if (this.throughputHistory.length > this.maxHistorySize) {
        this.throughputHistory.shift()
      }
      
      this.statistics.throughput = this.throughputHistory.reduce((a, b) => a + b, 0) / this.throughputHistory.length
    }
    
    // Calculate ETA for determinate progress
    if (this.mode === 'determinate' && this.totalItems > this.completedItems) {
      const remainingItems = this.totalItems - this.completedItems
      const avgSpeed = this.statistics.speed
      
      if (avgSpeed > 0) {
        this.statistics.eta = (remainingItems / avgSpeed) * 1000 // Convert to milliseconds
      }
    }
  }

  /**
   * Start animation timer
   */
  startAnimation() {
    if (this.animationTimer) {return}
    
    this.animationTimer = setInterval(() => {
      this.animationFrame = (this.animationFrame + 1) % this.spinnerChars.length
      
      // Only re-render if enough time has passed
      const now = Date.now()
      if (now - this.lastAnimationUpdate > this.options.animationSpeed) {
        this.lastAnimationUpdate = now
        this.render()
      }
    }, this.options.animationSpeed)
  }

  /**
   * Stop animation timer
   */
  stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer)
      this.animationTimer = null
    }
  }

  /**
   * Render progress display
   */
  render() {
    if (!this.isVisible) {return}
    
    const lines = this.buildDisplay()
    this.displayLines(lines)
  }

  /**
   * Build display lines
   * @returns {string[]} Array of display lines
   */
  buildDisplay() {
    const lines = []
    
    // Main progress line
    lines.push(this.buildMainProgressLine())
    
    // Current item line (if enabled and available)
    if (this.options.showCurrentFile && this.currentItem) {
      lines.push(this.buildCurrentItemLine())
    }
    
    // Statistics line (if any statistics are enabled)
    if (this.shouldShowStatistics()) {
      lines.push(this.buildStatisticsLine())
    }
    
    return lines
  }

  /**
   * Build main progress line
   * @returns {string} Main progress line
   */
  buildMainProgressLine() {
    let line = ''
    
    // Status indicator based on mode
    switch (this.mode) {
      case 'determinate':
        line += this.buildProgressBar()
        break
      case 'indeterminate':
        line += this.buildSpinner()
        break
      case 'completed':
        line += this.buildCompletedIndicator()
        break
      case 'error':
        line += this.buildErrorIndicator()
        break
    }
    
    return line
  }

  /**
   * Build progress bar for determinate mode
   * @returns {string} Progress bar string
   */
  buildProgressBar() {
    const percentage = this.totalItems > 0 ? (this.completedItems / this.totalItems) * 100 : 0
    const barWidth = Math.max(20, this.width - 30) // Reserve space for percentage and counters
    
    let line = ''
    
    // Color based on progress
    const color = percentage >= 100 ? chalk.green :
                  percentage >= 75 ? chalk.blue :
                  percentage >= 50 ? chalk.yellow :
                  chalk.white
    
    // Build progress bar
    if (this.terminalConfig.useColor) {
      const filledWidth = Math.floor((percentage / 100) * barWidth)
      const emptyWidth = barWidth - filledWidth
      
      line += chalk.gray(this.progressChars.border[0])
      line += color(this.progressChars.filled.repeat(filledWidth))
      line += chalk.gray(this.progressChars.empty.repeat(emptyWidth))
      line += chalk.gray(this.progressChars.border[1])
    } else {
      // ASCII fallback
      const filledWidth = Math.floor((percentage / 100) * barWidth)
      const emptyWidth = barWidth - filledWidth
      
      line += '['
      line += '='.repeat(filledWidth)
      line += '-'.repeat(emptyWidth)
      line += ']'
    }
    
    // Add percentage
    if (this.options.showPercentage) {
      line += ` ${percentage.toFixed(1)}%`
    }
    
    // Add counter
    line += ` (${this.completedItems}/${this.totalItems})`
    
    return line
  }

  /**
   * Build spinner for indeterminate mode
   * @returns {string} Spinner string
   */
  buildSpinner() {
    const spinner = this.spinnerChars[this.animationFrame]
    let line = this.terminalConfig.useColor ? chalk.cyan(spinner) : spinner
    line += ' Processing...'
    
    if (this.completedItems > 0) {
      line += ` (${this.completedItems} completed)`
    }
    
    return line
  }

  /**
   * Build completed indicator
   * @returns {string} Completed indicator string
   */
  buildCompletedIndicator() {
    const checkmark = this.terminalConfig.useUnicode ? '✓' : 'DONE'
    let line = this.terminalConfig.useColor ? chalk.green(checkmark) : checkmark
    line += ' Completed'
    
    if (this.totalItems > 0) {
      line += ` (${this.totalItems} items)`
    }
    
    // Add elapsed time
    if (this.startTime && this.endTime) {
      const elapsed = this.endTime - this.startTime
      line += ` in ${this.formatDuration(elapsed)}`
    }
    
    return line
  }

  /**
   * Build error indicator
   * @returns {string} Error indicator string
   */
  buildErrorIndicator() {
    const errorMark = this.terminalConfig.useUnicode ? '✗' : 'ERROR'
    let line = this.terminalConfig.useColor ? chalk.red(errorMark) : errorMark
    line += ' Failed'
    
    if (this.error) {
      const errorMsg = this.error.message || this.error.toString()
      line += `: ${errorMsg.substring(0, 50)}`
      if (errorMsg.length > 50) {
        line += '...'
      }
    }
    
    return line
  }

  /**
   * Build current item line
   * @returns {string} Current item line
   */
  buildCurrentItemLine() {
    if (!this.currentItem) {return ''}
    
    const maxLength = this.width - 4
    let line = '  '
    
    // Operation icon
    const operationIcons = {
      copy: this.terminalConfig.useUnicode ? '📄' : 'COPY',
      move: this.terminalConfig.useUnicode ? '🔀' : 'MOVE',
      delete: this.terminalConfig.useUnicode ? '🗑️' : 'DEL',
      create: this.terminalConfig.useUnicode ? '📝' : 'NEW',
      update: this.terminalConfig.useUnicode ? '✏️' : 'UPD'
    }
    
    const operation = this.currentItem.operation || 'processing'
    const icon = operationIcons[operation] || '📋'
    
    if (this.terminalConfig.useColor) {
      line += chalk.blue(icon)
    } else {
      line += icon
    }
    
    line += ' '
    
    // File path (truncated if necessary)
    let path = this.currentItem.path || this.currentItem.name || 'Unknown'
    if (path.length > maxLength - 10) {
      path = '...' + path.substring(path.length - (maxLength - 13))
    }
    
    line += chalk.gray(path)
    
    // Additional details
    if (this.currentItem.size) {
      line += chalk.dim(` (${this.formatBytes(this.currentItem.size)})`)
    }
    
    return line
  }

  /**
   * Build statistics line
   * @returns {string} Statistics line
   */
  buildStatisticsLine() {
    const stats = []
    
    // Speed
    if (this.options.showSpeed && this.statistics.speed > 0) {
      stats.push(`${this.statistics.speed.toFixed(1)} items/s`)
    }
    
    // Throughput
    if (this.options.showSpeed && this.statistics.throughput > 0) {
      stats.push(`${this.formatBytes(this.statistics.throughput)}/s`)
    }
    
    // ETA
    if (this.options.showETA && this.statistics.eta > 0) {
      stats.push(`ETA: ${this.formatDuration(this.statistics.eta)}`)
    }
    
    if (stats.length === 0) {return ''}
    
    const line = '  ' + stats.join(' • ')
    return this.terminalConfig.useColor ? chalk.dim(line) : line
  }

  /**
   * Check if statistics should be shown
   * @returns {boolean} True if any statistics should be shown
   */
  shouldShowStatistics() {
    return (this.options.showSpeed && (this.statistics.speed > 0 || this.statistics.throughput > 0)) ||
           (this.options.showETA && this.statistics.eta > 0)
  }

  /**
   * Display lines to terminal
   * @param {string[]} lines - Lines to display
   */
  displayLines(lines) {
    // Clear previous lines
    this.clearPreviousLines()
    
    // Write new lines
    lines.forEach((line, index) => {
      if (index > 0) {process.stdout.write('\n')}
      process.stdout.write(line)
    })
    
    this.lastRenderedLines = lines.length
  }

  /**
   * Clear previous display lines
   */
  clearPreviousLines() {
    for (let i = 0; i < this.lastRenderedLines; i++) {
      if (i > 0) {
        process.stdout.write('\x1b[1A') // Move up one line
      }
      process.stdout.write('\r\x1b[K') // Clear line
    }
  }

  /**
   * Clear entire display
   */
  clearDisplay() {
    this.clearPreviousLines()
    this.lastRenderedLines = 0
  }

  /**
   * Format bytes for display
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted byte string
   */
  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Format duration for display
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  formatDuration(ms) {
    if (ms < 1000) {return `${Math.round(ms)}ms`}
    
    const seconds = Math.floor(ms / 1000)
    
    if (seconds < 60) {return `${seconds}s`}
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  /**
   * Get current progress information
   * @returns {Object} Progress information object
   */
  getProgress() {
    return {
      mode: this.mode,
      total: this.totalItems,
      completed: this.completedItems,
      percentage: this.totalItems > 0 ? (this.completedItems / this.totalItems) * 100 : 0,
      currentItem: this.currentItem,
      statistics: { ...this.statistics },
      elapsedTime: this.startTime ? (this.endTime || Date.now()) - this.startTime : 0
    }
  }

  /**
   * Update terminal configuration
   * @param {Object} newConfig - New terminal configuration
   */
  updateTerminalConfig(newConfig) {
    this.terminalConfig = { ...this.terminalConfig, ...newConfig }
    this.width = this.terminalConfig.maxWidth
    this.setupAnimationChars()
  }
}

module.exports = ProgressIndicator