/**
 * CLI-focused logger for sync tools
 * Maintains console output for user interaction while adding structured logging
 */

import { createLogger } from './logger.js';

export function createCliLogger(toolName) {
  const logger = createLogger(`cli-${toolName}`);
  
  return {
    // User-facing messages (keep console output)
    info: (message, data = {}) => {
      console.log(message);
      logger.info(message, data);
    },
    
    warn: (message, data = {}) => {
      console.warn(message);
      logger.warn(message, data);
    },
    
    error: (message, data = {}) => {
      console.error(message);
      logger.error(message, data);
    },
    
    // Progress indicators
    progress: (message, data = {}) => {
      console.log(message);
      logger.info(`Progress: ${message}`, data);
    },
    
    // Success messages
    success: (message, data = {}) => {
      console.log(message);
      logger.info(`Success: ${message}`, data);
    },
    
    // Debug (only logged, not shown to user unless in debug mode)
    debug: (message, data = {}) => {
      if (process.env.DEBUG) {
        console.debug(message);
      }
      logger.debug(message, data);
    }
  };
}