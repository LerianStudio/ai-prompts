/**
 * InkFileSelector.jsx
 * Modern Ink-based file selector (JSX source)
 *
 * This is the JSX source that gets transpiled to CommonJS for CLI usage.
 * This provides the beautiful modern interface we built to replace the broken TUI.
 */

import React, { useState, useEffect } from 'react'
import { render, Box, Text, useInput, useApp } from 'ink'
import SelectInput from 'ink-select-input'
import path from 'path'

const InkFileSelector = ({ files, onComplete }) => {
  const { exit } = useApp()
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)

  // Transform files for SelectInput
  const selectItems = files.map((file, index) => {
    const isSelected = selectedFiles.has(file)
    const checkbox = isSelected ? '[✓]' : '[ ]'
    const icon = getChangeIcon(file.changeType)
    const fileName = path.basename(file.path)

    return {
      label: `${checkbox} ${icon} ${fileName}`,
      value: file,
      key: index
    }
  })

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.escape || input === 'q') {
      handleComplete([])
      return
    }

    switch (input) {
      case 'a':
        setSelectedFiles(new Set(files))
        break
      case 'i':
        const newSelection = new Set()
        files.forEach((file) => {
          if (!selectedFiles.has(file)) {
            newSelection.add(file)
          }
        })
        setSelectedFiles(newSelection)
        break
      case 'c':
        setSelectedFiles(new Set())
        break
    }
  })

  const handleFileSelect = (item) => {
    const file = item.value
    const newSelection = new Set(selectedFiles)

    if (selectedFiles.has(file)) {
      newSelection.delete(file)
    } else {
      newSelection.add(file)
    }

    setSelectedFiles(newSelection)
    setCurrentIndex(files.findIndex((f) => f === file))
  }

  const handleSubmit = () => {
    handleComplete(Array.from(selectedFiles))
  }

  const handleComplete = (selected) => {
    if (onComplete) {
      onComplete(selected)
    }
    exit()
  }

  const currentFile = files[currentIndex] || null

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        🎯 Interactive File Selector
      </Text>
      <Text color="gray">
        Selected: {selectedFiles.size} / {files.length}
      </Text>

      <Box marginTop={1} flexGrow={1}>
        {files.length > 0 ? (
          <SelectInput
            items={selectItems}
            onSelect={handleFileSelect}
            onSubmit={handleSubmit}
            indicatorComponent={({ isHighlighted }) => (
              <Text color={isHighlighted ? 'cyan' : 'gray'}>
                {isHighlighted ? '→' : ' '}
              </Text>
            )}
          />
        ) : (
          <Text color="yellow">No files to sync</Text>
        )}
      </Box>

      {currentFile && (
        <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
          <Box flexDirection="column">
            <Box>
              <Text color="gray">Path: </Text>
              <Text>{currentFile.path}</Text>
            </Box>
            <Box>
              <Text color="gray">Type: </Text>
              <Text color={getChangeTypeColor(currentFile.changeType)}>
                {getChangeIcon(currentFile.changeType)}{' '}
                {currentFile.changeType.toUpperCase()}
              </Text>
            </Box>
            {currentFile.reason && (
              <Box>
                <Text color="gray">Reason: </Text>
                <Text>{currentFile.reason}</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          Space/Enter: Toggle • a: All • i: Invert • c: Clear • q: Cancel
        </Text>
      </Box>
    </Box>
  )
}

function getChangeIcon(changeType) {
  const icons = {
    new: '🆕',
    modified: '📝',
    deleted: '🗑️',
    moved: '🔀'
  }
  return icons[changeType] || '❓'
}

function getChangeTypeColor(changeType) {
  const colors = {
    new: 'green',
    modified: 'yellow',
    deleted: 'red',
    moved: 'blue'
  }
  return colors[changeType] || 'white'
}

class InkFileSelectorApp {
  constructor(files, options = {}) {
    this.files = files || []
    this.options = options
  }

  async show() {
    return new Promise((resolve) => {
      let selectedFiles = []

      const App = () => (
        <InkFileSelector
          files={this.files}
          onComplete={(selected) => {
            selectedFiles = selected
            resolve(selectedFiles)
          }}
        />
      )

      render(<App />)
    })
  }
}

export default InkFileSelectorApp
