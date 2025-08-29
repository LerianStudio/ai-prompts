/**
 * SimpleChangeDetector.js
 * A simplified file change detector that bypasses the complex traverseDirectory logic
 * This is a temporary solution to fix the hanging issue
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class SimpleChangeDetector extends EventEmitter {
  constructor(sourcePath, destinationPath, options = {}) {
    super();
    this.sourcePath = sourcePath;
    this.destinationPath = destinationPath;
    this.options = {
      includeDirectories: ['.claude', 'protocol-assets'],
      excludePatterns: ['node_modules/**', '.git/**', '.DS_Store', '*.log'],
      ...options
    };
  }

  async detectChanges() {
    console.log('🔍 Scanning for file changes...');
    console.log(`📂 Source path: ${this.sourcePath}`);
    console.log(`📂 Destination path: ${this.destinationPath}`);

    const changes = [];

    // Scan each include directory
    for (const includeDir of this.options.includeDirectories) {
      const sourceDir = path.join(this.sourcePath, includeDir);
      const destDir = path.join(this.destinationPath, includeDir);

      console.log(`🔄 Scanning ${includeDir}...`);

      try {
        const sourceFiles = await this.scanDirectorySimple(sourceDir);
        const destFiles = await this.scanDirectorySimple(destDir);

        // Find new and modified files
        for (const sourceFile of sourceFiles) {
          const relativePath = path.relative(this.sourcePath, sourceFile.fullPath);
          const destPath = path.join(this.destinationPath, relativePath);
          
          try {
            const destStat = await fs.stat(destPath);
            const sourceStat = await fs.stat(sourceFile.fullPath);
            
            // Check if modified (different mtime)
            if (sourceStat.mtime > destStat.mtime) {
              changes.push({
                changeType: 'modified',
                path: relativePath,
                sourceFile: sourceFile.fullPath,
                destFile: destPath,
                reason: `Source file is newer (${sourceStat.mtime.toISOString()} > ${destStat.mtime.toISOString()})`,
                confidence: 1.0
              });
            }
          } catch {
            // File doesn't exist in destination - it's new
            changes.push({
              changeType: 'new',
              path: relativePath,
              sourceFile: sourceFile.fullPath,
              destFile: null,
              reason: 'File does not exist in destination',
              confidence: 1.0
            });
          }
        }

        // Find deleted files (exist in dest but not in source)
        for (const destFile of destFiles) {
          const relativePath = path.relative(this.destinationPath, destFile.fullPath);
          const sourcePath = path.join(this.sourcePath, relativePath);
          
          try {
            await fs.stat(sourcePath);
            // File exists in both, already handled above
          } catch {
            // File doesn't exist in source - it's deleted
            changes.push({
              changeType: 'deleted',
              path: relativePath,
              sourceFile: null,
              destFile: destFile.fullPath,
              reason: 'File does not exist in source',
              confidence: 1.0
            });
          }
        }

      } catch (error) {
        console.warn(`Warning: Could not scan directory ${includeDir}: ${error.message}`);
      }
    }

    console.log(`📊 Found ${changes.length} changes`);
    if (changes.length > 0) {
      console.log('📝 Changes:', changes.map(c => `${c.changeType}: ${c.path}`).slice(0, 5));
    }

    // Return in expected format
    return {
      changes: changes,
      summary: {
        totalChanges: changes.length,
        new: changes.filter(c => c.changeType === 'new').length,
        modified: changes.filter(c => c.changeType === 'modified').length,
        deleted: changes.filter(c => c.changeType === 'deleted').length
      }
    };
  }

  async scanDirectorySimple(dirPath) {
    const files = [];
    
    try {
      await fs.access(dirPath);
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isFile() && !this.shouldExclude(entry.name)) {
          files.push({
            name: entry.name,
            fullPath: fullPath
          });
        } else if (entry.isDirectory() && !this.shouldExclude(entry.name)) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectorySimple(fullPath);
          files.push(...subFiles);
        }
      }
    } catch {
      // Directory doesn't exist or can't be accessed
      console.log(`ℹ️ Directory not accessible: ${dirPath}`);
    }
    
    return files;
  }

  shouldExclude(fileName) {
    return this.options.excludePatterns.some(pattern => {
      if (pattern.includes('**')) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(fileName);
      }
      return fileName === pattern || fileName.endsWith(pattern.replace('*', ''));
    });
  }
}

module.exports = SimpleChangeDetector;