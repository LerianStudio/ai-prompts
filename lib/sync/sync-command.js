const chalk = require('chalk')

const MetadataManager = require('./metadata-manager')
const ChangeDetector = require('./change-detector')
const GitValidator = require('./git-validator')
const FileSyncer = require('./file-syncer')
const { selectFiles, displayResults } = require('./interactive-ui')

class SyncCommand {
  constructor() {
    this.metadataManager = new MetadataManager()
    this.changeDetector = new ChangeDetector()
    this.gitValidator = new GitValidator()
    this.fileSyncer = new FileSyncer()
  }

  async execute(options = {}) {
    const { dryRun = false, projectPath = process.cwd() } = options
    
    try {
      console.log(chalk.cyan.bold('🔄 Lerian Protocol Sync'))
      console.log('')
      
      console.log(chalk.gray('📋 Reading installation metadata...'))
      const metadata = await this.metadataManager.readMetadata(projectPath)
      await this.metadataManager.validateSourcePath(metadata)
      
      console.log(chalk.green('✓') + ` Found source: ${chalk.cyan(metadata.sourcePath)}`)
      
      console.log(chalk.gray('🔍 Validating source repository...'))
      await this.gitValidator.validateSourceRepository(metadata.sourcePath)
      console.log(chalk.green('✓') + ' Source repository is clean')
      
      // Step 3: Detect changes
      console.log(chalk.gray('🔍 Detecting changes...'))
      const changes = await this.changeDetector.detectChanges(projectPath, metadata.sourcePath)
      
      const totalChanges = changes.new.length + changes.modified.length
      console.log(chalk.green('✓') + ` Found ${totalChanges} changed file(s)`)
      
      if (totalChanges === 0) {
        console.log(chalk.yellow('📭 No changes detected. Everything is up to date!'))
        return
      }
      
      // Step 4: Display changes summary
      this.displayChangesSummary(changes)
      
      // Step 5: Interactive file selection (unless dry-run with no interaction)
      let selectedFiles
      if (dryRun && options.autoSelectAll) {
        // For automated dry runs, select all files
        selectedFiles = [
          ...changes.new.map(f => f.displayPath),
          ...changes.modified.map(f => f.displayPath)
        ]
      } else {
        // Interactive selection
        selectedFiles = await selectFiles(changes)
      }
      
      if (selectedFiles.length === 0) {
        console.log(chalk.yellow('No files selected. Sync cancelled.'))
        return
      }
      
      // Step 6: Filter selected changes
      const selectedChanges = this.changeDetector.filterSelectedChanges(changes, selectedFiles)
      
      // Step 7: Perform sync (or dry run)
      console.log('')
      if (dryRun) {
        console.log(chalk.cyan('🔍 Performing dry run...'))
      } else {
        console.log(chalk.cyan('🔄 Syncing files...'))
      }
      
      const results = await this.fileSyncer.syncFiles(selectedChanges, dryRun)
      
      // Step 8: Display results
      displayResults(results)
      
      // Step 9: Update metadata timestamp (only for real sync)
      if (!dryRun && results.errors.length === 0) {
        await this.metadataManager.updateSyncTimestamp(projectPath)
      }
      
      console.log('')
      if (dryRun) {
        console.log(chalk.cyan('💡 Run without --dry-run to perform the actual sync'))
      } else if (results.errors.length === 0) {
        console.log(chalk.green('🎉 Sync completed successfully!'))
      } else {
        console.log(chalk.yellow('⚠️  Sync completed with some errors'))
        process.exit(1)
      }
      
    } catch (error) {
      console.log('')
      console.error(chalk.red('❌ Sync failed:'), error.message)
      
      if (error.message.includes('uncommitted changes')) {
        console.log('')
        console.log(chalk.yellow('💡 Next steps:'))
        console.log('  1. Go to your lerian-protocol source directory')
        console.log('  2. Commit your changes: git add . && git commit -m "your message"')
        console.log('  3. Run the sync command again')
      }
      
      process.exit(1)
    }
  }

  /**
   * Display a summary of detected changes
   * @param {Object} changes - Changes object from ChangeDetector
   */
  displayChangesSummary(changes) {
    if (changes.new.length > 0) {
      console.log('')
      console.log(chalk.green.bold('📄 New files:'))
      changes.new.forEach(file => {
        console.log(`  ${chalk.green('+')} ${file.displayPath}`)
      })
    }
    
    if (changes.modified.length > 0) {
      console.log('')
      console.log(chalk.yellow.bold('📝 Modified files:'))
      changes.modified.forEach(file => {
        console.log(`  ${chalk.yellow('M')} ${file.displayPath}`)
      })
    }
    
    console.log('')
  }

}

module.exports = SyncCommand