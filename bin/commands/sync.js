#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const path = require('path')
const ConfigManager = require('../../protocol-assets/lib/config')
const MetadataManager = require('../../protocol-assets/lib/sync/metadata-manager')
const SyncPlanner = require('../../protocol-assets/lib/sync/sync-planner')
const SyncExecutor = require('../../protocol-assets/lib/sync/sync-executor')

class SyncCommand {
  /**
   * Register the sync command with the main CLI program
   * @param {Command} program - Commander.js program instance
   */
  static register(program) {
    const syncCmd = new Command('sync')
      .description(
        'Synchronize .claude and protocol-assets directories between source and destination'
      )
      .option('-d, --dry-run', 'Preview changes without executing')
      .option('-i, --interactive', 'Interactive file selection mode')
      .option('--debug', 'Enable debug output and verbose logging')
      .addHelpText(
        'after',
        `
Examples:
  lerian sync                    # Standard sync operation
  lerian sync --dry-run          # Preview mode only
  lerian sync --interactive      # Choose files to sync
  lerian sync --debug            # Verbose output for troubleshooting

Note: This command must be run from within a project directory that has
Lerian Protocol installed. The command will automatically detect source
and destination paths based on the installation metadata.`
      )
      .action(this.execute.bind(this))

    program.addCommand(syncCmd)
  }

  /**
   * Execute the sync command with the provided options
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
        console.log(chalk.blue('🔄 Lerian Protocol Sync'))
        console.log(chalk.gray('Synchronizing .claude and protocol-assets'))
        console.log('')
      }

      // Validate environment and get paths
      const validation = await this.validateEnvironment()
      const projectPath = validation.cwd

      let terminalCaps = { width: 80, supportsColor: true }
      if (TerminalDetector) {
        terminalCaps = TerminalDetector.getCapabilities()
      }

      if (CommandHeader) {
        const header = new CommandHeader({
          title: 'Lerian Protocol Sync',
          subtitle: options.dryRun
            ? 'Preview Mode - No changes will be made'
            : 'Synchronizing .claude and protocol-assets',
          variant: 'standard',
          width: terminalCaps.width
        })
        console.log(header.render())
      }

      // Get source path from installation metadata
      const installMeta = await metadataManager.readMetadata(projectPath)
      if (!installMeta) {
        throw new Error(
          'Lerian Protocol installation metadata not found. Please reinstall or run from a project with Lerian Protocol installed.'
        )
      }

      // Validate source path
      await metadataManager.validateSourcePath(installMeta)
      const sourcePath = installMeta.sourcePath
      const profile = installMeta.profile || 'full'

      if (options.debug || config.cli.debugMode) {
        console.log(chalk.yellow('🐛 Debug mode enabled'))
        console.log('Command options:', JSON.stringify(options, null, 2))
        console.log('Source path:', sourcePath)
        console.log('Profile:', profile)
        console.log('Project path:', projectPath)
        console.log('')
      }

      // Initialize sync components
      const syncPlanner = new SyncPlanner()
      const syncExecutor = new SyncExecutor()

      // Get last sync hashes
      const lastSyncHashes =
        await metadataManager.getLastSyncHashes(projectPath)

      console.log(chalk.blue('📊 Analyzing files for sync...'))

      // Create sync plan
      const syncPlan = await syncPlanner.createSyncPlan(
        sourcePath,
        projectPath,
        lastSyncHashes,
        {
          profile,
          onProgress: (message) => {
            if (options.debug) {
              console.log(chalk.gray(`  ${message}`))
            }
          }
        }
      )

      // Display sync plan summary
      this.displaySyncPlan(syncPlan, options)

      if (options.dryRun) {
        console.log(
          chalk.yellow('\n📋 Dry-run complete. No changes were made.')
        )
        this.displayExecutionStats(syncPlan, Date.now() - startTime)
        return
      }

      // Execute sync if not dry run
      if (syncPlan.operations.length === 0) {
        console.log(chalk.green('✨ Everything is already up to date!'))
        return
      }

      console.log(chalk.blue('\n🚀 Executing sync operations...'))

      const syncResult = await syncExecutor.executeSyncPlan(syncPlan, {
        dryRun: false,
        includeConflicts: false, // Skip conflicts by default
        conflictStrategy: 'skip',
        onProgress: (message) => {
          console.log(chalk.gray(`  ${message}`))
        }
      })

      // Update metadata with new hashes
      if (syncResult.success) {
        await metadataManager.updateSyncHashes(
          projectPath,
          syncPlan.snapshots.source,
          syncResult.operations
        )

        console.log(chalk.green('\n✅ Sync completed successfully!'))

        if (syncResult.backupPath) {
          console.log(
            chalk.blue(
              `💾 Backup created: ${path.basename(syncResult.backupPath)}`
            )
          )
        }
      } else {
        console.log(chalk.red('\n❌ Sync completed with errors'))

        if (syncResult.rollbackAvailable && syncResult.backupPath) {
          console.log(
            chalk.yellow(
              `🔄 Rollback available using: lerian sync --rollback ${path.basename(syncResult.backupPath)}`
            )
          )
        }
      }

      // Display final statistics
      this.displaySyncResults(syncResult)
      this.displayExecutionStats(syncPlan, Date.now() - startTime)
    } catch (error) {
      console.error(chalk.red('❌ Sync command failed:'), error.message)
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
    const hasProtocolAssets = await fs.pathExists(
      path.join(cwd, 'protocol-assets')
    )

    if (!hasPackageJson && !hasClaudeDir) {
      throw new Error(
        'This command must be run from a project directory with either package.json or .claude directory'
      )
    }

    if (hasPackageJson) {
      try {
        const packageJson = await fs.readJson(path.join(cwd, 'package.json'))

        const hasLerianProtocol =
          (packageJson.dependencies &&
            packageJson.dependencies['lerian-protocol']) ||
          (packageJson.devDependencies &&
            packageJson.devDependencies['lerian-protocol'])

        if (!hasLerianProtocol && !hasClaudeDir) {
          console.warn(
            chalk.yellow(
              '⚠️ Warning: Lerian Protocol not found in package.json dependencies'
            )
          )
        }
      } catch {
        console.warn(chalk.yellow('⚠️ Warning: Could not read package.json'))
      }
    }

    const paths = {
      '.claude': path.join(cwd, '.claude'),
      'protocol-assets': path.join(cwd, 'protocol-assets')
    }

    for (const [name, dirPath] of Object.entries(paths)) {
      try {
        await fs.ensureDir(dirPath)
      } catch (error) {
        throw new Error(
          `Cannot access or create ${name} directory: ${error.message}`
        )
      }
    }

    return {
      cwd,
      hasPackageJson,
      hasClaudeDir,
      hasProtocolAssets,
      paths
    }
  }

  /**
   * Get command exit codes for different scenarios
   */
  static getExitCodes() {
    return {
      SUCCESS: 0,
      GENERAL_ERROR: 1,
      INVALID_ENVIRONMENT: 2,
      USER_CANCELLATION: 3,
      VALIDATION_ERROR: 4,
      DEPENDENCY_ERROR: 5
    }
  }

  /**
   * Display sync plan summary to user
   * @param {Object} syncPlan - Sync plan object
   * @param {Object} options - Command options
   */
  static displaySyncPlan(syncPlan, options) {
    console.log(chalk.blue('\n📋 Sync Plan Summary:'))
    console.log(`  Source: ${syncPlan.sourcePath}`)
    console.log(`  Destination: ${syncPlan.destPath}`)
    console.log(`  Profile: ${syncPlan.profile}`)

    const summary = syncPlan.summary
    if (summary.total === 0) {
      console.log(
        chalk.green('  🎉 No changes needed - everything is up to date!')
      )
      return
    }

    console.log(chalk.white('\n  Operations:'))
    if (summary.copy > 0) {
      console.log(chalk.green(`    📄 ${summary.copy} file(s) to copy`))
    }
    if (summary.update > 0) {
      console.log(chalk.blue(`    📝 ${summary.update} file(s) to update`))
    }
    if (summary.delete > 0) {
      console.log(chalk.red(`    🗑️ ${summary.delete} file(s) to delete`))
    }
    if (summary.conflict > 0) {
      console.log(
        chalk.yellow(`    ⚠️ ${summary.conflict} conflict(s) detected`)
      )
    }

    if (syncPlan.estimatedSize && syncPlan.estimatedSize.files > 0) {
      console.log(
        `  Estimated transfer: ${syncPlan.estimatedSize.humanReadable}`
      )
    }

    // Show conflicts if any
    if (syncPlan.conflicts.length > 0) {
      console.log(chalk.yellow('\n  ⚠️ Conflicts detected:'))
      for (const conflict of syncPlan.conflicts.slice(0, 5)) {
        console.log(
          chalk.yellow(`    - ${conflict.path}: ${conflict.conflictType}`)
        )
      }
      if (syncPlan.conflicts.length > 5) {
        console.log(
          chalk.gray(`    ... and ${syncPlan.conflicts.length - 5} more`)
        )
      }
      console.log(chalk.gray('    (Conflicts will be skipped by default)'))
    }
  }

  /**
   * Display sync execution results
   * @param {Object} syncResult - Result from SyncExecutor
   */
  static displaySyncResults(syncResult) {
    if (!syncResult.operations || syncResult.operations.length === 0) {
      return
    }

    const stats = {
      completed: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of syncResult.operations) {
      stats[op.status] = (stats[op.status] || 0) + 1
    }

    console.log(chalk.white('\n📊 Operation Results:'))
    if (stats.completed > 0) {
      console.log(chalk.green(`  ✅ ${stats.completed} completed`))
    }
    if (stats.skipped > 0) {
      console.log(chalk.yellow(`  ⏭️ ${stats.skipped} skipped`))
    }
    if (stats.failed > 0) {
      console.log(chalk.red(`  ❌ ${stats.failed} failed`))
    }

    // Show failed operations
    const failedOps = syncResult.operations.filter(
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
  }

  /**
   * Display execution statistics
   * @param {Object} syncPlan - Sync plan object
   * @param {number} totalTime - Total execution time in ms
   */
  static displayExecutionStats(syncPlan, totalTime) {
    console.log(chalk.gray('\n⏱️ Statistics:'))
    console.log(chalk.gray(`  Total time: ${Math.round(totalTime)}ms`))
    console.log(
      chalk.gray(
        `  Files scanned: ${syncPlan.snapshots.source.fileCount + syncPlan.snapshots.destination.fileCount}`
      )
    )
    console.log(chalk.gray(`  Plan generation: ${syncPlan.duration}ms`))

    if (syncPlan.estimatedSize) {
      console.log(
        chalk.gray(`  Data size: ${syncPlan.estimatedSize.humanReadable}`)
      )
    }
  }
}

module.exports = SyncCommand
