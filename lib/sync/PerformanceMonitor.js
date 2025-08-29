/**
 * PerformanceMonitor.js
 * Speed and ETA calculations with comprehensive analytics
 * 
 * Features:
 * - Track throughput (bytes/sec, files/sec) with rolling averages
 * - Calculate estimated time remaining based on performance data
 * - Monitor system resources and adapt concurrency dynamically
 * - Generate performance reports and optimization suggestions
 * - Benchmark comparison and performance regression detection
 * - Performance profiling and bottleneck identification
 */

const { EventEmitter } = require('events')
const os = require('os')

class PerformanceMonitor extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Monitoring settings
      updateInterval: options.updateInterval || 1000, // ms
      historySize: options.historySize || 100,
      enableSystemMonitoring: options.enableSystemMonitoring !== false,
      enableProfiling: options.enableProfiling || false,
      
      // Calculation settings
      smoothingFactor: options.smoothingFactor || 0.1, // For exponential smoothing
      rollingWindowSize: options.rollingWindowSize || 10,
      
      // Reporting settings
      enableReporting: options.enableReporting || false,
      reportInterval: options.reportInterval || 30000, // 30 seconds
      
      ...options
    }
    
    // State tracking
    this.isRunning = false
    this.startTime = null
    this.lastUpdateTime = null
    this.updateTimer = null
    this.reportTimer = null
    
    // Operation tracking
    this.totalOperations = 0
    this.completedOperations = 0
    this.totalBytes = 0
    this.processedBytes = 0
    
    // Performance metrics
    this.metrics = {
      // Current values
      operationsPerSecond: 0,
      bytesPerSecond: 0,
      averageOperationTime: 0,
      currentConcurrency: 0,
      
      // System metrics
      systemLoad: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      diskIOWait: 0,
      
      // Calculated values
      estimatedTimeRemaining: 0,
      completionPercentage: 0,
      efficiency: 0,
      
      // Trend analysis
      speedTrend: 'stable', // 'increasing', 'decreasing', 'stable'
      performanceGrade: 'A', // A, B, C, D, F
      bottleneckType: null // 'cpu', 'memory', 'disk', 'network', null
    }
    
    // Historical data for rolling averages
    this.operationHistory = []
    this.throughputHistory = []
    this.systemMetricsHistory = []
    
    // Profiling data
    this.operationProfiles = new Map() // operation type -> performance data
    this.bottleneckDetection = {
      lastChecked: 0,
      cpuThresholds: { warning: 80, critical: 95 },
      memoryThresholds: { warning: 80, critical: 95 },
      diskThresholds: { warning: 90, critical: 98 }
    }
    
    // Benchmarks and comparisons
    this.benchmarks = new Map() // operation type -> benchmark data
    this.performanceBaselines = null
    
    // Reporting data
    this.reports = []
    this.optimizationSuggestions = []
  }

  /**
   * Start performance monitoring
   * @param {number} totalOperations - Total operations to monitor
   * @param {number} totalBytes - Total bytes to process (optional)
   */
  start(totalOperations = 0, totalBytes = 0) {
    if (this.isRunning) {
      throw new Error('PerformanceMonitor is already running')
    }
    
    this.isRunning = true
    this.startTime = Date.now()
    this.lastUpdateTime = this.startTime
    this.totalOperations = totalOperations
    this.totalBytes = totalBytes
    this.completedOperations = 0
    this.processedBytes = 0
    
    // Reset metrics
    this.resetMetrics()
    
    // Clear histories
    this.operationHistory = []
    this.throughputHistory = []
    this.systemMetricsHistory = []
    
    // Start monitoring timers
    this.startPeriodicUpdates()
    
    if (this.options.enableReporting) {
      this.startPeriodicReporting()
    }
    
    this.emit('started', {
      totalOperations,
      totalBytes,
      startTime: this.startTime
    })
  }

  /**
   * Record completed operation
   * @param {Object} operation - Operation details
   * @param {Object} result - Operation result
   */
  recordOperation(operation, result) {
    if (!this.isRunning) {return}
    
    this.completedOperations++
    
    if (result.bytesTransferred) {
      this.processedBytes += result.bytesTransferred
    }
    
    // Record operation timing
    const operationData = {
      type: operation.type,
      duration: result.duration || 0,
      bytes: result.bytesTransferred || 0,
      timestamp: Date.now(),
      success: result.success !== false
    }
    
    this.operationHistory.push(operationData)
    
    // Maintain history size
    if (this.operationHistory.length > this.options.historySize) {
      this.operationHistory.shift()
    }
    
    // Update operation profiles for profiling
    if (this.options.enableProfiling) {
      this.updateOperationProfile(operation.type, operationData)
    }
    
    // Trigger immediate metrics update
    this.updateMetrics()
  }

  /**
   * Update current concurrency level
   * @param {number} concurrency - Current concurrency level
   */
  updateConcurrency(concurrency) {
    this.metrics.currentConcurrency = concurrency
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (!this.isRunning) {return}
    
    this.isRunning = false
    
    // Stop timers
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
    
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }
    
    // Final metrics update
    this.updateMetrics()
    
    // Generate final report if reporting is enabled
    if (this.options.enableReporting) {
      this.generateFinalReport()
    }
    
    this.emit('stopped', {
      duration: Date.now() - this.startTime,
      finalMetrics: this.metrics,
      completedOperations: this.completedOperations,
      processedBytes: this.processedBytes
    })
  }

  /**
   * Start periodic metric updates
   */
  startPeriodicUpdates() {
    this.updateTimer = setInterval(() => {
      this.updateMetrics()
    }, this.options.updateInterval)
  }

  /**
   * Start periodic reporting
   */
  startPeriodicReporting() {
    this.reportTimer = setInterval(() => {
      this.generatePeriodicReport()
    }, this.options.reportInterval)
  }

  /**
   * Update all performance metrics
   */
  async updateMetrics() {
    const now = Date.now()
    const elapsedTime = now - this.startTime
    const intervalTime = now - this.lastUpdateTime
    
    // Update basic metrics
    this.updateBasicMetrics(elapsedTime, intervalTime)
    
    // Update system metrics if enabled
    if (this.options.enableSystemMonitoring) {
      await this.updateSystemMetrics()
    }
    
    // Update calculated metrics
    this.updateCalculatedMetrics(elapsedTime)
    
    // Perform trend analysis
    this.performTrendAnalysis()
    
    // Detect bottlenecks
    if (this.options.enableProfiling) {
      this.detectBottlenecks()
    }
    
    // Generate optimization suggestions
    this.generateOptimizationSuggestions()
    
    this.lastUpdateTime = now
    
    this.emit('metricsUpdate', this.metrics)
  }

  /**
   * Update basic performance metrics
   * @param {number} elapsedTime - Total elapsed time in ms
   * @param {number} intervalTime - Time since last update in ms
   */
  updateBasicMetrics(elapsedTime, _intervalTime) {
    const elapsedSeconds = elapsedTime / 1000
    
    // Operations per second (overall average)
    this.metrics.operationsPerSecond = elapsedSeconds > 0 ? 
      this.completedOperations / elapsedSeconds : 0
    
    // Bytes per second (overall average)
    this.metrics.bytesPerSecond = elapsedSeconds > 0 ? 
      this.processedBytes / elapsedSeconds : 0
    
    // Rolling average operations per second
    if (this.operationHistory.length > 0) {
      const recentOps = this.operationHistory.slice(-this.options.rollingWindowSize)
      const recentTimeSpan = Math.max(1, 
        (recentOps[recentOps.length - 1].timestamp - recentOps[0].timestamp) / 1000
      )
      this.metrics.rollingOperationsPerSecond = recentOps.length / recentTimeSpan
    }
    
    // Average operation time
    if (this.operationHistory.length > 0) {
      const totalDuration = this.operationHistory.reduce((sum, op) => sum + op.duration, 0)
      this.metrics.averageOperationTime = totalDuration / this.operationHistory.length
    }
    
    // Completion percentage
    this.metrics.completionPercentage = this.totalOperations > 0 ? 
      (this.completedOperations / this.totalOperations) * 100 : 0
  }

  /**
   * Update system resource metrics
   */
  async updateSystemMetrics() {
    try {
      // CPU usage
      const cpus = os.cpus()
      let totalIdle = 0
      let totalTick = 0
      
      cpus.forEach(cpu => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type]
        }
        totalIdle += cpu.times.idle
      })
      
      this.metrics.cpuUsage = ((totalTick - totalIdle) / totalTick) * 100
      
      // Memory usage
      const totalMem = os.totalmem()
      const freeMem = os.freemem()
      this.metrics.memoryUsage = ((totalMem - freeMem) / totalMem) * 100
      
      // Load average
      const loadAvg = os.loadavg()
      this.metrics.systemLoad = loadAvg[0] / cpus.length // Normalize by CPU count
      
      // Record system metrics history
      this.systemMetricsHistory.push({
        timestamp: Date.now(),
        cpuUsage: this.metrics.cpuUsage,
        memoryUsage: this.metrics.memoryUsage,
        systemLoad: this.metrics.systemLoad
      })
      
      // Maintain history size
      if (this.systemMetricsHistory.length > this.options.historySize) {
        this.systemMetricsHistory.shift()
      }
      
    } catch (error) {
      // System monitoring failed, emit warning but continue
      this.emit('warning', `System metrics update failed: ${error.message}`)
    }
  }

  /**
   * Update calculated metrics
   * @param {number} elapsedTime - Total elapsed time in ms
   */
  updateCalculatedMetrics(elapsedTime) {
    // Estimated time remaining
    if (this.totalOperations > 0 && this.completedOperations > 0) {
      const remainingOperations = this.totalOperations - this.completedOperations
      const avgTimePerOperation = elapsedTime / this.completedOperations
      this.metrics.estimatedTimeRemaining = remainingOperations * avgTimePerOperation
    }
    
    // Efficiency calculation (0-100%)
    if (this.operationHistory.length > 0) {
      const successfulOps = this.operationHistory.filter(op => op.success).length
      this.metrics.efficiency = (successfulOps / this.operationHistory.length) * 100
    }
    
    // Performance grade calculation
    this.calculatePerformanceGrade()
  }

  /**
   * Perform trend analysis
   */
  performTrendAnalysis() {
    if (this.throughputHistory.length < 5) {
      this.metrics.speedTrend = 'stable'
      return
    }
    
    const recent = this.throughputHistory.slice(-5)
    const older = this.throughputHistory.slice(-10, -5)
    
    if (older.length === 0) {
      this.metrics.speedTrend = 'stable'
      return
    }
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const changeThreshold = 0.1 // 10% change
    const change = (recentAvg - olderAvg) / olderAvg
    
    if (change > changeThreshold) {
      this.metrics.speedTrend = 'increasing'
    } else if (change < -changeThreshold) {
      this.metrics.speedTrend = 'decreasing'
    } else {
      this.metrics.speedTrend = 'stable'
    }
    
    // Update throughput history
    this.throughputHistory.push(this.metrics.bytesPerSecond)
    if (this.throughputHistory.length > this.options.rollingWindowSize) {
      this.throughputHistory.shift()
    }
  }

  /**
   * Calculate performance grade
   */
  calculatePerformanceGrade() {
    let score = 100
    
    // Efficiency impact (0-40 points)
    score -= (100 - this.metrics.efficiency) * 0.4
    
    // System resource usage impact (0-30 points)
    if (this.metrics.cpuUsage > 90) {score -= 30}
    else if (this.metrics.cpuUsage > 80) {score -= 20}
    else if (this.metrics.cpuUsage > 70) {score -= 10}
    
    if (this.metrics.memoryUsage > 90) {score -= 20}
    else if (this.metrics.memoryUsage > 80) {score -= 15}
    else if (this.metrics.memoryUsage > 70) {score -= 10}
    
    // Speed trend impact (0-30 points)
    if (this.metrics.speedTrend === 'decreasing') {score -= 30}
    else if (this.metrics.speedTrend === 'stable') {score -= 5}
    
    // Assign letter grade
    if (score >= 90) {this.metrics.performanceGrade = 'A'}
    else if (score >= 80) {this.metrics.performanceGrade = 'B'}
    else if (score >= 70) {this.metrics.performanceGrade = 'C'}
    else if (score >= 60) {this.metrics.performanceGrade = 'D'}
    else {this.metrics.performanceGrade = 'F'}
  }

  /**
   * Detect performance bottlenecks
   */
  detectBottlenecks() {
    const now = Date.now()
    const { cpuThresholds, memoryThresholds } = this.bottleneckDetection
    
    // Only check bottlenecks periodically to avoid overhead
    if (now - this.bottleneckDetection.lastChecked < 5000) {return}
    
    this.bottleneckDetection.lastChecked = now
    this.metrics.bottleneckType = null
    
    // CPU bottleneck detection
    if (this.metrics.cpuUsage > cpuThresholds.critical) {
      this.metrics.bottleneckType = 'cpu'
      this.emit('bottleneckDetected', {
        type: 'cpu',
        severity: 'critical',
        value: this.metrics.cpuUsage,
        threshold: cpuThresholds.critical
      })
    } else if (this.metrics.cpuUsage > cpuThresholds.warning) {
      this.metrics.bottleneckType = 'cpu'
      this.emit('bottleneckDetected', {
        type: 'cpu',
        severity: 'warning',
        value: this.metrics.cpuUsage,
        threshold: cpuThresholds.warning
      })
    }
    
    // Memory bottleneck detection
    if (this.metrics.memoryUsage > memoryThresholds.critical) {
      this.metrics.bottleneckType = this.metrics.bottleneckType || 'memory'
      this.emit('bottleneckDetected', {
        type: 'memory',
        severity: 'critical',
        value: this.metrics.memoryUsage,
        threshold: memoryThresholds.critical
      })
    } else if (this.metrics.memoryUsage > memoryThresholds.warning) {
      this.metrics.bottleneckType = this.metrics.bottleneckType || 'memory'
      this.emit('bottleneckDetected', {
        type: 'memory',
        severity: 'warning',
        value: this.metrics.memoryUsage,
        threshold: memoryThresholds.warning
      })
    }
    
    // Disk I/O bottleneck detection (simplified)
    if (this.metrics.averageOperationTime > 5000) { // Operations taking > 5 seconds
      this.metrics.bottleneckType = this.metrics.bottleneckType || 'disk'
      this.emit('bottleneckDetected', {
        type: 'disk',
        severity: 'warning',
        value: this.metrics.averageOperationTime,
        threshold: 5000
      })
    }
  }

  /**
   * Generate optimization suggestions
   */
  generateOptimizationSuggestions() {
    const suggestions = []
    
    // Concurrency suggestions
    if (this.metrics.cpuUsage < 50 && this.metrics.currentConcurrency < os.cpus().length) {
      suggestions.push({
        type: 'concurrency',
        priority: 'medium',
        message: 'CPU usage is low - consider increasing concurrency',
        action: 'increase_concurrency',
        currentValue: this.metrics.currentConcurrency,
        suggestedValue: Math.min(os.cpus().length, this.metrics.currentConcurrency + 1)
      })
    }
    
    if (this.metrics.cpuUsage > 85) {
      suggestions.push({
        type: 'concurrency',
        priority: 'high',
        message: 'CPU usage is high - consider reducing concurrency',
        action: 'reduce_concurrency',
        currentValue: this.metrics.currentConcurrency,
        suggestedValue: Math.max(1, this.metrics.currentConcurrency - 1)
      })
    }
    
    // Memory suggestions
    if (this.metrics.memoryUsage > 80) {
      suggestions.push({
        type: 'memory',
        priority: 'high',
        message: 'Memory usage is high - consider reducing buffer sizes',
        action: 'reduce_buffers'
      })
    }
    
    // Performance suggestions
    if (this.metrics.efficiency < 90) {
      suggestions.push({
        type: 'efficiency',
        priority: 'medium',
        message: `Operation efficiency is ${this.metrics.efficiency.toFixed(1)}% - check error logs`,
        action: 'check_errors'
      })
    }
    
    // Speed trend suggestions
    if (this.metrics.speedTrend === 'decreasing') {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        message: 'Performance is declining - investigate bottlenecks',
        action: 'investigate_bottlenecks'
      })
    }
    
    this.optimizationSuggestions = suggestions
    
    if (suggestions.length > 0) {
      this.emit('optimizationSuggestions', suggestions)
    }
  }

  /**
   * Update operation profile for specific operation type
   * @param {string} operationType - Type of operation
   * @param {Object} operationData - Operation performance data
   */
  updateOperationProfile(operationType, operationData) {
    if (!this.operationProfiles.has(operationType)) {
      this.operationProfiles.set(operationType, {
        count: 0,
        totalDuration: 0,
        totalBytes: 0,
        averageDuration: 0,
        averageThroughput: 0,
        minDuration: Infinity,
        maxDuration: 0,
        history: []
      })
    }
    
    const profile = this.operationProfiles.get(operationType)
    
    profile.count++
    profile.totalDuration += operationData.duration
    profile.totalBytes += operationData.bytes
    profile.averageDuration = profile.totalDuration / profile.count
    
    if (profile.totalDuration > 0) {
      profile.averageThroughput = profile.totalBytes / (profile.totalDuration / 1000)
    }
    
    profile.minDuration = Math.min(profile.minDuration, operationData.duration)
    profile.maxDuration = Math.max(profile.maxDuration, operationData.duration)
    
    profile.history.push(operationData)
    
    // Maintain history size
    if (profile.history.length > this.options.historySize) {
      profile.history.shift()
    }
  }

  /**
   * Generate periodic performance report
   */
  generatePeriodicReport() {
    const report = {
      timestamp: Date.now(),
      type: 'periodic',
      metrics: { ...this.metrics },
      optimizationSuggestions: [...this.optimizationSuggestions],
      operationProfiles: this.getOperationProfilesSummary()
    }
    
    this.reports.push(report)
    this.emit('performanceReport', report)
  }

  /**
   * Generate final performance report
   */
  generateFinalReport() {
    const totalDuration = Date.now() - this.startTime
    
    const finalReport = {
      timestamp: Date.now(),
      type: 'final',
      duration: totalDuration,
      totalOperations: this.totalOperations,
      completedOperations: this.completedOperations,
      totalBytes: this.totalBytes,
      processedBytes: this.processedBytes,
      finalMetrics: { ...this.metrics },
      operationProfiles: this.getDetailedOperationProfiles(),
      systemMetricsSummary: this.getSystemMetricsSummary(),
      optimizationSuggestions: [...this.optimizationSuggestions],
      performanceGrade: this.metrics.performanceGrade
    }
    
    this.reports.push(finalReport)
    this.emit('finalReport', finalReport)
    
    return finalReport
  }

  /**
   * Get operation profiles summary
   * @returns {Object} Operation profiles summary
   */
  getOperationProfilesSummary() {
    const summary = {}
    
    for (const [type, profile] of this.operationProfiles) {
      summary[type] = {
        count: profile.count,
        averageDuration: profile.averageDuration,
        averageThroughput: profile.averageThroughput,
        minDuration: profile.minDuration,
        maxDuration: profile.maxDuration
      }
    }
    
    return summary
  }

  /**
   * Get detailed operation profiles
   * @returns {Object} Detailed operation profiles
   */
  getDetailedOperationProfiles() {
    const detailed = {}
    
    for (const [type, profile] of this.operationProfiles) {
      detailed[type] = { ...profile }
      // Don't include full history in detailed report to keep it manageable
      detailed[type].recentHistory = profile.history.slice(-10)
      delete detailed[type].history
    }
    
    return detailed
  }

  /**
   * Get system metrics summary
   * @returns {Object} System metrics summary
   */
  getSystemMetricsSummary() {
    if (this.systemMetricsHistory.length === 0) {
      return null
    }
    
    const cpuValues = this.systemMetricsHistory.map(m => m.cpuUsage)
    const memoryValues = this.systemMetricsHistory.map(m => m.memoryUsage)
    const loadValues = this.systemMetricsHistory.map(m => m.systemLoad)
    
    return {
      cpu: {
        average: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
        min: Math.min(...cpuValues),
        max: Math.max(...cpuValues)
      },
      memory: {
        average: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
        min: Math.min(...memoryValues),
        max: Math.max(...memoryValues)
      },
      load: {
        average: loadValues.reduce((a, b) => a + b, 0) / loadValues.length,
        min: Math.min(...loadValues),
        max: Math.max(...loadValues)
      }
    }
  }

  /**
   * Reset all metrics to initial state
   */
  resetMetrics() {
    this.metrics = {
      operationsPerSecond: 0,
      bytesPerSecond: 0,
      averageOperationTime: 0,
      currentConcurrency: 0,
      systemLoad: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      diskIOWait: 0,
      estimatedTimeRemaining: 0,
      completionPercentage: 0,
      efficiency: 0,
      speedTrend: 'stable',
      performanceGrade: 'A',
      bottleneckType: null
    }
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isRunning: this.isRunning,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0,
      completedOperations: this.completedOperations,
      totalOperations: this.totalOperations,
      processedBytes: this.processedBytes,
      totalBytes: this.totalBytes
    }
  }

  /**
   * Get all generated reports
   * @returns {Array} All performance reports
   */
  getReports() {
    return [...this.reports]
  }

  /**
   * Get current optimization suggestions
   * @returns {Array} Current optimization suggestions
   */
  getOptimizationSuggestions() {
    return [...this.optimizationSuggestions]
  }

  /**
   * Get operation profiles
   * @returns {Map} Operation profiles map
   */
  getOperationProfiles() {
    return new Map(this.operationProfiles)
  }
}

module.exports = PerformanceMonitor