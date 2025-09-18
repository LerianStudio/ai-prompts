const fs = require('fs-extra')
const path = require('path')
const BackupManager = require('./backup-manager')
const FileLockManager = require('./file-lock-manager')

class SyncExecutor {
  constructor(options = {}) {
    this.backupManager = new BackupManager(options.backup)
    this.lockManager = new FileLockManager(options.fileLock)
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 1000
    this.dryRun = false

    // Setup cleanup handlers for proper lock release
    this.setupCleanupHandlers()
  }

  /**
   * Execute a sync plan with proper error handling and rollback
   * @param {Object} syncPlan - Sync plan from SyncPlanner
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeSyncPlan(syncPlan, options = {}) {
    this.dryRun = options.dryRun || false

    const startTime = Date.now()
    const result = {
      planId: syncPlan.planId,
      success: false,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      operations: [],
      errors: [],
      backupPath: null,
      rollbackAvailable: false
    }

    try {
      // Validate paths and permissions
      await this.validateExecutionEnvironment(syncPlan)

      // Create backup before making changes (unless dry run)
      if (
        !this.dryRun &&
        syncPlan.operations.some((op) =>
          ['update', 'conflict'].includes(op.type)
        )
      ) {
        result.backupPath = await this.backupManager.createBackup(
          syncPlan.destPath,
          syncPlan.operations,
          syncPlan.planId
        )
        result.rollbackAvailable = true
      }

      // Filter out conflicts if not in interactive mode
      const operationsToExecute = options.includeConflicts
        ? syncPlan.operations
        : syncPlan.operations.filter((op) => op.type !== 'conflict')

      // Execute operations with progress reporting
      const executedOps = await this.executeOperations(
        operationsToExecute,
        syncPlan.sourcePath,
        syncPlan.destPath,
        options
      )

      result.operations = executedOps
      result.success = executedOps.every(
        (op) => op.status === 'completed' || op.status === 'skipped'
      )

      const endTime = Date.now()
      result.endTime = new Date().toISOString()
      result.duration = endTime - startTime

      return result
    } catch (error) {
      result.errors.push({
        type: 'execution_error',
        message: error.message,
        stack: error.stack
      })

      const endTime = Date.now()
      result.endTime = new Date().toISOString()
      result.duration = endTime - startTime
      result.success = false

      return result
    }
  }

  /**
   * Validate that execution can proceed safely
   * @param {Object} syncPlan - Sync plan to validate
   */
  async validateExecutionEnvironment(syncPlan) {
    // Check source path exists and is readable
    if (!(await fs.pathExists(syncPlan.sourcePath))) {
      throw new Error(`Source path does not exist: ${syncPlan.sourcePath}`)
    }

    // Check destination path is accessible
    try {
      await fs.ensureDir(syncPlan.destPath)
    } catch (error) {
      throw new Error(`Cannot access destination path: ${error.message}`)
    }

    // Check disk space (rough estimate)
    if (syncPlan.estimatedSize && syncPlan.estimatedSize.bytes > 0) {
      // In a production system, you'd check actual disk space here
      // For now, we'll just log the requirement
      if (!this.dryRun) {
        console.log(
          `📊 Estimated sync size: ${syncPlan.estimatedSize.humanReadable}`
        )
      }
    }

    // Validate critical operations don't conflict with running processes
    await this.checkForFileConflicts(syncPlan.operations, syncPlan.destPath)
  }

  /**
   * Check if any files to be modified are currently in use
   * @param {Array} operations - Array of operations
   * @param {string} destPath - Destination path
   */
  async checkForFileConflicts(operations, destPath) {
    const criticalFiles = ['package.json', '.claude/settings.json', '.mcp.json']

    for (const operation of operations) {
      if (['update', 'delete'].includes(operation.type)) {
        const filePath = path.join(destPath, operation.path)

        if (criticalFiles.some((cf) => operation.path.endsWith(cf))) {
          try {
            // Try to open file for write to check if it's locked
            const fd = await fs.open(filePath, 'r+')
            await fs.close(fd)
          } catch (error) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
              throw new Error(
                `File is in use and cannot be modified: ${operation.path}`
              )
            }
          }
        }
      }
    }
  }

  /**
   * Execute array of sync operations
   * @param {Array} operations - Operations to execute
   * @param {string} sourcePath - Source directory path
   * @param {string} destPath - Destination directory path
   * @param {Object} options - Execution options
   * @returns {Promise<Array>} Array of executed operations with status
   */
  async executeOperations(operations, sourcePath, destPath, options = {}) {
    const results = []
    let completed = 0
    const total = operations.length

    for (const operation of operations) {
      const startTime = Date.now()

      if (options.onProgress) {
        options.onProgress(
          `Executing: ${operation.path} (${completed + 1}/${total})`
        )
      }

      try {
        const result = await this.executeOperation(
          operation,
          sourcePath,
          destPath,
          options
        )
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
      }

      completed++
    }

    return results
  }

  /**
   * Execute a single sync operation
   * @param {Object} operation - Operation to execute
   * @param {string} sourcePath - Source directory path
   * @param {string} destPath - Destination directory path
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Operation result
   */
  async executeOperation(operation, sourcePath, destPath, options = {}) {
    if (this.dryRun) {
      return {
        status: 'simulated',
        message: `Would ${operation.action.toLowerCase()}: ${operation.path}`
      }
    }

    switch (operation.type) {
      case 'copy':
        return await this.executeCopyOperation(operation, sourcePath, destPath)

      case 'update':
        return await this.executeUpdateOperation(
          operation,
          sourcePath,
          destPath
        )

      case 'delete':
        return await this.executeDeleteOperation(operation, destPath)

      case 'conflict':
        return await this.executeConflictOperation(
          operation,
          sourcePath,
          destPath,
          options
        )

      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  /**
   * Execute a copy operation (new file)
   * @param {Object} operation - Copy operation
   * @param {string} sourcePath - Source directory
   * @param {string} destPath - Destination directory
   * @returns {Promise<Object>} Result
   */
  async executeCopyOperation(operation, sourcePath, destPath) {
    const sourceFilePath = path.join(sourcePath, operation.path)
    const destFilePath = path.join(destPath, operation.path)

    return await this.withRetry(async () => {
      return await this.lockManager.withFileLock(
        destFilePath,
        async () => {
          await fs.ensureDir(path.dirname(destFilePath))
          await fs.copy(sourceFilePath, destFilePath, {
            preserveTimestamps: true,
            overwrite: false
          })

          return {
            status: 'completed',
            message: `Copied: ${operation.path}`,
            bytesTransferred: operation.source.size
          }
        },
        'copy'
      )
    }, `copy ${operation.path}`)
  }

  /**
   * Execute an update operation (modify existing file)
   * @param {Object} operation - Update operation
   * @param {string} sourcePath - Source directory
   * @param {string} destPath - Destination directory
   * @returns {Promise<Object>} Result
   */
  async executeUpdateOperation(operation, sourcePath, destPath) {
    const sourceFilePath = path.join(sourcePath, operation.path)
    const destFilePath = path.join(destPath, operation.path)

    return await this.withRetry(async () => {
      return await this.lockManager.withFileLock(
        destFilePath,
        async () => {
          // Atomic update: write to temp file first, then rename
          const tempFilePath = `${destFilePath}.tmp.${Date.now()}`

          try {
            await fs.copy(sourceFilePath, tempFilePath, {
              preserveTimestamps: true,
              overwrite: true
            })

            await fs.move(tempFilePath, destFilePath, { overwrite: true })

            return {
              status: 'completed',
              message: `Updated: ${operation.path}`,
              bytesTransferred: operation.source.size
            }
          } finally {
            // Clean up temp file if it exists
            if (await fs.pathExists(tempFilePath)) {
              await fs.remove(tempFilePath)
            }
          }
        },
        'update'
      )
    }, `update ${operation.path}`)
  }

  /**
   * Execute a delete operation
   * @param {Object} operation - Delete operation
   * @param {string} destPath - Destination directory
   * @returns {Promise<Object>} Result
   */
  async executeDeleteOperation(operation, destPath) {
    const destFilePath = path.join(destPath, operation.path)

    return await this.withRetry(async () => {
      return await this.lockManager.withFileLock(
        destFilePath,
        async () => {
          if (await fs.pathExists(destFilePath)) {
            await fs.remove(destFilePath)

            return {
              status: 'completed',
              message: `Deleted: ${operation.path}`,
              bytesTransferred: 0
            }
          } else {
            return {
              status: 'skipped',
              message: `Already deleted: ${operation.path}`,
              bytesTransferred: 0
            }
          }
        },
        'delete'
      )
    }, `delete ${operation.path}`)
  }

  /**
   * Execute a conflict operation (requires user input or automatic resolution)
   * @param {Object} operation - Conflict operation
   * @param {string} sourcePath - Source directory
   * @param {string} destPath - Destination directory
   * @param {Object} options - Options including conflict resolution strategy
   * @returns {Promise<Object>} Result
   */
  async executeConflictOperation(
    operation,
    sourcePath,
    destPath,
    options = {}
  ) {
    const strategy = options.conflictStrategy || 'skip'

    switch (strategy) {
      case 'skip':
        return {
          status: 'skipped',
          message: `Skipped conflict: ${operation.path}`,
          bytesTransferred: 0
        }

      case 'use_source':
        // Treat as update operation
        return await this.executeUpdateOperation(
          operation,
          sourcePath,
          destPath
        )

      case 'keep_local':
        return {
          status: 'skipped',
          message: `Kept local version: ${operation.path}`,
          bytesTransferred: 0
        }

      default:
        throw new Error(`Unknown conflict strategy: ${strategy}`)
    }
  }

  /**
   * Execute operation with retry logic
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
          console.warn(
            `⚠️ ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`,
            error.message
          )
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
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Rollback sync operation using backup
   * @param {string} projectPath - Project directory
   * @param {string} backupId - Backup ID to restore from
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} Rollback result
   */
  async rollbackSync(projectPath, backupId, options = {}) {
    try {
      const result = await this.backupManager.restoreFromBackup(
        projectPath,
        backupId,
        { overwrite: true, ...options }
      )

      return {
        success: true,
        message: `Rolled back to backup: ${backupId}`,
        ...result
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get execution statistics
   * @param {Array} operations - Executed operations
   * @returns {Object} Statistics
   */
  getExecutionStats(operations) {
    const stats = {
      total: operations.length,
      completed: 0,
      failed: 0,
      skipped: 0,
      totalBytesTransferred: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0
    }

    for (const op of operations) {
      stats[op.status] = (stats[op.status] || 0) + 1
      stats.totalBytesTransferred += op.bytesTransferred || 0
      stats.totalExecutionTime += op.executionTime || 0
    }

    stats.averageExecutionTime =
      operations.length > 0
        ? Math.round(stats.totalExecutionTime / operations.length)
        : 0

    return stats
  }

  /**
   * Setup cleanup handlers to ensure locks are released
   */
  setupCleanupHandlers() {
    const cleanup = async () => {
      try {
        await this.lockManager.cleanup()
      } catch (error) {
        console.error('Error during lock cleanup:', error.message)
      }
    }

    // Handle graceful shutdown
    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
    process.on('exit', cleanup)
  }

  /**
   * Cleanup resources when executor is no longer needed
   */
  async destroy() {
    await this.lockManager.cleanup()
  }
}

module.exports = SyncExecutor
