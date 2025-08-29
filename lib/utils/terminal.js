const supportsColor = require('supports-color')
const { getEnv, getEnvMultiple } = require('../security/EnvironmentSanitizer')

/**
 * TerminalDetector - Comprehensive terminal capability detection and configuration
 * 
 * Features:
 * - Color support detection with fallback levels
 * - Terminal dimension detection and monitoring
 * - Platform-specific terminal handling
 * - CI/CD environment detection and graceful fallbacks
 * - Responsive layout configuration
 * - Terminal feature detection (TTY, Unicode, etc.)
 */
class TerminalDetector {
  /**
   * Get comprehensive terminal capabilities
   * @returns {Object} Terminal capabilities object
   */
  static getCapabilities() {
    const stdout = process.stdout
    const stderr = process.stderr
    
    return {
      // Color support
      supportsColor: !!supportsColor.stdout,
      colorLevel: supportsColor.stdout ? supportsColor.stdout.level : 0,
      supportsColorStderr: !!supportsColor.stderr,
      colorLevelStderr: supportsColor.stderr ? supportsColor.stderr.level : 0,
      
      // Terminal dimensions
      width: stdout.columns || 80,
      height: stdout.rows || 24,
      
      // Terminal type and features
      isTTY: stdout.isTTY,
      isTTYStderr: stderr.isTTY,
      
      // Environment information
      platform: process.platform,
      term: getEnv('TERM', 'unknown'),
      termProgram: getEnv('TERM_PROGRAM'),
      
      // CI/CD detection
      isCI: this.isRunningInCI(),
      isCIEnvironment: this.detectCIEnvironment(),
      
      // Unicode and advanced features
      supportsUnicode: this.supportsUnicode(),
      supportsEmoji: this.supportsEmoji(),
      
      // System information
      nodeVersion: process.version,
      env: getEnvMultiple([
        'COLORTERM',
        'FORCE_COLOR',
        'NO_COLOR',
        'TERM_PROGRAM',
        'TERM_PROGRAM_VERSION',
        'WT_SESSION', // Windows Terminal
        'CONEMU_ANSI_COLORS_DISABLED'
      ])
    }
  }

  /**
   * Get responsive configuration based on terminal width
   * @param {number} [width] - Override width (uses detected width if not provided)
   * @returns {Object} Responsive configuration object
   */
  static getResponsiveConfig(width = null) {
    const termWidth = width || process.stdout.columns || 80
    const capabilities = this.getCapabilities()
    
    if (termWidth < 60) {
      return {
        layout: 'narrow',
        maxWidth: Math.max(termWidth - 4, 30),
        indent: 1,
        useShortLabels: true,
        useUnicode: false, // More reliable in constrained environments
        maxColumns: 1,
        wrapText: true,
        compactMode: true
      }
    } else if (termWidth < 80) {
      return {
        layout: 'compact',
        maxWidth: termWidth - 6,
        indent: 2,
        useShortLabels: true,
        useUnicode: capabilities.supportsUnicode,
        maxColumns: 2,
        wrapText: true,
        compactMode: false
      }
    } else if (termWidth > 120) {
      return {
        layout: 'wide',
        maxWidth: Math.min(termWidth - 8, 120),
        indent: 4,
        useShortLabels: false,
        useUnicode: capabilities.supportsUnicode,
        maxColumns: 3,
        wrapText: false,
        compactMode: false
      }
    } else {
      return {
        layout: 'standard',
        maxWidth: termWidth - 6,
        indent: 3,
        useShortLabels: false,
        useUnicode: capabilities.supportsUnicode,
        maxColumns: 2,
        wrapText: false,
        compactMode: false
      }
    }
  }

  /**
   * Detect if running in a CI/CD environment
   * @returns {boolean} True if running in CI/CD
   */
  static isRunningInCI() {
    const ciVars = getEnvMultiple([
      'CI',
      'CONTINUOUS_INTEGRATION',
      'BUILD_NUMBER',
      'TRAVIS',
      'CIRCLECI',
      'APPVEYOR',
      'GITLAB_CI',
      'GITHUB_ACTIONS',
      'AZURE_PIPELINES',
      'JENKINS_URL'
    ])
    
    return Object.values(ciVars).some(value => !!value)
  }

  /**
   * Detect specific CI/CD environment
   * @returns {string|null} CI environment name or null
   */
  static detectCIEnvironment() {
    if (getEnv('GITHUB_ACTIONS')) {return 'GitHub Actions'}
    if (getEnv('TRAVIS')) {return 'Travis CI'}
    if (getEnv('CIRCLECI')) {return 'CircleCI'}
    if (getEnv('APPVEYOR')) {return 'AppVeyor'}
    if (getEnv('GITLAB_CI')) {return 'GitLab CI'}
    if (getEnv('AZURE_PIPELINES')) {return 'Azure Pipelines'}
    if (getEnv('JENKINS_URL')) {return 'Jenkins'}
    if (getEnv('CI')) {return 'Generic CI'}
    return null
  }

  /**
   * Check if terminal supports Unicode characters
   * @returns {boolean} True if Unicode is supported
   */
  static supportsUnicode() {
    // Force disable Unicode if NO_UNICODE is set
    if (getEnv('NO_UNICODE')) {return false}
    
    // Check language and locale
    const lang = getEnv('LANG') || getEnv('LC_ALL') || ''
    if (lang.includes('UTF-8') || lang.includes('utf8')) {return true}
    
    // Terminal-specific checks
    const term = getEnv('TERM', '')
    const termProgram = getEnv('TERM_PROGRAM', '')
    
    // Known Unicode-supporting terminals
    const unicodeTerminals = [
      'xterm-256color',
      'screen-256color', 
      'tmux-256color',
      'alacritty',
      'kitty'
    ]
    
    if (unicodeTerminals.some(t => term.includes(t))) {return true}
    
    // Terminal programs that support Unicode
    const unicodePrograms = ['iTerm.app', 'Apple_Terminal', 'Hyper', 'Terminus']
    if (unicodePrograms.includes(termProgram)) {return true}
    
    // Windows Terminal
    if (getEnv('WT_SESSION')) {return true}
    
    // Default behavior by platform
    switch (process.platform) {
      case 'darwin': // macOS
      case 'linux':
        return !this.isRunningInCI() // Assume Unicode support except in CI
      case 'win32':
        return !!(getEnv('WT_SESSION') || termProgram) // Windows Terminal or other modern terminal
      default:
        return false
    }
  }

  /**
   * Check if terminal supports emoji characters
   * @returns {boolean} True if emoji is supported
   */
  static supportsEmoji() {
    // Force disable emoji if NO_EMOJI is set
    if (getEnv('NO_EMOJI')) {return false}
    
    // CI environments typically don't render emoji well
    if (this.isRunningInCI()) {return false}
    
    // Basic Unicode support is required for emoji
    if (!this.supportsUnicode()) {return false}
    
    // Terminal programs known to support emoji
    const emojiPrograms = ['iTerm.app', 'Hyper', 'Terminus']
    const termProgram = getEnv('TERM_PROGRAM', '')
    
    if (emojiPrograms.includes(termProgram)) {return true}
    if (getEnv('WT_SESSION')) {return true} // Windows Terminal
    
    // Platform defaults
    return process.platform === 'darwin' // macOS generally supports emoji
  }

  /**
   * Get platform-specific terminal configuration
   * @returns {Object} Platform-specific configuration
   */
  static getPlatformConfig() {
    const platform = process.platform
    const capabilities = this.getCapabilities()
    
    const configs = {
      win32: {
        preferredShell: getEnv('COMSPEC', 'cmd.exe'),
        pathSeparator: '\\',
        supportsAnsiColors: !!getEnv('WT_SESSION') || !!capabilities.supportsColor,
        requiresExtraEscaping: true,
        defaultEncoding: 'utf8',
        lineEnding: '\r\n'
      },
      darwin: {
        preferredShell: getEnv('SHELL', '/bin/zsh'),
        pathSeparator: '/',
        supportsAnsiColors: true,
        requiresExtraEscaping: false,
        defaultEncoding: 'utf8',
        lineEnding: '\n'
      },
      linux: {
        preferredShell: getEnv('SHELL', '/bin/bash'),
        pathSeparator: '/',
        supportsAnsiColors: capabilities.supportsColor,
        requiresExtraEscaping: false,
        defaultEncoding: 'utf8',
        lineEnding: '\n'
      }
    }
    
    return configs[platform] || configs.linux // Default to Linux config
  }

  /**
   * Create graceful fallbacks for limited environments
   * @returns {Object} Fallback configuration
   */
  static createFallbackConfig() {
    return {
      useColor: false,
      useUnicode: false,
      useEmoji: false,
      maxWidth: 80,
      indent: 2,
      useShortLabels: true,
      compactMode: true,
      wrapText: true,
      asciiOnly: true
    }
  }

  /**
   * Get optimal configuration for current environment
   * @param {Object} [overrides] - Configuration overrides
   * @returns {Object} Optimized terminal configuration
   */
  static getOptimalConfig(overrides = {}) {
    const capabilities = this.getCapabilities()
    const responsive = this.getResponsiveConfig()
    const platform = this.getPlatformConfig()
    
    // Use fallback config for limited environments
    if (this.isRunningInCI() && !getEnv('FORCE_COLOR')) {
      return {
        ...this.createFallbackConfig(),
        ...overrides
      }
    }
    
    return {
      // Color configuration
      useColor: capabilities.supportsColor && !getEnv('NO_COLOR'),
      colorLevel: capabilities.colorLevel,
      
      // Layout configuration
      ...responsive,
      
      // Feature support
      useUnicode: capabilities.supportsUnicode && responsive.useUnicode,
      useEmoji: capabilities.supportsEmoji,
      
      // Platform-specific
      platform: platform,
      
      // Apply any overrides
      ...overrides
    }
  }

  /**
   * Monitor terminal size changes (if supported)
   * @param {Function} callback - Callback function for size changes
   * @returns {Function} Cleanup function to stop monitoring
   */
  static monitorSize(callback) {
    if (!process.stdout.isTTY) {return () => {}} // No-op cleanup
    
    const handler = () => {
      const newCapabilities = this.getCapabilities()
      callback(newCapabilities)
    }
    
    process.stdout.on('resize', handler)
    
    return () => {
      process.stdout.removeListener('resize', handler)
    }
  }
}

module.exports = TerminalDetector