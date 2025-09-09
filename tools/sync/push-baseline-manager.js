const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

/**
 * Manages push baselines for detecting changes independent of git state
 */
class PushBaselineManager {
  constructor(options = {}) {
    this.baselineFileName = options.baselineFileName || '.lerian-push-baseline.json'
    this.algorithm = options.algorithm || 'sha256'
    this.encoding = options.encoding || 'hex'
  }

  /**
   * Get the baseline file path for a project
   * @param {string} projectPath - Target project path
   * @returns {string} Full path to baseline file
   */
  getBaselinePath(projectPath) {
    return path.join(projectPath, '.claude', this.baselineFileName)
  }

  /**
   * Check if baseline exists for a project
   * @param {string} projectPath - Target project path
   * @returns {Promise<boolean>} True if baseline exists
   */
  async hasBaseline(projectPath) {
    const baselinePath = this.getBaselinePath(projectPath)
    return await fs.pathExists(baselinePath)
  }

  /**
   * Read baseline from file
   * @param {string} projectPath - Target project path
   * @returns {Promise<Object|null>} Baseline data or null if doesn't exist
   */
  async readBaseline(projectPath) {
    const baselinePath = this.getBaselinePath(projectPath)
    
    try {
      if (!(await fs.pathExists(baselinePath))) {
        return null
      }

      const data = await fs.readJSON(baselinePath)
      
      // Validate baseline structure
      if (!this.isValidBaseline(data)) {
        console.warn('Invalid baseline format, will regenerate')
        return null
      }

      return data
    } catch (error) {
      console.warn(`Could not read baseline: ${error.message}`)
      return null
    }
  }

  /**
   * Create baseline from current file state
   * @param {string} projectPath - Target project path
   * @param {Object} fileHashes - Current file hashes from FileHasher
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created baseline
   */
  async createBaseline(projectPath, fileHashes, options = {}) {
    const baseline = {
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      projectPath: path.resolve(projectPath),
      algorithm: this.algorithm,
      fileCount: Object.keys(fileHashes).length,
      files: {},
      metadata: {
        createdBy: 'lerian-protocol',
        reason: options.reason || 'manual_creation',
        profile: options.profile || 'default'
      }
    }

    // Store file hashes and metadata
    for (const [filePath, fileInfo] of Object.entries(fileHashes)) {
      baseline.files[filePath] = {
        hash: fileInfo.hash,
        size: fileInfo.size,
        mtime: fileInfo.mtime,
        baselineTime: baseline.created
      }
    }

    await this.writeBaseline(projectPath, baseline)
    return baseline
  }

  /**
   * Update baseline with new file states
   * @param {string} projectPath - Target project path
   * @param {Object} fileHashes - New file hashes
   * @param {Array} pushedFiles - List of files that were pushed
   * @returns {Promise<Object>} Updated baseline
   */
  async updateBaseline(projectPath, fileHashes, pushedFiles = []) {
    let baseline = await this.readBaseline(projectPath)
    
    if (!baseline) {
      // No existing baseline, create new one
      return await this.createBaseline(projectPath, fileHashes, { 
        reason: 'post_push_creation' 
      })
    }

    // Update metadata
    baseline.updated = new Date().toISOString()
    baseline.fileCount = Object.keys(fileHashes).length

    // Update file information
    baseline.files = {}
    for (const [filePath, fileInfo] of Object.entries(fileHashes)) {
      baseline.files[filePath] = {
        hash: fileInfo.hash,
        size: fileInfo.size,
        mtime: fileInfo.mtime,
        baselineTime: baseline.updated,
        wasPushed: pushedFiles.includes(filePath)
      }
    }

    await this.writeBaseline(projectPath, baseline)
    return baseline
  }

  /**
   * Compare current files against baseline to detect changes
   * @param {string} projectPath - Target project path
   * @param {Object} currentFileHashes - Current file hashes
   * @returns {Promise<Object>} Change detection result
   */
  async detectChanges(projectPath, currentFileHashes) {
    const baseline = await this.readBaseline(projectPath)
    
    if (!baseline) {
      return {
        hasBaseline: false,
        changes: {
          added: Object.keys(currentFileHashes).map(path => ({ path, ...currentFileHashes[path] })),
          modified: [],
          deleted: [],
          unchanged: []
        },
        summary: {
          total: Object.keys(currentFileHashes).length,
          added: Object.keys(currentFileHashes).length,
          modified: 0,
          deleted: 0,
          unchanged: 0
        }
      }
    }

    const changes = {
      added: [],
      modified: [],
      deleted: [],
      unchanged: []
    }

    const currentFiles = new Set(Object.keys(currentFileHashes))
    const baselineFiles = new Set(Object.keys(baseline.files))

    // Find added files
    for (const filePath of currentFiles) {
      if (!baselineFiles.has(filePath)) {
        changes.added.push({ path: filePath, ...currentFileHashes[filePath] })
      }
    }

    // Find deleted files
    for (const filePath of baselineFiles) {
      if (!currentFiles.has(filePath)) {
        changes.deleted.push({ path: filePath, ...baseline.files[filePath] })
      }
    }

    // Find modified and unchanged files
    for (const filePath of currentFiles) {
      if (baselineFiles.has(filePath)) {
        const currentFile = currentFileHashes[filePath]
        const baselineFile = baseline.files[filePath]

        if (currentFile.hash !== baselineFile.hash) {
          changes.modified.push({
            path: filePath,
            current: currentFile,
            baseline: baselineFile
          })
        } else {
          changes.unchanged.push({ path: filePath, ...currentFile })
        }
      }
    }

    return {
      hasBaseline: true,
      changes,
      summary: {
        total: changes.added.length + changes.modified.length + changes.deleted.length + changes.unchanged.length,
        added: changes.added.length,
        modified: changes.modified.length,
        deleted: changes.deleted.length,
        unchanged: changes.unchanged.length
      }
    }
  }

  /**
   * Write baseline to file
   * @param {string} projectPath - Target project path
   * @param {Object} baseline - Baseline data
   */
  async writeBaseline(projectPath, baseline) {
    const baselinePath = this.getBaselinePath(projectPath)
    
    // Ensure .claude directory exists
    await fs.ensureDir(path.dirname(baselinePath))
    
    // Write with formatting for readability
    await fs.writeJSON(baselinePath, baseline, { spaces: 2 })
  }

  /**
   * Delete baseline file
   * @param {string} projectPath - Target project path
   */
  async deleteBaseline(projectPath) {
    const baselinePath = this.getBaselinePath(projectPath)
    if (await fs.pathExists(baselinePath)) {
      await fs.remove(baselinePath)
    }
  }

  /**
   * Validate baseline data structure
   * @param {Object} data - Baseline data to validate
   * @returns {boolean} True if valid
   */
  isValidBaseline(data) {
    return (
      data &&
      typeof data === 'object' &&
      data.version &&
      data.created &&
      data.files &&
      typeof data.files === 'object'
    )
  }

  /**
   * Get baseline statistics
   * @param {string} projectPath - Target project path
   * @returns {Promise<Object|null>} Baseline stats or null
   */
  async getBaselineStats(projectPath) {
    const baseline = await this.readBaseline(projectPath)
    
    if (!baseline) {
      return null
    }

    return {
      version: baseline.version,
      created: baseline.created,
      updated: baseline.updated,
      fileCount: baseline.fileCount,
      age: new Date() - new Date(baseline.updated),
      ageHours: (new Date() - new Date(baseline.updated)) / (1000 * 60 * 60)
    }
  }
}

module.exports = PushBaselineManager