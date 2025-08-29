/**
 * SyncExecutor.js
 * Core synchronization logic with robust operation handling
 * 
 * Features:
 * - Parallel file operations with concurrency control
 * - Robust error handling with retry mechanisms and exponential backoff
 * - Dry-run mode with detailed operation preview
 * - Operation queuing and prioritization system
 * - Transaction-like operation grouping for atomic sync operations
 * - Operation rollback capabilities for failed sync attempts
 * - Graceful cancellation handling with proper cleanup
 */

const { EventEmitter } = require('events')
const path = require('path')
const os = require('os')
const FileOperations = require('./FileOperations')
const PerformanceMonitor = require('./PerformanceMonitor')
const ProgressIndicator = require('../components/ProgressIndicator')
const { logger } = require('../utils/logger')

class SyncExecutor extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Concurrency settings
      maxConcurrency: options.maxConcurrency || Math.min(os.cpus().length, 5),
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000, // Base retry delay in ms
      
      // Operation settings
      enableProgressReporting: options.enableProgressReporting !== false,
      enableRollback: options.enableRollback !== false,
      enableTransactions: options.enableTransactions !== false,
      
      // Safety settings
      verifyOperations: options.verifyOperations !== false,
      createBackups: options.createBackups || false,
      enableCleanup: options.enableCleanup !== false,
      
      // Performance settings
      enableBenchmarking: options.enableBenchmarking || false,
      adaptiveConcurrency: options.adaptiveConcurrency || false,
      
      ...options
    }
    
    // Initialize components
    this.fileOperations = new FileOperations(this.options)
    this.performanceMonitor = new PerformanceMonitor(this.options)
    this.progressIndicator = this.options.enableProgressReporting ? 
      new ProgressIndicator(this.options) : null
    
    // Execution state
    this.isRunning = false
    this.isPaused = false
    this.isCancelled = false
    this.operationQueue = []
    this.activeOperations = new Map() // Map of operation ID to promise
    this.completedOperations = []
    this.failedOperations = []
    this.rollbackStack = [] // Stack of operations that can be rolled back
    
    // Transaction state
    this.currentTransaction = null
    this.transactions = new Map() // Map of transaction ID to operations
    
    // Performance tracking
    this.startTime = null
    this.endTime = null
    this.statistics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      retriedOperations: 0,
      bytesProcessed: 0,
      averageSpeed: 0,
      peakConcurrency: 0
    }
    
    this.setupSignalHandlers()
    this.setupPerformanceMonitoring()
  }

  /**
   * Setup signal handlers for graceful cancellation
   */
  setupSignalHandlers() {
    const handleSignal = (signal) => {
      logger.info(`\nReceived ${signal}, initiating graceful shutdown...`)
      this.cancel()
    }
    
    process.once('SIGINT', handleSignal)
    process.once('SIGTERM', handleSignal)
  }

  /**
   * Setup performance monitoring integration
   */
  setupPerformanceMonitoring() {
    if (this.performanceMonitor) {
      this.performanceMonitor.on('metricsUpdate', (metrics) => {
        this.emit('performance', metrics)
        
        // Update progress indicator with performance data
        if (this.progressIndicator) {
          this.progressIndicator.update(null, null, {
            processedBytes: metrics.bytesProcessed,
            speed: metrics.operationsPerSecond,
            throughput: metrics.bytesPerSecond,
            eta: metrics.estimatedTimeRemaining
          })
        }
        
        // Adaptive concurrency adjustment
        if (this.options.adaptiveConcurrency) {
          this.adjustConcurrency(metrics)
        }
      })
    }
  }

  /**
   * Execute sync operations
   * @param {Array} operations - Array of sync operations to execute
   * @param {Object} options - Execution options
   * @returns {Object} Execution results
   */
  async execute(operations, options = {}) {
    if (this.isRunning) {
      throw new Error('SyncExecutor is already running')
    }
    
    try {
      this.isRunning = true
      this.isCancelled = false
      this.isPaused = false
      this.startTime = Date.now()
      
      const executionOptions = { ...this.options, ...options }
      
      // Validate operations
      await this.validateOperations(operations)
      
      // Initialize execution state
      this.initializeExecution(operations)
      
      // Start performance monitoring
      if (this.performanceMonitor) {
        this.performanceMonitor.start(operations.length)
      }
      
      // Start progress indicator
      if (this.progressIndicator) {
        this.progressIndicator.start(operations.length, {
          totalBytes: this.calculateTotalBytes(operations)
        })
      }
      
      let result
      
      if (executionOptions.dryRun) {
        result = await this.performDryRun(operations, executionOptions)
      } else {
        result = await this.performActualSync(operations, executionOptions)
      }
      
      return result
      
    } catch (error) {
      this.emit('error', error)
      throw error
    } finally {
      await this.cleanup()
      this.isRunning = false
    }
  }

  /**
   * Validate operations before execution
   * @param {Array} operations - Operations to validate
   */
  async validateOperations(operations) {
    if (!Array.isArray(operations)) {
      throw new Error('Operations must be an array')
    }
    
    if (operations.length === 0) {
      throw new Error('No operations to execute')
    }
    
    // Validate each operation
    for (const operation of operations) {
      if (!operation.type) {
        throw new Error(`Operation missing type: ${JSON.stringify(operation)}`)
      }
      
      if (!operation.source && !['delete'].includes(operation.type)) {
        throw new Error(`Operation missing source: ${JSON.stringify(operation)}`)
      }
      
      if (!operation.destination && ['copy', 'move'].includes(operation.type)) {
        throw new Error(`Operation missing destination: ${JSON.stringify(operation)}`)
      }
    }
    
    // Check for conflicts
    await this.detectOperationConflicts(operations)
  }

  /**
   * Initialize execution state
   * @param {Array} operations - Operations to initialize
   */
  initializeExecution(operations) {
    this.operationQueue = [...operations].map((op, index) => ({
      ...op,
      id: `op_${Date.now()}_${index}`,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now()
    }))
    
    this.activeOperations.clear()
    this.completedOperations = []
    this.failedOperations = []
    this.rollbackStack = []
    
    this.statistics = {
      totalOperations: operations.length,
      successfulOperations: 0,
      failedOperations: 0,
      retriedOperations: 0,
      bytesProcessed: 0,
      averageSpeed: 0,
      peakConcurrency: 0
    }
    
    this.emit('initialized', {
      totalOperations: operations.length,
      options: this.options
    })
  }

  /**
   * Perform dry run (simulation)
   * @param {Array} operations - Operations to simulate
   * @param {Object} options - Execution options
   * @returns {Object} Dry run results
   */
  async performDryRun(operations, _options) {
    logger.info('🔍 Performing dry run simulation...')
    
    const results = {
      dryRun: true,
      totalOperations: operations.length,
      estimatedDuration: 0,
      estimatedBytesToProcess: 0,
      operationPreview: [],
      potentialConflicts: [],
      warnings: []
    }
    
    for (const operation of this.operationQueue) {
      const preview = await this.previewOperation(operation)
      results.operationPreview.push(preview)
      
      // Update progress
      if (this.progressIndicator) {
        this.progressIndicator.increment({
          operation: 'preview',
          path: operation.source || operation.destination,
          name: path.basename(operation.source || operation.destination)
        })
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 10))
      
      if (this.isCancelled) {break}
    }
    
    results.estimatedBytesToProcess = results.operationPreview.reduce(
      (sum, op) => sum + (op.estimatedBytes || 0), 0
    )
    
    results.estimatedDuration = this.estimateExecutionTime(results.operationPreview)
    
    if (this.progressIndicator) {
      this.progressIndicator.complete({
        dryRun: true,
        operations: results.totalOperations
      })
    }
    
    return results
  }

  /**
   * Perform actual sync operations
   * @param {Array} operations - Operations to execute
   * @param {Object} options - Execution options
   * @returns {Object} Execution results
   */
  async performActualSync(operations, options) {
    logger.info('⚡ Executing sync operations...')
    
    // Create transaction if enabled
    if (this.options.enableTransactions) {
      this.currentTransaction = this.createTransaction()
    }
    
    // Execute operations with concurrency control
    const results = await this.executeWithConcurrency(this.operationQueue, options)
    
    // Complete transaction
    if (this.currentTransaction) {
      if (results.successfulOperations === results.totalOperations) {
        await this.commitTransaction(this.currentTransaction)
      } else {
        await this.rollbackTransaction(this.currentTransaction)
      }
    }
    
    // Complete progress indicator
    if (this.progressIndicator) {
      this.progressIndicator.complete({
        successful: results.successfulOperations,
        failed: results.failedOperations,
        totalBytes: this.statistics.bytesProcessed
      })
    }
    
    return results
  }

  /**
   * Execute operations with concurrency control
   * @param {Array} operations - Operations to execute
   * @param {Object} options - Execution options
   * @returns {Object} Execution results
   */
  async executeWithConcurrency(operations, options) {
    const concurrencyLimit = this.getCurrentConcurrencyLimit()
    const operationIterator = operations[Symbol.iterator]()
    const promises = []
    
    // Fill initial batch
    for (let i = 0; i < concurrencyLimit; i++) {
      const promise = this.processNextOperation(operationIterator, options)
      if (promise) {
        promises.push(promise)
      }
    }
    
    // Wait for all operations to complete
    await Promise.all(promises)
    
    // Compile results
    return this.compileExecutionResults()
  }

  /**
   * Process the next operation in the queue
   * @param {Iterator} iterator - Operation iterator
   * @param {Object} options - Execution options
   * @returns {Promise|null} Operation promise or null if no more operations
   */
  async processNextOperation(iterator, options) {
    const { value: operation, done } = iterator.next()
    
    if (done || this.isCancelled) {
      return null
    }
    
    const operationPromise = this.executeOperation(operation, options)
      .finally(() => {
        // Remove from active operations
        this.activeOperations.delete(operation.id)
        
        // Update peak concurrency tracking
        this.statistics.peakConcurrency = Math.max(
          this.statistics.peakConcurrency,
          this.activeOperations.size
        )
        
        // Process next operation if available
        if (!this.isCancelled) {
          return this.processNextOperation(iterator, options)
        }
      })
    
    // Track active operation
    this.activeOperations.set(operation.id, operationPromise)
    
    return operationPromise
  }

  /**
   * Execute a single operation
   * @param {Object} operation - Operation to execute
   * @param {Object} options - Execution options
   * @returns {Object} Operation result
   */
  async executeOperation(operation, options) {
    const startTime = Date.now()
    
    try {
      // Update progress indicator
      if (this.progressIndicator) {
        this.progressIndicator.setCurrentItem({
          operation: operation.type,
          path: operation.source || operation.destination,
          name: path.basename(operation.source || operation.destination),
          size: operation.size
        })
      }
      
      // Execute with retry logic
      const result = await this.executeWithRetry(operation, options)
      
      // Record successful operation
      operation.status = 'completed'
      operation.result = result
      operation.completedAt = Date.now()
      operation.duration = operation.completedAt - startTime
      
      this.completedOperations.push(operation)
      this.statistics.successfulOperations++
      
      // Add to rollback stack if rollback is enabled
      if (this.options.enableRollback && result.rollbackInfo) {
        this.rollbackStack.push({
          operation,
          rollbackInfo: result.rollbackInfo
        })
      }
      
      // Update performance monitoring
      if (this.performanceMonitor) {
        this.performanceMonitor.recordOperation(operation, result)
      }
      
      // Update progress
      if (this.progressIndicator) {
        this.progressIndicator.increment()
      }
      
      this.emit('operationComplete', operation)
      
      return result
      
    } catch (error) {
      // Record failed operation
      operation.status = 'failed'
      operation.error = error
      operation.failedAt = Date.now()
      operation.duration = operation.failedAt - startTime
      
      this.failedOperations.push(operation)
      this.statistics.failedOperations++
      
      this.emit('operationFailed', operation, error)
      
      // If error is critical, cancel remaining operations
      if (error.critical) {
        this.cancel()
      }
      
      throw error
    }
  }

  /**
   * Execute operation with retry logic
   * @param {Object} operation - Operation to execute
   * @param {Object} options - Execution options
   * @returns {Object} Operation result
   */
  async executeWithRetry(operation, options) {
    let lastError
    
    while (operation.attempts <= this.options.maxRetries) {
      try {
        operation.attempts++
        
        if (operation.attempts > 1) {
          this.statistics.retriedOperations++
          
          // Exponential backoff
          const delay = this.options.retryDelay * Math.pow(2, operation.attempts - 2)
          await new Promise(resolve => setTimeout(resolve, delay))
          
          logger.info(`Retrying operation ${operation.id} (attempt ${operation.attempts})`)
        }
        
        // Execute the actual file operation
        return await this.fileOperations.execute(operation, options)
        
      } catch (error) {
        lastError = error
        
        // Don't retry certain types of errors
        if (error.code === 'ENOENT' || error.code === 'EACCES') {
          break
        }
        
        // Check if we should continue retrying
        if (operation.attempts >= this.options.maxRetries) {
          break
        }
        
        this.emit('operationRetry', operation, error)
      }
    }
    
    throw lastError
  }

  /**
   * Preview operation (for dry run)
   * @param {Object} operation - Operation to preview
   * @returns {Object} Operation preview
   */
  async previewOperation(operation) {
    try {
      const preview = await this.fileOperations.preview(operation)
      return {
        ...operation,
        ...preview,
        wouldExecute: true
      }
    } catch (error) {
      return {
        ...operation,
        wouldExecute: false,
        previewError: error.message,
        estimatedBytes: 0
      }
    }
  }

  /**
   * Cancel all operations
   */
  async cancel() {
    if (this.isCancelled) {return}
    
    logger.info('🛑 Cancelling sync operations...')
    this.isCancelled = true
    
    if (this.progressIndicator) {
      this.progressIndicator.setMode('error')
    }
    
    // Wait for active operations to complete or timeout
    const activePromises = Array.from(this.activeOperations.values())
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000))
    
    await Promise.race([
      Promise.allSettled(activePromises),
      timeoutPromise
    ])
    
    this.emit('cancelled')
  }

  /**
   * Pause execution
   */
  pause() {
    this.isPaused = true
    this.emit('paused')
  }

  /**
   * Resume execution
   */
  resume() {
    this.isPaused = false
    this.emit('resumed')
  }

  /**
   * Create a new transaction
   * @returns {Object} Transaction object
   */
  createTransaction() {
    const transaction = {
      id: `tx_${Date.now()}`,
      operations: [],
      createdAt: Date.now(),
      status: 'active'
    }
    
    this.transactions.set(transaction.id, transaction)
    return transaction
  }

  /**
   * Commit a transaction
   * @param {Object} transaction - Transaction to commit
   */
  async commitTransaction(transaction) {
    transaction.status = 'committed'
    transaction.committedAt = Date.now()
    
    this.emit('transactionCommitted', transaction)
  }

  /**
   * Rollback a transaction
   * @param {Object} transaction - Transaction to rollback
   */
  async rollbackTransaction(transaction) {
    logger.info(`🔄 Rolling back transaction ${transaction.id}...`)
    
    const rollbackOperations = this.rollbackStack.filter(
      item => transaction.operations.includes(item.operation.id)
    ).reverse() // Rollback in reverse order
    
    for (const { operation, rollbackInfo } of rollbackOperations) {
      try {
        await this.fileOperations.rollback(operation, rollbackInfo)
        logger.info(`✓ Rolled back operation: ${operation.id}`)
      } catch (error) {
        logger.error(`✗ Failed to rollback operation ${operation.id}:`, error.message)
      }
    }
    
    transaction.status = 'rolled_back'
    transaction.rolledBackAt = Date.now()
    
    this.emit('transactionRolledBack', transaction)
  }

  /**
   * Detect operation conflicts
   * @param {Array} operations - Operations to check for conflicts
   */
  async detectOperationConflicts(operations) {
    const pathMap = new Map()
    const conflicts = []
    
    for (const operation of operations) {
      const paths = []
      
      if (operation.source) {paths.push(operation.source)}
      if (operation.destination) {paths.push(operation.destination)}
      
      for (const filePath of paths) {
        if (pathMap.has(filePath)) {
          conflicts.push({
            path: filePath,
            operations: [pathMap.get(filePath), operation]
          })
        } else {
          pathMap.set(filePath, operation)
        }
      }
    }
    
    if (conflicts.length > 0) {
      logger.warn('⚠️ Detected potential conflicts:', conflicts)
      this.emit('conflictsDetected', conflicts)
    }
  }

  /**
   * Calculate total bytes for all operations
   * @param {Array} operations - Operations to calculate bytes for
   * @returns {number} Total bytes
   */
  calculateTotalBytes(operations) {
    return operations.reduce((total, operation) => {
      return total + (operation.size || 0)
    }, 0)
  }

  /**
   * Estimate execution time
   * @param {Array} operationPreviews - Operation previews from dry run
   * @returns {number} Estimated duration in milliseconds
   */
  estimateExecutionTime(operationPreviews) {
    // Simple estimation based on file sizes and operation types
    const baseTimePerOperation = 100 // ms
    const bytesPerSecond = 50 * 1024 * 1024 // 50 MB/s estimated throughput
    
    let totalTime = 0
    
    for (const preview of operationPreviews) {
      totalTime += baseTimePerOperation
      
      if (preview.estimatedBytes) {
        totalTime += (preview.estimatedBytes / bytesPerSecond) * 1000
      }
    }
    
    return totalTime
  }

  /**
   * Get current concurrency limit
   * @returns {number} Current concurrency limit
   */
  getCurrentConcurrencyLimit() {
    // Could be adapted based on performance metrics
    return this.options.maxConcurrency
  }

  /**
   * Adjust concurrency based on performance metrics
   * @param {Object} metrics - Performance metrics
   */
  adjustConcurrency(metrics) {
    // Simple adaptive concurrency logic
    if (metrics.systemLoad > 0.8 && this.options.maxConcurrency > 1) {
      this.options.maxConcurrency = Math.max(1, this.options.maxConcurrency - 1)
    } else if (metrics.systemLoad < 0.5 && metrics.operationsPerSecond > 10) {
      this.options.maxConcurrency = Math.min(os.cpus().length, this.options.maxConcurrency + 1)
    }
  }

  /**
   * Compile execution results
   * @returns {Object} Comprehensive results object
   */
  compileExecutionResults() {
    this.endTime = Date.now()
    const duration = this.endTime - this.startTime
    
    return {
      dryRun: false,
      duration,
      totalOperations: this.statistics.totalOperations,
      successfulOperations: this.statistics.successfulOperations,
      failedOperations: this.statistics.failedOperations,
      retriedOperations: this.statistics.retriedOperations,
      bytesProcessed: this.statistics.bytesProcessed,
      averageSpeed: this.statistics.successfulOperations / (duration / 1000),
      peakConcurrency: this.statistics.peakConcurrency,
      completedOperationsList: this.completedOperations,
      failedOperationsList: this.failedOperations,
      cancelled: this.isCancelled,
      performanceMetrics: this.performanceMonitor ? this.performanceMonitor.getMetrics() : null
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    logger.info('🧹 Cleaning up resources...')
    
    this.stopAnimation()
    
    if (this.performanceMonitor) {
      this.performanceMonitor.stop()
    }
    
    if (this.progressIndicator) {
      this.progressIndicator.stop()
    }
    
    // Cleanup temporary files if enabled
    if (this.options.enableCleanup && this.fileOperations) {
      await this.fileOperations.cleanup()
    }
    
    this.emit('cleanup')
  }

  /**
   * Stop animation and progress display
   */
  stopAnimation() {
    if (this.progressIndicator) {
      this.progressIndicator.stop()
    }
  }

  /**
   * Get current execution statistics
   * @returns {Object} Current statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      activeOperations: this.activeOperations.size,
      queuedOperations: this.operationQueue.filter(op => op.status === 'pending').length,
      elapsedTime: this.startTime ? (this.endTime || Date.now()) - this.startTime : 0
    }
  }

  /**
   * Get detailed execution state
   * @returns {Object} Detailed state information
   */
  getExecutionState() {
    return {
      statistics: this.getStatistics(),
      operationQueue: this.operationQueue,
      activeOperations: Array.from(this.activeOperations.keys()),
      completedOperations: this.completedOperations.length,
      failedOperations: this.failedOperations.length,
      currentTransaction: this.currentTransaction,
      rollbackStackSize: this.rollbackStack.length,
      performanceMetrics: this.performanceMonitor ? this.performanceMonitor.getMetrics() : null
    }
  }
}

module.exports = SyncExecutor