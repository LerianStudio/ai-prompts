/**
 * Ink-UI Theme Integration
 * Modern theming system that bridges our design system with Ink-UI components
 */

import { 
  defaultTheme as inkUIDefaultTheme,
  extendTheme,
  type ComponentTheme,
  type Theme as InkUITheme
} from '@inkjs/ui'
import { colors } from './colors'
import { themes, type Theme as CustomTheme } from './themes'
import type { TextProps, BoxProps } from 'ink'

// Extended component themes for Ink-UI components
interface ExtendedComponentTheme extends ComponentTheme {
  config?: () => any
  variants?: Record<string, ComponentTheme>
}

// Ink-UI component style generators
const createComponentStyles = (customTheme: CustomTheme) => ({
  // Alert component styling
  Alert: {
    styles: {
      container: ({ variant }: { variant?: 'info' | 'success' | 'error' | 'warning' }) => ({
        borderStyle: customTheme.borders.default,
        borderColor: 
          variant === 'error' ? customTheme.colors.border.error :
          variant === 'warning' ? colors.semantic.state.warning :
          variant === 'success' ? customTheme.colors.border.success :
          customTheme.colors.border.primary,
        paddingX: 1,
        paddingY: 1,
        marginBottom: 1,
      } as BoxProps),
      icon: ({ variant }: { variant?: 'info' | 'success' | 'error' | 'warning' }) => ({
        color: 
          variant === 'error' ? customTheme.colors.border.error :
          variant === 'warning' ? colors.semantic.state.warning :
          variant === 'success' ? customTheme.colors.border.success :
          customTheme.colors.brand.primary,
      } as TextProps),
      title: () => ({
        color: customTheme.colors.text.primary,
        bold: true,
      } as TextProps),
      message: () => ({
        color: customTheme.colors.text.secondary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // StatusMessage component styling  
  StatusMessage: {
    styles: {
      container: ({ variant }: { variant?: 'info' | 'success' | 'error' | 'warning' }) => ({
        borderStyle: 'single',
        borderColor: 
          variant === 'error' ? customTheme.colors.border.error :
          variant === 'warning' ? colors.semantic.state.warning :
          variant === 'success' ? customTheme.colors.border.success :
          customTheme.colors.border.primary,
        paddingX: 1,
        marginBottom: 1,
      } as BoxProps),
      icon: ({ variant }: { variant?: 'info' | 'success' | 'error' | 'warning' }) => ({
        color: 
          variant === 'error' ? customTheme.colors.border.error :
          variant === 'warning' ? colors.semantic.state.warning :
          variant === 'success' ? customTheme.colors.border.success :
          customTheme.colors.brand.primary,
      } as TextProps),
      content: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // ProgressBar component styling
  ProgressBar: {
    styles: {
      container: () => ({
        borderStyle: 'round',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
        paddingY: 1,
      } as BoxProps),
      bar: ({ value }: { value?: number }) => ({
        backgroundColor: value && value >= 100 
          ? customTheme.colors.border.success 
          : customTheme.colors.brand.primary,
      } as BoxProps),
      track: () => ({
        backgroundColor: customTheme.colors.surface.muted,
      } as BoxProps),
      label: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
      percentage: () => ({
        color: customTheme.colors.text.secondary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // Spinner component styling
  Spinner: {
    styles: {
      container: () => ({
        gap: 1,
      } as BoxProps),
      frame: () => ({
        color: customTheme.colors.brand.primary,
      } as TextProps),
      label: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // MultiSelect component styling
  MultiSelect: {
    styles: {
      container: () => ({
        borderStyle: 'round',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
        paddingY: 1,
      } as BoxProps),
      option: ({ isHighlighted, isSelected }: { isHighlighted?: boolean; isSelected?: boolean }) => ({
        backgroundColor: isHighlighted ? customTheme.colors.surface.hover : undefined,
        color: isSelected ? customTheme.colors.border.success : customTheme.colors.text.primary,
      } as BoxProps & TextProps),
      selectedIndicator: () => ({
        color: customTheme.colors.border.success,
      } as TextProps),
      highlightedIndicator: () => ({
        color: customTheme.colors.brand.primary,
      } as TextProps),
      label: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // Select component styling
  Select: {
    styles: {
      container: () => ({
        borderStyle: 'single',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
        paddingY: 1,
      } as BoxProps),
      option: ({ isHighlighted, isSelected }: { isHighlighted?: boolean; isSelected?: boolean }) => ({
        backgroundColor: isHighlighted ? customTheme.colors.surface.hover : undefined,
        color: isSelected ? customTheme.colors.brand.primary : customTheme.colors.text.primary,
      } as BoxProps & TextProps),
      highlightedIndicator: () => ({
        color: customTheme.colors.brand.primary,
      } as TextProps),
      selectedIndicator: () => ({
        color: customTheme.colors.border.success,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // TextInput component styling
  TextInput: {
    styles: {
      container: () => ({
        borderStyle: 'single',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
      } as BoxProps),
      input: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
      placeholder: () => ({
        color: customTheme.colors.text.tertiary,
        dimColor: true,
      } as TextProps),
      cursor: () => ({
        color: customTheme.colors.brand.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // PasswordInput component styling
  PasswordInput: {
    styles: {
      container: () => ({
        borderStyle: 'single',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
      } as BoxProps),
      input: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
      placeholder: () => ({
        color: customTheme.colors.text.tertiary,
        dimColor: true,
      } as TextProps),
      mask: () => ({
        color: customTheme.colors.text.secondary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // EmailInput component styling
  EmailInput: {
    styles: {
      container: () => ({
        borderStyle: 'single',
        borderColor: customTheme.colors.border.primary,
        paddingX: 1,
      } as BoxProps),
      input: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
      placeholder: () => ({
        color: customTheme.colors.text.tertiary,
        dimColor: true,
      } as TextProps),
      suggestion: () => ({
        color: customTheme.colors.text.secondary,
        dimColor: true,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // ConfirmInput component styling
  ConfirmInput: {
    styles: {
      container: () => ({
        borderStyle: 'double',
        borderColor: customTheme.colors.border.focus,
        paddingX: 1,
        paddingY: 1,
      } as BoxProps),
      prompt: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
      choice: ({ isSelected }: { isSelected?: boolean }) => ({
        color: isSelected ? customTheme.colors.brand.primary : customTheme.colors.text.secondary,
        bold: isSelected,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // Badge component styling
  Badge: {
    styles: {
      container: ({ color }: { color?: string }) => ({
        borderStyle: 'single',
        borderColor: 
          color === 'red' ? customTheme.colors.border.error :
          color === 'green' ? customTheme.colors.border.success :
          color === 'yellow' ? colors.semantic.state.warning :
          color === 'blue' ? customTheme.colors.brand.primary :
          customTheme.colors.border.primary,
        paddingX: 1,
      } as BoxProps),
      content: ({ color }: { color?: string }) => ({
        color: 
          color === 'red' ? customTheme.colors.border.error :
          color === 'green' ? customTheme.colors.border.success :
          color === 'yellow' ? colors.semantic.state.warning :
          color === 'blue' ? customTheme.colors.brand.primary :
          customTheme.colors.text.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,

  // UnorderedList component styling
  UnorderedList: {
    styles: {
      container: () => ({
        flexDirection: 'column',
      } as BoxProps),
      item: () => ({
        marginBottom: 1,
      } as BoxProps),
      marker: () => ({
        color: customTheme.colors.brand.primary,
        marginRight: 1,
      } as TextProps),
      content: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
    },
    config: () => ({
      marker: customTheme.name === 'Minimal' ? '-' : 
              customTheme.name === 'Cyberpunk' ? '▶' :
              customTheme.name === 'High Contrast' ? '●' : '•',
    }),
  } satisfies ExtendedComponentTheme,

  // OrderedList component styling
  OrderedList: {
    styles: {
      container: () => ({
        flexDirection: 'column',
      } as BoxProps),
      item: () => ({
        marginBottom: 1,
      } as BoxProps),
      number: () => ({
        color: customTheme.colors.brand.primary,
        marginRight: 1,
      } as TextProps),
      content: () => ({
        color: customTheme.colors.text.primary,
      } as TextProps),
    },
  } satisfies ComponentTheme,
})

// Create theme variants for different contexts
const createThemeVariants = (customTheme: CustomTheme) => ({
  // Compact variant for space-constrained interfaces
  compact: extendTheme(inkUIDefaultTheme, {
    components: {
      ...createComponentStyles(customTheme),
      Alert: {
        styles: {
          container: () => ({
            borderStyle: 'minimal',
            paddingX: 1,
            marginBottom: 0,
          } as BoxProps),
        },
      } satisfies ComponentTheme,
      StatusMessage: {
        styles: {
          container: () => ({
            borderStyle: 'minimal', 
            paddingX: 1,
            marginBottom: 0,
          } as BoxProps),
        },
      } satisfies ComponentTheme,
    },
  }),

  // High contrast variant for accessibility
  accessible: extendTheme(inkUIDefaultTheme, {
    components: {
      ...createComponentStyles(customTheme),
      Alert: {
        styles: {
          container: ({ variant }: { variant?: 'info' | 'success' | 'error' | 'warning' }) => ({
            borderStyle: 'thick',
            borderColor: 
              variant === 'error' ? '#ff0000' :
              variant === 'warning' ? '#ffff00' :
              variant === 'success' ? '#00ff00' :
              '#ffffff',
          } as BoxProps),
        },
      } satisfies ComponentTheme,
    },
  }),

  // Minimal variant for clean interfaces
  minimal: extendTheme(inkUIDefaultTheme, {
    components: {
      ...createComponentStyles(customTheme),
      Alert: {
        styles: {
          container: () => ({
            borderStyle: 'minimal',
            borderColor: customTheme.colors.border.primary,
          } as BoxProps),
        },
      } satisfies ComponentTheme,
    },
  }),
})

// Main theme creation function
export const createInkUITheme = (themeName: keyof typeof themes): InkUITheme => {
  const customTheme = themes[themeName]
  const componentStyles = createComponentStyles(customTheme)
  
  return extendTheme(inkUIDefaultTheme, {
    components: componentStyles,
  })
}

// Theme variants creation function
export const createInkUIThemeWithVariants = (
  themeName: keyof typeof themes,
  variant?: 'compact' | 'accessible' | 'minimal'
) => {
  const customTheme = themes[themeName]
  const variants = createThemeVariants(customTheme)
  
  if (variant && variants[variant]) {
    return variants[variant]
  }
  
  return createInkUITheme(themeName)
}

// Pre-built Ink-UI themes for all custom themes
export const inkUIThemes = {
  default: createInkUITheme('default'),
  dark: createInkUITheme('dark'),
  highContrast: createInkUITheme('highContrast'),
  minimal: createInkUITheme('minimal'),
  cyberpunk: createInkUITheme('cyberpunk'),
} as const

// Theme utilities for Ink-UI integration
export const inkUIThemeUtils = {
  /**
   * Get Ink-UI theme by name
   */
  getTheme: (name: keyof typeof inkUIThemes): InkUITheme => inkUIThemes[name],
  
  /**
   * Get theme with variant
   */
  getThemeWithVariant: (
    name: keyof typeof themes, 
    variant?: 'compact' | 'accessible' | 'minimal'
  ): InkUITheme => createInkUIThemeWithVariants(name, variant),
  
  /**
   * Create custom Ink-UI theme
   */
  createCustomTheme: (
    baseName: keyof typeof themes,
    overrides: Partial<InkUITheme>
  ): InkUITheme => {
    const baseTheme = createInkUITheme(baseName)
    return extendTheme(baseTheme, overrides)
  },
  
  /**
   * Get system-appropriate theme
   */
  getSystemTheme: (): InkUITheme => {
    const systemPreference = process.env.TERM_THEME || 'auto'
    const isDark = systemPreference === 'dark' || 
                   (systemPreference === 'auto' && process.env.COLORTERM === 'truecolor')
    
    return isDark ? inkUIThemes.dark : inkUIThemes.default
  },
  
  /**
   * Auto-detect accessibility needs
   */
  getAccessibleTheme: (): InkUITheme => {
    const needsHighContrast = process.env.ACCESSIBILITY_HIGH_CONTRAST === 'true' ||
                              process.env.TERM_CONTRAST === 'high'
    
    return needsHighContrast 
      ? createInkUIThemeWithVariants('highContrast', 'accessible')
      : inkUIThemes.default
  },
}

// Theme context integration
export interface InkUIThemeContextValue {
  theme: InkUITheme
  themeName: keyof typeof inkUIThemes
  variant?: 'compact' | 'accessible' | 'minimal'
  setTheme: (name: keyof typeof inkUIThemes, variant?: 'compact' | 'accessible' | 'minimal') => void
  customTheme: CustomTheme
}

// Component prop types for themed components
export interface ThemedComponentProps {
  theme?: keyof typeof inkUIThemes
  variant?: 'compact' | 'accessible' | 'minimal'
}

// Theme-aware component utilities
export const themedComponentUtils = {
  /**
   * Get component props with theme
   */
  withTheme: <T extends Record<string, any>>(
    props: T & ThemedComponentProps,
    defaultTheme: keyof typeof inkUIThemes = 'default'
  ): T & { inkUITheme: InkUITheme } => {
    const { theme = defaultTheme, variant, ...componentProps } = props
    return {
      ...componentProps as T,
      inkUITheme: createInkUIThemeWithVariants(theme, variant),
    }
  },
  
  /**
   * Create themed component wrapper
   */
  createThemedComponent: <T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    defaultTheme: keyof typeof inkUIThemes = 'default'
  ) => {
    return (props: T & ThemedComponentProps) => {
      const themedProps = themedComponentUtils.withTheme(props, defaultTheme)
      return React.createElement(Component, themedProps)
    }
  },
}

// Export all theme-related utilities
export const modernTheming = {
  themes: inkUIThemes,
  utils: inkUIThemeUtils,
  components: themedComponentUtils,
  variants: createThemeVariants,
  create: createInkUITheme,
  createWithVariant: createInkUIThemeWithVariants,
} as const

// Type exports
export type InkUIThemeName = keyof typeof inkUIThemes
export type InkUIThemeVariant = 'compact' | 'accessible' | 'minimal'
export type InkUIExtendedTheme = InkUITheme
export type ThemedProps<T = {}> = T & ThemedComponentProps