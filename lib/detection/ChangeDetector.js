/**
 * ChangeDetector.js
 * Core change detection logic for the Lerian Protocol
 *
 * Features:
 * - Parallel file scanning with controlled concurrency
 * - Recursive directory scanning with performance optimization
 * - File comparison using size, modification time, and content hashes
 * - Binary file detection and efficient comparison strategies
 * - Support for exclude patterns and ignore files
 * - Incremental change detection for performance
 * - Progress reporting for long-running operations
 */

const fs = require('fs').promises
const path = require('path')
const { EventEmitter } = require('events')
const FileSystemUtils = require('../utils/FileSystemUtils')

class ChangeDetector extends EventEmitter {
  constructor(sourcePath, destinationPath, options = {}) {
    super()
    
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
    
    this.options = {
      includeDirectories: options.includeDirectories || ['.claude', 'protocol-assets'],
      excludePatterns: options.excludePatterns || [
        'node_modules/**',
        '.git/**',
        '*.log',
        '.DS_Store',
        'Thumbs.db',
        '.tmp/**',
        '*.tmp',
        '.cache/**'
      ],
      compareContent: options.compareContent !== false,
      detectMoves: options.detectMoves || false,
      contentHashAlgorithm: options.contentHashAlgorithm || 'md5',
      maxConcurrency: options.maxConcurrency || 10,
      enableProgressReporting: options.enableProgressReporting !== false,
      progressReportInterval: options.progressReportInterval || 100,
      mtimeToleranceMs: options.mtimeToleranceMs || 2000,
      enableCaching: options.enableCaching !== false,
      cacheValidityMs: options.cacheValidityMs || 300000,
      maxFileSize: options.maxFileSize || 100 * 1024 * 1024,
      largeBinaryThreshold: options.largeBinaryThreshold || 10 * 1024 * 1024,
      
      ...(options || {})
    }
    
    this.fsUtils = new FileSystemUtils({
      followSymlinks: false,
      maxFileSize: this.options.maxFileSize,
      enableWorkerThreads: true,
      defaultHashAlgorithm: this.options.contentHashAlgorithm
    })
    
    this.progress = {
      totalFiles: 0,
      processedFiles: 0,
      currentOperation: 'initializing',
      startTime: null,
      estimatedTimeRemaining: null
    }
    
    this.metrics = {
      scanTime: 0,
      compareTime: 0,
      hashTime: 0,
      filesSkipped: 0,
      cacheHits: 0,
      errors: []
    }
  }

  async detectChanges() {
    try {
      this.progress.startTime = Date.now()
      this.progress.currentOperation = 'scanning'
      
      this.emit('progress', { ...this.progress })
      
      console.log('🔍 Scanning for file changes...')
      
      const scanStart = Date.now()
      const [sourceFiles, destFiles] = await Promise.all([
        this.scanDirectory(this.sourcePath, 'source'),
        this.scanDirectory(this.destinationPath, 'destination')
      ])
      this.metrics.scanTime = Date.now() - scanStart
      
      this.progress.totalFiles = sourceFiles.size + destFiles.size
      this.progress.currentOperation = 'comparing'
      this.emit('progress', { ...this.progress })
      
      const compareStart = Date.now()
      const changes = await this.compareFileSets(sourceFiles, destFiles)
      this.metrics.compareTime = Date.now() - compareStart
      
      this.progress.currentOperation = 'complete'
      this.emit('progress', { ...this.progress })
      const result = {
        changes,
        summary: {
          sourceFiles: sourceFiles.size,
          destinationFiles: destFiles.size,
          totalChanges: changes.length,
          scanTime: this.metrics.scanTime,
          compareTime: this.metrics.compareTime,
          totalTime: Date.now() - this.progress.startTime
        },
        metrics: this.metrics,
        timestamp: Date.now()
      }
      
      console.log(`✅ Change detection complete: ${changes.length} changes found`)
      this.emit('complete', result)
      
      return result

    } catch (error) {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      }
      
      this.metrics.errors.push(errorDetails)
      this.emit('error', errorDetails)
      
      throw new Error(`Change detection failed: ${error.message}`)
    }
  }

  async scanDirectory(basePath, label) {
    const fileMap = new Map()
    let processedCount = 0
    
    try {
      // Check if base path exists
      try {
        await fs.access(basePath)
      } catch {
        console.warn(`Warning: ${label} directory not found: ${basePath}`)
        return fileMap
      }
      
      // Scan each included directory
      const scanPromises = this.options.includeDirectories.map(async (includeDir) => {
        const fullPath = path.join(basePath, includeDir)
        
        try {
          await fs.access(fullPath)
          const files = await this.scanDirectoryRecursive(fullPath, includeDir, label)
          
          // Merge results into main file map
          for (const [relativePath, fileInfo] of files.entries()) {
            fileMap.set(relativePath, fileInfo)
            processedCount++
            
            // Report progress periodically
            if (this.options.enableProgressReporting && 
                processedCount % this.options.progressReportInterval === 0) {
              this.progress.processedFiles = processedCount
              this.updateEstimatedTime()
              this.emit('progress', { ...this.progress, operation: `scanning ${label}` })
            }
          }
          
        } catch (error) {
          console.warn(`Warning: Cannot access ${label} directory ${fullPath}: ${error.message}`)
        }
      })
      
      await Promise.all(scanPromises)
      
    } catch (error) {
      console.warn(`Warning: Error scanning ${label} directory: ${error.message}`)
    }
    
    return fileMap
  }

  async scanDirectoryRecursive(dirPath) {
    const fileMap = new Map()
    
    try {
      const files = await this.fsUtils.traverseDirectory(dirPath, {
        recursive: true,
        followSymlinks: false,
        filter: (fileName, filePath, _entry) => {
          // Apply exclusion patterns
          return !this.shouldExclude(fileName, filePath)
        },
        maxConcurrency: this.options.maxConcurrency,
        parallel: true
      })
      
      // Process files in parallel with controlled concurrency
      const semaphore = new Semaphore(this.options.maxConcurrency)
      const promises = files.map(async (file) => {
        const release = await semaphore.acquire()
        
        try {
          if (file.type === 'file') {
            const metadata = await this.fsUtils.getFileMetadata(file.fullPath)
            fileMap.set(file.path, {
              path: file.path,
              fullPath: file.fullPath,
              relativePath: path.basename(file.path),
              ...metadata
            })
          }
        } catch (error) {
          console.warn(`Warning: Cannot process file ${file.fullPath}: ${error.message}`)
          this.metrics.errors.push({
            file: file.fullPath,
            operation: 'metadata',
            error: error.message,
            timestamp: Date.now()
          })
        } finally {
          release()
        }
      })
      
      await Promise.all(promises)
      
    } catch (error) {
      console.warn(`Warning: Cannot scan directory ${dirPath}: ${error.message}`)
    }
    
    return fileMap
  }

  async compareFileSets(sourceFiles, destFiles) {
    const changes = []
    const allPaths = new Set([...sourceFiles.keys(), ...destFiles.keys()])
    
    // Process files in parallel with controlled concurrency
    const semaphore = new Semaphore(this.options.maxConcurrency)
    const promises = Array.from(allPaths).map(async (filePath) => {
      const release = await semaphore.acquire()
      
      try {
        const sourceFile = sourceFiles.get(filePath)
        const destFile = destFiles.get(filePath)
        
        const change = await this.classifyFileChange(sourceFile, destFile)
        
        if (change) {
          changes.push(change)
        }
        
        this.progress.processedFiles++
        
        // Report progress
        if (this.options.enableProgressReporting && 
            this.progress.processedFiles % this.options.progressReportInterval === 0) {
          this.updateEstimatedTime()
          this.emit('progress', { ...this.progress })
        }
        
      } catch (error) {
        console.warn(`Warning: Error comparing ${filePath}: ${error.message}`)
        this.metrics.errors.push({
          file: filePath,
          operation: 'compare',
          error: error.message,
          timestamp: Date.now()
        })
      } finally {
        release()
      }
    })
    
    await Promise.all(promises)
    
    // Sort changes by path for consistent output
    return changes.sort((a, b) => {
      const pathA = a.path || ''
      const pathB = b.path || ''
      return pathA.localeCompare(pathB)
    })
  }

  async classifyFileChange(sourceFile, destFile) {
    // File exists in source but not in destination - NEW
    if (sourceFile && !destFile) {
      return {
        changeType: 'new',
        path: sourceFile.path,
        relativePath: sourceFile.relativePath,
        sourceFile,
        destFile: null,
        reason: 'File does not exist in destination',
        confidence: 1.0,
        priority: this.getChangePriority('new'),
        timestamp: Date.now()
      }
    }
    
    // File exists in destination but not in source - DELETED
    if (!sourceFile && destFile) {
      return {
        changeType: 'deleted',
        path: destFile.path,
        relativePath: destFile.relativePath,
        sourceFile: null,
        destFile,
        reason: 'File does not exist in source',
        confidence: 1.0,
        priority: this.getChangePriority('deleted'),
        timestamp: Date.now()
      }
    }
    
    // File exists in both - check for MODIFICATION
    if (sourceFile && destFile) {
      const modificationResult = await this.detectFileModification(sourceFile, destFile)
      
      if (modificationResult.modified) {
        return {
          changeType: 'modified',
          path: sourceFile.path,
          relativePath: sourceFile.relativePath,
          sourceFile,
          destFile,
          reason: modificationResult.reason,
          confidence: modificationResult.confidence,
          priority: this.getChangePriority('modified'),
          details: modificationResult.details,
          timestamp: Date.now()
        }
      }
    }
    
    return null // No change detected
  }

  async detectFileModification(sourceFile, destFile) {
    const checks = []
    let confidence = 0
    
    // Quick size comparison (highest priority)
    if (sourceFile.size !== destFile.size) {
      const sizeDiff = sourceFile.size - destFile.size
      const sizeReason = `Size changed: ${this.formatBytes(destFile.size)} → ${this.formatBytes(sourceFile.size)} (${sizeDiff > 0 ? '+' : ''}${this.formatBytes(sizeDiff)})`
      
      return {
        modified: true,
        reason: sizeReason,
        confidence: 1.0,
        details: {
          sizeChange: { old: destFile.size, new: sourceFile.size, diff: sizeDiff }
        }
      }
    }
    
    // Modification time comparison (with tolerance for file system differences)
    const timeDiff = Math.abs(sourceFile.mtime - destFile.mtime)
    if (timeDiff > this.options.mtimeToleranceMs) {
      checks.push({
        type: 'mtime',
        changed: true,
        reason: `Modified time changed: ${new Date(destFile.mtime).toISOString()} → ${new Date(sourceFile.mtime).toISOString()}`,
        confidence: 0.8
      })
      confidence = Math.max(confidence, 0.8)
    }
    
    // Content comparison (for files with different modification times or when explicitly requested)
    if ((timeDiff > this.options.mtimeToleranceMs && this.options.compareContent) || 
        (this.options.compareContent && timeDiff === 0)) {
      
      try {
        const contentChanged = await this.compareFileContent(sourceFile, destFile)
        
        if (contentChanged) {
          checks.push({
            type: 'content',
            changed: true,
            reason: 'File content has changed',
            confidence: 1.0
          })
          confidence = 1.0
        } else if (timeDiff > this.options.mtimeToleranceMs) {
          // Modification time changed but content is the same
          // This might be a timestamp-only change (e.g., file touched)
          checks.push({
            type: 'timestamp-only',
            changed: false,
            reason: 'Only timestamp changed, content is identical',
            confidence: 0.9
          })
        }
        
      } catch (error) {
        console.warn(`Warning: Content comparison failed for ${sourceFile.path}: ${error.message}`)
        // Fall back to timestamp-based detection
        if (timeDiff > this.options.mtimeToleranceMs) {
          confidence = 0.7 // Lower confidence due to failed content check
        }
      }
    }
    
    // Determine if file is modified
    const isModified = checks.some(check => check.changed) || 
                      (timeDiff > this.options.mtimeToleranceMs && !this.options.compareContent)
    
    if (isModified) {
      const primaryCheck = checks.find(check => check.changed) || 
                          { reason: `Modified time changed by ${timeDiff}ms`, confidence }
      
      return {
        modified: true,
        reason: primaryCheck.reason,
        confidence: primaryCheck.confidence,
        details: {
          timeDiff,
          checks,
          comparisonStrategy: this.options.compareContent ? 'content+time' : 'time-only'
        }
      }
    }
    
    return {
      modified: false,
      reason: 'Files are identical',
      confidence: confidence || 1.0,
      details: { timeDiff, checks }
    }
  }

  async compareFileContent(sourceFile, destFile) {
    try {
      const hashStart = Date.now()
      
      // For large binary files, use a different strategy
      if (sourceFile.isBinary && sourceFile.size > this.options.largeBinaryThreshold) {
        // Quick binary comparison using file metadata and sampling
        const quickResult = await this.quickBinaryComparison(sourceFile, destFile)
        this.metrics.hashTime += Date.now() - hashStart
        return quickResult
      }
      
      // Get content hashes for both files
      const [sourceHashResult, destHashResult] = await Promise.all([
        this.fsUtils.getFileHash(sourceFile.fullPath, this.options.contentHashAlgorithm),
        this.fsUtils.getFileHash(destFile.fullPath, this.options.contentHashAlgorithm)
      ])
      
      this.metrics.hashTime += Date.now() - hashStart
      
      return sourceHashResult.hash !== destHashResult.hash
      
    } catch (error) {
      if (error.message.includes('File too large')) {
        console.warn(`Warning: Skipping content comparison for large file ${sourceFile.path}`)
        this.metrics.filesSkipped++
        return false // Assume no change for files too large to hash
      }
      throw error
    }
  }

  async quickBinaryComparison(sourceFile, destFile) {
    // If sizes are different, files are definitely different
    if (sourceFile.size !== destFile.size) {
      return true
    }
    
    // Sample a few chunks from different parts of the file
    const sampleSize = 4096 // 4KB samples
    const numSamples = 3
    const fileSize = sourceFile.size
    
    try {
      const samples = []
      for (let i = 0; i < numSamples; i++) {
        const offset = Math.floor((fileSize * i) / (numSamples + 1))
        samples.push(offset)
      }
      
      // Compare samples from both files
      for (const offset of samples) {
        const [sourceBuffer, destBuffer] = await Promise.all([
          this.readFileChunk(sourceFile.fullPath, offset, sampleSize),
          this.readFileChunk(destFile.fullPath, offset, sampleSize)
        ])
        
        if (!sourceBuffer.equals(destBuffer)) {
          return true
        }
      }
      
      return false // All samples match
      
    } catch (error) {
      console.warn(`Warning: Quick binary comparison failed for ${sourceFile.path}: ${error.message}`)
      return false // Assume no change on error
    }
  }

  async readFileChunk(filePath, offset, length) {
    const fs = require('fs').promises
    const fd = await fs.open(filePath, 'r')
    
    try {
      const buffer = Buffer.alloc(length)
      const { bytesRead } = await fd.read(buffer, 0, length, offset)
      return buffer.slice(0, bytesRead)
    } finally {
      await fd.close()
    }
  }

  shouldExclude(fileName, relativePath) {
    for (const pattern of this.options.excludePatterns) {
      if (this.matchesPattern(pattern, fileName, relativePath)) {
        return true
      }
    }
    return false
  }

  matchesPattern(pattern, fileName, relativePath) {
    // Handle glob patterns
    if (pattern.includes('*')) {
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*') // ** matches any path
          .replace(/\*/g, '[^/]*') // * matches any file/dir name
          .replace(/\?/g, '.') // ? matches single character
      )
      
      return regex.test(fileName) || regex.test(relativePath)
    }
    
    // Exact match
    return fileName === pattern || relativePath.includes(pattern)
  }

  getChangePriority(changeType) {
    const priorities = {
      'deleted': 1, // Process deletions first
      'modified': 2, // Then modifications
      'new': 3, // Then new files
      'moved': 4 // Finally moves (if implemented)
    }
    
    return priorities[changeType] || 5
  }

  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  updateEstimatedTime() {
    if (this.progress.processedFiles === 0 || this.progress.totalFiles === 0) {
      this.progress.estimatedTimeRemaining = null
      return
    }
    
    const elapsed = Date.now() - this.progress.startTime
    const rate = this.progress.processedFiles / elapsed // files per ms
    const remaining = this.progress.totalFiles - this.progress.processedFiles
    
    this.progress.estimatedTimeRemaining = remaining / rate
  }

  getMetrics() {
    return {
      ...this.metrics,
      fsUtilsStats: this.fsUtils.getStats()
    }
  }

  clearCache() {
    this.fsUtils.clearCache()
  }
}

// Simple semaphore implementation for controlling concurrency
class Semaphore {
  constructor(count) {
    this.count = count
    this.waiting = []
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.count > 0) {
        this.count--
        resolve(() => this.release())
      } else {
        this.waiting.push(() => {
          resolve(() => this.release())
        })
      }
    })
  }

  release() {
    this.count++
    if (this.waiting.length > 0) {
      this.count--
      const next = this.waiting.shift()
      next()
    }
  }
}

module.exports = ChangeDetector