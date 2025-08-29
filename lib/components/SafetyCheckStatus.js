const chalk = require('chalk')

/**
 * SafetyCheckStatus - Visual display component for safety check results
 * Provides formatted output with visual indicators, coloring, and responsive layout
 */
class SafetyCheckStatus {
  constructor(checks = []) {
    this.checks = checks
    this.terminalWidth = process.stdout.columns || 80
    this.statusCache = new Map()
    this.updateListener = null
  }

  /**
   * Main render method - formats all checks into display output
   * @returns {string} Formatted output string with visual indicators
   */
  render() {
    if (this.checks.length === 0) {
      return chalk.gray('No safety checks to display')
    }

    const lines = []
    const categories = this.groupChecksByCategory()
    
    // Render by category for better organization
    for (const [category, categoryChecks] of Object.entries(categories)) {
      if (categoryChecks.length > 0) {
        lines.push(this.formatCategoryHeader(category))
        for (const check of categoryChecks) {
          lines.push(this.formatCheckLine(check))
          if (check.details && (check.status === 'fail' || check.status === 'warn')) {
            lines.push(...this.formatDetails(check.details))
          }
        }
        lines.push('') // Space between categories
      }
    }

    return lines.join('\n').trim()
  }

  /**
   * Get status icon with fallback support for terminals without Unicode
   * @param {string} status - Check status (pass, warn, fail, pending)
   * @returns {string} Visual indicator icon
   */
  getStatusIcon(status) {
    // Check if terminal supports Unicode (basic heuristic)
    const supportsUnicode = process.env.TERM !== 'dumb' && 
                           !process.env.CI && 
                           process.platform !== 'win32'
    
    if (supportsUnicode) {
      const icons = {
        pass: '✅',
        warn: '⚠️',
        fail: '❌',
        pending: '⏳',
        info: 'ℹ️'
      }
      return icons[status] || '❓'
    } else {
      // ASCII fallbacks for compatibility
      const asciiIcons = {
        pass: '[√]',
        warn: '[!]',
        fail: '[×]',
        pending: '[…]',
        info: '[i]'
      }
      return asciiIcons[status] || '[?]'
    }
  }

  /**
   * Format check message with appropriate coloring
   * @param {Object} check - Check object with status and message
   * @returns {string} Colored message
   */
  formatCheckMessage(check) {
    const colors = {
      pass: 'green',
      warn: 'yellow',
      fail: 'red',
      pending: 'blue',
      info: 'cyan'
    }
    
    const color = colors[check.status] || 'white'
    return chalk[color](check.message || 'Unknown check')
  }

  /**
   * Format individual check line with icon and message
   * @param {Object} check - Check object
   * @returns {string} Formatted check line
   */
  formatCheckLine(check) {
    const icon = this.getStatusIcon(check.status)
    const message = this.formatCheckMessage(check)
    const spacing = this.terminalWidth < 60 ? ' ' : '  '
    
    return `${spacing}${icon} ${message}`
  }

  /**
   * Format detailed information with proper indentation
   * @param {Array} details - Array of detail strings
   * @returns {Array} Array of formatted detail lines
   */
  formatDetails(details) {
    const indent = this.terminalWidth < 60 ? '    ' : '      '
    return details.map(detail => {
      // Handle long lines by wrapping
      if (detail.length > this.terminalWidth - indent.length - 5) {
        return this.wrapText(detail, indent)
      }
      return `${indent}${chalk.dim(detail)}`
    }).flat()
  }

  /**
   * Wrap long text to terminal width
   * @param {string} text - Text to wrap
   * @param {string} indent - Indentation for wrapped lines
   * @returns {Array} Array of wrapped lines
   */
  wrapText(text, indent) {
    const maxWidth = this.terminalWidth - indent.length - 2
    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    for (const word of words) {
      if ((currentLine + word).length > maxWidth) {
        if (currentLine.trim()) {
          lines.push(`${indent}${chalk.dim(currentLine.trim())}`)
          currentLine = word + ' '
        } else {
          // Single word longer than line, just add it
          lines.push(`${indent}${chalk.dim(word)}`)
        }
      } else {
        currentLine += word + ' '
      }
    }

    if (currentLine.trim()) {
      lines.push(`${indent}${chalk.dim(currentLine.trim())}`)
    }

    return lines
  }

  /**
   * Group checks by category for organized display
   * @returns {Object} Checks organized by category
   */
  groupChecksByCategory() {
    const categories = {
      git: [],
      paths: [],
      permissions: [],
      network: [],
      other: []
    }

    for (const check of this.checks) {
      const category = this.determineCategory(check)
      categories[category].push(check)
    }

    return categories
  }

  /**
   * Determine category for a check based on its ID and type
   * @param {Object} check - Check object
   * @returns {string} Category name
   */
  determineCategory(check) {
    if (!check.id) {return 'other'}
    
    if (check.id.includes('git') || check.id.includes('repository')) {
      return 'git'
    }
    if (check.id.includes('path') || check.id.includes('source') || check.id.includes('destination')) {
      return 'paths'
    }
    if (check.id.includes('permission') || check.id.includes('write') || check.id.includes('access')) {
      return 'permissions'
    }
    if (check.id.includes('network') || check.id.includes('connection')) {
      return 'network'
    }
    
    return 'other'
  }

  /**
   * Format category header with appropriate styling
   * @param {string} category - Category name
   * @returns {string} Formatted category header
   */
  formatCategoryHeader(category) {
    const headers = {
      git: 'Git Repository Checks',
      paths: 'Path Validation',
      permissions: 'Permission Checks',
      network: 'Network Connectivity',
      other: 'Additional Checks'
    }
    
    const header = headers[category] || 'Unknown Category'
    return chalk.bold.underline(header)
  }

  /**
   * Add check to the status display
   * @param {Object} check - Check object to add
   */
  addCheck(check) {
    this.checks.push(check)
    this.notifyUpdate()
  }

  /**
   * Update existing check by ID
   * @param {string} checkId - ID of check to update
   * @param {Object} updates - Updates to apply to check
   */
  updateCheck(checkId, updates) {
    const checkIndex = this.checks.findIndex(check => check.id === checkId)
    if (checkIndex !== -1) {
      this.checks[checkIndex] = { ...this.checks[checkIndex], ...updates }
      this.notifyUpdate()
    }
  }

  /**
   * Remove check by ID
   * @param {string} checkId - ID of check to remove
   */
  removeCheck(checkId) {
    this.checks = this.checks.filter(check => check.id !== checkId)
    this.notifyUpdate()
  }

  /**
   * Clear all checks
   */
  clearChecks() {
    this.checks = []
    this.statusCache.clear()
    this.notifyUpdate()
  }

  /**
   * Set up real-time update listener
   * @param {Function} callback - Function to call when status updates
   */
  onUpdate(callback) {
    this.updateListener = callback
  }

  /**
   * Notify listeners of status updates
   * @private
   */
  notifyUpdate() {
    if (this.updateListener && typeof this.updateListener === 'function') {
      this.updateListener(this.checks)
    }
  }

  /**
   * Get summary of check results
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const summary = {
      total: this.checks.length,
      passed: 0,
      failed: 0,
      warnings: 0,
      pending: 0
    }

    for (const check of this.checks) {
      switch (check.status) {
        case 'pass':
          summary.passed++
          break
        case 'fail':
          summary.failed++
          break
        case 'warn':
          summary.warnings++
          break
        case 'pending':
          summary.pending++
          break
      }
    }

    return summary
  }

  /**
   * Render compact summary line
   * @returns {string} Formatted summary
   */
  renderSummary() {
    const summary = this.getSummary()
    const parts = []

    if (summary.passed > 0) {
      parts.push(chalk.green(`${summary.passed} passed`))
    }
    if (summary.failed > 0) {
      parts.push(chalk.red(`${summary.failed} failed`))
    }
    if (summary.warnings > 0) {
      parts.push(chalk.yellow(`${summary.warnings} warnings`))
    }
    if (summary.pending > 0) {
      parts.push(chalk.blue(`${summary.pending} pending`))
    }

    if (parts.length === 0) {
      return chalk.gray('No checks available')
    }

    return `Safety Checks: ${parts.join(', ')}`
  }

  /**
   * Check if all critical checks are passing
   * @returns {boolean} True if safe to proceed
   */
  canProceed() {
    return this.checks.filter(check => check.status === 'fail').length === 0
  }

  /**
   * Get all failed checks
   * @returns {Array} Array of failed checks
   */
  getFailedChecks() {
    return this.checks.filter(check => check.status === 'fail')
  }

  /**
   * Get all warning checks
   * @returns {Array} Array of warning checks
   */
  getWarningChecks() {
    return this.checks.filter(check => check.status === 'warn')
  }
}

module.exports = SafetyCheckStatus