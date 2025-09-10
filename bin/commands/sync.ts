#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import * as fs from 'fs-extra'

// interface Config {
//   cli: {
//     debugMode: boolean
//   }
// }

// interface ConfigManager {
//   getEnvironmentConfig(): Promise<Config>
// }

interface InstallMeta {
  sourcePath: string
  profile?: string
}

interface MetadataManager {
  readMetadata(projectPath: string): Promise<InstallMeta | null>
  validateSourcePath(installMeta: InstallMeta): Promise<void>
  getLastSyncHashes(projectPath: string): Promise<Record<string, string>>
  updateSyncHashes(
    projectPath: string,
    sourceSnapshot: any,
    operations: any[]
  ): Promise<void>
}

interface SyncPlanOptions {
  profile: string
  onProgress?: (message: string) => void
}

interface SyncOperation {
  type: string
  path: string
  status: string
  error?: string
}

interface SyncPlan {
  sourcePath: string
  destPath: string
  profile: string
  operations: SyncOperation[]
  summary: {
    total: number
    copy: number
    update: number
    delete: number
    conflict: number
  }
  conflicts: Array<{
    path: string
    conflictType: string
  }>
  estimatedSize?: {
    files: number
    humanReadable: string
  }
  duration: number
  snapshots: {
    source: {
      fileCount: number
    }
    destination: {
      fileCount: number
    }
  }
}

interface SyncResult {
  success: boolean
  operations: SyncOperation[]
  backupPath?: string
  rollbackAvailable?: boolean
}

interface SyncExecutorOptions {
  dryRun: boolean
  includeConflicts: boolean
  conflictStrategy: string
  onProgress?: (message: string) => void
}

interface SyncPlanner {
  createSyncPlan(
    sourcePath: string,
    destPath: string,
    lastSyncHashes: Record<string, string>,
    options: SyncPlanOptions
  ): Promise<SyncPlan>
}

interface SyncExecutor {
  executeSyncPlan(
    plan: SyncPlan,
    options: SyncExecutorOptions
  ): Promise<SyncResult>
}

interface CommandHeader {
  render(): string
}

interface CommandHeaderOptions {
  title: string
  subtitle: string
  variant: string
  width: number
}

interface TerminalCapabilities {
  width: number
  supportsColor: boolean
}

interface TerminalDetector {
  getCapabilities(): TerminalCapabilities
}

interface EnvironmentValidation {
  cwd: string
  hasPackageJson: boolean
  hasClaudeDir: boolean
  hasProtocolAssets: boolean
  paths: Record<string, string>
}

interface SyncCommandOptions {
  dryRun?: boolean
  interactive?: boolean
  debug?: boolean
}

export class SyncCommand {
  static register(program: Command): void {
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

  static async execute(options: SyncCommandOptions): Promise<void> {
    const startTime = Date.now()

    try {
      const MetadataManager = require(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'tools',
          'sync',
          'metadata-manager'
        )
      ) as new () => MetadataManager
      const metadataManager = new MetadataManager()

      let CommandHeader:
        | (new (options: CommandHeaderOptions) => CommandHeader)
        | undefined
      let TerminalDetector: TerminalDetector | undefined

      try {
        CommandHeader = require(
          path.join(
            __dirname,
            '..',
            '..',
            '..',
            'services',
            'lib',
            'components',
            'CommandHeader'
          )
        )
        TerminalDetector = require(
          path.join(
            __dirname,
            '..',
            '..',
            '..',
            'services',
            'lib',
            'utils',
            'terminal'
          )
        )
      } catch {
        console.log(chalk.blue('🔄 Lerian Protocol Sync'))
        console.log(chalk.gray('Synchronizing .claude and protocol-assets'))
        console.log('')
        CommandHeader = undefined
        TerminalDetector = undefined
      }

      const validation = await this.validateEnvironment()
      const projectPath = validation.cwd

      let terminalCaps: TerminalCapabilities = {
        width: 80,
        supportsColor: true
      }
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
      const profile = installMeta.profile ?? 'full'

      if (options.debug) {
        console.log(chalk.yellow('🐛 Debug mode enabled'))
        console.log('Command options:', JSON.stringify(options, null, 2))
        console.log('Source path:', sourcePath)
        console.log('Profile:', profile)
        console.log('Project path:', projectPath)
        console.log('')
      }

      // Initialize sync components
      const SyncPlanner = require(
        path.join(__dirname, '..', '..', '..', 'tools', 'sync', 'sync-planner')
      ) as new () => SyncPlanner
      const SyncExecutor = require(
        path.join(__dirname, '..', '..', '..', 'tools', 'sync', 'sync-executor')
      ) as new () => SyncExecutor

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
          onProgress: (message: string) => {
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
        onProgress: (message: string) => {
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
      console.error(
        chalk.red('❌ Sync command failed:'),
        (error as Error).message
      )
      if (options.debug) {
        console.error(chalk.red('Stack trace:'), (error as Error).stack)
      }
      process.exit(1)
    }
  }

  static async validateEnvironment(): Promise<EnvironmentValidation> {
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
          packageJson.dependencies?.['lerian-protocol'] ??
          packageJson.devDependencies?.['lerian-protocol']

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
          `Cannot access or create ${name} directory: ${(error as Error).message}`
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

  static getExitCodes() {
    return {
      SUCCESS: 0,
      GENERAL_ERROR: 1,
      INVALID_ENVIRONMENT: 2,
      USER_CANCELLATION: 3,
      VALIDATION_ERROR: 4,
      DEPENDENCY_ERROR: 5
    } as const
  }

  static displaySyncPlan(
    syncPlan: SyncPlan,
    _options: SyncCommandOptions
  ): void {
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

    if (syncPlan.estimatedSize?.files && syncPlan.estimatedSize.files > 0) {
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

  static displaySyncResults(syncResult: SyncResult): void {
    if (!syncResult.operations || syncResult.operations.length === 0) {
      return
    }

    const stats = {
      completed: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of syncResult.operations) {
      stats[op.status as keyof typeof stats] =
        (stats[op.status as keyof typeof stats] || 0) + 1
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

  static displayExecutionStats(syncPlan: SyncPlan, totalTime: number): void {
    console.log(chalk.gray('\n⏱️ Statistics:'))
    console.log(chalk.gray(`  Total time: ${Math.round(totalTime)}ms`))
    console.log(
      chalk.gray(
        `  Files scanned: ${syncPlan.snapshots.source.fileCount + syncPlan.snapshots.destination.fileCount}`
      )
    )
    console.log(chalk.gray(`  Plan generation: ${syncPlan.duration}ms`))

    if (syncPlan.estimatedSize?.humanReadable) {
      console.log(
        chalk.gray(`  Data size: ${syncPlan.estimatedSize.humanReadable}`)
      )
    }
  }
}

export const register = SyncCommand.register.bind(SyncCommand)
