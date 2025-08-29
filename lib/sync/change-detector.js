const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

class ChangeDetector {
  constructor() {
    this.syncDirectories = [
      '.claude/agents',
      '.claude/commands', 
      '.claude/hooks',
      'protocol-assets'
    ]
  }

  async detectChanges(projectPath, sourcePath) {
    const changes = {
      new: [],
      modified: [],
      unchanged: []
    }

    for (const dir of this.syncDirectories) {
      const projectDir = path.join(projectPath, dir)
      const sourceDir = path.join(sourcePath, dir)
      
      if (await fs.pathExists(projectDir)) {
        const dirChanges = await this.compareDirectories(projectDir, sourceDir, dir)
        changes.new.push(...dirChanges.new)
        changes.modified.push(...dirChanges.modified)
        changes.unchanged.push(...dirChanges.unchanged)
      }
    }

    return changes
  }

  /**
   * Compare two directories recursively
   * @param {string} projectDir - Project directory path
   * @param {string} sourceDir - Source directory path  
   * @param {string} relativePath - Relative path for display
   */
  async compareDirectories(projectDir, sourceDir, relativePath) {
    const changes = {
      new: [],
      modified: [],
      unchanged: []
    }

    const projectFiles = await this.getAllFiles(projectDir)
    
    for (const file of projectFiles) {
      const relativeFilePath = path.relative(projectDir, file)
      const sourceFile = path.join(sourceDir, relativeFilePath)
      const displayPath = path.join(relativePath, relativeFilePath)
      
      const fileInfo = {
        projectPath: file,
        sourcePath: sourceFile,
        relativePath: relativeFilePath,
        displayPath: displayPath
      }

      if (!(await fs.pathExists(sourceFile))) {
        changes.new.push(fileInfo)
      } else {
        const isModified = await this.filesAreDifferent(file, sourceFile)
        if (isModified) {
          changes.modified.push(fileInfo)
        } else {
          changes.unchanged.push(fileInfo)
        }
      }
    }

    return changes
  }

  /**
   * Get all files recursively from a directory
   * @param {string} dirPath - Directory path
   */
  async getAllFiles(dirPath) {
    const files = []
    
    if (!(await fs.pathExists(dirPath))) {
      return files
    }

    const scan = async (currentDir) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) {continue} // Skip hidden files
        
        const fullPath = path.join(currentDir, entry.name)
        
        if (entry.isDirectory()) {
          await scan(fullPath)
        } else if (entry.isFile()) {
          files.push(fullPath)
        }
      }
    }
    
    await scan(dirPath)
    return files
  }

  /**
   * Check if two files are different
   * @param {string} file1 - First file path
   * @param {string} file2 - Second file path
   */
  async filesAreDifferent(file1, file2) {
    try {
      const [content1, content2] = await Promise.all([
        fs.readFile(file1),
        fs.readFile(file2)
      ])
      
      const hash1 = crypto.createHash('sha256').update(content1).digest('hex')
      const hash2 = crypto.createHash('sha256').update(content2).digest('hex')
      
      return hash1 !== hash2
    } catch {
      // If we can't read one of the files, assume they're different
      return true
    }
  }

  /**
   * Filter changes by user selection
   * @param {Object} changes - All detected changes
   * @param {Array} selectedFiles - Array of display paths selected by user
   */
  filterSelectedChanges(changes, selectedFiles) {
    const selectedSet = new Set(selectedFiles)
    
    return {
      new: changes.new.filter(file => selectedSet.has(file.displayPath)),
      modified: changes.modified.filter(file => selectedSet.has(file.displayPath))
    }
  }
}

module.exports = ChangeDetector