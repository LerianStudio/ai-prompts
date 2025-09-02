/**
 * Error Handling Service
 * 
 * Provides centralized error handling capabilities for the Lerian Protocol
 * installation system. Translates system errors into user-friendly messages
 * and provides actionable troubleshooting guidance.
 * 
 * @module services/error-handler-service
 */

const chalk = require('chalk')

class ErrorHandlerService {
  constructor() {
    this.errorMappings = new Map([
      ['EACCES', this.createPermissionError],
      ['permission denied', this.createPermissionError],
      ['ENOENT', this.createFileNotFoundError],
      ['no such file', this.createFileNotFoundError],
      ['ENOSPC', this.createDiskSpaceError],
      ['no space left', this.createDiskSpaceError],
      ['timeout', this.createTimeoutError],
      ['EMFILE', this.createTooManyFilesError],
      ['too many open files', this.createTooManyFilesError],
      ['dest already exists', this.createFileConflictError]
    ])
  }

  /**
   * Converts system errors into user-friendly actionable messages
   * @param {Error} error - The error to process
   * @returns {string} User-friendly error message with suggestions
   */
  getActionableErrorMessage(error) {
    const message = error.message || 'Unknown error'
    
    for (const [pattern, handler] of this.errorMappings) {
      if (message.includes(pattern)) {
        return handler.call(this, message)
      }
    }
    
    return this.createGenericError(message)
  }

  /**
   * Displays comprehensive troubleshooting guidance
   * @param {Error} error - The error that occurred
   * @param {Function} outputLog - Logging function to use
   */
  showTroubleshootingHelp(error, outputLog) {
    outputLog(chalk.yellow('\n⚠ Troubleshooting Steps:'))
    outputLog('1. Check directory permissions and disk space')
    outputLog('2. Ensure no other installation is running')
    outputLog('3. Try running with DEBUG_INSTALLER=1 for detailed logs')
    outputLog('4. Check Node.js version compatibility (>=16.0.0)')

    if (error.code) {
      outputLog(chalk.gray(`\nError Code: ${error.code}`))
    }

    outputLog(
      chalk.blue(
        '\n✓ For more help, visit: https://github.com/LerianStudio/ai-prompts/issues'
      )
    )
  }

  /**
   * Creates permission error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createPermissionError(message) {
    return `Permission denied. Try running with elevated permissions or check directory access rights.\n${chalk.gray('✓ Suggestion: Run with sudo (Linux/Mac) or as Administrator (Windows)')}`
  }

  /**
   * Creates file not found error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createFileNotFoundError(message) {
    return `File or directory not found. Please check the installation path exists and is accessible.\n${chalk.gray('✓ Suggestion: Verify the target directory exists and you have read/write access')}`
  }

  /**
   * Creates disk space error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createDiskSpaceError(message) {
    return `Insufficient disk space. Please free up some space and try again.\n${chalk.gray("✓ Suggestion: Check available disk space with 'df -h' (Unix) or File Explorer (Windows)")}`
  }

  /**
   * Creates timeout error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createTimeoutError(message) {
    return `Operation timed out. This might be due to slow disk I/O or system load.\n${chalk.gray('✓ Suggestion: Try again or run with DEBUG_INSTALLER=1 for more details')}`
  }

  /**
   * Creates too many files error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createTooManyFilesError(message) {
    return `Too many open files. Please increase system file limits.\n${chalk.gray('✓ Suggestion: Close other applications and try again')}`
  }

  /**
   * Creates file conflict error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createFileConflictError(message) {
    return `File operation conflict during update. This should have been resolved automatically.\n${chalk.gray('✓ Suggestion: Try again, or manually remove the target directory and reinstall')}`
  }

  /**
   * Creates generic error message
   * @param {string} message - Original error message
   * @returns {string} Formatted error message
   */
  createGenericError(message) {
    return `${message}\n${chalk.gray('✓ Run with DEBUG_INSTALLER=1 for detailed logs')}`
  }
}

module.exports = ErrorHandlerService