const chalk = require('chalk')

const debug = {
  log: (message, ...args) => {
    if (process.env.DEBUG_INSTALLER || process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
      console.log(
        chalk.gray(timestamp),
        chalk.gray('[DEBUG]'),
        message,
        ...args
      )
    }
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    console.error(
      chalk.gray(timestamp),
      chalk.red.bold('[ERROR]'),
      message,
      error?.message || error
    )
    if (error?.stack && process.env.DEBUG_INSTALLER) {
      console.log(chalk.gray(error.stack))
    }
  }
}

module.exports = { debug }
