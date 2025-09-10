#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import * as fs from 'fs-extra'
import inquirer from 'inquirer'

interface PushCommandOptions {
  dryRun?: boolean
  interactive?: boolean
  files?: string
  include?: string
  exclude?: string
  force?: boolean
  confirm?: boolean
  allowCritical?: boolean
  conflictStrategy?: string
  debug?: boolean
  git?: boolean
}

interface FileSelection {
  selectedFiles: Record<string, any>
  useGitDetection: boolean
}

interface PushPlan {
  targetPath: string
  sourcePath: string
  operations: PushOperation[]
  summary: {
    total: number
    create: number
    update: number
    delete: number
    conflict: number
  }
  warnings: string[]
  requiresConfirmation: boolean
  estimatedImpact?: {
    riskLevel: string
    totalBytes: number
  }
  duration: number
  snapshots: {
    target: {
      fileCount: number
      hashes: Record<string, string>
    }
  }
  pushableFileCount: number
}

interface PushOperation {
  path: string
  action: string
  status: string
  safety?: string
  error?: string
}

interface PushResult {
  success: boolean
  operations: PushOperation[]
  warnings?: string[]
  backupPath?: string
  rollbackAvailable?: boolean
}

interface PushExecutorOptions {
  dryRun: boolean
  confirmed: boolean
  confirmDelete: boolean
  allowCritical: boolean
  conflictStrategy: string
  onProgress?: (message: string) => void
}

interface FileSelector {
  selectFilesForPush(
    files: Record<string, any>,
    options: PushCommandOptions
  ): Promise<FileSelection>
  createSelectionFromArgs(
    files: Record<string, any>,
    options: PushCommandOptions
  ): FileSelection
}

interface PushPlanner {
  createPushPlan(
    targetPath: string,
    sourcePath: string,
    lastPushHashes: Record<string, string>,
    options: {
      fileSelection: FileSelection
      onProgress?: (message: string) => void
    }
  ): Promise<PushPlan>
  filterPushableFiles(
    files: Record<string, any>,
    options: { profile: string },
    targetPath: string,
    hasExistingMetadata: boolean
  ): Promise<Record<string, any>>
}

interface PushExecutor {
  executePushPlan(
    plan: PushPlan,
    options: PushExecutorOptions
  ): Promise<PushResult>
}

export class PushCommand {
  static register(program: Command): void {
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

  static async execute(options: PushCommandOptions): Promise<void> {
    const startTime = Date.now()

    try {
      const MetadataManager = require('../../tools/sync/metadata-manager')
      const metadataManager = new MetadataManager()

      let CommandHeader: any, TerminalDetector: any

      try {
        CommandHeader = require('../../lib/components/CommandHeader')
        TerminalDetector = require('../../lib/utils/terminal')
      } catch {
        console.log(chalk.blue('📤 Lerian Protocol Push'))
        console.log(chalk.gray('Pushing changes from target to source'))
        console.log('')
      }

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

      const installMeta = await metadataManager.readMetadata(targetPath)
      if (!installMeta) {
        throw new Error(
          'Lerian Protocol installation metadata not found. Please ensure Lerian Protocol is installed in this project.'
        )
      }

      await metadataManager.validateSourcePath(installMeta)
      const sourcePath = installMeta.sourcePath
      const profile = installMeta.profile ?? 'full'

      if (options.debug) {
        console.log(chalk.yellow('🐛 Debug mode enabled'))
        console.log('Command options:', JSON.stringify(options, null, 2))
        console.log('Source path:', sourcePath)
        console.log('Target path:', targetPath)
        console.log('Profile:', profile)
        console.log('')
      }

      const PushPlanner = require('../../tools/sync/push-planner')
      const PushExecutor = require('../../tools/sync/push-executor')
      const FileSelector = require('../../tools/sync/file-selector')

      const pushPlanner: PushPlanner = new PushPlanner()
      const pushExecutor: PushExecutor = new PushExecutor()
      const fileSelector: FileSelector = new FileSelector()

      const lastPushHashes = await this.getLastPushHashes(
        metadataManager,
        targetPath
      )

      console.log(chalk.blue('🔍 Analyzing files eligible for push...'))

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

      let fileSelection: FileSelection
      if (options.interactive || (!options.files && !options.include)) {
        fileSelection = await fileSelector.selectFilesForPush(
          allPushableFiles,
          options
        )
      } else {
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

      const pushPlan = await pushPlanner.createPushPlan(
        targetPath,
        sourcePath,
        lastPushHashes,
        {
          fileSelection: {
            ...fileSelection,
            useGitDetection: options.git ?? false
          },
          onProgress: (message: string) => {
            if (options.debug) {
              console.log(chalk.gray(`  ${message}`))
            }
          }
        }
      )

      this.displayPushPlan(pushPlan, options)

      if (options.dryRun) {
        console.log(
          chalk.yellow('\n📋 Dry-run complete. No changes were made.')
        )
        this.displayExecutionStats(pushPlan, Date.now() - startTime)
        return
      }

      if (pushPlan.operations.length === 0) {
        console.log(chalk.green('✨ No changes to push!'))
        return
      }

      if (pushPlan.requiresConfirmation && !options.force) {
        const proceed = await this.confirmPushExecution(pushPlan, options)
        if (!proceed) {
          console.log(chalk.yellow('📭 Push cancelled by user'))
          return
        }
      }

      console.log(chalk.blue('\n🚀 Executing push operations...'))

      let pushResult: PushResult
      try {
        pushResult = await pushExecutor.executePushPlan(pushPlan, {
          dryRun: false,
          confirmed: options.confirm ?? options.force ?? false,
          confirmDelete: options.confirm ?? options.force ?? false,
          allowCritical: options.allowCritical ?? false,
          conflictStrategy: options.conflictStrategy ?? 'skip',
          onProgress: (message: string) => {
            console.log(chalk.gray(`  ${message}`))
          }
        })
      } catch (error) {
        console.error(
          chalk.red('❌ Push execution error:'),
          (error as Error).message
        )
        if (options.debug) {
          console.error(chalk.red('Stack trace:'), (error as Error).stack)
        }
        throw error
      }

      if (pushResult.success) {
        await this.savePushMetadata(
          metadataManager,
          targetPath,
          pushPlan.snapshots.target,
          pushResult.operations
        )

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
              `Warning: Could not update push baseline: ${(error as Error).message}`
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

      this.displayPushResults(pushResult)
      this.displayExecutionStats(pushPlan, Date.now() - startTime)
    } catch (error) {
      console.error(
        chalk.red('❌ Push command failed:'),
        (error as Error).message
      )
      if (options.debug) {
        console.error(chalk.red('Stack trace:'), (error as Error).stack)
      }
      process.exit(1)
    }
  }

  static async validateEnvironment(): Promise<{
    cwd: string
    hasPackageJson: boolean
    hasClaudeDir: boolean
  }> {
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

  static async discoverPushableFiles(
    targetPath: string,
    profile: string,
    hasExistingMetadata = false,
    _options: PushCommandOptions = {}
  ): Promise<Record<string, any>> {
    const FileHasher = require('../../lib/sync/file-hasher')
    const fileHasher = new FileHasher({
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

    const allFiles = await fileHasher.hashDirectory(targetPath)

    const PushPlanner = require('../../tools/sync/push-planner')
    const pushPlanner: PushPlanner = new PushPlanner()

    return await pushPlanner.filterPushableFiles(
      allFiles,
      { profile },
      targetPath,
      hasExistingMetadata
    )
  }

  static async getLastPushHashes(
    metadataManager: any,
    targetPath: string
  ): Promise<Record<string, string>> {
    try {
      const pushMeta = await metadataManager.readSyncMetadata(
        targetPath,
        '.lerian-push-meta.json'
      )
      return pushMeta?.snapshots?.target?.hashes ?? {}
    } catch {
      return {}
    }
  }

  static async savePushMetadata(
    _metadataManager: any,
    targetPath: string,
    targetSnapshot: any,
    operations: PushOperation[]
  ): Promise<void> {
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

    await fs.ensureDir(path.dirname(pushMetaPath))
    await fs.writeJSON(pushMetaPath, metadata, { spaces: 2 })
  }

  static displayPushPlan(
    pushPlan: PushPlan,
    _options: PushCommandOptions
  ): void {
    console.log(chalk.blue('\n📤 Push Plan Summary:'))
    console.log(`  Target: ${pushPlan.targetPath}`)
    console.log(`  Source: ${pushPlan.sourcePath}`)
    console.log(`  Direction: Target → Source`)
    console.log(
      `  Risk Level: ${this.formatRiskLevel(pushPlan.estimatedImpact?.riskLevel ?? 'unknown')}`
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

  static async confirmPushExecution(
    pushPlan: PushPlan,
    _options: PushCommandOptions
  ): Promise<boolean> {
    console.log(
      chalk.yellow('\n⚠️  This push operation requires confirmation:')
    )

    const riskLevel = pushPlan.estimatedImpact?.riskLevel ?? 'unknown'
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

  static displayPushResults(pushResult: PushResult): void {
    if (!pushResult.operations || pushResult.operations.length === 0) {
      return
    }

    const stats = {
      completed: 0,
      failed: 0,
      skipped: 0
    }

    for (const op of pushResult.operations) {
      stats[op.status as keyof typeof stats] =
        (stats[op.status as keyof typeof stats] || 0) + 1
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

  static displayExecutionStats(pushPlan: PushPlan, totalTime: number): void {
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

  static formatRiskLevel(riskLevel: string): string {
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

  static formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) {
      return '0 B'
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  static summarizePushOperations(operations: PushOperation[]): {
    total: number
    successful: number
    failed: number
    skipped: number
  } {
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

export const register = PushCommand.register.bind(PushCommand)
