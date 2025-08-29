const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

class FileSyncer {
  constructor() {
  }

  async syncFiles(selectedChanges, dryRun = false) {
    const results = {
      synced: [],
      errors: [],
      dryRun
    }

    const allFiles = [...selectedChanges.new, ...selectedChanges.modified]
    
    if (dryRun) {
      results.synced = allFiles.map(file => ({
        displayPath: file.displayPath,
        type: selectedChanges.new.includes(file) ? 'new' : 'modified',
        action: 'would sync'
      }))
      return results
    }

    for (const file of allFiles) {
      try {
        await this.syncSingleFile(file)
        results.synced.push({
          displayPath: file.displayPath,
          type: selectedChanges.new.includes(file) ? 'new' : 'modified',
          action: 'synced'
        })
      } catch (error) {
        results.errors.push({
          displayPath: file.displayPath,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Sync a single file from project to source
   * @param {Object} fileInfo - File information object
   */
  async syncSingleFile(fileInfo) {
    const { projectPath, sourcePath, displayPath } = fileInfo
    
    // Ensure destination directory exists
    await fs.ensureDir(path.dirname(sourcePath))
    
    // Copy file with error handling
    try {
      await fs.copy(projectPath, sourcePath, {
        overwrite: true,
        preserveTimestamps: true
      })
    } catch (error) {
      throw new Error(`Failed to copy ${displayPath}: ${error.message}`)
    }
  }

  /**
   * Format sync results for display
   * @param {Object} results - Sync results
   */
  formatResults(results) {
    const messages = []
    
    if (results.dryRun) {
      messages.push(chalk.cyan('🔍 Dry Run Results:'))
      messages.push('')
      
      if (results.synced.length === 0) {
        messages.push(chalk.yellow('No files would be synced.'))
        return messages.join('\n')
      }
      
      results.synced.forEach(file => {
        const icon = file.type === 'new' ? '➕' : '🔄'
        const typeLabel = file.type === 'new' ? 'NEW' : 'MODIFIED'
        messages.push(`${icon} ${chalk.cyan(`[${typeLabel}]`)} ${file.displayPath}`)
      })
      
      messages.push('')
      messages.push(chalk.green(`✓ ${results.synced.length} file(s) would be synced`))
    } else {
      if (results.synced.length > 0) {
        results.synced.forEach(file => {
          const icon = file.type === 'new' ? '➕' : '🔄'
          messages.push(`${icon} ${chalk.green('Synced')} ${file.displayPath}`)
        })
      }
      
      if (results.errors.length > 0) {
        messages.push('')
        messages.push(chalk.red('❌ Errors:'))
        results.errors.forEach(error => {
          messages.push(`  ${chalk.red('✗')} ${error.displayPath}: ${error.error}`)
        })
      }
      
      messages.push('')
      if (results.errors.length === 0) {
        messages.push(chalk.green(`✅ Successfully synced ${results.synced.length} file(s)`))
      } else {
        messages.push(chalk.yellow(`⚠️  Synced ${results.synced.length} file(s) with ${results.errors.length} error(s)`))
      }
    }
    
    return messages.join('\n')
  }
}

module.exports = FileSyncer