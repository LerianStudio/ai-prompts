/**
 * Event System Type Definitions
 * Types for component events and user interactions
 */

// Base event types
export interface BaseEvent {
  type: string
  timestamp: Date
  target?: any
  source?: string
  metadata?: Record<string, any>
}

// Keyboard events
export interface KeyboardEvent extends BaseEvent {
  type: 'keypress' | 'keydown' | 'keyup'
  key: {
    name?: string
    sequence?: string
    raw?: string
    
    // Modifiers
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    option?: boolean
    
    // Special keys
    arrow?: 'up' | 'down' | 'left' | 'right'
    function?: number // F1, F2, etc.
    
    // Character info
    char?: string
    code?: string
  }
  preventDefault?: () => void
  stopPropagation?: () => void
}

// Mouse events (for terminals that support mouse)
export interface MouseEvent extends BaseEvent {
  type: 'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave'
  position: {
    x: number
    y: number
    column: number
    row: number
  }
  button: 'left' | 'right' | 'middle' | 'none'
  buttons: {
    left: boolean
    right: boolean
    middle: boolean
  }
  modifiers: {
    ctrl: boolean
    shift: boolean
    alt: boolean
    meta: boolean
  }
  preventDefault?: () => void
  stopPropagation?: () => void
}

// Focus events
export interface FocusEvent extends BaseEvent {
  type: 'focus' | 'blur'
  relatedTarget?: any
}

// Input events
export interface InputEvent extends BaseEvent {
  type: 'input' | 'change' | 'submit'
  value: string
  previousValue?: string
  isValid?: boolean
  validationErrors?: string[]
}

// Selection events
export interface SelectionEvent extends BaseEvent {
  type: 'select' | 'deselect' | 'selectAll' | 'deselectAll'
  selected: any[]
  previouslySelected: any[]
  item?: any
  index?: number
}

// Navigation events
export interface NavigationEvent extends BaseEvent {
  type: 'navigate' | 'back' | 'forward' | 'home' | 'end'
  from?: any
  to?: any
  direction?: 'up' | 'down' | 'left' | 'right' | 'previous' | 'next'
}

// Resize events
export interface ResizeEvent extends BaseEvent {
  type: 'resize'
  dimensions: {
    width: number
    height: number
    columns: number
    rows: number
  }
  previousDimensions?: {
    width: number
    height: number
    columns: number
    rows: number
  }
}

// File events
export interface FileEvent extends BaseEvent {
  type: 'file-select' | 'file-deselect' | 'file-preview' | 'file-open' | 'file-close'
  file: {
    path: string
    name: string
    type: 'file' | 'directory'
    size?: number
    modified?: Date
  }
  files?: any[] // For multiple selection
}

// Progress events
export interface ProgressEvent extends BaseEvent {
  type: 'progress-start' | 'progress-update' | 'progress-complete' | 'progress-error'
  progress: {
    current: number
    total: number
    percentage: number
    message?: string
    eta?: number
    speed?: number
  }
}

// Modal/Dialog events
export interface ModalEvent extends BaseEvent {
  type: 'modal-open' | 'modal-close' | 'modal-confirm' | 'modal-cancel'
  modalId: string
  result?: any
  reason?: 'user' | 'escape' | 'overlay' | 'programmatic'
}

// Menu events
export interface MenuEvent extends BaseEvent {
  type: 'menu-open' | 'menu-close' | 'menu-select' | 'menu-hover'
  menuId?: string
  item?: {
    key: string
    label: string
    value: any
  }
}

// Toast/Notification events
export interface ToastEvent extends BaseEvent {
  type: 'toast-show' | 'toast-hide' | 'toast-click' | 'toast-action'
  toast: {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    duration?: number
  }
}

// Search events
export interface SearchEvent extends BaseEvent {
  type: 'search-start' | 'search-update' | 'search-complete' | 'search-clear'
  query: string
  results?: any[]
  filters?: Record<string, any>
}

// Scroll events
export interface ScrollEvent extends BaseEvent {
  type: 'scroll' | 'scroll-start' | 'scroll-end'
  position: {
    top: number
    left: number
    bottom: number
    right: number
  }
  direction?: 'up' | 'down' | 'left' | 'right'
  delta?: {
    x: number
    y: number
  }
}

// Drag and drop events (conceptual for terminal)
export interface DragEvent extends BaseEvent {
  type: 'drag-start' | 'drag-move' | 'drag-end' | 'drop'
  item: any
  position: {
    x: number
    y: number
  }
  dropTarget?: any
}

// Command events
export interface CommandEvent extends BaseEvent {
  type: 'command-execute' | 'command-complete' | 'command-error'
  command: string
  args: string[]
  result?: any
  error?: string
}

// Theme events
export interface ThemeEvent extends BaseEvent {
  type: 'theme-change'
  theme: string
  previousTheme?: string
}

// Error events
export interface ErrorEvent extends BaseEvent {
  type: 'error' | 'warning' | 'info'
  error: {
    name: string
    message: string
    stack?: string
    code?: string | number
    details?: any
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
}

// State change events
export interface StateChangeEvent extends BaseEvent {
  type: 'state-change'
  state: any
  previousState: any
  path?: string[] // For nested state changes
}

// Custom event types
export interface CustomEvent extends BaseEvent {
  type: string
  detail: any
}

// Event handler types
export type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => void
export type AsyncEventHandler<T extends BaseEvent = BaseEvent> = (event: T) => Promise<void>

// Event listener options
export interface EventListenerOptions {
  once?: boolean
  passive?: boolean
  capture?: boolean
  signal?: AbortSignal
}

// Event emitter interface
export interface EventEmitter {
  on<T extends BaseEvent>(event: string, handler: EventHandler<T>, options?: EventListenerOptions): void
  off<T extends BaseEvent>(event: string, handler: EventHandler<T>): void
  once<T extends BaseEvent>(event: string, handler: EventHandler<T>): void
  emit<T extends BaseEvent>(event: string, data: T): void
  removeAllListeners(event?: string): void
  listenerCount(event: string): number
  eventNames(): string[]
}

// Event bus for global events
export interface EventBus extends EventEmitter {
  namespace(ns: string): EventEmitter
  createGroup(name: string): EventEmitter
  removeGroup(name: string): void
  mute(event?: string): void
  unmute(event?: string): void
  clear(): void
}

// Event middleware
export type EventMiddleware<T extends BaseEvent = BaseEvent> = (
  event: T,
  next: (event: T) => void
) => void

// Event pipeline
export interface EventPipeline {
  use(middleware: EventMiddleware): void
  process<T extends BaseEvent>(event: T): Promise<T>
  clear(): void
}

// Event validation
export interface EventValidator<T extends BaseEvent = BaseEvent> {
  validate(event: T): boolean
  getErrors(event: T): string[]
}

// Event serialization
export interface EventSerializer {
  serialize(event: BaseEvent): string
  deserialize(data: string): BaseEvent
}

// Event store for event sourcing
export interface EventStore {
  append(events: BaseEvent[]): Promise<void>
  getEvents(streamId: string, fromVersion?: number): Promise<BaseEvent[]>
  getSnapshot(streamId: string): Promise<any>
  saveSnapshot(streamId: string, snapshot: any, version: number): Promise<void>
}

// Event replay
export interface EventReplay {
  record(event: BaseEvent): void
  replay(events: BaseEvent[]): Promise<void>
  clear(): void
  getRecording(): BaseEvent[]
}

// Event aggregation
export interface EventAggregator {
  aggregate(events: BaseEvent[]): any
  addRule(eventType: string, aggregation: (events: BaseEvent[]) => any): void
  removeRule(eventType: string): void
  clear(): void
}

// Union type of all event types
export type AnyEvent = 
  | KeyboardEvent
  | MouseEvent
  | FocusEvent
  | InputEvent
  | SelectionEvent
  | NavigationEvent
  | ResizeEvent
  | FileEvent
  | ProgressEvent
  | ModalEvent
  | MenuEvent
  | ToastEvent
  | SearchEvent
  | ScrollEvent
  | DragEvent
  | CommandEvent
  | ThemeEvent
  | ErrorEvent
  | StateChangeEvent
  | CustomEvent

// Event type guards
export const isKeyboardEvent = (event: BaseEvent): event is KeyboardEvent => 
  ['keypress', 'keydown', 'keyup'].includes(event.type)

export const isMouseEvent = (event: BaseEvent): event is MouseEvent => 
  ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave'].includes(event.type)

export const isFileEvent = (event: BaseEvent): event is FileEvent => 
  ['file-select', 'file-deselect', 'file-preview', 'file-open', 'file-close'].includes(event.type)

export const isProgressEvent = (event: BaseEvent): event is ProgressEvent => 
  ['progress-start', 'progress-update', 'progress-complete', 'progress-error'].includes(event.type)

// Event factory
export interface EventFactory {
  createKeyboardEvent(type: KeyboardEvent['type'], key: KeyboardEvent['key']): KeyboardEvent
  createMouseEvent(type: MouseEvent['type'], position: MouseEvent['position']): MouseEvent
  createFileEvent(type: FileEvent['type'], file: FileEvent['file']): FileEvent
  createProgressEvent(type: ProgressEvent['type'], progress: ProgressEvent['progress']): ProgressEvent
  createCustomEvent(type: string, detail: any): CustomEvent
}

// Export utility types
export type EventType = AnyEvent['type']
export type EventData<T extends EventType> = Extract<AnyEvent, { type: T }>
export type EventCallback<T extends EventType> = EventHandler<EventData<T>>