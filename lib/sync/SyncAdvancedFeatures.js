/**
 * SyncAdvancedFeatures.js
 * Advanced sync capabilities and extensibility features
 * 
 * Features:
 * - Incremental sync capabilities for efficiency on large datasets
 * - Custom sync rules and filtering with user-defined patterns
 * - Sync scheduling and automation features
 * - Sync hooks and plugin system for extensibility
 * - Sync history and audit logging for troubleshooting
 */

const { EventEmitter } = require('events')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const minimatch = require('minimatch')
const { getEnv } = require('../security/EnvironmentSanitizer')

class SyncAdvancedFeatures extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Incremental sync settings
      enableIncrementalSync: options.enableIncrementalSync !== false,
      checksumCacheDir: options.checksumCacheDir || '.lerian-sync-cache',
      incrementalStrategy: options.incrementalStrategy || 'timestamp_checksum', // 'timestamp', 'checksum', 'timestamp_checksum'
      
      // Filtering and rules
      enableCustomRules: options.enableCustomRules !== false,
      rulesFile: options.rulesFile || '.lerian-sync-rules.json',
      defaultExcludes: options.defaultExcludes || ['node_modules/**', '.git/**', '*.log'],
      
      // Scheduling
      enableScheduling: options.enableScheduling || false,
      scheduleFile: options.scheduleFile || '.lerian-sync-schedule.json',
      
      // Hooks and plugins
      enableHooks: options.enableHooks !== false,
      hookTimeout: options.hookTimeout || 30000, // 30 seconds
      pluginDir: options.pluginDir || '.lerian-sync-plugins',
      
      // Audit logging
      enableAuditLog: options.enableAuditLog !== false,
      auditLogFile: options.auditLogFile || '.lerian-sync-audit.log',
      maxAuditLogSize: options.maxAuditLogSize || 10 * 1024 * 1024, // 10MB
      
      ...options
    }
    
    // State management
    this.checksumCache = new Map()
    this.syncRules = []
    this.scheduledTasks = []
    this.registeredHooks = new Map()
    this.loadedPlugins = new Map()
    this.auditLog = []
    
    // Hook types
    this.hookTypes = [
      'beforeSync',
      'afterSync',
      'beforeOperation',
      'afterOperation',
      'onError',
      'onComplete',
      'onCancel'
    ]
    
    this.init()
  }

  /**
   * Initialize advanced features
   */
  async init() {
    try {
      // Load sync rules
      if (this.options.enableCustomRules) {
        await this.loadSyncRules()
      }
      
      // Load checksum cache
      if (this.options.enableIncrementalSync) {
        await this.loadChecksumCache()
      }
      
      // Load scheduled tasks
      if (this.options.enableScheduling) {
        await this.loadScheduledTasks()
      }
      
      // Load plugins
      if (this.options.enableHooks) {
        await this.loadPlugins()
      }
      
      // Initialize audit logging
      if (this.options.enableAuditLog) {
        await this.initializeAuditLog()
      }
      
      this.emit('initialized', {
        features: {
          incrementalSync: this.options.enableIncrementalSync,
          customRules: this.options.enableCustomRules,
          scheduling: this.options.enableScheduling,
          hooks: this.options.enableHooks,
          auditLog: this.options.enableAuditLog
        }
      })
      
    } catch (error) {
      this.emit('error', new Error(`Failed to initialize advanced features: ${error.message}`))
    }
  }

  /**
   * Perform incremental sync analysis
   * @param {Array} allFiles - All files to analyze
   * @param {string} sourcePath - Source path
   * @param {string} destinationPath - Destination path
   * @returns {Object} Incremental sync analysis
   */
  async performIncrementalAnalysis(allFiles, sourcePath, destinationPath) {
    if (!this.options.enableIncrementalSync) {
      return {
        strategy: 'full',
        filesToSync: allFiles,
        cacheHits: 0,
        cacheMisses: allFiles.length
      }
    }
    
    const analysis = {
      strategy: this.options.incrementalStrategy,
      filesToSync: [],
      cacheHits: 0,
      cacheMisses: 0,
      checksumComparisons: 0,
      timestampComparisons: 0
    }
    
    for (const file of allFiles) {
      const needsSync = await this.fileNeedsSync(file, sourcePath, destinationPath)
      
      if (needsSync.required) {
        analysis.filesToSync.push({
          ...file,
          syncReason: needsSync.reason,
          cached: needsSync.cached
        })
        analysis.cacheMisses++
      } else {
        analysis.cacheHits++
      }
      
      if (needsSync.checksumCompared) {analysis.checksumComparisons++}
      if (needsSync.timestampCompared) {analysis.timestampComparisons++}
    }
    
    // Update cache
    await this.saveChecksumCache()
    
    this.emit('incrementalAnalysis', analysis)
    
    return analysis
  }

  /**
   * Check if a file needs to be synced
   * @param {Object} file - File information
   * @param {string} sourcePath - Source path
   * @param {string} destinationPath - Destination path
   * @returns {Object} Sync requirement analysis
   */
  async fileNeedsSync(file, sourcePath, destinationPath) {
    const result = {
      required: false,
      reason: null,
      cached: false,
      checksumCompared: false,
      timestampCompared: false
    }
    
    const sourceFile = path.join(sourcePath, file.relativePath)
    const destFile = path.join(destinationPath, file.relativePath)
    
    try {
      // Check if destination exists
      let destStats
      try {
        destStats = await fs.stat(destFile)
      } catch (error) {
        if (error.code === 'ENOENT') {
          result.required = true
          result.reason = 'destination_missing'
          return result
        }
        throw error
      }
      
      const sourceStats = await fs.stat(sourceFile)
      
      // Strategy-based comparison
      switch (this.options.incrementalStrategy) {
        case 'timestamp':
          result.timestampCompared = true
          if (sourceStats.mtime > destStats.mtime) {
            result.required = true
            result.reason = 'timestamp_newer'
          }
          break
          
        case 'checksum': {
          result.checksumCompared = true
          const needsChecksumSync = await this.compareChecksums(sourceFile, destFile, file.relativePath)
          if (needsChecksumSync.different) {
            result.required = true
            result.reason = 'checksum_different'
            result.cached = needsChecksumSync.cached
          }
          break
        }
          
        case 'timestamp_checksum':
        default:
          result.timestampCompared = true
          
          // First check timestamp (fast)
          if (sourceStats.mtime > destStats.mtime) {
            // If timestamp is newer, also verify with checksum for accuracy
            result.checksumCompared = true
            const checksumResult = await this.compareChecksums(sourceFile, destFile, file.relativePath)
            if (checksumResult.different) {
              result.required = true
              result.reason = 'timestamp_and_checksum'
              result.cached = checksumResult.cached
            }
          } else if (sourceStats.size !== destStats.size) {
            // Size difference indicates change
            result.required = true
            result.reason = 'size_different'
          }
          break
      }
      
    } catch (error) {
      // On error, assume file needs sync
      result.required = true
      result.reason = `error_${error.code || 'unknown'}`
    }
    
    return result
  }

  /**
   * Compare file checksums with caching
   * @param {string} sourceFile - Source file path
   * @param {string} destFile - Destination file path
   * @param {string} relativePath - Relative path for caching
   * @returns {Object} Checksum comparison result
   */
  async compareChecksums(sourceFile, destFile, relativePath) {
    try {
      const sourceStats = await fs.stat(sourceFile)
      const _destStats = await fs.stat(destFile)
      
      const cacheKey = `${relativePath}:${sourceStats.mtime.getTime()}:${sourceStats.size}`
      
      // Check cache first
      if (this.checksumCache.has(cacheKey)) {
        const cachedChecksum = this.checksumCache.get(cacheKey)
        const destChecksum = await this.calculateFileChecksum(destFile)
        
        return {
          different: cachedChecksum !== destChecksum,
          cached: true,
          sourceChecksum: cachedChecksum,
          destChecksum
        }
      }
      
      // Calculate checksums
      const [sourceChecksum, destChecksum] = await Promise.all([
        this.calculateFileChecksum(sourceFile),
        this.calculateFileChecksum(destFile)
      ])
      
      // Cache the source checksum
      this.checksumCache.set(cacheKey, sourceChecksum)
      
      return {
        different: sourceChecksum !== destChecksum,
        cached: false,
        sourceChecksum,
        destChecksum
      }
      
    } catch (error) {
      return {
        different: true,
        cached: false,
        error: error.message
      }
    }
  }

  /**
   * Calculate file checksum
   * @param {string} filePath - File path
   * @returns {string} SHA-256 checksum
   */
  async calculateFileChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = require('fs').createReadStream(filePath)
      
      stream.on('data', data => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * Apply sync rules and filters
   * @param {Array} files - Files to filter
   * @param {Object} context - Sync context
   * @returns {Array} Filtered files
   */
  async applySyncRules(files, context = {}) {
    if (!this.options.enableCustomRules) {
      return this.applyDefaultFilters(files)
    }
    
    let filteredFiles = [...files]
    
    // Apply each rule in order
    for (const rule of this.syncRules) {
      filteredFiles = await this.applyRule(rule, filteredFiles, context)
    }
    
    // Apply default excludes
    filteredFiles = this.applyDefaultFilters(filteredFiles)
    
    this.emit('rulesApplied', {
      originalCount: files.length,
      filteredCount: filteredFiles.length,
      rulesCount: this.syncRules.length
    })
    
    return filteredFiles
  }

  /**
   * Apply a single sync rule
   * @param {Object} rule - Sync rule to apply
   * @param {Array} files - Files to filter
   * @param {Object} context - Sync context
   * @returns {Array} Filtered files
   */
  async applyRule(rule, files, context) {
    const { type, pattern, action, condition } = rule
    
    // Evaluate condition if present
    if (condition && !this.evaluateCondition(condition, context)) {
      return files // Rule condition not met, skip
    }
    
    const matchingFiles = []
    const nonMatchingFiles = []
    
    for (const file of files) {
      const matches = this.matchesPattern(file, pattern, type)
      
      if (matches) {
        matchingFiles.push(file)
      } else {
        nonMatchingFiles.push(file)
      }
    }
    
    // Apply action
    switch (action) {
      case 'include':
        return matchingFiles
      case 'exclude':
        return nonMatchingFiles
      case 'priority':
        // Move matching files to front
        return [...matchingFiles, ...nonMatchingFiles]
      case 'transform':
        // Apply transformation to matching files
        return [
          ...matchingFiles.map(file => this.transformFile(file, rule.transform)),
          ...nonMatchingFiles
        ]
      default:
        return files
    }
  }

  /**
   * Check if file matches a pattern
   * @param {Object} file - File object
   * @param {string|Array} pattern - Pattern(s) to match
   * @param {string} type - Pattern type (glob, regex, path)
   * @returns {boolean} True if file matches
   */
  matchesPattern(file, pattern, type = 'glob') {
    const patterns = Array.isArray(pattern) ? pattern : [pattern]
    
    return patterns.some(p => {
      switch (type) {
        case 'glob':
          return minimatch(file.relativePath, p)
        case 'regex':
          return new RegExp(p).test(file.relativePath)
        case 'path':
          return file.relativePath.includes(p)
        case 'extension':
          return path.extname(file.relativePath) === (p.startsWith('.') ? p : `.${p}`)
        default:
          return false
      }
    })
  }

  /**
   * Apply default file filters
   * @param {Array} files - Files to filter
   * @returns {Array} Filtered files
   */
  applyDefaultFilters(files) {
    return files.filter(file => {
      return !this.options.defaultExcludes.some(pattern => 
        minimatch(file.relativePath, pattern)
      )
    })
  }

  /**
   * Execute sync hooks
   * @param {string} hookType - Type of hook to execute
   * @param {Object} context - Hook context
   * @returns {Object} Hook execution results
   */
  async executeHooks(hookType, context = {}) {
    if (!this.options.enableHooks || !this.registeredHooks.has(hookType)) {
      return { executed: 0, results: [] }
    }
    
    const hooks = this.registeredHooks.get(hookType)
    const results = []
    
    for (const hook of hooks) {
      try {
        const result = await Promise.race([
          hook.handler(context),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Hook timeout')), this.options.hookTimeout)
          )
        ])
        
        results.push({
          hookId: hook.id,
          success: true,
          result,
          duration: Date.now() - context.startTime
        })
        
      } catch (error) {
        results.push({
          hookId: hook.id,
          success: false,
          error: error.message,
          duration: Date.now() - context.startTime
        })
        
        // Emit hook error but continue with other hooks
        this.emit('hookError', {
          hookType,
          hookId: hook.id,
          error: error.message
        })
      }
    }
    
    this.emit('hooksExecuted', {
      hookType,
      executed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
    
    return { executed: results.length, results }
  }

  /**
   * Register a sync hook
   * @param {string} hookType - Type of hook
   * @param {string} hookId - Unique hook ID
   * @param {Function} handler - Hook handler function
   * @param {Object} options - Hook options
   */
  registerHook(hookType, hookId, handler, options = {}) {
    if (!this.hookTypes.includes(hookType)) {
      throw new Error(`Invalid hook type: ${hookType}`)
    }
    
    if (!this.registeredHooks.has(hookType)) {
      this.registeredHooks.set(hookType, [])
    }
    
    const hooks = this.registeredHooks.get(hookType)
    
    // Remove existing hook with same ID
    const existingIndex = hooks.findIndex(h => h.id === hookId)
    if (existingIndex >= 0) {
      hooks.splice(existingIndex, 1)
    }
    
    // Add new hook
    hooks.push({
      id: hookId,
      handler,
      priority: options.priority || 0,
      async: options.async !== false
    })
    
    // Sort by priority (higher priority first)
    hooks.sort((a, b) => b.priority - a.priority)
    
    this.emit('hookRegistered', { hookType, hookId, priority: options.priority || 0 })
  }

  /**
   * Log sync operation to audit log
   * @param {string} operation - Operation type
   * @param {Object} details - Operation details
   * @param {string} result - Operation result
   */
  async logAuditEntry(operation, details, result = 'success') {
    if (!this.options.enableAuditLog) {
      return
    }
    
    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      details,
      result,
      sessionId: details.sessionId || 'unknown',
      user: getEnv('USER') || getEnv('USERNAME', 'unknown'),
      pid: process.pid
    }
    
    this.auditLog.push(entry)
    
    // Write to audit log file
    try {
      const logLine = JSON.stringify(entry) + '\n'
      await fs.appendFile(this.options.auditLogFile, logLine, 'utf8')
      
      // Check log file size and rotate if necessary
      await this.rotateAuditLogIfNeeded()
      
    } catch (error) {
      this.emit('error', new Error(`Failed to write audit log: ${error.message}`))
    }
    
    this.emit('auditLogged', entry)
  }

  /**
   * Load sync rules from file
   */
  async loadSyncRules() {
    try {
      const rulesContent = await fs.readFile(this.options.rulesFile, 'utf8')
      const rules = JSON.parse(rulesContent)
      
      this.syncRules = Array.isArray(rules) ? rules : []
      
      this.emit('rulesLoaded', { count: this.syncRules.length })
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', new Error(`Failed to load sync rules: ${error.message}`))
      }
      // Use empty rules if file doesn't exist
      this.syncRules = []
    }
  }

  /**
   * Load checksum cache from file
   */
  async loadChecksumCache() {
    try {
      const cacheDir = this.options.checksumCacheDir
      await fs.mkdir(cacheDir, { recursive: true })
      
      const cacheFile = path.join(cacheDir, 'checksums.json')
      const cacheContent = await fs.readFile(cacheFile, 'utf8')
      const cacheData = JSON.parse(cacheContent)
      
      this.checksumCache = new Map(Object.entries(cacheData))
      
      this.emit('checksumCacheLoaded', { entries: this.checksumCache.size })
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', new Error(`Failed to load checksum cache: ${error.message}`))
      }
      // Start with empty cache if file doesn't exist
      this.checksumCache = new Map()
    }
  }

  /**
   * Save checksum cache to file
   */
  async saveChecksumCache() {
    try {
      const cacheDir = this.options.checksumCacheDir
      await fs.mkdir(cacheDir, { recursive: true })
      
      const cacheFile = path.join(cacheDir, 'checksums.json')
      const cacheData = Object.fromEntries(this.checksumCache)
      
      await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2), 'utf8')
      
    } catch (error) {
      this.emit('error', new Error(`Failed to save checksum cache: ${error.message}`))
    }
  }

  /**
   * Load scheduled tasks
   */
  async loadScheduledTasks() {
    try {
      const scheduleContent = await fs.readFile(this.options.scheduleFile, 'utf8')
      const schedule = JSON.parse(scheduleContent)
      
      this.scheduledTasks = Array.isArray(schedule) ? schedule : []
      
      this.emit('scheduleLoaded', { tasks: this.scheduledTasks.length })
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', new Error(`Failed to load schedule: ${error.message}`))
      }
      this.scheduledTasks = []
    }
  }

  /**
   * Load plugins from plugin directory
   */
  async loadPlugins() {
    try {
      await fs.mkdir(this.options.pluginDir, { recursive: true })
      
      const files = await fs.readdir(this.options.pluginDir)
      const pluginFiles = files.filter(file => file.endsWith('.js'))
      
      for (const file of pluginFiles) {
        try {
          const pluginPath = path.resolve(this.options.pluginDir, file)
          const plugin = require(pluginPath)
          
          if (typeof plugin.register === 'function') {
            plugin.register(this)
            this.loadedPlugins.set(file, plugin)
          }
          
        } catch (error) {
          this.emit('error', new Error(`Failed to load plugin ${file}: ${error.message}`))
        }
      }
      
      this.emit('pluginsLoaded', { count: this.loadedPlugins.size })
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', new Error(`Failed to load plugins: ${error.message}`))
      }
    }
  }

  /**
   * Initialize audit logging
   */
  async initializeAuditLog() {
    try {
      // Ensure audit log directory exists
      const logDir = path.dirname(this.options.auditLogFile)
      await fs.mkdir(logDir, { recursive: true })
      
      // Log initialization
      await this.logAuditEntry('system', {
        action: 'initialize',
        features: 'advanced_sync_features',
        version: '1.0'
      })
      
    } catch (error) {
      this.emit('error', new Error(`Failed to initialize audit log: ${error.message}`))
    }
  }

  /**
   * Rotate audit log if it exceeds size limit
   */
  async rotateAuditLogIfNeeded() {
    try {
      const stats = await fs.stat(this.options.auditLogFile)
      
      if (stats.size > this.options.maxAuditLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const rotatedFile = `${this.options.auditLogFile}.${timestamp}`
        
        await fs.rename(this.options.auditLogFile, rotatedFile)
        
        this.emit('auditLogRotated', {
          originalSize: stats.size,
          rotatedFile
        })
      }
      
    } catch (error) {
      // Non-critical error, just emit warning
      this.emit('warning', `Failed to rotate audit log: ${error.message}`)
    }
  }

  /**
   * Evaluate rule condition
   * @param {Object} condition - Condition to evaluate
   * @param {Object} context - Evaluation context
   * @returns {boolean} True if condition is met
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluation - could be extended
    const { type, key, operator, value } = condition
    
    if (type === 'context') {
      const contextValue = context[key]
      
      switch (operator) {
        case 'equals':
          return contextValue === value
        case 'not_equals':
          return contextValue !== value
        case 'contains':
          return String(contextValue).includes(value)
        case 'greater_than':
          return Number(contextValue) > Number(value)
        case 'less_than':
          return Number(contextValue) < Number(value)
        default:
          return false
      }
    }
    
    return false
  }

  /**
   * Transform file based on rule
   * @param {Object} file - File to transform
   * @param {Object} transform - Transformation rules
   * @returns {Object} Transformed file
   */
  transformFile(file, transform) {
    const transformedFile = { ...file }
    
    if (transform.priority) {
      transformedFile.priority = transform.priority
    }
    
    if (transform.metadata) {
      transformedFile.metadata = { ...transformedFile.metadata, ...transform.metadata }
    }
    
    return transformedFile
  }

  /**
   * Get comprehensive feature statistics
   * @returns {Object} Feature statistics
   */
  getFeatureStats() {
    return {
      incrementalSync: {
        enabled: this.options.enableIncrementalSync,
        cacheSize: this.checksumCache.size,
        strategy: this.options.incrementalStrategy
      },
      syncRules: {
        enabled: this.options.enableCustomRules,
        rulesCount: this.syncRules.length
      },
      scheduling: {
        enabled: this.options.enableScheduling,
        tasksCount: this.scheduledTasks.length
      },
      hooks: {
        enabled: this.options.enableHooks,
        registeredHooks: Array.from(this.registeredHooks.keys()).reduce((acc, type) => {
          acc[type] = this.registeredHooks.get(type).length
          return acc
        }, {}),
        loadedPlugins: this.loadedPlugins.size
      },
      auditLog: {
        enabled: this.options.enableAuditLog,
        entriesCount: this.auditLog.length
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // Save caches
    if (this.options.enableIncrementalSync && this.checksumCache.size > 0) {
      await this.saveChecksumCache()
    }
    
    // Final audit log entry
    if (this.options.enableAuditLog) {
      await this.logAuditEntry('system', {
        action: 'cleanup',
        features: 'advanced_sync_features'
      })
    }
    
    // Clear state
    this.checksumCache.clear()
    this.syncRules = []
    this.scheduledTasks = []
    this.registeredHooks.clear()
    this.loadedPlugins.clear()
    this.auditLog = []
    
    this.emit('cleanup')
  }
}

module.exports = SyncAdvancedFeatures