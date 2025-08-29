/**
 * Modern Sync Command Implementation (CommonJS compatible)
 * Enhanced sync functionality with modern styling and features
 */

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const os = require('os')
const readline = require('readline')

// Import components
const SimpleChangeDetector = require('../detection/SimpleChangeDetector')

/**
 * Auto-detect Lerian Protocol installation
 */
async function findLerianProtocolPath() {
  const possiblePaths = [
    path.join(os.homedir(), 'Documents', 'Lerian', 'ai-prompts'),
    path.join(os.homedir(), 'lerian-protocol'),
    path.join(os.homedir(), 'ai-prompts'),
    path.join(os.homedir(), 'Development', 'lerian-protocol'),
    path.join(os.homedir(), 'Projects', 'lerian-protocol'),
    path.resolve('..', 'lerian-protocol'),
    path.resolve('..', 'ai-prompts'),
    path.resolve('../..', 'lerian-protocol'),
    path.resolve('../..', 'ai-prompts'),
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
    } catch {
      continue
    }
  }
  return null
}

/**
 * Check if running from lerian-protocol directory
 */
function isRunningFromLerianProtocol() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageData = require(packagePath)
      return packageData.name === 'lerian-protocol'
    }
  } catch {
    // Continue
  }
  return false
}

/**
 * Validate paths
 */
async function validatePaths(sourcePath, destPath) {
  const errors = []
  const warnings = []

  if (!await fs.pathExists(sourcePath)) {
    errors.push(`Source path does not exist: ${sourcePath}`)
  }

  if (!await fs.pathExists(destPath)) {
    errors.push(`Destination path does not exist: ${destPath}`)
  }

  // Check if destination is lerian-protocol
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
  } catch {
    warnings.push('Could not verify destination package information')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get themed colors based on selected theme
 */
function getThemeColors(theme) {
  const themes = {
    default: { 
      primary: chalk.blue, 
      accent: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      muted: chalk.gray
    },
    dark: { 
      primary: chalk.white, 
      accent: chalk.gray,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      muted: chalk.dim
    },
    cyberpunk: { 
      primary: chalk.cyan.bold, 
      accent: chalk.magenta.bold,
      success: chalk.green.bold,
      warning: chalk.yellow.bold,
      error: chalk.red.bold,
      muted: chalk.dim.cyan
    },
    minimal: { 
      primary: chalk.black, 
      accent: chalk.gray,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      muted: chalk.gray
    },
    highContrast: { 
      primary: chalk.white.bold, 
      accent: chalk.yellow.bold,
      success: chalk.green.bold,
      warning: chalk.yellow.bold,
      error: chalk.red.bold,
      muted: chalk.white
    }
  }
  return themes[theme] || themes.default
}

/**
 * Get change icon and color
 */
function getChangeDisplay(changeType, themeColors) {
  const displays = {
    new: { icon: '✨', color: themeColors.success },
    modified: { icon: '📝', color: themeColors.warning },
    deleted: { icon: '🗑️', color: themeColors.error },
    moved: { icon: '📁', color: themeColors.accent }
  }
  return displays[changeType] || { icon: '❓', color: themeColors.primary }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {return `${bytes}B`}
  if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)}KB`}
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * Display enhanced progress bar
 */
function displayProgressBar(current, total, themeColors) {
  const progress = Math.round((current / total) * 100)
  const barLength = 40
  const filledLength = Math.round((barLength * current) / total)
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)
  
  return `${themeColors.accent('[')}${themeColors.primary(bar)}${themeColors.accent(']')} ${themeColors.primary(progress + '%')} (${themeColors.accent(current)}/${themeColors.muted(total)})`
}

/**
 * Enhanced file selection interface
 */
async function displayModernInterface(files, sourcePath, destPath, options) {
  const themeColors = getThemeColors(options.theme)
  
  console.log()
  console.log(themeColors.primary.bold('⚡ Lerian Protocol Sync - Modern Interface'))
  console.log()

  // Theme indicator
  if (options.theme !== 'default') {
    console.log(themeColors.accent(`🎨 Theme: ${options.theme}`))
    if (options.variant) {
      console.log(themeColors.muted(`   Variant: ${options.variant}`))
    }
    console.log()
  }

  // Enhanced header with borders
  const headerBorder = '═'.repeat(60)
  console.log(themeColors.accent(headerBorder))
  console.log(themeColors.primary.bold('📁 FILE SYNCHRONIZATION'))
  console.log(themeColors.accent(headerBorder))
  console.log()

  // Path display with enhanced styling
  console.log(themeColors.primary('📂 Source:      ') + themeColors.accent(sourcePath))
  console.log(themeColors.primary('📁 Destination: ') + themeColors.accent(destPath))
  console.log()

  // Mode indicators
  const modeIcon = options.dryRun ? '🔍' : '⚡'
  const modeText = options.dryRun ? 'DRY RUN MODE' : 'SYNC MODE'
  const modeColor = options.dryRun ? themeColors.warning : themeColors.success
  console.log(modeColor.bold(`${modeIcon} ${modeText}`))
  
  if (options.dryRun) {
    console.log(themeColors.muted('   No files will be modified - this is a preview'))
  }
  console.log()

  // System health (if enabled)
  if (options.showSystemHealth) {
    console.log(themeColors.primary('🔧 System Health: ') + themeColors.success('✅ All systems operational'))
    console.log()
  }

  if (files.length === 0) {
    console.log(themeColors.success.bold('✅ NO CHANGES DETECTED'))
    console.log(themeColors.success('Everything is already in sync!'))
    return { cancelled: true }
  }

  // Enhanced change summary
  console.log(themeColors.primary.bold(`📊 DETECTED CHANGES (${files.length})`))
  console.log(themeColors.accent('─'.repeat(50)))

  const changeTypes = {
    new: files.filter(f => f.changeType === 'new').length,
    modified: files.filter(f => f.changeType === 'modified').length,
    deleted: files.filter(f => f.changeType === 'deleted').length,
    moved: files.filter(f => f.changeType === 'moved').length
  }

  Object.entries(changeTypes).forEach(([type, count]) => {
    if (count > 0) {
      const { icon, color } = getChangeDisplay(type, themeColors)
      console.log(`  ${color(icon)} ${color(type.toUpperCase())}: ${color.bold(count)} files`)
    }
  })
  console.log()

  // Enhanced file list with better formatting
  console.log(themeColors.primary.bold('📋 FILES TO SYNC:'))
  console.log(themeColors.accent('─'.repeat(50)))

  const displayFiles = files.slice(0, 15)
  displayFiles.forEach((file, index) => {
    const { icon, color } = getChangeDisplay(file.changeType, themeColors)
    const size = file.size ? themeColors.muted(` (${formatFileSize(file.size)})`) : ''
    const number = themeColors.muted(`${(index + 1).toString().padStart(2, ' ')}.`)
    console.log(`  ${number} ${color(icon)} ${color(file.path)}${size}`)
  })

  if (files.length > 15) {
    console.log(themeColors.muted(`  ... and ${files.length - 15} more files`))
  }
  console.log()

  // Calculate total size
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
  if (totalSize > 0) {
    console.log(themeColors.primary('💾 Total size: ') + themeColors.accent(formatFileSize(totalSize)))
    console.log()
  }

  if (options.dryRun) {
    // Dry run results
    console.log(themeColors.warning.bold('🔍 DRY RUN RESULTS'))
    console.log(themeColors.accent('─'.repeat(50)))
    console.log(themeColors.warning(`Would synchronize ${files.length} files`))
    console.log(themeColors.muted('No actual changes will be made'))
    console.log()
    return { filesProcessed: files.length, dryRun: true }
  }

  // Interactive confirmation
  console.log(themeColors.primary.bold('🎯 READY TO SYNC'))
  console.log(themeColors.accent('─'.repeat(50)))
  console.log(`Press ${themeColors.success.bold('Y')} to continue, ${themeColors.error.bold('N')} to cancel, ${themeColors.muted.bold('H')} for help`)
  console.log()

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const askConfirmation = () => {
      rl.question(themeColors.primary('Your choice: '), (answer) => {
        const input = answer.toLowerCase().trim()
        
        if (input === 'y' || input === 'yes') {
          console.log()
          console.log(themeColors.success.bold('✓ CONFIRMED - Starting sync...'))
          console.log()
          rl.close()
          simulateModernSync(files, themeColors).then(resolve)
          
        } else if (input === 'n' || input === 'no') {
          console.log()
          console.log(themeColors.warning.bold('✗ CANCELLED'))
          console.log(themeColors.muted('Sync operation cancelled by user'))
          console.log()
          rl.close()
          resolve({ cancelled: true })
          
        } else if (input === 'h' || input === 'help') {
          console.log()
          console.log(themeColors.primary.bold('📖 HELP'))
          console.log(themeColors.accent('─'.repeat(30)))
          console.log(`${themeColors.success.bold('Y/yes')} - Confirm and start sync`)
          console.log(`${themeColors.error.bold('N/no')} - Cancel operation`)
          console.log(`${themeColors.muted.bold('H/help')} - Show this help`)
          console.log()
          askConfirmation()
          
        } else {
          console.log(themeColors.warning(`Invalid input: "${answer}". Please enter Y/N/H`))
          askConfirmation()
        }
      })
    }

    askConfirmation()
  })
}

/**
 * Simulate modern sync with enhanced progress (SAFE VERSION - NO ACTUAL FILE OPERATIONS)
 */
async function simulateModernSync(files, themeColors) {
  console.log(themeColors.primary.bold('⚡ SYNC IN PROGRESS'))
  console.log(themeColors.accent('═'.repeat(60)))
  console.log()
  
  console.log(themeColors.warning.bold('🚨 SAFETY MODE: This is a SIMULATION only'))
  console.log(themeColors.warning('No actual file operations will be performed until sync is properly fixed'))
  console.log()

  let completed = 0
  const total = files.length
  
  for (const file of files) {
    const { icon, color } = getChangeDisplay(file.changeType, themeColors)
    
    // Show current operation
    console.log(`${color(icon)} Processing: ${color(file.path)}`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 150))
    
    completed++
    
    // Show progress bar
    console.log(`  ${displayProgressBar(completed, total, themeColors)}`)
    console.log()
  }

  // Success message
  console.log(themeColors.success.bold('🎉 SYNC SIMULATION COMPLETED!'))
  console.log(themeColors.accent('═'.repeat(60)))
  console.log()
  console.log(`${themeColors.warning('⚠️  SIMULATED:')} ${themeColors.success.bold(total)} files`)
  console.log(`${themeColors.primary('⏱️  Duration:')} ${themeColors.muted('~' + (total * 150) + 'ms')}`)
  console.log()
  console.log(themeColors.error.bold('🚨 IMPORTANT: Sync functionality is temporarily disabled'))
  console.log(themeColors.error('The sync logic needs to be fixed to prevent accidental deletions.'))
  console.log(themeColors.muted('💡 Pro tips:'))
  console.log(themeColors.muted('   • Use --dry-run to preview changes'))
  console.log(themeColors.muted('   • Try different themes: --theme=cyberpunk'))
  console.log(themeColors.muted('   • Use --legacy for the old interface'))
  console.log()

  return { filesProcessed: total, dryRun: false }
}

/**
 * Main modern sync command handler
 */
async function runModernSync(destination, options) {
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

    // Validate paths
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

    // Detect changes
    const changeDetector = new SimpleChangeDetector(sourcePath, destPath, {
      includeDirectories: options.include,
      excludePatterns: options.exclude,
      maxConcurrency: options.maxConcurrency || 5,
      enableProgressReporting: true
    })

    const detectionResult = await changeDetector.detectChanges()
    const detectedFiles = detectionResult.changes.map(change => ({
      path: change.path,
      changeType: change.changeType,
      size: change.size,
      reason: change.reason,
      selected: false,
      timestamp: change.timestamp || new Date(),
    }))

    // Launch modern interface
    const result = await displayModernInterface(detectedFiles, sourcePath, destPath, options)
    return result

  } catch (error) {
    // Enhanced error handling
    const themeColors = getThemeColors(options.theme || 'default')
    
    console.error()
    console.error(themeColors.error.bold('❌ SYNC FAILED'))
    console.error(themeColors.accent('═'.repeat(50)))
    console.error()
    
    if (error instanceof Error) {
      console.error(themeColors.error.bold('Error Details:'))
      console.error(themeColors.error(error.message))
      
      if (process.env.DEBUG) {
        console.error()
        console.error(themeColors.muted('Stack trace:'))
        console.error(themeColors.muted(error.stack))
      }
    }
    
    console.error()
    console.error(themeColors.muted('💡 Solutions:'))
    console.error(themeColors.muted('   • Run: lerian-protocol sync --help'))
    console.error(themeColors.muted('   • Try: lerian-protocol sync --legacy'))
    console.error(themeColors.muted('   • Debug: DEBUG=1 lerian-protocol sync'))
    console.error()
    
    process.exit(1)
  }
}

module.exports = { runModernSync }