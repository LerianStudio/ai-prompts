/**
 * Enhanced File Selector
 * Modern file selector with virtualization, search, and improved UX
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Box } from 'ink'
import { useInput, useApp } from 'ink'
import { Text, Heading } from '../core/Typography'
import { VStack, HStack, Spacer } from '../core/Stack'
import { FileItem, FileSelectorProps, KeyPressEvent } from '../../types'
import { colors, animations } from '../../design'

// Virtualization configuration
const ITEM_HEIGHT = 1
const VISIBLE_ITEMS = 10
const SCROLL_BUFFER = 5

// Search and filter state
interface SearchState {
  query: string
  active: boolean
  results: FileItem[]
}

interface SelectionState {
  selected: Set<string>
  highlighted: number
  lastSelected?: string
}

/**
 * Enhanced File Selector with modern features
 */
export const EnhancedFileSelector: React.FC<FileSelectorProps> = ({
  files,
  multiSelect = true,
  searchable = true,
  virtualized = true,
  showPreview = false,
  filterTypes,
  sortBy = 'name',
  sortOrder = 'asc',
  onSelectionChange,
  onFileSelect,
  onFilePreview,
  ...props
}) => {
  const { exit } = useApp()
  
  // State management
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    active: false,
    results: []
  })
  
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selected: new Set(),
    highlighted: 0
  })
  
  const [viewportStart, setViewportStart] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Refs for managing focus and scroll
  const containerRef = useRef<HTMLElement>()
  const searchInputRef = useRef<string>('')
  
  // Process and filter files
  const processedFiles = useMemo(() => {
    let result = [...files]
    
    // Apply type filters
    if (filterTypes && filterTypes.length > 0) {
      result = result.filter(file => {
        const extension = file.path.split('.').pop()?.toLowerCase()
        return extension ? filterTypes.includes(extension) : file.type === 'directory'
      })
    }
    
    // Apply search filter
    if (searchState.query) {
      const query = searchState.query.toLowerCase()
      result = result.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.path.toLowerCase().includes(query) ||
        (file.changeType && file.changeType.toLowerCase().includes(query))
      )
    }
    
    // Sort files
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = (a.size || 0) - (b.size || 0)
          break
        case 'modified':
          comparison = (a.modified?.getTime() || 0) - (b.modified?.getTime() || 0)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return result.map((file, index) => ({
      ...file,
      isSelected: selectionState.selected.has(file.path),
      isHighlighted: index === selectionState.highlighted,
      isVisible: !virtualized || (
        index >= viewportStart && 
        index < viewportStart + VISIBLE_ITEMS + SCROLL_BUFFER
      )
    }))
  }, [files, filterTypes, searchState.query, sortBy, sortOrder, selectionState, viewportStart, virtualized])
  
  // Virtualized viewport
  const visibleFiles = useMemo(() => {
    if (!virtualized) return processedFiles
    
    const start = Math.max(0, viewportStart - SCROLL_BUFFER)
    const end = Math.min(processedFiles.length, viewportStart + VISIBLE_ITEMS + SCROLL_BUFFER * 2)
    
    return processedFiles.slice(start, end).map((file, index) => ({
      ...file,
      virtualIndex: start + index
    }))
  }, [processedFiles, viewportStart, virtualized])
  
  // Scroll management
  const ensureVisible = useCallback((index: number) => {
    if (!virtualized) return
    
    const buffer = 2
    if (index < viewportStart + buffer) {
      setViewportStart(Math.max(0, index - buffer))
    } else if (index >= viewportStart + VISIBLE_ITEMS - buffer) {
      setViewportStart(Math.max(0, index - VISIBLE_ITEMS + buffer + 1))
    }
  }, [viewportStart, virtualized])
  
  // Selection management
  const toggleSelection = useCallback((filePath: string, additive = false) => {
    setSelectionState(prev => {
      const newSelected = new Set(prev.selected)
      
      if (!multiSelect && !additive) {
        newSelected.clear()
      }
      
      if (newSelected.has(filePath)) {
        newSelected.delete(filePath)
      } else {
        newSelected.add(filePath)
      }
      
      const selectedFiles = processedFiles.filter(file => newSelected.has(file.path))
      onSelectionChange?.(selectedFiles)
      
      return {
        ...prev,
        selected: newSelected,
        lastSelected: filePath
      }
    })
  }, [multiSelect, processedFiles, onSelectionChange])
  
  const selectRange = useCallback((fromPath: string, toPath: string) => {
    if (!multiSelect) return
    
    const fromIndex = processedFiles.findIndex(f => f.path === fromPath)
    const toIndex = processedFiles.findIndex(f => f.path === toPath)
    
    if (fromIndex === -1 || toIndex === -1) return
    
    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    
    setSelectionState(prev => {
      const newSelected = new Set(prev.selected)
      
      for (let i = start; i <= end; i++) {
        newSelected.add(processedFiles[i].path)
      }
      
      const selectedFiles = processedFiles.filter(file => newSelected.has(file.path))
      onSelectionChange?.(selectedFiles)
      
      return {
        ...prev,
        selected: newSelected
      }
    })
  }, [multiSelect, processedFiles, onSelectionChange])
  
  // Navigation
  const moveSelection = useCallback((direction: 'up' | 'down', step = 1) => {
    setSelectionState(prev => {
      const newHighlighted = direction === 'up' 
        ? Math.max(0, prev.highlighted - step)
        : Math.min(processedFiles.length - 1, prev.highlighted + step)
      
      ensureVisible(newHighlighted)
      
      return {
        ...prev,
        highlighted: newHighlighted
      }
    })
  }, [processedFiles.length, ensureVisible])
  
  // Search functionality
  const updateSearch = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      results: []
    }))
    
    // Reset selection when searching
    setSelectionState(prev => ({
      ...prev,
      highlighted: 0
    }))
    
    setViewportStart(0)
  }, [])
  
  const toggleSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      active: !prev.active,
      query: prev.active ? '' : prev.query
    }))
  }, [])
  
  // Bulk operations
  const selectAll = useCallback(() => {
    if (!multiSelect) return
    
    const allPaths = new Set(processedFiles.map(f => f.path))
    setSelectionState(prev => ({
      ...prev,
      selected: allPaths
    }))
    
    onSelectionChange?.(processedFiles)
  }, [multiSelect, processedFiles, onSelectionChange])
  
  const selectNone = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selected: new Set()
    }))
    
    onSelectionChange?.([])
  }, [onSelectionChange])
  
  const invertSelection = useCallback(() => {
    if (!multiSelect) return
    
    setSelectionState(prev => {
      const newSelected = new Set<string>()
      
      processedFiles.forEach(file => {
        if (!prev.selected.has(file.path)) {
          newSelected.add(file.path)
        }
      })
      
      const selectedFiles = processedFiles.filter(file => newSelected.has(file.path))
      onSelectionChange?.(selectedFiles)
      
      return {
        ...prev,
        selected: newSelected
      }
    })
  }, [multiSelect, processedFiles, onSelectionChange])
  
  // Keyboard handling
  useInput((input, key) => {
    // Handle search input
    if (searchState.active) {
      if (key.escape) {
        toggleSearch()
      } else if (key.return) {
        setSearchState(prev => ({ ...prev, active: false }))
      } else if (key.backspace || key.delete) {
        updateSearch(searchState.query.slice(0, -1))
      } else if (input && input.length === 1 && /[a-zA-Z0-9\s\-_.]/.test(input)) {
        updateSearch(searchState.query + input)
      }
      return
    }
    
    // Handle help overlay
    if (showHelp) {
      setShowHelp(false)
      return
    }
    
    // Global shortcuts
    switch (input) {
      case '/':
        if (searchable) toggleSearch()
        break
      case '?':
      case 'h':
        setShowHelp(true)
        break
      case 'q':
        exit()
        break
      case 'a':
        selectAll()
        break
      case 'i':
        invertSelection()
        break
      case 'c':
        selectNone()
        break
    }
    
    // Navigation
    if (key.upArrow || input === 'k') {
      moveSelection('up')
    } else if (key.downArrow || input === 'j') {
      moveSelection('down')
    } else if (key.pageUp) {
      moveSelection('up', VISIBLE_ITEMS)
    } else if (key.pageDown) {
      moveSelection('down', VISIBLE_ITEMS)
    } else if (key.home) {
      setSelectionState(prev => ({ ...prev, highlighted: 0 }))
      setViewportStart(0)
    } else if (key.end) {
      const lastIndex = processedFiles.length - 1
      setSelectionState(prev => ({ ...prev, highlighted: lastIndex }))
      ensureVisible(lastIndex)
    }
    
    // Selection
    if (key.return || input === ' ') {
      const currentFile = processedFiles[selectionState.highlighted]
      if (currentFile) {
        toggleSelection(currentFile.path, key.shift)
        
        if (key.return) {
          onFileSelect?.(currentFile)
        }
      }
    }
    
    // Range selection
    if (key.shift && key.return) {
      const currentFile = processedFiles[selectionState.highlighted]
      if (currentFile && selectionState.lastSelected) {
        selectRange(selectionState.lastSelected, currentFile.path)
      }
    }
    
    // Preview
    if (input === 'p' && showPreview) {
      const currentFile = processedFiles[selectionState.highlighted]
      if (currentFile) {
        onFilePreview?.(currentFile)
      }
    }
  })
  
  // File item component
  const FileItem: React.FC<{ file: FileItem & { virtualIndex?: number } }> = ({ file }) => {
    const isHighlighted = file.isHighlighted
    const isSelected = file.isSelected
    
    const getFileIcon = (file: FileItem): string => {
      if (file.type === 'directory') return '📁'
      
      switch (file.changeType) {
        case 'new': return '🆕'
        case 'modified': return '📝'
        case 'deleted': return '🗑️'
        case 'moved': return '🔀'
        default: return '📄'
      }
    }
    
    const getStatusColor = (changeType?: string): string => {
      switch (changeType) {
        case 'new': return colors.success[500]
        case 'modified': return colors.warning[500]
        case 'deleted': return colors.error[500]
        case 'moved': return colors.info[500]
        default: return colors.neutral[600]
      }
    }
    
    return (
      <Box
        backgroundColor={isHighlighted ? colors.primary[100] : undefined}
        paddingX={1}
        flexDirection="row"
        alignItems="center"
      >
        <Text color={isHighlighted ? colors.primary[700] : colors.neutral[600]}>
          {isSelected ? '✓' : ' '}
        </Text>
        
        <Box marginLeft={1}>
          <Text>{getFileIcon(file)}</Text>
        </Box>
        
        <Box marginLeft={1} flexGrow={1}>
          <Text 
            color={isHighlighted ? colors.primary[900] : colors.neutral[900]}
            weight={isSelected ? 'semibold' : 'normal'}
          >
            {file.name}
          </Text>
        </Box>
        
        {file.changeType && (
          <Box marginLeft={1}>
            <Text 
              color={getStatusColor(file.changeType)}
              dimColor={!isHighlighted}
            >
              {file.changeType.toUpperCase()}
            </Text>
          </Box>
        )}
        
        {file.size !== undefined && (
          <Box marginLeft={1} minWidth={8}>
            <Text 
              color={isHighlighted ? colors.primary[600] : colors.neutral[500]}
              dimColor
            >
              {formatFileSize(file.size)}
            </Text>
          </Box>
        )}
      </Box>
    )
  }
  
  // Render help overlay
  if (showHelp) {
    return (
      <Box flexDirection="column" padding={2} borderStyle="double" borderColor={colors.info[500]}>
        <Heading level={3} color={colors.info[700]}>
          📖 File Selector Help
        </Heading>
        
        <VStack spacing="xs" marginTop={2}>
          <HStack justify="space-between">
            <Text weight="medium">Navigation:</Text>
          </HStack>
          <Text dimColor>↑/↓ or j/k: Move selection</Text>
          <Text dimColor>Home/End: Jump to first/last</Text>
          <Text dimColor>Page Up/Down: Move by page</Text>
          
          <Box marginTop={1}>
            <Text weight="medium">Selection:</Text>
          </Box>
          <Text dimColor>Space: Toggle selection</Text>
          <Text dimColor>Enter: Select and confirm</Text>
          <Text dimColor>Shift+Enter: Range select</Text>
          
          <Box marginTop={1}>
            <Text weight="medium">Bulk Operations:</Text>
          </Box>
          <Text dimColor>a: Select all</Text>
          <Text dimColor>i: Invert selection</Text>
          <Text dimColor>c: Clear selection</Text>
          
          <Box marginTop={1}>
            <Text weight="medium">Other:</Text>
          </Box>
          <Text dimColor>/: Search files</Text>
          <Text dimColor>p: Preview file</Text>
          <Text dimColor>?: Show this help</Text>
          <Text dimColor>q: Quit</Text>
        </VStack>
        
        <Box marginTop={2}>
          <Text dimColor>Press any key to return...</Text>
        </Box>
      </Box>
    )
  }
  
  return (
    <Box flexDirection="column" height="100%" width="100%">
      {/* Header */}
      <Box borderStyle="single" borderColor={colors.neutral[300]} padding={1}>
        <HStack justify="space-between" align="center">
          <VStack spacing="none">
            <Heading level={4} color={colors.primary[700]}>
              📂 File Selector
            </Heading>
            <Text dimColor>
              {selectionState.selected.size} of {processedFiles.length} selected
            </Text>
          </VStack>
          
          <Text dimColor>Press ? for help</Text>
        </HStack>
        
        {/* Search bar */}
        {searchable && (
          <Box marginTop={1}>
            {searchState.active ? (
              <Box borderStyle="single" borderColor={colors.primary[500]} paddingX={1}>
                <HStack align="center">
                  <Text color={colors.primary[600]}>🔍</Text>
                  <Text marginLeft={1}>Search: {searchState.query}</Text>
                  <Box flexGrow={1}>
                    <Text color={colors.primary[400]}>|</Text>
                  </Box>
                </HStack>
              </Box>
            ) : (
              <Text dimColor>Press / to search</Text>
            )}
          </Box>
        )}
      </Box>
      
      {/* File list */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {loading ? (
          <Box justify="center" align="center" height="100%">
            <Text>Loading files...</Text>
          </Box>
        ) : processedFiles.length === 0 ? (
          <Box justify="center" align="center" height="100%">
            <VStack align="center" spacing="sm">
              <Text color={colors.neutral[400]}>📭</Text>
              <Text color={colors.neutral[600]}>
                {searchState.query ? 'No files match your search' : 'No files found'}
              </Text>
              {searchState.query && (
                <Text dimColor>Try adjusting your search terms</Text>
              )}
            </VStack>
          </Box>
        ) : (
          <VStack spacing="none">
            {visibleFiles.map((file) => (
              <FileItem key={file.path} file={file} />
            ))}
          </VStack>
        )}
      </Box>
      
      {/* Footer status */}
      <Box borderStyle="single" borderColor={colors.neutral[300]} padding={1}>
        <HStack justify="space-between" align="center">
          <Text dimColor>
            {processedFiles.length > 0 && (
              `${selectionState.highlighted + 1} / ${processedFiles.length}`
            )}
          </Text>
          
          <HStack spacing="lg">
            {searchState.query && (
              <Text dimColor>Filtered: {processedFiles.length}</Text>
            )}
            <Text dimColor>Space: Select • Enter: Confirm • /: Search</Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size < 10 ? size.toFixed(1) : Math.round(size)}${units[unitIndex]}`
}

export default EnhancedFileSelector