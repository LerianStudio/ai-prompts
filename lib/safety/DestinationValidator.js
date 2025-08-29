const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

/**
 * DestinationValidator - Validate destination paths and permissions
 * Checks write permissions, disk space, and directory structure
 */
class DestinationValidator {
  constructor(options = {}) {
    this.options = {
      minDiskSpace: options.minDiskSpace || 100 * 1024 * 1024, // 100MB default
      testFilePrefix: options.testFilePrefix || '.lerian-test',
      ...options
    }
    this.destinationPaths = ['.claude', 'protocol-assets']
    this.permissionCache = new Map()
    this.diskSpaceCache = null
    this.cacheExpiry = null
    this.cacheDuration = 60000 // 1 minute cache
  }

  /**
   * Perform all destination validation checks
   * @returns {Array} Array of check results
   */
  async performChecks() {
    const checks = []
    
    try {
      // Check base directory permissions
      const baseCheck = await this.checkBaseDirectoryPermissions()
      checks.push(baseCheck)

      // Check each destination directory
      for (const destPath of this.destinationPaths) {
        const dirCheck = await this.checkDestinationDirectory(destPath)
        checks.push(dirCheck)
        
        const permCheck = await this.checkDirectoryPermissions(destPath)
        checks.push(permCheck)
      }

      // Check disk space
      const spaceCheck = await this.checkDiskSpace()
      checks.push(spaceCheck)

      // Check filesystem characteristics
      const fsCheck = await this.checkFilesystemCharacteristics()
      checks.push(fsCheck)

    } catch (error) {
      checks.push({
        id: 'destination-error',
        status: 'fail',
        message: 'Destination validation failed',
        details: [
          error.message,
          'This may indicate permission issues or system problems'
        ]
      })
    }

    return checks
  }

  /**
   * Check base directory (current working directory) permissions
   * @returns {Object} Check result
   */
  async checkBaseDirectoryPermissions() {
    const baseDir = process.cwd()
    
    try {
      // Test basic read access
      await fs.readdir(baseDir)
      
      // Test write access with temporary file
      const testFile = path.join(baseDir, `${this.options.testFilePrefix}-${Date.now()}`)
      
      try {
        await fs.writeFile(testFile, 'test', 'utf8')
        await fs.remove(testFile)
        
        return {
          id: 'base-directory',
          status: 'pass',
          message: `Base directory accessible: ${baseDir}`,
          details: [`Read/write permissions confirmed`],
          path: baseDir
        }
      } catch (writeError) {
        return {
          id: 'base-directory',
          status: 'fail',
          message: 'Base directory is not writable',
          details: [
            `Directory: ${baseDir}`,
            `Error: ${writeError.message}`,
            '',
            'Solutions:',
            '• Check directory permissions: ls -la',
            '• Change to a writable directory',
            `• Fix permissions: chmod 755 "${baseDir}"`
          ],
          path: baseDir
        }
      }
    } catch (error) {
      return {
        id: 'base-directory',
        status: 'fail',
        message: 'Cannot access base directory',
        details: [
          `Directory: ${baseDir}`,
          `Error: ${error.message}`,
          '',
          'This directory may not exist or is not accessible'
        ],
        path: baseDir
      }
    }
  }

  /**
   * Check specific destination directory
   * @param {string} destPath - Destination path to check
   * @returns {Object} Check result
   */
  async checkDestinationDirectory(destPath) {
    const fullPath = path.resolve(destPath)
    
    try {
      const exists = await fs.pathExists(fullPath)
      
      if (!exists) {
        // Try to create the directory
        try {
          await fs.ensureDir(fullPath)
          return {
            id: `dest-dir-${destPath}`,
            status: 'pass',
            message: `Created destination directory: ${destPath}`,
            details: [`Directory created at: ${fullPath}`],
            path: fullPath,
            created: true
          }
        } catch (createError) {
          return {
            id: `dest-dir-${destPath}`,
            status: 'fail',
            message: `Cannot create destination directory: ${destPath}`,
            details: [
              `Path: ${fullPath}`,
              `Error: ${createError.message}`,
              '',
              'Solutions:',
              `• Create manually: mkdir -p "${fullPath}"`,
              '• Check parent directory permissions',
              '• Verify disk space availability'
            ],
            path: fullPath
          }
        }
      }

      // Directory exists, check if it's actually a directory
      const stat = await fs.stat(fullPath)
      if (!stat.isDirectory()) {
        return {
          id: `dest-dir-${destPath}`,
          status: 'fail',
          message: `Path exists but is not a directory: ${destPath}`,
          details: [
            `Path: ${fullPath}`,
            `Type: ${stat.isFile() ? 'file' : 'unknown'}`,
            '',
            `Remove the conflicting item and try again`
          ],
          path: fullPath
        }
      }

      return {
        id: `dest-dir-${destPath}`,
        status: 'pass',
        message: `Destination directory exists: ${destPath}`,
        details: [`Path: ${fullPath}`],
        path: fullPath
      }
    } catch (error) {
      return {
        id: `dest-dir-${destPath}`,
        status: 'fail',
        message: `Cannot access destination directory: ${destPath}`,
        details: [
          `Path: ${fullPath}`,
          `Error: ${error.message}`
        ],
        path: fullPath
      }
    }
  }

  /**
   * Check write permissions for a specific directory
   * @param {string} destPath - Directory path to check
   * @returns {Object} Check result
   */
  async checkDirectoryPermissions(destPath) {
    const fullPath = path.resolve(destPath)
    
    // Check cache first
    const cacheKey = `perm-${fullPath}`
    if (this.permissionCache.has(cacheKey)) {
      const cached = this.permissionCache.get(cacheKey)
      if (Date.now() < cached.expiry) {
        return {
          ...cached.result,
          message: cached.result.message + ' (cached)'
        }
      }
    }

    try {
      // Ensure directory exists
      await fs.ensureDir(fullPath)
      
      // Test file operations
      const testFileName = `${this.options.testFilePrefix}-${crypto.randomBytes(8).toString('hex')}.tmp`
      const testFilePath = path.join(fullPath, testFileName)
      const testContent = 'Lerian Protocol permission test'
      
      try {
        // Test write
        await fs.writeFile(testFilePath, testContent, 'utf8')
        
        // Test read
        const readContent = await fs.readFile(testFilePath, 'utf8')
        if (readContent !== testContent) {
          throw new Error('File content verification failed')
        }
        
        // Test rename/move
        const renamedPath = testFilePath + '.renamed'
        await fs.move(testFilePath, renamedPath)
        
        // Test delete
        await fs.remove(renamedPath)
        
        const result = {
          id: `perm-${destPath}`,
          status: 'pass',
          message: `Full permissions confirmed for: ${destPath}`,
          details: ['Read, write, rename, and delete operations successful'],
          path: fullPath
        }
        
        // Cache successful result
        this.permissionCache.set(cacheKey, {
          result,
          expiry: Date.now() + this.cacheDuration
        })
        
        return result
      } catch (permError) {
        // Clean up test file if it exists
        await fs.remove(testFilePath).catch(() => {})
        await fs.remove(testFilePath + '.renamed').catch(() => {})
        
        return {
          id: `perm-${destPath}`,
          status: 'fail',
          message: `Insufficient permissions for: ${destPath}`,
          details: [
            `Directory: ${fullPath}`,
            `Error: ${permError.message}`,
            '',
            'Required operations: read, write, rename, delete',
            '',
            'Solutions:',
            `• Fix permissions: chmod 755 "${fullPath}"`,
            `• Change ownership: chown $USER "${fullPath}"`,
            '• Check parent directory permissions',
            '• Verify the filesystem is not read-only'
          ],
          path: fullPath
        }
      }
    } catch (error) {
      return {
        id: `perm-${destPath}`,
        status: 'fail',
        message: `Cannot test permissions for: ${destPath}`,
        details: [
          `Directory: ${fullPath}`,
          `Error: ${error.message}`
        ],
        path: fullPath
      }
    }
  }

  /**
   * Check available disk space
   * @returns {Object} Check result
   */
  async checkDiskSpace() {
    try {
      // Use cached result if available
      if (this.diskSpaceCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
        return {
          ...this.diskSpaceCache,
          message: this.diskSpaceCache.message + ' (cached)'
        }
      }

      const cwd = process.cwd()
      await fs.stat(cwd)
      
      // Try to get disk usage information
      let diskInfo = null
      
      try {
        // On Unix-like systems, we can try to get disk usage
        if (process.platform !== 'win32') {
          const { execSync } = require('child_process')
          const dfOutput = execSync(`df -B1 "${cwd}"`, { encoding: 'utf8' })
          const lines = dfOutput.trim().split('\n')
          if (lines.length >= 2) {
            const fields = lines[1].split(/\s+/)
            if (fields.length >= 4) {
              diskInfo = {
                total: parseInt(fields[1], 10),
                available: parseInt(fields[3], 10)
              }
            }
          }
        }
      } catch {
        // Fall back to basic checks
      }

      // If we got disk info, use it
      if (diskInfo) {
        
        let status = 'pass'
        const details = [
          `Available space: ${this.formatBytes(diskInfo.available)}`,
          `Required minimum: ${this.formatBytes(this.options.minDiskSpace)}`
        ]
        
        if (diskInfo.available < this.options.minDiskSpace) {
          status = 'fail'
          details.push(
            '',
            'Insufficient disk space for sync operation',
            'Free up disk space or sync to a different location'
          )
        } else if (diskInfo.available < this.options.minDiskSpace * 2) {
          status = 'warn'
          details.push('', 'Disk space is running low')
        }
        
        const result = {
          id: 'disk-space',
          status,
          message: status === 'pass' 
            ? `Sufficient disk space available: ${this.formatBytes(diskInfo.available)}`
            : status === 'warn'
            ? `Low disk space: ${this.formatBytes(diskInfo.available)}`
            : `Insufficient disk space: ${this.formatBytes(diskInfo.available)}`,
          details,
          diskInfo
        }
        
        // Cache result
        this.diskSpaceCache = result
        this.cacheExpiry = Date.now() + this.cacheDuration
        
        return result
      }

      // Fallback: try to create a test file to estimate available space
      const testSize = Math.min(this.options.minDiskSpace, 50 * 1024 * 1024) // Test up to 50MB
      const testPath = path.join(cwd, `${this.options.testFilePrefix}-space-test`)
      
      try {
        const testBuffer = Buffer.alloc(testSize)
        await fs.writeFile(testPath, testBuffer)
        await fs.remove(testPath)
        
        return {
          id: 'disk-space',
          status: 'pass',
          message: `Sufficient disk space available (verified by test write)`,
          details: [`Successfully wrote ${this.formatBytes(testSize)} test file`]
        }
      } catch (spaceError) {
        return {
          id: 'disk-space',
          status: 'warn',
          message: 'Cannot verify disk space',
          details: [
            'Disk space verification failed',
            'Sync operation may fail if insufficient space available',
            `Test write error: ${spaceError.message}`
          ]
        }
      }
    } catch (error) {
      return {
        id: 'disk-space',
        status: 'warn',
        message: 'Disk space check failed',
        details: [
          error.message,
          'Proceeding without disk space verification'
        ]
      }
    }
  }

  /**
   * Check filesystem characteristics
   * @returns {Object} Check result
   */
  async checkFilesystemCharacteristics() {
    const cwd = process.cwd()
    const details = []
    let status = 'pass'
    const warnings = []
    
    try {
      // Test case sensitivity
      const testDir = path.join(cwd, `${this.options.testFilePrefix}-case-test`)
      await fs.ensureDir(testDir)
      
      try {
        const lowerFile = path.join(testDir, 'test.txt')
        const upperFile = path.join(testDir, 'TEST.txt')
        
        await fs.writeFile(lowerFile, 'lower', 'utf8')
        
        // Try to create uppercase version
        try {
          await fs.writeFile(upperFile, 'upper', 'utf8')
          const upperExists = await fs.pathExists(upperFile)
          const lowerContent = await fs.readFile(lowerFile, 'utf8')
          
          if (upperExists && lowerContent === 'lower') {
            details.push('Filesystem is case-sensitive')
          } else {
            details.push('Filesystem is case-insensitive')
            warnings.push('Case-insensitive filesystem detected')
          }
        } catch {
          details.push('Filesystem appears to be case-insensitive')
          warnings.push('Case-insensitive filesystem may cause sync conflicts')
        }
      } finally {
        await fs.remove(testDir).catch(() => {})
      }

      // Test long filename support
      const longName = 'a'.repeat(200) + '.txt'
      const longPath = path.join(cwd, longName)
      
      try {
        await fs.writeFile(longPath, 'test', 'utf8')
        await fs.remove(longPath)
        details.push('Long filename support confirmed')
      } catch {
        details.push('Limited filename length support')
        warnings.push('Long filenames may cause issues')
      }

      // Test special characters in filenames
      const specialChars = ['spaces test.txt', 'unicode-∅.txt', 'dash-test.txt']
      let specialSupport = 0
      
      for (const filename of specialChars) {
        const testPath = path.join(cwd, `${this.options.testFilePrefix}-${filename}`)
        try {
          await fs.writeFile(testPath, 'test', 'utf8')
          await fs.remove(testPath)
          specialSupport++
        } catch {
          // Some filesystems don't support certain characters
        }
      }
      
      details.push(`Special character support: ${specialSupport}/${specialChars.length}`)
      
      if (specialSupport < specialChars.length) {
        warnings.push('Limited special character support in filenames')
      }

      // Check for read-only filesystem
      try {
        const roTest = path.join(cwd, `${this.options.testFilePrefix}-ro-test`)
        await fs.writeFile(roTest, 'test', 'utf8')
        await fs.remove(roTest)
      } catch (roError) {
        if (roError.code === 'EROFS' || roError.message.includes('read-only')) {
          return {
            id: 'filesystem-chars',
            status: 'fail',
            message: 'Read-only filesystem detected',
            details: [
              'The current filesystem is mounted as read-only',
              'Sync operations will fail',
              '',
              'Solutions:',
              '• Remount filesystem as read-write',
              '• Change to a writable location',
              '• Check mount options'
            ]
          }
        }
      }

      if (warnings.length > 0) {
        status = 'warn'
        details.push('')
        details.push('Warnings:')
        details.push(...warnings.map(w => `• ${w}`))
      }

      return {
        id: 'filesystem-chars',
        status,
        message: 'Filesystem characteristics checked',
        details
      }
    } catch (error) {
      return {
        id: 'filesystem-chars',
        status: 'warn',
        message: 'Cannot determine filesystem characteristics',
        details: [
          error.message,
          'Some sync operations may encounter issues'
        ]
      }
    }
  }

  /**
   * Format bytes to human-readable format
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = bytes / Math.pow(1024, i)
    
    return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.permissionCache.clear()
    this.diskSpaceCache = null
    this.cacheExpiry = null
  }

  /**
   * Get summary of destination validation results
   * @returns {Object} Summary information
   */
  async getValidationSummary() {
    const checks = await this.performChecks()
    const summary = {
      canProceed: true,
      hasWarnings: false,
      issues: [],
      validatedPaths: []
    }

    for (const check of checks) {
      if (check.status === 'fail') {
        summary.canProceed = false
        summary.issues.push(check)
      } else if (check.status === 'warn') {
        summary.hasWarnings = true
        summary.issues.push(check)
      } else if (check.path) {
        summary.validatedPaths.push(check.path)
      }
    }

    return summary
  }

  /**
   * Attempt to fix common permission issues
   * @param {string} destPath - Path to fix
   * @returns {Object} Fix result
   */
  async attemptPermissionFix(destPath) {
    const fullPath = path.resolve(destPath)
    
    try {
      // Try to ensure directory exists with proper permissions
      await fs.ensureDir(fullPath)
      
      // Try to set reasonable permissions (owner: rwx, group: rx, other: rx)
      if (process.platform !== 'win32') {
        await fs.chmod(fullPath, 0o755)
      }
      
      // Test the fix
      const testResult = await this.checkDirectoryPermissions(destPath)
      
      return {
        success: testResult.status === 'pass',
        message: testResult.status === 'pass' 
          ? `Permissions fixed for: ${destPath}`
          : `Could not fix permissions for: ${destPath}`,
        details: testResult.details || []
      }
    } catch (error) {
      return {
        success: false,
        message: `Permission fix failed for: ${destPath}`,
        details: [error.message]
      }
    }
  }
}


module.exports = DestinationValidator