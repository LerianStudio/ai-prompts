/**
 * Component Type Definitions
 * Types for all TUI components and their props
 */

import { ReactNode } from 'react'
import { SpacingSize, BorderStyle, TypographyVariant, FontWeight } from '../design'

// Base component props that all components inherit
export interface BaseComponentProps {
  children?: ReactNode
  className?: string
  id?: string
  testId?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

// Layout-related props
export interface LayoutProps extends BaseComponentProps {
  width?: number | string
  height?: number | string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  
  // Flexbox
  flexDirection?: 'row' | 'column'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
  gap?: SpacingSize
  
  // Position
  position?: 'relative' | 'absolute'
  top?: number
  right?: number
  bottom?: number
  left?: number
  
  // Display
  display?: 'flex' | 'none'
  overflow?: 'visible' | 'hidden'
  overflowX?: 'visible' | 'hidden'
  overflowY?: 'visible' | 'hidden'
}

// Spacing props
export interface SpacingProps {
  padding?: SpacingSize
  paddingX?: SpacingSize
  paddingY?: SpacingSize
  paddingTop?: SpacingSize
  paddingRight?: SpacingSize
  paddingBottom?: SpacingSize
  paddingLeft?: SpacingSize
  margin?: SpacingSize
  marginX?: SpacingSize
  marginY?: SpacingSize
  marginTop?: SpacingSize
  marginRight?: SpacingSize
  marginBottom?: SpacingSize
  marginLeft?: SpacingSize
}

// Visual styling props
export interface VisualProps {
  backgroundColor?: string
  borderStyle?: BorderStyle
  borderColor?: string
  borderTopColor?: string
  borderRightColor?: string
  borderBottomColor?: string
  borderLeftColor?: string
  opacity?: number
  zIndex?: number
}

// Text styling props
export interface TextProps extends BaseComponentProps {
  variant?: TypographyVariant
  weight?: FontWeight
  color?: string
  backgroundColor?: string
  dimColor?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  inverse?: boolean
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end'
}

// Interactive component props
export interface InteractiveProps {
  disabled?: boolean
  loading?: boolean
  focused?: boolean
  hovered?: boolean
  pressed?: boolean
  selected?: boolean
  onPress?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onHover?: () => void
  onKeyPress?: (key: KeyPressEvent) => void
}

// Component state types
export type ComponentState = 'idle' | 'loading' | 'success' | 'error' | 'disabled'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'

// Key press event
export interface KeyPressEvent {
  name?: string
  sequence?: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  option?: boolean
  raw?: string
}

// File selector component types
export interface FileItem {
  path: string
  name: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  changeType?: 'new' | 'modified' | 'deleted' | 'moved'
  reason?: string
  isSelected?: boolean
  isVisible?: boolean
  isHighlighted?: boolean
}

export interface FileSelectorProps extends BaseComponentProps, InteractiveProps {
  files: FileItem[]
  multiSelect?: boolean
  searchable?: boolean
  virtualized?: boolean
  showPreview?: boolean
  filterTypes?: string[]
  sortBy?: 'name' | 'size' | 'modified' | 'type'
  sortOrder?: 'asc' | 'desc'
  onSelectionChange?: (selected: FileItem[]) => void
  onFileSelect?: (file: FileItem) => void
  onFilePreview?: (file: FileItem) => void
}

// Progress component types
export interface ProgressInfo {
  current: number
  total: number
  percentage: number
  speed?: number
  eta?: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
}

export interface ProgressProps extends BaseComponentProps, VisualProps {
  value: number
  max?: number
  indeterminate?: boolean
  showPercentage?: boolean
  showETA?: boolean
  showSpeed?: boolean
  animated?: boolean
  size?: ComponentSize
  variant?: ComponentVariant
  label?: string
  description?: string
}

// Input component types
export interface InputProps extends BaseComponentProps, InteractiveProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'url' | 'search'
  maxLength?: number
  multiline?: boolean
  rows?: number
  autoFocus?: boolean
  clearable?: boolean
  size?: ComponentSize
  variant?: ComponentVariant
  error?: boolean
  errorMessage?: string
  helperText?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onClear?: () => void
}

// Button component types
export interface ButtonProps extends BaseComponentProps, InteractiveProps {
  variant?: ComponentVariant
  size?: ComponentSize
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  loadingText?: string
}

// Modal/Dialog component types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  title?: string
  description?: string
  size?: ComponentSize
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  onClose?: () => void
  onOpen?: () => void
}

// Table component types
export interface TableColumn<T = any> {
  key: string
  title: string
  width?: number | string
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: T, index: number) => ReactNode
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  multiSelect?: boolean
  virtualized?: boolean
  pageSize?: number
  showHeader?: boolean
  showFooter?: boolean
  onSort?: (key: string, order: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  onSelect?: (selected: T[]) => void
}

// Menu/Dropdown component types
export interface MenuItem {
  key: string
  label: ReactNode
  value?: any
  disabled?: boolean
  divider?: boolean
  icon?: ReactNode
  shortcut?: string
  children?: MenuItem[]
}

export interface MenuProps extends BaseComponentProps, InteractiveProps {
  items: MenuItem[]
  selectedKey?: string
  defaultSelectedKey?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'click' | 'hover' | 'focus'
  closeOnSelect?: boolean
  onSelect?: (item: MenuItem) => void
}

// Toast/Notification component types
export interface ToastProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  size?: ComponentSize
  text?: string
  overlay?: boolean
}

// Error boundary types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

// Theme-related component types
export interface ThemeProviderProps extends BaseComponentProps {
  theme?: string
  customTheme?: any
}

// Animation/Transition types
export interface TransitionProps extends BaseComponentProps {
  in?: boolean
  duration?: number
  easing?: string
  onEnter?: () => void
  onEntering?: () => void
  onEntered?: () => void
  onExit?: () => void
  onExiting?: () => void
  onExited?: () => void
}

// Viewport/Container types
export interface ViewportInfo {
  width: number
  height: number
  orientation?: 'portrait' | 'landscape'
  supportsColor: boolean
  supportsTrueColor: boolean
  supportsUnicode: boolean
}

export interface ContainerProps extends BaseComponentProps, LayoutProps, SpacingProps, VisualProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centerContent?: boolean
  responsive?: boolean
  maxWidth?: number | string
}

// Progress component props
export interface SmartProgressProps extends BaseComponentProps {
  current?: number
  total?: number
  label?: string
  showPercentage?: boolean
  showETA?: boolean
  showSpeed?: boolean
  showRemaining?: boolean
  showElapsed?: boolean
  unit?: string
  speedUnit?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showBar?: boolean
  barWidth?: number
  precision?: number
  smoothing?: boolean
  minUpdateInterval?: number
  style?: LayoutProps
  onComplete?: () => void
  onProgress?: (current: number, total: number, percentage: number) => void
}

export interface ProgressItem {
  key?: string
  current: number
  total: number
  label: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  unit?: string
  speedUnit?: string
  showETA?: boolean
  showSpeed?: boolean
  showRemaining?: boolean
  props?: Partial<SmartProgressProps>
}

export interface ProgressGroupProps extends BaseComponentProps {
  items: ProgressItem[]
  title?: string
  showOverall?: boolean
  overallLabel?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  maxHeight?: number
  style?: LayoutProps
  onComplete?: () => void
  onItemComplete?: (index: number) => void
  onProgress?: (index: number, current: number, total: number, percentage: number) => void
}

// Export combined component prop types
export type AllComponentProps = 
  | BaseComponentProps
  | LayoutProps  
  | SpacingProps
  | VisualProps
  | TextProps
  | InteractiveProps
  | FileSelectorProps
  | ProgressProps
  | SmartProgressProps
  | ProgressGroupProps
  | InputProps
  | ButtonProps
  | ModalProps
  | TableProps
  | MenuProps
  | ToastProps
  | LoadingProps
  | ErrorBoundaryProps
  | ThemeProviderProps
  | TransitionProps
  | ContainerProps