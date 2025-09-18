/**
 * Centralized configuration management for Lerian Protocol services
 * Handles environment variables with validation and defaults
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration schema definition
 */
const CONFIG_SCHEMA = {
  // Environment
  NODE_ENV: {
    type: 'string',
    default: 'development',
    enum: ['development', 'production', 'test']
  },
  
  // Logging
  LOG_LEVEL: {
    type: 'string', 
    default: 'info',
    enum: ['error', 'warn', 'info', 'debug']
  },
  LOG_DIR: {
    type: 'string',
    default: join(__dirname, '../../infrastructure/logs')
  },
  
  // Services
  TASK_SERVICE_URL: {
    type: 'url',
    default: 'http://localhost:3020'
  },
  TASK_SERVICE_HOST: {
    type: 'string',
    default: 'localhost'
  },
  BOARD_EXECUTOR_HOST: {
    type: 'string',
    default: 'localhost'
  },
  TASK_SERVICE_PORT: {
    type: 'number',
    default: 3020
  },
  BOARD_EXECUTOR_HOST: {
    type: 'string',
    default: 'localhost'
  },
  BOARD_EXECUTOR_PORT: {
    type: 'number',
    default: 3025
  },
  
  // Database (PostgreSQL)
  DB_HOST: {
    type: 'string',
    default: 'postgres'
  },
  DB_PORT: {
    type: 'number',
    default: 5432
  },
  DB_NAME: {
    type: 'string',
    default: 'board_api'
  },
  DB_USER: {
    type: 'string',
    default: 'board_user'
  },
  DB_PASSWORD: {
    type: 'string',
    default: 'board_password'
  },
  
  // Security
  ALLOWED_ORIGINS: {
    type: 'array',
    default: ['http://localhost:3000', 'http://localhost:3020']
  },
  
  // Performance
  DB_CONNECTION_POOL_SIZE: {
    type: 'number',
    default: 10
  },
  REQUEST_TIMEOUT: {
    type: 'number', 
    default: 30000
  }
};

/**
 * Parse and validate environment variable value
 */
function parseValue(value, schema) {
  if (value === undefined || value === '') {
    return schema.default;
  }
  
  switch (schema.type) {
    case 'string':
      if (schema.enum && !schema.enum.includes(value)) {
        throw new Error(`Invalid value '${value}'. Must be one of: ${schema.enum.join(', ')}`);
      }
      return value;
      
    case 'number':
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
      
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1';
      
    case 'array':
      return value.split(',').map(item => item.trim()).filter(Boolean);
      
    case 'url':
      try {
        new URL(value);
        return value;
      } catch {
        throw new Error(`Invalid URL: ${value}`);
      }
      
    default:
      return value;
  }
}

/**
 * Load and validate configuration
 */
function loadConfig() {
  const config = {};
  const errors = [];
  
  // Load from environment variables
  for (const [key, schema] of Object.entries(CONFIG_SCHEMA)) {
    try {
      config[key] = parseValue(process.env[key], schema);
    } catch (error) {
      errors.push(`${key}: ${error.message}`);
    }
  }
  
  // Validate required configuration
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return config;
}

/**
 * Get configuration for specific service
 */
function getServiceConfig(serviceName) {
  const config = loadConfig();
  
  // Add service-specific configuration
  switch (serviceName) {
    case 'board-mcp':
      return {
        ...config,
        serviceName: 'board-mcp',
        serviceUrl: config.TASK_SERVICE_URL
      };
      
    case 'board-api':
      return {
        ...config,
        serviceName: 'board-api',
        host: process.env.HOST || config.TASK_SERVICE_HOST,
        port: process.env.PORT || config.TASK_SERVICE_PORT,
        database: {
          host: config.DB_HOST,
          port: config.DB_PORT,
          database: config.DB_NAME,
          user: config.DB_USER,
          password: config.DB_PASSWORD
        }
      };

    case 'board-executor':
      return {
        ...config,
        serviceName: 'board-executor',
        host: process.env.HOST || config.BOARD_EXECUTOR_HOST,
        port: process.env.BOARD_EXECUTOR_PORT || config.BOARD_EXECUTOR_PORT
      };
      
    case 'sync-tools':
      return {
        ...config,
        serviceName: 'sync-tools'
      };
      
    default:
      return {
        ...config,
        serviceName: serviceName || 'unknown'
      };
  }
}

/**
 * Validate configuration and log startup info
 */
function validateConfig(serviceName, logger) {
  try {
    const config = getServiceConfig(serviceName);
    
    logger.info('Configuration loaded successfully', {
      service: serviceName,
      environment: config.NODE_ENV,
      logLevel: config.LOG_LEVEL,
      // Don't log sensitive values
      configKeys: Object.keys(config).filter(key => !key.includes('SECRET') && !key.includes('PASSWORD'))
    });
    
    return config;
  } catch (error) {
    logger.fatal('Configuration validation failed', { error: error.message });
    throw error;
  }
}

/**
 * Load environment file if it exists
 */
function loadEnvFile(envPath) {
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Only set if not already in process.env
          if (!process.env[key]) {
            process.env[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
          }
        }
        return acc;
      }, {});
    
    return envVars;
  }
  return {};
}

export {
  getServiceConfig,
  validateConfig,
  loadEnvFile,
  CONFIG_SCHEMA
};