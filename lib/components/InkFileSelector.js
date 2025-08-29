
import React, { useState, useEffect, useMemo } from 'react';
import { render, Box, Text, useInput, useApp, Spacer, Newline } from 'ink';
import MultiSelect from 'ink-multi-select';
import TextInput from 'ink-text-input';
import path from 'path';

const FilePreview = ({ file, width = 40 }) => {
  if (!file) {
    return (
      <Box width={width} borderStyle="round" borderColor="gray" padding={1}>
        <Text dimColor>No file selected</Text>
      </Box>
    );
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = (bytes / Math.pow(k, i));
    const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
    return formatted + ' ' + sizes[i];
  };

  const getChangeTypeColor = (changeType) => {
    const colors = {
      new: 'green',
      modified: 'yellow',
      deleted: 'red',
      moved: 'blue'
    };
    return colors[changeType] || 'white';
  };

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
    <Box width={width} borderStyle="round" borderColor="cyan" padding={1} flexDirection="column">
      <Text bold color="cyan">File Details</Text>
      <Text>─────────────────────</Text>
      
      <Box>
        <Text color="gray">Path: </Text>
        <Text>{path.basename(file.path)}</Text>
      </Box>
      
      <Box>
        <Text color="gray">Type: </Text>
        <Text color={getChangeTypeColor(file.changeType)}>
          {getChangeIcon(file.changeType)} {file.changeType.toUpperCase()}
        </Text>
      </Box>
      
      {file.sourceFile && (
        <>
          <Box>
            <Text color="gray">Size: </Text>
            <Text>{formatFileSize(file.sourceFile.size)}</Text>
          </Box>
          
          <Box>
            <Text color="gray">Modified: </Text>
            <Text>{new Date(file.sourceFile.mtime).toLocaleDateString()}</Text>
          </Box>
        </>
      )}
      
      {file.reason && (
        <>
          <Text>─────────────────────</Text>
          <Text color="gray">Reason:</Text>
          <Text wrap="wrap">{file.reason}</Text>
        </>
      )}
    </Box>
  );
};

const SearchBar = ({ searchQuery, setSearchQuery, isActive }) => {
  return (
    <Box>
      <Text color="yellow">Search: </Text>
      <Box borderStyle="single" borderColor={isActive ? 'cyan' : 'gray'} paddingX={1}>
        <TextInput 
          value={searchQuery} 
          onChange={setSearchQuery}
          placeholder="Type to filter files..."
        />
      </Box>
    </Box>
  );
};

const HelpScreen = ({ onClose }) => {
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'h' || input === '?') {
      onClose();
    }
  });

  return (
    <Box flexDirection="column" padding={2} borderStyle="double" borderColor="cyan">
      <Text bold color="cyan">🔍 Interactive File Selector - Help</Text>
      <Newline />
      
      <Text bold>Navigation:</Text>
      <Text>  ↑↓ / j,k     Move up/down</Text>
      <Text>  Page Up/Down Page navigation</Text>
      <Text>  Home/End     Go to first/last file</Text>
      <Newline />
      
      <Text bold>Selection:</Text>
      <Text>  Space        Toggle current file</Text>
      <Text>  Enter        Confirm selection</Text>
      <Text>  Esc / q      Cancel and exit</Text>
      <Newline />
      
      <Text bold>Bulk Operations:</Text>
      <Text>  a            Select all files</Text>
      <Text>  i            Invert selection</Text>
      <Text>  c            Clear selection</Text>
      <Text>  n            Toggle new files</Text>
      <Text>  m            Toggle modified files</Text>
      <Text>  d            Toggle deleted files</Text>
      <Newline />
      
      <Text bold>Other:</Text>
      <Text>  /            Enter search mode</Text>
      <Text>  ? / h        Show/hide this help</Text>
      <Newline />
      
      <Text dimColor>Press any key to close help...</Text>
    </Box>
  );
};

const StatusBar = ({ selectedCount, totalCount, filteredCount }) => {
  return (
    <Box>
      <Text color="gray">Selected: </Text>
      <Text color="green" bold>{selectedCount}</Text>
      <Text color="gray"> / </Text>
      <Text color="cyan">{totalCount}</Text>
      {filteredCount !== totalCount && (
        <>
          <Text color="gray"> (</Text>
          <Text color="yellow">{filteredCount}</Text>
          <Text color="gray"> shown after filtering)</Text>
        </>
      )}
    </Box>
  );
};

const InkFileSelector = ({ files, options = {} }) => {
  const { exit } = useApp();
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

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

      return {
        label: `${getChangeIcon(file.changeType)} ${path.basename(file.path)}`,
        value: file,
        key: file.index || index
      };
    });
  }, [filteredFiles]);

  const currentFile = filteredFiles[currentIndex] || null;
  const selectedCount = selectedFiles.size;
  const totalCount = files.length;
  const filteredCount = filteredFiles.length;

  useInput((input, key) => {
    if (showHelp) return;
    
    if (searchMode) {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery('');
      }
      return;
    }

    switch (input) {
      case '/':
        setSearchMode(true);
        break;
      case '?':
      case 'h':
        setShowHelp(true);
        break;
      case 'q':
        if (key.escape) {
          exit();
        }
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
      exit();
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

  const handleSelect = (items) => {
    setSelectedFiles(new Set(items));
  };

  const handleSubmit = (items) => {
    setConfirmed(true);
    setTimeout(() => {
      exit();
    }, 500);
  };

  if (showHelp) {
    return <HelpScreen onClose={() => setShowHelp(false)} />;
  }

  if (confirmed) {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Text bold color="green">✅ Files selected for sync:</Text>
        <Newline />
        {Array.from(selectedFiles).map((file, index) => {
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
            <Text key={index}>
              {getChangeIcon(file.changeType)} {file.path}
            </Text>
          );
        })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={process.stdout.rows - 2}>
      {/* Header */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">🎯 Interactive File Selector</Text>
        <StatusBar 
          selectedCount={selectedCount}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      </Box>

      {/* Search bar */}
      {searchMode && (
        <Box marginBottom={1}>
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isActive={searchMode}
          />
        </Box>
      )}

      {/* Main content area */}
      <Box flexGrow={1}>
        {/* File list */}
        <Box width="60%" marginRight={2}>
          {filteredFiles.length > 0 ? (
            <MultiSelect
              items={selectItems}
              selected={Array.from(selectedFiles)}
              onSelect={handleSelect}
              onSubmit={handleSubmit}
              indicatorComponent={({ isSelected }) => (
                <Text color={isSelected ? 'green' : 'gray'}>
                  {isSelected ? '●' : '○'}
                </Text>
              )}
              itemComponent={({ isHighlighted, item }) => (
                <Text
                  color={isHighlighted ? 'cyan' : 'white'}
                  backgroundColor={isHighlighted ? 'blue' : undefined}
                >
                  {item.label}
                </Text>
              )}
            />
          ) : (
            <Text color="yellow">No files match your search criteria</Text>
          )}
        </Box>

        {/* File preview */}
        <Box width="40%">
          <FilePreview file={currentFile} width={35} />
        </Box>
      </Box>

      {/* Footer */}
      <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
        <Text dimColor>
          Controls: ↑↓ Navigate • Space Toggle • Enter Confirm • Esc Cancel • / Search • ? Help
        </Text>
      </Box>
    </Box>
  );
};

export default InkFileSelector;