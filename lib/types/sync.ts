/**
 * Sync Operation Type Definitions
 * Types for file synchronization operations
 */

// Sync operation states
export type SyncState = 
  | 'idle'
  | 'detecting'
  | 'selecting'
  | 'syncing'
  | 'completed'
  | 'error'
  | 'cancelled'

// Change detection types
export type ChangeType = 'new' | 'modified' | 'deleted' | 'moved' | 'renamed'

export interface FileChange {
  path: string
  changeType: ChangeType
  reason?: string
  oldPath?: string // For moved/renamed files
  size?: number
  modified?: Date
  checksum?: string
  isDirectory: boolean
  isSelected: boolean
  conflicts?: FileConflict[]
}

export interface FileConflict {
  type: 'size' | 'modified' | 'checksum' | 'permissions'
  sourceValue: any
  destinationValue: any
  recommendation: 'source' | 'destination' | 'merge' | 'skip'
  resolved: boolean
}

// Sync configuration
export interface SyncConfig {
  sourceDirectory: string
  destinationDirectory: string
  includeDirectories: string[]
  excludePatterns: string[]
  dryRun: boolean
  interactive: boolean
  confirmBeforeSync: boolean
  backupEnabled: boolean
  conflictResolution: 'prompt' | 'source' | 'destination' | 'skip'
  checksumValidation: boolean
  preserveTimestamps: boolean
  preservePermissions: boolean
  maxConcurrency: number
  retryAttempts: number
  retryDelay: number
}

// Sync operation result
export interface SyncResult {
  success: boolean
  startTime: Date
  endTime: Date
  duration: number
  
  // Statistics
  filesDetected: number
  filesSelected: number
  filesProcessed: number
  filesSucceeded: number
  filesFailed: number
  filesSkipped: number
  
  // Data transferred
  bytesTransferred: number
  
  // Details
  processedFiles: ProcessedFile[]
  errors: SyncError[]
  warnings: SyncWarning[]
  
  // Performance metrics
  averageSpeed: number // bytes per second
  peakSpeed: number
}

export interface ProcessedFile {
  path: string
  changeType: ChangeType
  status: 'success' | 'failed' | 'skipped'
  size: number
  duration: number
  error?: string
}

export interface SyncError {
  type: 'permission' | 'disk_space' | 'network' | 'checksum' | 'unknown'
  file: string
  message: string
  details?: any
  recoverable: boolean
  timestamp: Date
}

export interface SyncWarning {
  type: 'large_file' | 'old_file' | 'binary_file' | 'permission' | 'other'
  file: string
  message: string
  timestamp: Date
}

// Progress tracking
export interface SyncProgress {
  state: SyncState
  phase: string
  currentFile: string
  
  // Overall progress
  filesCompleted: number
  filesTotal: number
  filesPercentage: number
  
  // Data progress
  bytesTransferred: number
  bytesTotalEstimate: number
  bytesPercentage: number
  
  // Time estimates
  elapsedTime: number
  estimatedTimeRemaining?: number
  estimatedTotalTime?: number
  
  // Speed metrics
  currentSpeed: number // bytes per second
  averageSpeed: number
  
  // Current operation
  currentOperation: string
  operationProgress?: number // 0-100
  
  // Queue information
  queueLength: number
  activeOperations: number
}

// Sync events
export type SyncEventType = 
  | 'start'
  | 'progress'
  | 'file_start'
  | 'file_complete'
  | 'file_error'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'error'
  | 'cancel'

export interface SyncEvent<T = any> {
  type: SyncEventType
  timestamp: Date
  data: T
  session: string
}

// Sync session management
export interface SyncSession {
  id: string
  config: SyncConfig
  state: SyncState
  progress: SyncProgress
  result?: SyncResult
  events: SyncEvent[]
  startTime: Date
  endTime?: Date
  paused: boolean
  cancelled: boolean
}

// File system utilities
export interface FileStats {
  path: string
  isDirectory: boolean
  size: number
  modified: Date
  created: Date
  accessed: Date
  permissions: string
  checksum?: string
}

export interface DirectoryStats {
  path: string
  fileCount: number
  directoryCount: number
  totalSize: number
  largestFile: {
    path: string
    size: number
  }
  oldestFile: {
    path: string
    modified: Date
  }
  newestFile: {
    path: string
    modified: Date
  }
}

// Sync strategy types
export type SyncStrategy = 
  | 'mirror' // Make destination identical to source
  | 'merge'  // Combine source and destination
  | 'update' // Only update newer files
  | 'backup' // Copy all changes with versioning

export interface SyncStrategyConfig {
  strategy: SyncStrategy
  deleteExtraFiles: boolean
  updateExistingFiles: boolean
  createMissingDirectories: boolean
  preserveFileAttributes: boolean
  versioningEnabled: boolean
  versioningPattern?: string
}

// Pattern matching
export interface PatternRule {
  pattern: string
  type: 'include' | 'exclude'
  caseSensitive: boolean
  isRegex: boolean
  description?: string
}

export interface PatternMatcher {
  rules: PatternRule[]
  defaultAction: 'include' | 'exclude'
  
  match(path: string): boolean
  addRule(rule: PatternRule): void
  removeRule(index: number): void
  clearRules(): void
}

// Backup management
export interface BackupInfo {
  id: string
  sessionId: string
  timestamp: Date
  sourceDirectory: string
  backupLocation: string
  fileCount: number
  totalSize: number
  compressed: boolean
  encrypted: boolean
  retention: {
    keepDays: number
    keepVersions: number
  }
}

// Safety checks
export interface SafetyCheck {
  name: string
  description: string
  enabled: boolean
  check(config: SyncConfig): Promise<SafetyCheckResult>
}

export interface SafetyCheckResult {
  passed: boolean
  level: 'info' | 'warning' | 'error'
  message: string
  details?: string
  canProceed: boolean
  autoFix?: () => Promise<void>
}

// Performance monitoring
export interface PerformanceMetrics {
  sessionId: string
  startTime: Date
  
  // Resource usage
  cpuUsage: number[]
  memoryUsage: number[]
  diskUsage: {
    read: number[]
    write: number[]
  }
  
  // Network (if applicable)
  networkUsage?: {
    sent: number[]
    received: number[]
  }
  
  // Operation timings
  operationTimings: {
    detection: number
    selection: number
    validation: number
    transfer: number
    verification: number
  }
  
  // Throughput
  throughput: {
    filesPerSecond: number
    bytesPerSecond: number
    peakThroughput: number
  }
}

// Export utility types
export type SyncEventHandler<T = any> = (event: SyncEvent<T>) => void
export type ProgressCallback = (progress: SyncProgress) => void
export type ErrorHandler = (error: SyncError) => void
export type ConflictResolver = (conflict: FileConflict) => Promise<'source' | 'destination' | 'merge' | 'skip'>

// Combined sync types for convenience
export interface SyncOperation {
  session: SyncSession
  progress: SyncProgress
  config: SyncConfig
  start(): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  cancel(): Promise<void>
  on(event: SyncEventType, handler: SyncEventHandler): void
  off(event: SyncEventType, handler: SyncEventHandler): void
}