/**
 * PerformanceBenchmark.js
 * Benchmark testing and performance monitoring for the Lerian Protocol
 * 
 * Features:
 * - Performance benchmarking for change detection operations
 * - Memory usage monitoring and profiling
 * - Detailed timing analysis for optimization
 * - Performance regression detection
 * - Automated benchmark reporting
 */

const os = require('os')
const fs = require('fs').promises
const { EventEmitter } = require('events')

class PerformanceBenchmark extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Benchmark configuration
      iterations: options.iterations || 3,
      warmupIterations: options.warmupIterations || 1,
      collectDetailedStats: options.collectDetailedStats !== false,
      
      // Memory monitoring
      enableMemoryMonitoring: options.enableMemoryMonitoring !== false,
      memorySnapshotInterval: options.memorySnapshotInterval || 1000, // 1 second
      
      // Performance thresholds
      maxAcceptableTime: options.maxAcceptableTime || 10000, // 10 seconds
      maxAcceptableMemory: options.maxAcceptableMemory || 512 * 1024 * 1024, // 512MB
      
      // Reporting
      generateReport: options.generateReport !== false,
      reportPath: options.reportPath || './performance-report.json',
      
      ...options
    }
    
    this.results = {
      benchmarks: [],
      systemInfo: this.getSystemInfo(),
      timestamp: Date.now()
    }
    
    this.currentBenchmark = null
    this.memorySnapshots = []
    this.monitoringInterval = null
  }

  /**
   * Run a comprehensive benchmark suite
   */
  async runBenchmarkSuite(testCases) {
    console.log('🚀 Starting performance benchmark suite...')
    console.log(`System: ${this.results.systemInfo.platform} ${this.results.systemInfo.arch}`)
    console.log(`Node.js: ${this.results.systemInfo.nodeVersion}`)
    console.log(`Memory: ${Math.round(this.results.systemInfo.totalMemory / 1024 / 1024)}MB`)
    console.log('')
    
    try {
      for (const testCase of testCases) {
        console.log(`📊 Benchmarking: ${testCase.name}`)
        const result = await this.benchmark(testCase.name, testCase.operation, testCase.setup)
        
        this.results.benchmarks.push(result)
        this.emit('benchmarkComplete', result)
        
        // Brief pause between benchmarks
        await this.sleep(500)
      }
      
      const summary = this.generateSummary()
      console.log('\n' + '='.repeat(60))
      console.log('📈 BENCHMARK SUMMARY')
      console.log('='.repeat(60))
      
      this.printSummary(summary)
      
      if (this.options.generateReport) {
        await this.saveReport()
      }
      
      return {
        results: this.results,
        summary
      }

    } catch (error) {
      console.error('❌ Benchmark suite failed:', error.message)
      throw error
    }
  }

  /**
   * Benchmark a single operation
   */
  async benchmark(name, operation, setup = null) {
    this.currentBenchmark = {
      name,
      startTime: Date.now(),
      iterations: [],
      errors: []
    }
    
    console.log(`  ⏳ Running ${this.options.iterations} iterations (with ${this.options.warmupIterations} warmup)...`)
    
    try {
      // Setup phase
      let setupResult = null
      if (setup) {
        console.log('  🔧 Running setup...')
        setupResult = await setup()
      }
      
      // Start memory monitoring
      if (this.options.enableMemoryMonitoring) {
        this.startMemoryMonitoring()
      }
      
      // Warmup iterations (not counted in results)
      for (let i = 0; i < this.options.warmupIterations; i++) {
        try {
          await operation(setupResult)
          // Force garbage collection if available
          if (global.gc) {
            global.gc()
          }
        } catch (error) {
          console.warn(`  ⚠️  Warmup iteration ${i + 1} failed: ${error.message}`)
        }
      }
      
      // Actual benchmark iterations
      for (let i = 0; i < this.options.iterations; i++) {
        const iterationStart = process.hrtime.bigint()
        const memoryBefore = process.memoryUsage()
        
        let iterationResult = null
        
        try {
          iterationResult = await operation(setupResult)
          
          const iterationEnd = process.hrtime.bigint()
          const memoryAfter = process.memoryUsage()
          const duration = Number(iterationEnd - iterationStart) / 1e6 // Convert to milliseconds
          
          const iteration = {
            index: i + 1,
            duration,
            memory: {
              before: memoryBefore,
              after: memoryAfter,
              delta: {
                rss: memoryAfter.rss - memoryBefore.rss,
                heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
                heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
                external: memoryAfter.external - memoryBefore.external
              }
            },
            result: this.options.collectDetailedStats ? iterationResult : null
          }
          
          this.currentBenchmark.iterations.push(iteration)
          
          console.log(`  ✅ Iteration ${i + 1}: ${duration.toFixed(2)}ms (${this.formatBytes(memoryAfter.heapUsed)} heap)`)
          
        } catch (error) {
          this.currentBenchmark.errors.push({
            iteration: i + 1,
            error: error.message,
            stack: error.stack
          })
          
          console.log(`  ❌ Iteration ${i + 1}: Error - ${error.message}`)
        }
        
        // Force garbage collection between iterations if available
        if (global.gc) {
          global.gc()
        }
        
        // Small delay between iterations
        await this.sleep(100)
      }
      
      // Stop memory monitoring
      if (this.options.enableMemoryMonitoring) {
        this.stopMemoryMonitoring()
      }
      
      // Analyze results
      const analysis = this.analyzeBenchmarkResults(this.currentBenchmark)
      
      console.log(`  📊 Average: ${analysis.timing.average.toFixed(2)}ms`)
      console.log(`  📊 Min/Max: ${analysis.timing.min.toFixed(2)}ms / ${analysis.timing.max.toFixed(2)}ms`)
      console.log(`  📊 Memory: ${this.formatBytes(analysis.memory.averageHeapUsed)}`)
      
      const result = {
        ...this.currentBenchmark,
        analysis,
        memorySnapshots: [...this.memorySnapshots],
        endTime: Date.now()
      }
      
      this.memorySnapshots = [] // Clear for next benchmark
      
      return result

    } catch (error) {
      console.error(`  ❌ Benchmark '${name}' failed: ${error.message}`)
      throw error
    } finally {
      this.currentBenchmark = null
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval)
        this.monitoringInterval = null
      }
    }
  }

  /**
   * Analyze benchmark results and generate statistics
   */
  analyzeBenchmarkResults(benchmark) {
    const validIterations = benchmark.iterations.filter(i => !isNaN(i.duration))
    
    if (validIterations.length === 0) {
      return {
        timing: { average: 0, min: 0, max: 0, median: 0, stdDev: 0 },
        memory: { averageHeapUsed: 0, peakHeapUsed: 0, averageDelta: 0 },
        reliability: { successRate: 0, errorCount: benchmark.errors.length }
      }
    }
    
    // Timing analysis
    const durations = validIterations.map(i => i.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const median = this.calculateMedian(durations)
    const stdDev = this.calculateStandardDeviation(durations, average)
    
    // Memory analysis
    const heapUsedValues = validIterations.map(i => i.memory.after.heapUsed)
    const heapDeltas = validIterations.map(i => i.memory.delta.heapUsed)
    const averageHeapUsed = heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length
    const peakHeapUsed = Math.max(...heapUsedValues)
    const averageDelta = heapDeltas.reduce((a, b) => a + b, 0) / heapDeltas.length
    
    // Reliability analysis
    const totalIterations = this.options.iterations
    const successfulIterations = validIterations.length
    const successRate = successfulIterations / totalIterations
    
    return {
      timing: { average, min, max, median, stdDev },
      memory: { averageHeapUsed, peakHeapUsed, averageDelta },
      reliability: { successRate, errorCount: benchmark.errors.length }
    }
  }

  /**
   * Start memory monitoring during benchmark
   */
  startMemoryMonitoring() {
    this.memorySnapshots = []
    this.monitoringInterval = setInterval(() => {
      const usage = process.memoryUsage()
      this.memorySnapshots.push({
        timestamp: Date.now(),
        ...usage
      })
    }, this.options.memorySnapshotInterval)
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * Generate summary of all benchmarks
   */
  generateSummary() {
    const summary = {
      totalBenchmarks: this.results.benchmarks.length,
      totalTime: this.results.benchmarks.reduce((total, b) => total + (b.endTime - b.startTime), 0),
      performance: {},
      recommendations: []
    }
    
    // Performance analysis
    for (const benchmark of this.results.benchmarks) {
      const analysis = benchmark.analysis
      summary.performance[benchmark.name] = {
        averageTime: analysis.timing.average,
        reliability: analysis.reliability.successRate,
        memoryUsage: analysis.memory.averageHeapUsed,
        status: this.getPerformanceStatus(analysis)
      }
    }
    
    // Generate recommendations
    summary.recommendations = this.generateRecommendations()
    
    return summary
  }

  /**
   * Get performance status based on thresholds
   */
  getPerformanceStatus(analysis) {
    if (analysis.reliability.successRate < 0.9) {
      return 'poor'
    }
    
    if (analysis.timing.average > this.options.maxAcceptableTime) {
      return 'slow'
    }
    
    if (analysis.memory.averageHeapUsed > this.options.maxAcceptableMemory) {
      return 'memory-heavy'
    }
    
    if (analysis.timing.stdDev > analysis.timing.average * 0.5) {
      return 'inconsistent'
    }
    
    return 'good'
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = []
    
    for (const benchmark of this.results.benchmarks) {
      const analysis = benchmark.analysis
      const name = benchmark.name
      
      if (analysis.reliability.successRate < 0.9) {
        recommendations.push({
          type: 'reliability',
          benchmark: name,
          message: `${name} has low success rate (${(analysis.reliability.successRate * 100).toFixed(1)}%). Consider error handling improvements.`
        })
      }
      
      if (analysis.timing.average > this.options.maxAcceptableTime) {
        recommendations.push({
          type: 'performance',
          benchmark: name,
          message: `${name} is slow (${analysis.timing.average.toFixed(2)}ms average). Consider optimization.`
        })
      }
      
      if (analysis.memory.averageHeapUsed > this.options.maxAcceptableMemory) {
        recommendations.push({
          type: 'memory',
          benchmark: name,
          message: `${name} uses too much memory (${this.formatBytes(analysis.memory.averageHeapUsed)}). Consider memory optimization.`
        })
      }
      
      if (analysis.timing.stdDev > analysis.timing.average * 0.3) {
        recommendations.push({
          type: 'consistency',
          benchmark: name,
          message: `${name} has inconsistent performance (stddev: ${analysis.timing.stdDev.toFixed(2)}ms). Consider caching or optimization.`
        })
      }
      
      if (analysis.memory.averageDelta > 50 * 1024 * 1024) { // 50MB
        recommendations.push({
          type: 'memory-leak',
          benchmark: name,
          message: `${name} may have memory leaks (${this.formatBytes(analysis.memory.averageDelta)} average increase). Consider memory management.`
        })
      }
    }
    
    return recommendations
  }

  /**
   * Print summary to console
   */
  printSummary(summary) {
    console.log(`Total benchmarks: ${summary.totalBenchmarks}`)
    console.log(`Total time: ${(summary.totalTime / 1000).toFixed(2)}s`)
    console.log('')
    
    console.log('Performance Results:')
    for (const [name, perf] of Object.entries(summary.performance)) {
      const status = this.getStatusIcon(perf.status)
      console.log(`  ${status} ${name}:`)
      console.log(`     Time: ${perf.averageTime.toFixed(2)}ms`)
      console.log(`     Success: ${(perf.reliability * 100).toFixed(1)}%`)
      console.log(`     Memory: ${this.formatBytes(perf.memoryUsage)}`)
    }
    
    if (summary.recommendations.length > 0) {
      console.log('\nRecommendations:')
      for (const rec of summary.recommendations) {
        console.log(`  🔍 ${rec.message}`)
      }
    } else {
      console.log('\n✨ All benchmarks performed within acceptable parameters!')
    }
  }

  /**
   * Get status icon for display
   */
  getStatusIcon(status) {
    const icons = {
      good: '✅',
      slow: '🐌',
      'memory-heavy': '🧠',
      inconsistent: '📊',
      poor: '❌'
    }
    return icons[status] || '❓'
  }

  /**
   * Save benchmark report to file
   */
  async saveReport() {
    try {
      const reportData = {
        ...this.results,
        summary: this.generateSummary(),
        generatedAt: new Date().toISOString()
      }
      
      await fs.writeFile(
        this.options.reportPath,
        JSON.stringify(reportData, null, 2),
        'utf8'
      )
      
      console.log(`\n📄 Performance report saved to: ${this.options.reportPath}`)
      
    } catch (error) {
      console.error('Failed to save performance report:', error.message)
    }
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      hostname: os.hostname(),
      uptime: os.uptime()
    }
  }

  /**
   * Calculate median of an array
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values, mean) {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * Format bytes for human readable display
   */
  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Create a standardized test case factory
   */
  static createTestCase(name, operation, setup = null, options = {}) {
    return {
      name,
      operation,
      setup,
      options
    }
  }

  /**
   * Create benchmark test cases for change detection components
   */
  static createChangeDetectionBenchmarks(sourcePath, destPath) {
    const ChangeDetector = require('../detection/ChangeDetector')
    const FileSystemUtils = require('./FileSystemUtils')
    const ChangeClassifier = require('../detection/ChangeClassifier')
    
    return [
      // File system utilities benchmark
      this.createTestCase(
        'FileSystemUtils.traverseDirectory',
        async () => {
          const fsUtils = new FileSystemUtils()
          return await fsUtils.traverseDirectory(sourcePath, {
            recursive: true,
            maxConcurrency: 5
          })
        }
      ),
      
      // Change detection benchmark
      this.createTestCase(
        'ChangeDetector.detectChanges',
        async () => {
          const detector = new ChangeDetector(sourcePath, destPath, {
            compareContent: false,
            maxConcurrency: 5
          })
          return await detector.detectChanges()
        }
      ),
      
      // Change detection with content comparison
      this.createTestCase(
        'ChangeDetector.detectChanges (with content)',
        async () => {
          const detector = new ChangeDetector(sourcePath, destPath, {
            compareContent: true,
            maxConcurrency: 5
          })
          return await detector.detectChanges()
        }
      ),
      
      // Change classification benchmark
      this.createTestCase(
        'ChangeClassifier.classifyChanges',
        async () => {
          const detector = new ChangeDetector(sourcePath, destPath)
          const result = await detector.detectChanges()
          
          const classifier = new ChangeClassifier({
            enableRenameDetection: true
          })
          
          return await classifier.classifyChanges(result.changes)
        }
      )
    ]
  }
}

module.exports = PerformanceBenchmark