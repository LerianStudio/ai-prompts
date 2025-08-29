const GitChecker = require('./GitChecker')
const SourcePathDetector = require('./SourcePathDetector')
const DestinationValidator = require('./DestinationValidator')
const SafetyResolver = require('./SafetyResolver')
const SafetyCheckStatus = require('../components/SafetyCheckStatus')
const chalk = require('chalk')
const ora = require('ora')

/**
 * SafetyCheckRunner - Main coordinator for safety check operations
 * Orchestrates all safety checks, handles parallel execution, caching, and reporting
 */
class SafetyCheckRunner {
  constructor(options = {}) {
    this.options = {
      parallel: options.parallel !== false, // Default to parallel execution
      showProgress: options.showProgress !== false,
      cache: options.cache !== false,
      timeout: options.timeout || 30000, // 30 second timeout
      autoResolve: options.autoResolve || false,
      skipPrompts: options.skipPrompts || false,
      retryCount: options.retryCount || 2,
      ...options
    }

    // Initialize checkers
    this.checkers = [
      new GitChecker({ timeout: this.options.timeout }),
      new SourcePathDetector({ cacheEnabled: this.options.cache }),
      new DestinationValidator()
    ]

    // Initialize supporting components
    this.resolver = new SafetyResolver({
      autoResolve: this.options.autoResolve,
      skipPrompts: this.options.skipPrompts
    })

    // Internal state
    this.lastRunResults = null
    this.runCache = new Map()
    this.cacheExpiry = null
    this.cacheDuration = 120000 // 2 minutes
    this.executionHistory = []
    this.dependencies = new Map()

    // Setup dependencies
    this.setupDependencies()
  }

  /**
   * Run all safety checks with comprehensive orchestration
   * @param {Object} options - Runtime options
   * @returns {Object} Complete safety check results
   */
  async runAllChecks(options = {}) {
    const startTime = Date.now()
    const runtimeOptions = { ...this.options, ...options }
    
    // Check cache if enabled
    if (runtimeOptions.cache && this.isCacheValid()) {
      return {
        ...this.lastRunResults,
        fromCache: true,
        executionTime: Date.now() - startTime
      }
    }

    let spinner
    if (runtimeOptions.showProgress) {
      spinner = ora('Running safety checks...').start()
    }

    try {
      // Execute checks based on dependencies and parallel settings
      const checkResults = await this.executeChecks(runtimeOptions, spinner)
      
      // Create status display
      const status = new SafetyCheckStatus(checkResults)
      
      if (spinner) {
        spinner.succeed('Safety checks completed')
      }

      // Display results
      if (!runtimeOptions.quiet) {
        console.log('\n' + status.render())
      }

      // Evaluate results
      const evaluation = this.evaluateResults(checkResults)
      
      // Handle interactive resolution if needed
      let resolution = null
      if (!evaluation.canProceed && !runtimeOptions.skipPrompts) {
        if (spinner) {spinner.stop()}
        
        resolution = await this.resolver.resolveIssues([
          ...evaluation.failedChecks,
          ...evaluation.warningChecks
        ])
        
        // Re-run checks if issues were resolved
        if (resolution && resolution.resolved.length > 0) {
          return await this.runAllChecks({ ...runtimeOptions, skipPrompts: true })
        }
      }

      const results = {
        ...evaluation,
        allChecks: checkResults,
        resolution,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        fromCache: false
      }

      // Cache results
      if (runtimeOptions.cache) {
        this.updateCache(results)
      }

      // Add to execution history
      this.executionHistory.push({
        timestamp: results.timestamp,
        canProceed: results.canProceed,
        checkCount: checkResults.length,
        executionTime: results.executionTime,
        hasResolution: !!resolution
      })

      // Keep only last 10 executions
      if (this.executionHistory.length > 10) {
        this.executionHistory = this.executionHistory.slice(-10)
      }

      this.lastRunResults = results
      return results
    } catch (error) {
      if (spinner) {
        spinner.fail(`Safety checks failed: ${error.message}`)
      }

      const errorResult = {
        canProceed: false,
        hasWarnings: false,
        failedChecks: [{
          id: 'runner-error',
          status: 'fail',
          message: 'Safety check execution failed',
          details: [error.message, error.stack]
        }],
        warningChecks: [],
        allChecks: [],
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }

      this.lastRunResults = errorResult
      return errorResult
    }
  }

  /**
   * Execute safety checks with proper dependency management
   * @param {Object} options - Runtime options
   * @param {Object} spinner - Progress spinner
   * @returns {Array} Array of all check results
   */
  async executeChecks(options, spinner) {
    const allResults = []

    if (options.parallel) {
      // Parallel execution with dependency management
      const independentCheckers = this.getIndependentCheckers()
      const dependentCheckers = this.getDependentCheckers()

      // Update progress
      if (spinner) {
        spinner.text = `Running ${independentCheckers.length} independent checks in parallel...`
      }

      // Run independent checks in parallel
      const independentPromises = independentCheckers.map(checker =>
        this.runCheckerWithRetry(checker, options).catch(error => 
          this.createErrorCheck(checker, error)
        )
      )

      const independentResults = await Promise.all(independentPromises)
      allResults.push(...independentResults.flat())

      // Run dependent checks sequentially
      for (const checker of dependentCheckers) {
        if (spinner) {
          spinner.text = `Running ${checker.constructor.name}...`
        }

        try {
          const result = await this.runCheckerWithRetry(checker, options)
          allResults.push(...result)
        } catch (error) {
          allResults.push(this.createErrorCheck(checker, error))
        }
      }
    } else {
      // Sequential execution
      for (const checker of this.checkers) {
        if (spinner) {
          spinner.text = `Running ${checker.constructor.name}...`
        }

        try {
          const result = await this.runCheckerWithRetry(checker, options)
          allResults.push(...result)
        } catch (error) {
          allResults.push(this.createErrorCheck(checker, error))
        }
      }
    }

    return allResults
  }

  /**
   * Run individual checker with retry mechanism
   * @param {Object} checker - Checker instance
   * @param {Object} options - Runtime options
   * @returns {Array} Check results
   */
  async runCheckerWithRetry(checker, options) {
    let lastError
    let attempt = 0
    const maxAttempts = options.retryCount + 1

    while (attempt < maxAttempts) {
      try {
        return await this.runChecker(checker, options)
      } catch (error) {
        lastError = error
        attempt++
        
        if (attempt < maxAttempts) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    throw lastError
  }

  /**
   * Run individual checker
   * @param {Object} checker - Checker instance
   * @param {Object} options - Runtime options
   * @returns {Array} Check results
   */
  async runChecker(checker, options) {
    const timeout = options.timeout || this.options.timeout

    // Wrap in timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
    })

    let checkerPromise
    if (typeof checker.performChecks === 'function') {
      checkerPromise = checker.performChecks()
    } else if (typeof checker.detectSourcePath === 'function') {
      checkerPromise = checker.detectSourcePath().then(result => [result])
    } else {
      throw new Error(`Unknown checker type: ${checker.constructor.name}`)
    }

    const result = await Promise.race([checkerPromise, timeoutPromise])
    
    // Ensure result is an array
    return Array.isArray(result) ? result : [result]
  }

  /**
   * Create error check result for failed checker
   * @param {Object} checker - Failed checker
   * @param {Error} error - Error that occurred
   * @returns {Object} Error check result
   */
  createErrorCheck(checker, error) {
    return {
      id: `${checker.constructor.name.toLowerCase()}-error`,
      status: 'fail',
      message: `${checker.constructor.name} failed to execute`,
      details: [
        error.message,
        'This checker could not complete its safety verification'
      ],
      error: error.message
    }
  }

  /**
   * Evaluate all check results
   * @param {Array} checks - Array of check results
   * @returns {Object} Evaluation summary
   */
  evaluateResults(checks) {
    const failed = checks.filter(check => check.status === 'fail')
    const warnings = checks.filter(check => check.status === 'warn')
    const passed = checks.filter(check => check.status === 'pass')
    const info = checks.filter(check => check.status === 'info')

    return {
      canProceed: failed.length === 0,
      hasWarnings: warnings.length > 0,
      failedChecks: failed,
      warningChecks: warnings,
      passedChecks: passed,
      infoChecks: info,
      summary: {
        total: checks.length,
        passed: passed.length,
        failed: failed.length,
        warnings: warnings.length,
        info: info.length
      }
    }
  }

  /**
   * Setup checker dependencies
   * @private
   */
  setupDependencies() {
    // SourcePathDetector should run before other checkers that might need the source path
    // Git checks are independent
    // Destination checks are independent
    
    // For now, we'll keep it simple - no hard dependencies
    // All checkers can run in parallel
  }

  /**
   * Get checkers that can run independently
   * @returns {Array} Independent checker instances
   */
  getIndependentCheckers() {
    // All current checkers are independent
    return [...this.checkers]
  }

  /**
   * Get checkers that have dependencies
   * @returns {Array} Dependent checker instances
   */
  getDependentCheckers() {
    // No dependent checkers currently
    return []
  }

  /**
   * Check if cached results are still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    return this.lastRunResults &&
           this.cacheExpiry &&
           Date.now() < this.cacheExpiry &&
           this.options.cache
  }

  /**
   * Update cache with new results
   * @param {Object} results - Results to cache
   */
  updateCache(results) {
    this.lastRunResults = results
    this.cacheExpiry = Date.now() + this.cacheDuration
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.lastRunResults = null
    this.cacheExpiry = null
    this.runCache.clear()
    
    // Clear individual checker caches
    this.checkers.forEach(checker => {
      if (typeof checker.clearCache === 'function') {
        checker.clearCache()
      }
    })
  }

  /**
   * Get execution statistics
   * @returns {Object} Execution statistics
   */
  getExecutionStats() {
    if (this.executionHistory.length === 0) {
      return {
        totalRuns: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }

    const successCount = this.executionHistory.filter(run => run.canProceed).length
    const totalTime = this.executionHistory.reduce((sum, run) => sum + run.executionTime, 0)

    return {
      totalRuns: this.executionHistory.length,
      successCount,
      failureCount: this.executionHistory.length - successCount,
      successRate: (successCount / this.executionHistory.length) * 100,
      averageExecutionTime: totalTime / this.executionHistory.length,
      lastRun: this.executionHistory[this.executionHistory.length - 1]
    }
  }

  /**
   * Quick safety check - fast version for frequent use
   * @returns {Object} Quick check results
   */
  async quickCheck() {
    const options = {
      ...this.options,
      parallel: true,
      showProgress: false,
      skipPrompts: true,
      retryCount: 0,
      timeout: 5000
    }

    try {
      const results = await this.runAllChecks(options)
      return {
        safe: results.canProceed,
        hasWarnings: results.hasWarnings,
        criticalIssues: results.failedChecks.length,
        executionTime: results.executionTime
      }
    } catch (error) {
      return {
        safe: false,
        hasWarnings: true,
        criticalIssues: 1,
        error: error.message,
        executionTime: 0
      }
    }
  }

  /**
   * Pre-flight check - comprehensive check before important operations
   * @returns {Object} Pre-flight results
   */
  async preFlightCheck() {
    console.log(chalk.blue('🛫 Running pre-flight safety checks...\n'))
    
    const options = {
      ...this.options,
      parallel: true,
      showProgress: true,
      skipPrompts: false,
      retryCount: 2,
      cache: false // Force fresh check for pre-flight
    }

    const results = await this.runAllChecks(options)
    
    if (results.canProceed) {
      console.log(chalk.green('\n✅ Pre-flight checks passed - ready to proceed'))
    } else {
      console.log(chalk.red('\n❌ Pre-flight checks failed - operation cannot proceed safely'))
    }

    return results
  }

  /**
   * Get last run summary
   * @returns {Object|null} Last run summary or null if no runs
   */
  getLastRunSummary() {
    if (!this.lastRunResults) {
      return null
    }

    return {
      canProceed: this.lastRunResults.canProceed,
      hasWarnings: this.lastRunResults.hasWarnings,
      summary: this.lastRunResults.summary,
      executionTime: this.lastRunResults.executionTime,
      timestamp: this.lastRunResults.timestamp,
      fromCache: this.lastRunResults.fromCache || false
    }
  }

  /**
   * Add custom checker
   * @param {Object} checker - Custom checker instance
   */
  addChecker(checker) {
    if (!checker || typeof checker !== 'object') {
      throw new Error('Checker must be an object')
    }

    if (typeof checker.performChecks !== 'function' && 
        typeof checker.detectSourcePath !== 'function') {
      throw new Error('Checker must implement performChecks() or detectSourcePath()')
    }

    this.checkers.push(checker)
  }

  /**
   * Remove checker by constructor name
   * @param {string} checkerName - Name of checker class to remove
   */
  removeChecker(checkerName) {
    this.checkers = this.checkers.filter(
      checker => checker.constructor.name !== checkerName
    )
  }

  /**
   * Configure checker options
   * @param {string} checkerName - Name of checker class
   * @param {Object} options - Options to set
   */
  configureChecker(checkerName, options) {
    const checker = this.checkers.find(
      c => c.constructor.name === checkerName
    )

    if (checker && checker.options) {
      Object.assign(checker.options, options)
    }
  }

  /**
   * Reset all checkers to default state
   */
  reset() {
    this.clearCache()
    this.executionHistory = []
    this.resolver.clearHistory()
    
    // Reset checker states if they support it
    this.checkers.forEach(checker => {
      if (typeof checker.reset === 'function') {
        checker.reset()
      }
    })
  }
}

module.exports = SafetyCheckRunner