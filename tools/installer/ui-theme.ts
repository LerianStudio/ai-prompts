import chalk from 'chalk'
import ora, { Ora, Options } from 'ora'

interface Theme {
  primary: typeof chalk.cyan
  success: typeof chalk.green
  error: typeof chalk.red
  warning: typeof chalk.yellow
  info: typeof chalk.blue
  muted: typeof chalk.gray
  highlight: typeof chalk.bold.white
  accent: typeof chalk.magenta
  gradient: {
    primary: ReturnType<typeof chalk.hex>
    secondary: ReturnType<typeof chalk.hex>
  }
}

interface SpinnerManagerType {
  create: (text: string, options?: Partial<Options>) => Ora
  withProgress: (text: string, current: number, total: number) => Ora
}

interface OutputType {
  log: (message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
  debug: (message: string) => void
  highlight: (message: string) => void
  json: (data: any) => void
}

export const theme: Theme = {
  primary: chalk.cyan,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.bold.white,
  accent: chalk.magenta,
  gradient: {
    primary: chalk.hex('#00ff88'),
    secondary: chalk.hex('#0088ff')
  }
}

export const SpinnerManager: SpinnerManagerType = {
  create: (text: string, options: Partial<Options> = {}): Ora => {
    return ora({
      text,
      spinner: 'dots',
      color: 'cyan',
      ...options
    })
  },

  withProgress: (text: string, current: number, total: number): Ora => {
    return ora({
      text: `${text} (${current}/${total})`,
      spinner: 'dots',
      color: 'cyan'
    })
  }
}

export const output: OutputType = {
  log: (message: string): void => {
    console.log(message)
  },

  success: (message: string): void => {
    console.log(theme.success(`✅ ${message}`))
  },

  error: (message: string): void => {
    console.error(theme.error(`❌ ${message}`))
  },

  warning: (message: string): void => {
    console.log(theme.warning(`⚠️  ${message}`))
  },

  info: (message: string): void => {
    console.log(theme.info(`ℹ️  ${message}`))
  },

  debug: (message: string): void => {
    console.log(theme.muted(`🔧 ${message}`))
  },

  highlight: (message: string): void => {
    console.log(theme.highlight(message))
  },

  json: (data: any): void => {
    console.log(JSON.stringify(data, null, 2))
  }
}
