const fs = require('fs-extra')
const path = require('path')
const FileHasher = require('./file-hasher')

class SyncPlanner {
  constructor(options = {}) {
    this.fileHasher = new FileHasher(options.hasher)
    this.profileFilter = options.profileFilter || null
  }

  /**
   * Create a comprehensive sync plan
   * @param {string} sourcePath - Source directory path
   * @param {string} destPath - Destination directory path
   * @param {Object} lastSyncHashes - Hashes from last sync (from metadata)
   * @param {Object} options - Planning options
   * @returns {Promise<Object>} Sync plan with operations and metadata
   */
  async createSyncPlan(sourcePath, destPath, lastSyncHashes = {}, options = {}) {
    const startTime = Date.now()
    
    // Generate current snapshots
    const [sourceSnapshot, destSnapshot] = await Promise.all([
      this.fileHasher.createSnapshot(sourcePath, {
        onProgress: (current, total) => {
          if (options.onProgress) {
            options.onProgress(`Scanning source files: ${current}/${total}`)
          }
        }
      }),
      this.fileHasher.createSnapshot(destPath, {
        onProgress: (current, total) => {
          if (options.onProgress) {
            options.onProgress(`Scanning destination files: ${current}/${total}`)
          }
        }
      })
    ])

    // Filter files by profile if specified
    const filteredSourceHashes = this.filterByProfile(sourceSnapshot.hashes, options.profile)
    const filteredDestHashes = this.filterByProfile(destSnapshot.hashes, options.profile)

    // Compare current state with last sync to detect conflicts
    const sourceChanges = this.fileHasher.compareHashes(lastSyncHashes, filteredSourceHashes)
    const destChanges = this.fileHasher.compareHashes(lastSyncHashes, filteredDestHashes)

    // Generate sync operations
    const operations = this.generateOperations(
      filteredSourceHashes, 
      filteredDestHashes, 
      sourceChanges, 
      destChanges
    )

    const endTime = Date.now()

    return {
      planId: this.generatePlanId(),
      timestamp: new Date().toISOString(),
      duration: endTime - startTime,
      sourcePath,
      destPath,
      profile: options.profile || 'all',
      
      snapshots: {
        source: sourceSnapshot,
        destination: destSnapshot
      },
      
      changes: {
        source: sourceChanges,
        destination: destChanges
      },
      
      operations,
      
      summary: this.generateSummary(operations),
      
      conflicts: operations.filter(op => op.type === 'conflict'),
      
      estimatedSize: this.calculateEstimatedSize(operations)
    }
  }

  /**
   * Generate sync operations based on file comparisons
   * @param {Object} sourceHashes - Source file hashes
   * @param {Object} destHashes - Destination file hashes
   * @param {Object} sourceChanges - Changes in source since last sync
   * @param {Object} destChanges - Changes in destination since last sync
   * @returns {Array} Array of sync operations
   */
  generateOperations(sourceHashes, destHashes, sourceChanges, destChanges) {
    const operations = []
    const allFiles = new Set([
      ...Object.keys(sourceHashes), 
      ...Object.keys(destHashes)
    ])

    for (const filePath of allFiles) {
      const sourceFile = sourceHashes[filePath]
      const destFile = destHashes[filePath]
      
      const sourceChanged = this.wasFileChanged(filePath, sourceChanges)
      const destChanged = this.wasFileChanged(filePath, destChanges)

      const operation = this.determineOperation(
        filePath, 
        sourceFile, 
        destFile, 
        sourceChanged, 
        destChanged
      )

      if (operation) {
        operations.push(operation)
      }
    }

    return operations.sort((a, b) => {
      // Prioritize conflicts first, then by file path
      if (a.type === 'conflict' && b.type !== 'conflict') return -1
      if (b.type === 'conflict' && a.type !== 'conflict') return 1
      return a.path.localeCompare(b.path)
    })
  }

  /**
   * Determine what operation should be performed for a file
   * @param {string} filePath - File path
   * @param {Object} sourceFile - Source file info
   * @param {Object} destFile - Destination file info
   * @param {boolean} sourceChanged - Whether source changed since last sync
   * @param {boolean} destChanged - Whether destination changed since last sync
   * @returns {Object|null} Operation object or null if no action needed
   */
  determineOperation(filePath, sourceFile, destFile, sourceChanged, destChanged) {
    // File exists only in source - copy it
    if (sourceFile && !destFile) {
      return {
        type: 'copy',
        path: filePath,
        action: 'Create new file',
        source: sourceFile,
        destination: null,
        priority: 'normal'
      }
    }

    // File exists only in destination - remove it (if it came from source originally)
    if (!sourceFile && destFile) {
      return {
        type: 'delete',
        path: filePath,
        action: 'Remove orphaned file',
        source: null,
        destination: destFile,
        priority: 'low'
      }
    }

    // File exists in both
    if (sourceFile && destFile) {
      // No changes - skip
      if (!sourceChanged && !destChanged) {
        return null
      }

      // Only source changed - update
      if (sourceChanged && !destChanged) {
        return {
          type: 'update',
          path: filePath,
          action: 'Update from source',
          source: sourceFile,
          destination: destFile,
          priority: 'normal'
        }
      }

      // Only destination changed - potential user modification, flag as conflict
      if (!sourceChanged && destChanged) {
        return {
          type: 'conflict',
          path: filePath,
          action: 'User modification detected',
          source: sourceFile,
          destination: destFile,
          priority: 'high',
          conflictType: 'user_modified'
        }
      }

      // Both changed - conflict requiring resolution
      if (sourceChanged && destChanged) {
        return {
          type: 'conflict',
          path: filePath,
          action: 'Both source and destination modified',
          source: sourceFile,
          destination: destFile,
          priority: 'high',
          conflictType: 'both_modified'
        }
      }
    }

    return null
  }

  /**
   * Check if a file was changed in the change set
   * @param {string} filePath - File path to check
   * @param {Object} changes - Changes object from compareHashes
   * @returns {boolean} True if file was changed
   */
  wasFileChanged(filePath, changes) {
    return changes.added.some(f => f.path === filePath) ||
           changes.modified.some(f => f.path === filePath)
  }

  /**
   * Filter file hashes by installation profile
   * @param {Object} hashes - File hashes object
   * @param {string} profile - Profile filter (frontend, backend, shared, or null for all)
   * @returns {Object} Filtered hashes object
   */
  filterByProfile(hashes, profile) {
    if (!profile || profile === 'all' || profile === 'full') {
      return hashes
    }

    const filtered = {}
    
    for (const [filePath, fileInfo] of Object.entries(hashes)) {
      if (this.shouldIncludeInProfile(filePath, profile)) {
        filtered[filePath] = fileInfo
      }
    }

    return filtered
  }

  /**
   * Determine if file should be included in profile
   * @param {string} filePath - File path
   * @param {string} profile - Profile name
   * @returns {boolean} True if should be included
   */
  shouldIncludeInProfile(filePath, profile) {
    // Always include shared files
    if (filePath.startsWith('shared/') || filePath.includes('/shared/')) {
      return true
    }

    // Include files matching the profile
    if (filePath.startsWith(`${profile}/`) || filePath.includes(`/${profile}/`)) {
      return true
    }

    // Include root-level configuration files
    const rootFiles = [
      '.claude/settings.json',
      '.claude/CLAUDE.md',
      '.mcp.json',
      'package.json'
    ]
    
    return rootFiles.some(rootFile => filePath === rootFile || filePath.endsWith(rootFile))
  }

  /**
   * Generate a summary of operations
   * @param {Array} operations - Array of operations
   * @returns {Object} Summary statistics
   */
  generateSummary(operations) {
    const summary = {
      total: operations.length,
      copy: 0,
      update: 0,
      delete: 0,
      conflict: 0,
      skip: 0
    }

    for (const op of operations) {
      summary[op.type] = (summary[op.type] || 0) + 1
    }

    return summary
  }

  /**
   * Calculate estimated size of sync operations
   * @param {Array} operations - Array of operations
   * @returns {Object} Size information
   */
  calculateEstimatedSize(operations) {
    let totalBytes = 0
    let fileCount = 0

    for (const op of operations) {
      if (['copy', 'update'].includes(op.type) && op.source) {
        totalBytes += op.source.size || 0
        fileCount++
      }
    }

    return {
      bytes: totalBytes,
      files: fileCount,
      humanReadable: this.formatBytes(totalBytes)
    }
  }

  /**
   * Format bytes into human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Generate unique plan ID
   * @returns {string} Plan ID
   */
  generatePlanId() {
    return 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Validate that paths exist and are accessible
   * @param {string} sourcePath - Source path
   * @param {string} destPath - Destination path
   * @returns {Promise<Object>} Validation result
   */
  async validatePaths(sourcePath, destPath) {
    const result = {
      valid: true,
      errors: []
    }

    try {
      if (!(await fs.pathExists(sourcePath))) {
        result.errors.push(`Source path does not exist: ${sourcePath}`)
      } else {
        const sourceStats = await fs.stat(sourcePath)
        if (!sourceStats.isDirectory()) {
          result.errors.push(`Source path is not a directory: ${sourcePath}`)
        }
      }
    } catch (error) {
      result.errors.push(`Cannot access source path: ${error.message}`)
    }

    try {
      await fs.ensureDir(destPath)
      const destStats = await fs.stat(destPath)
      if (!destStats.isDirectory()) {
        result.errors.push(`Destination path is not a directory: ${destPath}`)
      }
    } catch (error) {
      result.errors.push(`Cannot access destination path: ${error.message}`)
    }

    result.valid = result.errors.length === 0
    return result
  }
}

module.exports = SyncPlanner