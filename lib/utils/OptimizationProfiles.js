/**
 * OptimizationProfiles.js
 * Optimization profiles for common use cases in the Lerian Protocol
 * 
 * Features:
 * - Predefined optimization profiles for different project types
 * - Smart configuration based on directory structure analysis
 * - Performance tuning recommendations
 * - Adaptive settings based on system resources
 */

const os = require('os')
const path = require('path')
const { logger } = require('./logger')

class OptimizationProfiles {
  constructor() {
    this.systemInfo = this.getSystemInfo()
    
    // Base profiles for different project types
    this.profiles = {
      // Small personal projects
      small: {
        name: 'Small Project',
        description: 'Optimized for personal projects with < 100 files',
        criteria: {
          maxFiles: 100,
          maxSizeMB: 10
        },
        settings: {
          maxConcurrency: 3,
          enableProgressReporting: false,
          compareContent: true,
          enableCaching: true,
          cacheValidityMs: 60000, // 1 minute
          maxFileSize: 10 * 1024 * 1024, // 10MB
          streamChunkSize: 32 * 1024, // 32KB
          binarySampleSize: 512,
          enableWorkerThreads: false,
          mtimeToleranceMs: 1000
        }
      },
      
      // Medium development projects
      medium: {
        name: 'Medium Project',
        description: 'Optimized for development projects with 100-500 files',
        criteria: {
          maxFiles: 500,
          maxSizeMB: 100
        },
        settings: {
          maxConcurrency: Math.min(6, Math.max(2, Math.floor(os.cpus().length / 2))),
          enableProgressReporting: true,
          progressReportInterval: 50,
          compareContent: true,
          enableCaching: true,
          cacheValidityMs: 300000, // 5 minutes
          maxFileSize: 50 * 1024 * 1024, // 50MB
          streamChunkSize: 64 * 1024, // 64KB
          binarySampleSize: 1024,
          enableWorkerThreads: true,
          mtimeToleranceMs: 2000
        }
      },
      
      // Large enterprise projects
      large: {
        name: 'Large Project',
        description: 'Optimized for large projects with 500-2000 files',
        criteria: {
          maxFiles: 2000,
          maxSizeMB: 500
        },
        settings: {
          maxConcurrency: Math.min(12, os.cpus().length),
          enableProgressReporting: true,
          progressReportInterval: 100,
          compareContent: false, // Skip content comparison for speed
          enableCaching: true,
          cacheValidityMs: 600000, // 10 minutes
          maxFileSize: 100 * 1024 * 1024, // 100MB
          streamChunkSize: 128 * 1024, // 128KB
          binarySampleSize: 2048,
          enableWorkerThreads: true,
          mtimeToleranceMs: 5000,
          largeBinaryThreshold: 5 * 1024 * 1024 // 5MB
        }
      },
      
      // Very large monorepos
      enterprise: {
        name: 'Enterprise/Monorepo',
        description: 'Optimized for very large codebases with 2000+ files',
        criteria: {
          maxFiles: Infinity,
          maxSizeMB: Infinity
        },
        settings: {
          maxConcurrency: os.cpus().length,
          enableProgressReporting: true,
          progressReportInterval: 200,
          compareContent: false,
          enableCaching: true,
          cacheValidityMs: 1800000, // 30 minutes
          maxFileSize: 200 * 1024 * 1024, // 200MB
          streamChunkSize: 256 * 1024, // 256KB
          binarySampleSize: 4096,
          enableWorkerThreads: true,
          mtimeToleranceMs: 10000,
          largeBinaryThreshold: 1 * 1024 * 1024, // 1MB
          // Additional optimizations
          excludePatterns: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '*.log',
            '.cache/**',
            '.tmp/**',
            '**/*.min.js',
            '**/*.min.css'
          ]
        }
      },
      
      // Fast/preview mode
      fast: {
        name: 'Fast Preview',
        description: 'Quick scan with minimal accuracy for previews',
        criteria: {
          maxFiles: Infinity,
          maxSizeMB: Infinity
        },
        settings: {
          maxConcurrency: os.cpus().length,
          enableProgressReporting: false,
          compareContent: false,
          enableCaching: true,
          cacheValidityMs: 30000, // 30 seconds
          maxFileSize: 1 * 1024 * 1024, // 1MB max
          streamChunkSize: 16 * 1024, // 16KB
          binarySampleSize: 256,
          enableWorkerThreads: false,
          mtimeToleranceMs: 30000, // 30 seconds tolerance
          excludePatterns: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'test/**',
            'tests/**',
            '*.test.*',
            '*.spec.*',
            '*.log'
          ]
        }
      },
      
      // Memory constrained environments
      lowMemory: {
        name: 'Low Memory',
        description: 'Optimized for systems with limited memory',
        criteria: {
          maxMemoryMB: 512
        },
        settings: {
          maxConcurrency: 2,
          enableProgressReporting: true,
          progressReportInterval: 25,
          compareContent: false,
          enableCaching: false, // Disable caching to save memory
          maxFileSize: 5 * 1024 * 1024, // 5MB
          streamChunkSize: 16 * 1024, // 16KB
          binarySampleSize: 256,
          enableWorkerThreads: false,
          mtimeToleranceMs: 5000
        }
      }
    }
    
    // File type specific optimizations
    this.fileTypeOptimizations = {
      // JavaScript/TypeScript projects
      javascript: {
        excludePatterns: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '*.min.js',
          '*.bundle.js',
          'coverage/**'
        ],
        priorityPatterns: [
          'package.json',
          '*.js',
          '*.ts',
          '*.jsx',
          '*.tsx',
          '*.json'
        ]
      },
      
      // Python projects
      python: {
        excludePatterns: [
          '__pycache__/**',
          '*.pyc',
          'venv/**',
          'env/**',
          '.pytest_cache/**',
          'dist/**',
          'build/**',
          '*.egg-info/**'
        ],
        priorityPatterns: [
          'requirements.txt',
          'setup.py',
          '*.py',
          '*.pyx'
        ]
      },
      
      // Documentation projects
      documentation: {
        excludePatterns: [
          '_site/**',
          '.jekyll-cache/**',
          'node_modules/**'
        ],
        priorityPatterns: [
          '*.md',
          '*.rst',
          '*.txt',
          '_config.yml',
          'mkdocs.yml'
        ],
        settings: {
          compareContent: true, // Important for docs
          enableCaching: true
        }
      }
    }
  }

  /**
   * Auto-select the best optimization profile
   */
  async autoSelectProfile(sourcePath, options = {}) {
    try {
      const analysis = await this.analyzeDirectory(sourcePath)
      const systemConstraints = this.analyzeSystemConstraints()
      
      // Check for system constraints first
      if (systemConstraints.isMemoryConstrained) {
        return this.getProfile('lowMemory', analysis)
      }
      
      // Check for fast mode request
      if (options.fastMode) {
        return this.getProfile('fast', analysis)
      }
      
      // Select based on project size
      const profile = this.selectProfileBySize(analysis)
      const enhanced = this.enhanceProfileWithFileTypes(profile, analysis)
      
      logger.info(`🚀 Selected optimization profile: ${enhanced.name}`)
      logger.info(`📊 Project analysis: ${analysis.fileCount} files, ${this.formatBytes(analysis.totalSize)}`)
      
      return enhanced

    } catch (error) {
      logger.warn(`Profile auto-selection failed, using medium profile: ${error.message}`)
      return this.getProfile('medium')
    }
  }

  /**
   * Analyze directory structure to determine optimal profile
   */
  async analyzeDirectory(dirPath) {
    const FileSystemUtils = require('./FileSystemUtils')
    const fsUtils = new FileSystemUtils()
    
    const analysis = {
      fileCount: 0,
      totalSize: 0,
      fileTypes: new Map(),
      directoryStructure: new Set(),
      largeFiles: 0,
      binaryFiles: 0,
      detectedProjectType: null
    }
    
    try {
      // Quick scan to get basic metrics
      const files = await fsUtils.traverseDirectory(dirPath, {
        recursive: true,
        maxConcurrency: 4,
        filter: (fileName, filePath) => {
          // Quick exclusion of obviously large/unwanted directories
          return !filePath.includes('node_modules') && 
                 !filePath.includes('.git') &&
                 !filePath.includes('dist') &&
                 !filePath.includes('build')
        }
      })
      
      // Analyze first 1000 files for performance
      const sampleFiles = files.slice(0, 1000)
      
      for (const file of sampleFiles) {
        try {
          const metadata = await fsUtils.getFileMetadata(file.fullPath)
          
          analysis.fileCount++
          analysis.totalSize += metadata.size
          
          // Track file types
          const ext = path.extname(file.name).toLowerCase()
          analysis.fileTypes.set(ext, (analysis.fileTypes.get(ext) || 0) + 1)
          
          // Track directory structure
          analysis.directoryStructure.add(path.dirname(file.path))
          
          // Count large files
          if (metadata.size > 10 * 1024 * 1024) { // 10MB
            analysis.largeFiles++
          }
          
          // Count binary files
          if (metadata.isBinary) {
            analysis.binaryFiles++
          }
          
        } catch {
          // Skip files that can't be analyzed
          continue
        }
      }
      
      // If we sampled, extrapolate the total
      if (files.length > sampleFiles.length) {
        const samplingRatio = files.length / sampleFiles.length
        analysis.fileCount = Math.round(analysis.fileCount * samplingRatio)
        analysis.totalSize = Math.round(analysis.totalSize * samplingRatio)
        analysis.largeFiles = Math.round(analysis.largeFiles * samplingRatio)
        analysis.binaryFiles = Math.round(analysis.binaryFiles * samplingRatio)
      }
      
      // Detect project type
      analysis.detectedProjectType = this.detectProjectType(analysis.fileTypes, analysis.directoryStructure)
      
    } catch (error) {
      logger.warn(`Directory analysis failed: ${error.message}`)
      // Return minimal analysis
      analysis.fileCount = 100
      analysis.totalSize = 10 * 1024 * 1024
    }
    
    return analysis
  }

  /**
   * Detect project type based on file patterns
   */
  detectProjectType(fileTypes, directoryStructure) {
    const jsFiles = (fileTypes.get('.js') || 0) + (fileTypes.get('.ts') || 0)
    const pyFiles = fileTypes.get('.py') || 0
    const mdFiles = fileTypes.get('.md') || 0
    const totalFiles = Array.from(fileTypes.values()).reduce((a, b) => a + b, 0)
    
    // Check for Node.js project
    if (directoryStructure.has('node_modules') || fileTypes.has('.json')) {
      return 'javascript'
    }
    
    // Check for Python project
    if (pyFiles > totalFiles * 0.3) {
      return 'python'
    }
    
    // Check for documentation project
    if (mdFiles > totalFiles * 0.5) {
      return 'documentation'
    }
    
    // Check for JavaScript/TypeScript
    if (jsFiles > totalFiles * 0.3) {
      return 'javascript'
    }
    
    return null
  }

  /**
   * Analyze system constraints
   */
  analyzeSystemConstraints() {
    const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024)
    const freeMemoryMB = Math.round(os.freemem() / 1024 / 1024)
    const cpuCount = os.cpus().length
    
    return {
      totalMemoryMB,
      freeMemoryMB,
      cpuCount,
      isMemoryConstrained: totalMemoryMB < 1024 || freeMemoryMB < 256,
      isCpuConstrained: cpuCount < 2,
      loadAverage: os.loadavg()[0] // 1-minute load average
    }
  }

  /**
   * Select profile based on project size
   */
  selectProfileBySize(analysis) {
    const sizeMB = analysis.totalSize / (1024 * 1024)
    
    if (analysis.fileCount <= 100 && sizeMB <= 10) {
      return 'small'
    } else if (analysis.fileCount <= 500 && sizeMB <= 100) {
      return 'medium'
    } else if (analysis.fileCount <= 2000 && sizeMB <= 500) {
      return 'large'
    } else {
      return 'enterprise'
    }
  }

  /**
   * Enhance profile with file type specific optimizations
   */
  enhanceProfileWithFileTypes(profileName, analysis) {
    const baseProfile = this.getProfile(profileName)
    const projectType = analysis.detectedProjectType
    
    if (!projectType || !this.fileTypeOptimizations[projectType]) {
      return baseProfile
    }
    
    const typeOptimizations = this.fileTypeOptimizations[projectType]
    
    // Merge optimizations
    const enhanced = {
      ...baseProfile,
      settings: {
        ...baseProfile.settings,
        ...typeOptimizations.settings
      }
    }
    
    // Merge exclude patterns
    if (typeOptimizations.excludePatterns) {
      enhanced.settings.excludePatterns = [
        ...(enhanced.settings.excludePatterns || []),
        ...typeOptimizations.excludePatterns
      ]
    }
    
    // Add priority patterns
    if (typeOptimizations.priorityPatterns) {
      enhanced.settings.priorityPatterns = typeOptimizations.priorityPatterns
    }
    
    enhanced.name += ` (${projectType} optimized)`
    
    return enhanced
  }

  /**
   * Get a specific profile with optional customization
   */
  getProfile(name, analysis = null) {
    const profile = this.profiles[name]
    if (!profile) {
      throw new Error(`Unknown optimization profile: ${name}`)
    }
    
    // Deep copy to avoid modifying the original
    const customized = JSON.parse(JSON.stringify(profile))
    
    // Apply system-specific adjustments
    if (analysis) {
      customized.settings = this.adjustSettingsForSystem(customized.settings, analysis)
    }
    
    return customized
  }

  /**
   * Adjust settings based on system capabilities
   */
  adjustSettingsForSystem(settings, analysis) {
    const adjusted = { ...settings }
    const systemConstraints = this.analyzeSystemConstraints()
    
    // Adjust concurrency based on CPU count and load
    if (systemConstraints.loadAverage > systemConstraints.cpuCount * 0.8) {
      adjusted.maxConcurrency = Math.max(1, Math.floor(adjusted.maxConcurrency * 0.5))
    }
    
    // Adjust memory-related settings
    if (systemConstraints.isMemoryConstrained) {
      adjusted.enableCaching = false
      adjusted.streamChunkSize = Math.min(adjusted.streamChunkSize, 32 * 1024)
      adjusted.maxFileSize = Math.min(adjusted.maxFileSize, 10 * 1024 * 1024)
    }
    
    // Adjust based on file characteristics
    if (analysis && analysis.binaryFiles > analysis.fileCount * 0.5) {
      // Mostly binary files - optimize for that
      adjusted.compareContent = false
      adjusted.binarySampleSize = Math.min(adjusted.binarySampleSize, 512)
    }
    
    return adjusted
  }

  /**
   * Create a custom profile based on user requirements
   */
  createCustomProfile(name, baseProfile, overrides) {
    const base = this.getProfile(baseProfile)
    
    return {
      ...base,
      name: name,
      description: `Custom profile based on ${base.name}`,
      settings: {
        ...base.settings,
        ...overrides
      }
    }
  }

  /**
   * Get all available profiles
   */
  getAvailableProfiles() {
    return Object.keys(this.profiles).map(key => ({
      key,
      name: this.profiles[key].name,
      description: this.profiles[key].description
    }))
  }

  /**
   * Get system information for profile selection
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version
    }
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Validate profile settings
   */
  validateProfile(profile) {
    const errors = []
    const warnings = []
    
    const settings = profile.settings
    
    // Validate required settings
    if (!settings.maxConcurrency || settings.maxConcurrency < 1) {
      errors.push('maxConcurrency must be >= 1')
    }
    
    if (settings.maxConcurrency > os.cpus().length * 2) {
      warnings.push(`maxConcurrency (${settings.maxConcurrency}) is higher than recommended (${os.cpus().length * 2})`)
    }
    
    if (!settings.maxFileSize || settings.maxFileSize < 1024) {
      errors.push('maxFileSize must be >= 1024 bytes')
    }
    
    if (settings.streamChunkSize < 1024) {
      warnings.push('streamChunkSize < 1KB may impact performance')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

module.exports = OptimizationProfiles