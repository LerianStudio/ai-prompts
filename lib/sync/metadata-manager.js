const fs = require('fs-extra')
const path = require('path')

class MetadataManager {
  constructor() {
    this.metaFilename = '.lerian-protocol-meta.json'
  }

  async createMetadata(projectPath, sourcePath) {
    const metaPath = path.join(projectPath, '.claude', this.metaFilename)
    const metadata = {
      version: '1.0.0',
      sourcePath: path.resolve(sourcePath),
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

    // Check if it's actually a lerian-protocol source directory
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
}

module.exports = MetadataManager