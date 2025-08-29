/**
 * File System Type Definitions
 * Types for file operations and metadata
 */

// File system entry types
export type FileSystemEntryType = 'file' | 'directory' | 'symlink' | 'unknown'

export interface FileSystemEntry {
  path: string
  name: string
  type: FileSystemEntryType
  size: number
  created: Date
  modified: Date
  accessed: Date
  permissions: FilePermissions
  isHidden: boolean
  isReadonly: boolean
  checksum?: string
  
  // Extended metadata
  extension?: string
  mimeType?: string
  encoding?: string
  lineCount?: number // for text files
  
  // Parent/child relationships
  parent?: string
  children?: FileSystemEntry[]
  
  // Sync-specific
  syncStatus?: FileSyncStatus
  conflictInfo?: FileConflictInfo
}

// File permissions
export interface FilePermissions {
  owner: {
    read: boolean
    write: boolean
    execute: boolean
  }
  group: {
    read: boolean
    write: boolean
    execute: boolean
  }
  others: {
    read: boolean
    write: boolean
    execute: boolean
  }
  octal: string // e.g., "755"
  symbolic: string // e.g., "rwxr-xr-x"
}

// File sync status
export type FileSyncStatus = 
  | 'synced'
  | 'pending'
  | 'modified'
  | 'conflicted'
  | 'error'
  | 'ignored'
  | 'excluded'

export interface FileConflictInfo {
  type: 'content' | 'metadata' | 'permission' | 'timestamp'
  source: FileSystemEntry
  destination: FileSystemEntry
  resolution?: 'source' | 'destination' | 'merge' | 'manual'
  resolved: boolean
}

// File filtering and search
export interface FileFilter {
  name?: string | RegExp
  extension?: string[]
  mimeType?: string[]
  sizeMin?: number
  sizeMax?: number
  modifiedAfter?: Date
  modifiedBefore?: Date
  createdAfter?: Date
  createdBefore?: Date
  permissions?: Partial<FilePermissions>
  hidden?: boolean
  readonly?: boolean
  type?: FileSystemEntryType[]
  
  // Custom predicate
  custom?: (entry: FileSystemEntry) => boolean
}

export interface SearchOptions {
  query: string
  filters: FileFilter
  recursive: boolean
  caseSensitive: boolean
  useRegex: boolean
  maxResults: number
  sortBy: FileSortField
  sortOrder: 'asc' | 'desc'
  includeContent: boolean // Search within file content
}

export type FileSortField = 
  | 'name'
  | 'size'
  | 'modified'
  | 'created'
  | 'extension'
  | 'type'
  | 'permissions'

// File operations
export type FileOperationType = 
  | 'copy'
  | 'move'
  | 'rename'
  | 'delete'
  | 'create'
  | 'modify'
  | 'chmod'
  | 'touch'

export interface FileOperation {
  id: string
  type: FileOperationType
  source: string
  destination?: string
  timestamp: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number // 0-100
  error?: string
  metadata?: Record<string, any>
}

export interface FileOperationResult {
  operation: FileOperation
  success: boolean
  duration: number
  bytesProcessed?: number
  error?: {
    code: string
    message: string
    details?: any
  }
}

// File watching/monitoring
export type FileWatchEventType = 
  | 'created'
  | 'modified'
  | 'deleted'
  | 'moved'
  | 'renamed'
  | 'permission_changed'

export interface FileWatchEvent {
  type: FileWatchEventType
  path: string
  oldPath?: string // for move/rename events
  timestamp: Date
  details?: any
}

export interface FileWatcher {
  path: string
  recursive: boolean
  filters: FileFilter
  events: FileWatchEventType[]
  
  start(): Promise<void>
  stop(): Promise<void>
  pause(): void
  resume(): void
  isActive: boolean
  
  on(event: FileWatchEventType, handler: (event: FileWatchEvent) => void): void
  off(event: FileWatchEventType, handler: (event: FileWatchEvent) => void): void
}

// File preview and content
export interface FilePreviewOptions {
  maxSize: number // Maximum file size to preview
  encoding: 'utf8' | 'binary' | 'base64' | 'auto'
  lineLimit: number
  highlightSyntax: boolean
  showLineNumbers: boolean
  wrapText: boolean
  tabSize: number
}

export interface FilePreview {
  path: string
  type: 'text' | 'image' | 'binary' | 'archive' | 'unknown'
  content: string
  truncated: boolean
  lineCount: number
  size: number
  encoding: string
  
  // For text files
  language?: string
  syntaxHighlighted?: boolean
  
  // For images
  dimensions?: {
    width: number
    height: number
  }
  
  // For archives
  entries?: string[]
}

// File tree/directory structure
export interface FileTreeNode {
  entry: FileSystemEntry
  children: FileTreeNode[]
  expanded: boolean
  selected: boolean
  visible: boolean
  level: number
  
  // Tree navigation
  parent?: FileTreeNode
  nextSibling?: FileTreeNode
  previousSibling?: FileTreeNode
  
  // State
  loading?: boolean
  error?: string
}

export interface FileTreeOptions {
  showHidden: boolean
  showSize: boolean
  showDate: boolean
  showPermissions: boolean
  maxDepth: number
  sortBy: FileSortField
  sortOrder: 'asc' | 'desc'
  
  // Lazy loading
  lazyLoad: boolean
  chunkSize: number
  
  // Filtering
  filters: FileFilter
  
  // Virtual scrolling
  virtualized: boolean
  itemHeight: number
}

// Bulk operations
export interface BulkOperation {
  id: string
  name: string
  description: string
  operations: FileOperation[]
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: {
    completed: number
    total: number
    percentage: number
    currentOperation?: FileOperation
  }
  startTime?: Date
  endTime?: Date
  results: FileOperationResult[]
}

// File system utilities
export interface FileSystemUtilities {
  // Path operations
  join(...paths: string[]): string
  dirname(path: string): string
  basename(path: string, ext?: string): string
  extname(path: string): string
  normalize(path: string): string
  relative(from: string, to: string): string
  resolve(...paths: string[]): string
  
  // File operations
  exists(path: string): Promise<boolean>
  stat(path: string): Promise<FileSystemEntry>
  readdir(path: string): Promise<FileSystemEntry[]>
  readFile(path: string, encoding?: string): Promise<string | Buffer>
  writeFile(path: string, data: string | Buffer): Promise<void>
  copyFile(source: string, destination: string): Promise<void>
  moveFile(source: string, destination: string): Promise<void>
  deleteFile(path: string): Promise<void>
  
  // Directory operations
  mkdir(path: string, recursive?: boolean): Promise<void>
  rmdir(path: string, recursive?: boolean): Promise<void>
  
  // Permissions
  chmod(path: string, mode: string | number): Promise<void>
  chown(path: string, uid: number, gid: number): Promise<void>
  
  // Watching
  watch(path: string, options?: FileWatchOptions): FileWatcher
  
  // Search
  find(pattern: string, options?: SearchOptions): Promise<FileSystemEntry[]>
  
  // Checksums
  checksum(path: string, algorithm?: 'md5' | 'sha1' | 'sha256'): Promise<string>
  
  // Compression
  compress(paths: string[], output: string): Promise<void>
  extract(archive: string, destination: string): Promise<void>
}

export interface FileWatchOptions {
  recursive?: boolean
  persistent?: boolean
  encoding?: string
  filters?: FileFilter
}

// File comparison
export interface FileComparison {
  source: FileSystemEntry
  destination: FileSystemEntry
  identical: boolean
  differences: FileDifference[]
}

export interface FileDifference {
  type: 'content' | 'size' | 'timestamp' | 'permissions' | 'metadata'
  description: string
  sourceValue: any
  destinationValue: any
}

// Temporary files
export interface TemporaryFile {
  path: string
  created: Date
  autoCleanup: boolean
  cleanup(): Promise<void>
}

export interface TemporaryDirectory {
  path: string
  created: Date
  autoCleanup: boolean
  cleanup(): Promise<void>
}

// Archive handling
export interface ArchiveEntry {
  path: string
  size: number
  compressedSize: number
  modified: Date
  isDirectory: boolean
  crc: string
}

export interface ArchiveInfo {
  path: string
  type: 'zip' | 'tar' | 'gzip' | '7z' | 'rar' | 'unknown'
  entries: ArchiveEntry[]
  totalSize: number
  compressedSize: number
  compressionRatio: number
  created: Date
  encrypted: boolean
}

// Export utility types
export type FileHandler = (entry: FileSystemEntry) => Promise<void>
export type DirectoryHandler = (entries: FileSystemEntry[]) => Promise<void>
export type FilePathResolver = (path: string) => string
export type FileValidator = (entry: FileSystemEntry) => boolean

// Combined file management interface
export interface FileManager {
  utils: FileSystemUtilities
  createWatcher(path: string, options?: FileWatchOptions): FileWatcher
  createPreview(path: string, options?: FilePreviewOptions): Promise<FilePreview>
  compareFiles(source: string, destination: string): Promise<FileComparison>
  createBulkOperation(operations: FileOperation[]): BulkOperation
  createTemporaryFile(): Promise<TemporaryFile>
  createTemporaryDirectory(): Promise<TemporaryDirectory>
  
  // Archive operations
  getArchiveInfo(path: string): Promise<ArchiveInfo>
  extractArchive(archive: string, destination: string): Promise<void>
  createArchive(paths: string[], output: string): Promise<void>
}