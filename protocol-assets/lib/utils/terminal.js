class TerminalDetector {
  static getCapabilities() {
    const width = process.stdout.columns || 80
    const height = process.stdout.rows || 24
    const supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb'
    
    return {
      width,
      height,
      supportsColor,
      isInteractive: process.stdout.isTTY,
      platform: process.platform
    }
  }

  static isColorSupported() {
    return process.stdout.isTTY && process.env.TERM !== 'dumb'
  }

  static getTerminalWidth() {
    return process.stdout.columns || 80
  }
}

module.exports = TerminalDetector