/**
 * Utility Type Definitions
 * Common utility types and helper interfaces
 */

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>
export type Nullable<T> = T | null
export type Undefined<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Function types
export type AnyFunction = (...args: any[]) => any
export type NoArgFunction<T = void> = () => T
export type SingleArgFunction<A, T = void> = (arg: A) => T
export type AsyncFunction<A extends any[] = [], T = void> = (...args: A) => Promise<T>

// Object types
export type AnyObject = Record<string, any>
export type StringRecord = Record<string, string>
export type NumberRecord = Record<string, number>
export type BooleanRecord = Record<string, boolean>

// Array types
export type NonEmptyArray<T> = [T, ...T[]]
export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
export type ArrayIndices<T extends readonly any[]> = Exclude<keyof T, keyof any[]>

// Promise types
export type PromiseType<T> = T extends Promise<infer U> ? U : T
export type MaybePromise<T> = T | Promise<T>

// Class types
export type Constructor<T = {}> = new (...args: any[]) => T
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T
export type ClassInstance<T> = T extends Constructor<infer U> ? U : never

// Key/Value types
export type KeyOf<T> = keyof T
export type ValueOf<T> = T[keyof T]
export type Entries<T> = Array<[KeyOf<T>, ValueOf<T>]>

// Deep utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P]
}

// Conditional types
export type If<C extends boolean, T, F> = C extends true ? T : F
export type Not<C extends boolean> = C extends true ? false : true
export type And<A extends boolean, B extends boolean> = A extends true ? B : false
export type Or<A extends boolean, B extends boolean> = A extends true ? true : B

// String manipulation types
export type Uppercase<S extends string> = Intrinsic
export type Lowercase<S extends string> = Intrinsic
export type Capitalize<S extends string> = Intrinsic
export type Uncapitalize<S extends string> = Intrinsic

// Template literal types
export type Join<T extends string[], D extends string> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends string
    ? R extends readonly string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : string
    : string
  : string

export type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

// Number types
export type Increment<N extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N]
export type Decrement<N extends number> = [never, never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][N]

// Branded types
export type Brand<T, B> = T & { readonly __brand: B }
export type Branded<T, B extends string> = T & { readonly [K in `__brand_${B}`]: true }

// Result types for error handling
export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  success: true
  data: T
  error?: never
}

export interface Failure<E> {
  success: false
  data?: never
  error: E
}

// Option type for nullable values
export type Option<T> = Some<T> | None

export interface Some<T> {
  type: 'some'
  value: T
}

export interface None {
  type: 'none'
  value?: never
}

// State machine types
export type StateDefinition<S extends string, E extends string> = {
  [State in S]: {
    on: {
      [Event in E]?: S
    }
  }
}

// Event emitter types
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T
export type EventReceiver<T> = (params: T) => void

// Validation types
export interface ValidationRule<T> {
  validate: (value: T) => boolean
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export type Validator<T> = (value: T) => ValidationResult

// Configuration types
export type ConfigSchema<T> = {
  [K in keyof T]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    default?: T[K]
    validate?: Validator<T[K]>
    description?: string
  }
}

// Memoization types
export type MemoizedFunction<T extends AnyFunction> = T & {
  cache: Map<string, ReturnType<T>>
  clear: () => void
}

// Throttle/Debounce types
export type ThrottledFunction<T extends AnyFunction> = T & {
  cancel: () => void
  flush: () => void
}

export type DebouncedFunction<T extends AnyFunction> = T & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
}

// Observer pattern types
export interface Observer<T> {
  update: (data: T) => void
}

export interface Observable<T> {
  subscribe: (observer: Observer<T>) => () => void
  unsubscribe: (observer: Observer<T>) => void
  notify: (data: T) => void
}

// Plugin system types
export interface Plugin<T = AnyObject> {
  name: string
  version: string
  install: (app: T, options?: AnyObject) => void
  uninstall?: (app: T) => void
}

export interface PluginManager<T = AnyObject> {
  install: (plugin: Plugin<T>, options?: AnyObject) => void
  uninstall: (pluginName: string) => void
  get: (pluginName: string) => Plugin<T> | undefined
  list: () => Plugin<T>[]
  has: (pluginName: string) => boolean
}

// Middleware types
export type Middleware<T = AnyObject> = (
  context: T,
  next: () => Promise<void> | void
) => Promise<void> | void

export interface MiddlewareManager<T = AnyObject> {
  use: (middleware: Middleware<T>) => void
  execute: (context: T) => Promise<void>
  clear: () => void
}

// Cache types
export interface Cache<K = string, V = any> {
  get: (key: K) => V | undefined
  set: (key: K, value: V, ttl?: number) => void
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  size: number
}

export interface CacheOptions {
  maxSize?: number
  ttl?: number
  onEvict?: (key: any, value: any) => void
}

// Queue types
export interface Queue<T> {
  enqueue: (item: T) => void
  dequeue: () => T | undefined
  peek: () => T | undefined
  size: number
  isEmpty: boolean
  clear: () => void
}

export interface PriorityQueue<T> extends Queue<T> {
  enqueue: (item: T, priority: number) => void
}

// Tree types
export interface TreeNode<T> {
  value: T
  children: TreeNode<T>[]
  parent?: TreeNode<T>
}

export interface Tree<T> {
  root: TreeNode<T>
  add: (value: T, parent?: TreeNode<T>) => TreeNode<T>
  remove: (node: TreeNode<T>) => boolean
  find: (predicate: (value: T) => boolean) => TreeNode<T> | undefined
  traverse: (callback: (node: TreeNode<T>) => void, order?: 'pre' | 'post' | 'level') => void
}

// State management types
export type Reducer<S, A> = (state: S, action: A) => S
export type ActionCreator<T = AnyObject> = (...args: any[]) => T
export type Selector<S, T> = (state: S) => T

export interface Store<S, A = AnyObject> {
  getState: () => S
  dispatch: (action: A) => void
  subscribe: (listener: () => void) => () => void
  replaceReducer: (reducer: Reducer<S, A>) => void
}

// Serialization types
export interface Serializer<T> {
  serialize: (value: T) => string
  deserialize: (data: string) => T
}

// Logging types
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  metadata?: AnyObject
}

export interface Logger {
  trace: (message: string, metadata?: AnyObject) => void
  debug: (message: string, metadata?: AnyObject) => void
  info: (message: string, metadata?: AnyObject) => void
  warn: (message: string, metadata?: AnyObject) => void
  error: (message: string, metadata?: AnyObject) => void
  fatal: (message: string, metadata?: AnyObject) => void
  log: (level: LogLevel, message: string, metadata?: AnyObject) => void
}

// Performance monitoring types
export interface PerformanceMark {
  name: string
  startTime: number
  duration?: number
  metadata?: AnyObject
}

export interface PerformanceMonitor {
  mark: (name: string) => void
  measure: (name: string, startMark?: string, endMark?: string) => PerformanceMark
  getMarks: () => PerformanceMark[]
  clear: (name?: string) => void
}

// Testing types
export type TestFunction = () => void | Promise<void>
export type BeforeEachFunction = () => void | Promise<void>
export type AfterEachFunction = () => void | Promise<void>

export interface TestSuite {
  name: string
  tests: Test[]
  beforeEach?: BeforeEachFunction
  afterEach?: AfterEachFunction
}

export interface Test {
  name: string
  fn: TestFunction
  timeout?: number
  skip?: boolean
  only?: boolean
}

// Utility functions type definitions
export interface UtilityFunctions {
  // Object utilities
  clone: <T>(obj: T) => T
  merge: <T extends AnyObject>(target: T, ...sources: Partial<T>[]) => T
  pick: <T, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>
  omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>
  
  // Array utilities
  chunk: <T>(array: T[], size: number) => T[][]
  flatten: <T>(array: (T | T[])[]) => T[]
  uniq: <T>(array: T[]) => T[]
  difference: <T>(array1: T[], array2: T[]) => T[]
  
  // String utilities
  camelCase: (str: string) => string
  kebabCase: (str: string) => string
  snakeCase: (str: string) => string
  capitalize: (str: string) => string
  truncate: (str: string, length: number) => string
  
  // Function utilities
  debounce: <T extends AnyFunction>(fn: T, delay: number) => DebouncedFunction<T>
  throttle: <T extends AnyFunction>(fn: T, delay: number) => ThrottledFunction<T>
  memoize: <T extends AnyFunction>(fn: T) => MemoizedFunction<T>
  
  // Type checking utilities
  isString: (value: any) => value is string
  isNumber: (value: any) => value is number
  isBoolean: (value: any) => value is boolean
  isObject: (value: any) => value is AnyObject
  isArray: (value: any) => value is any[]
  isFunction: (value: any) => value is AnyFunction
  isPromise: (value: any) => value is Promise<any>
  isNull: (value: any) => value is null
  isUndefined: (value: any) => value is undefined
}

// Export common type aliases
export type ID = string | number
export type Timestamp = number | Date
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

// Generic utility types for API responses
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    [key: string]: any
  }
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Generic CRUD operations
export interface CrudOperations<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  create: (input: CreateInput) => Promise<T>
  read: (id: ID) => Promise<T | null>
  update: (id: ID, input: UpdateInput) => Promise<T>
  delete: (id: ID) => Promise<boolean>
  list: (options?: {
    page?: number
    limit?: number
    sort?: string
    filter?: Partial<T>
  }) => Promise<PaginatedResponse<T>>
}