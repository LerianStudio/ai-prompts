/**
 * Theme System Type Definitions
 * Types for theming and visual customization
 */

// Color system types
export interface ColorToken {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface ColorPalette {
  primary: ColorToken
  secondary: ColorToken
  neutral: ColorToken
  success: ColorToken
  warning: ColorToken
  error: ColorToken
  info: ColorToken
}

export interface SemanticColors {
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    link: string
    linkHover: string
    disabled: string
  }
  background: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    overlay: string
    disabled: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
    error: string
    success: string
    warning: string
    disabled: string
  }
  surface: {
    background: string
    foreground: string
    muted: string
    selected: string
    hover: string
    pressed: string
    disabled: string
  }
  state: {
    success: string
    warning: string
    error: string
    info: string
  }
}

// Typography types
export interface TypographyScale {
  xs: number
  sm: number
  base: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
  '4xl': number
  '5xl': number
  '6xl': number
}

export interface FontWeights {
  thin: number
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
  extrabold: number
  black: number
}

export interface LineHeights {
  none: number
  tight: number
  snug: number
  normal: number
  relaxed: number
  loose: number
}

export interface TypographyVariant {
  size: number
  weight: number
  lineHeight: number
  letterSpacing: number
  fontFamily?: string
}

export interface Typography {
  fontWeights: FontWeights
  fontSizes: TypographyScale
  lineHeights: LineHeights
  variants: {
    h1: TypographyVariant
    h2: TypographyVariant
    h3: TypographyVariant
    h4: TypographyVariant
    h5: TypographyVariant
    h6: TypographyVariant
    body: TypographyVariant
    bodySmall: TypographyVariant
    bodyLarge: TypographyVariant
    caption: TypographyVariant
    label: TypographyVariant
    button: TypographyVariant
    code: TypographyVariant
    codeBlock: TypographyVariant
  }
}

// Spacing types
export interface SpacingScale {
  0: number
  0.5: number
  1: number
  1.5: number
  2: number
  2.5: number
  3: number
  3.5: number
  4: number
  5: number
  6: number
  7: number
  8: number
  9: number
  10: number
  11: number
  12: number
  14: number
  16: number
  20: number
  24: number
  28: number
  32: number
  36: number
  40: number
  44: number
  48: number
  52: number
  56: number
  60: number
  64: number
  72: number
  80: number
  96: number
}

export interface SpacingTokens {
  component: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  layout: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
    '3xl': number
  }
  content: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

// Border types
export interface BorderStyles {
  none: BorderCharacterSet
  single: BorderCharacterSet
  double: BorderCharacterSet
  rounded: BorderCharacterSet
  thick: BorderCharacterSet
  dotted: BorderCharacterSet
  dashed: BorderCharacterSet
  classic: BorderCharacterSet
  minimal: BorderCharacterSet
}

export interface BorderCharacterSet {
  topLeft: string
  top: string
  topRight: string
  right: string
  bottomRight: string
  bottom: string
  bottomLeft: string
  left: string
}

export interface BorderWidths {
  0: number
  1: number
  2: number
  4: number
  8: number
}

// Animation types
export interface AnimationDurations {
  instant: number
  fast: number
  normal: number
  slow: number
  slower: number
  slowest: number
}

export interface AnimationEasings {
  linear: string
  easeIn: string
  easeOut: string
  easeInOut: string
  smooth: string
  snappy: string
  bouncy: string
}

export interface Animations {
  durations: AnimationDurations
  easings: AnimationEasings
  spinners: {
    dots: string[]
    line: string[]
    arrow: string[]
    bounce: string[]
    pulse: string[]
  }
}

// Shadow types (using terminal characters)
export interface ShadowTokens {
  sm: string
  md: string
  lg: string
  xl: string
}

// Component variants
export interface ComponentVariants {
  sizes: {
    xs: ComponentSizeTokens
    sm: ComponentSizeTokens
    md: ComponentSizeTokens
    lg: ComponentSizeTokens
    xl: ComponentSizeTokens
  }
  variants: {
    default: ComponentVariantTokens
    primary: ComponentVariantTokens
    secondary: ComponentVariantTokens
    success: ComponentVariantTokens
    warning: ComponentVariantTokens
    error: ComponentVariantTokens
    outline: ComponentVariantTokens
    ghost: ComponentVariantTokens
  }
}

export interface ComponentSizeTokens {
  padding: number
  fontSize: number
  lineHeight: number
  borderWidth: number
  minHeight: number
}

export interface ComponentVariantTokens {
  backgroundColor: string
  color: string
  borderColor: string
  hoverBackgroundColor: string
  hoverColor: string
  hoverBorderColor: string
  focusBackgroundColor: string
  focusColor: string
  focusBorderColor: string
  disabledBackgroundColor: string
  disabledColor: string
  disabledBorderColor: string
}

// Main theme interface
export interface Theme {
  name: string
  version: string
  description?: string
  
  // Core tokens
  colors: ColorPalette & SemanticColors
  typography: Typography
  spacing: SpacingTokens
  borders: {
    styles: BorderStyles
    widths: BorderWidths
    radius: Record<string, number>
  }
  shadows: ShadowTokens
  animations: Animations
  
  // Component tokens
  components: ComponentVariants & {
    // Component-specific overrides
    button: Partial<ComponentVariants>
    input: Partial<ComponentVariants>
    modal: Partial<ComponentVariants>
    table: Partial<ComponentVariants>
    card: Partial<ComponentVariants>
    menu: Partial<ComponentVariants>
    toast: Partial<ComponentVariants>
  }
  
  // Terminal-specific
  terminal: {
    cursor: {
      style: 'block' | 'underline' | 'line'
      blink: boolean
      color: string
    }
    selection: {
      backgroundColor: string
      color: string
    }
    
    // ANSI color mappings
    ansi: {
      black: string
      red: string
      green: string
      yellow: string
      blue: string
      magenta: string
      cyan: string
      white: string
      brightBlack: string
      brightRed: string
      brightGreen: string
      brightYellow: string
      brightBlue: string
      brightMagenta: string
      brightCyan: string
      brightWhite: string
    }
  }
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  
  // Z-index scale
  zIndex: {
    base: number
    dropdown: number
    modal: number
    tooltip: number
    toast: number
    overlay: number
  }
}

// Theme configuration
export interface ThemeConfig {
  default: string
  themes: Record<string, Theme>
  customThemes?: Record<string, Partial<Theme>>
  darkMode: {
    enabled: boolean
    auto: boolean
    strategy: 'class' | 'media'
  }
  accessibility: {
    highContrast: boolean
    reduceMotion: boolean
    colorBlindFriendly: boolean
  }
}

// Theme context
export interface ThemeContext {
  theme: Theme
  themeName: string
  setTheme: (name: string) => void
  customizeTheme: (overrides: Partial<Theme>) => void
  resetTheme: () => void
  
  // Responsive helpers
  breakpoint: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Accessibility
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersColorScheme: 'light' | 'dark'
}

// Theme utilities
export interface ThemeUtilities {
  // Color utilities
  colors: {
    alpha: (color: string, alpha: number) => string
    lighten: (color: string, amount: number) => string
    darken: (color: string, amount: number) => string
    mix: (color1: string, color2: string, amount: number) => string
    contrast: (color: string, light: string, dark: string) => string
    isLight: (color: string) => boolean
    isDark: (color: string) => boolean
    getLuminance: (color: string) => number
    getContrast: (foreground: string, background: string) => number
  }
  
  // Spacing utilities
  spacing: {
    responsive: (size: keyof SpacingTokens['component'], breakpoint?: string) => number
    clamp: (min: number, value: number, max: number) => number
    scale: (value: number, factor: number) => number
  }
  
  // Typography utilities
  typography: {
    fluidScale: (minSize: number, maxSize: number, minViewport: number, maxViewport: number) => string
    lineHeight: (fontSize: number, scale: number) => number
    optimalLineLength: (fontSize: number) => number
  }
  
  // Animation utilities
  animation: {
    duration: (speed: keyof AnimationDurations) => number
    easing: (type: keyof AnimationEasings) => string
    delay: (multiplier: number) => number
  }
  
  // Component utilities
  component: {
    variant: (component: string, variant: string, size: string) => ComponentVariantTokens & ComponentSizeTokens
    focus: (color?: string) => object
    hover: (color?: string) => object
    disabled: () => object
  }
}

// Theme validation
export interface ThemeValidator {
  validate: (theme: Theme) => ThemeValidationResult
  validateColors: (colors: any) => string[]
  validateTypography: (typography: any) => string[]
  validateSpacing: (spacing: any) => string[]
  validateComponents: (components: any) => string[]
}

export interface ThemeValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Theme builder
export interface ThemeBuilder {
  create: (name: string) => ThemeBuilder
  extend: (baseTheme: Theme) => ThemeBuilder
  setColors: (colors: Partial<ColorPalette & SemanticColors>) => ThemeBuilder
  setTypography: (typography: Partial<Typography>) => ThemeBuilder
  setSpacing: (spacing: Partial<SpacingTokens>) => ThemeBuilder
  setComponents: (components: Partial<ComponentVariants>) => ThemeBuilder
  build: () => Theme
}

// Theme persistence
export interface ThemePersistence {
  save: (theme: Theme, name: string) => Promise<void>
  load: (name: string) => Promise<Theme>
  list: () => Promise<string[]>
  delete: (name: string) => Promise<void>
  export: (theme: Theme) => string
  import: (data: string) => Theme
}

// Theme events
export type ThemeEventType = 
  | 'theme-change'
  | 'theme-load'
  | 'theme-save'
  | 'theme-delete'
  | 'theme-error'
  | 'breakpoint-change'
  | 'accessibility-change'

export interface ThemeEvent {
  type: ThemeEventType
  theme?: Theme
  themeName?: string
  previousTheme?: Theme
  previousThemeName?: string
  breakpoint?: string
  error?: string
  timestamp: Date
}

// Export utility types
export type ThemeToken = keyof Theme
export type ColorName = keyof ColorPalette
export type SemanticColorName = keyof SemanticColors
export type SpacingSize = keyof SpacingTokens['component']
export type TypographyVariantName = keyof Typography['variants']
export type BorderStyleName = keyof BorderStyles
export type ComponentSize = keyof ComponentVariants['sizes']
export type ComponentVariant = keyof ComponentVariants['variants']
export type BreakpointName = keyof Theme['breakpoints']

// Theme hook return type
export interface UseThemeReturn extends ThemeContext {
  utils: ThemeUtilities
  validator: ThemeValidator
  builder: ThemeBuilder
  persistence: ThemePersistence
}