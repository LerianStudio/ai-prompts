const chalk = require('chalk')

class CommandHeader {
  constructor(options = {}) {
    this.title = options.title || 'Command'
    this.subtitle = options.subtitle || ''
    this.variant = options.variant || 'standard'
    this.width = options.width || 80
  }

  render() {
    const titleLine = chalk.blue(`🔧 ${this.title}`)
    const subtitleLine = this.subtitle ? chalk.gray(this.subtitle) : ''
    
    const separator = chalk.gray('─'.repeat(Math.min(this.width, 60)))
    
    const output = [titleLine]
    if (subtitleLine) {
      output.push(subtitleLine)
    }
    output.push(separator)
    
    return output.join('\n')
  }
}

module.exports = CommandHeader