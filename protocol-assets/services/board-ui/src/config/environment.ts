/**
 * Environment configuration for board-service frontend
 * Provides type-safe access to environment variables with fallbacks
 */

export interface EnvironmentConfig {
  apiBaseUrl: string
  wsUrl: string
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Get WebSocket URL with automatic protocol detection and fallbacks
 */
export function getWebSocketUrl(): string {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }

  // Fallback: construct from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = import.meta.env.VITE_WS_PORT || '3020'
  
  return `${protocol}//${host}:${port}`
}

/**
 * Get API base URL with fallbacks
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // Fallback: construct from current location
  const protocol = window.location.protocol
  const host = window.location.hostname
  const port = import.meta.env.VITE_API_PORT || '3020'
  
  return `${protocol}//${host}:${port}`
}

/**
 * Environment configuration object
 */
export const environment: EnvironmentConfig = {
  apiBaseUrl: getApiBaseUrl(),
  wsUrl: getWebSocketUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
}

/**
 * Development helper to log configuration
 */
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    apiBaseUrl: environment.apiBaseUrl,
    wsUrl: environment.wsUrl,
    mode: import.meta.env.MODE
  })
}