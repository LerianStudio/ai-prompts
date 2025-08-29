
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp, Newline } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import path from 'path';

const InkFileSelectorApp = ({ files = [], onSelect, onCancel }) => {
  const { exit } = useApp();
  const [mode, setMode] = useState('select');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => 
      file.path.toLowerCase().includes(query) ||
      file.changeType.toLowerCase().includes(query) ||
      (file.reason && file.reason.toLowerCase().includes(query))
    );
  }, [files, searchQuery]);

  const selectItems = useMemo(() => {
    return filteredFiles.map((file, index) => {
      const getChangeIcon = (changeType) => {
        const icons = {
          new: '🆕',
          modified: '📝', 
          deleted: '🗑️',
          moved: '🔀'
        };
        return icons[changeType] || '❓';
      };

      const isSelected = selectedFiles.has(file);
      const checkbox = isSelected ? '[✓]' : '[ ]';
      const fileName = path.basename(file.path);
      
      return {
        label: `${checkbox} ${getChangeIcon(file.changeType)} ${fileName}`,
        value: file,
        key: file.index || index
      };
    });
  }, [filteredFiles, selectedFiles]);

  const currentFile = filteredFiles[currentIndex] || null;

  useInput((input, key) => {
    if (mode === 'search') {
      if (key.escape) {
        setMode('select');
        setSearchQuery('');
      }
      return;
    }

    if (mode === 'help') {
      setMode('select');
      return;
    }

    if (mode === 'confirm') {
      if (key.return) {
        if (onSelect) {
          onSelect(Array.from(selectedFiles));
        }
        exit();
      } else if (key.escape) {
        setMode('select');
      }
      return;
    }

    switch (input) {
      case '/':
        setMode('search');
        break;
      case '?':
      case 'h':
        setMode('help');
        break;
      case 'q':
        if (onCancel) onCancel();
        exit();
        break;
      case 'a':
        setSelectedFiles(new Set(filteredFiles));
        break;
      case 'i':
        const newSelection = new Set();
        filteredFiles.forEach(file => {
          if (!selectedFiles.has(file)) {
            newSelection.add(file);
          }
        });
        setSelectedFiles(newSelection);
        break;
      case 'c':
        setSelectedFiles(new Set());
        break;
      case 'n':
        toggleFilesByType('new');
        break;
      case 'm':
        toggleFilesByType('modified');
        break;
      case 'd':
        toggleFilesByType('deleted');
        break;
    }

    if (key.escape) {
      if (selectedFiles.size > 0) {
        setMode('confirm');
      } else {
        if (onCancel) onCancel();
        exit();
      }
    }
  });

  const toggleFilesByType = (changeType) => {
    const typeFiles = filteredFiles.filter(f => f.changeType === changeType);
    const newSelection = new Set(selectedFiles);
    
    const allSelected = typeFiles.every(file => selectedFiles.has(file));
    
    if (allSelected) {
      typeFiles.forEach(file => newSelection.delete(file));
    } else {
      typeFiles.forEach(file => newSelection.add(file));
    }
    
    setSelectedFiles(newSelection);
  };

  const handleFileSelect = (item) => {
    const file = item.value;
    const newSelection = new Set(selectedFiles);
    
    if (selectedFiles.has(file)) {
      newSelection.delete(file);
    } else {
      newSelection.add(file);
    }
    
    setSelectedFiles(newSelection);
  };

  const handleSubmit = () => {
    if (selectedFiles.size > 0) {
      setMode('confirm');
    } else {
      if (onCancel) onCancel();
      exit();
    }
  };

  if (mode === 'help') {
    return (
      <Box flexDirection="column" padding={1} borderStyle="double" borderColor="cyan">
        <Text bold color="cyan">🔍 Interactive File Selector - Help</Text>
        <Newline />
        <Text bold>Navigation:</Text>
        <Text>  ↑↓           Navigate files</Text>
        <Text>  Space        Toggle selection</Text>
        <Text>  Enter        Toggle selection</Text>
        <Text>  Esc          Confirm/Cancel</Text>
        <Newline />
        <Text bold>Bulk Operations:</Text>
        <Text>  a            Select all</Text>
        <Text>  i            Invert selection</Text>
        <Text>  c            Clear selection</Text>
        <Text>  n/m/d        Toggle New/Modified/Deleted</Text>
        <Newline />
        <Text bold>Other:</Text>
        <Text>  /            Search files</Text>
        <Text>  ? or h       Show this help</Text>
        <Text>  q            Quit without selecting</Text>
        <Newline />
        <Text dimColor>Press any key to return...</Text>
      </Box>
    );
  }

  if (mode === 'confirm') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">✅ Files selected for sync ({selectedFiles.size}):</Text>
        <Newline />
        {Array.from(selectedFiles).slice(0, 10).map((file, index) => {
          const getChangeIcon = (changeType) => {
            const icons = {
              new: '🆕',
              modified: '📝',
              deleted: '🗑️', 
              moved: '🔀'
            };
            return icons[changeType] || '❓';
          };
          
          return (
            <Text key={index} color="green">
              {getChangeIcon(file.changeType)} {file.path}
            </Text>
          );
        })}
        {selectedFiles.size > 10 && (
          <Text dimColor>... and {selectedFiles.size - 10} more</Text>
        )}
        <Newline />
        <Text bold color="yellow">Press Enter to confirm, Esc to go back</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">🎯 Interactive File Selector</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text color="gray">Selected: </Text>
        <Text color="green" bold>{selectedFiles.size}</Text>
        <Text color="gray"> / </Text>
        <Text color="cyan">{files.length}</Text>
        {filteredFiles.length !== files.length && (
          <>
            <Text color="gray"> (</Text>
            <Text color="yellow">{filteredFiles.length}</Text>
            <Text color="gray"> shown)</Text>
          </>
        )}
      </Box>

      {mode === 'search' && (
        <Box marginBottom={1} borderStyle="single" borderColor="yellow" paddingX={1}>
          <Text color="yellow">Search: </Text>
          <TextInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type to filter files..."
          />
          <Text dimColor> (Esc to cancel)</Text>
        </Box>
      )}

      <Box flexGrow={1}>
        {filteredFiles.length > 0 ? (
          <SelectInput
            items={selectItems}
            onSelect={handleFileSelect}
            onSubmit={handleSubmit}
            indicatorComponent={({ isHighlighted }) => (
              <Text color={isHighlighted ? 'cyan' : 'gray'}>
                {isHighlighted ? '→' : ' '}
              </Text>
            )}
            itemComponent={({ isHighlighted, label }) => (
              <Text color={isHighlighted ? 'cyan' : 'white'}>
                {label}
              </Text>
            )}
          />
        ) : (
          <Text color="yellow">No files match your search</Text>
        )}
      </Box>

      {currentFile && mode === 'select' && (
        <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
          <Box>
            <Text color="gray">Path: </Text>
            <Text>{currentFile.path}</Text>
          </Box>
          {currentFile.reason && (
            <Box>
              <Text color="gray">Reason: </Text>
              <Text>{currentFile.reason}</Text>
            </Box>
          )}
        </Box>
      )}

      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          Space/Enter: Toggle • Esc: {selectedFiles.size > 0 ? 'Confirm' : 'Cancel'} • /: Search • ?: Help • a/i/c: All/Invert/Clear
        </Text>
      </Box>
    </Box>
  );
};

export default InkFileSelectorApp;