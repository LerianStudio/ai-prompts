const { logger } = require('../utils/logger')

const debug = {
  log: (message, ...args) => {
    if (process.env.DEBUG_INSTALLER || process.env.NODE_ENV === 'development') {
      logger.debug(message, ...args)
    }
  },
  error: (message, error) => {
    logger.error(message, error?.message || error)
    if (error?.stack && process.env.DEBUG_INSTALLER) {
      logger.debug(error.stack)
    }
  }
}

module.exports = { debug }