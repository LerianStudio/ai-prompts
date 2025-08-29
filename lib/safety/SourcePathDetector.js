const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

/**
 * SourcePathDetector - Detect Lerian Protocol source installation path
 * Implements multiple fallback strategies to locate the source files
 */
class SourcePathDetector {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 5000,
      cacheEnabled: options.cacheEnabled !== false,
      ...options
    }
    this.metadataFile = '.claude/.lerian-protocol-meta.json'
    this.searchPaths = []
    this.pathCache = null
    this.cacheExpiry = null
    this.cacheDuration = 300000 // Cache for 5 minutes
  }

  /**
   * Main method to detect source path with multiple fallback strategies
   * @returns {Object} Check result with source path information
   */
  async detectSourcePath() {
    const check = {
      id: 'source-path',
      status: 'pending',
      message: 'Detecting Lerian Protocol source path...'
    }

    try {
      // Check cache first if enabled
      if (this.options.cacheEnabled && this.isCacheValid()) {
        return {
          ...check,
          status: 'pass',
          message: `Source path detected: ${this.pathCache} (cached)`,
          sourcePath: this.pathCache
        }
      }

      // Strategy 1: Read from metadata file
      const metadataPath = await this.tryMetadataFile()
      if (metadataPath) {
        this.updateCache(metadataPath)
        return {
          ...check,
          status: 'pass',
          message: `Source path detected: ${metadataPath}`,
          details: ['Located via installation metadata'],
          sourcePath: metadataPath
        }
      }

      // Strategy 2: Check if we're running from source
      const currentDirPath = await this.tryCurrentDirectory()
      if (currentDirPath) {
        this.updateCache(currentDirPath)
        await this.saveMetadata(currentDirPath)
        return {
          ...check,
          status: 'pass',
          message: `Source path detected: ${currentDirPath}`,
          details: ['Running from source directory'],
          sourcePath: currentDirPath
        }
      }

      // Strategy 3: Search common installation locations
      const searchPath = await this.searchCommonLocations()
      if (searchPath) {
        this.updateCache(searchPath)
        await this.saveMetadata(searchPath)
        return {
          ...check,
          status: 'pass',
          message: `Source path found: ${searchPath}`,
          details: ['Located via common installation search'],
          sourcePath: searchPath
        }
      }

      // Strategy 4: Try npm global location
      const npmPath = await this.tryNpmGlobal()
      if (npmPath) {
        this.updateCache(npmPath)
        await this.saveMetadata(npmPath)
        return {
          ...check,
          status: 'pass',
          message: `Source path found: ${npmPath}`,
          details: ['Located via npm global installation'],
          sourcePath: npmPath
        }
      }

      // Strategy 5: Try module resolution
      const modulePath = await this.tryModuleResolution()
      if (modulePath) {
        this.updateCache(modulePath)
        await this.saveMetadata(modulePath)
        return {
          ...check,
          status: 'pass',
          message: `Source path found: ${modulePath}`,
          details: ['Located via Node.js module resolution'],
          sourcePath: modulePath
        }
      }

      // All strategies failed
      return {
        ...check,
        status: 'fail',
        message: 'Cannot locate Lerian Protocol source',
        details: [
          'Searched locations:',
          ...this.searchPaths,
          '',
          'To fix this issue:',
          '1. Reinstall lerian-protocol: npm install -g lerian-protocol',
          '2. Or run from project where lerian-protocol is installed locally',
          '3. Set LERIAN_PROTOCOL_PATH environment variable',
          '4. Use --source-path flag to specify location manually'
        ]
      }
    } catch (error) {
      return {
        ...check,
        status: 'fail',
        message: 'Source path detection failed',
        details: [
          error.message,
          'This may indicate system issues or permission problems'
        ]
      }
    }
  }

  /**
   * Try to read source path from metadata file
   * @returns {string|null} Source path if found and valid
   */
  async tryMetadataFile() {
    try {
      if (await fs.pathExists(this.metadataFile)) {
        this.searchPaths.push(this.metadataFile)
        const metadata = await fs.readJson(this.metadataFile)
        
        if (metadata.sourcePath && await this.validateSourcePath(metadata.sourcePath)) {
          return metadata.sourcePath
        }
        
        // Metadata exists but path is invalid - remove it
        await fs.remove(this.metadataFile).catch(() => {}) // Ignore errors
      }
    } catch {
      // Metadata file is corrupted or inaccessible, continue with other strategies
    }
    return null
  }

  /**
   * Try current working directory or its parents
   * @returns {string|null} Source path if found and valid
   */
  async tryCurrentDirectory() {
    let currentDir = process.cwd()
    const maxDepth = 5 // Prevent infinite loops
    
    for (let i = 0; i < maxDepth; i++) {
      this.searchPaths.push(currentDir)
      if (await this.validateSourcePath(currentDir)) {
        return currentDir
      }
      
      const parentDir = path.dirname(currentDir)
      if (parentDir === currentDir) {break} // Reached root
      currentDir = parentDir
    }
    
    return null
  }

  /**
   * Search common installation locations
   * @returns {string|null} Source path if found and valid
   */
  async searchCommonLocations() {
    const commonPaths = [
      // Local node_modules (current and parent directories)
      path.join(process.cwd(), 'node_modules', 'lerian-protocol'),
      path.join(path.dirname(process.cwd()), 'node_modules', 'lerian-protocol'),
      
      // Global npm installations
      path.join(os.homedir(), '.npm-global', 'lib', 'node_modules', 'lerian-protocol'),
      path.join('/usr/local/lib/node_modules/lerian-protocol'),
      path.join('/usr/lib/node_modules/lerian-protocol'),
      
      // Alternative global locations
      path.join('/opt/lerian-protocol'),
      path.join(os.homedir(), '.local', 'lib', 'lerian-protocol'),
      
      // Development locations
      path.join(os.homedir(), 'Projects', 'lerian-protocol'),
      path.join(os.homedir(), 'Development', 'lerian-protocol'),
      path.join(os.homedir(), 'Code', 'lerian-protocol'),
      
      // Windows specific paths
      ...(process.platform === 'win32' ? [
        path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'lerian-protocol'),
        path.join(process.env.PROGRAMFILES || '', 'nodejs', 'node_modules', 'lerian-protocol'),
      ] : [])
    ]

    for (const searchPath of commonPaths) {
      this.searchPaths.push(searchPath)
      if (await this.validateSourcePath(searchPath)) {
        return searchPath
      }
    }
    
    return null
  }

  /**
   * Try to find via npm global installation
   * @returns {string|null} Source path if found and valid
   */
  async tryNpmGlobal() {
    try {
      const npmRoot = execSync('npm root -g', { 
        encoding: 'utf8', 
        timeout: this.options.timeout 
      }).trim()
      const npmPath = path.join(npmRoot, 'lerian-protocol')
      
      this.searchPaths.push(npmPath)
      if (await this.validateSourcePath(npmPath)) {
        return npmPath
      }
    } catch {
      // npm command failed or not available, skip this strategy
    }
    return null
  }

  /**
   * Try Node.js module resolution
   * @returns {string|null} Source path if found and valid
   */
  async tryModuleResolution() {
    try {
      // Try to resolve the main module
      const mainModule = require.resolve('lerian-protocol')
      if (mainModule) {
        // Go up from the main file to find the package root
        let modulePath = path.dirname(mainModule)
        const maxDepth = 10
        
        for (let i = 0; i < maxDepth; i++) {
          this.searchPaths.push(modulePath)
          if (await this.validateSourcePath(modulePath)) {
            return modulePath
          }
          
          const parentPath = path.dirname(modulePath)
          if (parentPath === modulePath) {break} // Reached root
          modulePath = parentPath
        }
      }
    } catch {
      // Module resolution failed
    }
    
    // Try resolving package.json location
    try {
      const packagePath = require.resolve('lerian-protocol/package.json')
      if (packagePath) {
        const modulePath = path.dirname(packagePath)
        this.searchPaths.push(modulePath)
        if (await this.validateSourcePath(modulePath)) {
          return modulePath
        }
      }
    } catch {
      // Package resolution failed
    }
    
    return null
  }

  /**
   * Validate that a path contains a valid Lerian Protocol installation
   * @param {string} sourcePath - Path to validate
   * @returns {boolean} True if path contains valid installation
   */
  async validateSourcePath(sourcePath) {
    try {
      if (!sourcePath || !await fs.pathExists(sourcePath)) {
        return false
      }

      // Check for required files and directories
      const requiredFiles = [
        'package.json',
        'lib/installer.js'
      ]
      
      const requiredDirectories = [
        '.claude',
        'protocol-assets'
      ]

      // Check required files
      for (const file of requiredFiles) {
        const filePath = path.join(sourcePath, file)
        if (!await fs.pathExists(filePath)) {
          return false
        }
      }

      // Check required directories
      for (const dir of requiredDirectories) {
        const dirPath = path.join(sourcePath, dir)
        if (!await fs.pathExists(dirPath)) {
          return false
        }
      }

      // Validate package.json contains correct package
      const packageJsonPath = path.join(sourcePath, 'package.json')
      const packageJson = await fs.readJson(packageJsonPath)
      
      if (packageJson.name !== 'lerian-protocol') {
        return false
      }

      // Additional integrity checks
      return await this.performIntegrityChecks(sourcePath)
    } catch {
      return false
    }
  }

  /**
   * Perform additional integrity checks on the source path
   * @param {string} sourcePath - Path to check
   * @returns {boolean} True if integrity checks pass
   */
  async performIntegrityChecks(sourcePath) {
    try {
      // Check for essential Claude configuration files
      const claudeFiles = [
        '.claude/CLAUDE.md',
        '.claude/agents',
        '.claude/commands'
      ]
      
      for (const file of claudeFiles) {
        const filePath = path.join(sourcePath, file)
        if (!await fs.pathExists(filePath)) {
          return false
        }
      }

      // Check for protocol assets structure
      const protocolAssets = [
        'protocol-assets/board',
        'protocol-assets/context'
      ]
      
      for (const asset of protocolAssets) {
        const assetPath = path.join(sourcePath, asset)
        if (!await fs.pathExists(assetPath)) {
          return false
        }
      }

      // Verify installer exists and is executable
      const installerPath = path.join(sourcePath, 'lib/installer.js')
      const installerStat = await fs.stat(installerPath)
      if (!installerStat.isFile()) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Save source path to metadata file for future use
   * @param {string} sourcePath - Source path to save
   */
  async saveMetadata(sourcePath) {
    try {
      const metadata = {
        sourcePath,
        detectedAt: new Date().toISOString(),
        detectionMethod: 'auto',
        version: await this.getSourceVersion(sourcePath)
      }

      // Ensure .claude directory exists
      const claudeDir = path.dirname(this.metadataFile)
      await fs.ensureDir(claudeDir)
      
      await fs.writeJson(this.metadataFile, metadata, { spaces: 2 })
    } catch {
      // Ignore metadata save errors - not critical
    }
  }

  /**
   * Get version information from source path
   * @param {string} sourcePath - Source path
   * @returns {string|null} Version string
   */
  async getSourceVersion(sourcePath) {
    try {
      const packageJsonPath = path.join(sourcePath, 'package.json')
      const packageJson = await fs.readJson(packageJsonPath)
      return packageJson.version || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Update cache with found source path
   * @param {string} sourcePath - Source path to cache
   */
  updateCache(sourcePath) {
    if (this.options.cacheEnabled) {
      this.pathCache = sourcePath
      this.cacheExpiry = Date.now() + this.cacheDuration
    }
  }

  /**
   * Check if cache is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    return this.pathCache && 
           this.cacheExpiry && 
           Date.now() < this.cacheExpiry
  }

  /**
   * Clear cached source path
   */
  clearCache() {
    this.pathCache = null
    this.cacheExpiry = null
  }

  /**
   * Set source path manually (for edge cases and testing)
   * @param {string} sourcePath - Manual source path
   * @returns {Object} Validation result
   */
  async setManualSourcePath(sourcePath) {
    const isValid = await this.validateSourcePath(sourcePath)
    
    if (isValid) {
      this.updateCache(sourcePath)
      await this.saveMetadata(sourcePath)
      
      return {
        id: 'source-path-manual',
        status: 'pass',
        message: `Manual source path set: ${sourcePath}`,
        sourcePath
      }
    } else {
      return {
        id: 'source-path-manual',
        status: 'fail',
        message: 'Invalid source path provided',
        details: [
          `Path: ${sourcePath}`,
          'This path does not contain a valid Lerian Protocol installation'
        ]
      }
    }
  }

  /**
   * Get all searched paths for debugging
   * @returns {Array} Array of searched paths
   */
  getSearchedPaths() {
    return [...this.searchPaths]
  }

  /**
   * Check if source path is currently available
   * @returns {Object} Availability check result
   */
  async checkAvailability() {
    if (this.pathCache && await this.validateSourcePath(this.pathCache)) {
      return {
        available: true,
        path: this.pathCache,
        cached: true
      }
    }

    const result = await this.detectSourcePath()
    return {
      available: result.status === 'pass',
      path: result.sourcePath || null,
      cached: false,
      error: result.status === 'fail' ? result.message : null
    }
  }

  /**
   * Get environment variable fallback path
   * @returns {string|null} Environment variable path if set
   */
  getEnvironmentPath() {
    const envPath = process.env.LERIAN_PROTOCOL_PATH
    if (envPath) {
      this.searchPaths.push(`${envPath} (LERIAN_PROTOCOL_PATH)`)
    }
    return envPath
  }
}

module.exports = SourcePathDetector