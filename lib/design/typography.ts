export const typography = {
  fonts: {
    mono: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
    sans: 'system-ui, -apple-system, sans-serif'
  },
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem', 
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  leading: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

export const textStyles = {
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.leading.tight
  },
  
  subheading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.leading.snug
  },
  
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.leading.normal
  },
  
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.leading.normal
  },
  
  code: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    fontFamily: typography.fonts.mono
  }
}

export type TypographySize = keyof typeof typography.sizes
export type TypographyWeight = keyof typeof typography.weights
export type TextStyle = keyof typeof textStyles