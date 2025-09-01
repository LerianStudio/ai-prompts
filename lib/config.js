const path = require('path')
const fs = require('fs-extra')

class ConfigManager {
  constructor() {
    this.configPath = process.cwd()
  }

  async getEnvironmentConfig() {
    const config = {
      cli: {
        debugMode: process.env.DEBUG === 'true' || process.argv.includes('--debug')
      },
      paths: {
        claude: path.join(this.configPath, '.claude'),
        protocolAssets: path.join(this.configPath, 'protocol-assets')
      }
    }
    
    return config
  }

  async validate() {
    const claudeExists = await fs.pathExists(path.join(this.configPath, '.claude'))
    const protocolExists = await fs.pathExists(path.join(this.configPath, 'protocol-assets'))
    
    return {
      claudeDirectory: claudeExists,
      protocolAssetsDirectory: protocolExists
    }
  }
}

module.exports = ConfigManager