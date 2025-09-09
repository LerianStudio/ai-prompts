/**
 * Pooled Database Manager
 * Enhanced database manager using connection pooling for better concurrent performance
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger, withDatabaseLogging } from '../logger.js';
import { getServiceConfig } from '../config.js';
import { SQLiteConnectionPool } from './connection-pool.js';
import { MigrationLock } from './migration-lock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PooledDatabaseManager {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath;
    this.logger = createLogger('pooled-database-manager');
    
    const config = getServiceConfig(options.serviceName || 'database');
    
    this.pool = new SQLiteConnectionPool({
      dbPath: this.dbPath,
      poolSize: config.DB_CONNECTION_POOL_SIZE || 10,
      acquireTimeout: options.acquireTimeout || 30000,
      idleTimeout: options.idleTimeout || 300000
    });
    
    this.migrationsPath = options.migrationsPath || 
      join(__dirname, '../../../services/board-api/migrations');
    
    this.migrationLock = new MigrationLock(this.dbPath, {
      timeout: options.migrationTimeout || 300000
    });
    
    this.initialized = false;
    this.healthCheckInterval = null;
    
    this.setupCleanupHandlers();
  }

  /**
   * Initialize the database and connection pool
   */
  async initialize() {
    if (this.initialized) return;
    
    this.logger.info('Initializing pooled database manager', { 
      dbPath: this.dbPath,
      poolSize: this.pool.poolSize,
      migrationsPath: this.migrationsPath
    });
    
    const dbDir = dirname(this.dbPath);
    await import('fs').then(fs => fs.promises.mkdir(dbDir, { recursive: true }));
    
    await this.pool.initialize();
    
    await this.runMigrations();
    
    this.startHealthMonitoring();
    
    this.initialized = true;
    
    this.logger.info('Pooled database manager initialized successfully', {
      path: this.dbPath,
      poolStats: this.pool.getStats(),
      features: ['connection_pooling', 'migration_locking', 'health_monitoring']
    });
  }

  /**
   * Execute a function with a pooled connection
   */
  async withConnection(fn) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return await this.pool.withConnection(fn);
  }

  /**
   * Execute database queries with performance logging
   */
  async run(sql, params = []) {
    return withDatabaseLogging(this.logger, 'run', async () => {
      return await this.withConnection(async (connection) => {
        return await connection.run(sql, params);
      });
    })();
  }

  async get(sql, params = []) {
    return withDatabaseLogging(this.logger, 'get', async () => {
      return await this.withConnection(async (connection) => {
        return await connection.get(sql, params);
      });
    })();
  }

  async all(sql, params = []) {
    return withDatabaseLogging(this.logger, 'all', async () => {
      return await this.withConnection(async (connection) => {
        return await connection.all(sql, params);
      });
    })();
  }

  /**
   * Execute a transaction with connection pooling
   */
  async transaction(fn) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return await this.pool.transaction(fn);
  }

  /**
   * Run database migrations with locking
   */
  async runMigrations() {
    return await this.migrationLock.withLock(async () => {
      try {
        this.logger.info('Starting database migrations', {
          migrationsPath: this.migrationsPath
        });
        
        await this.run(`
          CREATE TABLE IF NOT EXISTS migrations (
            id          INTEGER PRIMARY KEY,
            filename    TEXT NOT NULL UNIQUE,
            applied_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
            checksum    TEXT,
            execution_time_ms INTEGER
          )
        `);

        const appliedMigrations = await this.all('SELECT filename FROM migrations ORDER BY id');
        const appliedFilenames = appliedMigrations.map(row => row.filename);

        let migrationFiles;
        try {
          if (!existsSync(this.migrationsPath)) {
            this.logger.warn('No migrations directory found, skipping migrations', {
              migrationsPath: this.migrationsPath
            });
            return;
          }
          
          migrationFiles = readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();
        } catch (error) {
          this.logger.warn('Could not read migrations directory', {
            migrationsPath: this.migrationsPath,
            error: error.message
          });
          return;
        }

        for (const filename of migrationFiles) {
          if (!appliedFilenames.includes(filename)) {
            await this.applyMigration(filename);
          }
        }
        
        this.logger.info('All migrations completed successfully', {
          totalMigrations: migrationFiles.length,
          appliedCount: migrationFiles.length - appliedFilenames.length
        });
        
      } catch (error) {
        this.logger.error('Migration failed', { 
          error: error.message,
          stack: error.stack 
        });
        throw error;
      }
    });
  }

  /**
   * Apply a single migration
   */
  async applyMigration(filename) {
    const migrationStart = Date.now();
    
    this.logger.info('Applying migration', { filename });
    
    const migrationPath = join(this.migrationsPath, filename);
    
    // Security: Validate migration file path and extension
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }
    
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Security: Validate SQL content before execution
    if (this.containsDangerousSQLPatterns(sql)) {
      throw new Error(`Migration ${filename} contains potentially dangerous SQL patterns`);
    }
    
    // Calculate checksum for migration integrity
    const checksum = this.calculateChecksum(sql);
    
    await this.transaction(async (connection) => {
      // Split SQL by semicolons more safely, handling comments and strings
      const statements = this.parseSQL(sql);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            await connection.run(statement);
          } catch (stmtError) {
            this.logger.error('Failed to execute migration statement', {
              filename,
              statementIndex: i + 1,
              statement: statement.trim().substring(0, 200) + '...',
              error: stmtError.message
            });
            throw stmtError;
          }
        }
      }
      
      const executionTime = Date.now() - migrationStart;
      
      await connection.run(
        'INSERT INTO migrations (filename, checksum, execution_time_ms) VALUES (?, ?, ?)', 
        [filename, checksum, executionTime]
      );
      
      this.logger.info('Migration applied successfully', {
        filename,
        executionTime,
        checksum,
        statements: statements.length
      });
    });
  }

  /**
   * Calculate checksum for migration content
   */
  calculateChecksum(content) {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Security validation for SQL content
   */
  containsDangerousSQLPatterns(sql) {
    const dangerousPatterns = [
      // System commands
      /PRAGMA\s+(?!foreign_keys|journal_mode|table_info|database_list|compile_options|synchronous|cache_size|temp_store)/i,
      /ATTACH\s+DATABASE/i,
      /DETACH\s+DATABASE/i,
      
      // File operations  
      /readfile\s*\(/i,
      /writefile\s*\(/i,
      /load_extension\s*\(/i,
      
      // Potentially dangerous functions
      /system\s*\(/i,
      /shell\s*\(/i,
      /exec\s*\(/i,
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(sql));
  }

  /**
   * Parse SQL content into statements
   */
  parseSQL(sql) {
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];
      
      if (inComment) {
        if (char === '\n') {
          inComment = false;
        }
        continue;
      }
      
      if (!inString && char === '-' && nextChar === '-') {
        inComment = true;
        i++; // Skip next char
        continue;
      }
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        // Check for escaped quotes
        if (sql[i - 1] !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
      
      if (!inString && char === ';') {
        if (current.trim()) {
          statements.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    return statements;
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const stats = this.getStats();
        
        // Log pool statistics periodically  
        this.logger.debug('Database pool health check', stats);
        
        // Alert on concerning metrics
        if (stats.pool.pendingAcquisitions > 5) {
          this.logger.warn('High number of pending connection acquisitions', {
            pending: stats.pool.pendingAcquisitions,
            available: stats.pool.currentIdle
          });
        }
        
        if (stats.pool.currentBusy > stats.pool.totalConnections * 0.8) {
          this.logger.warn('Connection pool utilization high', {
            utilization: (stats.pool.currentBusy / stats.pool.totalConnections) * 100,
            busy: stats.pool.currentBusy,
            total: stats.pool.totalConnections
          });
        }
        
      } catch (error) {
        this.logger.error('Health check failed', { error: error.message });
      }
    }, 60000); // Every minute
  }

  /**
   * Get comprehensive database and pool statistics
   */
  getStats() {
    const poolStats = this.pool.getStats();
    
    return {
      database: {
        path: this.dbPath,
        initialized: this.initialized,
        migrationsPath: this.migrationsPath
      },
      pool: poolStats,
      migration: {
        lockFile: this.migrationLock.lockFile,
        isLocked: this.migrationLock.isLocked()
      }
    };
  }

  /**
   * Health check for monitoring systems
   */
  async healthCheck() {
    try {
      await this.withConnection(async (connection) => {
        await connection.get('SELECT 1 as health_check');
      });
      
      const stats = this.getStats();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ...stats
      };
      
    } catch (error) {
      this.logger.error('Database health check failed', { error: error.message });
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        ...this.getStats()
      };
    }
  }

  /**
   * Setup cleanup handlers
   */
  setupCleanupHandlers() {
    const cleanup = async () => {
      await this.destroy();
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  /**
   * Graceful shutdown
   */
  async destroy() {
    this.logger.info('Shutting down pooled database manager');
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Destroy connection pool
    if (this.pool) {
      await this.pool.destroy();
    }
    
    // Force release any migration locks
    if (this.migrationLock) {
      await this.migrationLock.forceRelease();
    }
    
    this.initialized = false;
    this.logger.info('Pooled database manager shutdown complete');
  }

  /**
   * Get database performance metrics and alerts
   */
  getMetrics() {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return this.pool.getDetailedMetrics();
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return this.pool.getPerformanceReport();
  }
  
  /**
   * Setup alert handlers for monitoring integrations
   */
  setupAlertHandlers(handlers = {}) {
    if (!this.pool || !this.pool.getMetricsCollector()) {
      this.logger.warn('Cannot setup alert handlers - metrics collection is disabled');
      return;
    }
    
    const metricsCollector = this.pool.getMetricsCollector();
    
    // Handle database alerts
    metricsCollector.on('alert', (alert) => {
      this.logger.error('Database performance alert', alert);
      
      if (handlers.onAlert) {
        handlers.onAlert(alert);
      }
      
      // Default alert actions based on type
      switch (alert.type) {
        case 'connectionExhaustion':
          if (handlers.onConnectionExhaustion) {
            handlers.onConnectionExhaustion(alert);
          }
          break;
        case 'highUtilization':
          if (handlers.onHighUtilization) {
            handlers.onHighUtilization(alert);
          }
          break;
        case 'highErrorRate':
          if (handlers.onHighErrorRate) {
            handlers.onHighErrorRate(alert);
          }
          break;
      }
    });
    
    // Handle alert resolution
    metricsCollector.on('alert-resolved', (resolution) => {
      this.logger.info('Database alert resolved', resolution);
      
      if (handlers.onAlertResolved) {
        handlers.onAlertResolved(resolution);
      }
    });
    
    this.logger.info('Database alert handlers configured', {
      handlers: Object.keys(handlers)
    });
  }

  /**
   * Legacy compatibility methods
   */
  getDatabase() {
    throw new Error('getDatabase() not supported with connection pooling. Use withConnection() instead.');
  }
  
  close() {
    return this.destroy();
  }
}

export default PooledDatabaseManager;