/**
 * EnvironmentSanitizer.js
 * Secure environment variable access with sanitization and allowlisting
 *
 * Features:
 * - Allowlist-based environment variable access
 * - Value sanitization and masking
 * - Access logging and audit trail
 * - Validation and type coercion
 * - Security policy enforcement
 */

const { logger } = require('../utils/logger')

class EnvironmentSanitizer {
  constructor(options = {}) {
    this.options = {
      enableLogging: options.enableLogging !== false,
      enableMasking: options.enableMasking !== false,
      strictMode: options.strictMode || false,
      ...options
    }

    // Allowlist of safe environment variables
    this.allowedVariables = new Set([
      // System and runtime
      'NODE_ENV',
      'NODE_VERSION',
      'TERM',
      'TERM_PROGRAM',
      'TERM_PROGRAM_VERSION',
      'LANG',
      'LC_ALL',
      'PWD',
      'SHELL',
      
      // Terminal capabilities (safe for feature detection)
      'COLORTERM',
      'FORCE_COLOR',
      'NO_COLOR',
      'NO_UNICODE',
      'NO_EMOJI',
      'WT_SESSION', // Windows Terminal
      'CONEMU_ANSI_COLORS_DISABLED',
      
      // CI/CD detection (safe for build environments)
      'CI',
      'CONTINUOUS_INTEGRATION',
      'BUILD_NUMBER',
      'TRAVIS',
      'CIRCLECI',
      'APPVEYOR',
      'GITLAB_CI',
      'GITHUB_ACTIONS',
      'AZURE_PIPELINES',
      'JENKINS_URL',
      
      // Development and debugging (non-sensitive)
      'DEBUG_INSTALLER',
      'LOG_LEVEL',
      'INIT_CWD',
      
      // Windows compatibility
      'COMSPEC',
      
      // User identification (sanitized)
      'USER',
      'USERNAME'
    ])

    // Variables that should be masked in logs
    this.sensitivePatterns = [
      /.*KEY.*/i,
      /.*SECRET.*/i,
      /.*TOKEN.*/i,
      /.*PASSWORD.*/i,
      /.*AUTH.*/i,
      /.*CREDENTIAL.*/i,
      /.*PRIVATE.*/i
    ]

    // Access statistics
    this.stats = {
      totalAccess: 0,
      allowedAccess: 0,
      deniedAccess: 0,
      maskedValues: 0
    }
  }

  /**
   * Safely get environment variable with security checks
   * @param {string} key - Environment variable name
   * @param {*} defaultValue - Default value if not found or denied
   * @param {Object} options - Access options
   * @returns {*} Sanitized environment variable value
   */
  get(key, defaultValue = undefined, options = {}) {
    this.stats.totalAccess++

    // Check if variable is in allowlist
    if (!this.isAllowed(key)) {
      this.stats.deniedAccess++
      
      if (this.options.enableLogging) {
        logger.warn('Environment variable access denied', { 
          key, 
          reason: 'not in allowlist',
          stackTrace: this.options.strictMode ? new Error().stack : undefined
        })
      }

      if (this.options.strictMode) {
        throw new Error(`Access to environment variable '${key}' is denied by security policy`)
      }

      return defaultValue
    }

    this.stats.allowedAccess++
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    // Sanitize the value
    const sanitized = this.sanitize(key, value, options)

    if (this.options.enableLogging && !this.isSensitive(key)) {
      logger.debug('Environment variable accessed', { 
        key, 
        hasValue: !!value,
        valueLength: value ? value.length : 0
      })
    }

    return sanitized
  }

  /**
   * Get multiple environment variables safely
   * @param {string[]} keys - Array of environment variable names
   * @param {Object} options - Access options
   * @returns {Object} Object with sanitized environment variables
   */
  getMultiple(keys, options = {}) {
    const result = {}
    for (const key of keys) {
      const value = this.get(key, undefined, options)
      if (value !== undefined) {
        result[key] = value
      }
    }
    return result
  }

  isAllowed(key) {
    return this.allowedVariables.has(key)
  }

  isSensitive(key) {
    return this.sensitivePatterns.some(pattern => pattern.test(key))
  }

  /**
   * Sanitize environment variable value
   * @param {string} key - Environment variable name
   * @param {string} value - Environment variable value
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized value
   */
  sanitize(key, value, options = {}) {
    if (!value || typeof value !== 'string') {
      return value
    }

    // Apply type coercion if specified
    if (options.type === 'boolean') {
      return value.toLowerCase() === 'true'
    }

    if (options.type === 'number') {
      const num = parseInt(value, 10)
      return isNaN(num) ? options.defaultValue : num
    }

    if (options.type === 'float') {
      const num = parseFloat(value)
      return isNaN(num) ? options.defaultValue : num
    }

    // Sanitize string values
    let sanitized = value.trim()

    // Remove null bytes and control characters (except common ones)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Limit length to prevent memory issues
    const maxLength = options.maxLength || 1000
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
      logger.warn('Environment variable value truncated', { key, originalLength: value.length, maxLength })
    }

    return sanitized
  }

  getMaskedValue(key, value) {
    if (!this.options.enableMasking || !this.isSensitive(key) || !value) {
      return value
    }

    this.stats.maskedValues++

    if (value.length <= 4) {
      return '***'
    }

    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
  }

  allow(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArray) {
      this.allowedVariables.add(key)
      if (this.options.enableLogging) {
        logger.info('Environment variable added to allowlist', { key })
      }
    }
  }

  deny(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArray) {
      this.allowedVariables.delete(key)
      if (this.options.enableLogging) {
        logger.warn('Environment variable removed from allowlist', { key })
      }
    }
  }

  getStats() {
    return { ...this.stats }
  }

  resetStats() {
    this.stats = {
      totalAccess: 0,
      allowedAccess: 0,
      deniedAccess: 0,
      maskedValues: 0
    }
  }

  getAllowlist() {
    return Array.from(this.allowedVariables).sort()
  }

  validate() {
    const issues = []
    const warnings = []

    // Check for potentially sensitive variables in allowlist
    for (const key of this.allowedVariables) {
      if (this.isSensitive(key)) {
        warnings.push(`Potentially sensitive variable '${key}' is in allowlist`)
      }
    }

    // Check for commonly needed variables that might be missing
    const commonVariables = ['NODE_ENV', 'TERM', 'USER', 'USERNAME']
    for (const key of commonVariables) {
      if (!this.allowedVariables.has(key)) {
        warnings.push(`Common variable '${key}' is not in allowlist`)
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      allowlistSize: this.allowedVariables.size,
      stats: this.getStats()
    }
  }
}

// Create default instance
const defaultSanitizer = new EnvironmentSanitizer({
  enableLogging: process.env.NODE_ENV !== 'test',
  strictMode: process.env.NODE_ENV === 'production'
})

module.exports = {
  EnvironmentSanitizer,
  // Export convenience methods using default instance
  getEnv: (key, defaultValue, options) => defaultSanitizer.get(key, defaultValue, options),
  getEnvMultiple: (keys, options) => defaultSanitizer.getMultiple(keys, options),
  isAllowed: (key) => defaultSanitizer.isAllowed(key),
  isSensitive: (key) => defaultSanitizer.isSensitive(key),
  allowEnv: (keys) => defaultSanitizer.allow(keys),
  denyEnv: (keys) => defaultSanitizer.deny(keys),
  getEnvStats: () => defaultSanitizer.getStats(),
  validateEnvConfig: () => defaultSanitizer.validate(),
  default: defaultSanitizer
}