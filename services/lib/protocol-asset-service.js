/**
 * Protocol Asset Discovery Service
 * 
 * Handles the discovery and organization of protocol assets within the 
 * Lerian Protocol system. Responsible for scanning directories and 
 * building the complete asset structure for installation.
 * 
 * @module services/protocol-asset-service
 */

import fs from 'fs-extra'
import path from 'path'

class ProtocolAssetService {
  constructor() {
    this.baseDirectories = [
      '.claude',
      '.claude/agents',
      '.claude/commands',
      '.claude/hooks'
    ]
  }

  /**
   * Discovers and returns all directories required for installation
   * @param {string} sourceRoot - Root directory for protocol assets
   * @param {string} profile - Installation profile (frontend, backend)
   * @returns {Promise<string[]>} Array of directory paths to create
   */
  async getInstallationDirectories(sourceRoot, profile = null) {
    const protocolDirs = await this.discoverProtocolAssets(sourceRoot, profile)
    return [...this.baseDirectories, ...protocolDirs]
  }

  /**
   * Discovers protocol asset directories based on profile structure
   * @param {string} sourceRoot - Root directory containing protocol-assets
   * @param {string} profile - Installation profile (frontend, backend)
   * @returns {Promise<string[]>} Array of protocol asset directory paths
   */
  async discoverProtocolAssets(sourceRoot, profile = null) {
    const protocolAssetsPath = path.join(sourceRoot, 'protocol-assets')
    
    await this.validateProtocolAssetsPath(protocolAssetsPath)
    
    const directories = ['protocol-assets']
    
    if (profile) {
      await this.addSpecificProfileDirectories(protocolAssetsPath, profile, directories)
    } else {
      await this.addProfileDirectories(protocolAssetsPath, directories)
      
      this.addSystemDirectories(directories)
      
      await this.addLegacyDirectories(protocolAssetsPath, directories)
    }
    
    return directories
  }

  /**
   * Validates that the protocol assets path exists
   * @param {string} protocolAssetsPath - Path to protocol assets directory
   * @throws {Error} If protocol assets directory doesn't exist
   */
  async validateProtocolAssetsPath(protocolAssetsPath) {
    if (!(await fs.pathExists(protocolAssetsPath))) {
      throw new Error(
        'protocol-assets directory not found in source. ' +
        'This installation requires the current project structure.'
      )
    }
  }

  /**
   * Discovers and adds profile-specific directories
   * @param {string} protocolAssetsPath - Base protocol assets path
   * @param {string[]} directories - Directory list to modify
   */
  async addProfileDirectories(protocolAssetsPath, directories) {
    const profileDirs = await fs.readdir(protocolAssetsPath, { withFileTypes: true })
    const profiles = profileDirs
      .filter(dirent => dirent.isDirectory() && !['system', 'media'].includes(dirent.name))
      .map(dirent => dirent.name)
    
    for (const profile of profiles) {
      directories.push(`protocol-assets/${profile}`)
      await this.addProfileContentDirectories(protocolAssetsPath, profile, directories)
    }
  }

  /**
   * Adds directories for specific profile installation 
   * @param {string} protocolAssetsPath - Base protocol assets path
   * @param {string} profile - Profile name (frontend, backend)
   * @param {string[]} directories - Directory list to modify
   */
  async addSpecificProfileDirectories(protocolAssetsPath, profile, directories) {
    const modulesToInclude = this.getModulesForProfile(profile)
    
    for (const module of modulesToInclude) {
      const moduleSourceDir = path.join(protocolAssetsPath, module)
      if (await fs.pathExists(moduleSourceDir)) {
        directories.push(`protocol-assets/${module}`)
        await this.addProfileContentDirectories(protocolAssetsPath, module, directories)
      }
    }
  }

  /**
   * Gets the modules to include for a specific profile
   * @param {string} profile - Profile name (frontend, backend)
   * @returns {string[]} Array of module names
   */
  getModulesForProfile(profile) {
    switch (profile) {
      case 'frontend':
        return ['shared', 'frontend']
      case 'backend':
        return ['shared', 'backend']
      default:
        return ['shared', 'frontend']
    }
  }

  /**
   * Adds content directories for a specific profile
   * @param {string} protocolAssetsPath - Base protocol assets path
   * @param {string} profile - Profile name (frontend, backend, shared)
   * @param {string[]} directories - Directory list to modify
   */
  async addProfileContentDirectories(protocolAssetsPath, profile, directories) {
    const profileContentPath = path.join(protocolAssetsPath, profile, 'content')
    
    if (await fs.pathExists(profileContentPath)) {
      directories.push(`protocol-assets/${profile}/content`)
      
      const docsPath = path.join(profileContentPath, 'docs')
      const templatesPath = path.join(profileContentPath, 'templates')
      
      if (await fs.pathExists(docsPath)) {
        directories.push(`protocol-assets/${profile}/content/docs`)
      }
      
      if (await fs.pathExists(templatesPath)) {
        directories.push(`protocol-assets/${profile}/content/templates`)
      }
    }
  }

  /**
   * Adds system directories to the installation list
   * @param {string[]} directories - Directory list to modify
   */
  addSystemDirectories(directories) {
    directories.push(
      'protocol-assets/system',
      'protocol-assets/system/workflows'
    )
  }

  /**
   * Adds legacy directories if they exist (backwards compatibility)
   * @param {string} protocolAssetsPath - Base protocol assets path
   * @param {string[]} directories - Directory list to modify
   */
  async addLegacyDirectories(protocolAssetsPath, directories) {
    const legacyContentPath = path.join(protocolAssetsPath, 'content')
    
    if (await fs.pathExists(legacyContentPath)) {
      directories.push(
        'protocol-assets/content',
        'protocol-assets/content/docs',
        'protocol-assets/content/templates'
      )
    }
  }
}

export default ProtocolAssetService