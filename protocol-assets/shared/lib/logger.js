/**
 * Centralized logging configuration for Lerian Protocol services
 * Supports both winston and pino with environment-based configuration
 */

import pino from 'pino';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log configuration based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Create log directory path
const logDir = process.env.LOG_DIR || join(__dirname, '../../infrastructure/logs');

// Pino transport configuration
const transport = isDevelopment ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname',
    messageFormat: '[{service}] {msg}',
    levelFirst: true
  }
} : {
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: join(logDir, 'app.log'),
        mkdir: true
      }
    },
    {
      target: 'pino/file', 
      level: 'error',
      options: {
        destination: join(logDir, 'error.log'),
        mkdir: true
      }
    }
  ]
};

/**
 * Create a logger instance for a service
 * @param {string} serviceName - Name of the service (e.g., 'board-mcp', 'board-api')
 * @param {Object} options - Additional logger options
 * @returns {Object} Logger instance with standard methods
 */
export function createLogger(serviceName, options = {}) {
  const logger = pino({
    level: logLevel,
    name: serviceName,
    transport: isDevelopment ? transport : undefined,
    formatters: {
      level(label) {
        return { level: label };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options
  });

  // Add service context to all logs
  const childLogger = logger.child({ service: serviceName });

  return {
    debug: (msg, extra = {}) => childLogger.debug(extra, msg),
    info: (msg, extra = {}) => childLogger.info(extra, msg),
    warn: (msg, extra = {}) => childLogger.warn(extra, msg),
    error: (msg, extra = {}) => {
      if (extra instanceof Error) {
        childLogger.error({
          error: {
            message: extra.message,
            stack: extra.stack,
            name: extra.name
          }
        }, msg);
      } else {
        childLogger.error(extra, msg);
      }
    },
    fatal: (msg, extra = {}) => childLogger.fatal(extra, msg),
    
    // Convenience methods for common patterns
    request: (req, msg) => childLogger.info({
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.ip || req.connection?.remoteAddress
    }, msg || 'HTTP Request'),
    
    database: (operation, duration, extra = {}) => childLogger.info({
      operation,
      duration_ms: duration,
      ...extra
    }, `Database operation: ${operation}`),
    
    performance: (operation, duration, extra = {}) => childLogger.info({
      operation,
      duration_ms: duration,
      ...extra
    }, `Performance: ${operation}`),

    // Create child logger with additional context
    child: (context) => createLogger(serviceName, { ...options, base: { ...logger.bindings(), ...context } })
  };
}

/**
 * Default logger for shared utilities
 */
export const logger = createLogger('shared');

/**
 * Express middleware for request logging
 */
export function requestLogger(serviceName) {
  const log = createLogger(`${serviceName}-http`);
  
  return (req, res, next) => {
    const start = Date.now();
    
    // Log request
    log.request(req, 'Incoming request');
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      log.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration_ms: duration,
        contentLength: res.get('Content-Length')
      }, 'Request completed');
    });
    
    next();
  };
}

/**
 * Database operation logger wrapper
 */
export function withDatabaseLogging(logger, operation, fn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.database(operation, duration, { success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.database(operation, duration, { success: false, error: error.message });
      throw error;
    }
  };
}

export default { createLogger, logger, requestLogger, withDatabaseLogging };