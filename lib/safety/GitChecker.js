const { execSync } = require('child_process')
const fs = require('fs-extra')

/**
 * GitChecker - Git repository validation and safety checking
 * Provides comprehensive git status analysis and safety verification
 */
class GitChecker {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 10000, // 10 second timeout for git commands
      encoding: options.encoding || 'utf8',
      maxBuffer: options.maxBuffer || 1024 * 1024, // 1MB buffer
      ...options
    }
    this.gitDir = '.git'
    this.statusCache = null
    this.cacheExpiry = null
    this.cacheDuration = 5000 // Cache git status for 5 seconds
  }

  /**
   * Perform all git safety checks
   * @returns {Array} Array of check results
   */
  async performChecks() {
    const checks = []
    
    try {
      // Basic git repository check
      const repoCheck = await this.checkGitRepository()
      checks.push(repoCheck)
      
      // If not a git repo, skip other git checks but don't fail
      if (repoCheck.status === 'warn') {
        return checks
      }

      // Working directory status check
      const statusCheck = await this.checkWorkingDirectoryStatus()
      checks.push(statusCheck)

      // Ongoing operations check
      const operationsCheck = await this.checkOngoingOperations()
      checks.push(operationsCheck)

      // Stash state check
      const stashCheck = await this.checkStashStatus()
      checks.push(stashCheck)

      // Branch state check
      const branchCheck = await this.checkBranchStatus()
      checks.push(branchCheck)

    } catch (error) {
      checks.push({
        id: 'git-error',
        status: 'fail',
        message: 'Git repository checks failed',
        details: [
          error.message,
          'This may indicate a corrupted git repository or system issue'
        ]
      })
    }

    return checks
  }

  /**
   * Check if current directory is a git repository
   * @returns {Object} Check result
   */
  async checkGitRepository() {
    try {
      // Check if we're in a git repository
      execSync('git rev-parse --git-dir', { 
        stdio: 'pipe', 
        timeout: this.options.timeout,
        encoding: this.options.encoding 
      })
      
      // Verify git is working properly
      execSync('git status --porcelain', { 
        stdio: 'pipe', 
        timeout: this.options.timeout,
        encoding: this.options.encoding
      })
      
      return {
        id: 'git-repo',
        status: 'pass',
        message: 'Git repository detected and accessible'
      }
    } catch {
      // Not being in a git repo is not a failure, just means we skip git checks
      return {
        id: 'git-repo',
        status: 'warn',
        message: 'Not in a git repository',
        details: [
          'Sync operations will proceed without git safety checks',
          'Consider initializing git repository for better safety: git init'
        ]
      }
    }
  }

  /**
   * Check working directory status for uncommitted changes
   * @returns {Object} Check result
   */
  async checkWorkingDirectoryStatus() {
    try {
      const status = this.getGitStatus()
      
      if (!status.trim()) {
        return {
          id: 'git-status',
          status: 'pass',
          message: 'Working directory is clean'
        }
      }

      const changes = this.parseGitStatus(status)
      const changeCount = changes.length
      
      if (changeCount === 0) {
        return {
          id: 'git-status',
          status: 'pass',
          message: 'Working directory is clean'
        }
      }

      // Determine severity based on change types
      const severity = this.determineChangeSeverity(changes)
      
      return {
        id: 'git-status',
        status: severity,
        message: `${changeCount} uncommitted ${changeCount === 1 ? 'change' : 'changes'} detected`,
        details: this.formatChangeDetails(changes),
        changeCount,
        changes
      }
    } catch (error) {
      return {
        id: 'git-status',
        status: 'fail',
        message: 'Cannot check git status',
        details: [
          error.message,
          'This may indicate git repository issues or permission problems'
        ]
      }
    }
  }

  /**
   * Check for ongoing git operations
   * @returns {Object} Check result
   */
  async checkOngoingOperations() {
    const ongoingOps = []
    
    try {
      // Check various git operation states
      if (await fs.pathExists(`${this.gitDir}/MERGE_HEAD`)) {
        ongoingOps.push({
          type: 'merge',
          description: 'merge in progress',
          file: 'MERGE_HEAD'
        })
      }
      
      if (await fs.pathExists(`${this.gitDir}/rebase-apply`) || 
          await fs.pathExists(`${this.gitDir}/rebase-merge`)) {
        ongoingOps.push({
          type: 'rebase',
          description: 'rebase in progress',
          file: 'rebase-apply/rebase-merge'
        })
      }
      
      if (await fs.pathExists(`${this.gitDir}/CHERRY_PICK_HEAD`)) {
        ongoingOps.push({
          type: 'cherry-pick',
          description: 'cherry-pick in progress',
          file: 'CHERRY_PICK_HEAD'
        })
      }
      
      if (await fs.pathExists(`${this.gitDir}/REVERT_HEAD`)) {
        ongoingOps.push({
          type: 'revert',
          description: 'revert in progress',
          file: 'REVERT_HEAD'
        })
      }
      
      if (await fs.pathExists(`${this.gitDir}/BISECT_LOG`)) {
        ongoingOps.push({
          type: 'bisect',
          description: 'bisect in progress',
          file: 'BISECT_LOG'
        })
      }

      if (ongoingOps.length > 0) {
        return {
          id: 'git-operations',
          status: 'fail',
          message: 'Git operations in progress',
          details: [
            ...ongoingOps.map(op => `Active operation: ${op.description}`),
            '',
            'Complete or abort these operations before syncing:',
            ...ongoingOps.map(op => this.getOperationAdvice(op.type))
          ],
          operations: ongoingOps
        }
      }

      return {
        id: 'git-operations',
        status: 'pass',
        message: 'No ongoing git operations'
      }
    } catch (error) {
      return {
        id: 'git-operations',
        status: 'warn',
        message: 'Cannot check git operation status',
        details: [error.message]
      }
    }
  }

  /**
   * Check git stash status
   * @returns {Object} Check result
   */
  async checkStashStatus() {
    try {
      const stashList = execSync('git stash list', {
        stdio: 'pipe',
        timeout: this.options.timeout,
        encoding: this.options.encoding
      }).trim()

      if (!stashList) {
        return {
          id: 'git-stash',
          status: 'pass',
          message: 'No stashed changes'
        }
      }

      const stashCount = stashList.split('\n').length
      return {
        id: 'git-stash',
        status: 'info',
        message: `${stashCount} stashed ${stashCount === 1 ? 'change' : 'changes'} available`,
        details: stashList.split('\n').slice(0, 3), // Show first 3 stashes
        stashCount
      }
    } catch (error) {
      return {
        id: 'git-stash',
        status: 'warn',
        message: 'Cannot check stash status',
        details: [error.message]
      }
    }
  }

  /**
   * Check branch status and upstream tracking
   * @returns {Object} Check result
   */
  async checkBranchStatus() {
    try {
      const branchInfo = execSync('git status -b --porcelain', {
        stdio: 'pipe',
        timeout: this.options.timeout,
        encoding: this.options.encoding
      })

      const firstLine = branchInfo.split('\n')[0]
      const branchDetails = this.parseBranchStatus(firstLine)

      if (branchDetails.ahead > 0 || branchDetails.behind > 0) {
        const details = []
        if (branchDetails.ahead > 0) {
          details.push(`${branchDetails.ahead} commits ahead of upstream`)
        }
        if (branchDetails.behind > 0) {
          details.push(`${branchDetails.behind} commits behind upstream`)
        }

        return {
          id: 'git-branch',
          status: 'warn',
          message: `Branch ${branchDetails.branch} is out of sync`,
          details,
          branchInfo: branchDetails
        }
      }

      return {
        id: 'git-branch',
        status: 'pass',
        message: `Branch ${branchDetails.branch} is up to date`
      }
    } catch (error) {
      return {
        id: 'git-branch',
        status: 'warn',
        message: 'Cannot check branch status',
        details: [error.message]
      }
    }
  }

  /**
   * Get cached or fresh git status
   * @returns {string} Git status output
   */
  getGitStatus() {
    const now = Date.now()
    if (this.statusCache && this.cacheExpiry && now < this.cacheExpiry) {
      return this.statusCache
    }

    try {
      const status = execSync('git status --porcelain -u', {
        stdio: 'pipe',
        timeout: this.options.timeout,
        encoding: this.options.encoding,
        maxBuffer: this.options.maxBuffer
      })

      this.statusCache = status
      this.cacheExpiry = now + this.cacheDuration
      return status
    } catch (error) {
      // Clear cache on error
      this.statusCache = null
      this.cacheExpiry = null
      throw error
    }
  }

  /**
   * Parse git status output into structured change information
   * @param {string} status - Git status --porcelain output
   * @returns {Array} Array of change objects
   */
  parseGitStatus(status) {
    return status
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const statusCode = line.substring(0, 2)
        const fileName = line.substring(3)
        const changeType = this.getChangeType(statusCode)
        const staged = statusCode[0] !== ' ' && statusCode[0] !== '?'
        const unstaged = statusCode[1] !== ' '
        
        return {
          statusCode,
          fileName,
          changeType,
          staged,
          unstaged,
          isUntracked: statusCode === '??',
          isIgnored: statusCode === '!!'
        }
      })
  }

  /**
   * Get human-readable change type from git status code
   * @param {string} statusCode - Two-character git status code
   * @returns {string} Human-readable change type
   */
  getChangeType(statusCode) {
    const codes = {
      'M ': 'modified (staged)',
      ' M': 'modified',
      'MM': 'modified (staged and unstaged)',
      'A ': 'added (staged)',
      ' A': 'added',
      'AA': 'added (staged and unstaged)',
      'D ': 'deleted (staged)',
      ' D': 'deleted',
      'DD': 'deleted (staged and unstaged)',
      'R ': 'renamed (staged)',
      ' R': 'renamed',
      'C ': 'copied (staged)',
      ' C': 'copied',
      'U ': 'updated but unmerged',
      ' U': 'updated but unmerged',
      'UU': 'both modified (conflict)',
      '??': 'untracked',
      '!!': 'ignored'
    }
    return codes[statusCode] || `unknown (${statusCode})`
  }

  /**
   * Determine severity of changes
   * @param {Array} changes - Array of change objects
   * @returns {string} Severity level (warn, fail)
   */
  determineChangeSeverity(changes) {
    // Check for conflicts or dangerous states
    const hasConflicts = changes.some(change => 
      change.statusCode.includes('U') || change.statusCode === 'DD'
    )
    
    if (hasConflicts) {
      return 'fail'
    }

    // Check for staged changes (more critical)
    const hasStagedChanges = changes.some(change => change.staged)
    if (hasStagedChanges) {
      return 'warn'
    }

    // All other changes are warnings
    return 'warn'
  }

  /**
   * Format change details for display
   * @param {Array} changes - Array of change objects
   * @returns {Array} Formatted detail strings
   */
  formatChangeDetails(changes) {
    const details = []
    const maxDisplay = 10

    // Group by type for better organization
    const grouped = this.groupChangesByType(changes)
    
    for (const [type, typeChanges] of Object.entries(grouped)) {
      if (typeChanges.length > 0) {
        details.push(`${type}:`)
        const displayChanges = typeChanges.slice(0, maxDisplay)
        for (const change of displayChanges) {
          details.push(`  ${change.fileName}`)
        }
        if (typeChanges.length > maxDisplay) {
          details.push(`  ... and ${typeChanges.length - maxDisplay} more`)
        }
      }
    }

    // Add helpful advice
    details.push('')
    details.push('Recommendations:')
    if (changes.some(c => c.staged)) {
      details.push('• Commit staged changes: git commit -m "your message"')
    }
    if (changes.some(c => !c.staged && !c.isUntracked)) {
      details.push('• Stage and commit changes: git add . && git commit -m "your message"')
    }
    if (changes.some(c => c.isUntracked)) {
      details.push('• Add untracked files: git add <file> (or add to .gitignore)')
    }
    details.push('• Stash changes temporarily: git stash')

    return details
  }

  /**
   * Group changes by their type for organized display
   * @param {Array} changes - Array of change objects
   * @returns {Object} Changes grouped by type
   */
  groupChangesByType(changes) {
    const groups = {
      'Staged changes': [],
      'Modified files': [],
      'Untracked files': [],
      'Deleted files': [],
      'Conflicted files': []
    }

    for (const change of changes) {
      if (change.statusCode.includes('U') || change.statusCode === 'DD') {
        groups['Conflicted files'].push(change)
      } else if (change.staged && !change.unstaged) {
        groups['Staged changes'].push(change)
      } else if (change.isUntracked) {
        groups['Untracked files'].push(change)
      } else if (change.changeType.includes('deleted')) {
        groups['Deleted files'].push(change)
      } else {
        groups['Modified files'].push(change)
      }
    }

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_key, value]) => value.length > 0)
    )
  }

  /**
   * Parse branch status from git status -b output
   * @param {string} statusLine - First line of git status -b output
   * @returns {Object} Branch status information
   */
  parseBranchStatus(statusLine) {
    const info = {
      branch: 'unknown',
      upstream: null,
      ahead: 0,
      behind: 0
    }

    if (!statusLine.startsWith('##')) {
      return info
    }

    const line = statusLine.substring(3)
    const parts = line.split(' ')
    
    if (parts[0]) {
      const branchPart = parts[0]
      if (branchPart.includes('...')) {
        const [branch, upstream] = branchPart.split('...')
        info.branch = branch
        info.upstream = upstream
      } else {
        info.branch = branchPart
      }
    }

    // Parse ahead/behind information
    const aheadMatch = line.match(/ahead (\d+)/)
    if (aheadMatch) {
      info.ahead = parseInt(aheadMatch[1], 10)
    }

    const behindMatch = line.match(/behind (\d+)/)
    if (behindMatch) {
      info.behind = parseInt(behindMatch[1], 10)
    }

    return info
  }

  /**
   * Get advice for resolving specific git operations
   * @param {string} operationType - Type of ongoing operation
   * @returns {string} Advice for resolving the operation
   */
  getOperationAdvice(operationType) {
    const advice = {
      merge: '  - Complete merge: resolve conflicts, then "git commit"',
      rebase: '  - Complete rebase: "git rebase --continue" or "git rebase --abort"',
      'cherry-pick': '  - Complete cherry-pick: "git cherry-pick --continue" or "git cherry-pick --abort"',
      revert: '  - Complete revert: "git revert --continue" or "git revert --abort"',
      bisect: '  - Complete bisect: "git bisect good/bad" or "git bisect reset"'
    }

    return advice[operationType] || `  - Complete or abort ${operationType} operation`
  }

  /**
   * Clear cached git status
   */
  clearCache() {
    this.statusCache = null
    this.cacheExpiry = null
  }

  /**
   * Get current git status summary
   * @returns {Object} Status summary
   */
  getStatusSummary() {
    try {
      const status = this.getGitStatus()
      const changes = this.parseGitStatus(status)
      
      return {
        isClean: changes.length === 0,
        changeCount: changes.length,
        hasStaged: changes.some(c => c.staged),
        hasUnstaged: changes.some(c => c.unstaged && !c.isUntracked),
        hasUntracked: changes.some(c => c.isUntracked),
        hasConflicts: changes.some(c => c.statusCode.includes('U'))
      }
    } catch (error) {
      return {
        isClean: false,
        changeCount: -1,
        error: error.message
      }
    }
  }
}

module.exports = GitChecker