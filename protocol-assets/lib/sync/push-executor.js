const fs = require('fs-extra')
const path = require('path')
const BackupManager = require('./backup-manager')

class PushExecutor {
  constructor(options = {}) {
    this.backupManager = new BackupManager({
      ...options.backup,
      backupBaseDir: '.push-backup' // Different backup dir for push operations
    })
    this.maxRetries = options.maxRetries || 2 // Fewer retries for push (more cautious)
    this.retryDelay = options.retryDelay || 1500 // Longer delay for push operations
    this.dryRun = false
    this.strictMode = options.strictMode !== false // Default to strict mode
  }

  /**
   * Execute a push plan with enhanced safety measures
   * @param {Object} pushPlan - Push plan from PushPlanner
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executePushPlan(pushPlan, options = {}) {
    this.dryRun = options.dryRun || false
    
    const startTime = Date.now()
    const result = {
      planId: pushPlan.planId,
      success: false,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      direction: 'target_to_source',
      operations: [],
      errors: [],
      warnings: [],
      backupPath: null,
      rollbackAvailable: false,
      riskLevel: pushPlan.estimatedImpact?.riskLevel || 'unknown'
    }

    try {
      // Enhanced validation for push operations
      await this.validatePushExecution(pushPlan, options)

      // Pre-execution safety checks
      await this.performPreExecutionChecks(pushPlan, options)

      // Create backup of source before making changes (unless dry run)
      if (!this.dryRun && pushPlan.operations.some(op => ['update', 'delete', 'conflict'].includes(op.type))) {
        result.backupPath = await this.backupManager.createBackup(
          pushPlan.sourcePath, // Backup the SOURCE (not target) for push
          pushPlan.operations,
          pushPlan.planId
        )
        result.rollbackAvailable = true
        
        console.log(`💾 Source backup created: ${path.basename(result.backupPath)}`)
      }

      // Execute operations with enhanced progress reporting
      const executedOps = await this.executePushOperations(
        pushPlan.operations,
        pushPlan.targetPath,
        pushPlan.sourcePath,
        options
      )

      result.operations = executedOps
      result.success = executedOps.every(op => op.status === 'completed' || op.status === 'skipped')

      // Collect warnings from operations
      result.warnings = this.collectExecutionWarnings(executedOps)

      const endTime = Date.now()
      result.endTime = new Date().toISOString()
      result.duration = endTime - startTime

      // Post-execution validation
      if (!this.dryRun && result.success) {
        await this.performPostExecutionValidation(pushPlan, result)
      }

      return result

    } catch (error) {
      result.errors.push({
        type: 'execution_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })

      const endTime = Date.now()
      result.endTime = new Date().toISOString()
      result.duration = endTime - startTime
      result.success = false

      // If we have a backup and the operation failed, suggest rollback
      if (result.backupPath && !this.dryRun) {
        result.errors.push({
          type: 'rollback_available',
          message: `Rollback available: ${path.basename(result.backupPath)}`,
          rollbackCommand: `lerian-protocol rollback ${path.basename(result.backupPath)}`
        })
      }

      return result
    }
  }

  /**
   * Validate that push execution can proceed safely
   * @param {Object} pushPlan - Push plan to validate
   * @param {Object} options - Execution options
   */
  async validatePushExecution(pushPlan, options) {
    // Check that push plan has operations
    if (!pushPlan.operations || pushPlan.operations.length === 0) {
      throw new Error('No operations to execute in push plan')
    }

    // Check source path is still valid
    if (!(await fs.pathExists(pushPlan.sourcePath))) {
      throw new Error(`Source path no longer exists: ${pushPlan.sourcePath}`)
    }

    // Check that we have write permissions to source
    try {
      const testFile = path.join(pushPlan.sourcePath, `.push-test-${Date.now()}`)
      await fs.writeFile(testFile, 'permission test')
      await fs.remove(testFile)
    } catch (error) {
      throw new Error(`Cannot write to source directory: ${error.message}`)
    }

    // In strict mode, require explicit confirmation for risky operations
    if (this.strictMode && pushPlan.requiresConfirmation && !options.confirmed) {
      throw new Error('Push operation requires explicit confirmation. Use --confirm flag.')
    }

    // Validate that critical operations have been acknowledged
    const criticalOps = pushPlan.operations.filter(op => op.priority === 'critical')
    if (criticalOps.length > 0 && !options.allowCritical) {
      throw new Error(`${criticalOps.length} critical operations detected. Use --allow-critical flag if intended.`)
    }
  }

  /**
   * Perform pre-execution safety checks
   * @param {Object} pushPlan - Push plan
   * @param {Object} options - Options
   */
  async performPreExecutionChecks(pushPlan, options) {
    // Check disk space (rough estimate)
    if (pushPlan.estimatedImpact && pushPlan.estimatedImpact.totalBytes > 0) {
      console.log(`📊 Estimated push size: ${this.formatBytes(pushPlan.estimatedImpact.totalBytes)}`)
    }

    // Warn about dangerous operations
    const dangerousOps = pushPlan.operations.filter(op => op.safety === 'dangerous')
    if (dangerousOps.length > 0) {
      console.warn(`⚠️  ${dangerousOps.length} dangerous operations detected`)
    }

    // Check for potential conflicts with running processes
    await this.checkForSourceConflicts(pushPlan.operations, pushPlan.sourcePath)
  }

  /**
   * Check if source files are in use by other processes
   * @param {Array} operations - Array of operations
   * @param {string} sourcePath - Source path
   */
  async checkForSourceConflicts(operations, sourcePath) {
    const criticalSourceFiles = [
      'package.json',
      'bin/**/*.js',
      'lib/**/*.js'
    ]

    for (const operation of operations) {
      if (['update', 'delete'].includes(operation.type)) {
        const filePath = path.join(sourcePath, operation.path)
        
        if (criticalSourceFiles.some(pattern => this.matchesPattern(operation.path, pattern))) {
          try {
            // Try to open file for write to check if it's locked
            const fd = await fs.open(filePath, 'r+')
            await fs.close(fd)
          } catch (error) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
              throw new Error(`Critical source file is in use: ${operation.path}`)
            }
          }
        }
      }
    }
  }

  /**
   * Execute array of push operations with enhanced safety
   * @param {Array} operations - Operations to execute
   * @param {string} targetPath - Target directory path (source of files)
   * @param {string} sourcePath - Source directory path (destination of files)
   * @param {Object} options - Execution options
   * @returns {Promise<Array>} Array of executed operations with status
   */
  async executePushOperations(operations, targetPath, sourcePath, options = {}) {
    const results = []
    let completed = 0
    const total = operations.length

    // Group operations by safety level (safest first)
    const groupedOps = this.groupOperationsBySafety(operations)

    for (const safetyLevel of ['safe', 'risky', 'dangerous']) {
      const opsAtLevel = groupedOps[safetyLevel] || []
      
      if (opsAtLevel.length > 0) {
        console.log(`\n🔐 Executing ${safetyLevel} operations (${opsAtLevel.length})...`)
      }

      for (const operation of opsAtLevel) {
        const startTime = Date.now()
        
        if (options.onProgress) {
          options.onProgress(`[${safetyLevel.toUpperCase()}] ${operation.path} (${completed + 1}/${total})`)
        }

        try {
          const result = await this.executePushOperation(operation, targetPath, sourcePath, options)
          
          results.push({
            ...operation,
            ...result,
            executionTime: Date.now() - startTime
          })
          
        } catch (error) {
          results.push({
            ...operation,
            status: 'failed',
            error: error.message,
            executionTime: Date.now() - startTime
          })

          // In strict mode, stop on first error for dangerous operations
          if (this.strictMode && operation.safety === 'dangerous') {
            throw new Error(`Critical push operation failed: ${error.message}`)
          }
        }

        completed++
      }
    }

    return results
  }

  /**
   * Group operations by safety level
   * @param {Array} operations - Operations to group
   * @returns {Object} Grouped operations
   */
  groupOperationsBySafety(operations) {
    const groups = { safe: [], risky: [], dangerous: [] }
    
    for (const op of operations) {
      const safetyLevel = op.safety || 'safe'
      if (!groups[safetyLevel]) {
        groups[safetyLevel] = []
      }
      groups[safetyLevel].push(op)
    }

    return groups
  }

  /**
   * Execute a single push operation
   * @param {Object} operation - Operation to execute
   * @param {string} targetPath - Target directory path
   * @param {string} sourcePath - Source directory path
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Operation result
   */
  async executePushOperation(operation, targetPath, sourcePath, options = {}) {
    if (this.dryRun) {
      return {
        status: 'simulated',
        message: `Would ${operation.action.toLowerCase()}: ${operation.path}`
      }
    }
    
    switch (operation.type) {
      case 'create':
        return await this.executePushCreateOperation(operation, targetPath, sourcePath)
        
      case 'update':
        return await this.executePushUpdateOperation(operation, targetPath, sourcePath)
        
      case 'delete':
        return await this.executePushDeleteOperation(operation, sourcePath, options)
        
      case 'conflict':
        return await this.executePushConflictOperation(operation, targetPath, sourcePath, options)
        
      default:
        throw new Error(`Unknown push operation type: ${operation.type}`)
    }
  }

  /**
   * Execute a create operation (push new file to source)
   * @param {Object} operation - Create operation
   * @param {string} targetPath - Target directory
   * @param {string} sourcePath - Source directory  
   * @returns {Promise<Object>} Result
   */
  async executePushCreateOperation(operation, targetPath, sourcePath) {
    const targetFilePath = path.join(targetPath, operation.path)
    const sourceFilePath = path.join(sourcePath, operation.path)

    return await this.withRetry(async () => {
      // Ensure target file still exists
      if (!(await fs.pathExists(targetFilePath))) {
        throw new Error(`Target file no longer exists: ${operation.path}`)
      }

      // Ensure destination directory exists
      await fs.ensureDir(path.dirname(sourceFilePath))
      
      // Copy from target to source
      await fs.copy(targetFilePath, sourceFilePath, { 
        preserveTimestamps: true,
        overwrite: false
      })

      return {
        status: 'completed',
        message: `Created in source: ${operation.path}`,
        bytesTransferred: operation.target?.size || 0
      }
    }, `create ${operation.path}`)
  }

  /**
   * Execute an update operation (push updated file to source)
   * @param {Object} operation - Update operation
   * @param {string} targetPath - Target directory
   * @param {string} sourcePath - Source directory
   * @returns {Promise<Object>} Result
   */
  async executePushUpdateOperation(operation, targetPath, sourcePath) {
    const targetFilePath = path.join(targetPath, operation.path)
    const sourceFilePath = path.join(sourcePath, operation.path)

    return await this.withRetry(async () => {
      // Atomic update: write to temp file first, then rename
      const tempFilePath = `${sourceFilePath}.push-tmp.${Date.now()}`
      
      try {
        // Copy from target to temp file in source
        await fs.copy(targetFilePath, tempFilePath, { 
          preserveTimestamps: true,
          overwrite: true
        })
        
        // Atomically replace the source file
        await fs.move(tempFilePath, sourceFilePath, { overwrite: true })

        return {
          status: 'completed',
          message: `Updated in source: ${operation.path}`,
          bytesTransferred: operation.target?.size || 0
        }
      } finally {
        // Clean up temp file if it exists
        if (await fs.pathExists(tempFilePath)) {
          await fs.remove(tempFilePath)
        }
      }
    }, `update ${operation.path}`)
  }

  /**
   * Execute a delete operation (remove file from source)
   * @param {Object} operation - Delete operation
   * @param {string} sourcePath - Source directory
   * @param {Object} options - Options
   * @returns {Promise<Object>} Result
   */
  async executePushDeleteOperation(operation, sourcePath, options) {
    const sourceFilePath = path.join(sourcePath, operation.path)

    // Delete operations require explicit confirmation
    if (!options.confirmDelete && !options.confirmed) {
      return {
        status: 'skipped',
        message: `Delete skipped (requires confirmation): ${operation.path}`,
        bytesTransferred: 0
      }
    }

    return await this.withRetry(async () => {
      if (await fs.pathExists(sourceFilePath)) {
        await fs.remove(sourceFilePath)
        
        return {
          status: 'completed',
          message: `Deleted from source: ${operation.path}`,
          bytesTransferred: 0
        }
      } else {
        return {
          status: 'skipped',
          message: `Already deleted: ${operation.path}`,
          bytesTransferred: 0
        }
      }
    }, `delete ${operation.path}`)
  }

  /**
   * Execute a conflict operation (requires user decision)
   * @param {Object} operation - Conflict operation
   * @param {string} targetPath - Target directory
   * @param {string} sourcePath - Source directory
   * @param {Object} options - Options including conflict resolution strategy
   * @returns {Promise<Object>} Result
   */
  async executePushConflictOperation(operation, targetPath, sourcePath, options = {}) {
    const strategy = options.conflictStrategy || 'skip'
    
    switch (strategy) {
      case 'skip':
        return {
          status: 'skipped',
          message: `Conflict skipped: ${operation.path}`,
          bytesTransferred: 0
        }
        
      case 'force_push':
        // Treat as update operation (override source)
        return await this.executePushUpdateOperation(operation, targetPath, sourcePath)
        
      case 'keep_source':
        return {
          status: 'skipped',
          message: `Kept source version: ${operation.path}`,
          bytesTransferred: 0
        }
        
      default:
        throw new Error(`Unknown conflict strategy: ${strategy}`)
    }
  }

  /**
   * Execute operation with retry logic (fewer retries for push)
   * @param {Function} operation - Operation function to execute
   * @param {string} operationName - Name for logging
   * @returns {Promise<Object>} Operation result
   */
  async withRetry(operation, operationName) {
    let lastError
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt < this.maxRetries) {
          console.warn(`⚠️  Push ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`, error.message)
          await this.sleep(this.retryDelay * attempt)
        }
      }
    }
    
    throw lastError
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Collect warnings from executed operations
   * @param {Array} operations - Executed operations
   * @returns {Array} Array of warnings
   */
  collectExecutionWarnings(operations) {
    const warnings = []
    
    const failedOps = operations.filter(op => op.status === 'failed')
    if (failedOps.length > 0) {
      warnings.push(`${failedOps.length} operations failed`)
    }

    const skippedOps = operations.filter(op => op.status === 'skipped')
    if (skippedOps.length > 0) {
      warnings.push(`${skippedOps.length} operations skipped`)
    }

    return warnings
  }

  /**
   * Perform post-execution validation
   * @param {Object} pushPlan - Original push plan
   * @param {Object} result - Execution result
   */
  async performPostExecutionValidation(pushPlan, result) {
    // Validate that critical files still exist and are valid
    const criticalOps = result.operations.filter(op => 
      op.status === 'completed' && this.isCriticalFile(op.path)
    )

    for (const op of criticalOps) {
      const sourceFilePath = path.join(pushPlan.sourcePath, op.path)
      
      if (!(await fs.pathExists(sourceFilePath))) {
        result.warnings.push(`Critical file not found after push: ${op.path}`)
      }
    }

    console.log(`✅ Post-execution validation completed`)
  }

  /**
   * Check if file is critical
   * @param {string} filePath - File path
   * @returns {boolean} True if critical
   */
  isCriticalFile(filePath) {
    const criticalPatterns = [
      'package.json',
      'bin/**/*.js',
      'lib/**/*.js',
      '.claude/settings.json'
    ]
    
    return criticalPatterns.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Match path against pattern (simple implementation)
   * @param {string} filePath - File path
   * @param {string} pattern - Pattern
   * @returns {boolean} True if matches
   */
  matchesPattern(filePath, pattern) {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      )
      return regex.test(filePath)
    }
    return filePath === pattern || filePath.startsWith(pattern + path.sep)
  }

  /**
   * Format bytes into human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

module.exports = PushExecutor