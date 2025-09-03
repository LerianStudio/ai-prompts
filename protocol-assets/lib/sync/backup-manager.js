const fs = require('fs-extra')
const path = require('path')

class BackupManager {
  constructor(options = {}) {
    this.backupBaseDir = options.backupBaseDir || '.sync-backup'
    this.maxBackups = options.maxBackups || 10
    this.compressionEnabled = options.compressionEnabled || false
  }

  /**
   * Create a timestamped backup of files before sync operations
   * @param {string} projectPath - Project directory path
   * @param {Array} operations - Array of sync operations
   * @param {string} syncId - Sync operation ID
   * @returns {Promise<string>} Backup directory path
   */
  async createBackup(projectPath, operations, syncId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDirName = `${timestamp}_${syncId}`
    const backupDir = path.join(projectPath, this.backupBaseDir, backupDirName)
    
    await fs.ensureDir(backupDir)
    
    const backupManifest = {
      timestamp: new Date().toISOString(),
      syncId,
      projectPath: path.resolve(projectPath),
      operationCount: operations.length,
      files: []
    }

    let backedUpFiles = 0

    for (const operation of operations) {
      if (this.shouldBackupOperation(operation)) {
        try {
          const backed = await this.backupOperationFile(projectPath, backupDir, operation)
          if (backed) {
            backupManifest.files.push(backed)
            backedUpFiles++
          }
        } catch (error) {
          console.warn(`Warning: Could not backup file for operation ${operation.path}:`, error.message)
        }
      }
    }

    // Save backup manifest
    const manifestPath = path.join(backupDir, 'manifest.json')
    await fs.writeJSON(manifestPath, backupManifest, { spaces: 2 })

    // Clean up old backups if we exceed max limit
    await this.cleanupOldBackups(projectPath)

    console.log(`✅ Created backup with ${backedUpFiles} files: ${backupDirName}`)
    return backupDir
  }

  /**
   * Determine if an operation requires backing up the destination file
   * @param {Object} operation - Sync operation
   * @returns {boolean} True if should backup
   */
  shouldBackupOperation(operation) {
    // Backup files that will be modified or deleted
    return ['update', 'conflict'].includes(operation.type) && 
           operation.destination && 
           operation.destination.type === 'file'
  }

  /**
   * Backup a single file for an operation
   * @param {string} projectPath - Project directory
   * @param {string} backupDir - Backup directory
   * @param {Object} operation - Sync operation
   * @returns {Promise<Object|null>} Backup file info or null
   */
  async backupOperationFile(projectPath, backupDir, operation) {
    const sourcePath = path.join(projectPath, operation.path)
    
    if (!(await fs.pathExists(sourcePath))) {
      return null
    }

    // Create subdirectories in backup to maintain structure
    const backupFilePath = path.join(backupDir, 'files', operation.path)
    await fs.ensureDir(path.dirname(backupFilePath))
    
    // Copy the file
    await fs.copy(sourcePath, backupFilePath, { 
      preserveTimestamps: true,
      overwrite: true
    })

    const stats = await fs.stat(sourcePath)
    
    return {
      originalPath: operation.path,
      backupPath: path.relative(backupDir, backupFilePath),
      size: stats.size,
      mtime: stats.mtime.toISOString(),
      operation: operation.type
    }
  }

  /**
   * Restore files from a backup
   * @param {string} projectPath - Project directory
   * @param {string} backupId - Backup ID or directory name
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreFromBackup(projectPath, backupId, options = {}) {
    const backupDir = path.join(projectPath, this.backupBaseDir, backupId)
    
    if (!(await fs.pathExists(backupDir))) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    const manifestPath = path.join(backupDir, 'manifest.json')
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Backup manifest not found: ${backupId}`)
    }

    const manifest = await fs.readJSON(manifestPath)
    const result = {
      restored: [],
      failed: [],
      skipped: []
    }

    for (const fileInfo of manifest.files) {
      try {
        const success = await this.restoreFile(projectPath, backupDir, fileInfo, options)
        if (success) {
          result.restored.push(fileInfo.originalPath)
        } else {
          result.skipped.push(fileInfo.originalPath)
        }
      } catch (error) {
        result.failed.push({
          path: fileInfo.originalPath,
          error: error.message
        })
      }
    }

    return result
  }

  /**
   * Restore a single file from backup
   * @param {string} projectPath - Project directory
   * @param {string} backupDir - Backup directory
   * @param {Object} fileInfo - File info from manifest
   * @param {Object} options - Restore options
   * @returns {Promise<boolean>} True if restored
   */
  async restoreFile(projectPath, backupDir, fileInfo, options) {
    const destPath = path.join(projectPath, fileInfo.originalPath)
    const backupFilePath = path.join(backupDir, fileInfo.backupPath)
    
    if (!(await fs.pathExists(backupFilePath))) {
      throw new Error(`Backup file not found: ${fileInfo.backupPath}`)
    }

    // Check if destination file exists and handle conflicts
    if (await fs.pathExists(destPath)) {
      if (!options.overwrite && !options.interactive) {
        return false // Skipped
      }
      
      if (options.interactive) {
        // In a real implementation, this would prompt the user
        // For now, we'll assume overwrite
        console.log(`Would prompt user about overwriting: ${fileInfo.originalPath}`)
      }
    }

    await fs.ensureDir(path.dirname(destPath))
    await fs.copy(backupFilePath, destPath, { 
      preserveTimestamps: true,
      overwrite: true
    })

    return true
  }

  /**
   * List available backups
   * @param {string} projectPath - Project directory
   * @returns {Promise<Array>} Array of backup info objects
   */
  async listBackups(projectPath) {
    const backupBaseDir = path.join(projectPath, this.backupBaseDir)
    
    if (!(await fs.pathExists(backupBaseDir))) {
      return []
    }

    const backups = []
    const entries = await fs.readdir(backupBaseDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const backupDir = path.join(backupBaseDir, entry.name)
        const manifestPath = path.join(backupDir, 'manifest.json')
        
        try {
          if (await fs.pathExists(manifestPath)) {
            const manifest = await fs.readJSON(manifestPath)
            const stats = await fs.stat(backupDir)
            
            backups.push({
              id: entry.name,
              timestamp: manifest.timestamp,
              syncId: manifest.syncId,
              fileCount: manifest.files.length,
              size: await this.calculateBackupSize(backupDir),
              created: stats.birthtime.toISOString()
            })
          }
        } catch (error) {
          console.warn(`Warning: Could not read backup manifest for ${entry.name}:`, error.message)
        }
      }
    }

    // Sort by timestamp, newest first
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  /**
   * Calculate total size of backup directory
   * @param {string} backupDir - Backup directory path
   * @returns {Promise<number>} Size in bytes
   */
  async calculateBackupSize(backupDir) {
    let totalSize = 0
    
    const traverse = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await traverse(fullPath)
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath)
          totalSize += stats.size
        }
      }
    }

    await traverse(backupDir)
    return totalSize
  }

  /**
   * Clean up old backups beyond the maximum limit
   * @param {string} projectPath - Project directory
   */
  async cleanupOldBackups(projectPath) {
    const backups = await this.listBackups(projectPath)
    
    if (backups.length <= this.maxBackups) {
      return
    }

    const backupsToDelete = backups.slice(this.maxBackups)
    const backupBaseDir = path.join(projectPath, this.backupBaseDir)

    for (const backup of backupsToDelete) {
      const backupDir = path.join(backupBaseDir, backup.id)
      
      try {
        await fs.remove(backupDir)
        console.log(`🧹 Cleaned up old backup: ${backup.id}`)
      } catch (error) {
        console.warn(`Warning: Could not delete backup ${backup.id}:`, error.message)
      }
    }
  }

  /**
   * Delete a specific backup
   * @param {string} projectPath - Project directory
   * @param {string} backupId - Backup ID to delete
   */
  async deleteBackup(projectPath, backupId) {
    const backupDir = path.join(projectPath, this.backupBaseDir, backupId)
    
    if (!(await fs.pathExists(backupDir))) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    await fs.remove(backupDir)
  }

  /**
   * Validate backup integrity
   * @param {string} projectPath - Project directory
   * @param {string} backupId - Backup ID to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateBackup(projectPath, backupId) {
    const backupDir = path.join(projectPath, this.backupBaseDir, backupId)
    const manifestPath = path.join(backupDir, 'manifest.json')
    
    if (!(await fs.pathExists(manifestPath))) {
      return { valid: false, error: 'Manifest file missing' }
    }

    try {
      const manifest = await fs.readJSON(manifestPath)
      const result = {
        valid: true,
        checked: 0,
        missing: [],
        errors: []
      }

      for (const fileInfo of manifest.files) {
        const backupFilePath = path.join(backupDir, fileInfo.backupPath)
        result.checked++
        
        if (!(await fs.pathExists(backupFilePath))) {
          result.missing.push(fileInfo.originalPath)
          result.valid = false
        }
      }

      return result
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Get backup statistics
   * @param {string} projectPath - Project directory
   * @returns {Promise<Object>} Backup statistics
   */
  async getBackupStats(projectPath) {
    const backups = await this.listBackups(projectPath)
    const backupBaseDir = path.join(projectPath, this.backupBaseDir)
    
    let totalSize = 0
    let totalFiles = 0
    
    for (const backup of backups) {
      totalSize += backup.size
      totalFiles += backup.fileCount
    }

    const stats = {
      backupCount: backups.length,
      totalSize,
      totalFiles,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].timestamp : null,
      averageSize: backups.length > 0 ? Math.round(totalSize / backups.length) : 0
    }

    return stats
  }
}

module.exports = BackupManager