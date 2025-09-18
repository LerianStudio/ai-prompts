import fs from 'fs-extra'
import path from 'path'
import * as packageJson from '../../package.json'

interface DefaultsType {
  version: string
  timeout: number
  retries: number
  getDirectories: (sourceRoot: string) => Promise<string[]>
  discoverProtocolAssets: (sourceRoot: string) => Promise<string[]>
  getRootFiles: (sourceRoot: string) => Promise<string[]>
}

export const DEFAULTS: DefaultsType = {
  version: packageJson.version,
  timeout: 30000,
  retries: 3,

  async getDirectories(sourceRoot: string): Promise<string[]> {
    const baseDirectories = [
      '.claude',
      '.claude/agents',
      '.claude/commands',
      '.claude/hooks'
    ]
    const protocolDirs = await this.discoverProtocolAssets(sourceRoot)
    return [...baseDirectories, ...protocolDirs]
  },

  async discoverProtocolAssets(sourceRoot: string): Promise<string[]> {
    const directories: string[] = []

    // Check for protocol-assets directory structure
    const protocolAssetsPath = path.join(sourceRoot, 'protocol-assets')
    if (await fs.pathExists(protocolAssetsPath)) {
      directories.push('protocol-assets')

      // Add board services to protocol-assets
      const servicesPath = path.join(protocolAssetsPath, 'services')
      if (await fs.pathExists(servicesPath)) {
        directories.push('protocol-assets/services')

        // Add individual board services
        const boardServices = ['board-api', 'board-executor', 'board-ui', 'lib']
        for (const service of boardServices) {
          const servicePath = path.join(servicesPath, service)
          if (await fs.pathExists(servicePath)) {
            directories.push(`protocol-assets/services/${service}`)
          }
        }
      }

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
  },

  async getRootFiles(sourceRoot: string): Promise<string[]> {
    const files: string[] = []

    // Check for .mcp.json file
    const mcpJsonPath = path.join(sourceRoot, '.mcp.json')
    if (await fs.pathExists(mcpJsonPath)) {
      files.push('.mcp.json')
    }

    // Check for board management scripts
    const boardScripts = ['stop-board.sh']
    for (const script of boardScripts) {
      const scriptPath = path.join(sourceRoot, script)
      if (await fs.pathExists(scriptPath)) {
        files.push(script)
      }
    }

    // Check for git isolation template
    const gitTemplateFiles = ['.lerian-gitignore']
    for (const templateFile of gitTemplateFiles) {
      const templatePath = path.join(sourceRoot, templateFile)
      if (await fs.pathExists(templatePath)) {
        files.push(templateFile)
      }
    }

    return files
  }
}
