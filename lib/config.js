const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const chalk = require('chalk')

/**
 * Configuration management for Lerian Protocol
 * 
 * Features:
 * - User-level and project-level configuration
 * - Default configuration with overrides
 * - Configuration validation
 * - Environment variable support
 * - Configuration migration
 */
class ConfigManager {
  constructor() {
    this.configFileName = '.lerian-config.json'
    this.globalConfigDir = path.join(os.homedir(), '.lerian')
    this.globalConfigPath = path.join(this.globalConfigDir, 'config.json')
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration object
   */
  getDefaults() {
    return {
      // CLI behavior
      cli: {
        useColor: true,
        useUnicode: true,
        useEmoji: true,
        compactMode: false,
        debugMode: false
      },
      
      // Sync behavior
      sync: {
        defaultDryRun: false,
        includeHidden: false,
        excludePatterns: [
          'node_modules',
          '.git',
          'dist',
          'build',
          '*.log',
          '.DS_Store',
          'Thumbs.db'
        ],
        confirmDestructive: true,
        backupBeforeSync: true
      },
      
      // Terminal preferences
      terminal: {
        preferredWidth: null, // null = auto-detect
        forceColor: null,     // null = auto-detect
        forcePlainText: false
      },
      
      // Advanced options
      advanced: {
        maxConcurrentOperations: 5,
        operationTimeout: 30000,
        retryAttempts: 3,
        verboseLogging: false
      },
      
      // Version tracking
      version: '0.1.0',
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Load configuration from all sources
   * @param {string} [projectPath] - Project directory path
   * @returns {Promise<Object>} Merged configuration
   */
  async loadConfig(projectPath = null) {
    const defaults = this.getDefaults()
    let config = { ...defaults }
    
    try {
      // Load global configuration
      const globalConfig = await this.loadGlobalConfig()
      if (globalConfig) {
        config = this.mergeConfig(config, globalConfig)
      }
      
      // Load project-level configuration
      if (projectPath) {
        const projectConfig = await this.loadProjectConfig(projectPath)
        if (projectConfig) {
          config = this.mergeConfig(config, projectConfig)
        }
      }
      
      // Apply environment variable overrides
      config = this.applyEnvironmentOverrides(config)
      
      // Validate final configuration
      this.validateConfig(config)
      
      return config
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Configuration loading failed: ${error.message}`))
      return defaults
    }
  }

  /**
   * Load global user configuration
   * @returns {Promise<Object|null>} Global configuration or null
   */
  async loadGlobalConfig() {
    try {
      if (await fs.pathExists(this.globalConfigPath)) {
        const config = await fs.readJson(this.globalConfigPath)
        return config
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Could not load global config: ${error.message}`))
    }
    return null
  }

  /**
   * Load project-level configuration
   * @param {string} projectPath - Project directory path
   * @returns {Promise<Object|null>} Project configuration or null
   */
  async loadProjectConfig(projectPath) {
    try {
      const configPath = path.join(projectPath, this.configFileName)
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath)
        return config
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Could not load project config: ${error.message}`))
    }
    return null
  }

  /**
   * Save global configuration
   * @param {Object} config - Configuration to save
   * @returns {Promise<boolean>} Success status
   */
  async saveGlobalConfig(config) {
    try {
      await fs.ensureDir(this.globalConfigDir)
      
      const configToSave = {
        ...config,
        lastUpdated: new Date().toISOString()
      }
      
      await fs.writeJson(this.globalConfigPath, configToSave, { spaces: 2 })
      return true
    } catch (error) {
      console.error(chalk.red(`❌ Failed to save global config: ${error.message}`))
      return false
    }
  }

  /**
   * Save project-level configuration
   * @param {string} projectPath - Project directory path
   * @param {Object} config - Configuration to save
   * @returns {Promise<boolean>} Success status
   */
  async saveProjectConfig(projectPath, config) {
    try {
      const configPath = path.join(projectPath, this.configFileName)
      
      const configToSave = {
        ...config,
        lastUpdated: new Date().toISOString()
      }
      
      await fs.writeJson(configPath, configToSave, { spaces: 2 })
      return true
    } catch (error) {
      console.error(chalk.red(`❌ Failed to save project config: ${error.message}`))
      return false
    }
  }

  /**
   * Merge configuration objects with deep merging for nested objects
   * @param {Object} base - Base configuration
   * @param {Object} override - Override configuration
   * @returns {Object} Merged configuration
   */
  mergeConfig(base, override) {
    const result = { ...base }
    
    for (const [key, value] of Object.entries(override)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.mergeConfig(result[key] || {}, value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }

  /**
   * Apply environment variable overrides to configuration
   * @param {Object} config - Base configuration
   * @returns {Object} Configuration with environment overrides
   */
  applyEnvironmentOverrides(config) {
    const envOverrides = {}
    
    // Color settings
    if (process.env.FORCE_COLOR) {
      envOverrides.cli = { ...envOverrides.cli, useColor: true }
      envOverrides.terminal = { ...envOverrides.terminal, forceColor: true }
    }
    
    if (process.env.NO_COLOR) {
      envOverrides.cli = { ...envOverrides.cli, useColor: false }
      envOverrides.terminal = { ...envOverrides.terminal, forceColor: false }
    }
    
    // Unicode/emoji settings
    if (process.env.NO_UNICODE) {
      envOverrides.cli = { ...envOverrides.cli, useUnicode: false }
    }
    
    if (process.env.NO_EMOJI) {
      envOverrides.cli = { ...envOverrides.cli, useEmoji: false }
    }
    
    // Debug mode
    if (process.env.LERIAN_DEBUG) {
      envOverrides.cli = { ...envOverrides.cli, debugMode: true }
      envOverrides.advanced = { ...envOverrides.advanced, verboseLogging: true }
    }
    
    // Dry run mode
    if (process.env.LERIAN_DRY_RUN) {
      envOverrides.sync = { ...envOverrides.sync, defaultDryRun: true }
    }
    
    return this.mergeConfig(config, envOverrides)
  }

  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfig(config) {
    // Check required top-level keys
    const requiredKeys = ['cli', 'sync', 'terminal', 'advanced']
    for (const key of requiredKeys) {
      if (!config[key] || typeof config[key] !== 'object') {
        throw new Error(`Missing or invalid configuration section: ${key}`)
      }
    }
    
    // Validate specific values
    if (config.advanced.maxConcurrentOperations < 1 || config.advanced.maxConcurrentOperations > 20) {
      throw new Error('maxConcurrentOperations must be between 1 and 20')
    }
    
    if (config.advanced.operationTimeout < 1000 || config.advanced.operationTimeout > 300000) {
      throw new Error('operationTimeout must be between 1000ms and 300000ms')
    }
    
    if (config.advanced.retryAttempts < 0 || config.advanced.retryAttempts > 10) {
      throw new Error('retryAttempts must be between 0 and 10')
    }
    
    // Validate exclude patterns array
    if (!Array.isArray(config.sync.excludePatterns)) {
      throw new Error('sync.excludePatterns must be an array')
    }
    
    return true
  }

  /**
   * Get configuration for current environment
   * @param {string} [projectPath] - Project path override
   * @returns {Promise<Object>} Environment-specific configuration
   */
  async getEnvironmentConfig(projectPath = null) {
    const currentDir = projectPath || process.cwd()
    return await this.loadConfig(currentDir)
  }

  /**
   * Initialize configuration for a new project
   * @param {string} projectPath - Project directory path
   * @param {Object} [overrides] - Configuration overrides
   * @returns {Promise<boolean>} Success status
   */
  async initProjectConfig(projectPath, overrides = {}) {
    const defaults = this.getDefaults()
    const config = this.mergeConfig(defaults, overrides)
    
    return await this.saveProjectConfig(projectPath, config)
  }

  /**
   * Get configuration paths for debugging
   * @returns {Object} Configuration file paths
   */
  getConfigPaths() {
    return {
      global: this.globalConfigPath,
      globalDir: this.globalConfigDir,
      projectFile: this.configFileName
    }
  }
}

module.exports = ConfigManager