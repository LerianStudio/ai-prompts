const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')

class FileSelector {
  constructor(options = {}) {
    this.maxDisplayFiles = options.maxDisplayFiles || 20
    this.groupByDirectory = options.groupByDirectory !== false // Default true
    this.showFileStats = options.showFileStats !== false // Default true
  }

  /**
   * Interactive file selection for push operations
   * @param {Object} pushableFiles - Files eligible for pushing
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selected files and patterns
   */
  async selectFilesForPush(pushableFiles, options = {}) {
    const fileList = Object.keys(pushableFiles)
    
    if (fileList.length === 0) {
      return {
        selectedFiles: {},
        includePatterns: [],
        excludePatterns: [],
        selectionType: 'none'
      }
    }

    console.log(`\n📂 Found ${fileList.length} files eligible for push`)
    
    // Show file overview
    this.displayFileOverview(pushableFiles)

    const selectionMethod = await this.promptSelectionMethod(fileList.length)
    
    switch (selectionMethod) {
      case 'all':
        return {
          selectedFiles: pushableFiles,
          includePatterns: ['**/*'],
          excludePatterns: [],
          selectionType: 'all'
        }
        
      case 'patterns':
        return await this.selectByPatterns(pushableFiles, options)
        
      case 'interactive':
        return await this.selectInteractively(pushableFiles, options)
        
      case 'directories':
        return await this.selectByDirectories(pushableFiles, options)
        
      case 'none':
      default:
        return {
          selectedFiles: {},
          includePatterns: [],
          excludePatterns: [],
          selectionType: 'none'
        }
    }
  }

  /**
   * Display overview of files eligible for push
   * @param {Object} pushableFiles - Files to display
   */
  displayFileOverview(pushableFiles) {
    const grouped = this.groupFilesByDirectory(pushableFiles)
    const totalSize = Object.values(pushableFiles).reduce((sum, file) => sum + (file.size || 0), 0)
    
    console.log(`📊 Total size: ${this.formatBytes(totalSize)}`)
    console.log('\n📁 Files by directory:')
    
    const sortedDirs = Object.keys(grouped).sort()
    for (const dir of sortedDirs.slice(0, 10)) { // Show max 10 directories
      const files = grouped[dir]
      console.log(`  ${dir || '.'}: ${files.length} file(s)`)
    }
    
    if (sortedDirs.length > 10) {
      console.log(`  ... and ${sortedDirs.length - 10} more directories`)
    }
  }

  /**
   * Prompt user for selection method
   * @param {number} fileCount - Total number of files
   * @returns {Promise<string>} Selected method
   */
  async promptSelectionMethod(fileCount) {
    const choices = [
      {
        name: 'Interactive selection - Choose specific files',
        value: 'interactive',
        disabled: fileCount > 50 ? 'Too many files for interactive mode' : false
      },
      {
        name: 'Directory selection - Choose by directory',
        value: 'directories'
      },
      {
        name: 'Pattern selection - Use glob patterns',
        value: 'patterns'
      },
      {
        name: 'Select all files',
        value: 'all'
      },
      {
        name: 'Cancel - select no files',
        value: 'none'
      }
    ]

    const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'How would you like to select files for push?',
        choices,
        default: fileCount <= 10 ? 'interactive' : 'directories'
      }
    ])

    return method
  }

  /**
   * Select files using glob patterns
   * @param {Object} pushableFiles - Available files
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selection result
   */
  async selectByPatterns(pushableFiles, options = {}) {
    console.log('\n🔍 Common patterns:')
    console.log('  *.md - All markdown files')
    console.log('  .claude/** - All Claude configuration and customizations')
    console.log('  protocol-assets/** - All protocol assets')
    console.log('  docs/** - All documentation')
    console.log('  **/*.js - All JavaScript files')

    const { includePatterns, excludePatterns } = await inquirer.prompt([
      {
        type: 'input',
        name: 'includePatterns',
        message: 'Include patterns (comma-separated):',
        default: '.claude/**,protocol-assets/**,docs/**/*.md',
        filter: (input) => input.split(',').map(p => p.trim()).filter(p => p.length > 0)
      },
      {
        type: 'input', 
        name: 'excludePatterns',
        message: 'Exclude patterns (comma-separated, optional):',
        filter: (input) => input ? input.split(',').map(p => p.trim()).filter(p => p.length > 0) : []
      }
    ])

    const selectedFiles = this.applyPatterns(pushableFiles, includePatterns, excludePatterns)
    
    console.log(`\n✅ Selected ${Object.keys(selectedFiles).length} files using patterns`)
    this.displaySelectedFiles(selectedFiles, { showFirst: 10 })

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with these files?',
        default: true
      }
    ])

    if (!confirm) {
      return this.selectByPatterns(pushableFiles, options) // Try again
    }

    return {
      selectedFiles,
      includePatterns,
      excludePatterns,
      selectionType: 'patterns'
    }
  }

  /**
   * Interactive file selection
   * @param {Object} pushableFiles - Available files
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selection result
   */
  async selectInteractively(pushableFiles, options = {}) {
    const fileList = Object.keys(pushableFiles)
    
    if (fileList.length > this.maxDisplayFiles) {
      console.log(`⚠️  Too many files (${fileList.length}) for interactive selection. Using directory selection instead.`)
      return this.selectByDirectories(pushableFiles, options)
    }

    const choices = fileList.map(filePath => {
      const file = pushableFiles[filePath]
      const size = file.size ? `(${this.formatBytes(file.size)})` : ''
      return {
        name: `${filePath} ${size}`,
        value: filePath,
        short: filePath
      }
    })

    const { selectedPaths } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPaths',
        message: 'Select files to push:',
        choices,
        pageSize: Math.min(15, choices.length),
        validate: (answer) => {
          if (answer.length === 0) {
            return 'Please select at least one file'
          }
          return true
        }
      }
    ])

    const selectedFiles = {}
    for (const filePath of selectedPaths) {
      selectedFiles[filePath] = pushableFiles[filePath]
    }

    return {
      selectedFiles,
      includePatterns: selectedPaths,
      excludePatterns: [],
      selectionType: 'interactive'
    }
  }

  /**
   * Select files by directory
   * @param {Object} pushableFiles - Available files
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selection result
   */
  async selectByDirectories(pushableFiles, options = {}) {
    const grouped = this.groupFilesByDirectory(pushableFiles)
    const directories = Object.keys(grouped).sort()

    const choices = directories.map(dir => {
      const files = grouped[dir]
      const totalSize = files.reduce((sum, filePath) => sum + (pushableFiles[filePath].size || 0), 0)
      const displayName = dir || '(root directory)'
      return {
        name: `${displayName} (${files.length} files, ${this.formatBytes(totalSize)})`,
        value: dir,
        short: displayName
      }
    })

    const { selectedDirs } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedDirs',
        message: 'Select directories to push:',
        choices,
        pageSize: Math.min(12, choices.length),
        validate: (answer) => {
          if (answer.length === 0) {
            return 'Please select at least one directory'
          }
          return true
        }
      }
    ])

    // Build selected files from directories
    const selectedFiles = {}
    const includePatterns = []

    for (const dir of selectedDirs) {
      const files = grouped[dir]
      for (const filePath of files) {
        selectedFiles[filePath] = pushableFiles[filePath]
      }
      
      // Generate patterns for selected directories
      if (dir) {
        includePatterns.push(`${dir}/**`)
      } else {
        includePatterns.push('*') // Root files
      }
    }

    console.log(`\n✅ Selected ${Object.keys(selectedFiles).length} files from ${selectedDirs.length} directories`)

    return {
      selectedFiles,
      includePatterns,
      excludePatterns: [],
      selectionType: 'directories'
    }
  }

  /**
   * Group files by their directory
   * @param {Object} files - File hash object
   * @returns {Object} Files grouped by directory
   */
  groupFilesByDirectory(files) {
    const grouped = {}
    
    for (const filePath of Object.keys(files)) {
      const dir = path.dirname(filePath)
      const dirKey = dir === '.' ? '' : dir
      
      if (!grouped[dirKey]) {
        grouped[dirKey] = []
      }
      grouped[dirKey].push(filePath)
    }

    return grouped
  }

  /**
   * Apply include/exclude patterns to file list
   * @param {Object} files - All available files
   * @param {Array} includePatterns - Patterns to include
   * @param {Array} excludePatterns - Patterns to exclude
   * @returns {Object} Filtered files
   */
  applyPatterns(files, includePatterns, excludePatterns) {
    const selected = {}
    
    // First, apply include patterns
    for (const [filePath, fileInfo] of Object.entries(files)) {
      if (this.matchesAnyPattern(filePath, includePatterns)) {
        selected[filePath] = fileInfo
      }
    }

    // Then, apply exclude patterns
    for (const pattern of excludePatterns) {
      for (const filePath of Object.keys(selected)) {
        if (this.matchesPattern(filePath, pattern)) {
          delete selected[filePath]
        }
      }
    }

    return selected
  }

  /**
   * Check if path matches any pattern in array
   * @param {string} filePath - File path to test
   * @param {Array} patterns - Array of patterns
   * @returns {boolean} True if matches any pattern
   */
  matchesAnyPattern(filePath, patterns) {
    return patterns.some(pattern => this.matchesPattern(filePath, pattern))
  }

  /**
   * Simple glob pattern matching
   * @param {string} filePath - File path to test  
   * @param {string} pattern - Pattern to match
   * @returns {boolean} True if matches
   */
  matchesPattern(filePath, pattern) {
    // Handle exact matches first
    if (pattern === filePath) return true
    
    // Handle glob patterns
    if (pattern.includes('*')) {
      // Convert glob to regex
      const regexPattern = pattern
        .replace(/\*\*/g, '§DOUBLESTAR§') // Placeholder for **
        .replace(/\*/g, '[^/]*')         // Single * matches within directory
        .replace(/§DOUBLESTAR§/g, '.*')  // ** matches across directories
        .replace(/\?/g, '[^/]')          // ? matches single character
      
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(filePath)
    }

    // Handle directory patterns (ending with /)
    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern) || filePath.startsWith(pattern.slice(0, -1) + path.sep)
    }

    // Handle exact file extension matches
    if (pattern.startsWith('*.')) {
      return filePath.endsWith(pattern.substring(1))
    }

    return false
  }

  /**
   * Display selected files with optional limit
   * @param {Object} selectedFiles - Selected files
   * @param {Object} options - Display options
   */
  displaySelectedFiles(selectedFiles, options = {}) {
    const filePaths = Object.keys(selectedFiles)
    const showFirst = options.showFirst || filePaths.length

    console.log('\n📋 Selected files:')
    
    for (let i = 0; i < Math.min(showFirst, filePaths.length); i++) {
      const filePath = filePaths[i]
      const file = selectedFiles[filePath]
      const size = file.size ? ` (${this.formatBytes(file.size)})` : ''
      console.log(`  ✓ ${filePath}${size}`)
    }

    if (filePaths.length > showFirst) {
      console.log(`  ... and ${filePaths.length - showFirst} more files`)
    }
  }

  /**
   * Format bytes into human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Create selection from command line arguments
   * @param {Object} pushableFiles - Available files
   * @param {Object} args - Command line arguments
   * @returns {Object} Selection result
   */
  createSelectionFromArgs(pushableFiles, args = {}) {
    let selectedFiles = {}
    let includePatterns = []
    let excludePatterns = []

    // Handle --files argument
    if (args.files) {
      const filePatterns = args.files.split(',').map(f => f.trim())
      selectedFiles = this.applyPatterns(pushableFiles, filePatterns, [])
      includePatterns = filePatterns
    }

    // Handle --include argument  
    if (args.include) {
      const patterns = args.include.split(',').map(p => p.trim())
      selectedFiles = this.applyPatterns(pushableFiles, patterns, excludePatterns)
      includePatterns = patterns
    }

    // Handle --exclude argument
    if (args.exclude) {
      excludePatterns = args.exclude.split(',').map(p => p.trim())
      selectedFiles = this.applyPatterns(selectedFiles, includePatterns, excludePatterns)
    }

    // If no specific selection, use default pushable files
    if (Object.keys(selectedFiles).length === 0 && !args.files && !args.include) {
      selectedFiles = pushableFiles
      includePatterns = ['**/*']
    }

    return {
      selectedFiles,
      includePatterns,
      excludePatterns,
      selectionType: 'args'
    }
  }
}

module.exports = FileSelector