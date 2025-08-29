/**
 * FileSystemUtils.js
 * File system operation helpers for the Lerian Protocol
 * 
 * Provides:
 * - Robust file metadata collection with error handling
 * - Content hashing for file comparison (MD5/SHA-256) with streaming
 * - Binary file detection and identification
 * - Safe file operations with atomic operations
 * - Efficient directory traversal with filtering
 * - Cross-platform compatibility for symbolic links and special files
 */

const fs = require('fs').promises
const fsSync = require('fs')
const crypto = require('crypto')
const path = require('path')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const { logger } = require('./logger')

class FileSystemUtils {
  constructor(options = {}) {
    this.options = {
      // Hashing options
      defaultHashAlgorithm: options.defaultHashAlgorithm || 'md5',
      streamChunkSize: options.streamChunkSize || 64 * 1024, // 64KB chunks
      maxConcurrentHashing: options.maxConcurrentHashing || 4,
      
      // Binary file detection
      binarySampleSize: options.binarySampleSize || 1024,
      binaryThreshold: options.binaryThreshold || 0.1, // 10% non-text chars
      
      // Performance settings
      metadataTimeout: options.metadataTimeout || 5000, // 5 seconds
      enableWorkerThreads: options.enableWorkerThreads !== false,
      
      // Safety settings
      followSymlinks: options.followSymlinks || false,
      maxFileSize: options.maxFileSize || 100 * 1024 * 1024, // 100MB default limit
      
      ...options
    }
    
    // Cache for file metadata to improve performance
    this.metadataCache = new Map()
    this.hashCache = new Map()
    this.binaryCache = new Map()
    
    // Performance tracking
    this.stats = {
      filesProcessed: 0,
      bytesRead: 0,
      cacheHits: 0,
      errors: 0
    }
  }

  /**
   * Get comprehensive file metadata with error handling and timeout
   */
  async getFileMetadata(filePath, useCache = true) {
    try {
      // Check cache first
      if (useCache && this.metadataCache.has(filePath)) {
        this.stats.cacheHits++
        return this.metadataCache.get(filePath)
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Metadata collection timeout')), this.options.metadataTimeout)
      })

      // Get file stats with timeout
      const statsPromise = this.getFileStatsWithDetails(filePath)
      const stats = await Promise.race([statsPromise, timeoutPromise])

      // Cache the result
      if (useCache) {
        this.metadataCache.set(filePath, stats)
      }

      this.stats.filesProcessed++
      return stats

    } catch (error) {
      this.stats.errors++
      throw new Error(`Cannot read metadata for ${filePath}: ${error.message}`)
    }
  }

  /**
   * Get detailed file statistics including type detection
   */
  async getFileStatsWithDetails(filePath) {
    const stats = await fs.stat(filePath)
    
    // Basic metadata
    const metadata = {
      size: stats.size,
      mtime: stats.mtime.getTime(),
      ctime: stats.ctime.getTime(),
      atime: stats.atime.getTime(),
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymbolicLink: stats.isSymbolicLink(),
      isBlockDevice: stats.isBlockDevice(),
      isCharacterDevice: stats.isCharacterDevice(),
      isFIFO: stats.isFIFO(),
      isSocket: stats.isSocket()
    }

    // Additional metadata for regular files
    if (stats.isFile()) {
      try {
        // Detect if file is binary
        metadata.isBinary = await this.isBinaryFile(filePath)
        
        // Get file type from extension
        metadata.extension = path.extname(filePath).toLowerCase()
        metadata.fileType = this.getFileTypeFromExtension(metadata.extension)
        
        // Add size classification
        metadata.sizeCategory = this.categorizeFileSize(stats.size)
        
      } catch {
        // Non-critical metadata, continue without it
        metadata.isBinary = null
        metadata.extension = path.extname(filePath).toLowerCase()
        metadata.fileType = 'unknown'
        metadata.sizeCategory = 'unknown'
      }
    }

    // Handle symbolic links
    if (stats.isSymbolicLink()) {
      try {
        const linkTarget = await fs.readlink(filePath)
        metadata.linkTarget = linkTarget
        metadata.isAbsoluteLink = path.isAbsolute(linkTarget)
        
        // Check if link is broken
        try {
          await fs.access(path.resolve(path.dirname(filePath), linkTarget))
          metadata.isBrokenLink = false
        } catch {
          metadata.isBrokenLink = true
        }
      } catch {
        metadata.linkTarget = null
        metadata.isBrokenLink = true
      }
    }

    return metadata
  }

  /**
   * Generate file hash with streaming for large files
   */
  async getFileHash(filePath, algorithm = null, useCache = true) {
    algorithm = algorithm || this.options.defaultHashAlgorithm
    const cacheKey = `${filePath}:${algorithm}`
    
    try {
      // Check cache first
      if (useCache && this.hashCache.has(cacheKey)) {
        this.stats.cacheHits++
        return this.hashCache.get(cacheKey)
      }

      // Check file size before hashing
      const stats = await fs.stat(filePath)
      if (stats.size > this.options.maxFileSize) {
        throw new Error(`File too large for hashing: ${stats.size} bytes`)
      }

      let hash
      if (this.options.enableWorkerThreads && stats.size > this.options.streamChunkSize * 10) {
        // Use worker thread for large files
        hash = await this.hashFileWithWorker(filePath, algorithm)
      } else {
        // Use streaming hash for regular files
        hash = await this.hashFileStream(filePath, algorithm)
      }

      // Cache the result with file modification time
      if (useCache) {
        this.hashCache.set(cacheKey, { hash, mtime: stats.mtime.getTime() })
      }

      this.stats.bytesRead += stats.size
      return { hash, mtime: stats.mtime.getTime() }

    } catch (error) {
      this.stats.errors++
      throw new Error(`Failed to hash file ${filePath}: ${error.message}`)
    }
  }

  /**
   * Stream-based file hashing for memory efficiency
   */
  async hashFileStream(filePath, algorithm) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm)
      const stream = fsSync.createReadStream(filePath, { 
        highWaterMark: this.options.streamChunkSize 
      })
      
      stream.on('error', reject)
      stream.on('data', chunk => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
    })
  }

  /**
   * Hash file using worker thread for CPU-intensive operations
   */
  async hashFileWithWorker(filePath, algorithm) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { filePath, algorithm, chunkSize: this.options.streamChunkSize }
      })
      
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })
  }

  /**
   * Detect if a file is binary using multiple strategies
   */
  async isBinaryFile(filePath, useCache = true) {
    try {
      // Check cache first
      if (useCache && this.binaryCache.has(filePath)) {
        this.stats.cacheHits++
        return this.binaryCache.get(filePath)
      }

      const stats = await fs.stat(filePath)
      
      // Empty files are considered text
      if (stats.size === 0) {
        const result = false
        if (useCache) {this.binaryCache.set(filePath, result)}
        return result
      }

      // Sample the beginning of the file
      const sampleSize = Math.min(this.options.binarySampleSize, stats.size)
      const buffer = Buffer.alloc(sampleSize)
      
      const fd = await fs.open(filePath, 'r')
      try {
        const { bytesRead } = await fd.read(buffer, 0, sampleSize, 0)
        const sample = buffer.slice(0, bytesRead)
        
        const isBinary = this.analyzeBufferForBinary(sample)
        
        // Cache the result
        if (useCache) {
          this.binaryCache.set(filePath, isBinary)
        }
        
        return isBinary
      } finally {
        await fd.close()
      }

    } catch (error) {
      // If we can't read the file, assume it's not binary
      logger.warn(`Cannot determine if ${filePath} is binary: ${error.message}`)
      return false
    }
  }

  /**
   * Analyze buffer contents to determine if binary
   */
  analyzeBufferForBinary(buffer) {
    let nullBytes = 0
    let controlChars = 0
    let highBitChars = 0
    
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i]
      
      // Null bytes are strong indicators of binary content
      if (byte === 0) {
        nullBytes++
        // Even a few null bytes suggest binary
        if (nullBytes > 0) {return true}
      }
      
      // Control characters (except common whitespace)
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        controlChars++
      }
      
      // High-bit characters (extended ASCII)
      if (byte > 127) {
        highBitChars++
      }
    }
    
    // Calculate ratios
    const controlRatio = controlChars / buffer.length
    const highBitRatio = highBitChars / buffer.length
    
    // File is considered binary if it has too many non-text characters
    return (controlRatio + highBitRatio) > this.options.binaryThreshold
  }

  /**
   * Get file type from extension
   */
  getFileTypeFromExtension(extension) {
    const typeMap = {
      // Text files
      '.txt': 'text',
      '.md': 'markdown',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.csv': 'csv',
      '.log': 'log',
      
      // Code files
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.h': 'header',
      '.css': 'css',
      '.html': 'html',
      '.htm': 'html',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      
      // Images
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.gif': 'image',
      '.bmp': 'image',
      '.svg': 'image',
      '.webp': 'image',
      
      // Archives
      '.zip': 'archive',
      '.tar': 'archive',
      '.gz': 'archive',
      '.bz2': 'archive',
      '.xz': 'archive',
      '.7z': 'archive',
      '.rar': 'archive',
      
      // Documents
      '.pdf': 'document',
      '.doc': 'document',
      '.docx': 'document',
      '.xls': 'document',
      '.xlsx': 'document',
      '.ppt': 'document',
      '.pptx': 'document',
      
      // Executables
      '.exe': 'executable',
      '.dll': 'executable',
      '.so': 'executable',
      '.dylib': 'executable'
    }
    
    return typeMap[extension] || 'unknown'
  }

  /**
   * Categorize file size for display purposes
   */
  categorizeFileSize(bytes) {
    if (bytes < 1024) {return 'tiny'} // < 1KB
    if (bytes < 10 * 1024) {return 'small'} // < 10KB
    if (bytes < 100 * 1024) {return 'medium'} // < 100KB
    if (bytes < 1024 * 1024) {return 'large'} // < 1MB
    if (bytes < 10 * 1024 * 1024) {return 'very-large'} // < 10MB
    return 'huge' // >= 10MB
  }

  /**
   * Safe file copy with atomic operations
   */
  async copyFile(sourcePath, destPath, options = {}) {
    try {
      const opts = {
        overwrite: options.overwrite || false,
        preserveTimestamps: options.preserveTimestamps !== false,
        atomic: options.atomic !== false,
        ...options
      }

      // Ensure destination directory exists
      await fs.mkdir(path.dirname(destPath), { recursive: true })

      if (opts.atomic) {
        // Atomic copy using temporary file
        const tempPath = `${destPath}.tmp.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
        
        try {
          // Copy to temporary file first
          await fs.copyFile(sourcePath, tempPath)
          
          // Preserve timestamps if requested
          if (opts.preserveTimestamps) {
            const sourceStats = await fs.stat(sourcePath)
            await fs.utimes(tempPath, sourceStats.atime, sourceStats.mtime)
          }
          
          // Atomically move to final destination
          await fs.rename(tempPath, destPath)
          
        } catch (error) {
          // Clean up temporary file on error
          try {
            await fs.unlink(tempPath)
          } catch {
            // Ignore cleanup errors
          }
          throw error
        }
      } else {
        // Direct copy
        await fs.copyFile(sourcePath, destPath)
        
        if (opts.preserveTimestamps) {
          const sourceStats = await fs.stat(sourcePath)
          await fs.utimes(destPath, sourceStats.atime, sourceStats.mtime)
        }
      }

    } catch (error) {
      throw new Error(`Failed to copy ${sourcePath} to ${destPath}: ${error.message}`)
    }
  }

  /**
   * Safe file removal with error handling
   */
  async removeFile(filePath, options = {}) {
    try {

      await fs.unlink(filePath)

    } catch (error) {
      if (error.code === 'ENOENT' && options.force !== false) {
        // File doesn't exist, but that's okay
        return
      }
      throw new Error(`Failed to remove ${filePath}: ${error.message}`)
    }
  }

  /**
   * Efficient directory traversal with filtering and parallel processing
   */
  async traverseDirectory(dirPath, options = {}) {
    const opts = {
      recursive: options.recursive !== false,
      followSymlinks: options.followSymlinks || this.options.followSymlinks,
      filter: options.filter || (() => true),
      includeDirectories: options.includeDirectories || false,
      maxDepth: options.maxDepth || Infinity,
      parallel: options.parallel !== false,
      maxConcurrency: options.maxConcurrency || 10,
      ...options
    }

    const results = []
    const semaphore = new Semaphore(opts.maxConcurrency)
    
    await this.traverseDirectoryRecursive(dirPath, '', opts, results, semaphore, 0)
    
    return results.sort((a, b) => {
      const pathA = a.relativePath || ''
      const pathB = b.relativePath || ''
      return pathA.localeCompare(pathB)
    })
  }

  /**
   * Recursive directory traversal implementation
   */
  async traverseDirectoryRecursive(basePath, relativePath, options, results, semaphore, depth) {
    if (depth > options.maxDepth) {return}

    try {
      const fullPath = path.join(basePath, relativePath)
      const entries = await fs.readdir(fullPath, { withFileTypes: true })
      
      const promises = []
      
      for (const entry of entries) {
        const entryPath = path.join(relativePath, entry.name)
        const fullEntryPath = path.join(basePath, entryPath)
        
        // Apply filter
        if (!options.filter(entry.name, entryPath, entry)) {
          continue
        }

        if (entry.isDirectory()) {
          // Include directory in results if requested
          if (options.includeDirectories) {
            results.push({
              path: entryPath,
              fullPath: fullEntryPath,
              type: 'directory',
              name: entry.name
            })
          }
          
          // Recurse into directory if recursive option is enabled
          if (options.recursive) {
            if (options.parallel) {
              promises.push(
                semaphore.acquire().then(async (release) => {
                  try {
                    await this.traverseDirectoryRecursive(
                      basePath, entryPath, options, results, semaphore, depth + 1
                    )
                  } finally {
                    release()
                  }
                })
              )
            } else {
              await this.traverseDirectoryRecursive(
                basePath, entryPath, options, results, semaphore, depth + 1
              )
            }
          }
        } else if (entry.isFile()) {
          results.push({
            path: entryPath,
            fullPath: fullEntryPath,
            type: 'file',
            name: entry.name
          })
        } else if (entry.isSymbolicLink() && options.followSymlinks) {
          try {
            const linkStats = await fs.stat(fullEntryPath)
            if (linkStats.isFile()) {
              results.push({
                path: entryPath,
                fullPath: fullEntryPath,
                type: 'file',
                name: entry.name,
                isSymlink: true
              })
            } else if (linkStats.isDirectory() && options.recursive) {
              if (options.includeDirectories) {
                results.push({
                  path: entryPath,
                  fullPath: fullEntryPath,
                  type: 'directory',
                  name: entry.name,
                  isSymlink: true
                })
              }
              
              // Recurse into symlinked directory
              if (options.parallel) {
                promises.push(
                  semaphore.acquire().then(async (release) => {
                    try {
                      await this.traverseDirectoryRecursive(
                        basePath, entryPath, options, results, semaphore, depth + 1
                      )
                    } finally {
                      release()
                    }
                  })
                )
              } else {
                await this.traverseDirectoryRecursive(
                  basePath, entryPath, options, results, semaphore, depth + 1
                )
              }
            }
          } catch (error) {
            // Broken symlink or permission error, skip it
            logger.warn(`Cannot follow symlink ${fullEntryPath}: ${error.message}`)
          }
        }
      }
      
      // Wait for all parallel operations to complete
      if (promises.length > 0) {
        await Promise.all(promises)
      }

    } catch (error) {
      logger.warn(`Cannot scan directory ${path.join(basePath, relativePath)}: ${error.message}`)
    }
  }

  /**
   * Check if file has been modified based on cached metadata
   */
  isFileModified(filePath, cachedMetadata) {
    const cacheEntry = this.metadataCache.get(filePath)
    if (!cacheEntry) {return true} // No cache, assume modified
    
    // Quick checks first
    if (cacheEntry.size !== cachedMetadata.size) {return true}
    if (Math.abs(cacheEntry.mtime - cachedMetadata.mtime) > 1000) {return true} // 1 second tolerance
    
    return false
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.metadataCache.clear()
    this.hashCache.clear()
    this.binaryCache.clear()
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: {
        metadata: this.metadataCache.size,
        hash: this.hashCache.size,
        binary: this.binaryCache.size
      }
    }
  }

  /**
   * Validate hash cache entry against current file
   */
  async isHashCacheValid(filePath, cacheEntry) {
    try {
      const stats = await fs.stat(filePath)
      return Math.abs(stats.mtime.getTime() - cacheEntry.mtime) < 1000 // 1 second tolerance
    } catch {
      return false
    }
  }
}

/**
 * Simple semaphore implementation for controlling concurrency
 */
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

// Worker thread code for file hashing
if (!isMainThread) {
  const { filePath, algorithm, chunkSize } = workerData
  
  const hash = crypto.createHash(algorithm)
  const stream = fsSync.createReadStream(filePath, { highWaterMark: chunkSize })
  
  stream.on('error', (error) => {
    parentPort.postMessage({ error: error.message })
  })
  
  stream.on('data', (chunk) => {
    hash.update(chunk)
  })
  
  stream.on('end', () => {
    parentPort.postMessage({ hash: hash.digest('hex') })
  })
}

module.exports = FileSystemUtils