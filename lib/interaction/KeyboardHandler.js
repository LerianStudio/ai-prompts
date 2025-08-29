/**
 * KeyboardHandler.js
 * Centralized keyboard input processing and command mapping
 * 
 * Features:
 * - Event-driven keyboard input processing
 * - Customizable key bindings and command mapping
 * - Support for modifier keys (Ctrl, Alt, Shift)
 * - Key sequence detection and macro support
 * - Input mode management (normal, search, help)
 * - Performance optimization for rapid input
 */

const { EventEmitter } = require('events')
const readline = require('readline')

class KeyboardHandler extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      enableVimBindings: options.enableVimBindings || false,
      enableMacros: options.enableMacros || false,
      maxSequenceLength: options.maxSequenceLength || 5,
      sequenceTimeout: options.sequenceTimeout || 1000, // 1 second
      enablePerformanceTracking: options.enablePerformanceTracking || false,
      ...options
    }
    
    // Input state
    this.currentMode = 'normal'
    this.isActive = false
    
    // Key sequence tracking
    this.keySequence = []
    this.sequenceTimer = null
    
    // Command mapping
    this.commands = new Map()
    this.modeCommands = new Map()
    
    // Macro system
    this.macros = new Map()
    this.recordingMacro = null
    this.macroBuffer = []
    
    // Performance tracking
    this.inputCount = 0
    this.lastInputTime = 0
    this.avgResponseTime = 0
    
    this.setupDefaultBindings()
  }

  /**
   * Setup default key bindings
   */
  setupDefaultBindings() {
    // Navigation commands
    this.addCommand('up', 'navigate:up', { keys: ['up'] })
    this.addCommand('down', 'navigate:down', { keys: ['down'] })
    this.addCommand('left', 'navigate:left', { keys: ['left'] })
    this.addCommand('right', 'navigate:right', { keys: ['right'] })
    this.addCommand('pageup', 'navigate:pageUp', { keys: ['pageup'] })
    this.addCommand('pagedown', 'navigate:pageDown', { keys: ['pagedown'] })
    this.addCommand('home', 'navigate:home', { keys: ['home'] })
    this.addCommand('end', 'navigate:end', { keys: ['end'] })
    
    // Selection commands
    this.addCommand('toggle', 'selection:toggle', { keys: ['space'] })
    this.addCommand('confirm', 'selection:confirm', { keys: ['return', 'enter'] })
    this.addCommand('cancel', 'selection:cancel', { keys: ['escape', 'q'] })
    
    // Bulk operations
    this.addCommand('selectAll', 'selection:selectAll', { 
      keys: [{ key: 'a', ctrl: true }] 
    })
    this.addCommand('invertSelection', 'selection:invert', { 
      keys: [{ key: 'i', ctrl: true }] 
    })
    this.addCommand('clearSelection', 'selection:clear', { 
      keys: [{ key: 'c', ctrl: true }] 
    })
    
    // Type-based selection
    this.addCommand('selectNew', 'selection:selectByType', { 
      keys: ['n'],
      args: { changeType: 'new' }
    })
    this.addCommand('selectModified', 'selection:selectByType', { 
      keys: ['m'],
      args: { changeType: 'modified' }
    })
    this.addCommand('selectDeleted', 'selection:selectByType', { 
      keys: ['d'],
      args: { changeType: 'deleted' }
    })
    
    // Mode switching
    this.addCommand('search', 'mode:search', { keys: ['slash'] })
    this.addCommand('help', 'mode:help', { keys: ['h', 'question'] })
    
    // History commands
    this.addCommand('undo', 'history:undo', { 
      keys: [{ key: 'z', ctrl: true }] 
    })
    this.addCommand('redo', 'history:redo', { 
      keys: [{ key: 'y', ctrl: true }, { key: 'z', ctrl: true, shift: true }] 
    })
    
    // Vim-style bindings (if enabled)
    if (this.options.enableVimBindings) {
      this.addVimBindings()
    }
  }

  /**
   * Add Vim-style key bindings
   */
  addVimBindings() {
    // Vim navigation
    this.addCommand('vimUp', 'navigate:up', { keys: ['k'] })
    this.addCommand('vimDown', 'navigate:down', { keys: ['j'] })
    this.addCommand('vimLeft', 'navigate:left', { keys: ['h'] })
    this.addCommand('vimRight', 'navigate:right', { keys: ['l'] })
    
    // Vim-style jumps
    this.addCommand('vimTop', 'navigate:home', { keys: ['g', 'g'] })
    this.addCommand('vimBottom', 'navigate:end', { keys: ['G'] })
    
    // Vim selection
    this.addCommand('vimVisual', 'mode:visual', { keys: ['v'] })
    this.addCommand('vimVisualLine', 'mode:visualLine', { keys: ['V'] })
  }

  /**
   * Add a command binding
   */
  addCommand(name, action, config) {
    const command = {
      name,
      action,
      keys: config.keys || [],
      mode: config.mode || 'normal',
      args: config.args || {},
      description: config.description || '',
      enabled: config.enabled !== false
    }
    
    this.commands.set(name, command)
    
    // Index by mode for faster lookup
    if (!this.modeCommands.has(command.mode)) {
      this.modeCommands.set(command.mode, new Map())
    }
    
    // Index by key combinations
    command.keys.forEach(key => {
      const keyStr = this.keyToString(key)
      this.modeCommands.get(command.mode).set(keyStr, command)
    })
    
    return this
  }

  /**
   * Remove a command binding
   */
  removeCommand(name) {
    const command = this.commands.get(name)
    if (command) {
      // Remove from mode index
      const modeMap = this.modeCommands.get(command.mode)
      if (modeMap) {
        command.keys.forEach(key => {
          const keyStr = this.keyToString(key)
          modeMap.delete(keyStr)
        })
      }
      
      this.commands.delete(name)
      return true
    }
    return false
  }

  /**
   * Start keyboard input handling
   */
  start() {
    if (this.isActive) {return this}
    
    this.isActive = true
    
    // Setup readline for keypress events
    readline.emitKeypressEvents(process.stdin)
    
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
    
    // Attach keypress listener
    process.stdin.on('keypress', this.handleKeypress.bind(this))
    
    this.emit('started')
    return this
  }

  /**
   * Stop keyboard input handling
   */
  stop() {
    if (!this.isActive) {return this}
    
    this.isActive = false
    
    // Clean up readline
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false)
    }
    
    process.stdin.removeListener('keypress', this.handleKeypress.bind(this))
    
    // Clear any pending sequence timer
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer)
      this.sequenceTimer = null
    }
    
    this.emit('stopped')
    return this
  }

  /**
   * Main keypress handler
   */
  handleKeypress(str, key) {
    if (!this.isActive || !key) {return}
    
    const startTime = Date.now()
    
    try {
      // Handle special key combinations first
      if (this.handleSpecialKeys(str, key)) {
        return
      }
      
      // Add to key sequence
      this.addToSequence(key)
      
      // Try to match command
      const command = this.matchCommand(key)
      
      if (command) {
        // Execute command
        this.executeCommand(command, key, str)
        this.clearSequence()
      } else {
        // Check if we're building a sequence
        this.handleSequence(key, str)
      }
      
      // Track performance
      if (this.options.enablePerformanceTracking) {
        this.updatePerformanceMetrics(Date.now() - startTime)
      }
      
    } catch (error) {
      this.emit('error', error)
      this.clearSequence()
    }
  }

  /**
   * Handle special key combinations (Ctrl+C, etc.)
   */
  handleSpecialKeys(str, key) {
    // Handle Ctrl+C gracefully
    if (key.ctrl && key.name === 'c' && !this.hasCommand('c', { ctrl: true })) {
      this.emit('interrupt')
      return true
    }
    
    // Handle macro recording
    if (this.options.enableMacros) {
      if (key.ctrl && key.name === 'r') {
        this.toggleMacroRecording()
        return true
      }
      
      if (this.recordingMacro) {
        this.addToMacro(key, str)
      }
    }
    
    return false
  }

  /**
   * Add key to current sequence
   */
  addToSequence(key) {
    this.keySequence.push(key)
    
    // Limit sequence length
    if (this.keySequence.length > this.options.maxSequenceLength) {
      this.keySequence.shift()
    }
    
    // Reset sequence timer
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer)
    }
    
    this.sequenceTimer = setTimeout(() => {
      this.clearSequence()
    }, this.options.sequenceTimeout)
  }

  /**
   * Clear current key sequence
   */
  clearSequence() {
    this.keySequence = []
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer)
      this.sequenceTimer = null
    }
  }

  /**
   * Match key against available commands
   */
  matchCommand(key) {
    const modeMap = this.modeCommands.get(this.currentMode)
    if (!modeMap) {return null}
    
    // Try exact key match first
    const keyStr = this.keyToString(key)
    const command = modeMap.get(keyStr)
    
    if (command && command.enabled) {
      return command
    }
    
    // Try sequence match
    return this.matchSequence()
  }

  /**
   * Match current key sequence against multi-key commands
   */
  matchSequence() {
    if (this.keySequence.length < 2) {return null}
    
    const modeMap = this.modeCommands.get(this.currentMode)
    if (!modeMap) {return null}
    
    // Check for sequence matches
    for (const [keyStr, command] of modeMap.entries()) {
      if (this.matchesSequence(keyStr, this.keySequence)) {
        return command
      }
    }
    
    return null
  }

  /**
   * Check if key sequence matches a command pattern
   */
  matchesSequence(pattern, sequence) {
    // This is a simplified implementation
    // In a full implementation, you'd want more sophisticated pattern matching
    const sequenceStr = sequence.map(key => this.keyToString(key)).join(' ')
    return pattern === sequenceStr
  }

  /**
   * Handle ongoing key sequence building
   */
  handleSequence(key, str) {
    // Check if this could be part of a longer sequence
    const hasPartialMatches = this.hasPartialMatches(this.keySequence)
    
    if (!hasPartialMatches) {
      // No potential matches, treat as character input
      if (this.currentMode === 'search' || this.currentMode === 'input') {
        this.emit('characterInput', { char: str, key })
      }
      this.clearSequence()
    }
    
    // Otherwise, keep building the sequence
  }

  /**
   * Check if current sequence could lead to a valid command
   */
  hasPartialMatches(sequence) {
    const modeMap = this.modeCommands.get(this.currentMode)
    if (!modeMap) {return false}
    
    const sequenceStr = sequence.map(key => this.keyToString(key)).join(' ')
    
    for (const keyStr of modeMap.keys()) {
      if (keyStr.startsWith(sequenceStr)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Execute a matched command
   */
  executeCommand(command, key, str) {
    const event = {
      command: command.name,
      action: command.action,
      args: { ...command.args },
      key,
      str,
      mode: this.currentMode,
      timestamp: Date.now()
    }
    
    // Add sequence context if applicable
    if (this.keySequence.length > 1) {
      event.sequence = [...this.keySequence]
    }
    
    // Emit the command event
    this.emit('command', event)
    
    // Emit specific action event
    this.emit(command.action, event)
    
    this.inputCount++
    this.lastInputTime = Date.now()
  }

  /**
   * Change input mode
   */
  setMode(mode) {
    if (this.currentMode === mode) {return this}
    
    const oldMode = this.currentMode
    this.currentMode = mode
    
    this.clearSequence()
    
    this.emit('modeChanged', {
      oldMode,
      newMode: mode,
      timestamp: Date.now()
    })
    
    return this
  }

  /**
   * Check if a command exists for the given key
   */
  hasCommand(keyName, modifiers = {}) {
    const key = { name: keyName, ...modifiers }
    const keyStr = this.keyToString(key)
    const modeMap = this.modeCommands.get(this.currentMode)
    
    return modeMap ? modeMap.has(keyStr) : false
  }

  /**
   * Convert key object to string representation
   */
  keyToString(key) {
    if (typeof key === 'string') {return key}
    
    const parts = []
    
    if (key.ctrl) {parts.push('ctrl')}
    if (key.alt) {parts.push('alt')}  
    if (key.shift) {parts.push('shift')}
    if (key.meta) {parts.push('meta')}
    
    parts.push(key.name || key.key || 'unknown')
    
    return parts.join('+')
  }

  // Macro system methods
  
  /**
   * Toggle macro recording
   */
  toggleMacroRecording(name = 'temp') {
    if (!this.options.enableMacros) {return this}
    
    if (this.recordingMacro) {
      // Stop recording
      this.macros.set(this.recordingMacro, [...this.macroBuffer])
      this.recordingMacro = null
      this.macroBuffer = []
      
      this.emit('macroRecordingStopped', { name })
    } else {
      // Start recording
      this.recordingMacro = name
      this.macroBuffer = []
      
      this.emit('macroRecordingStarted', { name })
    }
    
    return this
  }

  /**
   * Add key to macro buffer
   */
  addToMacro(key, str) {
    if (this.recordingMacro) {
      this.macroBuffer.push({ key, str, timestamp: Date.now() })
    }
  }

  /**
   * Play back a recorded macro
   */
  playMacro(name) {
    if (!this.options.enableMacros) {return this}
    
    const macro = this.macros.get(name)
    if (!macro) {
      throw new Error(`Macro '${name}' not found`)
    }
    
    // Simulate keypress events for macro
    macro.forEach((entry, index) => {
      setTimeout(() => {
        this.handleKeypress(entry.str, entry.key)
      }, index * 50) // Small delay between keys
    })
    
    this.emit('macroPlayed', { name, length: macro.length })
    
    return this
  }

  // Performance and utility methods
  
  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(responseTime) {
    this.avgResponseTime = (this.avgResponseTime + responseTime) / 2
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      inputCount: this.inputCount,
      lastInputTime: this.lastInputTime,
      avgResponseTime: this.avgResponseTime,
      currentMode: this.currentMode,
      activeSequenceLength: this.keySequence.length,
      macroCount: this.macros.size,
      commandCount: this.commands.size
    }
  }

  /**
   * Get available commands for current mode
   */
  getAvailableCommands(mode = this.currentMode) {
    const commands = []
    
    for (const command of this.commands.values()) {
      if (command.mode === mode && command.enabled) {
        commands.push({
          name: command.name,
          action: command.action,
          keys: command.keys,
          description: command.description
        })
      }
    }
    
    return commands
  }

  /**
   * Export key bindings configuration
   */
  exportBindings() {
    const bindings = {}
    
    for (const [name, command] of this.commands.entries()) {
      bindings[name] = {
        action: command.action,
        keys: command.keys,
        mode: command.mode,
        args: command.args,
        enabled: command.enabled
      }
    }
    
    return bindings
  }

  /**
   * Import key bindings configuration
   */
  importBindings(bindings) {
    this.commands.clear()
    this.modeCommands.clear()
    
    for (const [name, config] of Object.entries(bindings)) {
      this.addCommand(name, config.action, config)
    }
    
    return this
  }

  /**
   * Reset to default bindings
   */
  resetBindings() {
    this.commands.clear()
    this.modeCommands.clear()
    this.setupDefaultBindings()
    
    return this
  }
}

module.exports = KeyboardHandler