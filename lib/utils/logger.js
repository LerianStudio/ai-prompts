/**
 * Centralized logging system
 * Replaces console.log usage with configurable, structured logging
 */

const chalk = require('chalk')

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

class Logger {
  constructor(options = {}) {
    this.options = {
      level: options.level || this.getLogLevelFromEnv(),
      enableColors: options.enableColors !== false,
      enableTimestamp: options.enableTimestamp !== false,
      prefix: options.prefix || '',
      ...options
    }
  }

  getLogLevelFromEnv() {
    const level = process.env.LOG_LEVEL || process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO'
    return LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.options.level
  }

  formatMessage(level, message, ...args) {
    const parts = []
    
    // Add timestamp
    if (this.options.enableTimestamp) {
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
      parts.push(this.options.enableColors ? chalk.gray(timestamp) : timestamp)
    }
    
    // Add prefix
    if (this.options.prefix) {
      parts.push(this.options.enableColors ? chalk.cyan(`[${this.options.prefix}]`) : `[${this.options.prefix}]`)
    }
    
    // Add level indicator
    if (this.options.enableColors) {
      const levelColors = {
        ERROR: chalk.red.bold,
        WARN: chalk.yellow.bold,
        INFO: chalk.blue,
        DEBUG: chalk.gray
      }
      parts.push(levelColors[level](`[${level}]`))
    } else {
      parts.push(`[${level}]`)
    }
    
    // Add message
    parts.push(message)
    
    return [parts.join(' '), ...args]
  }

  error(message, ...args) {
    if (this.shouldLog('ERROR')) {
      const formatted = this.formatMessage('ERROR', message, ...args)
      console.error(...formatted)
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('WARN')) {
      const formatted = this.formatMessage('WARN', message, ...args)
      console.warn(...formatted)
    }
  }

  info(message, ...args) {
    if (this.shouldLog('INFO')) {
      const formatted = this.formatMessage('INFO', message, ...args)
      console.log(...formatted)
    }
  }

  debug(message, ...args) {
    if (this.shouldLog('DEBUG')) {
      const formatted = this.formatMessage('DEBUG', message, ...args)
      console.log(...formatted)
    }
  }

  // Convenience methods for common patterns
  success(message, ...args) {
    if (this.shouldLog('INFO')) {
      const successMessage = this.options.enableColors ? chalk.green(message) : message
      this.info(successMessage, ...args)
    }
  }

  progress(message, ...args) {
    if (this.shouldLog('INFO')) {
      const progressMessage = this.options.enableColors ? chalk.cyan(message) : message
      this.info(progressMessage, ...args)
    }
  }

  log(message, ...args) {
    this.info(message, ...args)
  }

  // Create child logger with prefix
  child(prefix) {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix ? `${this.options.prefix}:${prefix}` : prefix
    })
  }
}

// Default instance
const defaultLogger = new Logger()

module.exports = {
  Logger,
  logger: defaultLogger,
  createLogger: (options) => new Logger(options)
}