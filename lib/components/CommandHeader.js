const chalk = require('chalk')

class CommandHeader {
  constructor(options = {}) {
    this.title = options.title || 'Lerian Protocol Sync'
    this.subtitle = options.subtitle || 'Synchronizing .claude and protocol-assets'
    this.variant = options.variant || 'standard'
    this.width = options.width || process.stdout.columns || 80
    this.useUnicode = options.useUnicode !== false
    this.useColor = options.useColor !== false
    
    this.minWidth = 40
    this.maxWidth = 120
    
    if (this.width < this.minWidth) {
      this.width = this.minWidth
    } else if (this.width > this.maxWidth) {
      this.width = this.maxWidth
    }
  }

  render() {
    const colors = this.getColorScheme()
    const border = this.getBorderChars()
    const innerWidth = this.width - 4 // Account for borders and padding
    
    
    const titleLine = this.formatLine(colors.icon + ' ' + colors.title, innerWidth)
    const subtitleLine = this.formatLine(colors.subtitle, innerWidth)
    
    return [
      border.top,
      `${border.vertical} ${titleLine} ${border.vertical}`,
      `${border.vertical} ${subtitleLine} ${border.vertical}`,
      border.bottom
    ].join('\n')
  }

  getColorScheme() {
    const schemes = {
      standard: { 
        icon: '🔄', 
        titleColor: 'white', 
        subtitleColor: 'gray' 
      },
      success: { 
        icon: '✅', 
        titleColor: 'green', 
        subtitleColor: 'gray' 
      },
      warning: { 
        icon: '⚠️', 
        titleColor: 'yellow', 
        subtitleColor: 'gray' 
      },
      error: { 
        icon: '❌', 
        titleColor: 'red', 
        subtitleColor: 'gray' 
      }
    }
    
    const scheme = schemes[this.variant] || schemes.standard
    
    return {
      icon: scheme.icon,
      title: this.useColor ? chalk[scheme.titleColor](this.title) : this.title,
      subtitle: this.useColor ? chalk[scheme.subtitleColor](this.subtitle) : this.subtitle
    }
  }

  getBorderChars() {
    if (this.useUnicode && this.supportsUnicode()) {
      return {
        top: '┌' + '─'.repeat(this.width - 2) + '┐',
        bottom: '└' + '─'.repeat(this.width - 2) + '┘',
        vertical: '│'
      }
    } else {
      return {
        top: '+' + '-'.repeat(this.width - 2) + '+',
        bottom: '+' + '-'.repeat(this.width - 2) + '+',
        vertical: '|'
      }
    }
  }

  formatLine(content, targetWidth) {
    const plainContent = content.replace(/\\u001b\\[[0-9;]*m/g, '')
    const padding = Math.max(0, targetWidth - plainContent.length)
    return content + ' '.repeat(padding)
  }

  truncateText(text, maxWidth) {
    if (text.length <= maxWidth) {
      return text
    }
    return text.substring(0, maxWidth - 3) + '...'
  }

  supportsUnicode() {
    const term = process.env.TERM
    const lang = process.env.LANG || process.env.LC_ALL
    
    if (lang && lang.includes('UTF-8')) {return true}
    if (term && (term.includes('xterm') || term.includes('screen') || term === 'linux')) {return true}
    
    return process.platform !== 'win32' || process.env.WT_SESSION
  }

  static getResponsiveConfig(width = null) {
    const termWidth = width || process.stdout.columns || 80

    if (termWidth < 60) {
      return {
        layout: 'narrow',
        maxWidth: termWidth - 2,
        useUnicode: false,
        truncateLength: 25
      }
    } else if (termWidth < 80) {
      return {
        layout: 'compact', 
        maxWidth: termWidth - 4,
        useUnicode: true,
        truncateLength: 35
      }
    } else if (termWidth > 120) {
      return {
        layout: 'wide',
        maxWidth: 120,
        useUnicode: true,
        truncateLength: 80
      }
    } else {
      return {
        layout: 'standard',
        maxWidth: termWidth - 6,
        useUnicode: true,
        truncateLength: 50
      }
    }
  }

  static createResponsive(options = {}) {
    const config = CommandHeader.getResponsiveConfig(options.width)
    
    return new CommandHeader({
      ...options,
      width: config.maxWidth,
      useUnicode: config.useUnicode
    })
  }
}

module.exports = CommandHeader