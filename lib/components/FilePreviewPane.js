
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

class FilePreviewPane {
  constructor(options = {}) {
    this.options = {
      maxLines: options.maxLines || 10,
      maxLineLength: options.maxLineLength || 80,
      showDiff: options.showDiff !== false,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 30000, // 30 seconds
      maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
      diffContextLines: options.diffContextLines || 3,
      ...options
    }
    
    this.cache = new Map()
    this.cacheTimestamps = new Map()
    
    this.textExtensions = new Set([
      '.md', '.txt', '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', 
      '.xml', '.yaml', '.yml', '.sh', '.py', '.rb', '.php', '.java', '.c',
      '.cpp', '.h', '.hpp', '.go', '.rs', '.vue', '.svelte', '.scss', '.sass',
      '.less', '.sql', '.py', '.pl', '.r', '.swift', '.kt', '.dart', '.scala',
      '.clj', '.hs', '.ml', '.fs', '.elm', '.ex', '.exs', '.erl', '.nim',
      '.cr', '.zig', '.odin', '.v'
    ])
    
    this.configExtensions = new Set([
      '.toml', '.ini', '.conf', '.config', '.env', '.properties',
      '.gitignore', '.gitattributes', '.dockerignore', '.eslintrc',
      '.prettierrc', '.babelrc', '.editorconfig'
    ])
    
    this.binaryExtensions = new Set([
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp',
      '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flac', '.ogg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.so', '.dylib'
    ])
  }

  async generatePreview(file, width = 40) {
    
    try {
      if (this.options.enableCaching) {
        const cached = this.getCachedPreview(file)
        if (cached) {return cached}
      }
      
      const preview = await this.createPreview(file, width)
      
      if (this.options.enableCaching) {
        this.cachePreview(file, preview)
      }
      
      return preview
      
    } catch (error) {
      const errorPreview = this.createErrorPreview(file, error, width)
      return errorPreview
    }
  }

  async createPreview(file, width) {
    const sections = []
    
    sections.push(this.renderMetadata(file, width))
    
    if (await this.shouldShowContentPreview(file)) {
      if (file.changeType === 'modified' && this.options.showDiff) {
        sections.push(await this.renderDiff(file, width))
      } else if (file.sourceFile || file.destFile) {
        sections.push(await this.renderContent(file, width))
      }
    } else {
      sections.push(this.renderBinaryFileInfo(file, width))
    }
    
    if (file.changeType === 'deleted' && file.destFile) {
      sections.push(this.renderDeletedFileInfo(file, width))
    }
    
    return sections.join('\n')
  }

  renderMetadata(file, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('┌' + horizontalLine + '┐')
    lines.push('│' + chalk.bold(' File Details').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    
    const details = this.getFileDetails(file, width - 4)
    details.forEach(detail => {
      lines.push(`│ ${detail.padEnd(width - 3)} │`)
    })
    
    return lines.join('\n')
  }

  getFileDetails(file, maxWidth) {
    const details = []
    
    const pathLabel = chalk.cyan('Path: ')
    const pathValue = this.truncateText(file.path, maxWidth - pathLabel.length)
    details.push(pathLabel + pathValue)
    
    const typeLabel = chalk.cyan('Type: ')
    const typeValue = this.getColoredChangeType(file.changeType)
    details.push(typeLabel + typeValue)
    
    if (file.sourceFile && file.sourceFile.size !== undefined) {
      const sizeLabel = chalk.cyan('Size: ')
      let sizeValue = this.formatFileSize(file.sourceFile.size)
      
      if (file.destFile && file.destFile.size !== undefined && 
          file.sourceFile.size !== file.destFile.size) {
        const sizeDiff = file.sourceFile.size - file.destFile.size
        const diffFormatted = sizeDiff > 0 ? `+${this.formatFileSize(sizeDiff)}` : this.formatFileSize(sizeDiff)
        sizeValue += chalk.gray(` (${diffFormatted})`)
      }
      
      details.push(sizeLabel + sizeValue)
    }
    
    if (file.sourceFile && file.sourceFile.mtime) {
      const timeLabel = chalk.cyan('Modified: ')
      const timeValue = new Date(file.sourceFile.mtime).toLocaleString()
      details.push(timeLabel + this.truncateText(timeValue, maxWidth - timeLabel.length))
    }
    
    if (file.reason) {
      const reasonLabel = chalk.cyan('Reason: ')
      const reasonValue = this.truncateText(file.reason, maxWidth - reasonLabel.length)
      details.push(reasonLabel + reasonValue)
    }
    
    if (file.changeType === 'moved' && file.oldPath) {
      const oldPathLabel = chalk.cyan('From: ')
      const oldPathValue = this.truncateText(file.oldPath, maxWidth - oldPathLabel.length)
      details.push(oldPathLabel + oldPathValue)
    }
    
    return details
  }

  async renderContent(file, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('├' + horizontalLine + '┤')
    lines.push('│' + chalk.bold(' Content Preview').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    
    try {
      const targetFile = file.sourceFile || file.destFile
      if (!targetFile || !targetFile.fullPath) {
        lines.push(`│ ${chalk.gray('No file path available').padEnd(width - 3)} │`)
        return lines.join('\n')
      }
      
      if (targetFile.size && targetFile.size > this.options.maxFileSize) {
        lines.push(`│ ${chalk.yellow('File too large for preview').padEnd(width - 3)} │`)
        return lines.join('\n')
      }
      
      const content = await this.readFileContent(targetFile.fullPath)
      const contentLines = content.split('\n')
      const maxLines = Math.min(this.options.maxLines, contentLines.length)
      
      for (let i = 0; i < maxLines; i++) {
        const lineNum = (i + 1).toString().padStart(3, ' ')
        let line = contentLines[i] || ''
        
        if (line.length > width - 8) {
          line = line.substring(0, width - 11) + '...'
        }
        
        line = this.applySyntaxHighlighting(line, path.extname(file.path))
        
        const formattedLine = `${chalk.gray(lineNum)} │ ${line}`
        lines.push(`│ ${formattedLine.padEnd(width - 3)} │`)
      }
      
      if (contentLines.length > this.options.maxLines) {
        lines.push(`│ ${chalk.gray('... (truncated)').padEnd(width - 3)} │`)
      }
      
    } catch (error) {
      lines.push(`│ ${chalk.red('Error reading file:').padEnd(width - 3)} │`)
      lines.push(`│ ${chalk.red(error.message).padEnd(width - 3)} │`)
    }
    
    return lines.join('\n')
  }

  async renderDiff(file, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('├' + horizontalLine + '┤')
    lines.push('│' + chalk.bold(' Changes').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    
    try {
      if (!file.sourceFile || !file.destFile || 
          !file.sourceFile.fullPath || !file.destFile.fullPath) {
        lines.push(`│ ${chalk.gray('Cannot compare files').padEnd(width - 3)} │`)
        return lines.join('\n')
      }
      
      const [sourceContent, destContent] = await Promise.all([
        this.readFileContent(file.sourceFile.fullPath),
        this.readFileContent(file.destFile.fullPath)
      ])
      
      const diff = this.generateDiff(destContent, sourceContent, width - 4)
      diff.forEach(diffLine => {
        lines.push(`│ ${diffLine.padEnd(width - 3)} │`)
      })
      
    } catch (error) {
      lines.push(`│ ${chalk.red('Error generating diff:').padEnd(width - 3)} │`)
      lines.push(`│ ${chalk.red(error.message).padEnd(width - 3)} │`)
    }
    
    return lines.join('\n')
  }

  generateDiff(oldContent, newContent, maxWidth) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    const diffLines = []
    
    const maxLines = Math.min(
      this.options.maxLines,
      Math.max(oldLines.length, newLines.length)
    )
    
    let addedLines = 0
    let removedLines = 0
    let contextLines = 0
    
    for (let i = 0; i < maxLines && diffLines.length < this.options.maxLines; i++) {
      const oldLine = oldLines[i] || ''
      const newLine = newLines[i] || ''
      
      if (oldLine !== newLine) {
        if (contextLines > 0 && diffLines.length > 0) {
          diffLines.push(chalk.gray('  ...'))
        }
        
        if (oldLine && oldLine !== newLine) {
          const truncated = this.truncateText(oldLine, maxWidth - 3)
          diffLines.push(chalk.red(`- ${truncated}`))
          removedLines++
        }
        
        if (newLine && newLine !== oldLine) {
          const truncated = this.truncateText(newLine, maxWidth - 3)
          diffLines.push(chalk.green(`+ ${truncated}`))
          addedLines++
        }
        
        contextLines = 0
      } else if (oldLine) {
        if (contextLines < this.options.diffContextLines) {
          const truncated = this.truncateText(oldLine, maxWidth - 3)
          diffLines.push(chalk.gray(`  ${truncated}`))
        }
        contextLines++
      }
    }
    
    if (diffLines.length === 0) {
      diffLines.push(chalk.gray('No visible changes in preview area'))
    } else {
      const summary = `${chalk.green(`+${addedLines}`)} ${chalk.red(`-${removedLines}`)} lines`
      diffLines.unshift(summary)
    }
    
    return diffLines
  }

  renderBinaryFileInfo(file, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('├' + horizontalLine + '┤')
    lines.push('│' + chalk.bold(' Binary File').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    
    const ext = path.extname(file.path) || 'Unknown'
    lines.push(`│ ${chalk.cyan('Type: ').padEnd(width - 3)}${ext} │`)
    
    lines.push(`│ ${chalk.gray('Content preview not available').padEnd(width - 3)} │`)
    
    if (file.sourceFile && file.destFile && 
        file.sourceFile.size !== file.destFile.size) {
      const sizeDiff = file.sourceFile.size - file.destFile.size
      const sizeChange = sizeDiff > 0 ? 
        `+${this.formatFileSize(sizeDiff)}` : 
        this.formatFileSize(sizeDiff)
      
      lines.push(`│ ${chalk.cyan('Size change: ').padEnd(width - 3)}${sizeChange} │`)
    }
    
    return lines.join('\n')
  }

  renderDeletedFileInfo(file, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('├' + horizontalLine + '┤')
    lines.push('│' + chalk.bold.red(' Deleted File').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    
    if (file.destFile) {
      lines.push(`│ ${chalk.cyan('Was: ').padEnd(width - 3)}${this.formatFileSize(file.destFile.size)} │`)
      
      if (file.destFile.mtime) {
        const lastMod = new Date(file.destFile.mtime).toLocaleString()
        lines.push(`│ ${chalk.cyan('Last modified: ').padEnd(width - 3)}${this.truncateText(lastMod, width - 18)} │`)
      }
    }
    
    lines.push(`│ ${chalk.red('Will be removed from destination').padEnd(width - 3)} │`)
    
    return lines.join('\n')
  }

  createErrorPreview(file, error, width) {
    const lines = []
    const horizontalLine = '─'.repeat(width - 2)
    
    lines.push('┌' + horizontalLine + '┐')
    lines.push('│' + chalk.bold.red(' Preview Error').padEnd(width - 1) + '│')
    lines.push('├' + horizontalLine + '┤')
    lines.push(`│ ${chalk.red('Cannot preview file:').padEnd(width - 3)} │`)
    lines.push(`│ ${chalk.red(error.message || 'Unknown error').padEnd(width - 3)} │`)
    lines.push('└' + horizontalLine + '┘')
    
    return lines.join('\n')
  }

  async shouldShowContentPreview(file) {
    const ext = path.extname(file.path).toLowerCase()
    
    if (this.textExtensions.has(ext) || this.configExtensions.has(ext)) {
      return true
    }
    
    if (this.binaryExtensions.has(ext)) {
      return false
    }
    
    return await this.isTextFile(file)
  }

  async isTextFile(file) {
    try {
      const targetFile = file.sourceFile || file.destFile
      if (!targetFile || !targetFile.fullPath) {
        return false
      }
      
      const sampleSize = Math.min(512, targetFile.size || 512)
      const buffer = await this.readFileBuffer(targetFile.fullPath, 0, sampleSize)
      
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0) {
          return false
        }
      }
      
      let printableCount = 0
      for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i]
        if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
          printableCount++
        }
      }
      
      return (printableCount / buffer.length) > 0.85
      
    } catch {
      return false
    }
  }

  async readFileContent(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8')
    } catch (error) {
      throw new Error(`Cannot read file: ${error.message}`)
    }
  }

  async readFileBuffer(filePath, offset = 0, length) {
    try {
      const fd = await fs.open(filePath, 'r')
      try {
        const buffer = Buffer.alloc(length)
        const result = await fd.read(buffer, 0, length, offset)
        return buffer.slice(0, result.bytesRead)
      } finally {
        await fd.close()
      }
    } catch (error) {
      throw new Error(`Cannot read file buffer: ${error.message}`)
    }
  }

  applySyntaxHighlighting(line, extension) {
    const ext = extension.toLowerCase()
    
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
      return line
        .replace(/(function|const|let|var|if|else|for|while|return|class|import|export)/g, 
                 match => chalk.blue(match))
        .replace(/(\/\/.*$)/g, match => chalk.gray(match))
        .replace(/(['"`])([^'"`]*)\1/g, (match, quote, content) => 
                 chalk.green(quote + content + quote))
    }
    
    if (ext === '.md') {
      return line
        .replace(/^(#{1,6})\s+(.*)/, (match, hashes, title) => 
                 chalk.blue(hashes) + ' ' + chalk.bold(title))
        .replace(/\*\*(.*?)\*\*/g, (match, content) => chalk.bold(content))
        .replace(/\*(.*?)\*/g, (match, content) => chalk.italic(content))
    }
    
    if (ext === '.json') {
      return line
        .replace(/"([^"]+)":/g, (match, key) => chalk.cyan(`"${key}"`))
        .replace(/:\s*"([^"]+)"/g, (match, value) => `: ${chalk.green(`"${value}"`)}`)
        .replace(/:\s*(true|false|null|\d+)/g, (match, value) => `: ${chalk.yellow(value)}`)
    }
    
    return line
  }

  getColoredChangeType(changeType) {
    const colors = {
      new: chalk.green,
      modified: chalk.yellow,
      deleted: chalk.red,
      moved: chalk.blue
    }
    
    const color = colors[changeType] || chalk.white
    return color(changeType.toUpperCase())
  }

  formatFileSize(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) {return text}
    return text.substring(0, maxLength - 3) + '...'
  }

  
  getCachedPreview(file) {
    const cacheKey = this.getCacheKey(file)
    const timestamp = this.cacheTimestamps.get(cacheKey)
    
    if (timestamp && Date.now() - timestamp < this.options.cacheTimeout) {
      return this.cache.get(cacheKey)
    }
    
    return null
  }

  cachePreview(file, preview) {
    const cacheKey = this.getCacheKey(file)
    this.cache.set(cacheKey, preview)
    this.cacheTimestamps.set(cacheKey, Date.now())
    
    this.cleanupCache()
  }

  getCacheKey(file) {
    return `${file.path}-${file.changeType}-${file.sourceFile?.mtime || 0}-${file.destFile?.mtime || 0}`
  }

  cleanupCache() {
    const now = Date.now()
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.options.cacheTimeout) {
        this.cache.delete(key)
        this.cacheTimestamps.delete(key)
      }
    }
  }

  clearCache() {
    this.cache.clear()
    this.cacheTimestamps.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      memoryUsage: JSON.stringify(Object.fromEntries(this.cache)).length,
      oldestEntry: this.cacheTimestamps.size > 0 ? 
        Math.min(...this.cacheTimestamps.values()) : null
    }
  }
}

module.exports = FilePreviewPane