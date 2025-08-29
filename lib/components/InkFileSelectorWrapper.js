/**
 * InkFileSelectorWrapper.js
 * CommonJS wrapper for ESM Ink file selector
 * 
 * This wrapper dynamically imports the ESM Ink selector to avoid 
 * CommonJS/ESM compatibility issues while maintaining the modern Ink interface
 */

const path = require('path');

class InkFileSelectorApp {
  constructor(files, options = {}) {
    this.files = files || [];
    this.options = options;
  }

  async show() {
    // Check if we're in an environment that supports raw mode for Ink
    const supportsRawMode = process.stdin.isTTY && process.stdin.setRawMode;
    
    if (!supportsRawMode) {
      console.log('ℹ️ Raw mode not supported, using simple interface...');
      const SimpleFileSelector = require('./SimpleFileSelector');
      const selector = new SimpleFileSelector(this.files, this.options);
      return await selector.show();
    }

    try {
      // Dynamically import the working ESM Ink demo
      const workingDemoPath = path.join(__dirname, '../../demo/working-ink-demo.mjs');
      
      // Use dynamic import to load ESM module from CommonJS
      const { runFileSelector } = await import(`file://${workingDemoPath}`);
      
      // Convert files to format expected by demo
      const demoFiles = this.files.map(file => ({
        name: path.basename(file.path),
        icon: this.getChangeIcon(file.changeType),
        path: file.path,
        changeType: file.changeType,
        reason: file.reason,
        originalFile: file
      }));

      console.log('🎯 Using modern Ink interface...');
      
      return new Promise((resolve, reject) => {
        // Set a timeout to detect if Ink interface hangs or crashes
        const timeout = setTimeout(() => {
          reject(new Error('Ink interface timeout - falling back to simple selector'));
        }, 30000); // 30 second timeout
        
        try {
          runFileSelector(demoFiles, (selected) => {
            clearTimeout(timeout);
            // Convert back to original file objects
            const originalFiles = selected.map(file => file.originalFile || file);
            resolve(originalFiles);
          });
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });

    } catch {
      console.log('ℹ️ Falling back to simple interface...');
      
      // Fall back to simple selection
      const SimpleFileSelector = require('./SimpleFileSelector');
      const selector = new SimpleFileSelector(this.files, this.options);
      return await selector.show();
    }
  }

  getChangeIcon(changeType) {
    const icons = {
      new: '🆕',
      modified: '📝', 
      deleted: '🗑️',
      moved: '🔀'
    };
    return icons[changeType] || '❓';
  }
}

module.exports = InkFileSelectorApp;