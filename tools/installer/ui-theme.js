const chalk = require('chalk')
const ora = require('ora')

const theme = {
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

const SpinnerManager = {
  create: (text, options = {}) => {
    return ora({
      text,
      spinner: 'dots',
      color: 'cyan',
      ...options
    })
  },

  withProgress: (text, current, total) => {
    return ora({
      text: `${text} (${current}/${total})`,
      spinner: 'dots',
      color: 'cyan'
    })
  }
}

const output = {
  log: (message) => {
    console.log(message)
  },

  success: (message) => {
    console.log(theme.success(`✅ ${message}`))
  },

  error: (message) => {
    console.error(theme.error(`❌ ${message}`))
  },

  warning: (message) => {
    console.log(theme.warning(`⚠️  ${message}`))
  },

  info: (message) => {
    console.log(theme.info(`ℹ️  ${message}`))
  },

  debug: (message) => {
    console.log(theme.muted(`🔧 ${message}`))
  },

  highlight: (message) => {
    console.log(theme.highlight(message))
  }
}

module.exports = {
  theme,
  SpinnerManager,
  output
}