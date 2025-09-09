const fs = require('fs-extra')
const path = require('path')

const DEFAULTS = {
  version: require('../../package.json').version,
  timeout: 30000,
  retries: 3,
  getDirectories: async function (sourceRoot) {
    const baseDirectories = [
      '.claude',
      '.claude/agents',
      '.claude/commands',
      '.claude/hooks'
    ]
    const protocolDirs = await this.discoverProtocolAssets(sourceRoot)
    return [...baseDirectories, ...protocolDirs]
  },

  discoverProtocolAssets: async function (sourceRoot) {
    const directories = []

    // Check for legacy protocol-assets directory structure
    const protocolAssetsPath = path.join(sourceRoot, 'protocol-assets')
    if (await fs.pathExists(protocolAssetsPath)) {
      directories.push('protocol-assets')

      const profiles = ['frontend', 'backend', 'shared']
      for (const profile of profiles) {
        const profileDir = path.join(protocolAssetsPath, profile)
        if (await fs.pathExists(profileDir)) {
          directories.push(`protocol-assets/${profile}`)

          const entries = await fs.readdir(profileDir, { withFileTypes: true })
          for (const entry of entries) {
            if (entry.isDirectory()) {
              directories.push(`protocol-assets/${profile}/${entry.name}`)
            }
          }
        }
      }
    }

    // If no protocol assets found, return basic structure
    if (directories.length === 0) {
      console.warn(
        'No protocol assets found in source. Installing basic structure only.'
      )
    }

    return directories
  }
}

module.exports = { DEFAULTS }
