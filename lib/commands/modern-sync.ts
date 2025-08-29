/**
 * Modern Sync Command Implementation
 * Refactored sync functionality using modern Ink-UI components
 */

import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import os from 'os'
import { render } from 'ink'
import { ModernInteractiveSyncWrapper } from '../components/enhanced/ModernInteractiveSync'
import { SimpleChangeDetector } from '../detection/SimpleChangeDetector'
import { inkUIThemeUtils } from '../design/inkui-themes'

interface ModernSyncOptions {
  source: string
  interactive: boolean
  dryRun: boolean
  include: string[]
  exclude: string[]
  autoNew: boolean
  autoModified: boolean
  theme?: 'default' | 'dark' | 'minimal' | 'cyberpunk' | 'highContrast'
  variant?: 'compact' | 'accessible' | 'minimal'
  showSystemHealth: boolean
  enableAdvancedFeatures: boolean
  maxConcurrency: number
}

interface SyncFile {
  path: string
  changeType: 'new' | 'modified' | 'deleted' | 'moved'
  size?: number
  reason?: string
  selected?: boolean
  timestamp?: Date
}

/**
 * Auto-detect Lerian Protocol installation with enhanced error handling
 */
async function findLerianProtocolPath(): Promise<string | null> {
  const possiblePaths = [
    // Look in common development locations
    path.join(os.homedir(), 'Documents', 'Lerian', 'ai-prompts'),
    path.join(os.homedir(), 'lerian-protocol'),
    path.join(os.homedir(), 'ai-prompts'),
    path.join(os.homedir(), 'Development', 'lerian-protocol'),
    path.join(os.homedir(), 'Projects', 'lerian-protocol'),
    
    // Look in parent directories
    path.resolve('..', 'lerian-protocol'),
    path.resolve('..', 'ai-prompts'),
    path.resolve('../..', 'lerian-protocol'),
    path.resolve('../..', 'ai-prompts'),
    
    // Check current directory
    process.cwd(),
  ]

  for (const possiblePath of possiblePaths) {
    try {
      const packagePath = path.join(possiblePath, 'package.json')
      if (await fs.pathExists(packagePath)) {
        const packageData = await fs.readJson(packagePath)
        if (packageData.name === 'lerian-protocol') {
          return possiblePath
        }
      }
    } catch (error) {
      // Continue searching - errors are expected for non-existent paths
      continue
    }
  }

  return null
}

/**
 * Check if we're running from within lerian-protocol itself
 */
function isRunningFromLerianProtocol(): boolean {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageData = require(packagePath)
      return packageData.name === 'lerian-protocol'
    }
  } catch (error) {
    // Not running from lerian-protocol
  }
  return false
}

/**
 * Validate paths with comprehensive error reporting
 */
async function validatePaths(sourcePath: string, destPath: string): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check source path
  if (!await fs.pathExists(sourcePath)) {
    errors.push(`Source path does not exist: ${sourcePath}`)
  } else {
    const sourceStats = await fs.stat(sourcePath)
    if (!sourceStats.isDirectory()) {
      errors.push(`Source path is not a directory: ${sourcePath}`)
    }
  }

  // Check destination path
  if (!await fs.pathExists(destPath)) {
    errors.push(`Destination path does not exist: ${destPath}`)
  } else {
    const destStats = await fs.stat(destPath)
    if (!destStats.isDirectory()) {
      errors.push(`Destination path is not a directory: ${destPath}`)
    }
  }

  // Check if destination is actually lerian-protocol
  try {
    const destPackagePath = path.join(destPath, 'package.json')
    if (await fs.pathExists(destPackagePath)) {
      const destPackage = await fs.readJson(destPackagePath)
      if (destPackage.name !== 'lerian-protocol') {
        warnings.push(`Destination does not appear to be lerian-protocol (found: ${destPackage.name})`)
      }
    } else {
      warnings.push('Destination does not contain a package.json file')
    }
  } catch (error) {
    warnings.push('Could not verify destination package information')
  }

  // Check permissions
  try {
    await fs.access(sourcePath, fs.constants.R_OK)
  } catch (error) {
    errors.push(`No read permission for source path: ${sourcePath}`)
  }

  try {
    await fs.access(destPath, fs.constants.W_OK)
  } catch (error) {
    errors.push(`No write permission for destination path: ${destPath}`)
  }

  // Check disk space (basic check)
  try {
    const stats = await fs.stat(destPath)
    // In a real implementation, you'd check actual disk space
    // For now, just validate the directory exists and is writable
  } catch (error) {
    warnings.push('Could not check disk space availability')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Convert SimpleChangeDetector results to modern SyncFile format
 */
function convertDetectedChanges(changes: any[]): SyncFile[] {
  return changes.map(change => ({
    path: change.path,
    changeType: change.changeType,
    size: change.size,
    reason: change.reason,
    selected: false,
    timestamp: change.timestamp || new Date(),
  }))
}

/**
 * Main modern sync command handler
 */
export async function runModernSync(destination: string | undefined, options: ModernSyncOptions): Promise<void> {
  // Display modern header
  console.log(chalk.cyan.bold('⚡ Lerian Protocol Sync - Modern Interface'))
  console.log()

  try {
    // Resolve paths
    const sourcePath = path.resolve(options.source)
    let destPath = destination

    // Auto-detect destination if not provided
    if (!destPath) {
      console.log(chalk.gray('🔍 Auto-detecting Lerian Protocol location...'))
      
      if (isRunningFromLerianProtocol()) {
        throw new Error('Cannot sync from within lerian-protocol directory. Run this command from your project directory.')
      }

      destPath = await findLerianProtocolPath()
      
      if (!destPath) {
        throw new Error(`Could not auto-detect Lerian Protocol location. Please specify the destination path:
        
  ${chalk.yellow('lerian-protocol sync /path/to/lerian-protocol')}
        
Or install lerian-protocol in a standard location:
  • ~/Documents/Lerian/ai-prompts
  • ~/lerian-protocol`)
      }
      
      console.log(chalk.green(`✅ Found Lerian Protocol at: ${destPath}`))
    } else {
      destPath = path.resolve(destPath)
    }

    // Validate paths with comprehensive error handling
    const validation = await validatePaths(sourcePath, destPath)
    
    if (!validation.valid) {
      throw new Error(`Path validation failed:\n${validation.errors.map(e => `  • ${e}`).join('\n')}`)
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Warnings:'))
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`))
      })
      console.log()
    }

    console.log(chalk.gray(`Source: ${sourcePath}`))
    console.log(chalk.gray(`Destination: ${destPath}`))
    console.log()

    // Show configuration
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Dry run mode - no files will be modified'))
    }

    const modeDescription = options.interactive ? 'Interactive mode - you\'ll select which files to sync' : 'Auto mode - files will be selected automatically'
    console.log(chalk.blue(`🎯 ${modeDescription}`))

    if (options.theme) {
      console.log(chalk.gray(`Theme: ${options.theme}${options.variant ? ` (${options.variant})` : ''}`))
    }

    console.log(chalk.gray(`Include: ${options.include.join(', ')}`))
    console.log(chalk.gray(`Exclude: ${options.exclude.join(', ')}`))
    console.log()

    // Detect changes
    console.log(chalk.blue('🔍 Detecting file changes...'))
    
    const changeDetector = new SimpleChangeDetector(sourcePath, destPath, {
      includeDirectories: options.include,
      excludePatterns: options.exclude,
      maxConcurrency: options.maxConcurrency,
      enableProgressReporting: true
    })

    const detectionResult = await changeDetector.detectChanges()
    const detectedFiles = convertDetectedChanges(detectionResult.changes)

    if (detectedFiles.length === 0) {
      console.log(chalk.green('✅ No changes detected - everything is in sync!'))
      return
    }

    // Display detection summary
    console.log(chalk.green(`✅ Found ${detectedFiles.length} changes:`))
    
    const changeTypes = {
      new: detectedFiles.filter(c => c.changeType === 'new').length,
      modified: detectedFiles.filter(c => c.changeType === 'modified').length,
      deleted: detectedFiles.filter(c => c.changeType === 'deleted').length,
      moved: detectedFiles.filter(c => c.changeType === 'moved').length
    }

    Object.entries(changeTypes).forEach(([type, count]) => {
      if (count > 0) {
        const icon = getChangeIcon(type)
        console.log(chalk.gray(`   ${icon} ${count} ${type} files`))
      }
    })
    console.log()

    // Initialize modern interactive sync
    console.log(chalk.blue('🚀 Launching modern sync interface...'))
    console.log()

    const syncWrapper = new ModernInteractiveSyncWrapper(sourcePath, destPath, {
      includeDirectories: options.include,
      excludePatterns: options.exclude,
      enableInteractiveMode: options.interactive,
      autoSelectNew: options.autoNew,
      autoSelectModified: options.autoModified,
      enablePreview: true,
      confirmBeforeSync: !options.dryRun, // Skip confirmation for dry runs
      dryRun: options.dryRun,
      maxConcurrency: options.maxConcurrency,
      showSystemHealth: options.showSystemHealth,
      enableAdvancedFeatures: options.enableAdvancedFeatures,
    })

    // Set detected files
    syncWrapper.setDetectedFiles(detectedFiles)

    // Set up event handlers for comprehensive error handling
    syncWrapper.on('error', (error: Error) => {
      console.error(chalk.red(`❌ Sync error: ${error.message}`))
      if (process.env.DEBUG) {
        console.error(error.stack)
      }
      process.exit(1)
    })

    syncWrapper.on('complete', (result: any) => {
      console.log()
      if (result.cancelled) {
        console.log(chalk.yellow('ℹ️  Sync cancelled by user'))
      } else {
        console.log(chalk.green('🎉 Sync completed successfully!'))
        
        if (result.filesProcessed > 0) {
          if (options.dryRun) {
            console.log(chalk.cyan(`   🔍 Dry run: ${result.filesProcessed} files would be synced`))
          } else {
            console.log(chalk.green(`   ✅ Synced: ${result.filesProcessed} files`))
          }
        }
        
        console.log()
        console.log(chalk.gray('💡 Tip: Use --dry-run to preview changes without syncing'))
      }
    })

    syncWrapper.on('cancel', () => {
      console.log(chalk.yellow('ℹ️  Sync cancelled by user'))
    })

    // Run the modern sync interface
    await syncWrapper.run()

  } catch (error) {
    // Comprehensive error handling
    console.error()
    console.error(chalk.red.bold('❌ Sync Failed'))
    console.error()
    
    if (error instanceof Error) {
      // Known error types
      if (error.message.includes('Path validation failed')) {
        console.error(chalk.red('Path Validation Error:'))
        console.error(error.message)
      } else if (error.message.includes('Cannot sync from within')) {
        console.error(chalk.red('Usage Error:'))
        console.error(chalk.red(error.message))
        console.error()
        console.error(chalk.gray('Solution: Navigate to your project directory and run the sync command from there.'))
      } else if (error.message.includes('Could not auto-detect')) {
        console.error(chalk.red('Auto-detection Failed:'))
        console.error(chalk.red(error.message))
      } else if (error.message.includes('permission')) {
        console.error(chalk.red('Permission Error:'))
        console.error(chalk.red(error.message))
        console.error()
        console.error(chalk.gray('Solution: Check file and directory permissions, or run with appropriate privileges.'))
      } else {
        console.error(chalk.red('Error:'), error.message)
      }
      
      if (process.env.DEBUG) {
        console.error()
        console.error(chalk.gray('Stack trace:'))
        console.error(error.stack)
      }
    } else {
      console.error(chalk.red('An unknown error occurred'))
      console.error(error)
    }
    
    console.error()
    console.error(chalk.gray('For more help, run: lerian-protocol sync --help'))
    console.error(chalk.gray('To enable debug mode: DEBUG=1 lerian-protocol sync ...'))
    
    process.exit(1)
  }
}

/**
 * Get icon for change type
 */
function getChangeIcon(changeType: string): string {
  const icons = {
    new: '✨',
    modified: '📝',
    deleted: '🗑️',
    moved: '📁'
  }
  return icons[changeType as keyof typeof icons] || '❓'
}

export default runModernSync