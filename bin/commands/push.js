#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const path = require('path')
const inquirer = require('inquirer')
const ConfigManager = require('../../protocol-assets/lib/config')
const MetadataManager = require('../../protocol-assets/lib/sync/metadata-manager')
const PushPlanner = require('../../protocol-assets/lib/sync/push-planner')
const PushExecutor = require('../../protocol-assets/lib/sync/push-executor')
const FileSelector = require('../../protocol-assets/lib/sync/file-selector')

class PushCommand {
  /**
   * Register the push command with the main CLI program
   * @param {Command} program - Commander.js program instance
   */
  static register(program) {
    const pushCmd = new Command('push')
      .description(
        'Push selected files from target project back to source Lerian Protocol package'
      )
      .option('-d, --dry-run', 'Preview changes without executing')
      .option('-i, --interactive', 'Interactive file selection mode')
      .option(
        '--files <files>',
        'Comma-separated list of files or patterns to push'
      )
      .option('--include <patterns>', 'Include patterns (comma-separated)')
      .option('--exclude <patterns>', 'Exclude patterns (comma-separated)')
      .option('--force', 'Skip confirmation prompts for risky operations')
      .option('--confirm', 'Confirm dangerous operations')
      .option('--allow-critical', 'Allow modification of critical system files')
      .option(
        '--conflict-strategy <strategy>',
        'Conflict resolution: skip, force_push, keep_source',
        'skip'
      )
      .option('--debug', 'Enable debug output and verbose logging')
      .addHelpText(
        'after',
        `
Examples:
  lerian push                              # Interactive push with file selection
  lerian push --dry-run                    # Preview what would be pushed  
  lerian push --files="docs/**.md"         # Push all markdown files in docs
  lerian push --include="agents/custom"    # Push custom agents directory
  lerian push --exclude="*.log"            # Exclude log files
  lerian push --force --confirm            # Push with minimal prompts

File Selection:
  --files          Specific files/patterns to push
  --include        Include patterns (supports glob: *, **, ?)
  --exclude        Exclude patterns from selection
  
Safety Options:
  --dry-run        Show what would be pushed (recommended first step)
  --force          Skip most confirmation prompts
  --confirm        Confirm dangerous operations explicitly
  --allow-critical Allow pushing critical system files

Conflict Handling:
  skip             Skip conflicted files (default, safest)
  force_push       Override source with target version
  keep_source      Keep source version, skip target changes

Note: This command pushes changes FROM your project TO the Lerian Protocol
source package. This is the reverse of 'sync' and requires write access to
the source package location.`
      )
      .action(this.execute.bind(this))

    program.addCommand(pushCmd)
  }

  /**
   * Execute the push command with the provided options
   * @param {Object} options - Command options from commander.js
   */
  static async execute(options) {
    const startTime = Date.now()

    try {
      const configManager = new ConfigManager()
      const config = await configManager.getEnvironmentConfig()
      const metadataManager = new MetadataManager()

      let CommandHeader, TerminalDetector

      try {
        CommandHeader = require('../../lib/components/CommandHeader')
        TerminalDetector = require('../../lib/utils/terminal')
      } catch {
        console.log(chalk.blue('📤 Lerian Protocol Push'))
        console.log(chalk.gray('Pushing changes from target to source'))
        console.log('')
      }

      // Validate environment and get paths
      const validation = await this.validateEnvironment()
      const targetPath = validation.cwd

      let terminalCaps = { width: 80, supportsColor: true }
      if (TerminalDetector) {
        terminalCaps = TerminalDetector.getCapabilities()
      }

      if (CommandHeader) {
        const header = new CommandHeader({
          title: 'Lerian Protocol Push',
          subtitle: options.dryRun
            ? 'Preview Mode - No changes will be made'
            : 'Pushing changes from target to source',
          variant: 'standard',
          width: terminalCaps.width
        })
        console.log(header.render())
      }

      // Get source path from installation metadata
      const installMeta = await metadataManager.readMetadata(targetPath)
      if (!installMeta) {
        throw new Error(
          'Lerian Protocol installation metadata not found. Please ensure Lerian Protocol is installed in this project.'
        )
      }

      // Validate source path exists and is writable
      await metadataManager.validateSourcePath(installMeta)
      const sourcePath = installMeta.sourcePath
      const profile = installMeta.profile || 'full'

      if (options.debug || config.cli?.debugMode) {
        console.log(chalk.yellow('🐛 Debug mode enabled'))
        console.log('Command options:', JSON.stringify(options, null, 2))
        console.log('Source path:', sourcePath)
        console.log('Target path:', targetPath)
        console.log('Profile:', profile)
        console.log('')
      }

      // Initialize push components
      const pushPlanner = new PushPlanner()
      const pushExecutor = new PushExecutor()
      const fileSelector = new FileSelector()

      // Get last push hashes (different from sync hashes)
      const lastPushHashes = await this.getLastPushHashes(
        metadataManager,
        targetPath
      )

      console.log(chalk.blue('🔍 Analyzing files eligible for push...'))

      // Initial file discovery - find all pushable files
      const hasExistingMetadata = Object.keys(lastPushHashes).length > 0
      const allPushableFiles = await this.discoverPushableFiles(
        targetPath,
        profile,
        hasExistingMetadata,
        options
      )

      if (Object.keys(allPushableFiles).length === 0) {
        console.log(chalk.yellow('📭 No files eligible for push found.'))
        console.log(
          chalk.gray('To push files, they must be in pushable locations like:')
        )
        console.log(
          chalk.gray(
            '  • .claude/ (all Claude configuration and customizations)'
          )
        )
        console.log(chalk.gray('  • protocol-assets/ (all protocol assets)'))
        console.log(chalk.gray('  • docs/ (documentation files)'))
        return
      }

      // File selection - either interactive or from command line args
      let fileSelection
      if (options.interactive || (!options.files && !options.include)) {
        // Interactive mode
        fileSelection = await fileSelector.selectFilesForPush(
          allPushableFiles,
          options
        )
      } else {
        // Command line selection
        fileSelection = fileSelector.createSelectionFromArgs(
          allPushableFiles,
          options
        )
      }

      if (Object.keys(fileSelection.selectedFiles).length === 0) {
        console.log(chalk.yellow('📭 No files selected for push.'))
        return
      }

      console.log(chalk.blue('📊 Creating push plan...'))

      // Create push plan with selected files
      const pushPlan = await pushPlanner.createPushPlan(
        targetPath,
        sourcePath,
        lastPushHashes,
        {
          fileSelection: {
            ...fileSelection,
            useGitDetection: options.git
          },
          onProgress: (message) => {
            if (options.debug) {
              console.log(chalk.gray(`  ${message}`))
            }
          }
        }
      )

      // Display push plan summary
      this.displayPushPlan(pushPlan, options)

      // Handle dry-run mode
      if (options.dryRun) {
        console.log(
          chalk.yellow('\n📋 Dry-run complete. No changes were made.')
        )
        this.displayExecutionStats(pushPlan, Date.now() - startTime)
        return
      }

      // Check if push plan is empty
      if (pushPlan.operations.length === 0) {
        console.log(chalk.green('✨ No changes to push!'))
        return
      }

      // Safety confirmation for risky operations
      if (pushPlan.requiresConfirmation && !options.force) {
        const proceed = await this.confirmPushExecution(pushPlan, options)
        if (!proceed) {
          console.log(chalk.yellow('📭 Push cancelled by user'))
          return
        }
      }

      console.log(chalk.blue('\n🚀 Executing push operations...'))

      // Execute push with enhanced safety options
      let pushResult
      try {
        pushResult = await pushExecutor.executePushPlan(pushPlan, {
          dryRun: false,
          confirmed: options.confirm || options.force,
          confirmDelete: options.confirm || options.force,
          allowCritical: options.allowCritical,
          conflictStrategy: options.conflictStrategy,
          onProgress: (message) => {
            console.log(chalk.gray(`  ${message}`))
          }
        })
      } catch (error) {
        console.error(chalk.red('❌ Push execution error:'), error.message)
        if (options.debug) {
          console.error(chalk.red('Stack trace:'), error.stack)
        }
        throw error
      }

      // Update push metadata with new hashes
      if (pushResult.success) {
        await this.savePushMetadata(
          metadataManager,
          targetPath,
          pushPlan.snapshots.target,
          pushResult.operations
        )

        // Update baseline with current state after successful push
        try {
          const PushBaselineManager = require('../../lib/sync/push-baseline-manager')
          const baselineManager = new PushBaselineManager()

          const pushedFiles = pushResult.operations
            .filter((op) => op.status === 'completed')
            .map((op) => op.path)

          await baselineManager.updateBaseline(
            targetPath,
            pushPlan.snapshots.target.hashes,
            pushedFiles
          )

          console.log(chalk.gray('📝 Push baseline updated'))
        } catch (error) {
          console.warn(
            chalk.yellow(
              `Warning: Could not update push baseline: ${error.message}`
            )
          )
        }

        console.log(chalk.green('\n✅ Push completed successfully!'))

        if (pushResult.backupPath) {
          console.log(
            chalk.blue(
              `💾 Source backup created: ${path.basename(pushResult.backupPath)}`
            )
          )
        }
      } else {
        console.log(chalk.red('\n❌ Push completed with errors'))

        if (pushResult.rollbackAvailable && pushResult.backupPath) {
          console.log(
            chalk.yellow(
              `🔄 Rollback available using backup: ${path.basename(pushResult.backupPath)}`
            )
          )
        }
      }

      // Display final results
      this.displayPushResults(pushResult)
      this.displayExecutionStats(pushPlan, Date.now() - startTime)
    } catch (error) {
      console.error(chalk.red('❌ Push command failed:'), error.message)
      if (options.debug) {
        console.error(chalk.red('Stack trace:'), error.stack)
      }
      process.exit(1)
    }
  }

  /**
   * Validate that the command is being run in a valid environment
   */
  static async validateEnvironment() {
    const fs = require('fs-extra')
    const cwd = process.cwd()

    const hasPackageJson = await fs.pathExists(path.join(cwd, 'package.json'))
    const hasClaudeDir = await fs.pathExists(path.join(cwd, '.claude'))

    if (!hasPackageJson && !hasClaudeDir) {
      throw new Error(
        'This command must be run from a project directory with either package.json or .claude directory'
      )
    }

    return {
      cwd,
      hasPackageJson,
      hasClaudeDir
    }
  }

  /**
   * Discover files eligible for pushing
   * @param {string} targetPath - Target project path
   * @param {string} profile - Installation profile
   * @param {boolean} hasExistingMetadata - Whether push metadata exists
   * @param {Object} options - Command options
   * @returns {Promise<Object>} Pushable files with metadata
   */
  static async discoverPushableFiles(
    targetPath,
    profile,
    hasExistingMetadata = false,
    options = {}
  ) {
    const FileHasher = require('../../lib/sync/file-hasher')
    const fileHasher = new FileHasher({
      // Include additional patterns for push-specific files
      ignorePatterns: [
        '.git',
        'node_modules',
        '.DS_Store',
        '*.log',
        '.sync-backup',
        '.push-backup',
        '*.tmp',
        'dist',
        'build',
        '.claude/.lerian-protocol-meta.json',
        '.claude/.lerian-sync-meta.json'
      ]
    })

    // Get all files in target project
    const allFiles = await fileHasher.hashDirectory(targetPath)

    // Filter to only pushable files with git detection if requested
    const pushPlanner = new PushPlanner()

    // Use baseline-based filtering (handled in filterPushableFiles)
    return await pushPlanner.filterPushableFiles(
      allFiles,
      { profile },
      targetPath,
      hasExistingMetadata
    )
  }

  /**
   * Get last push hashes from metadata
   * @param {MetadataManager} metadataManager - Metadata manager instance
   * @param {string} targetPath - Target path
   * @returns {Promise<Object>} Last push hashes
   */
  static async getLastPushHashes(metadataManager, targetPath) {
    try {
      const pushMeta = await metadataManager.readSyncMetadata(
        targetPath,
        '.lerian-push-meta.json'
      )
      return pushMeta?.snapshots?.target?.hashes || {}
    } catch {
      return {}
    }
  }

  /**
   * Save push metadata after successful push
   * @param {MetadataManager} metadataManager - Metadata manager
   * @param {string} targetPath - Target path
   * @param {Object} targetSnapshot - Target snapshot
   * @param {Array} operations - Completed operations
   */
  static async savePushMetadata(
    metadataManager,
    targetPath,
    targetSnapshot,
    operations
  ) {
    const pushMetaPath = path.join(
      targetPath,
      '.claude',
      '.lerian-push-meta.json'
    )
    const metadata = {
      version: '1.0.0',
      lastPush: new Date().toISOString(),
      direction: 'target_to_source',
      snapshots: {
        target: targetSnapshot
      },
      lastOperations: {
        timestamp: new Date().toISOString(),
        operationCount: operations.length,
        summary: this.summarizePushOperations(operations)
      }
    }

    const fs = require('fs-extra')
    await fs.ensureDir(path.dirname(pushMetaPath))
    await fs.writeJSON(pushMetaPath, metadata, { spaces: 2 })
  }

  /**
   * Display push plan summary to user
   * @param {Object} pushPlan - Push plan object
   * @param {Object} options - Command options
   */
  static displayPushPlan(pushPlan, options) {
    console.log(chalk.blue('\n📤 Push Plan Summary:'))
    console.log(`  Target: ${pushPlan.targetPath}`)
    console.log(`  Source: ${pushPlan.sourcePath}`)
    console.log(`  Direction: Target → Source`)
    console.log(
      `  Risk Level: ${this.formatRiskLevel(pushPlan.estimatedImpact?.riskLevel || 'unknown')}`
    )

    const summary = pushPlan.summary
    if (summary.total === 0) {
      console.log(chalk.green('  🎉 No changes to push!'))
      return
    }

    console.log(chalk.white('\n  Operations:'))
    if (summary.create > 0) {
      console.log(
        chalk.green(`    ➕ ${summary.create} file(s) to create in source`)
      )
    }
    if (summary.update > 0) {
      console.log(
        chalk.blue(`    📝 ${summary.update} file(s) to update in source`)
      )
    }
    if (summary.delete > 0) {
      console.log(
        chalk.red(`    🗑️  ${summary.delete} file(s) to delete from source`)
      )
    }
    if (summary.conflict > 0) {
      console.log(
        chalk.yellow(`    ⚠️  ${summary.conflict} conflict(s) detected`)
      )
    }

    if (pushPlan.estimatedImpact && pushPlan.estimatedImpact.totalBytes > 0) {
      console.log(
        `  Estimated transfer: ${this.formatBytes(pushPlan.estimatedImpact.totalBytes)}`
      )
    }

    // Show warnings
    if (pushPlan.warnings && pushPlan.warnings.length > 0) {
      console.log(chalk.yellow('\n  ⚠️  Warnings:'))
      for (const warning of pushPlan.warnings) {
        console.log(chalk.yellow(`    - ${warning}`))
      }
    }

    // Show critical/dangerous operations
    const dangerousOps = pushPlan.operations.filter(
      (op) => op.safety === 'dangerous'
    )
    if (dangerousOps.length > 0) {
      console.log(chalk.red('\n  🚨 Dangerous operations:'))
      for (const op of dangerousOps.slice(0, 3)) {
        console.log(chalk.red(`    - ${op.path}: ${op.action}`))
      }
      if (dangerousOps.length > 3) {
        console.log(chalk.gray(`    ... and ${dangerousOps.length - 3} more`))
      }
    }
  }

  /**
   * Confirm push execution with user
   * @param {Object} pushPlan - Push plan
   * @param {Object} options - Command options
   * @returns {Promise<boolean>} True if user confirms
   */
  static async confirmPushExecution(pushPlan, options) {
    console.log(
      chalk.yellow('\n⚠️  This push operation requires confirmation:')
    )

    const riskLevel = pushPlan.estimatedImpact?.riskLevel || 'unknown'
    console.log(`   Risk Level: ${this.formatRiskLevel(riskLevel)}`)
    console.log(`   Operations: ${pushPlan.operations.length}`)
    console.log(
      `   Target → Source: ${pushPlan.targetPath} → ${pushPlan.sourcePath}`
    )

    if (pushPlan.warnings.length > 0) {
      console.log(chalk.yellow('\n   Warnings:'))
      for (const warning of pushPlan.warnings.slice(0, 3)) {
        console.log(chalk.yellow(`   - ${warning}`))
      }
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Do you want to proceed with this push operation?',
        default: riskLevel === 'low'
      }
    ])

    return confirmed
  }

  /**
   * Display push execution results
   * @param {Object} pushResult - Result from PushExecutor
   */
  static displayPushResults(pushResult) {
    if (!pushResult.operations || pushResult.operations.length === 0) {
      return
    }

    const stats = {
      completed: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of pushResult.operations) {
      stats[op.status] = (stats[op.status] || 0) + 1
    }

    console.log(chalk.white('\n📊 Push Results:'))
    if (stats.completed > 0) {
      console.log(chalk.green(`  ✅ ${stats.completed} completed`))
    }
    if (stats.skipped > 0) {
      console.log(chalk.yellow(`  ⏭️  ${stats.skipped} skipped`))
    }
    if (stats.failed > 0) {
      console.log(chalk.red(`  ❌ ${stats.failed} failed`))
    }

    // Show failed operations
    const failedOps = pushResult.operations.filter(
      (op) => op.status === 'failed'
    )
    if (failedOps.length > 0) {
      console.log(chalk.red('\n  Failed operations:'))
      for (const op of failedOps.slice(0, 3)) {
        console.log(chalk.red(`    - ${op.path}: ${op.error}`))
      }
      if (failedOps.length > 3) {
        console.log(
          chalk.gray(`    ... and ${failedOps.length - 3} more failures`)
        )
      }
    }

    // Show warnings
    if (pushResult.warnings && pushResult.warnings.length > 0) {
      console.log(chalk.yellow('\n  Warnings:'))
      for (const warning of pushResult.warnings) {
        console.log(chalk.yellow(`    - ${warning}`))
      }
    }
  }

  /**
   * Display execution statistics
   * @param {Object} pushPlan - Push plan object
   * @param {number} totalTime - Total execution time in ms
   */
  static displayExecutionStats(pushPlan, totalTime) {
    console.log(chalk.gray('\n⏱️  Statistics:'))
    console.log(chalk.gray(`  Total time: ${Math.round(totalTime)}ms`))
    console.log(
      chalk.gray(`  Files scanned: ${pushPlan.snapshots.target.fileCount}`)
    )
    console.log(chalk.gray(`  Plan generation: ${pushPlan.duration}ms`))
    console.log(chalk.gray(`  Eligible files: ${pushPlan.pushableFileCount}`))

    if (pushPlan.estimatedImpact && pushPlan.estimatedImpact.totalBytes > 0) {
      console.log(
        chalk.gray(
          `  Data size: ${this.formatBytes(pushPlan.estimatedImpact.totalBytes)}`
        )
      )
    }
  }

  /**
   * Format risk level with appropriate styling
   * @param {string} riskLevel - Risk level
   * @returns {string} Formatted risk level
   */
  static formatRiskLevel(riskLevel) {
    switch (riskLevel) {
      case 'low':
        return chalk.green('Low')
      case 'medium':
        return chalk.yellow('Medium')
      case 'high':
        return chalk.red('High')
      case 'critical':
        return chalk.red.bold('CRITICAL')
      default:
        return chalk.gray('Unknown')
    }
  }

  /**
   * Format bytes into human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  static formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Summarize push operations
   * @param {Array} operations - Push operations
   * @returns {Object} Summary
   */
  static summarizePushOperations(operations) {
    const summary = {
      total: operations.length,
      successful: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of operations) {
      if (op.status === 'completed') {
        summary.successful++
      } else if (op.status === 'failed') {
        summary.failed++
      } else {
        summary.skipped++
      }
    }

    return summary
  }
}

module.exports = PushCommand
