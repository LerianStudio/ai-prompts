/**
 * ChangeClassifier.js
 * File change classification system for the Lerian Protocol
 *
 * Features:
 * - Intelligent change type detection (new, modified, deleted, moved)
 * - Confidence scoring for change classifications
 * - Conflict detection for simultaneous changes
 * - File rename detection using content similarity
 * - Change priority system for sync ordering
 * - Change reason analysis and validation
 */

const path = require('path')
const { EventEmitter } = require('events')

class ChangeClassifier extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      // Rename detection settings
      enableRenameDetection: options.enableRenameDetection !== false,
      renameContentSimilarityThreshold: options.renameContentSimilarityThreshold || 0.8,
      renamePathSimilarityThreshold: options.renamePathSimilarityThreshold || 0.6,
      maxRenameSearchDistance: options.maxRenameSearchDistance || 100, // Max files to compare for renames
      
      // Conflict detection
      enableConflictDetection: options.enableConflictDetection !== false,
      conflictTimeToleranceMs: options.conflictTimeToleranceMs || 5000, // 5 seconds
      
      // Priority system
      enablePrioritySystem: options.enablePrioritySystem !== false,
      
      // Validation settings
      enableValidation: options.enableValidation !== false,
      maxReasonableFileSize: options.maxReasonableFileSize || 1024 * 1024 * 1024, // 1GB
      
      ...options
    }
    
    // Statistics tracking
    this.stats = {
      changesClassified: 0,
      renamesDetected: 0,
      conflictsDetected: 0,
      validationErrors: 0,
      startTime: null
    }
    
    // Cache for expensive operations
    this.similarityCache = new Map()
    this.priorityCache = new Map()
  }

  async classifyChanges(changes, sourceFiles = new Map(), destFiles = new Map()) {
    this.stats.startTime = Date.now()
    this.stats.changesClassified = 0
    
    try {
      // Step 1: Enhance individual changes
      const enhancedChanges = await this.enhanceIndividualChanges(changes)
      
      // Step 2: Detect renames/moves if enabled
      let finalChanges = enhancedChanges
      if (this.options.enableRenameDetection && sourceFiles.size > 0 && destFiles.size > 0) {
        finalChanges = await this.detectRenames(enhancedChanges, sourceFiles, destFiles)
      }
      
      // Step 3: Detect conflicts if enabled
      if (this.options.enableConflictDetection) {
        finalChanges = await this.detectConflicts(finalChanges)
      }
      
      // Step 4: Validate changes
      if (this.options.enableValidation) {
        finalChanges = await this.validateChanges(finalChanges)
      }
      
      // Step 5: Assign priorities and sort
      if (this.options.enablePrioritySystem) {
        finalChanges = this.assignPriorities(finalChanges)
        finalChanges.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          const pathA = a.path || ''
          const pathB = b.path || ''
          return pathA.localeCompare(pathB)
        })
      }
      
      this.emit('classified', {
        changes: finalChanges,
        stats: this.getStats()
      })
      
      return finalChanges

    } catch (error) {
      this.emit('error', {
        message: error.message,
        stack: error.stack,
        stats: this.getStats()
      })
      throw error
    }
  }

  async enhanceIndividualChanges(changes) {
    const enhanced = []
    
    for (const change of changes) {
      try {
        const enhancedChange = await this.enhanceChange(change)
        enhanced.push(enhancedChange)
        this.stats.changesClassified++
        
        // Emit progress periodically
        if (this.stats.changesClassified % 50 === 0) {
          this.emit('progress', {
            processed: this.stats.changesClassified,
            total: changes.length,
            operation: 'enhancing'
          })
        }
        
      } catch (error) {
        console.warn(`Warning: Failed to enhance change for ${change.path}: ${error.message}`)
        // Keep original change if enhancement fails
        enhanced.push(change)
      }
    }
    
    return enhanced
  }

  async enhanceChange(change) {
    const enhanced = {
      ...change,
      
      // Add classification metadata
      classification: {
        changeType: change.changeType,
        confidence: change.confidence || this.calculateBaseConfidence(change),
        analysisTime: Date.now()
      },
      
      // Enhanced reason analysis
      reasonAnalysis: this.analyzeChangeReason(change),
      
      // Risk assessment
      riskLevel: this.assessChangeRisk(change),
      
      // Processing hints
      processingHints: this.generateProcessingHints(change)
    }
    
    // Add file-specific enhancements
    if (change.sourceFile) {
      enhanced.sourceAnalysis = this.analyzeFile(change.sourceFile)
    }
    
    if (change.destFile) {
      enhanced.destAnalysis = this.analyzeFile(change.destFile)
    }
    
    // Calculate final confidence
    enhanced.classification.confidence = this.calculateFinalConfidence(enhanced)
    
    return enhanced
  }

  async detectRenames(changes) {
    if (!this.options.enableRenameDetection) {
      return changes
    }
    
    const newFiles = changes.filter(c => c.changeType === 'new')
    const deletedFiles = changes.filter(c => c.changeType === 'deleted')
    
    if (newFiles.length === 0 || deletedFiles.length === 0) {
      return changes
    }
    
    console.log(`🔍 Analyzing ${newFiles.length} new and ${deletedFiles.length} deleted files for potential renames...`)
    
    const renames = []
    const processedNew = new Set()
    const processedDeleted = new Set()
    
    // Limit search to prevent performance issues
    const maxSearchPairs = Math.min(
      newFiles.length * deletedFiles.length,
      this.options.maxRenameSearchDistance
    )
    
    let pairsChecked = 0
    
    for (const newFile of newFiles) {
      if (processedNew.has(newFile.path)) {continue}
      if (pairsChecked >= maxSearchPairs) {break}
      
      let bestMatch = null
      let bestSimilarity = 0
      
      for (const deletedFile of deletedFiles) {
        if (processedDeleted.has(deletedFile.path)) {continue}
        pairsChecked++
        
        const similarity = await this.calculateFileSimilarity(newFile, deletedFile)
        
        if (similarity > this.options.renameContentSimilarityThreshold && 
            similarity > bestSimilarity) {
          bestMatch = deletedFile
          bestSimilarity = similarity
        }
        
        if (pairsChecked >= maxSearchPairs) {break}
      }
      
      if (bestMatch && bestSimilarity > this.options.renameContentSimilarityThreshold) {
        renames.push({
          changeType: 'moved',
          path: newFile.path,
          relativePath: newFile.relativePath,
          oldPath: bestMatch.path,
          sourceFile: newFile.sourceFile,
          destFile: bestMatch.destFile,
          reason: `File moved from ${bestMatch.path} to ${newFile.path}`,
          confidence: bestSimilarity,
          similarity: {
            content: bestSimilarity,
            path: this.calculatePathSimilarity(bestMatch.path, newFile.path)
          },
          priority: this.getChangePriority('moved'),
          timestamp: Date.now(),
          classification: {
            changeType: 'moved',
            confidence: bestSimilarity,
            analysisTime: Date.now()
          }
        })
        
        processedNew.add(newFile.path)
        processedDeleted.add(bestMatch.path)
        this.stats.renamesDetected++
      }
    }
    
    console.log(`✅ Detected ${renames.length} potential renames/moves`)
    
    // Remove matched new/deleted files and add renames
    const remainingChanges = changes.filter(c => 
      !processedNew.has(c.path) && !processedDeleted.has(c.path)
    )
    
    return [...remainingChanges, ...renames]
  }

  async calculateFileSimilarity(file1, file2) {
    const cacheKey = `${file1.path}:${file2.path}`
    
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey)
    }
    
    let similarity = 0
    
    try {
      // Quick size check - files must be exactly the same size to be renames
      if (file1.sourceFile?.size !== file2.destFile?.size) {
        similarity = 0
      } else {
        // Calculate weighted similarity based on multiple factors
        const factors = {
          size: this.calculateSizeSimilarity(file1, file2),
          name: this.calculateNameSimilarity(file1, file2),
          path: this.calculatePathSimilarity(file1.path, file2.path),
          extension: this.calculateExtensionSimilarity(file1, file2)
        }
        
        // Weighted average
        similarity = (
          factors.size * 0.4 +    // Size match is very important
          factors.name * 0.3 +    // Name similarity matters
          factors.path * 0.2 +    // Path similarity helps
          factors.extension * 0.1 // Extension should match
        )
      }
      
      this.similarityCache.set(cacheKey, similarity)
      return similarity

    } catch (error) {
      console.warn(`Warning: Failed to calculate similarity for ${file1.path} and ${file2.path}: ${error.message}`)
      return 0
    }
  }

  calculateSizeSimilarity(file1, file2) {
    const size1 = file1.sourceFile?.size || 0
    const size2 = file2.destFile?.size || 0
    
    if (size1 === 0 && size2 === 0) {return 1}
    if (size1 === 0 || size2 === 0) {return 0}
    
    return size1 === size2 ? 1 : 0
  }

  calculateNameSimilarity(file1, file2) {
    const name1 = path.basename(file1.path).toLowerCase()
    const name2 = path.basename(file2.path).toLowerCase()
    
    if (name1 === name2) {return 1}
    
    const distance = this.levenshteinDistance(name1, name2)
    const maxLen = Math.max(name1.length, name2.length)
    
    return maxLen === 0 ? 1 : (1 - distance / maxLen)
  }

  calculatePathSimilarity(path1, path2) {
    const parts1 = path1.split('/').filter(Boolean)
    const parts2 = path2.split('/').filter(Boolean)
    
    let commonParts = 0
    const maxParts = Math.max(parts1.length, parts2.length)
    
    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
      if (parts1[i] === parts2[i]) {
        commonParts++
      } else {
        break
      }
    }
    
    return maxParts === 0 ? 1 : commonParts / maxParts
  }

  calculateExtensionSimilarity(file1, file2) {
    const ext1 = path.extname(file1.path).toLowerCase()
    const ext2 = path.extname(file2.path).toLowerCase()
    
    return ext1 === ext2 ? 1 : 0
  }

  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  async detectConflicts(changes) {
    const conflicts = []
    const pathChangeMap = new Map()
    
    // Group changes by path
    for (const change of changes) {
      if (!pathChangeMap.has(change.path)) {
        pathChangeMap.set(change.path, [])
      }
      pathChangeMap.get(change.path).push(change)
    }
    
    // Detect conflicts within each path group
    for (const [filePath, pathChanges] of pathChangeMap.entries()) {
      if (pathChanges.length > 1) {
        const conflict = this.analyzePathConflict(filePath, pathChanges)
        if (conflict) {
          conflicts.push(conflict)
          this.stats.conflictsDetected++
        }
      }
    }
    
    // Enhance changes with conflict information
    const enhancedChanges = changes.map(change => {
      const conflict = conflicts.find(c => c.path === change.path)
      if (conflict) {
        return {
          ...change,
          conflict: {
            type: conflict.type,
            severity: conflict.severity,
            description: conflict.description,
            resolution: conflict.suggestedResolution
          }
        }
      }
      return change
    })
    
    if (conflicts.length > 0) {
      console.log(`⚠️  Detected ${conflicts.length} potential conflicts`)
    }
    
    return enhancedChanges
  }

  analyzePathConflict(filePath, changes) {
    // Different types of conflicts
    if (changes.some(c => c.changeType === 'new') && changes.some(c => c.changeType === 'deleted')) {
      return {
        path: filePath,
        type: 'create-delete',
        severity: 'high',
        description: 'File is both created and deleted',
        suggestedResolution: 'Review timing of changes',
        changes
      }
    }
    
    const modifiedChanges = changes.filter(c => c.changeType === 'modified')
    if (modifiedChanges.length > 1) {
      // Check if modifications happened around the same time
      const timestamps = modifiedChanges.map(c => c.timestamp || 0)
      const timeDiff = Math.max(...timestamps) - Math.min(...timestamps)
      
      if (timeDiff < this.options.conflictTimeToleranceMs) {
        return {
          path: filePath,
          type: 'concurrent-modification',
          severity: 'medium',
          description: 'File was modified multiple times in quick succession',
          suggestedResolution: 'Use latest version or merge changes',
          changes
        }
      }
    }
    
    return null
  }

  async validateChanges(changes) {
    const validated = []
    
    for (const change of changes) {
      try {
        const validationResult = this.validateChange(change)
        
        if (validationResult.isValid) {
          validated.push({
            ...change,
            validation: {
              status: 'valid',
              warnings: validationResult.warnings
            }
          })
        } else {
          validated.push({
            ...change,
            validation: {
              status: 'invalid',
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          })
          this.stats.validationErrors++
        }
        
      } catch (error) {
        console.warn(`Warning: Validation failed for ${change.path}: ${error.message}`)
        validated.push(change) // Keep original if validation fails
      }
    }
    
    return validated
  }

  validateChange(change) {
    const errors = []
    const warnings = []
    
    // Check for reasonable file sizes
    if (change.sourceFile?.size > this.options.maxReasonableFileSize) {
      warnings.push(`Large file size: ${this.formatBytes(change.sourceFile.size)}`)
    }
    
    // Check for suspicious path patterns
    if (change.path.includes('..')) {
      errors.push('Path contains parent directory references')
    }
    
    if (change.path.includes('\0')) {
      errors.push('Path contains null bytes')
    }
    
    // Check change type consistency
    if (change.changeType === 'new' && change.destFile) {
      errors.push('New file should not have destination file metadata')
    }
    
    if (change.changeType === 'deleted' && change.sourceFile) {
      errors.push('Deleted file should not have source file metadata')
    }
    
    if (change.changeType === 'modified' && (!change.sourceFile || !change.destFile)) {
      errors.push('Modified file must have both source and destination metadata')
    }
    
    // Check confidence scores
    if (change.confidence !== undefined && (change.confidence < 0 || change.confidence > 1)) {
      errors.push('Confidence score must be between 0 and 1')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  assignPriorities(changes) {
    return changes.map(change => {
      const cacheKey = `${change.changeType}:${change.path}`
      
      if (this.priorityCache.has(cacheKey)) {
        return { ...change, priority: this.priorityCache.get(cacheKey) }
      }
      
      const priority = this.calculateChangePriority(change)
      this.priorityCache.set(cacheKey, priority)
      
      return { ...change, priority }
    })
  }

  calculateChangePriority(change) {
    let priority = this.getChangePriority(change.changeType)
    
    // Adjust priority based on various factors
    
    // Critical files get higher priority
    if (this.isCriticalFile(change.path)) {
      priority -= 10
    }
    
    // Configuration files get higher priority
    if (this.isConfigFile(change.path)) {
      priority -= 5
    }
    
    // Large files get lower priority to process them last
    if (change.sourceFile?.size > 10 * 1024 * 1024) { // 10MB
      priority += 5
    }
    
    // Conflicts get higher priority for user attention
    if (change.conflict) {
      priority -= 15
    }
    
    // Binary files get lower priority
    if (change.sourceFile?.isBinary) {
      priority += 2
    }
    
    return priority
  }

  getChangePriority(changeType) {
    const priorities = {
      'deleted': 10,  // Process deletions first
      'modified': 20, // Then modifications
      'moved': 30,    // Then moves
      'new': 40       // Finally new files
    }
    
    return priorities[changeType] || 50
  }

  isCriticalFile(filePath) {
    const criticalPatterns = [
      /package\.json$/,
      /\.env$/,
      /\.gitignore$/,
      /README\.md$/,
      /\.claude\//,
      /config\./
    ]
    
    return criticalPatterns.some(pattern => pattern.test(filePath))
  }

  isConfigFile(filePath) {
    const configPatterns = [
      /\.json$/,
      /\.yaml$/,
      /\.yml$/,
      /\.toml$/,
      /\.ini$/,
      /\.conf$/,
      /config/i,
      /settings/i
    ]
    
    return configPatterns.some(pattern => pattern.test(filePath))
  }

  calculateBaseConfidence(change) {
    switch (change.changeType) {
      case 'new':
      case 'deleted':
        return 1.0 // File existence is binary
      case 'modified':
        return 0.9 // High confidence for modifications
      case 'moved':
        return 0.8 // Lower confidence for move detection
      default:
        return 0.5
    }
  }

  calculateFinalConfidence(change) {
    let confidence = change.classification.confidence
    
    // Adjust confidence based on various factors
    if (change.validation?.status === 'invalid') {
      confidence *= 0.5
    }
    
    if (change.conflict) {
      confidence *= 0.7
    }
    
    if (change.reasonAnalysis?.reliability === 'low') {
      confidence *= 0.8
    }
    
    return Math.max(0, Math.min(1, confidence))
  }

  analyzeChangeReason(change) {
    if (!change.reason) {
      return {
        reliability: 'low',
        clarity: 'poor',
        details: 'No reason provided'
      }
    }
    
    const reason = change.reason.toLowerCase()
    let reliability = 'medium'
    let clarity = 'fair'
    
    // High reliability indicators
    if (reason.includes('size changed') || reason.includes('does not exist')) {
      reliability = 'high'
      clarity = 'excellent'
    }
    
    // Medium reliability indicators
    if (reason.includes('modified time changed') || reason.includes('content has changed')) {
      reliability = 'medium'
      clarity = 'good'
    }
    
    // Low reliability indicators
    if (reason.includes('timestamp') && reason.includes('only')) {
      reliability = 'low'
      clarity = 'fair'
    }
    
    return {
      reliability,
      clarity,
      details: change.reason,
      analysis: `Reliability: ${reliability}, Clarity: ${clarity}`
    }
  }

  assessChangeRisk(change) {
    let riskScore = 0
    const factors = []
    
    // High risk factors
    if (change.changeType === 'deleted') {
      riskScore += 30
      factors.push('File deletion')
    }
    
    if (this.isCriticalFile(change.path)) {
      riskScore += 25
      factors.push('Critical file')
    }
    
    if (change.sourceFile?.size > 50 * 1024 * 1024) { // 50MB
      riskScore += 15
      factors.push('Large file')
    }
    
    // Medium risk factors
    if (change.changeType === 'moved') {
      riskScore += 10
      factors.push('File moved')
    }
    
    if (change.sourceFile?.isBinary) {
      riskScore += 10
      factors.push('Binary file')
    }
    
    // Low risk factors
    if (change.changeType === 'new') {
      riskScore += 5
      factors.push('New file')
    }
    
    // Determine risk level
    let level = 'low'
    if (riskScore >= 40) {level = 'high'}
    else if (riskScore >= 20) {level = 'medium'}
    
    return {
      level,
      score: riskScore,
      factors
    }
  }

  generateProcessingHints(change) {
    const hints = []
    
    if (change.sourceFile?.isBinary) {
      hints.push('binary-file')
    }
    
    if (change.sourceFile?.size > 10 * 1024 * 1024) {
      hints.push('large-file')
    }
    
    if (this.isCriticalFile(change.path)) {
      hints.push('critical-file')
    }
    
    if (change.changeType === 'deleted') {
      hints.push('requires-confirmation')
    }
    
    return hints
  }

  analyzeFile(fileMetadata) {
    return {
      type: fileMetadata.fileType || 'unknown',
      category: this.categorizeFile(fileMetadata),
      sizeCategory: fileMetadata.sizeCategory || 'unknown',
      isBinary: fileMetadata.isBinary || false,
      lastModified: new Date(fileMetadata.mtime).toISOString()
    }
  }

  categorizeFile(fileMetadata) {
    if (fileMetadata.isBinary) {
      if (fileMetadata.fileType === 'image') {return 'media'}
      if (fileMetadata.fileType === 'executable') {return 'executable'}
      return 'binary'
    }
    
    if (fileMetadata.fileType) {
      if (['javascript', 'typescript', 'python', 'java'].includes(fileMetadata.fileType)) {
        return 'source-code'
      }
      if (['json', 'yaml', 'xml'].includes(fileMetadata.fileType)) {
        return 'configuration'
      }
      if (['markdown', 'text'].includes(fileMetadata.fileType)) {
        return 'documentation'
      }
    }
    
    return 'text'
  }

  formatBytes(bytes) {
    if (bytes === 0) {return '0 B'}
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  getStats() {
    return {
      ...this.stats,
      processingTime: this.stats.startTime ? Date.now() - this.stats.startTime : 0,
      cacheSize: {
        similarity: this.similarityCache.size,
        priority: this.priorityCache.size
      }
    }
  }

  clearCache() {
    this.similarityCache.clear()
    this.priorityCache.clear()
  }
}

module.exports = ChangeClassifier