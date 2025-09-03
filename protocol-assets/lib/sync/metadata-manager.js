const fs = require('fs-extra')
const path = require('path')

class MetadataManager {
  constructor() {
    this.metaFilename = '.lerian-protocol-meta.json'
    this.syncMetaFilename = '.lerian-sync-meta.json'
  }

  async createMetadata(projectPath, sourcePath, options = {}) {
    const metaPath = path.join(projectPath, '.claude', this.metaFilename)
    const metadata = {
      version: '1.0.0',
      sourcePath: path.resolve(sourcePath),
      profile: options.profile || 'full',
      installedAt: new Date().toISOString(),
      lastSync: null
    }
    
    await fs.ensureDir(path.dirname(metaPath))
    await fs.writeJSON(metaPath, metadata, { spaces: 2 })
    return metaPath
  }

  async readMetadata(projectPath) {
    const metaPath = path.join(projectPath, '.claude', this.metaFilename)
    
    if (!(await fs.pathExists(metaPath))) {
      throw new Error(`Metadata file not found. Please reinstall lerian-protocol or run from a project with lerian-protocol installed.`)
    }
    
    return await fs.readJSON(metaPath)
  }

  /**
   * Update last sync timestamp
   * @param {string} projectPath - Path to project
   */
  async updateSyncTimestamp(projectPath) {
    const metadata = await this.readMetadata(projectPath)
    metadata.lastSync = new Date().toISOString()
    
    const metaPath = path.join(projectPath, '.claude', this.metaFilename)
    await fs.writeJSON(metaPath, metadata, { spaces: 2 })
  }

  /**
   * Validate that source path exists and is accessible
   * @param {Object} metadata - Metadata object
   */
  async validateSourcePath(metadata) {
    if (!metadata.sourcePath) {
      throw new Error('Source path not found in metadata')
    }

    if (!(await fs.pathExists(metadata.sourcePath))) {
      throw new Error(`Source path does not exist: ${metadata.sourcePath}`)
    }

    const packageJsonPath = path.join(metadata.sourcePath, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJSON(packageJsonPath)
        if (packageJson.name !== 'lerian-protocol') {
          throw new Error(`Invalid source directory: not a lerian-protocol project`)
        }
      } catch (error) {
        throw new Error(`Cannot read package.json from source: ${error.message}`)
      }
    }

    return true
  }

  /**
   * Save sync metadata including file hashes and sync state
   * @param {string} projectPath - Path to project
   * @param {Object} syncData - Sync metadata to save
   */
  async saveSyncMetadata(projectPath, syncData) {
    const syncMetaPath = path.join(projectPath, '.claude', this.syncMetaFilename)
    const metadata = {
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      syncId: syncData.planId || `sync-${Date.now()}`,
      sourcePath: syncData.sourcePath,
      profile: syncData.profile || 'full',
      ...syncData
    }
    
    await fs.ensureDir(path.dirname(syncMetaPath))
    await fs.writeJSON(syncMetaPath, metadata, { spaces: 2 })
    return syncMetaPath
  }

  /**
   * Read sync metadata
   * @param {string} projectPath - Path to project
   * @returns {Promise<Object|null>} Sync metadata or null if not found
   */
  async readSyncMetadata(projectPath) {
    const syncMetaPath = path.join(projectPath, '.claude', this.syncMetaFilename)
    
    if (!(await fs.pathExists(syncMetaPath))) {
      return null
    }
    
    try {
      return await fs.readJSON(syncMetaPath)
    } catch (error) {
      console.warn(`Warning: Could not read sync metadata: ${error.message}`)
      return null
    }
  }

  /**
   * Get last sync file hashes
   * @param {string} projectPath - Path to project
   * @returns {Promise<Object>} File hashes from last sync
   */
  async getLastSyncHashes(projectPath) {
    const syncMeta = await this.readSyncMetadata(projectPath)
    
    if (!syncMeta || !syncMeta.snapshots || !syncMeta.snapshots.source) {
      return {}
    }

    return syncMeta.snapshots.source.hashes || {}
  }

  /**
   * Update sync metadata with new file hashes
   * @param {string} projectPath - Path to project
   * @param {Object} sourceSnapshot - Source snapshot with file hashes
   * @param {Object} operations - Completed sync operations
   */
  async updateSyncHashes(projectPath, sourceSnapshot, operations) {
    const existing = await this.readSyncMetadata(projectPath) || {}
    
    const updated = {
      ...existing,
      lastSync: new Date().toISOString(),
      snapshots: {
        source: sourceSnapshot
      },
      lastOperations: {
        timestamp: new Date().toISOString(),
        operationCount: operations.length,
        summary: this.summarizeOperations(operations)
      }
    }

    await this.saveSyncMetadata(projectPath, updated)
  }

  /**
   * Create summary of sync operations
   * @param {Array} operations - Array of sync operations
   * @returns {Object} Operation summary
   */
  summarizeOperations(operations) {
    const summary = {
      total: operations.length,
      successful: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of operations) {
      if (op.status === 'completed') {
        summary.successful++
      } else if (op.status === 'failed') {
        summary.failed++
      } else {
        summary.skipped++
      }
    }

    return summary
  }

  /**
   * Check if sync metadata exists and is valid
   * @param {string} projectPath - Path to project
   * @returns {Promise<boolean>} True if valid sync metadata exists
   */
  async hasSyncMetadata(projectPath) {
    try {
      const syncMeta = await this.readSyncMetadata(projectPath)
      return syncMeta !== null && 
             syncMeta.version &&
             syncMeta.lastSync &&
             syncMeta.sourcePath
    } catch {
      return false
    }
  }

  /**
   * Clean up old sync metadata and backup files
   * @param {string} projectPath - Path to project
   * @param {number} daysToKeep - Days of history to retain
   */
  async cleanupSyncHistory(projectPath, daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    // Clean up old backup directories
    const backupDir = path.join(projectPath, '.sync-backup')
    
    if (await fs.pathExists(backupDir)) {
      const backupEntries = await fs.readdir(backupDir, { withFileTypes: true })
      
      for (const entry of backupEntries) {
        if (entry.isDirectory()) {
          const backupPath = path.join(backupDir, entry.name)
          const stats = await fs.stat(backupPath)
          
          if (stats.mtime < cutoffDate) {
            await fs.remove(backupPath)
          }
        }
      }
    }
  }
}

module.exports = MetadataManager