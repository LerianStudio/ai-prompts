const fs = require('fs-extra')
const path = require('path')

class FileManager {
  async getAvailableAgents(sourceRoot) {
    const agentsDir = path.join(sourceRoot, '.claude', 'agents')

    if (!(await fs.pathExists(agentsDir))) {
      return []
    }

    const files = await fs.readdir(agentsDir)
    return files
      .filter((file) => file.endsWith('.md') && file !== 'README.md')
      .map((file) => path.basename(file, '.md'))
  }
}

module.exports = new FileManager()
