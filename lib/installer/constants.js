const fs = require('fs-extra')
const path = require('path')

const DEFAULTS = {
  version: require('../../package.json').version,
  timeout: 30000,
  retries: 3,
  getDirectories: async function(sourceRoot) {
    const baseDirectories = [
      '.claude',
      '.claude/agents',
      '.claude/commands',
      '.claude/hooks'
    ]
    const protocolDirs = await this.discoverProtocolAssets(sourceRoot)
    return [...baseDirectories, ...protocolDirs]
  },
  
  discoverProtocolAssets: async function(sourceRoot) {
    const protocolAssetsPath = path.join(sourceRoot, 'protocol-assets')
    if (!(await fs.pathExists(protocolAssetsPath))) {
      throw new Error('protocol-assets directory not found in source. This installation requires the current project structure.')
    }
    
    return [
      'protocol-assets',
      'protocol-assets/content',
      'protocol-assets/content/docs', 
      'protocol-assets/content/templates',
      'protocol-assets/system',
      'protocol-assets/system/board',
      'protocol-assets/system/workflows'
    ]
  }
}

module.exports = { DEFAULTS }