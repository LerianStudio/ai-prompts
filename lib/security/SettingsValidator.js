/**
 * SettingsValidator.js
 * Secure settings validation and integrity enforcement
 *
 * Features:
 * - Schema-based settings validation
 * - Security policy enforcement
 * - Settings integrity verification
 * - Audit trail for settings changes
 * - Immutable security settings protection
 */

const { logger } = require('../utils/logger')
const crypto = require('crypto')
const fs = require('fs').promises

class SettingsValidator {
  constructor(options = {}) {
    this.options = {
      enableIntegrityCheck: options.enableIntegrityCheck !== false,
      enableAuditTrail: options.enableAuditTrail !== false,
      strictMode: options.strictMode || false,
      ...options
    }

    // Define security-critical settings that cannot be modified at runtime
    this.immutableSettings = new Set([
      'security.enforceHooks',
      'security.allowedPaths',
      'security.blockedPaths',
      'security.enableSandbox',
      'security.maxFileSize',
      'security.allowedCommands'
    ])

    // Define the settings schema
    this.schema = this.createSettingsSchema()
    
    // Audit trail
    this.auditTrail = []
  }

  // Create the complete settings validation schema
  createSettingsSchema() {
    return {
      type: 'object',
      properties: {
        // Security settings
        security: {
          type: 'object',
          properties: {
            enforceHooks: {
              type: 'boolean',
              default: true,
              immutable: true,
              description: 'Enforce security hook execution'
            },
            allowedPaths: {
              type: 'array',
              items: { type: 'string' },
              default: [],
              immutable: true,
              description: 'Paths allowed for file operations'
            },
            blockedPaths: {
              type: 'array',
              items: { type: 'string' },
              default: ['./secrets/**', './.env*', './config/credentials.json'],
              immutable: true,
              description: 'Paths blocked from file operations'
            },
            enableSandbox: {
              type: 'boolean',
              default: true,
              description: 'Enable security sandbox for file operations'
            },
            maxFileSize: {
              type: 'number',
              minimum: 1024,
              maximum: 100 * 1024 * 1024, // 100MB max
              default: 10 * 1024 * 1024, // 10MB default
              description: 'Maximum file size for operations'
            },
            allowedCommands: {
              type: 'array',
              items: { type: 'string' },
              default: ['git', 'npm', 'node'],
              description: 'Commands allowed for execution'
            }
          },
          required: ['enforceHooks', 'blockedPaths'],
          additionalProperties: false
        },

        // Claude Code specific settings
        claude: {
          type: 'object',
          properties: {
            MAX_MCP_OUTPUT_TOKENS: {
              type: 'string',
              pattern: '^[0-9]+$',
              default: '50000',
              description: 'Maximum MCP output tokens'
            },
            ENABLE_HOOKS: {
              type: 'boolean',
              default: true,
              description: 'Enable Claude Code hooks'
            },
            hooks: {
              type: 'object',
              properties: {
                'user-prompt-submit': {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean', default: true },
                    commands: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    blocked_commands: {
                      type: 'array',
                      items: { type: 'string' },
                      default: ['Read(./secrets/**)', 'Read(./config/credentials.json)']
                    }
                  }
                }
              }
            }
          }
        },

        // Performance settings
        performance: {
          type: 'object',
          properties: {
            maxConcurrency: {
              type: 'number',
              minimum: 1,
              maximum: 20,
              default: 5,
              description: 'Maximum concurrent operations'
            },
            cacheSize: {
              type: 'number',
              minimum: 1024,
              maximum: 1024 * 1024 * 1024, // 1GB
              default: 50 * 1024 * 1024, // 50MB
              description: 'Cache size in bytes'
            },
            timeout: {
              type: 'number',
              minimum: 1000,
              maximum: 300000, // 5 minutes
              default: 30000, // 30 seconds
              description: 'Operation timeout in milliseconds'
            }
          }
        },

        // Logging settings
        logging: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              enum: ['error', 'warn', 'info', 'debug'],
              default: 'info',
              description: 'Logging level'
            },
            auditSecurity: {
              type: 'boolean',
              default: true,
              description: 'Enable security operation auditing'
            },
            retentionDays: {
              type: 'number',
              minimum: 1,
              maximum: 365,
              default: 30,
              description: 'Log retention period in days'
            }
          }
        }
      },
      required: ['security'],
      additionalProperties: false
    }
  }

  validate(settings) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      sanitized: {}
    }

    try {
      // Basic structure validation
      if (!settings || typeof settings !== 'object') {
        result.valid = false
        result.errors.push('Settings must be an object')
        return result
      }

      // Validate against schema
      const validation = this.validateAgainstSchema(settings, this.schema)
      result.valid = validation.valid
      result.errors.push(...validation.errors)
      result.warnings.push(...validation.warnings)
      result.sanitized = validation.sanitized

      // Security-specific validations
      if (settings.security) {
        const securityValidation = this.validateSecuritySettings(settings.security)
        result.errors.push(...securityValidation.errors)
        result.warnings.push(...securityValidation.warnings)
      }

      // Check for immutable setting violations
      const immutableViolations = this.checkImmutableSettings(settings)
      if (immutableViolations.length > 0) {
        result.valid = false
        result.errors.push(...immutableViolations)
      }

    } catch (error) {
      result.valid = false
      result.errors.push(`Validation error: ${error.message}`)
      logger.error('Settings validation failed', { error: error.message })
    }

    return result
  }

  /**
   * Validate settings against JSON schema
   * @param {Object} settings - Settings to validate
   * @param {Object} schema - JSON schema
   * @returns {Object} Validation result
   */
  validateAgainstSchema(settings, schema, path = '') {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      sanitized: {}
    }

    // Simple JSON schema validation implementation
    if (schema.type === 'object') {
      if (typeof settings !== 'object' || settings === null) {
        result.valid = false
        result.errors.push(`${path} must be an object`)
        return result
      }

      // Validate properties
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          const currentPath = path ? `${path}.${key}` : key
          const value = settings[key]

          if (value !== undefined) {
            const propValidation = this.validateAgainstSchema(value, propSchema, currentPath)
            result.valid = result.valid && propValidation.valid
            result.errors.push(...propValidation.errors)
            result.warnings.push(...propValidation.warnings)
            result.sanitized[key] = propValidation.sanitized
          } else if (propSchema.default !== undefined) {
            result.sanitized[key] = propSchema.default
          }
        }
      }

      // Check required properties
      if (schema.required) {
        for (const required of schema.required) {
          if (!(required in settings)) {
            result.valid = false
            result.errors.push(`${path ? path + '.' : ''}${required} is required`)
          }
        }
      }

      // Check for additional properties
      if (schema.additionalProperties === false) {
        const allowedProps = Object.keys(schema.properties || {})
        for (const key of Object.keys(settings)) {
          if (!allowedProps.includes(key)) {
            result.warnings.push(`${path ? path + '.' : ''}${key} is not allowed`)
          }
        }
      }

    } else if (schema.type === 'array') {
      if (!Array.isArray(settings)) {
        result.valid = false
        result.errors.push(`${path} must be an array`)
        return result
      }

      result.sanitized = []
      if (schema.items) {
        for (let i = 0; i < settings.length; i++) {
          const itemValidation = this.validateAgainstSchema(
            settings[i], 
            schema.items, 
            `${path}[${i}]`
          )
          result.valid = result.valid && itemValidation.valid
          result.errors.push(...itemValidation.errors)
          result.warnings.push(...itemValidation.warnings)
          result.sanitized.push(itemValidation.sanitized)
        }
      } else {
        result.sanitized = [...settings]
      }

    } else {
      // Primitive type validation
      result.sanitized = this.validatePrimitive(settings, schema, path, result)
    }

    return result
  }

  /**
   * Validate primitive values
   * @param {*} value - Value to validate
   * @param {Object} schema - Schema for the value
   * @param {string} path - Path to the value
   * @param {Object} result - Result object to update
   * @returns {*} Sanitized value
   */
  validatePrimitive(value, schema, path, result) {
    const expectedType = schema.type
    
    if (expectedType === 'string' && typeof value !== 'string') {
      result.valid = false
      result.errors.push(`${path} must be a string`)
      return value
    }

    if (expectedType === 'number' && typeof value !== 'number') {
      result.valid = false
      result.errors.push(`${path} must be a number`)
      return value
    }

    if (expectedType === 'boolean' && typeof value !== 'boolean') {
      result.valid = false
      result.errors.push(`${path} must be a boolean`)
      return value
    }

    // Additional validations
    if (schema.minimum !== undefined && value < schema.minimum) {
      result.valid = false
      result.errors.push(`${path} must be at least ${schema.minimum}`)
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      result.valid = false
      result.errors.push(`${path} must be at most ${schema.maximum}`)
    }

    if (schema.pattern && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
      result.valid = false
      result.errors.push(`${path} must match pattern ${schema.pattern}`)
    }

    if (schema.enum && !schema.enum.includes(value)) {
      result.valid = false
      result.errors.push(`${path} must be one of: ${schema.enum.join(', ')}`)
    }

    return value
  }

  /**
   * Validate security-specific settings
   * @param {Object} securitySettings - Security settings to validate
   * @returns {Object} Validation result
   */
  validateSecuritySettings(securitySettings) {
    const result = {
      errors: [],
      warnings: []
    }

    // Ensure critical security settings are properly configured
    if (securitySettings.enforceHooks !== true) {
      result.warnings.push('Security hooks should be enforced for maximum protection')
    }

    // Validate blocked paths include sensitive directories
    const blockedPaths = securitySettings.blockedPaths || []
    const criticalPaths = ['**/secrets/**', '**/.env*', '**/credentials.*']
    
    for (const criticalPath of criticalPaths) {
      const isBlocked = blockedPaths.some(blocked => 
        blocked.includes('secrets') || blocked.includes('.env') || blocked.includes('credential')
      )
      if (!isBlocked) {
        result.warnings.push(`Consider blocking sensitive path pattern: ${criticalPath}`)
      }
    }

    // Validate file size limits
    if (securitySettings.maxFileSize && securitySettings.maxFileSize > 100 * 1024 * 1024) {
      result.warnings.push('Large file size limit may pose security risks')
    }

    return result
  }

  /**
   * Check for violations of immutable settings
   * @param {Object} settings - Settings to check
   * @returns {Array} Array of violation messages
   */
  checkImmutableSettings(settings) {
    const violations = []

    for (const immutablePath of this.immutableSettings) {
      const pathParts = immutablePath.split('.')
      let current = settings
      let exists = true

      // Check if the immutable setting exists in the provided settings
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part]
        } else {
          exists = false
          break
        }
      }

      if (exists) {
        violations.push(`Cannot modify immutable setting: ${immutablePath}`)
      }
    }

    return violations
  }

  generateSettingsHash(settings) {
    const settingsString = JSON.stringify(settings, Object.keys(settings).sort())
    return crypto.createHash('sha256').update(settingsString).digest('hex')
  }

  verifyIntegrity(settings, expectedHash) {
    if (!this.options.enableIntegrityCheck) {
      return true
    }

    const actualHash = this.generateSettingsHash(settings)
    return actualHash === expectedHash
  }

  /**
   * Add entry to audit trail
   * @param {string} operation - Operation performed
   * @param {Object} details - Operation details
   */
  addAuditEntry(operation, details) {
    if (!this.options.enableAuditTrail) {
      return
    }

    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      details,
      user: process.env.USER || process.env.USERNAME || 'unknown',
      pid: process.pid
    }

    this.auditTrail.push(entry)

    // Log security-related operations
    if (operation.includes('security') || operation.includes('validate')) {
      logger.info('Settings security operation', entry)
    }
  }

  getAuditTrail() {
    return [...this.auditTrail]
  }

  clearAuditTrail() {
    this.auditTrail = []
  }

  /**
   * Load and validate settings from file
   * @param {string} filePath - Path to settings file
   * @returns {Object} Validation result with loaded settings
   */
  async loadAndValidate(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const settings = JSON.parse(content)
      
      this.addAuditEntry('load_settings', { filePath, success: true })
      
      const validation = this.validate(settings)
      validation.loadedFrom = filePath
      
      return validation
    } catch (error) {
      this.addAuditEntry('load_settings', { filePath, success: false, error: error.message })
      
      return {
        valid: false,
        errors: [`Failed to load settings from ${filePath}: ${error.message}`],
        warnings: [],
        sanitized: {}
      }
    }
  }

  createDefaultSettings() {
    return {
      security: {
        enforceHooks: true,
        allowedPaths: [],
        blockedPaths: [
          './secrets/**',
          './.env*',
          './config/credentials.json',
          './**/*.key',
          './**/*.pem'
        ],
        enableSandbox: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedCommands: ['git', 'npm', 'node', 'yarn']
      },
      claude: {
        MAX_MCP_OUTPUT_TOKENS: '50000',
        ENABLE_HOOKS: true,
        hooks: {
          'user-prompt-submit': {
            enabled: true,
            commands: [],
            blocked_commands: [
              'Read(./secrets/**)',
              'Read(./config/credentials.json)',
              'Read(./.env*)',
              'Write(./secrets/**)',
              'Write(./config/credentials.json)'
            ]
          }
        }
      },
      performance: {
        maxConcurrency: 5,
        cacheSize: 50 * 1024 * 1024, // 50MB
        timeout: 30000
      },
      logging: {
        level: 'info',
        auditSecurity: true,
        retentionDays: 30
      }
    }
  }
}

module.exports = {
  SettingsValidator,
  // Export convenience instance
  default: new SettingsValidator()
}