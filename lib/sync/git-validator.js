const simpleGit = require('simple-git')
const chalk = require('chalk')

class GitValidator {
  constructor() {
  }

  async validateSourceRepository(sourcePath) {
    const git = simpleGit(sourcePath)
    
    try {
      const isRepo = await git.checkIsRepo()
      if (!isRepo) {
        throw new Error('Source directory is not a git repository')
      }

      // Check for uncommitted changes
      const status = await git.status()
      
      const hasUncommittedChanges = 
        status.files.length > 0 || 
        status.staged.length > 0 || 
        status.modified.length > 0 ||
        status.created.length > 0 ||
        status.deleted.length > 0 ||
        status.renamed.length > 0

      if (hasUncommittedChanges) {
        const message = this.formatGitStatusMessage(status)
        throw new Error(`Source repository has uncommitted changes. Please commit or stash them first.\n\n${message}`)
      }

      return true
    } catch (error) {
      if (error.message.includes('not a git repository')) {
        throw new Error('Source directory is not a git repository')
      }
      throw error
    }
  }

  /**
   * Format git status for user-friendly error message
   * @param {Object} status - Git status object from simple-git
   */
  formatGitStatusMessage(status) {
    const messages = []
    
    if (status.staged.length > 0) {
      messages.push(chalk.green('Staged changes:'))
      status.staged.forEach(file => {
        messages.push(`  ${chalk.green('+')} ${file}`)
      })
    }
    
    if (status.modified.length > 0) {
      messages.push(chalk.yellow('Modified files:'))
      status.modified.forEach(file => {
        messages.push(`  ${chalk.yellow('M')} ${file}`)
      })
    }
    
    if (status.created.length > 0) {
      messages.push(chalk.green('New files:'))
      status.created.forEach(file => {
        messages.push(`  ${chalk.green('A')} ${file}`)
      })
    }
    
    if (status.deleted.length > 0) {
      messages.push(chalk.red('Deleted files:'))
      status.deleted.forEach(file => {
        messages.push(`  ${chalk.red('D')} ${file}`)
      })
    }

    if (status.renamed.length > 0) {
      messages.push(chalk.blue('Renamed files:'))
      status.renamed.forEach(file => {
        messages.push(`  ${chalk.blue('R')} ${file.from} → ${file.to}`)
      })
    }
    
    messages.push('\nPlease run one of the following:')
    messages.push(chalk.cyan('  git add . && git commit -m "Save work before sync"'))
    messages.push(chalk.cyan('  git stash'))
    
    return messages.join('\n')
  }

  /**
   * Check if directory is a git repository (optional check)
   * @param {string} dirPath - Directory path to check
   */
  async isGitRepository(dirPath) {
    try {
      const git = simpleGit(dirPath)
      return await git.checkIsRepo()
    } catch {
      return false
    }
  }
}

module.exports = GitValidator