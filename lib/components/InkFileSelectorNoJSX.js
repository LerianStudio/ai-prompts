/**
 * InkFileSelectorNoJSX.js
 * Ink-based file selector using React.createElement (no JSX)
 * 
 * This provides the modern Ink interface without requiring JSX transpilation,
 * perfect for CLI usage while maintaining the beautiful UI we built.
 */

const React = require('react');
const { render, Box, Text, useInput, useApp } = require('ink');
const SelectInput = require('ink-select-input').default;
const path = require('path');

const { createElement: h, useState } = React;

const InkFileSelector = ({ files, onSelect, onCancel }) => {
  const { exit } = useApp();
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Transform files for SelectInput
  const selectItems = files.map((file, index) => {
    const isSelected = selectedFiles.has(file);
    const checkbox = isSelected ? '[✓]' : '[ ]';
    const icon = getChangeIcon(file.changeType);
    const fileName = path.basename(file.path);
    
    return {
      label: `${checkbox} ${icon} ${fileName}`,
      value: file,
      key: index
    };
  });

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.escape || input === 'q') {
      if (onCancel) {onCancel();}
      exit();
    }

    switch (input) {
      case 'a':
        setSelectedFiles(new Set(files));
        break;
      case 'i': {
        const newSelection = new Set();
        files.forEach(file => {
          if (!selectedFiles.has(file)) {
            newSelection.add(file);
          }
        });
        setSelectedFiles(newSelection);
        break;
      }
      case 'c':
        setSelectedFiles(new Set());
        break;
    }
  });

  const handleFileSelect = (item) => {
    const file = item.value;
    const newSelection = new Set(selectedFiles);
    
    if (selectedFiles.has(file)) {
      newSelection.delete(file);
    } else {
      newSelection.add(file);
    }
    
    setSelectedFiles(newSelection);
    setCurrentIndex(files.findIndex(f => f === file));
  };

  const handleSubmit = () => {
    if (onSelect) {
      onSelect(Array.from(selectedFiles));
    }
    exit();
  };

  const currentFile = files[currentIndex] || null;

  return h(Box, { flexDirection: 'column' },
    // Header
    h(Text, { bold: true, color: 'cyan' }, '🎯 Interactive File Selector'),
    h(Text, { color: 'gray' }, `Selected: ${selectedFiles.size} / ${files.length}`),
    
    // Main file list
    h(Box, { marginTop: 1, flexGrow: 1 },
      files.length > 0 ? h(SelectInput, {
        items: selectItems,
        onSelect: handleFileSelect,
        onSubmit: handleSubmit,
        indicatorComponent: ({ isHighlighted }) => 
          h(Text, { color: isHighlighted ? 'cyan' : 'gray' }, 
            isHighlighted ? '→' : ' '
          )
      }) : h(Text, { color: 'yellow' }, 'No files to sync')
    ),

    // Current file preview
    currentFile ? h(Box, { 
      marginTop: 1, 
      paddingX: 1, 
      borderStyle: 'single', 
      borderColor: 'gray' 
    },
      h(Box, { flexDirection: 'column' },
        h(Box, {},
          h(Text, { color: 'gray' }, 'Path: '),
          h(Text, {}, currentFile.path)
        ),
        h(Box, {},
          h(Text, { color: 'gray' }, 'Type: '),
          h(Text, { color: getChangeTypeColor(currentFile.changeType) }, 
            `${getChangeIcon(currentFile.changeType)} ${currentFile.changeType.toUpperCase()}`
          )
        ),
        currentFile.reason ? h(Box, {},
          h(Text, { color: 'gray' }, 'Reason: '),
          h(Text, {}, currentFile.reason)
        ) : null
      )
    ) : null,

    // Footer
    h(Box, { 
      marginTop: 1, 
      paddingX: 1, 
      borderStyle: 'single', 
      borderColor: 'gray' 
    },
      h(Text, { dimColor: true }, 
        'Space/Enter: Toggle • Tab: Navigate • a: All • i: Invert • c: Clear • q: Cancel'
      )
    )
  );
};

function getChangeIcon(changeType) {
  const icons = {
    new: '🆕',
    modified: '📝',
    deleted: '🗑️',
    moved: '🔀'
  };
  return icons[changeType] || '❓';
}

function getChangeTypeColor(changeType) {
  const colors = {
    new: 'green',
    modified: 'yellow',
    deleted: 'red',
    moved: 'blue'
  };
  return colors[changeType] || 'white';
}

class InkFileSelectorApp {
  constructor(files, options = {}) {
    this.files = files || [];
    this.options = options;
  }

  async show() {
    return new Promise((resolve) => {
      let selectedFiles = [];

      const handleSelect = (files) => {
        selectedFiles = files;
      };

      const handleCancel = () => {
        selectedFiles = [];
      };

      const App = () => h(InkFileSelector, {
        files: this.files,
        onSelect: handleSelect,
        onCancel: handleCancel
      });

      const { unmount } = render(h(App));

      // Handle cleanup
      process.on('SIGINT', () => {
        unmount();
        resolve(selectedFiles);
      });

      // Auto-resolve after component exits
      setTimeout(() => {
        resolve(selectedFiles);
      }, 100);
    });
  }
}

module.exports = InkFileSelectorApp;