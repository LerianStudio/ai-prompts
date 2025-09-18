/**
 * File Lock Manager - Prevents concurrent file operations
 * Implements file-level locking to prevent race conditions during sync operations
 */

const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

class FileLockManager {
  constructor(options = {}) {
    this.lockDir = options.lockDir || path.join(process.cwd(), '.locks')
    this.lockTimeout = options.lockTimeout || 30000 // 30 seconds
    this.retryInterval = options.retryInterval || 100 // 100ms
    this.maxRetries = options.maxRetries || 300 // 30 seconds total
    this.activeLocks = new Map() // Track locks for cleanup
    this.processId = `${process.pid}_${Date.now()}`

    // Ensure lock directory exists
    this.initializeLockDir()
  }

  /**
   * Initialize lock directory
   */
  async initializeLockDir() {
    try {
      await fs.ensureDir(this.lockDir)
    } catch (error) {
      console.error('Failed to create lock directory:', error.message)
      throw new Error(`Cannot create lock directory: ${this.lockDir}`)
    }
  }

  /**
   * Generate lock file path for a given file
   */
  getLockPath(filePath) {
    const normalizedPath = path.resolve(filePath)
    const pathHash = crypto
      .createHash('md5')
      .update(normalizedPath)
      .digest('hex')
    return path.join(this.lockDir, `${pathHash}.lock`)
  }

  /**
   * Create lock metadata
   */
  createLockMetadata(filePath, operation = 'unknown') {
    return {
      filePath: path.resolve(filePath),
      operation,
      processId: this.processId,
      pid: process.pid,
      timestamp: Date.now(),
      hostname: require('os').hostname(),
      lockId: `${this.processId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * Acquire a lock for a file
   */
  async acquireLock(filePath, operation = 'sync') {
    const lockPath = this.getLockPath(filePath)
    const lockMetadata = this.createLockMetadata(filePath, operation)
    const lockId = lockMetadata.lockId

    let retryCount = 0
    const startTime = Date.now()

    while (retryCount < this.maxRetries) {
      try {
        // Try to create lock file atomically
        const lockContent = JSON.stringify(lockMetadata, null, 2)

        // Use wx flag to create file only if it doesn't exist
        await fs.writeFile(lockPath, lockContent, { flag: 'wx' })

        // Lock acquired successfully
        this.activeLocks.set(lockId, {
          filePath,
          lockPath,
          metadata: lockMetadata,
          acquiredAt: Date.now()
        })

        console.debug(`Lock acquired: ${lockId} for ${filePath}`)
        return lockId
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock file exists, check if it's stale
          const staleCheck = await this.checkAndCleanStaleLock(lockPath)

          if (staleCheck.cleaned) {
            // Stale lock was cleaned, retry immediately
            continue
          }

          // Active lock exists, wait and retry
          retryCount++
          const elapsed = Date.now() - startTime

          if (elapsed >= this.lockTimeout) {
            const existingLock = await this.readLockFile(lockPath)
            throw new Error(
              `Lock timeout: Cannot acquire lock for ${filePath} after ${elapsed}ms. ` +
                `Locked by PID ${existingLock?.pid || 'unknown'} since ${new Date(existingLock?.timestamp || 0).toISOString()}`
            )
          }

          await this.sleep(this.retryInterval)
        } else {
          throw new Error(
            `Failed to acquire lock for ${filePath}: ${error.message}`
          )
        }
      }
    }

    throw new Error(
      `Lock acquisition failed after ${retryCount} retries for ${filePath}`
    )
  }

  /**
   * Release a lock
   */
  async releaseLock(lockId) {
    const lockInfo = this.activeLocks.get(lockId)
    if (!lockInfo) {
      console.warn(`Attempted to release unknown lock: ${lockId}`)
      return false
    }

    try {
      // Verify lock ownership before removing
      const currentLock = await this.readLockFile(lockInfo.lockPath)
      if (currentLock && currentLock.lockId === lockId) {
        await fs.remove(lockInfo.lockPath)
        console.debug(`Lock released: ${lockId} for ${lockInfo.filePath}`)
      } else {
        console.warn(`Lock ownership verification failed for ${lockId}`)
      }

      this.activeLocks.delete(lockId)
      return true
    } catch (error) {
      console.error(`Failed to release lock ${lockId}:`, error.message)
      this.activeLocks.delete(lockId) // Clean up tracking anyway
      return false
    }
  }

  /**
   * Check if a lock file is stale and clean it
   */
  async checkAndCleanStaleLock(lockPath) {
    try {
      const lockData = await this.readLockFile(lockPath)
      if (!lockData) {
        return { stale: false, cleaned: false }
      }

      const lockAge = Date.now() - lockData.timestamp
      const isStale = lockAge > this.lockTimeout

      if (isStale) {
        // Check if the process is still running
        const processExists = await this.isProcessRunning(lockData.pid)

        if (!processExists) {
          console.warn(
            `Cleaning stale lock from dead process ${lockData.pid}: ${lockPath}`
          )
          await fs.remove(lockPath)
          return { stale: true, cleaned: true }
        } else {
          console.warn(
            `Lock appears stale but process ${lockData.pid} is still running`
          )
          return { stale: true, cleaned: false }
        }
      }

      return { stale: false, cleaned: false }
    } catch (error) {
      console.error(`Error checking stale lock ${lockPath}:`, error.message)
      return { stale: false, cleaned: false }
    }
  }

  /**
   * Check if a process is still running
   */
  async isProcessRunning(pid) {
    try {
      // On Unix systems, signal 0 checks if process exists without sending actual signal
      process.kill(pid, 0)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Read lock file safely
   */
  async readLockFile(lockPath) {
    try {
      const lockContent = await fs.readFile(lockPath, 'utf8')
      return JSON.parse(lockContent)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null // Lock file doesn't exist
      }
      console.error(`Error reading lock file ${lockPath}:`, error.message)
      return null
    }
  }

  /**
   * Execute operation with file lock
   */
  async withFileLock(filePath, operation, operationName = 'operation') {
    const lockId = await this.acquireLock(filePath, operationName)

    try {
      const result = await operation()
      return result
    } finally {
      await this.releaseLock(lockId)
    }
  }

  /**
   * Execute operation with multiple file locks
   */
  async withMultipleLocks(
    filePaths,
    operation,
    operationName = 'batch-operation'
  ) {
    const lockIds = []

    try {
      // Acquire all locks
      for (const filePath of filePaths) {
        const lockId = await this.acquireLock(filePath, operationName)
        lockIds.push(lockId)
      }

      const result = await operation()
      return result
    } finally {
      // Release all locks in reverse order
      for (let i = lockIds.length - 1; i >= 0; i--) {
        await this.releaseLock(lockIds[i])
      }
    }
  }

  /**
   * Get status of all active locks
   */
  getLockStatus() {
    const locks = []

    for (const [lockId, lockInfo] of this.activeLocks.entries()) {
      locks.push({
        lockId,
        filePath: lockInfo.filePath,
        operation: lockInfo.metadata.operation,
        acquiredAt: new Date(lockInfo.acquiredAt).toISOString(),
        age: Date.now() - lockInfo.acquiredAt
      })
    }

    return {
      activeLocks: locks.length,
      locks: locks.sort((a, b) => b.age - a.age) // Oldest first
    }
  }

  /**
   * Clean up all locks held by this process
   */
  async cleanup() {
    console.debug(`Cleaning up ${this.activeLocks.size} active locks`)

    const lockIds = Array.from(this.activeLocks.keys())

    for (const lockId of lockIds) {
      await this.releaseLock(lockId)
    }

    console.debug('Lock cleanup completed')
  }

  /**
   * Clean up stale locks from the entire lock directory
   */
  async cleanupStaleLocks() {
    try {
      const lockFiles = await fs.readdir(this.lockDir)
      let cleaned = 0
      let errors = 0

      for (const lockFile of lockFiles) {
        if (!lockFile.endsWith('.lock')) continue

        const lockPath = path.join(this.lockDir, lockFile)
        try {
          const result = await this.checkAndCleanStaleLock(lockPath)
          if (result.cleaned) {
            cleaned++
          }
        } catch (error) {
          console.error(`Error cleaning stale lock ${lockFile}:`, error.message)
          errors++
        }
      }

      return { total: lockFiles.length, cleaned, errors }
    } catch (error) {
      console.error('Error during stale lock cleanup:', error.message)
      return { total: 0, cleaned: 0, errors: 1 }
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Destroy lock manager and cleanup
   */
  async destroy() {
    await this.cleanup()
  }
}

module.exports = FileLockManager
