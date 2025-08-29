
const { EventEmitter } = require('events');
const chalk = require('chalk');
const readline = require('readline');
const path = require('path');

class SimpleFileSelector extends EventEmitter {
  constructor(files, options = {}) {
    super();
    
    this.files = files.map((file, index) => ({
      ...file,
      index,
      selected: false
    }));
    
    this.currentIndex = 0;
    this.options = {
      maxDisplayFiles: options.maxDisplayFiles || 10,
      ...options
    };
    
    this.setupKeyboard();
  }

  setupKeyboard() {
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.on('keypress', this.handleKeypress.bind(this));
    }
  }

  async show() {
    return new Promise((resolve, reject) => {
      if (this.files.length === 0) {
        resolve([]);
        return;
      }

      this.render();

      this.on('confirm', (selectedFiles) => {
        this.cleanup();
        resolve(selectedFiles);
      });

      this.on('cancel', () => {
        this.cleanup();
        resolve([]);
      });

      this.on('error', (error) => {
        this.cleanup();
        reject(error);
      });
    });
  }

  handleKeypress(str, key) {
    if (!key) {return;}

    try {
      switch (key.name) {
        case 'up':
          this.navigateUp();
          break;
        case 'down':
          this.navigateDown();
          break;
        case 'space':
          this.toggleSelection();
          break;
        case 'return':
        case 'enter':
          this.confirmSelection();
          return;
        case 'a':
          this.selectAll();
          break;
        case 'c':
          this.clearSelection();
          break;
        case 'i':
          this.invertSelection();
          break;
        case 'escape':
        case 'q':
          this.emit('cancel');
          return;
      }

      this.render();
    } catch (error) {
      this.emit('error', error);
    }
  }

  navigateUp() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  navigateDown() {
    if (this.currentIndex < this.files.length - 1) {
      this.currentIndex++;
    }
  }

  toggleSelection() {
    if (this.currentIndex < this.files.length) {
      this.files[this.currentIndex].selected = !this.files[this.currentIndex].selected;
    }
  }

  selectAll() {
    this.files.forEach(file => (file.selected = true));
  }

  clearSelection() {
    this.files.forEach(file => (file.selected = false));
  }

  invertSelection() {
    this.files.forEach(file => (file.selected = !file.selected));
  }

  confirmSelection() {
    const selectedFiles = this.files.filter(file => file.selected);
    this.emit('confirm', selectedFiles);
  }

  render() {
    // Clear screen
    console.clear();

    const selectedCount = this.files.filter(f => f.selected).length;

    // Header
    console.log(chalk.bold.cyan('🎯 Interactive File Selector'));
    console.log(chalk.gray(`Selected: ${selectedCount} / ${this.files.length}`));
    console.log();

    // File list
    const startIndex = Math.max(0, this.currentIndex - Math.floor(this.options.maxDisplayFiles / 2));
    const endIndex = Math.min(this.files.length, startIndex + this.options.maxDisplayFiles);

    for (let i = startIndex; i < endIndex; i++) {
      const file = this.files[i];
      const isCurrent = i === this.currentIndex;
      const isSelected = file.selected;

      const checkbox = isSelected ? chalk.green('[✓]') : chalk.gray('[ ]');
      const icon = this.getChangeIcon(file.changeType);
      const fileName = path.basename(file.path);
      const cursor = isCurrent ? chalk.cyan('→ ') : '  ';

      let line = `${cursor}${checkbox} ${icon} ${fileName}`;

      if (isCurrent) {
        line = chalk.inverse(line);
      }

      console.log(line);
    }

    // Scroll indicator
    if (this.files.length > this.options.maxDisplayFiles) {
      console.log();
      console.log(chalk.gray(`Showing ${startIndex + 1}-${endIndex} of ${this.files.length} files`));
    }

    // Current file details
    if (this.files[this.currentIndex]) {
      const currentFile = this.files[this.currentIndex];
      console.log();
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan('File: ') + currentFile.path);
      console.log(chalk.cyan('Type: ') + this.getChangeTypeColor(currentFile.changeType) + currentFile.changeType.toUpperCase());
      if (currentFile.reason) {
        console.log(chalk.cyan('Reason: ') + currentFile.reason);
      }
    }

    // Footer
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.dim('↑↓: Navigate • Space: Toggle • Enter: Confirm • a: All • c: Clear • i: Invert • q: Cancel'));
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

  getChangeTypeColor(changeType) {
    const colors = {
      new: chalk.green,
      modified: chalk.yellow,
      deleted: chalk.red,
      moved: chalk.blue
    };
    return (colors[changeType] || chalk.white);
  }

  cleanup() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.removeAllListeners('keypress');
    
    // Ensure stdin is ready for the next operation
    process.stdin.pause();
  }
}

module.exports = SimpleFileSelector;