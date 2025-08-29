/**
 * SyncStatePersistence.js
 * Sync state persistence and recovery procedures for interrupted operations
 * 
 * Features:
 * - Save and restore sync operation state
 * - Resume interrupted sync operations
 * - Recovery procedures for corrupted state
 * - Automatic cleanup of stale state files
 * - Transaction-like state management
 */

const fs = require('fs').promises
const path = require('path')
const os = require('os')
const { EventEmitter } = require('events')

class SyncStatePersistence extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Storage settings
      stateDir: options.stateDir || path.join(os.tmpdir(), 'lerian-sync-state'),
      maxStateFiles: options.maxStateFiles || 10,
      stateCleanupInterval: options.stateCleanupInterval || 3600000, // 1 hour
      maxStateAge: options.maxStateAge || 86400000, // 24 hours
      
      // Persistence settings
      autoSave: options.autoSave !== false,
      saveInterval: options.saveInterval || 5000, // 5 seconds
      compressionEnabled: options.compressionEnabled || false,
      
      // Recovery settings
      enableRecovery: options.enableRecovery !== false,
      recoveryRetries: options.recoveryRetries || 3,
      validateStateIntegrity: options.validateStateIntegrity !== false,
      
      ...options
    }
    
    // State management
    this.currentSession = null
    this.sessionId = null
    this.saveTimer = null
    this.cleanupTimer = null
    
    // Recovery tracking
    this.recoveryAttempts = new Map()
    this.corruptedStates = new Set()
    
    this.init()
  }

  /**
   * Initialize state persistence system
   */
  async init() {
    try {
      // Ensure state directory exists
      await fs.mkdir(this.options.stateDir, { recursive: true })
      
      // Start periodic cleanup
      if (this.options.stateCleanupInterval > 0) {
        this.startPeriodicCleanup()
      }
      
      this.emit('initialized', { stateDir: this.options.stateDir })
      
    } catch (error) {
      this.emit('error', new Error(`Failed to initialize state persistence: ${error.message}`))
    }
  }

  /**
   * Create a new sync session
   * @param {Object} syncConfig - Sync configuration
   * @param {Array} operations - Array of operations to track
   * @returns {string} Session ID
   */
  async createSession(syncConfig, operations) {
    this.sessionId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentSession = {
      sessionId: this.sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      config: syncConfig,
      operations: operations.map(op => ({
        ...op,
        status: 'pending',
        attempts: 0,
        createdAt: Date.now(),
        completedAt: null,
        error: null
      })),
      statistics: {
        totalOperations: operations.length,
        completedOperations: 0,
        failedOperations: 0,
        bytesProcessed: 0,
        startTime: Date.now(),
        lastActiveTime: Date.now()
      },
      metadata: {
        version: '1.0',
        nodeVersion: process.version,
        platform: process.platform
      }
    }
    
    // Save initial state
    await this.saveState()
    
    // Start auto-save if enabled
    if (this.options.autoSave) {
      this.startAutoSave()
    }
    
    this.emit('sessionCreated', {
      sessionId: this.sessionId,
      totalOperations: operations.length
    })
    
    return this.sessionId
  }

  /**
   * Update operation status in current session
   * @param {string} operationId - Operation ID
   * @param {Object} update - Update data
   */
  async updateOperation(operationId, update) {
    if (!this.currentSession) {
      throw new Error('No active session')
    }
    
    const operation = this.currentSession.operations.find(op => op.id === operationId)
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`)
    }
    
    // Update operation data
    Object.assign(operation, update, {
      updatedAt: Date.now()
    })
    
    // Update session statistics
    if (update.status === 'completed' && operation.status !== 'completed') {
      this.currentSession.statistics.completedOperations++
      if (update.bytesProcessed) {
        this.currentSession.statistics.bytesProcessed += update.bytesProcessed
      }
    } else if (update.status === 'failed' && operation.status !== 'failed') {
      this.currentSession.statistics.failedOperations++
    }
    
    this.currentSession.updatedAt = Date.now()
    this.currentSession.statistics.lastActiveTime = Date.now()
    
    // Save state immediately for critical updates
    if (['completed', 'failed'].includes(update.status)) {
      await this.saveState()
    }
    
    this.emit('operationUpdated', {
      sessionId: this.sessionId,
      operationId,
      status: operation.status,
      update
    })
  }

  /**
   * Save current session state to disk
   */
  async saveState() {
    if (!this.currentSession) {
      return
    }
    
    try {
      const stateFile = this.getStateFilePath(this.sessionId)
      const stateData = {
        ...this.currentSession,
        savedAt: Date.now()
      }
      
      const jsonData = JSON.stringify(stateData, null, 2)
      
      // Write to temporary file first for atomic operation
      const tempFile = `${stateFile}.tmp`
      await fs.writeFile(tempFile, jsonData, 'utf8')
      await fs.rename(tempFile, stateFile)
      
      this.emit('stateSaved', {
        sessionId: this.sessionId,
        stateFile,
        size: jsonData.length
      })
      
    } catch (error) {
      this.emit('error', new Error(`Failed to save state: ${error.message}`))
    }
  }

  /**
   * Load session state from disk
   * @param {string} sessionId - Session ID to load
   * @returns {Object|null} Loaded session state or null if not found
   */
  async loadState(sessionId) {
    try {
      const stateFile = this.getStateFilePath(sessionId)
      const jsonData = await fs.readFile(stateFile, 'utf8')
      const stateData = JSON.parse(jsonData)
      
      // Validate state integrity if enabled
      if (this.options.validateStateIntegrity) {
        const isValid = await this.validateStateIntegrity(stateData)
        if (!isValid) {
          this.corruptedStates.add(sessionId)
          throw new Error('State integrity validation failed')
        }
      }
      
      this.emit('stateLoaded', {
        sessionId,
        stateFile,
        operationsCount: stateData.operations?.length || 0
      })
      
      return stateData
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null // State file doesn't exist
      }
      
      this.emit('error', new Error(`Failed to load state for session ${sessionId}: ${error.message}`))
      return null
    }
  }

  /**
   * Resume sync operations from a saved session
   * @param {string} sessionId - Session ID to resume
   * @returns {Object} Resume information
   */
  async resumeSession(sessionId) {
    const savedState = await this.loadState(sessionId)
    
    if (!savedState) {
      throw new Error(`No saved state found for session: ${sessionId}`)
    }
    
    // Check if session is too old
    const age = Date.now() - savedState.createdAt
    if (age > this.options.maxStateAge) {
      throw new Error(`Session is too old to resume: ${Math.round(age / 1000)}s (max: ${Math.round(this.options.maxStateAge / 1000)}s)`)
    }
    
    // Set as current session
    this.currentSession = savedState
    this.sessionId = sessionId
    
    // Analyze resumable operations
    const resumeInfo = this.analyzeResumableOperations(savedState.operations)
    
    // Start auto-save if enabled
    if (this.options.autoSave) {
      this.startAutoSave()
    }
    
    this.emit('sessionResumed', {
      sessionId,
      ...resumeInfo
    })
    
    return {
      sessionId,
      ...resumeInfo,
      originalConfig: savedState.config,
      statistics: savedState.statistics
    }
  }

  /**
   * Analyze which operations can be resumed
   * @param {Array} operations - Operations to analyze
   * @returns {Object} Resume analysis
   */
  analyzeResumableOperations(operations) {
    const pending = operations.filter(op => op.status === 'pending' || op.status === 'failed')
    const completed = operations.filter(op => op.status === 'completed')
    const inProgress = operations.filter(op => op.status === 'in_progress')
    
    // Operations in progress need to be reset to pending for retry
    const needsRetry = inProgress.map(op => ({
      ...op,
      status: 'pending',
      attempts: op.attempts || 0,
      retryReason: 'interrupted'
    }))
    
    const resumable = [...pending, ...needsRetry]
    
    return {
      totalOperations: operations.length,
      completedOperations: completed.length,
      resumableOperations: resumable.length,
      inProgressOperations: inProgress.length,
      resumableList: resumable,
      completedList: completed.map(op => ({
        id: op.id,
        type: op.type,
        completedAt: op.completedAt
      }))
    }
  }

  /**
   * Complete current session
   * @param {Object} finalStats - Final session statistics
   */
  async completeSession(finalStats = {}) {
    if (!this.currentSession) {
      return
    }
    
    // Update final session data
    this.currentSession.completedAt = Date.now()
    this.currentSession.status = 'completed'
    this.currentSession.finalStatistics = finalStats
    
    // Final save
    await this.saveState()
    
    // Stop auto-save
    this.stopAutoSave()
    
    const sessionId = this.sessionId
    this.currentSession = null
    this.sessionId = null
    
    this.emit('sessionCompleted', {
      sessionId,
      finalStats
    })
  }

  /**
   * Abort current session
   * @param {string} reason - Reason for abortion
   */
  async abortSession(reason = 'unknown') {
    if (!this.currentSession) {
      return
    }
    
    // Update session data
    this.currentSession.abortedAt = Date.now()
    this.currentSession.status = 'aborted'
    this.currentSession.abortReason = reason
    
    // Final save
    await this.saveState()
    
    // Stop auto-save
    this.stopAutoSave()
    
    const sessionId = this.sessionId
    this.currentSession = null
    this.sessionId = null
    
    this.emit('sessionAborted', {
      sessionId,
      reason
    })
  }

  /**
   * List all available sessions
   * @returns {Array} List of session information
   */
  async listSessions() {
    try {
      const files = await fs.readdir(this.options.stateDir)
      const stateFiles = files.filter(file => file.endsWith('.json'))
      
      const sessions = []
      
      for (const file of stateFiles) {
        try {
          const filePath = path.join(this.options.stateDir, file)
          const stats = await fs.stat(filePath)
          const sessionId = path.basename(file, '.json')
          
          // Try to load basic session info
          const stateData = await this.loadState(sessionId)
          
          if (stateData) {
            sessions.push({
              sessionId,
              createdAt: stateData.createdAt,
              updatedAt: stateData.updatedAt,
              status: stateData.status || 'unknown',
              totalOperations: stateData.operations?.length || 0,
              completedOperations: stateData.statistics?.completedOperations || 0,
              fileSize: stats.size,
              age: Date.now() - stateData.createdAt
            })
          }
        } catch {
          // Skip corrupted session files
          continue
        }
      }
      
      // Sort by creation time (newest first)
      sessions.sort((a, b) => b.createdAt - a.createdAt)
      
      return sessions
      
    } catch (error) {
      this.emit('error', new Error(`Failed to list sessions: ${error.message}`))
      return []
    }
  }

  /**
   * Delete a session state file
   * @param {string} sessionId - Session ID to delete
   */
  async deleteSession(sessionId) {
    try {
      const stateFile = this.getStateFilePath(sessionId)
      await fs.unlink(stateFile)
      
      this.emit('sessionDeleted', { sessionId })
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', new Error(`Failed to delete session ${sessionId}: ${error.message}`))
      }
    }
  }

  /**
   * Validate state integrity
   * @param {Object} stateData - State data to validate
   * @returns {boolean} True if state is valid
   */
  async validateStateIntegrity(stateData) {
    try {
      // Basic structure validation
      if (!stateData.sessionId || !stateData.operations || !Array.isArray(stateData.operations)) {
        return false
      }
      
      // Validate each operation has required fields
      for (const operation of stateData.operations) {
        if (!operation.id || !operation.type) {
          return false
        }
      }
      
      // Validate statistics consistency
      const stats = stateData.statistics
      if (stats) {
        const actualCompleted = stateData.operations.filter(op => op.status === 'completed').length
        const actualFailed = stateData.operations.filter(op => op.status === 'failed').length
        
        if (stats.completedOperations !== actualCompleted || stats.failedOperations !== actualFailed) {
          return false
        }
      }
      
      return true
      
    } catch {
      return false
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.saveTimer) {
      return
    }
    
    this.saveTimer = setInterval(async () => {
      if (this.currentSession) {
        await this.saveState()
      }
    }, this.options.saveInterval)
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer)
      this.saveTimer = null
    }
  }

  /**
   * Start periodic cleanup of old state files
   */
  startPeriodicCleanup() {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupOldStates()
    }, this.options.stateCleanupInterval)
  }

  /**
   * Stop periodic cleanup
   */
  stopPeriodicCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Cleanup old and stale state files
   */
  async cleanupOldStates() {
    try {
      const sessions = await this.listSessions()
      const _now = Date.now()
      
      let cleanedCount = 0
      
      // Remove sessions that are too old
      for (const session of sessions) {
        if (session.age > this.options.maxStateAge) {
          await this.deleteSession(session.sessionId)
          cleanedCount++
        }
      }
      
      // Remove excess sessions (keep only the most recent)
      const activeSessions = sessions.filter(s => s.age <= this.options.maxStateAge)
      if (activeSessions.length > this.options.maxStateFiles) {
        const toRemove = activeSessions.slice(this.options.maxStateFiles)
        for (const session of toRemove) {
          await this.deleteSession(session.sessionId)
          cleanedCount++
        }
      }
      
      if (cleanedCount > 0) {
        this.emit('stateCleanup', {
          cleanedCount,
          remainingSessions: Math.max(0, activeSessions.length - Math.max(0, activeSessions.length - this.options.maxStateFiles))
        })
      }
      
    } catch (error) {
      this.emit('error', new Error(`State cleanup failed: ${error.message}`))
    }
  }

  /**
   * Get state file path for session ID
   * @param {string} sessionId - Session ID
   * @returns {string} State file path
   */
  getStateFilePath(sessionId) {
    return path.join(this.options.stateDir, `${sessionId}.json`)
  }

  /**
   * Get current session information
   * @returns {Object|null} Current session info or null
   */
  getCurrentSession() {
    if (!this.currentSession) {
      return null
    }
    
    return {
      sessionId: this.sessionId,
      createdAt: this.currentSession.createdAt,
      updatedAt: this.currentSession.updatedAt,
      totalOperations: this.currentSession.operations.length,
      completedOperations: this.currentSession.statistics.completedOperations,
      failedOperations: this.currentSession.statistics.failedOperations,
      status: this.currentSession.status || 'active'
    }
  }

  /**
   * Cleanup all resources
   */
  async cleanup() {
    // Stop timers
    this.stopAutoSave()
    this.stopPeriodicCleanup()
    
    // Save current session if exists
    if (this.currentSession) {
      await this.saveState()
    }
    
    this.currentSession = null
    this.sessionId = null
    
    this.emit('cleanup')
  }
}

module.exports = SyncStatePersistence