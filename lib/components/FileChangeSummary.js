
const path = require('path')

class FileChangeSummary {
  constructor(changes = [], options = {}) {
    this.changes = changes
    this.options = {
      maxDisplayFiles: options.maxDisplayFiles || 20,
      showFullPaths: options.showFullPaths || false,
      terminalWidth: options.terminalWidth || process.stdout.columns || 80,
      enableColors: options.enableColors !== false,
      collapsible: options.collapsible !== false,
      showStats: options.showStats !== false,
      pagination: options.pagination !== false,
      ...options
    }
    
    this.treeChars = {
      branch: '├─',
      lastBranch: '└─',
      vertical: '│',
      horizontal: '─',
      space: ' '
    }
    
    this.fallbackChars = {
      branch: '+-',
      lastBranch: '+-',
      vertical: '|',
      horizontal: '-',
      space: ' '
    }
    
    this.currentPage = 0
    this.collapsed = new Set()
  }

  render() {
    if (this.changes.length === 0) {
      return this.renderNoChanges()
    }

    const sections = this.groupChangesByDirectory()
    const output = []
    
    output.push(this.renderHeader())
    output.push('')
    
    for (const [directory, files] of Object.entries(sections)) {
      const sectionOutput = this.renderDirectorySection(directory, files)
      if (sectionOutput) {
        output.push(sectionOutput)
        output.push('')
      }
    }
    
    if (this.options.showStats) {
      output.push(this.renderSummaryStatistics())
    }
    
    if (this.options.pagination && this.needsPagination()) {
      output.push(this.renderPaginationControls())
    }
    
    return output.join('\n')
  }

  renderHeader() {
    const stats = this.getChangeStatistics()
    
    const icon = this.getIcon('folder')
    const statsLine = this.formatStatsLine(stats)
    
    return [
      `${icon} File Changes Detected:`,
      `   ${statsLine}`
    ].join('\n')
  }

  formatStatsLine(stats) {
    const parts = []
    if (stats.new > 0) {parts.push(`${stats.new} new`)}
    if (stats.modified > 0) {parts.push(`${stats.modified} modified`)}
    if (stats.deleted > 0) {parts.push(`${stats.deleted} deleted`)}
    if (stats.moved > 0) {parts.push(`${stats.moved} moved`)}
    
    return parts.length > 0 ? `${parts.join(', ')} files` : '0 files'
  }

  renderDirectorySection(directory, files) {
    if (files.length === 0) {return null}
    
    const lines = []
    const isCollapsed = this.collapsed.has(directory)
    
    const dirIcon = this.getIcon('directory')
    const collapseIcon = this.options.collapsible ? 
      (isCollapsed ? '▶' : '▼') : ''
    
    lines.push(`   ${collapseIcon}${dirIcon} ${directory}/`)
    
    if (isCollapsed && this.options.collapsible) {
      const stats = this.getDirectoryStats(files)
      lines.push(`   ${this.treeChars.lastBranch} ${stats} (collapsed)`)
      return lines.join('\n')
    }
    
    const filesToShow = this.getFilesToShow(files)
    const hasMore = files.length > filesToShow.length
    
    for (let i = 0; i < filesToShow.length; i++) {
      const file = filesToShow[i]
      const isLast = i === filesToShow.length - 1 && !hasMore
      const connector = isLast ? this.treeChars.lastBranch : this.treeChars.branch
      const icon = this.getChangeIcon(file.changeType)
      
      const fileLine = this.formatFileLine(file, connector, icon)
      lines.push(`   ${fileLine}`)
    }
    
    if (hasMore) {
      const remaining = files.length - filesToShow.length
      lines.push(`   ${this.treeChars.lastBranch} ... and ${remaining} more files`)
    }
    
    return lines.join('\n')
  }

  formatFileLine(file, connector, icon) {
    const fileName = this.options.showFullPaths ? file.path : path.basename(file.path)
    let line = `${connector} ${icon} ${fileName}`
    
    if (file.reason && this.shouldShowDetails()) {
      const details = this.formatChangeDetails(file)
      line += ` ${this.colorize(details, 'dim')}`
    }
    
    return line
  }

  formatChangeDetails(file) {
    if (!file.reason) {return ''}
    
    if (file.reason.includes('Size changed:')) {
      const match = file.reason.match(/(\d+)\s*→\s*(\d+)\s*bytes/)
      if (match) {
        return `(${this.formatFileSize(parseInt(match[1]))} → ${this.formatFileSize(parseInt(match[2]))})`
      }
    }
    
    if (file.reason.includes('Modified time changed:')) {
      return '(timestamp changed)'
    }
    
    if (file.reason.includes('File content has changed')) {
      return '(content changed)'
    }
    
    return '(changed)'
  }

  formatFileSize(bytes) {
    if (bytes < 1024) {return `${bytes}B`}
    if (bytes < 1024 * 1024) {return `${Math.round(bytes / 1024)}KB`}
    return `${Math.round(bytes / (1024 * 1024))}MB`
  }

  renderNoChanges() {
    const icon = this.getIcon('check')
    return [
      `${icon} File Scan Complete:`,
      `   ${this.getIcon('success')} No changes detected`,
      '   All files are already synchronized'
    ].join('\n')
  }

  renderSummaryStatistics() {
    const stats = this.getChangeStatistics()
    const sections = this.groupChangesByDirectory()
    const dirCount = Object.keys(sections).length
    
    return [
      '─'.repeat(Math.min(40, this.options.terminalWidth - 10)),
      `Summary: ${this.changes.length} changes across ${dirCount} directories`,
      this.formatDetailedStats(stats)
    ].join('\n')
  }

  formatDetailedStats(stats) {
    const parts = []
    if (stats.new > 0) {parts.push(`${this.getChangeIcon('new')} ${stats.new} new`)}
    if (stats.modified > 0) {parts.push(`${this.getChangeIcon('modified')} ${stats.modified} modified`)}
    if (stats.deleted > 0) {parts.push(`${this.getChangeIcon('deleted')} ${stats.deleted} deleted`)}
    if (stats.moved > 0) {parts.push(`${this.getChangeIcon('moved')} ${stats.moved} moved`)}
    
    return parts.join('  ')
  }

  renderPaginationControls() {
    const totalPages = this.getTotalPages()
    if (totalPages <= 1) {return ''}
    
    const current = this.currentPage + 1
    return [
      '─'.repeat(Math.min(20, this.options.terminalWidth - 20)),
      `Page ${current} of ${totalPages} • Use arrows to navigate`
    ].join('\n')
  }

  getChangeIcon(changeType) {
    const icons = {
      new: this.options.enableColors ? '🆕' : '[NEW]',
      modified: this.options.enableColors ? '📝' : '[MOD]',
      deleted: this.options.enableColors ? '🗑️' : '[DEL]',
      moved: this.options.enableColors ? '🔀' : '[MOV]'
    }
    return icons[changeType] || (this.options.enableColors ? '❓' : '[???]')
  }

  getIcon(type) {
    const icons = {
      folder: this.options.enableColors ? '📁' : '[DIR]',
      directory: this.options.enableColors ? '📂' : '',
      check: this.options.enableColors ? '📁' : '[SCAN]',
      success: this.options.enableColors ? '✅' : '[OK]'
    }
    return icons[type] || ''
  }

  colorize(text, color) {
    if (!this.options.enableColors) {return text}
    
    const colors = {
      dim: '\x1b[2m',
      reset: '\x1b[0m'
    }
    
    return `${colors[color] || ''}${text}${colors.reset}`
  }

  groupChangesByDirectory() {
    const groups = {}
    
    for (const change of this.changes) {
      const directory = this.getTopLevelDirectory(change.path)
      if (!groups[directory]) {
        groups[directory] = []
      }
      groups[directory].push(change)
    }
    
    for (const directory of Object.keys(groups)) {
      groups[directory].sort((a, b) => {
        const priorityA = this.getChangePriority(a.changeType)
        const priorityB = this.getChangePriority(b.changeType)
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        const pathA = a.path || ''
        const pathB = b.path || ''
        return pathA.localeCompare(pathB)
      })
    }
    
    return groups
  }

  getChangePriority(changeType) {
    const priorities = {
      new: 1,
      modified: 2,
      moved: 3,
      deleted: 4
    }
    return priorities[changeType] || 5
  }

  getTopLevelDirectory(filePath) {
    const parts = filePath.replace(/\\/g, '/').split('/')
    const topLevel = parts.find(part => part && part !== '.')
    
    if (topLevel === '.claude' || topLevel === 'protocol-assets') {
      return topLevel
    }
    
    return 'other'
  }

  getChangeStatistics() {
    const stats = { new: 0, modified: 0, deleted: 0, moved: 0 }
    
    for (const change of this.changes) {
      stats[change.changeType] = (stats[change.changeType] || 0) + 1
    }
    
    return stats
  }

  getDirectoryStats(files) {
    const stats = { new: 0, modified: 0, deleted: 0, moved: 0 }
    
    for (const file of files) {
      stats[file.changeType] = (stats[file.changeType] || 0) + 1
    }
    
    const parts = []
    if (stats.new > 0) {parts.push(`${stats.new} new`)}
    if (stats.modified > 0) {parts.push(`${stats.modified} modified`)}
    if (stats.deleted > 0) {parts.push(`${stats.deleted} deleted`)}
    if (stats.moved > 0) {parts.push(`${stats.moved} moved`)}
    
    return parts.join(', ') + ' files'
  }

  getFilesToShow(files) {
    if (!this.options.pagination) {
      return files.slice(0, this.options.maxDisplayFiles)
    }
    
    const startIndex = this.currentPage * this.options.maxDisplayFiles
    const endIndex = startIndex + this.options.maxDisplayFiles
    
    return files.slice(startIndex, endIndex)
  }

  needsPagination() {
    return this.changes.length > this.options.maxDisplayFiles
  }

  getTotalPages() {
    return Math.ceil(this.changes.length / this.options.maxDisplayFiles)
  }

  shouldShowDetails() {
    return this.options.terminalWidth > 100 && this.changes.length < 50
  }

  toggleDirectory(directory) {
    if (this.collapsed.has(directory)) {
      this.collapsed.delete(directory)
    } else {
      this.collapsed.add(directory)
    }
  }

  nextPage() {
    const totalPages = this.getTotalPages()
    if (this.currentPage < totalPages - 1) {
      this.currentPage++
      return true
    }
    return false
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--
      return true
    }
    return false
  }

  getPageInfo() {
    return {
      current: this.currentPage + 1,
      total: this.getTotalPages(),
      hasNext: this.currentPage < this.getTotalPages() - 1,
      hasPrevious: this.currentPage > 0
    }
  }

  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions }
  }

  getCompactSummary() {
    const stats = this.getChangeStatistics()
    const total = this.changes.length
    
    if (total === 0) {
      return 'No changes detected'
    }
    
    const parts = []
    if (stats.new > 0) {parts.push(`${stats.new} new`)}
    if (stats.modified > 0) {parts.push(`${stats.modified} modified`)}
    if (stats.deleted > 0) {parts.push(`${stats.deleted} deleted`)}
    if (stats.moved > 0) {parts.push(`${stats.moved} moved`)}
    
    return `${total} files: ${parts.join(', ')}`
  }
}

module.exports = FileChangeSummary