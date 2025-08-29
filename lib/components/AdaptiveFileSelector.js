
const fs = require('fs');

class AdaptiveFileSelector {
  constructor(files, options = {}) {
    this.files = files || [];
    this.options = options;
  }

  async show() {
    try {
      const InkSelector = await this.tryInkInterface();
      if (InkSelector) {
        console.log('🎯 Using modern Ink interface...');
        const selector = new InkSelector(this.files, this.options);
        return await selector.show();
      }
    } catch {
      console.log('ℹ️ Falling back to simple interface...');
    }

    const SimpleFileSelector = require('./SimpleFileSelector');
    const selector = new SimpleFileSelector(this.files, this.options);
    return await selector.show();
  }

  async tryInkInterface() {
    try {
      const inkModule = require('ink');
      const selectModule = require('ink-select-input');
      
      if (inkModule && selectModule) {
        const workingDemoPath = require('path').join(__dirname, '../../demo/working-ink-demo.mjs');
        if (fs.existsSync(workingDemoPath)) {
          return require('./InkFileSelectorWrapper');
        }
      }
    } catch {
      return null;
    }
    
    return null;
  }
}

module.exports = AdaptiveFileSelector;