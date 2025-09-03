const crypto = require('crypto')
const fs = require('fs-extra')
const path = require('path')

class FileHasher {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'sha256'
    this.encoding = options.encoding || 'hex'
    this.ignorePatterns = options.ignorePatterns || [
      '.git',
      'node_modules',
      '.DS_Store',
      '*.log',
      '.sync-backup',
      '*.tmp',
      'dist',
      'build'
    ]
  }

  /**
   * Generate hash for a single file
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File hash
   */
  async hashFile(filePath) {
    const hash = crypto.createHash(this.algorithm)
    const stream = fs.createReadStream(filePath)
    
    return new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('data', chunk => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest(this.encoding)))
    })
  }

  /**
   * Generate hashes for all files in a directory
   * @param {string} dirPath - Directory path
   * @param {Object} options - Options
   * @param {Function} options.onProgress - Progress callback (current, total)
   * @returns {Promise<Object>} Map of relative paths to hashes
   */
  async hashDirectory(dirPath, options = {}) {
    const { onProgress } = options
    const fileHashes = {}
    const files = await this.getFileList(dirPath)
    
    let processed = 0
    const total = files.length

    for (const filePath of files) {
      const relativePath = path.relative(dirPath, filePath)
      
      try {
        const hash = await this.hashFile(filePath)
        const stats = await fs.stat(filePath)
        
        fileHashes[relativePath] = {
          hash,
          size: stats.size,
          mtime: stats.mtime.toISOString(),
          type: 'file'
        }
      } catch (error) {
        console.warn(`Warning: Could not hash file ${relativePath}:`, error.message)
        continue
      }

      processed++
      if (onProgress) {
        onProgress(processed, total)
      }
    }

    return fileHashes
  }

  /**
   * Get list of files in directory, respecting ignore patterns
   * @param {string} dirPath - Directory path
   * @returns {Promise<string[]>} Array of file paths
   */
  async getFileList(dirPath) {
    const files = []
    
    const traverse = async (currentPath) => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)
        const relativePath = path.relative(dirPath, fullPath)
        
        if (this.shouldIgnore(relativePath)) {
          continue
        }

        if (entry.isDirectory()) {
          await traverse(fullPath)
        } else if (entry.isFile()) {
          files.push(fullPath)
        }
      }
    }

    await traverse(dirPath)
    return files
  }

  /**
   * Check if file/directory should be ignored
   * @param {string} relativePath - Path relative to root
   * @returns {boolean} True if should be ignored
   */
  shouldIgnore(relativePath) {
    for (const pattern of this.ignorePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true
      }
    }
    return false
  }

  /**
   * Match path against glob-like pattern
   * @param {string} filePath - File path to test
   * @param {string} pattern - Pattern to match against
   * @returns {boolean} True if matches
   */
  matchesPattern(filePath, pattern) {
    // Simple glob pattern matching
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      )
      return regex.test(filePath) || regex.test(path.basename(filePath))
    }
    
    // Exact match or directory match
    return filePath === pattern || 
           filePath.startsWith(pattern + path.sep) ||
           path.basename(filePath) === pattern
  }

  /**
   * Compare two file hash objects
   * @param {Object} hashMap1 - First hash map
   * @param {Object} hashMap2 - Second hash map
   * @returns {Object} Comparison result with added, modified, deleted, unchanged arrays
   */
  compareHashes(hashMap1, hashMap2) {
    const result = {
      added: [],      // Files in hashMap2 but not in hashMap1
      modified: [],   // Files in both but with different hashes
      deleted: [],    // Files in hashMap1 but not in hashMap2
      unchanged: []   // Files in both with same hash
    }

    const allFiles = new Set([...Object.keys(hashMap1), ...Object.keys(hashMap2)])

    for (const filePath of allFiles) {
      const file1 = hashMap1[filePath]
      const file2 = hashMap2[filePath]

      if (!file1 && file2) {
        result.added.push({ path: filePath, ...file2 })
      } else if (file1 && !file2) {
        result.deleted.push({ path: filePath, ...file1 })
      } else if (file1.hash !== file2.hash) {
        result.modified.push({ 
          path: filePath, 
          old: file1, 
          new: file2 
        })
      } else {
        result.unchanged.push({ path: filePath, ...file1 })
      }
    }

    return result
  }

  /**
   * Create a hash snapshot with metadata
   * @param {string} dirPath - Directory to snapshot
   * @param {Object} options - Options
   * @returns {Promise<Object>} Snapshot object with hashes and metadata
   */
  async createSnapshot(dirPath, options = {}) {
    const startTime = Date.now()
    let processedFiles = 0

    const onProgress = (current, total) => {
      processedFiles = current
      if (options.onProgress) {
        options.onProgress(current, total)
      }
    }

    const hashes = await this.hashDirectory(dirPath, { onProgress })
    const endTime = Date.now()

    return {
      timestamp: new Date().toISOString(),
      directory: path.resolve(dirPath),
      algorithm: this.algorithm,
      fileCount: processedFiles,
      duration: endTime - startTime,
      hashes
    }
  }
}

module.exports = FileHasher