import { extendTheme, defaultTheme } from '@inkjs/ui'
import { colors, hexColors } from './colors.js'
import figures from 'figures'

export const sparklineTheme = extendTheme(defaultTheme, {
  components: {
    Select: {
      styles: {
        selectedIndicator: () => ({
          color: colors.primary,
        }),
        focusIndicator: () => ({
          color: colors.primary,
        }),
        label({ isFocused, isSelected }) {
          let color
          let backgroundColor
          if (isSelected) {
            color = colors.primary
          }
          if (isFocused) {
            color = 'black'
            backgroundColor = 'gray'
          }
          return { color, backgroundColor }
        },
      },
    },
    MultiSelect: {
      styles: {
        selectedIndicator: () => ({
          color: colors.primary,
        }),
        focusIndicator: () => ({
          color: colors.primary,
        }),
        label({ isFocused, isSelected }) {
          let color
          let backgroundColor
          if (isSelected) {
            color = colors.primary
          }
          if (isFocused) {
            color = 'black'
            backgroundColor = 'gray'
          }
          return { color, backgroundColor }
        },
      },
    },
    ProgressBar: {
      styles: {
        completed: () => ({
          color: colors.primary,
        }),
      },
      config: () => ({
        completedCharacter: figures.square,
        remainingCharacter: figures.squareMediumShade,
      }),
    },
  },
})

export const themes = {
  default: sparklineTheme,
  dark: sparklineTheme, 
  cyberpunk: extendTheme(sparklineTheme, {
    components: {
      Select: {
        styles: {
          selectedIndicator: () => ({
            color: colors.accent,
          }),
          focusIndicator: () => ({
            color: colors.accent,
          }),
        },
      },
    },
  }),
}

export type ThemeVariant = keyof typeof themes
export default sparklineTheme