
const { EventEmitter } = require('events')
const SimpleChangeDetector = require('../detection/SimpleChangeDetector')
const InkFileSelectorApp = require('./InkFileSelectorWrapper')
const SelectionManager = require('../selection/SelectionManager')
const FilePreviewPane = require('./FilePreviewPane')
const chalk = require('chalk')

class InteractiveSync extends EventEmitter {
  constructor(sourcePath, destinationPath, options = {}) {
    super()
    
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
    
    this.options = {
      includeDirectories: options.includeDirectories || ['.claude', 'protocol-assets'],
      excludePatterns: options.excludePatterns || [
        'node_modules/**',
        '.git/**',
        '*.log',
        '.DS_Store',
        '*.tmp'
      ],
      
      enableInteractiveMode: options.enableInteractiveMode !== false,
      autoSelectNew: options.autoSelectNew || false,
      autoSelectModified: options.autoSelectModified || false,
      
      enablePreview: options.enablePreview !== false,
      previewCaching: options.previewCaching !== false,
      
      confirmBeforeSync: options.confirmBeforeSync !== false,
      dryRun: options.dryRun || false,
      
      // Performance options
      maxConcurrency: options.maxConcurrency || 5,
      enableProgressReporting: options.enableProgressReporting !== false,
      
      ...options
    }
    
    // Initialize components
    this.changeDetector = new SimpleChangeDetector(sourcePath, destinationPath, {
      includeDirectories: this.options.includeDirectories,
      excludePatterns: this.options.excludePatterns,
      maxConcurrency: this.options.maxConcurrency,
      enableProgressReporting: this.options.enableProgressReporting
    })
    
    this.selectionManager = null
    this.fileSelector = null
    this.previewPane = new FilePreviewPane({
      enableCaching: this.options.previewCaching
    })
    
    // State tracking
    this.detectedChanges = []
    this.selectedFiles = []
    this.syncResults = null
    
    this.setupEventHandlers()
  }

  /**
   * Setup event handlers for change detector
   */
  setupEventHandlers() {
    this.changeDetector.on('progress', (progress) => {
      this.emit('detectionProgress', progress)
    })
    
    this.changeDetector.on('complete', (result) => {
      this.emit('detectionComplete', result)
    })
    
    this.changeDetector.on('error', (error) => {
      this.emit('error', error)
    })
  }

  /**
   * Main method to run interactive sync
   */
  async run() {
    try {
      console.log(chalk.cyan('🔄 Starting Interactive Sync Process'))
      console.log(chalk.gray(`Source: ${this.sourcePath}`))
      console.log(chalk.gray(`Destination: ${this.destinationPath}`))
      console.log('')
      
      // Phase 1: Detect Changes
      const detectionResult = await this.detectChanges()
      
      if (detectionResult.changes.length === 0) {
        console.log(chalk.green('✅ No changes detected. Everything is up to date!'))
        return {
          phase: 'detection',
          changesDetected: 0,
          filesSelected: 0,
          syncPerformed: false
        }
      }
      
      // Phase 2: Interactive Selection (if enabled)
      const selectedFiles = await this.selectFiles(detectionResult.changes)
      
      if (selectedFiles.length === 0) {
        console.log(chalk.yellow('ℹ️ No files selected for sync.'))
        return {
          phase: 'selection',
          changesDetected: detectionResult.changes.length,
          filesSelected: 0,
          syncPerformed: false
        }
      }
      
      // Phase 3: Confirmation and Sync
      const syncResult = await this.performSync(selectedFiles)
      
      return {
        phase: 'complete',
        changesDetected: detectionResult.changes.length,
        filesSelected: selectedFiles.length,
        syncPerformed: true,
        syncResult
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Interactive sync failed:'), error.message)
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Phase 1: Detect file changes
   */
  async detectChanges() {
    console.log(chalk.blue('📋 Phase 1: Detecting file changes...'))
    
    const result = await this.changeDetector.detectChanges()
    
    this.detectedChanges = result.changes
    
    // Display summary
    this.displayDetectionSummary(result)
    
    return result
  }

  /**
   * Phase 2: Interactive file selection
   */
  async selectFiles(changes) {
    if (!this.options.enableInteractiveMode) {
      // Auto-select based on configuration
      return this.autoSelectFiles(changes)
    }
    
    console.log(chalk.blue('🎯 Phase 2: Interactive file selection...'))
    
    // Initialize selection manager
    this.selectionManager = new SelectionManager(changes, {
      enablePresets: true,
      autoSaveHistory: true
    })
    
    // Apply auto-selection rules
    this.applyAutoSelectionRules()
    
    // Initialize interactive selector using transpiled Ink component
    this.fileSelector = new InkFileSelectorApp(changes, {
      showPreview: this.options.enablePreview,
      terminalWidth: process.stdout.columns || 80,
      enableSearch: true,
      enableHelp: true
    })
    
    // Show interactive selector
    console.log('')
    const selectedFiles = await this.fileSelector.show()
    
    if (selectedFiles === null) {
      console.log(chalk.yellow('🚫 Selection cancelled by user.'))
      return []
    }
    
    this.selectedFiles = selectedFiles
    
    // Display selection summary
    this.displaySelectionSummary(selectedFiles)
    
    return selectedFiles
  }

  /**
   * Phase 3: Perform sync operation
   */
  async performSync(selectedFiles) {
    console.log(chalk.blue('⚡ Phase 3: Performing sync operation...'))
    
    if (this.options.confirmBeforeSync) {
      const confirmed = await this.confirmSync(selectedFiles)
      if (!confirmed) {
        console.log(chalk.yellow('🚫 Sync cancelled by user.'))
        return { cancelled: true }
      }
    }
    
    if (this.options.dryRun) {
      console.log(chalk.cyan('🔍 Dry run mode - no actual changes will be made'))
      return this.performDryRun(selectedFiles)
    }
    
    return await this.performActualSync(selectedFiles)
  }

  /**
   * Auto-select files based on configuration
   */
  autoSelectFiles(changes) {
    const selected = changes.filter(change => {
      switch (change.changeType) {
        case 'new':
          return this.options.autoSelectNew
        case 'modified':
          return this.options.autoSelectModified
        default:
          return false
      }
    })
    
    if (selected.length > 0) {
      console.log(chalk.green(`🔄 Auto-selected ${selected.length} files based on configuration`))
    }
    
    return selected
  }

  /**
   * Apply auto-selection rules to selection manager
   */
  applyAutoSelectionRules() {
    if (this.options.autoSelectNew) {
      this.selectionManager.selectByChangeType('new', true, 'auto_select_new')
    }
    
    if (this.options.autoSelectModified) {
      this.selectionManager.selectByChangeType('modified', true, 'auto_select_modified')
    }
  }

  /**
   * Display detection phase summary
   */
  displayDetectionSummary(result) {
    const { changes, summary } = result
    
    console.log('')
    console.log(chalk.bold('📊 Detection Summary:'))
    
    // Count by change type
    const counts = {
      new: 0,
      modified: 0,
      deleted: 0,
      moved: 0
    }
    
    changes.forEach(change => {
      counts[change.changeType] = (counts[change.changeType] || 0) + 1
    })
    
    if (counts.new > 0) {
      console.log(chalk.green(`   🆕 New files: ${counts.new}`))
    }
    
    if (counts.modified > 0) {
      console.log(chalk.yellow(`   📝 Modified files: ${counts.modified}`))
    }
    
    if (counts.deleted > 0) {
      console.log(chalk.red(`   🗑️ Deleted files: ${counts.deleted}`))
    }
    
    if (counts.moved > 0) {
      console.log(chalk.blue(`   🔀 Moved files: ${counts.moved}`))
    }
    
    console.log(chalk.gray(`   ⏱️ Detection time: ${summary.totalTime}ms`))
    console.log('')
  }

  /**
   * Display selection phase summary
   */
  displaySelectionSummary(selectedFiles) {
    console.log('')
    console.log(chalk.bold('🎯 Selection Summary:'))
    
    if (selectedFiles.length === 0) {
      console.log(chalk.gray('   No files selected'))
      return
    }
    
    // Count by change type
    const counts = {
      new: 0,
      modified: 0,
      deleted: 0,
      moved: 0
    }
    
    selectedFiles.forEach(file => {
      counts[file.changeType] = (counts[file.changeType] || 0) + 1
    })
    
    console.log(chalk.cyan(`   📁 Total selected: ${selectedFiles.length}`))
    
    if (counts.new > 0) {
      console.log(chalk.green(`      🆕 New: ${counts.new}`))
    }
    
    if (counts.modified > 0) {
      console.log(chalk.yellow(`      📝 Modified: ${counts.modified}`))
    }
    
    if (counts.deleted > 0) {
      console.log(chalk.red(`      🗑️ Deleted: ${counts.deleted}`))
    }
    
    if (counts.moved > 0) {
      console.log(chalk.blue(`      🔀 Moved: ${counts.moved}`))
    }
    
    console.log('')
  }

  /**
   * Confirm sync operation with user
   */
  async confirmSync(selectedFiles) {
    console.log('')
    console.log(chalk.bold.yellow('⚠️ Confirm Sync Operation'))
    console.log(chalk.gray(`This will sync ${selectedFiles.length} files from:`))
    console.log(chalk.gray(`  Source: ${this.sourcePath}`))
    console.log(chalk.gray(`  Destination: ${this.destinationPath}`))
    console.log('')
    
    // Simple confirmation for now
    // In a full implementation, you might use inquirer for better prompts
    return new Promise((resolve) => {
      // Give stdin time to settle after the interactive selector
      setTimeout(() => {
        // Ensure stdin is in the correct state after file selector
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
        process.stdin.resume();
        
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        readline.question(chalk.cyan('Continue with sync? (y/N): '), (answer) => {
          readline.close()
          resolve(answer.toLowerCase().startsWith('y'))
        })
      }, 100); // Small delay to let stdin settle
    })
  }

  /**
   * Perform dry run (simulation)
   */
  performDryRun(selectedFiles) {
    console.log('')
    console.log(chalk.cyan('🔍 Dry Run Results:'))
    console.log('')
    
    selectedFiles.forEach((file) => {
      const icon = this.getChangeIcon(file.changeType)
      console.log(`${icon} ${file.path}`)
      
      if (file.changeType === 'modified' && file.reason) {
        console.log(chalk.gray(`   └─ ${file.reason}`))
      }
    })
    
    console.log('')
    console.log(chalk.cyan(`Would sync ${selectedFiles.length} files`))
    
    return {
      dryRun: true,
      filesProcessed: selectedFiles.length,
      operations: selectedFiles.map(file => ({
        file: file.path,
        operation: file.changeType,
        status: 'would_sync'
      }))
    }
  }

  /**
   * Perform actual sync operation
   */
  async performActualSync(selectedFiles) {
    // Perform actual file synchronization operations
    console.log('')
    console.log(chalk.green('⚡ Syncing files...'))
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    }
    
    // Simulate file operations with progress
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const progress = Math.round(((i + 1) / selectedFiles.length) * 100)
      
      process.stdout.write(`\r${chalk.cyan('Progress:')} ${progress}% (${i + 1}/${selectedFiles.length})`)
      
      try {
        // Small delay for user feedback
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Perform the actual file operation
        await this.syncFile(file)
        
        results.success.push(file.path)
        
      } catch (error) {
        results.errors.push({
          file: file.path,
          error: error.message
        })
      }
    }
    
    process.stdout.write('\n\n')
    
    // Display results
    this.displaySyncResults(results)
    
    return {
      dryRun: false,
      filesProcessed: selectedFiles.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      skippedCount: results.skipped.length,
      results
    }
  }

  /**
   * Sync individual file - performs actual file operations
   */
  async syncFile(file) {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Calculate actual source and destination paths
    const sourcePath = path.join(this.sourcePath, file.path);
    const destPath = path.join(this.destinationPath, file.path);
    
    switch (file.changeType) {
      case 'new':
        // Copy new file from source to destination
        console.log(`\n${chalk.green('+')} ${file.path}`)
        await this.ensureDirectoryExists(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
        break
        
      case 'modified':
        // Update existing file
        console.log(`\n${chalk.yellow('~')} ${file.path}`)
        await this.ensureDirectoryExists(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
        break
        
      case 'deleted':
        // Remove file from destination
        console.log(`\n${chalk.red('-')} ${file.path}`)
        try {
          await fs.unlink(destPath);
        } catch (error) {
          if (error.code !== 'ENOENT') {throw error;} // Ignore if already deleted
        }
        break
        
      case 'moved':
        // Handle file move (for now, treat as copy)
        console.log(`\n${chalk.blue('→')} ${file.path}`)
        await this.ensureDirectoryExists(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
        break
    }
  }
  
  async ensureDirectoryExists(dirPath) {
    const fs = require('fs').promises;
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {throw error;}
    }
  }

  /**
   * Display sync results
   */
  displaySyncResults(results) {
    console.log(chalk.bold('📊 Sync Results:'))
    
    if (results.success.length > 0) {
      console.log(chalk.green(`   ✅ Successfully synced: ${results.success.length} files`))
    }
    
    if (results.errors.length > 0) {
      console.log(chalk.red(`   ❌ Errors: ${results.errors.length} files`))
      results.errors.forEach(error => {
        console.log(chalk.red(`      • ${error.file}: ${error.error}`))
      })
    }
    
    if (results.skipped.length > 0) {
      console.log(chalk.yellow(`   ⏭️ Skipped: ${results.skipped.length} files`))
    }
    
    console.log('')
  }

  /**
   * Get icon for change type
   */
  getChangeIcon(changeType) {
    const icons = {
      new: chalk.green('🆕'),
      modified: chalk.yellow('📝'),
      deleted: chalk.red('🗑️'),
      moved: chalk.blue('🔀')
    }
    return icons[changeType] || '❓'
  }

  /**
   * Get current sync statistics
   */
  getStatistics() {
    return {
      detectedChanges: this.detectedChanges.length,
      selectedFiles: this.selectedFiles.length,
      lastSyncResult: this.syncResults,
      detectionMetrics: this.changeDetector.getMetrics(),
      selectionMetrics: this.selectionManager?.getStatistics(),
      selectorMetrics: this.fileSelector?.getMetrics()
    }
  }

  /**
   * Clear caches and reset state
   */
  reset() {
    this.detectedChanges = []
    this.selectedFiles = []
    this.syncResults = null
    
    if (this.changeDetector) {
      this.changeDetector.clearCache()
    }
    
    if (this.previewPane) {
      this.previewPane.clearCache()
    }
    
    if (this.selectionManager) {
      this.selectionManager.reset()
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.fileSelector) {
      this.fileSelector.cleanup()
    }
    
    this.removeAllListeners()
  }
}

module.exports = InteractiveSync