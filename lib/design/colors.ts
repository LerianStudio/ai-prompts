import chalk from 'chalk'

// Sparklines-inspired color palette
export const hexColors = {
  primary: chalk.hex('#c69a67'),
  secondary: chalk.hex('#59ddcd'),
  accent: chalk.hex('#c473dc'),
  success: chalk.hex('#50fa7b'),
  warning: chalk.hex('#ffb86c'),
  error: chalk.hex('#ff5555'),
  background: chalk.bgHex('#282a36'),
  text: chalk.white,
  dim: chalk.gray,
  bright: chalk.bold
}

export const colors = {
  primary: '#c69a67',
  secondary: '#59ddcd', 
  accent: '#c473dc',
  success: '#50fa7b',
  warning: '#ffb86c',
  error: '#ff5555',
  background: '#282a36',
  surface: '#44475a',
  text: 'white',
  textSecondary: '#f8f8f2',
  textDim: '#6272a4',
  border: '#6272a4',
  borderFocus: '#c69a67',
  borderDim: '#44475a'
}

export const gradients = {
  morning: ['#ff9a56', '#ffad56'],
  sunset: ['#c473dc', '#59ddcd'],
  ocean: ['#59ddcd', '#50fa7b'],
  fire: ['#ff5555', '#ffb86c']
}

export type ColorKey = keyof typeof colors
export type HexColorKey = keyof typeof hexColors
export type GradientKey = keyof typeof gradients