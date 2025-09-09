/**
 * Production-safe logging utility
 * Only logs in development mode or when explicitly enabled
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enableLogging = process.env.ENABLE_LOGGING === 'true';
  }

  /**
   * Log info messages (only in development)
   */
  info(...args) {
    if (this.isDevelopment || this.enableLogging) {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  }

  /**
   * Log warnings (only in development)
   */
  warn(...args) {
    if (this.isDevelopment || this.enableLogging) {
      console.warn('[WARN]', new Date().toISOString(), ...args);
    }
  }

  /**
   * Log errors (always logged for monitoring)
   */
  error(...args) {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args) {
    if (this.isDevelopment) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }

  /**
   * Log WebSocket events (only in development)
   */
  ws(...args) {
    if (this.isDevelopment) {
      console.log('[WS]', new Date().toISOString(), ...args);
    }
  }

  /**
   * Log server startup/shutdown (always logged)
   */
  server(...args) {
    console.log('[SERVER]', new Date().toISOString(), ...args);
  }
}

export const logger = new Logger();