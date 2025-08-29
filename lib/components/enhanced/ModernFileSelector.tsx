import React, { useState, useEffect } from 'react'
import { Text, useFocus, useInput } from 'ink'
import { Select, Spinner, TextInput } from '@inkjs/ui'
import { Box } from '../core/Box.js'
import { colors, hexColors } from '../../design/colors.js'
import Gradient from 'ink-gradient'
import figures from 'figures'

interface FileItem {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  selected?: boolean
}

interface ModernFileSelectorProps {
  id: string
  files: FileItem[]
  onFileSelect?: (file: FileItem) => void
  onMultiSelect?: (files: FileItem[]) => void
  showPreview?: boolean
  enableSearch?: boolean
  multiSelect?: boolean
}

export const ModernFileSelector: React.FC<ModernFileSelectorProps> = ({
  id,
  files,
  onFileSelect,
  onMultiSelect,
  showPreview = false,
  enableSearch = true,
  multiSelect = false
}) => {
  const { isFocused } = useFocus({ id })
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState(files)

  // Filter files based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    } else {
      setFilteredFiles(files)
    }
  }, [searchQuery, files])

  // Handle keyboard shortcuts
  useInput((input, key) => {
    if (!isFocused) return

    if (key.ctrl && input === 'k') {
      setShowSearch(!showSearch)
    } else if (key.ctrl && input === 'a' && multiSelect) {
      const allSelected = filteredFiles.every(file => 
        selectedFiles.some(selected => selected.id === file.id)
      )
      
      if (allSelected) {
        setSelectedFiles([])
      } else {
        setSelectedFiles(filteredFiles)
      }
    }
  })

  const handleFileSelection = (fileId: string) => {
    const file = filteredFiles.find(f => f.id === fileId)
    if (!file) return

    if (multiSelect) {
      const isSelected = selectedFiles.some(f => f.id === file.id)
      let newSelection: FileItem[]
      
      if (isSelected) {
        newSelection = selectedFiles.filter(f => f.id !== file.id)
      } else {
        newSelection = [...selectedFiles, file]
      }
      
      setSelectedFiles(newSelection)
      onMultiSelect?.(newSelection)
    } else {
      onFileSelect?.(file)
    }
  }

  const formatFileOptions = () => {
    return filteredFiles.map(file => ({
      label: `${file.type === 'directory' ? '📁' : '📄'} ${file.name}`,
      value: file.id
    }))
  }

  return (
    <Box flexDirection="row" width="100%" height="100%">
      {/* Main File List Panel */}
      <Box
        borderStyle="round"
        borderColor={isFocused ? colors.primary : 'white'}
        borderDimColor={!isFocused}
        flexDirection="column"
        width={showPreview ? "60%" : "100%"}
      >
        {/* Header with search toggle */}
        <Box position="relative" marginTop={-1} marginLeft="1px">
          <Gradient name="morning">
            <Text bold color={isFocused ? colors.primary : 'white'}>
              {hexColors.primary(` Files ${showSearch ? '🔍' : ''} `)}
            </Text>
          </Gradient>
        </Box>

        {/* Search Input */}
        {showSearch && (
          <Box
            borderStyle="round"
            borderColor={isFocused ? colors.primary : 'white'}
            padding={1}
          >
            <TextInput
              placeholder="Search files..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </Box>
        )}

        {/* File List */}
        <Select
          visibleOptionCount={15}
          options={formatFileOptions()}
          isDisabled={!isFocused}
          onChange={handleFileSelection}
        />

        {/* Multi-select info */}
        {multiSelect && selectedFiles.length > 0 && (
          <Box borderStyle="single" padding={1}>
            <Text color={colors.primary}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </Text>
          </Box>
        )}
      </Box>

      {/* Preview Panel */}
      {showPreview && (
        <Box
          borderStyle="round"
          borderColor={colors.borderDim}
          flexDirection="column"
          width="40%"
          marginLeft={1}
        >
          <Box position="relative" marginTop={-1} marginLeft="1px">
            <Gradient name="morning">
              <Text bold color={colors.textDim}>
                {hexColors.primary(' Preview ')}
              </Text>
            </Gradient>
          </Box>
          <Box padding={2}>
            <Text color={colors.textDim}>
              File preview coming soon...
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}