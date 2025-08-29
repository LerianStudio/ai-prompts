const inquirer = require('inquirer')
const chalk = require('chalk')
const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')

/**
 * SafetyResolver - Interactive problem resolution system
 * Provides guided resolution for safety check failures and warnings
 */
class SafetyResolver {
  constructor(options = {}) {
    this.options = {
      autoResolve: options.autoResolve || false,
      skipPrompts: options.skipPrompts || false,
      timeout: options.timeout || 30000,
      ...options
    }
    this.resolutionHistory = []
  }

  /**
   * Resolve multiple safety issues interactively
   * @param {Array} issues - Array of failed/warning safety checks
   * @returns {Object} Resolution results
   */
  async resolveIssues(issues) {
    if (issues.length === 0) {
      return {
        resolved: [],
        skipped: [],
        failed: [],
        canProceed: true
      }
    }

    console.log(chalk.yellow('\n⚠️  Safety issues detected that require resolution:\n'))

    const results = {
      resolved: [],
      skipped: [],
      failed: [],
      canProceed: false
    }

    // Group issues by type for better UX
    const groupedIssues = this.groupIssuesByType(issues)
    
    for (const [category, categoryIssues] of Object.entries(groupedIssues)) {
      if (categoryIssues.length > 0) {
        console.log(chalk.bold.underline(`\n${category} Issues:`))
        
        for (const issue of categoryIssues) {
          console.log(`\n${this.formatIssueHeader(issue)}`)
          
          const resolution = await this.resolveSingleIssue(issue)
          
          if (resolution.resolved) {
            results.resolved.push(issue)
            console.log(chalk.green(`✅ Resolved: ${resolution.message}`))
          } else if (resolution.skipped) {
            results.skipped.push(issue)
            console.log(chalk.yellow(`⏭️  Skipped: ${resolution.message}`))
          } else {
            results.failed.push(issue)
            console.log(chalk.red(`❌ Failed: ${resolution.message}`))
          }

          this.resolutionHistory.push({
            issue,
            resolution,
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    // Determine if we can proceed
    const criticalIssues = issues.filter(issue => issue.status === 'fail')
    const unresolvedCritical = criticalIssues.filter(issue => 
      !results.resolved.some(resolved => resolved.id === issue.id)
    )

    results.canProceed = unresolvedCritical.length === 0

    // Summary
    console.log(this.formatResolutionSummary(results))

    return results
  }

  /**
   * Resolve a single safety issue
   * @param {Object} issue - Safety check issue
   * @returns {Object} Resolution result
   */
  async resolveSingleIssue(issue) {
    // Check if we have specific resolvers for this issue type
    if (issue.id.includes('git')) {
      return await this.resolveGitIssue(issue)
    } else if (issue.id.includes('source-path')) {
      return await this.resolveSourcePathIssue(issue)
    } else if (issue.id.includes('perm') || issue.id.includes('destination')) {
      return await this.resolvePermissionIssue(issue)
    } else if (issue.id.includes('disk-space')) {
      return await this.resolveDiskSpaceIssue(issue)
    } else {
      return await this.resolveGenericIssue(issue)
    }
  }

  /**
   * Resolve git-related issues
   * @param {Object} issue - Git safety issue
   * @returns {Object} Resolution result
   */
  async resolveGitIssue(issue) {
    if (this.options.skipPrompts) {
      return { resolved: false, skipped: true, message: 'Skipped due to skip prompts flag' }
    }

    // Handle uncommitted changes
    if (issue.id === 'git-status' && issue.status === 'warn') {
      return await this.resolveUncommittedChanges(issue)
    }

    // Handle ongoing git operations
    if (issue.id === 'git-operations' && issue.status === 'fail') {
      return await this.resolveOngoingOperations(issue)
    }

    // Handle branch sync issues
    if (issue.id === 'git-branch' && issue.status === 'warn') {
      return await this.resolveBranchSyncIssue(issue)
    }

    return await this.resolveGenericIssue(issue)
  }

  /**
   * Resolve uncommitted changes
   * @param {Object} issue - Uncommitted changes issue
   * @returns {Object} Resolution result
   */
  async resolveUncommittedChanges(issue) {
    const choices = [
      {
        name: 'Commit changes and continue',
        value: 'commit',
        short: 'Commit'
      },
      {
        name: 'Stash changes and continue',
        value: 'stash',
        short: 'Stash'
      },
      {
        name: 'Proceed with sync (not recommended)',
        value: 'proceed',
        short: 'Proceed'
      },
      {
        name: 'Cancel operation',
        value: 'cancel',
        short: 'Cancel'
      }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to handle uncommitted changes?',
        choices,
        default: 'commit'
      }
    ])

    try {
      switch (answer.action) {
        case 'commit':
          return await this.commitChanges(issue)
        
        case 'stash':
          return await this.stashChanges(issue)
        
        case 'proceed':
          return {
            resolved: false,
            skipped: true,
            message: 'Proceeding with uncommitted changes (user choice)'
          }
        
        case 'cancel':
          throw new Error('Operation cancelled by user')
        
        default:
          return { resolved: false, message: 'Unknown action selected' }
      }
    } catch (error) {
      return { resolved: false, message: error.message }
    }
  }

  /**
   * Commit uncommitted changes
   * @param {Object} issue - Uncommitted changes issue
   * @returns {Object} Resolution result
   */
  async commitChanges(_issue) {
    try {
      // Get commit message from user
      const commitAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Enter commit message:',
          default: 'WIP: Auto-commit before Lerian Protocol sync',
          validate: input => input.trim().length > 0 || 'Commit message cannot be empty'
        }
      ])

      // Stage all changes
      execSync('git add .', { stdio: 'pipe' })
      
      // Commit with message
      execSync(`git commit -m "${commitAnswer.message}"`, { stdio: 'pipe' })
      
      return {
        resolved: true,
        message: `Changes committed: "${commitAnswer.message}"`
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Failed to commit changes: ${error.message}`
      }
    }
  }

  /**
   * Stash uncommitted changes
   * @param {Object} issue - Uncommitted changes issue
   * @returns {Object} Resolution result
   */
  async stashChanges(_issue) {
    try {
      // Get stash message from user
      const stashAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Enter stash message (optional):',
          default: 'Auto-stash before Lerian Protocol sync'
        }
      ])

      // Stash changes
      const stashMessage = stashAnswer.message || 'Auto-stash before Lerian Protocol sync'
      execSync(`git stash push -m "${stashMessage}"`, { stdio: 'pipe' })
      
      return {
        resolved: true,
        message: `Changes stashed: "${stashMessage}"`
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Failed to stash changes: ${error.message}`
      }
    }
  }

  /**
   * Resolve ongoing git operations
   * @param {Object} issue - Ongoing operations issue
   * @returns {Object} Resolution result
   */
  async resolveOngoingOperations(issue) {
    console.log(chalk.yellow('\nOngoing git operations detected:'))
    if (issue.details) {
      issue.details.forEach(detail => console.log(`  ${detail}`))
    }

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'abort',
        message: 'Would you like to abort the ongoing git operation?',
        default: false
      }
    ])

    if (!answer.abort) {
      return {
        resolved: false,
        skipped: true,
        message: 'User chose not to abort git operation'
      }
    }

    try {
      // Try to detect and abort the operation
      if (await fs.pathExists('.git/MERGE_HEAD')) {
        execSync('git merge --abort', { stdio: 'pipe' })
        return { resolved: true, message: 'Merge operation aborted' }
      }
      
      if (await fs.pathExists('.git/rebase-apply') || await fs.pathExists('.git/rebase-merge')) {
        execSync('git rebase --abort', { stdio: 'pipe' })
        return { resolved: true, message: 'Rebase operation aborted' }
      }
      
      if (await fs.pathExists('.git/CHERRY_PICK_HEAD')) {
        execSync('git cherry-pick --abort', { stdio: 'pipe' })
        return { resolved: true, message: 'Cherry-pick operation aborted' }
      }

      if (await fs.pathExists('.git/REVERT_HEAD')) {
        execSync('git revert --abort', { stdio: 'pipe' })
        return { resolved: true, message: 'Revert operation aborted' }
      }

      return {
        resolved: false,
        message: 'Could not automatically abort git operation'
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Failed to abort git operation: ${error.message}`
      }
    }
  }

  /**
   * Resolve branch sync issues
   * @param {Object} issue - Branch sync issue
   * @returns {Object} Resolution result
   */
  async resolveBranchSyncIssue(_issue) {
    const choices = [
      {
        name: 'Pull latest changes from upstream',
        value: 'pull',
        short: 'Pull'
      },
      {
        name: 'Push local commits to upstream',
        value: 'push',
        short: 'Push'
      },
      {
        name: 'Continue without syncing branch',
        value: 'skip',
        short: 'Skip'
      }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Branch is out of sync with upstream. What would you like to do?',
        choices,
        default: 'skip'
      }
    ])

    try {
      switch (answer.action) {
        case 'pull':
          execSync('git pull', { stdio: 'pipe' })
          return { resolved: true, message: 'Pulled latest changes from upstream' }
        
        case 'push':
          execSync('git push', { stdio: 'pipe' })
          return { resolved: true, message: 'Pushed local commits to upstream' }
        
        case 'skip':
          return { resolved: false, skipped: true, message: 'Skipped branch sync' }
        
        default:
          return { resolved: false, message: 'Unknown action selected' }
      }
    } catch (error) {
      return { resolved: false, message: error.message }
    }
  }

  /**
   * Resolve source path issues
   * @param {Object} issue - Source path issue
   * @returns {Object} Resolution result
   */
  async resolveSourcePathIssue(_issue) {
    if (this.options.skipPrompts) {
      return { resolved: false, skipped: true, message: 'Skipped due to skip prompts flag' }
    }

    const choices = [
      {
        name: 'Specify source path manually',
        value: 'manual',
        short: 'Manual'
      },
      {
        name: 'Reinstall Lerian Protocol',
        value: 'reinstall',
        short: 'Reinstall'
      },
      {
        name: 'Skip and continue (may cause errors)',
        value: 'skip',
        short: 'Skip'
      }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Source path could not be detected. How would you like to resolve this?',
        choices,
        default: 'manual'
      }
    ])

    try {
      switch (answer.action) {
        case 'manual':
          return await this.configureManualSourcePath()
        
        case 'reinstall':
          return await this.reinstallLerianProtocol()
        
        case 'skip':
          return { resolved: false, skipped: true, message: 'Skipped source path resolution' }
        
        default:
          return { resolved: false, message: 'Unknown action selected' }
      }
    } catch (error) {
      return { resolved: false, message: error.message }
    }
  }

  /**
   * Configure manual source path
   * @returns {Object} Resolution result
   */
  async configureManualSourcePath() {
    const pathAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter the Lerian Protocol installation path:',
        validate: async (input) => {
          if (!input.trim()) {return 'Path cannot be empty'}
          
          const exists = await fs.pathExists(input)
          if (!exists) {return 'Path does not exist'}
          
          // Basic validation - check for package.json
          const packagePath = path.join(input, 'package.json')
          const packageExists = await fs.pathExists(packagePath)
          if (!packageExists) {return 'Not a valid Lerian Protocol installation (no package.json)'}
          
          return true
        }
      }
    ])

    try {
      // Save to metadata file
      const metadataFile = '.claude/.lerian-protocol-meta.json'
      await fs.ensureDir(path.dirname(metadataFile))
      
      const metadata = {
        sourcePath: pathAnswer.path,
        detectedAt: new Date().toISOString(),
        detectionMethod: 'manual'
      }
      
      await fs.writeJson(metadataFile, metadata, { spaces: 2 })
      
      return {
        resolved: true,
        message: `Manual source path configured: ${pathAnswer.path}`
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Failed to configure source path: ${error.message}`
      }
    }
  }

  /**
   * Reinstall Lerian Protocol
   * @returns {Object} Resolution result
   */
  async reinstallLerianProtocol() {
    const confirmAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will reinstall Lerian Protocol globally. Continue?',
        default: true
      }
    ])

    if (!confirmAnswer.confirm) {
      return { resolved: false, skipped: true, message: 'Reinstall cancelled' }
    }

    try {
      console.log(chalk.blue('Reinstalling Lerian Protocol...'))
      execSync('npm install -g lerian-protocol', { 
        stdio: ['pipe', 'pipe', 'inherit'],
        timeout: 60000 
      })
      
      return {
        resolved: true,
        message: 'Lerian Protocol reinstalled successfully'
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Reinstall failed: ${error.message}`
      }
    }
  }

  /**
   * Resolve permission issues
   * @param {Object} issue - Permission issue
   * @returns {Object} Resolution result
   */
  async resolvePermissionIssue(issue) {
    if (this.options.skipPrompts) {
      return { resolved: false, skipped: true, message: 'Skipped due to skip prompts flag' }
    }

    const choices = [
      {
        name: 'Attempt to fix permissions automatically',
        value: 'fix',
        short: 'Fix'
      },
      {
        name: 'Show manual fix instructions',
        value: 'manual',
        short: 'Manual'
      },
      {
        name: 'Skip permission check',
        value: 'skip',
        short: 'Skip'
      }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Permission issue detected. How would you like to resolve this?',
        choices,
        default: 'fix'
      }
    ])

    switch (answer.action) {
      case 'fix':
        return await this.attemptPermissionFix(issue)
      
      case 'manual':
        return await this.showManualFixInstructions(issue)
      
      case 'skip':
        return { resolved: false, skipped: true, message: 'Skipped permission check' }
      
      default:
        return { resolved: false, message: 'Unknown action selected' }
    }
  }

  /**
   * Attempt automatic permission fix
   * @param {Object} issue - Permission issue
   * @returns {Object} Resolution result
   */
  async attemptPermissionFix(issue) {
    try {
      // Extract path from issue details
      const pathMatch = issue.details?.find(detail => detail.includes('Directory:'))
      if (!pathMatch) {
        return { resolved: false, message: 'Cannot determine directory path from issue' }
      }
      
      const dirPath = pathMatch.split('Directory: ')[1]
      if (!dirPath) {
        return { resolved: false, message: 'Cannot extract directory path' }
      }

      // Ensure directory exists
      await fs.ensureDir(dirPath)
      
      // Try to set permissions (Unix-like systems only)
      if (process.platform !== 'win32') {
        await fs.chmod(dirPath, 0o755)
      }

      return {
        resolved: true,
        message: `Permissions fixed for: ${dirPath}`
      }
    } catch (error) {
      return {
        resolved: false,
        message: `Permission fix failed: ${error.message}`
      }
    }
  }

  /**
   * Show manual fix instructions
   * @param {Object} issue - Permission issue
   * @returns {Object} Resolution result
   */
  async showManualFixInstructions(issue) {
    console.log(chalk.yellow('\n📋 Manual Fix Instructions:'))
    
    if (issue.details) {
      issue.details.forEach(detail => {
        if (detail.startsWith('•') || detail.startsWith('-')) {
          console.log(chalk.cyan(`  ${detail}`))
        } else {
          console.log(`  ${detail}`)
        }
      })
    }

    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Press Enter after applying the fixes manually',
        default: true
      }
    ])

    return {
      resolved: false,
      skipped: true,
      message: 'Manual fix instructions provided'
    }
  }

  /**
   * Resolve disk space issues
   * @param {Object} issue - Disk space issue
   * @returns {Object} Resolution result
   */
  async resolveDiskSpaceIssue(issue) {
    console.log(chalk.yellow('\n💾 Disk Space Issue:'))
    if (issue.details) {
      issue.details.forEach(detail => console.log(`  ${detail}`))
    }

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to resolve the disk space issue?',
        choices: [
          { name: 'Continue anyway (may cause sync failures)', value: 'continue' },
          { name: 'Cancel and free up disk space first', value: 'cancel' }
        ],
        default: 'cancel'
      }
    ])

    if (answer.action === 'continue') {
      return {
        resolved: false,
        skipped: true,
        message: 'User chose to continue with insufficient disk space'
      }
    } else {
      throw new Error('Operation cancelled due to insufficient disk space')
    }
  }

  /**
   * Resolve generic issues
   * @param {Object} issue - Generic safety issue
   * @returns {Object} Resolution result
   */
  async resolveGenericIssue(issue) {
    const choices = [
      { name: 'Skip this check', value: 'skip' },
      { name: 'Cancel operation', value: 'cancel' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `How would you like to handle this issue: ${issue.message}?`,
        choices,
        default: 'skip'
      }
    ])

    if (answer.action === 'skip') {
      return { resolved: false, skipped: true, message: 'Issue skipped by user' }
    } else {
      throw new Error('Operation cancelled by user')
    }
  }

  /**
   * Group issues by type for better organization
   * @param {Array} issues - Array of safety issues
   * @returns {Object} Grouped issues
   */
  groupIssuesByType(issues) {
    const groups = {
      'Git Repository': [],
      'Source Path': [],
      'Permissions': [],
      'Disk Space': [],
      'Other': []
    }

    for (const issue of issues) {
      if (issue.id.includes('git')) {
        groups['Git Repository'].push(issue)
      } else if (issue.id.includes('source-path')) {
        groups['Source Path'].push(issue)
      } else if (issue.id.includes('perm') || issue.id.includes('destination')) {
        groups['Permissions'].push(issue)
      } else if (issue.id.includes('disk-space')) {
        groups['Disk Space'].push(issue)
      } else {
        groups['Other'].push(issue)
      }
    }

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, value]) => value.length > 0)
    )
  }

  /**
   * Format issue header for display
   * @param {Object} issue - Safety issue
   * @returns {string} Formatted header
   */
  formatIssueHeader(issue) {
    const icon = issue.status === 'fail' ? '❌' : '⚠️'
    const color = issue.status === 'fail' ? 'red' : 'yellow'
    
    return chalk[color](`${icon} ${issue.message}`)
  }

  /**
   * Format resolution summary
   * @param {Object} results - Resolution results
   * @returns {string} Formatted summary
   */
  formatResolutionSummary(results) {
    const lines = ['\n' + chalk.bold('🔍 Safety Issue Resolution Summary:')]
    
    if (results.resolved.length > 0) {
      lines.push(chalk.green(`✅ Resolved: ${results.resolved.length}`))
    }
    if (results.skipped.length > 0) {
      lines.push(chalk.yellow(`⏭️  Skipped: ${results.skipped.length}`))
    }
    if (results.failed.length > 0) {
      lines.push(chalk.red(`❌ Failed: ${results.failed.length}`))
    }

    lines.push('')
    if (results.canProceed) {
      lines.push(chalk.green('✅ All critical issues resolved - sync can proceed'))
    } else {
      lines.push(chalk.red('❌ Critical issues remain - sync cannot proceed safely'))
    }

    return lines.join('\n')
  }

  /**
   * Get resolution history
   * @returns {Array} Array of resolution history entries
   */
  getResolutionHistory() {
    return [...this.resolutionHistory]
  }

  /**
   * Clear resolution history
   */
  clearHistory() {
    this.resolutionHistory = []
  }
}

module.exports = SafetyResolver