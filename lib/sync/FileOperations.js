/**
 * FileOperations.js
 * Individual file operation implementations with comprehensive functionality
 * 
 * Features:
 * - Copy operations with progress callbacks and integrity verification
 * - Delete operations with safety checks and backup creation
 * - Move/rename operations with conflict resolution
 * - Binary file and large file transfer support with streaming
 * - File permission preservation and metadata handling
 * - Atomic file operations with temporary file usage
 * - Operation rollback for incomplete transfers
 * - Cleanup procedures for temporary files and partial operations
 */

const fs = require('fs').promises
const fsSync = require('fs')
const path = require('path')
const crypto = require('crypto')
const { EventEmitter } = require('events')
const stream = require('stream')
const { promisify } = require('util')
const pipeline = promisify(stream.pipeline)

class FileOperations extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Transfer settings
      streamBufferSize: options.streamBufferSize || 64 * 1024, // 64KB chunks
      verifyChecksums: options.verifyChecksums !== false,
      preserveTimestamps: options.preserveTimestamps !== false,
      preservePermissions: options.preservePermissions !== false,
      
      // Safety settings
      createBackups: options.createBackups || false,
      backupSuffix: options.backupSuffix || '.backup',
      useTemporaryFiles: options.useTemporaryFiles !== false,
      tempSuffix: options.tempSuffix || '.tmp',
      
      // Performance settings
      enableProgressCallbacks: options.enableProgressCallbacks !== false,
      progressUpdateInterval: options.progressUpdateInterval || 100, // ms
      
      ...options
    }
    
    // State tracking
    this.activeOperations = new Map()
    this.tempFiles = new Set()
    this.backupFiles = new Set()
    this.rollbackInfo = new Map()
  }

  /**
   * Execute a file operation
   * @param {Object} operation - Operation to execute
   * @param {Object} options - Operation-specific options
   * @returns {Object} Operation result with rollback information
   */
  async execute(operation, options = {}) {
    const operationId = operation.id || `op_${Date.now()}_${Math.random()}`
    
    try {
      this.activeOperations.set(operationId, operation)
      
      let result
      
      switch (operation.type) {
        case 'copy':
          result = await this.copy(operation, options)
          break
        case 'move':
          result = await this.move(operation, options)
          break
        case 'delete':
          result = await this.delete(operation, options)
          break
        case 'create':
          result = await this.create(operation, options)
          break
        case 'update':
          result = await this.update(operation, options)
          break
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`)
      }
      
      this.emit('operationComplete', operationId, result)
      return result
      
    } catch (error) {
      this.emit('operationError', operationId, error)
      throw error
    } finally {
      this.activeOperations.delete(operationId)
    }
  }

  /**
   * Preview an operation (for dry run)
   * @param {Object} operation - Operation to preview
   * @returns {Object} Preview information
   */
  async preview(operation) {
    try {
      let previewInfo = {
        operation: operation.type,
        source: operation.source,
        destination: operation.destination,
        estimatedBytes: 0,
        willOverwrite: false,
        conflicts: [],
        warnings: []
      }
      
      if (operation.source) {
        try {
          const stats = await fs.stat(operation.source)
          previewInfo.estimatedBytes = stats.size
          previewInfo.sourceExists = true
          previewInfo.sourceIsDirectory = stats.isDirectory()
          previewInfo.sourceSize = stats.size
          previewInfo.sourceModified = stats.mtime
        } catch {
          previewInfo.sourceExists = false
          previewInfo.warnings.push(`Source file does not exist: ${operation.source}`)
        }
      }
      
      if (operation.destination) {
        try {
          const stats = await fs.stat(operation.destination)
          previewInfo.destinationExists = true
          previewInfo.willOverwrite = true
          previewInfo.destinationSize = stats.size
          previewInfo.destinationModified = stats.mtime
          
          // Check for newer destination
          if (previewInfo.sourceModified && stats.mtime > previewInfo.sourceModified) {
            previewInfo.warnings.push('Destination file is newer than source')
          }
        } catch {
          previewInfo.destinationExists = false
        }
      }
      
      // Operation-specific checks
      switch (operation.type) {
        case 'copy':
          previewInfo = { ...previewInfo, ...(await this.previewCopy(operation)) }
          break
        case 'move':
          previewInfo = { ...previewInfo, ...(await this.previewMove(operation)) }
          break
        case 'delete':
          previewInfo = { ...previewInfo, ...(await this.previewDelete(operation)) }
          break
      }
      
      return previewInfo
      
    } catch (error) {
      return {
        operation: operation.type,
        error: error.message,
        estimatedBytes: 0
      }
    }
  }

  /**
   * Copy file operation with streaming and verification
   * @param {Object} operation - Copy operation details
   * @param {Object} options - Copy options
   * @returns {Object} Copy result with rollback info
   */
  async copy(operation, options = {}) {
    const { source, destination } = operation
    const copyOptions = { ...this.options, ...options }
    
    // Validate paths
    await this.validatePaths(source, destination)
    
    // Create destination directory if needed
    await this.ensureDirectory(path.dirname(destination))
    
    // Prepare temporary file for atomic operation
    const tempDestination = copyOptions.useTemporaryFiles ? 
      destination + this.options.tempSuffix : destination
    
    if (copyOptions.useTemporaryFiles) {
      this.tempFiles.add(tempDestination)
    }
    
    // Initialize backupPath outside try block for error handling
    let backupPath = null
    
    try {
      // Get source file information
      const sourceStats = await fs.stat(source)
      
      // Check if destination exists and handle backup
      if (copyOptions.createBackups) {
        try {
          await fs.stat(destination)
          backupPath = await this.createBackup(destination)
        } catch {
          // Destination doesn't exist, no backup needed
        }
      }
      
      // Perform the copy operation
      const copyResult = await this.performCopy(
        source, 
        tempDestination, 
        sourceStats, 
        copyOptions,
        operation.id
      )
      
      // Move temp file to final destination (_atomic operation)
      if (copyOptions.useTemporaryFiles) {
        await fs.rename(tempDestination, destination)
        this.tempFiles.delete(tempDestination)
      }
      
      // Preserve metadata
      await this.preserveMetadata(source, destination, sourceStats, copyOptions)
      
      // Verify integrity if enabled
      if (copyOptions.verifyChecksums) {
        const verified = await this.verifyFileIntegrity(source, destination)
        if (!verified) {
          throw new Error('File integrity verification failed')
        }
      }
      
      const rollbackInfo = {
        type: 'copy',
        destination,
        backupPath,
        wasOverwrite: backupPath !== null,
        tempFiles: copyOptions.useTemporaryFiles ? [tempDestination] : []
      }
      
      return {
        success: true,
        operation: 'copy',
        source,
        destination,
        bytesTransferred: copyResult.bytesTransferred,
        duration: copyResult.duration,
        checksum: copyResult.checksum,
        rollbackInfo
      }
      
    } catch (error) {
      // Cleanup on error
      await this.cleanupAfterError(tempDestination, backupPath)
      throw error
    }
  }

  /**
   * Move/rename file operation with conflict resolution
   * @param {Object} operation - Move operation details
   * @param {Object} options - Move options
   * @returns {Object} Move result with rollback info
   */
  async move(operation, options = {}) {
    const { source, destination } = operation
    const moveOptions = { ...this.options, ...options }
    
    // Validate paths
    await this.validatePaths(source, destination)
    
    // Check if it's a simple rename (same directory) or actual move
    const isRename = path.dirname(source) === path.dirname(destination)
    
    // Get source file information
    const sourceStats = await fs.stat(source)
    
    // Create destination directory if needed
    await this.ensureDirectory(path.dirname(destination))
    
    // Handle destination backup if it exists
    let backupPath = null
    if (moveOptions.createBackups) {
      try {
        await fs.stat(destination)
        backupPath = await this.createBackup(destination)
      } catch {
        // Destination doesn't exist, no backup needed
      }
    }
    
    let result
    
    if (isRename && !backupPath) {
      // Simple atomic rename
      const startTime = Date.now()
      await fs.rename(source, destination)
      result = {
        bytesTransferred: sourceStats.size,
        duration: Date.now() - startTime,
        method: 'rename'
      }
    } else {
      // Copy and delete (for cross-device moves or when backup exists)
      result = await this.performCopyAndDelete(source, destination, sourceStats, moveOptions, operation.id)
    }
    
    const rollbackInfo = {
      type: 'move',
      source,
      destination,
      backupPath,
      wasOverwrite: backupPath !== null,
      method: result.method || 'copy_delete'
    }
    
    return {
      success: true,
      operation: 'move',
      source,
      destination,
      bytesTransferred: result.bytesTransferred,
      duration: result.duration,
      checksum: result.checksum,
      rollbackInfo
    }
  }

  /**
   * Delete file operation with safety checks
   * @param {Object} operation - Delete operation details
   * @param {Object} options - Delete options
   * @returns {Object} Delete result with rollback info
   */
  async delete(operation, options = {}) {
    const { source } = operation
    const deleteOptions = { ...this.options, ...options }
    
    // Validate source exists
    let sourceStats
    try {
      sourceStats = await fs.stat(source)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, consider it already deleted
        return {
          success: true,
          operation: 'delete',
          source,
          alreadyDeleted: true,
          rollbackInfo: { type: 'delete', source, backupPath: null }
        }
      }
      throw error
    }
    
    // Create backup before deletion
    let backupPath = null
    if (deleteOptions.createBackups) {
      backupPath = await this.createBackup(source)
    }
    
    const startTime = Date.now()
    
    try {
      await fs.unlink(source)
      
      const rollbackInfo = {
        type: 'delete',
        source,
        backupPath,
        fileStats: {
          size: sourceStats.size,
          mode: sourceStats.mode,
          mtime: sourceStats.mtime,
          atime: sourceStats.atime
        }
      }
      
      return {
        success: true,
        operation: 'delete',
        source,
        bytesFreed: sourceStats.size,
        duration: Date.now() - startTime,
        rollbackInfo
      }
      
    } catch (error) {
      // If backup was created and delete failed, remove the backup
      if (backupPath) {
        try {
          await fs.unlink(backupPath)
          this.backupFiles.delete(backupPath)
        } catch {
          // Ignore backup cleanup errors
        }
      }
      throw error
    }
  }

  /**
   * Create new file operation
   * @param {Object} operation - Create operation details
   * @param {Object} options - Create options
   * @returns {Object} Create result
   */
  async create(operation, _options = {}) {
    const { destination, content = '' } = operation
    
    // Ensure destination directory exists
    await this.ensureDirectory(path.dirname(destination))
    
    const startTime = Date.now()
    
    // Use temporary file for atomic creation
    const tempDestination = destination + this.options.tempSuffix
    this.tempFiles.add(tempDestination)
    
    try {
      await fs.writeFile(tempDestination, content)
      await fs.rename(tempDestination, destination)
      this.tempFiles.delete(tempDestination)
      
      const stats = await fs.stat(destination)
      
      return {
        success: true,
        operation: 'create',
        destination,
        bytesWritten: stats.size,
        duration: Date.now() - startTime,
        rollbackInfo: {
          type: 'create',
          destination,
          created: true
        }
      }
      
    } catch (error) {
      // Cleanup temp file on error
      try {
        await fs.unlink(tempDestination)
        this.tempFiles.delete(tempDestination)
      } catch {
        // Ignore cleanup errors
      }
      throw error
    }
  }

  /**
   * Update existing file operation
   * @param {Object} operation - Update operation details
   * @param {Object} options - Update options
   * @returns {Object} Update result
   */
  async update(operation, options = {}) {
    const { source: _source, destination: _destination } = operation
    
    // This is essentially a copy operation with additional checks
    const updateOptions = { ...options, createBackups: true }
    
    return await this.copy({ ...operation, type: 'copy' }, updateOptions)
  }

  /**
   * Perform actual copy operation with progress tracking
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @param {Object} sourceStats - Source file stats
   * @param {Object} options - Copy options
   * @param {string} operationId - Operation ID for progress tracking
   * @returns {Object} Copy result
   */
  async performCopy(source, destination, sourceStats, options, operationId) {
    const startTime = Date.now()
    
    if (sourceStats.size === 0) {
      // Handle empty files
      await fs.writeFile(destination, '')
      return {
        bytesTransferred: 0,
        duration: Date.now() - startTime,
        method: 'write'
      }
    }
    
    // Use streaming for large files or when progress callbacks are enabled
    if (sourceStats.size > 1024 * 1024 || options.enableProgressCallbacks) {
      return await this.performStreamCopy(source, destination, sourceStats, options, operationId)
    } else {
      // Simple copy for small files
      await fs.copyFile(source, destination)
      return {
        bytesTransferred: sourceStats.size,
        duration: Date.now() - startTime,
        method: 'copyFile'
      }
    }
  }

  /**
   * Perform streaming copy with progress callbacks
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @param {Object} sourceStats - Source file stats
   * @param {Object} options - Copy options
   * @param {string} operationId - Operation ID
   * @returns {Object} Copy result
   */
  async performStreamCopy(source, destination, sourceStats, options, operationId) {
    const startTime = Date.now()
    let bytesTransferred = 0
    let lastProgressUpdate = 0
    
    const hash = options.verifyChecksums ? crypto.createHash('sha256') : null
    
    const readStream = fsSync.createReadStream(source, {
      highWaterMark: this.options.streamBufferSize
    })
    
    const writeStream = fsSync.createWriteStream(destination)
    
    // Progress tracking transform stream
    const progressStream = new stream.Transform({
      transform(chunk, encoding, callback) {
        bytesTransferred += chunk.length
        
        if (hash) {
          hash.update(chunk)
        }
        
        // Emit progress updates
        const now = Date.now()
        if (options.enableProgressCallbacks && 
            (now - lastProgressUpdate) >= options.progressUpdateInterval) {
          
          this.emit('progress', {
            operationId,
            bytesTransferred,
            totalBytes: sourceStats.size,
            percentage: (bytesTransferred / sourceStats.size) * 100,
            speed: bytesTransferred / ((now - startTime) / 1000)
          })
          
          lastProgressUpdate = now
        }
        
        callback(null, chunk)
      }
    })
    
    try {
      await pipeline(readStream, progressStream, writeStream)
      
      const result = {
        bytesTransferred,
        duration: Date.now() - startTime,
        method: 'stream'
      }
      
      if (hash) {
        result.checksum = hash.digest('hex')
      }
      
      return result
      
    } catch (error) {
      // Cleanup partial file on error
      try {
        await fs.unlink(destination)
      } catch {
        // Ignore cleanup errors
      }
      throw error
    }
  }

  /**
   * Perform copy and delete for move operations
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @param {Object} sourceStats - Source file stats
   * @param {Object} options - Move options
   * @param {string} operationId - Operation ID
   * @returns {Object} Move result
   */
  async performCopyAndDelete(source, destination, sourceStats, options, operationId) {
    // First copy the file
    const copyResult = await this.performCopy(source, destination, sourceStats, options, operationId)
    
    // Verify integrity if enabled
    if (options.verifyChecksums) {
      const verified = await this.verifyFileIntegrity(source, destination)
      if (!verified) {
        // Cleanup destination and fail
        try {
          await fs.unlink(destination)
        } catch {
          // Ignore cleanup errors
        }
        throw new Error('File integrity verification failed during move')
      }
    }
    
    // Delete the source file
    await fs.unlink(source)
    
    return {
      ...copyResult,
      method: 'copy_delete'
    }
  }

  /**
   * Create backup of existing file
   * @param {string} filePath - Path to file to backup
   * @returns {string} Backup file path
   */
  async createBackup(filePath) {
    const backupPath = filePath + this.options.backupSuffix
    await fs.copyFile(filePath, backupPath)
    this.backupFiles.add(backupPath)
    return backupPath
  }

  /**
   * Preserve file metadata (timestamps, permissions)
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @param {Object} sourceStats - Source file stats
   * @param {Object} options - Preservation options
   */
  async preserveMetadata(source, destination, sourceStats, options) {
    try {
      // Preserve timestamps
      if (options.preserveTimestamps) {
        await fs.utimes(destination, sourceStats.atime, sourceStats.mtime)
      }
      
      // Preserve permissions
      if (options.preservePermissions) {
        await fs.chmod(destination, sourceStats.mode)
      }
      
    } catch (error) {
      // Non-critical error, emit warning but don't fail operation
      this.emit('warning', `Failed to preserve metadata: ${error.message}`)
    }
  }

  /**
   * Verify file integrity using checksums
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {boolean} True if files match
   */
  async verifyFileIntegrity(source, destination) {
    try {
      const [sourceChecksum, destChecksum] = await Promise.all([
        this.calculateFileChecksum(source),
        this.calculateFileChecksum(destination)
      ])
      
      return sourceChecksum === destChecksum
      
    } catch (error) {
      this.emit('warning', `Checksum verification failed: ${error.message}`)
      return false
    }
  }

  /**
   * Calculate SHA-256 checksum of a file
   * @param {string} filePath - File path
   * @returns {string} Hex checksum
   */
  async calculateFileChecksum(filePath) {
    const hash = crypto.createHash('sha256')
    const readStream = fsSync.createReadStream(filePath)
    
    return new Promise((resolve, reject) => {
      readStream.on('data', chunk => hash.update(chunk))
      readStream.on('end', () => resolve(hash.digest('hex')))
      readStream.on('error', reject)
    })
  }

  /**
   * Rollback an operation
   * @param {Object} operation - Original operation
   * @param {Object} rollbackInfo - Rollback information
   */
  async rollback(operation, rollbackInfo) {
    switch (rollbackInfo.type) {
      case 'copy':
        return await this.rollbackCopy(rollbackInfo)
      case 'move':
        return await this.rollbackMove(rollbackInfo)
      case 'delete':
        return await this.rollbackDelete(rollbackInfo)
      case 'create':
        return await this.rollbackCreate(rollbackInfo)
      default:
        throw new Error(`Cannot rollback operation type: ${rollbackInfo.type}`)
    }
  }

  /**
   * Rollback copy operation
   * @param {Object} rollbackInfo - Rollback information
   */
  async rollbackCopy(rollbackInfo) {
    const { destination, backupPath } = rollbackInfo
    
    try {
      // Remove the copied file
      await fs.unlink(destination)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
    
    // Restore backup if it exists
    if (backupPath) {
      try {
        await fs.rename(backupPath, destination)
        this.backupFiles.delete(backupPath)
      } catch (error) {
        // Backup restore failed, but we've already removed the copy
        throw new Error(`Failed to restore backup: ${error.message}`)
      }
    }
  }

  /**
   * Rollback move operation
   * @param {Object} rollbackInfo - Rollback information
   */
  async rollbackMove(rollbackInfo) {
    const { source, destination, backupPath, method } = rollbackInfo
    
    if (method === 'rename') {
      // Simple rename back
      await fs.rename(destination, source)
    } else {
      // Move back (copy destination to source, delete destination)
      try {
        await fs.copyFile(destination, source)
        await fs.unlink(destination)
      } catch (error) {
        throw new Error(`Failed to rollback move: ${error.message}`)
      }
    }
    
    // Restore original destination if backup exists
    if (backupPath) {
      try {
        await fs.rename(backupPath, destination)
        this.backupFiles.delete(backupPath)
      } catch (error) {
        // Non-critical if backup restore fails
        this.emit('warning', `Failed to restore destination backup: ${error.message}`)
      }
    }
  }

  /**
   * Rollback delete operation
   * @param {Object} rollbackInfo - Rollback information
   */
  async rollbackDelete(rollbackInfo) {
    const { source, backupPath, fileStats } = rollbackInfo
    
    if (!backupPath) {
      throw new Error('Cannot rollback delete: no backup available')
    }
    
    try {
      await fs.rename(backupPath, source)
      this.backupFiles.delete(backupPath)
      
      // Restore file timestamps and permissions
      if (fileStats) {
        await fs.utimes(source, fileStats.atime, fileStats.mtime)
        await fs.chmod(source, fileStats.mode)
      }
      
    } catch (error) {
      throw new Error(`Failed to restore deleted file: ${error.message}`)
    }
  }

  /**
   * Rollback create operation
   * @param {Object} rollbackInfo - Rollback information
   */
  async rollbackCreate(rollbackInfo) {
    const { destination } = rollbackInfo
    
    try {
      await fs.unlink(destination)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * Preview copy operation
   * @param {Object} operation - Copy operation
   * @returns {Object} Copy preview
   */
  async previewCopy(_operation) {
    const preview = {}
    
    // Check available disk space
    try {
      // This is a simplified check - in a real implementation,
      // you might use a library like 'check-disk-space'
      preview.sufficientSpace = true
    } catch {
      preview.warnings = preview.warnings || []
      preview.warnings.push('Could not verify available disk space')
    }
    
    return preview
  }

  /**
   * Preview move operation
   * @param {Object} operation - Move operation
   * @returns {Object} Move preview
   */
  async previewMove(operation) {
    const preview = await this.previewCopy(operation)
    
    // Check if it's a cross-device move
    try {
      const sourceStat = await fs.stat(operation.source)
      const destDir = path.dirname(operation.destination)
      const destStat = await fs.stat(destDir)
      
      preview.isCrossDevice = sourceStat.dev !== destStat.dev
      if (preview.isCrossDevice) {
        preview.warnings = preview.warnings || []
        preview.warnings.push('Cross-device move will use copy+delete method')
      }
    } catch {
      preview.warnings = preview.warnings || []
      preview.warnings.push('Could not determine if cross-device move')
    }
    
    return preview
  }

  /**
   * Preview delete operation
   * @param {Object} operation - Delete operation
   * @returns {Object} Delete preview
   */
  async previewDelete(operation) {
    const preview = {}
    
    try {
      const stats = await fs.stat(operation.source)
      preview.isDirectory = stats.isDirectory()
      
      if (preview.isDirectory) {
        preview.warnings = preview.warnings || []
        preview.warnings.push('Deleting a directory - all contents will be removed')
      }
    } catch {
      // File doesn't exist - no special warnings needed
    }
    
    return preview
  }

  /**
   * Validate file paths
   * @param {string} source - Source path
   * @param {string} destination - Destination path (optional)
   */
  async validatePaths(source, destination) {
    if (!source) {
      throw new Error('Source path is required')
    }
    
    if (destination && source === destination) {
      throw new Error('Source and destination paths cannot be the same')
    }
    
    // Additional validation could be added here
    // - Check for invalid characters
    // - Check path length limits
    // - Check permissions
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
  }

  /**
   * Cleanup after operation error
   * @param {string} tempFile - Temporary file to cleanup
   * @param {string} backupFile - Backup file to cleanup
   */
  async cleanupAfterError(tempFile, backupFile) {
    // Cleanup temporary file
    if (tempFile && this.tempFiles.has(tempFile)) {
      try {
        await fs.unlink(tempFile)
        this.tempFiles.delete(tempFile)
      } catch {
        // Ignore cleanup errors
      }
    }
    
    // Cleanup backup file if operation failed
    if (backupFile && this.backupFiles.has(backupFile)) {
      try {
        await fs.unlink(backupFile)
        this.backupFiles.delete(backupFile)
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Cleanup all temporary and backup files
   */
  async cleanup() {
    const cleanupPromises = []
    
    // Cleanup temporary files
    for (const tempFile of this.tempFiles) {
      cleanupPromises.push(
        fs.unlink(tempFile).catch(() => {}) // Ignore errors
      )
    }
    
    // Cleanup backup files if requested
    if (this.options.cleanupBackups) {
      for (const backupFile of this.backupFiles) {
        cleanupPromises.push(
          fs.unlink(backupFile).catch(() => {}) // Ignore errors
        )
      }
    }
    
    await Promise.all(cleanupPromises)
    
    this.tempFiles.clear()
    if (this.options.cleanupBackups) {
      this.backupFiles.clear()
    }
  }

  /**
   * Get current operation statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    return {
      activeOperations: this.activeOperations.size,
      tempFiles: this.tempFiles.size,
      backupFiles: this.backupFiles.size,
      rollbackInfoCount: this.rollbackInfo.size
    }
  }
}

module.exports = FileOperations