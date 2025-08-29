/**
 * SelectionManager.js
 * Advanced selection state management with undo/redo capabilities
 * 
 * Features:
 * - Multi-select logic with individual and bulk operations
 * - Selection persistence and validation
 * - Undo/redo functionality with history tracking
 * - Pattern-based selection (regex, glob patterns)
 * - Selection templates and presets
 * - Performance optimization for large file sets
 */

const { EventEmitter } = require('events')

class SelectionManager extends EventEmitter {
  constructor(files, options = {}) {
    super()
    
    // Initialize files with selection state
    this.files = files.map((file, index) => ({ 
      ...file, 
      selected: false,
      originalIndex: index 
    }))
    
    this.options = {
      maxHistorySize: options.maxHistorySize || 50,
      enablePresets: options.enablePresets !== false,
      enableValidation: options.enableValidation !== false,
      autoSaveHistory: options.autoSaveHistory !== false,
      ...options
    }
    
    // History management for undo/redo
    this.history = []
    this.historyIndex = -1
    this.maxHistorySize = this.options.maxHistorySize
    
    // Selection presets
    this.presets = new Map()
    
    // Performance tracking
    this.operationCount = 0
    this.lastOperationTime = 0
    
    // Initial state save
    if (this.options.autoSaveHistory) {
      this.saveState('initial')
    }
  }

  // Core selection methods
  
  selectFile(fileIndex, selected = true, reason = 'manual') {
    if (!this.isValidIndex(fileIndex)) {
      throw new Error(`Invalid file index: ${fileIndex}`)
    }
    
    if (this.options.autoSaveHistory) {
      this.saveState(`select file ${fileIndex}`)
    }
    
    const oldState = this.files[fileIndex].selected
    this.files[fileIndex].selected = selected
    
    this.emit('selectionChanged', {
      type: 'single',
      fileIndex,
      oldState,
      newState: selected,
      reason
    })
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  toggleFile(fileIndex, reason = 'manual') {
    if (this.isValidIndex(fileIndex)) {
      const newState = !this.files[fileIndex].selected
      return this.selectFile(fileIndex, newState, reason)
    }
    return this
  }

  selectAll(reason = 'bulk_all') {
    if (this.options.autoSaveHistory) {
      this.saveState('select all')
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      if (!file.selected) {
        file.selected = true
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectAll',
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  selectNone(reason = 'bulk_clear') {
    if (this.options.autoSaveHistory) {
      this.saveState('clear all')
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      if (file.selected) {
        file.selected = false
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectNone',
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  invertSelection(reason = 'bulk_invert') {
    if (this.options.autoSaveHistory) {
      this.saveState('invert selection')
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      file.selected = !file.selected
      changedFiles.push(index)
    })
    
    this.emit('selectionChanged', {
      type: 'bulk',
      operation: 'invertSelection',
      changedFiles,
      reason
    })
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  // Type-based selection methods
  
  selectByChangeType(changeType, selected = true, reason = 'bulk_type') {
    if (this.options.autoSaveHistory) {
      this.saveState(`select by type: ${changeType}`)
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      if (file.changeType === changeType && file.selected !== selected) {
        file.selected = selected
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectByChangeType',
        changeType,
        selected,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  toggleByChangeType(changeType, reason = 'bulk_type_toggle') {
    if (this.options.autoSaveHistory) {
      this.saveState(`toggle by type: ${changeType}`)
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      if (file.changeType === changeType) {
        file.selected = !file.selected
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'toggleByChangeType',
        changeType,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  // Pattern-based selection methods
  
  selectByPattern(pattern, selected = true, reason = 'bulk_pattern') {
    if (this.options.autoSaveHistory) {
      this.saveState(`select by pattern: ${pattern}`)
    }
    
    let regex
    try {
      regex = new RegExp(pattern, 'i')
    } catch {
      throw new Error(`Invalid regex pattern: ${pattern}`)
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      const matches = regex.test(file.path) || 
                     regex.test(file.relativePath || '') ||
                     regex.test(file.changeType)
      
      if (matches && file.selected !== selected) {
        file.selected = selected
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectByPattern',
        pattern,
        selected,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  selectByExtension(extension, selected = true, reason = 'bulk_extension') {
    const ext = extension.startsWith('.') ? extension : `.${extension}`
    
    if (this.options.autoSaveHistory) {
      this.saveState(`select by extension: ${ext}`)
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      if (file.path.toLowerCase().endsWith(ext.toLowerCase()) && file.selected !== selected) {
        file.selected = selected
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectByExtension',
        extension: ext,
        selected,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  selectBySize(minSize = 0, maxSize = Infinity, selected = true, reason = 'bulk_size') {
    if (this.options.autoSaveHistory) {
      this.saveState(`select by size: ${minSize}-${maxSize}`)
    }
    
    const changedFiles = []
    
    this.files.forEach((file, index) => {
      const fileSize = file.sourceFile?.size || file.destFile?.size || 0
      
      if (fileSize >= minSize && fileSize <= maxSize && file.selected !== selected) {
        file.selected = selected
        changedFiles.push(index)
      }
    })
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'bulk',
        operation: 'selectBySize',
        minSize,
        maxSize,
        selected,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  // Range selection methods
  
  selectRange(startIndex, endIndex, selected = true, reason = 'range') {
    if (!this.isValidIndex(startIndex) || !this.isValidIndex(endIndex)) {
      throw new Error('Invalid range indices')
    }
    
    if (this.options.autoSaveHistory) {
      this.saveState(`select range: ${startIndex}-${endIndex}`)
    }
    
    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)
    const changedFiles = []
    
    for (let i = start; i <= end; i++) {
      if (this.files[i].selected !== selected) {
        this.files[i].selected = selected
        changedFiles.push(i)
      }
    }
    
    if (changedFiles.length > 0) {
      this.emit('selectionChanged', {
        type: 'range',
        operation: 'selectRange',
        startIndex: start,
        endIndex: end,
        selected,
        changedFiles,
        reason
      })
    }
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  // State management methods
  
  saveState(description = 'state change') {
    const state = this.files.map(file => ({ 
      ...file,
      selected: file.selected 
    }))
    
    // Remove any states after current index (when we're not at the end)
    this.history = this.history.slice(0, this.historyIndex + 1)
    
    // Add new state
    this.history.push({
      state,
      description,
      timestamp: Date.now(),
      operationCount: this.operationCount
    })
    
    this.historyIndex++
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
    
    this.emit('historyChanged', {
      action: 'save',
      description,
      historyIndex: this.historyIndex,
      historyLength: this.history.length
    })
    
    return this
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      const historyEntry = this.history[this.historyIndex]
      
      // Restore state
      this.files = historyEntry.state.map(file => ({ ...file }))
      
      this.emit('historyChanged', {
        action: 'undo',
        description: historyEntry.description,
        historyIndex: this.historyIndex,
        historyLength: this.history.length
      })
      
      this.emit('selectionChanged', {
        type: 'undo',
        operation: 'undo',
        reason: 'history_undo'
      })
      
      return true
    }
    return false
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      const historyEntry = this.history[this.historyIndex]
      
      // Restore state
      this.files = historyEntry.state.map(file => ({ ...file }))
      
      this.emit('historyChanged', {
        action: 'redo',
        description: historyEntry.description,
        historyIndex: this.historyIndex,
        historyLength: this.history.length
      })
      
      this.emit('selectionChanged', {
        type: 'redo',
        operation: 'redo',
        reason: 'history_redo'
      })
      
      return true
    }
    return false
  }

  // Preset management methods
  
  savePreset(name, description = '') {
    if (!this.options.enablePresets) {
      throw new Error('Presets are disabled')
    }
    
    const selectedIndices = this.files
      .map((file, index) => file.selected ? index : null)
      .filter(index => index !== null)
    
    this.presets.set(name, {
      name,
      description,
      selectedIndices: [...selectedIndices],
      timestamp: Date.now(),
      fileCount: selectedIndices.length
    })
    
    this.emit('presetSaved', { name, description, fileCount: selectedIndices.length })
    
    return this
  }

  loadPreset(name, reason = 'preset') {
    if (!this.options.enablePresets) {
      throw new Error('Presets are disabled')
    }
    
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`Preset '${name}' not found`)
    }
    
    if (this.options.autoSaveHistory) {
      this.saveState(`load preset: ${name}`)
    }
    
    // Clear current selection
    this.files.forEach(file => (file.selected = false))
    
    // Apply preset selection
    const changedFiles = []
    preset.selectedIndices.forEach(index => {
      if (this.isValidIndex(index)) {
        this.files[index].selected = true
        changedFiles.push(index)
      }
    })
    
    this.emit('selectionChanged', {
      type: 'preset',
      operation: 'loadPreset',
      presetName: name,
      changedFiles,
      reason
    })
    
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    return this
  }

  listPresets() {
    return Array.from(this.presets.values())
  }

  deletePreset(name) {
    if (!this.options.enablePresets) {
      throw new Error('Presets are disabled')
    }
    
    const deleted = this.presets.delete(name)
    if (deleted) {
      this.emit('presetDeleted', { name })
    }
    return deleted
  }

  // Query methods
  
  getSelectedFiles() {
    return this.files.filter(file => file.selected)
  }

  getSelectedIndices() {
    return this.files
      .map((file, index) => file.selected ? index : null)
      .filter(index => index !== null)
  }

  getSelectedCount() {
    return this.files.filter(file => file.selected).length
  }

  getSelectionSummary() {
    const selected = this.getSelectedFiles()
    const summary = { new: 0, modified: 0, deleted: 0, moved: 0, total: selected.length }
    
    selected.forEach(file => {
      summary[file.changeType] = (summary[file.changeType] || 0) + 1
    })
    
    return summary
  }

  hasSelections() {
    return this.getSelectedCount() > 0
  }

  allSelected() {
    return this.files.length > 0 && this.files.every(file => file.selected)
  }

  getStatistics() {
    const total = this.files.length
    const selected = this.getSelectedCount()
    const byType = {}
    
    this.files.forEach(file => {
      byType[file.changeType] = byType[file.changeType] || { total: 0, selected: 0 }
      byType[file.changeType].total++
      if (file.selected) {
        byType[file.changeType].selected++
      }
    })
    
    return {
      total,
      selected,
      percentage: total > 0 ? (selected / total * 100).toFixed(1) : 0,
      byType,
      operationCount: this.operationCount,
      lastOperationTime: this.lastOperationTime,
      historySize: this.history.length,
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1
    }
  }

  // Validation methods
  
  validateSelection(rules = {}) {
    if (!this.options.enableValidation) {
      return { valid: true }
    }
    
    const errors = []
    const warnings = []
    const selected = this.getSelectedFiles()
    
    // Minimum selection check
    if (rules.minSelected && selected.length < rules.minSelected) {
      errors.push(`Must select at least ${rules.minSelected} files`)
    }
    
    // Maximum selection check
    if (rules.maxSelected && selected.length > rules.maxSelected) {
      errors.push(`Cannot select more than ${rules.maxSelected} files`)
    }
    
    // Required types check
    if (rules.requiredTypes) {
      const selectedTypes = new Set(selected.map(f => f.changeType))
      const missingTypes = rules.requiredTypes.filter(type => !selectedTypes.has(type))
      if (missingTypes.length > 0) {
        errors.push(`Must select files of types: ${missingTypes.join(', ')}`)
      }
    }
    
    // Forbidden types check
    if (rules.forbiddenTypes) {
      const selectedTypes = new Set(selected.map(f => f.changeType))
      const forbiddenFound = rules.forbiddenTypes.filter(type => selectedTypes.has(type))
      if (forbiddenFound.length > 0) {
        errors.push(`Cannot select files of types: ${forbiddenFound.join(', ')}`)
      }
    }
    
    // Custom validation function
    if (rules.customValidator && typeof rules.customValidator === 'function') {
      try {
        const customResult = rules.customValidator(selected, this.files)
        if (customResult.errors) {errors.push(...customResult.errors)}
        if (customResult.warnings) {warnings.push(...customResult.warnings)}
      } catch (error) {
        errors.push(`Custom validation failed: ${error.message}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Utility methods
  
  isValidIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < this.files.length
  }

  getFile(index) {
    if (this.isValidIndex(index)) {
      return this.files[index]
    }
    return null
  }

  getTotalCount() {
    return this.files.length
  }

  reset() {
    this.files.forEach(file => (file.selected = false))
    this.history = []
    this.historyIndex = -1
    this.presets.clear()
    this.operationCount = 0
    this.lastOperationTime = Date.now()
    
    if (this.options.autoSaveHistory) {
      this.saveState('reset')
    }
    
    this.emit('reset')
    
    return this
  }

  exportState() {
    return {
      files: this.files.map(file => ({
        originalIndex: file.originalIndex,
        selected: file.selected,
        path: file.path,
        changeType: file.changeType
      })),
      presets: Object.fromEntries(this.presets),
      statistics: this.getStatistics(),
      timestamp: Date.now()
    }
  }

  importState(stateData, reason = 'import') {
    if (!stateData || !stateData.files) {
      throw new Error('Invalid state data')
    }
    
    if (this.options.autoSaveHistory) {
      this.saveState('before import')
    }
    
    // Restore file selections
    stateData.files.forEach(fileData => {
      const file = this.files.find(f => f.originalIndex === fileData.originalIndex)
      if (file) {
        file.selected = fileData.selected
      }
    })
    
    // Restore presets if available
    if (stateData.presets && this.options.enablePresets) {
      this.presets = new Map(Object.entries(stateData.presets))
    }
    
    this.emit('selectionChanged', {
      type: 'import',
      operation: 'importState',
      reason
    })
    
    return this
  }
}

module.exports = SelectionManager