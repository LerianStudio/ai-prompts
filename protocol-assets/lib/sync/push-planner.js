const fs = require('fs-extra')
const path = require('path')
const { execSync } = require('child_process')
const FileHasher = require('./file-hasher')
const PushBaselineManager = require('./push-baseline-manager')

class PushPlanner {
  constructor(options = {}) {
    this.fileHasher = new FileHasher(options.hasher)
    this.strictMode = options.strictMode !== false // Default to strict
    this.allowedPushPatterns = options.allowedPushPatterns || []
    this.baselineManager = new PushBaselineManager()
  }

  /**
   * Create a push plan from target to source
   * @param {string} targetPath - Target project path (source of push)
   * @param {string} sourcePath - Source package path (destination of push)  
   * @param {Object} lastPushHashes - Hashes from last push (from metadata)
   * @param {Object} options - Planning options
   * @returns {Promise<Object>} Push plan with operations and metadata
   */
  async createPushPlan(targetPath, sourcePath, lastPushHashes = {}, options = {}) {
    const startTime = Date.now()
    
    // Validate push permissions upfront
    await this.validatePushPermissions(sourcePath)
    
    // Generate snapshots (reversed from sync - target is now source)
    const [targetSnapshot, sourceSnapshot] = await Promise.all([
      this.fileHasher.createSnapshot(targetPath, {
        onProgress: (current, total) => {
          if (options.onProgress) {
            options.onProgress(`Scanning target files: ${current}/${total}`)
          }
        }
      }),
      this.fileHasher.createSnapshot(sourcePath, {
        onProgress: (current, total) => {
          if (options.onProgress) {
            options.onProgress(`Scanning source files: ${current}/${total}`)
          }
        }
      })
    ])

    // Check if we have existing push metadata
    const hasExistingMetadata = Object.keys(lastPushHashes).length > 0
    
    // Filter files suitable for push
    const pushableFiles = await this.filterPushableFiles(
      targetSnapshot.hashes, 
      options.fileSelection || {},
      targetPath,
      hasExistingMetadata
    )
    
    // Compare states to detect what can be pushed
    const targetChanges = this.fileHasher.compareHashes(lastPushHashes, pushableFiles)
    const sourceChanges = this.fileHasher.compareHashes(lastPushHashes, sourceSnapshot.hashes)

    // Generate push operations with strict safety checks
    const operations = this.generatePushOperations(
      pushableFiles,
      sourceSnapshot.hashes,
      targetChanges,
      sourceChanges,
      options
    )

    const endTime = Date.now()

    return {
      planId: this.generatePlanId('push'),
      timestamp: new Date().toISOString(),
      duration: endTime - startTime,
      direction: 'target_to_source',
      targetPath,
      sourcePath,
      
      snapshots: {
        target: targetSnapshot,
        source: sourceSnapshot
      },
      
      changes: {
        target: targetChanges,
        source: sourceChanges
      },
      
      operations,
      pushableFileCount: Object.keys(pushableFiles).length,
      summary: this.generatePushSummary(operations),
      
      warnings: this.generatePushWarnings(operations),
      
      estimatedImpact: this.calculatePushImpact(operations),
      
      requiresConfirmation: this.requiresUserConfirmation(operations)
    }
  }

  /**
   * Validate that push operations are allowed and safe
   * @param {string} sourcePath - Source directory to validate
   */
  async validatePushPermissions(sourcePath) {
    const errors = []

    // Check if source exists and is accessible
    if (!(await fs.pathExists(sourcePath))) {
      errors.push(`Source path does not exist: ${sourcePath}`)
    }

    // Check write permissions
    try {
      const testFile = path.join(sourcePath, '.push-permission-test')
      await fs.writeFile(testFile, 'test')
      await fs.remove(testFile)
    } catch (error) {
      errors.push(`No write permission to source: ${error.message}`)
    }

    // Check if source looks like a valid Lerian Protocol installation
    const packageJsonPath = path.join(sourcePath, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJSON(packageJsonPath)
        if (packageJson.name !== 'lerian-protocol') {
          errors.push('Source directory does not appear to be a Lerian Protocol package')
        }
      } catch (error) {
        errors.push(`Cannot validate source package: ${error.message}`)
      }
    }

    // Check for critical system files that should never be pushed to
    const criticalPaths = [
      'node_modules',
      '.git',
      'package-lock.json',
      'yarn.lock'
    ]
    
    for (const criticalPath of criticalPaths) {
      const fullPath = path.join(sourcePath, criticalPath)
      if (await fs.pathExists(fullPath)) {
        // This is expected, not an error, just a warning
        console.warn(`⚠️  Critical path exists in source: ${criticalPath}`)
      }
    }

    if (errors.length > 0) {
      throw new Error(`Push validation failed:\n${errors.join('\n')}`)
    }
  }

  /**
   * Get files that have changed since last push using baseline comparison
   * @param {string} targetPath - Target directory path
   * @param {Object} pushableFileHashes - Pushable file hashes
   * @returns {Promise<Object>} Change detection result
   */
  async getBaselineChanges(targetPath, pushableFileHashes) {
    try {
      const changeResult = await this.baselineManager.detectChanges(targetPath, pushableFileHashes)
      return changeResult
    } catch (error) {
      console.warn(`Baseline detection failed: ${error.message}`)
      return {
        hasBaseline: false,
        changes: {
          added: Object.keys(pushableFileHashes).map(path => ({ path, ...pushableFileHashes[path] })),
          modified: [],
          deleted: [],
          unchanged: []
        },
        summary: {
          total: Object.keys(pushableFileHashes).length,
          added: Object.keys(pushableFileHashes).length,
          modified: 0,
          deleted: 0,
          unchanged: 0
        }
      }
    }
  }

  /**
   * Get files that have been changed according to git or file timestamps (legacy method)
   * @param {string} targetPath - Target directory path
   * @param {Object} allFileHashes - All file hashes with timestamps
   * @returns {Promise<Set<string>>} Set of changed file paths
   */
  async getGitChangedFiles(targetPath, allFileHashes = {}) {
    const changedFiles = new Set()
    
    try {
      // First, try git diff for tracked files
      const gitDiff = execSync('git diff --name-only', {
        cwd: targetPath,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      })

      // Add git-detected changes
      for (const line of gitDiff.split('\n')) {
        const filePath = line.trim()
        if (filePath) {
          changedFiles.add(filePath)
        }
      }

      // If we found git changes, return them
      if (changedFiles.size > 0) {
        return changedFiles
      }

      // No git changes found - check if pushable files might be ignored by git
      // Focus on common pushable patterns that might be ignored
      const pushablePatterns = ['.claude/**', 'protocol-assets/**', 'docs/**/*.md', 'README*.md']
      
      for (const [filePath, fileInfo] of Object.entries(allFileHashes)) {
        if (this.matchesAnyPattern(filePath, pushablePatterns)) {
          // Check if this file is ignored by git
          try {
            execSync(`git check-ignore "${filePath}"`, {
              cwd: targetPath,
              stdio: ['ignore', 'ignore', 'ignore']
            })
            // File is ignored by git, check if it was recently modified
            if (this.isRecentlyModified(fileInfo)) {
              changedFiles.add(filePath)
            }
          } catch (error) {
            // File is tracked by git, already handled by git diff above
          }
        }
      }

      return changedFiles
    } catch (error) {
      // If git is not available, fall back to recent modification check
      console.warn('Git unavailable, checking recently modified files')
      
      // Check all pushable files for recent modifications
      const pushablePatterns = ['.claude/**', 'protocol-assets/**', 'docs/**/*.md', 'README*.md']
      
      for (const [filePath, fileInfo] of Object.entries(allFileHashes)) {
        if (this.matchesAnyPattern(filePath, pushablePatterns) && this.isRecentlyModified(fileInfo)) {
          changedFiles.add(filePath)
        }
      }

      return changedFiles
    }
  }

  /**
   * Check if a file was recently modified (within last 10 minutes)
   * @param {Object} fileInfo - File info with mtime
   * @returns {boolean} True if recently modified
   */
  isRecentlyModified(fileInfo) {
    if (!fileInfo.mtime) return false
    
    const fileTime = new Date(fileInfo.mtime)
    const now = new Date()
    const minutesSinceModified = (now - fileTime) / (1000 * 60)
    
    // Consider file recently modified if changed in last 10 minutes
    // This catches files you just edited but not old sync/install operations
    return minutesSinceModified < 10
  }

  /**
   * Filter files that are safe and appropriate for pushing back to source
   * @param {Object} targetHashes - All target file hashes
   * @param {Object} selection - File selection criteria
   * @param {string} targetPath - Target directory path for git integration
   * @param {boolean} hasExistingMetadata - Whether push metadata exists
   * @returns {Promise<Object>} Filtered hash object with pushable files
   */
  async filterPushableFiles(targetHashes, selection = {}, targetPath = null, hasExistingMetadata = false) {
    const pushable = {}
    
    // Default pushable patterns if none specified
    const defaultPushablePatterns = [
      // All Claude configuration and customizations
      '.claude/**',
      
      // All protocol assets
      'protocol-assets/**',
      
      // Documentation improvements
      'docs/**/*.md',
      'README*.md'
    ]

    const patterns = selection.includePatterns || 
                    (selection.files && this.convertFilesToPatterns(selection.files)) ||
                    defaultPushablePatterns

    // Use baseline-based change detection when no metadata exists
    let baselineChanges = null
    let useBaselineFiltering = false
    
    if (!hasExistingMetadata && targetPath && !selection.showAll) {
      // First, filter to only pushable files for baseline comparison
      const candidateFiles = {}
      for (const [filePath, fileInfo] of Object.entries(targetHashes)) {
        if (this.matchesAnyPattern(filePath, patterns) && this.isPushSafe(filePath)) {
          candidateFiles[filePath] = fileInfo
        }
      }
      
      baselineChanges = await this.getBaselineChanges(targetPath, candidateFiles)
      useBaselineFiltering = true
      
      if (!baselineChanges.hasBaseline) {
        console.log(`📝 No push baseline found. Creating baseline with ${baselineChanges.summary.total} eligible files.`)
        console.log(`   Use --all to push all files, or select specific files interactively.`)
        
        // Create baseline for future use
        await this.baselineManager.createBaseline(targetPath, candidateFiles, {
          reason: 'first_push_discovery',
          profile: selection.profile
        })
        
        // For first time, return empty (user should select what they want)
        return {}
      } else {
        const changedCount = baselineChanges.summary.added + baselineChanges.summary.modified
        if (changedCount > 0) {
          console.log(`🔍 Baseline change detection: ${changedCount} changed files found`)
          console.log(`   Added: ${baselineChanges.summary.added}, Modified: ${baselineChanges.summary.modified}`)
        } else {
          console.log(`🔍 No changes since last push (use --all to show all eligible files)`)
          return {}
        }
      }
    }

    // Apply include patterns and baseline filtering
    for (const [filePath, fileInfo] of Object.entries(targetHashes)) {
      if (this.matchesAnyPattern(filePath, patterns)) {
        // Additional safety checks
        if (this.isPushSafe(filePath)) {
          // If using baseline filtering, only include changed files
          if (useBaselineFiltering && baselineChanges) {
            // Check if file is in changed files (added or modified)
            const isChanged = baselineChanges.changes.added.some(f => f.path === filePath) ||
                             baselineChanges.changes.modified.some(f => f.path === filePath)
            
            if (isChanged) {
              pushable[filePath] = fileInfo
            }
          } else {
            // No filtering, include all matching files
            pushable[filePath] = fileInfo
          }
        }
      }
    }

    // Apply exclude patterns  
    if (selection.excludePatterns) {
      for (const pattern of selection.excludePatterns) {
        for (const filePath of Object.keys(pushable)) {
          if (this.matchesPattern(filePath, pattern)) {
            delete pushable[filePath]
          }
        }
      }
    }

    return pushable
  }

  /**
   * Check if a file is safe to push back to source
   * @param {string} filePath - File path to check
   * @returns {boolean} True if safe to push
   */
  isPushSafe(filePath) {
    // Allow all Claude directory files except metadata files
    if (filePath.startsWith('.claude/')) {
      const restrictedClaudeFiles = [
        '.claude/.lerian-protocol-meta.json',
        '.claude/.lerian-sync-meta.json',
        '.claude/.lerian-push-meta.json',
        '.claude/.lerian-push-baseline.json'  // Exclude baseline file from pushable files
      ]
      return !restrictedClaudeFiles.some(restricted => filePath === restricted)
    }

    // Allow all protocol-assets files
    if (filePath.startsWith('protocol-assets/')) {
      return true
    }

    // Never push these system files back to source
    const neverPush = [
      'package.json',
      'package-lock.json', 
      'yarn.lock',
      '.git/**',
      'node_modules/**',
      '.sync-backup/**',
      '.push-backup/**',
      '*.log',
      'tmp/**',
      'temp/**'
    ]

    return !neverPush.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Generate push operations with enhanced safety checks
   * @param {Object} targetHashes - Target file hashes (what we want to push)
   * @param {Object} sourceHashes - Source file hashes (what exists in source)
   * @param {Object} targetChanges - Changes in target since last push  
   * @param {Object} sourceChanges - Changes in source since last push
   * @param {Object} options - Operation options
   * @returns {Array} Array of push operations
   */
  generatePushOperations(targetHashes, sourceHashes, targetChanges, sourceChanges, options = {}) {
    const operations = []
    // FIXED: Only consider target files for push operations
    // We don't want to delete files from source that aren't in our target selection
    const filesToConsider = new Set(Object.keys(targetHashes))

    for (const filePath of filesToConsider) {
      const targetFile = targetHashes[filePath]  
      const sourceFile = sourceHashes[filePath] // May be undefined
      
      const targetChanged = this.wasFileChanged(filePath, targetChanges)
      const sourceChanged = this.wasFileChanged(filePath, sourceChanges)

      const operation = this.determinePushOperation(
        filePath,
        targetFile,
        sourceFile, 
        targetChanged,
        sourceChanged,
        options
      )

      if (operation) {
        operations.push(operation)
      }
    }

    return operations.sort((a, b) => {
      // Prioritize by safety: safest operations first
      const safetyOrder = { create: 1, update: 2, conflict: 3, delete: 4 }
      const aSafety = safetyOrder[a.type] || 5
      const bSafety = safetyOrder[b.type] || 5
      
      if (aSafety !== bSafety) return aSafety - bSafety
      return a.path.localeCompare(b.path)
    })
  }

  /**
   * Determine push operation for a specific file (more conservative than sync)
   * @param {string} filePath - File path
   * @param {Object} targetFile - Target file info (source of push)
   * @param {Object} sourceFile - Source file info (destination of push)  
   * @param {boolean} targetChanged - Target changed since last push
   * @param {boolean} sourceChanged - Source changed since last push
   * @param {Object} options - Options
   * @returns {Object|null} Push operation or null
   */
  determinePushOperation(filePath, targetFile, sourceFile, targetChanged, sourceChanged, options = {}) {
    // File exists only in target - can be pushed as new file
    if (targetFile && !sourceFile) {
      return {
        type: 'create',
        path: filePath,
        action: 'Create new file in source',
        target: targetFile,
        source: null,
        priority: 'low',
        safety: 'safe'
      }
    }

    // File exists only in source - deletion (requires explicit confirmation)
    if (!targetFile && sourceFile) {
      return {
        type: 'delete',
        path: filePath,
        action: 'Remove file from source',
        target: null,
        source: sourceFile,
        priority: 'high',
        safety: 'dangerous',
        requiresConfirmation: true
      }
    }

    // File exists in both
    if (targetFile && sourceFile) {
      // No changes - skip
      if (!targetChanged && !sourceChanged) {
        return null
      }

      // Only target changed - safe to push update
      if (targetChanged && !sourceChanged) {
        return {
          type: 'update',
          path: filePath,
          action: 'Update source file',
          target: targetFile,
          source: sourceFile,
          priority: 'normal',
          safety: 'safe'
        }
      }

      // Only source changed - conflict (target is outdated)
      if (!targetChanged && sourceChanged) {
        return {
          type: 'conflict',
          path: filePath,
          action: 'Source has newer changes',
          target: targetFile,
          source: sourceFile,
          priority: 'high',
          safety: 'risky',
          conflictType: 'source_newer',
          requiresConfirmation: true
        }
      }

      // Both changed - serious conflict requiring manual resolution
      if (targetChanged && sourceChanged) {
        return {
          type: 'conflict',
          path: filePath,
          action: 'Both target and source have changes',
          target: targetFile,
          source: sourceFile,
          priority: 'critical',
          safety: 'dangerous',
          conflictType: 'both_modified',
          requiresConfirmation: true
        }
      }
    }

    return null
  }

  /**
   * Check if file was changed in change set
   * @param {string} filePath - File path to check
   * @param {Object} changes - Changes from compareHashes
   * @returns {boolean} True if changed
   */
  wasFileChanged(filePath, changes) {
    return changes.added.some(f => f.path === filePath) ||
           changes.modified.some(f => f.path === filePath)
  }

  /**
   * Generate summary of push operations
   * @param {Array} operations - Push operations
   * @returns {Object} Summary statistics
   */
  generatePushSummary(operations) {
    const summary = {
      total: operations.length,
      create: 0,
      update: 0,
      delete: 0,
      conflict: 0
    }

    for (const op of operations) {
      summary[op.type] = (summary[op.type] || 0) + 1
    }

    return summary
  }

  /**
   * Generate warnings about the push operation
   * @param {Array} operations - Push operations
   * @returns {Array} Array of warning messages
   */
  generatePushWarnings(operations) {
    const warnings = []
    
    const dangerousOps = operations.filter(op => op.safety === 'dangerous')
    if (dangerousOps.length > 0) {
      warnings.push(`${dangerousOps.length} dangerous operations detected`)
    }

    const deleteOps = operations.filter(op => op.type === 'delete')
    if (deleteOps.length > 0) {
      warnings.push(`${deleteOps.length} files will be deleted from source`)
    }

    const conflicts = operations.filter(op => op.type === 'conflict')
    if (conflicts.length > 0) {
      warnings.push(`${conflicts.length} conflicts require manual resolution`)
    }

    return warnings
  }

  /**
   * Calculate the impact of push operations
   * @param {Array} operations - Push operations
   * @returns {Object} Impact assessment
   */
  calculatePushImpact(operations) {
    let totalBytes = 0
    let criticalFiles = 0
    let systemFiles = 0

    for (const op of operations) {
      if (['create', 'update'].includes(op.type) && op.target) {
        totalBytes += op.target.size || 0
      }

      if (this.isCriticalFile(op.path)) {
        criticalFiles++
      }

      if (this.isSystemFile(op.path)) {
        systemFiles++
      }
    }

    return {
      totalBytes,
      criticalFiles,
      systemFiles,
      riskLevel: this.assessRiskLevel(operations)
    }
  }

  /**
   * Determine if push requires user confirmation
   * @param {Array} operations - Push operations  
   * @returns {boolean} True if confirmation needed
   */
  requiresUserConfirmation(operations) {
    return operations.some(op => 
      op.requiresConfirmation || 
      op.safety === 'dangerous' ||
      op.type === 'delete' ||
      op.type === 'conflict'
    )
  }

  /**
   * Assess overall risk level of push operations
   * @param {Array} operations - Push operations
   * @returns {string} Risk level: low, medium, high, critical
   */
  assessRiskLevel(operations) {
    const dangerousCount = operations.filter(op => op.safety === 'dangerous').length
    const deleteCount = operations.filter(op => op.type === 'delete').length
    const conflictCount = operations.filter(op => op.type === 'conflict').length

    if (dangerousCount > 0 || deleteCount > 0 || conflictCount > 2) {
      return 'critical'
    } else if (conflictCount > 0 || operations.length > 10) {
      return 'high'
    } else if (operations.length > 3) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Check if file is critical to the system
   * @param {string} filePath - File path
   * @returns {boolean} True if critical
   */
  isCriticalFile(filePath) {
    const criticalPatterns = [
      'package.json',
      'bin/**',
      'lib/**/*.js'
    ]
    
    // Note: .claude/ and protocol-assets/ files are user-customizable
    // and should generally be pushable, so they're not considered critical
    
    return criticalPatterns.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Check if file is a system file
   * @param {string} filePath - File path
   * @returns {boolean} True if system file
   */
  isSystemFile(filePath) {
    const systemPatterns = [
      '.git/**',
      'node_modules/**',
      '.env',
      '*.lock'
    ]
    
    return systemPatterns.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Convert file array to glob patterns
   * @param {Array} files - Array of file paths
   * @returns {Array} Array of patterns
   */
  convertFilesToPatterns(files) {
    return files.map(file => {
      // If it's already a pattern, return as-is
      if (file.includes('*') || file.includes('?')) {
        return file
      }
      // Otherwise, make it an exact match
      return file
    })
  }

  /**
   * Check if path matches any pattern
   * @param {string} filePath - File path to test
   * @param {Array} patterns - Array of patterns
   * @returns {boolean} True if matches any pattern
   */
  matchesAnyPattern(filePath, patterns) {
    return patterns.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Match path against glob-like pattern
   * @param {string} filePath - File path to test
   * @param {string} pattern - Pattern to match against
   * @returns {boolean} True if matches
   */
  matchesPattern(filePath, pattern) {
    // Simple glob pattern matching (reuse from FileHasher)
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
   * Generate unique plan ID
   * @param {string} prefix - ID prefix
   * @returns {string} Plan ID
   */
  generatePlanId(prefix = 'push') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

module.exports = PushPlanner