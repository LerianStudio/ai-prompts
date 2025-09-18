/**
 * SQLite Connection Pool Manager
 * Manages a pool of SQLite connections for concurrent access
 */

import sqlite3 from 'sqlite3';
import { EventEmitter } from 'events';
import { createLogger } from '../logger.js';
import { DatabaseMetricsCollector } from './metrics-collector.js';

export class SQLiteConnectionPool extends EventEmitter {
  constructor(options = {}) {
    super();

    this.dbPath = options.dbPath;
    this.poolSize = options.poolSize || 10;
    this.acquireTimeout = options.acquireTimeout || 30000; // 30 seconds
    this.idleTimeout = options.idleTimeout || 300000; // 5 minutes

    this.logger = createLogger('sqlite-connection-pool');

    // Initialize metrics collector
    this.metricsCollector = options.enableMetrics !== false ? new DatabaseMetricsCollector({
      collectionInterval: options.metricsCollectionInterval || 30000,
      alertCheckInterval: options.alertCheckInterval || 60000,
      alertThresholds: options.alertThresholds
    }) : null;

    // Pool state
    this.connections = [];
    this.availableConnections = [];
    this.busyConnections = new Map(); // connection -> acquiredAt timestamp
    this.pendingAcquisitions = [];
    this.connectionStates = new Map(); // connection -> state management
    
    // Metrics
    this.stats = {
      connectionsCreated: 0,
      connectionsDestroyed: 0,
      acquisitions: 0,
      releases: 0,
      timeouts: 0,
      errors: 0,
      currentBusy: 0,
      currentIdle: 0,
      maxConcurrent: 0
    };
    
    // Cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // 1 minute
    
    this.initialized = false;
  }

  /**
   * Initialize the connection pool
   */
  async initialize() {
    if (this.initialized) return;
    
    this.logger.info('Initializing SQLite connection pool', {
      dbPath: this.dbPath,
      poolSize: this.poolSize,
      acquireTimeout: this.acquireTimeout,
      idleTimeout: this.idleTimeout
    });
    
    // Create initial connections
    const initialSize = Math.min(2, this.poolSize); // Start with 2 connections
    for (let i = 0; i < initialSize; i++) {
      try {
        const connection = await this.createConnection();
        this.connections.push(connection);
        this.availableConnections.push(connection);
      } catch (error) {
        this.logger.error('Failed to create initial connection', { error: error.message, index: i });
        throw error;
      }
    }
    
    this.stats.currentIdle = this.availableConnections.length;
    this.initialized = true;
    
    // Start metrics collection if enabled
    if (this.metricsCollector) {
      this.metricsCollector.start();
      this.metricsCollector.updateConnectionMetrics(this.getStats());
    }
    
    this.logger.info('Connection pool initialized', {
      initialConnections: initialSize,
      available: this.availableConnections.length,
      metricsEnabled: !!this.metricsCollector
    });
    
    this.emit('initialized');
  }

  /**
   * Create a new SQLite connection
   */
  createConnection() {
    return new Promise((resolve, reject) => {
      const connection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        db: null,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        queryCount: 0,
        state: 'CREATING'
      };

      // Initialize connection state management
      this.connectionStates.set(connection, {
        state: 'CREATING',
        transitions: [],
        timeoutId: null,
        mutex: false
      });
      
      connection.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
        if (err) {
          this.stats.errors++;
          this.logger.error('Failed to create database connection', { 
            error: err.message,
            connectionId: connection.id 
          });
          reject(err);
          return;
        }
        
        try {
          // Configure connection for optimal concurrent access
          await this.configureConnection(connection);

          // Update connection state
          this.transitionConnectionState(connection, 'AVAILABLE');

          this.stats.connectionsCreated++;
          this.logger.debug('Database connection created', {
            connectionId: connection.id,
            totalConnections: this.connections.length + 1,
            state: this.getConnectionState(connection)
          });

          resolve(connection);
        } catch (configError) {
          this.stats.errors++;
          this.transitionConnectionState(connection, 'DESTROYED');
          connection.db.close();
          this.connectionStates.delete(connection);
          reject(configError);
        }
      });
    });
  }

  /**
   * Configure a SQLite connection for optimal performance
   */
  async configureConnection(connection) {
    const run = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        connection.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastID: this.lastID });
        });
      });
    };

    // Enable WAL mode for better concurrency
    await run('PRAGMA journal_mode = WAL');
    await run('PRAGMA foreign_keys = ON');
    await run('PRAGMA synchronous = NORMAL'); // Good balance of safety and performance
    await run('PRAGMA cache_size = 2000'); // 2MB cache per connection
    await run('PRAGMA temp_store = MEMORY');
    
    // Connection-specific query methods with metrics
    const metricsCollector = this.metricsCollector;
    
    connection.run = (sql, params = []) => {
      connection.lastUsedAt = Date.now();
      connection.queryCount++;
      const queryStart = Date.now();
      
      return run(sql, params).then(result => {
        const executionTime = Date.now() - queryStart;
        if (metricsCollector) {
          metricsCollector.recordQuery(executionTime, true);
        }
        return result;
      }).catch(error => {
        const executionTime = Date.now() - queryStart;
        if (metricsCollector) {
          metricsCollector.recordQuery(executionTime, false);
        }
        throw error;
      });
    };
    
    connection.get = (sql, params = []) => {
      connection.lastUsedAt = Date.now();
      connection.queryCount++;
      const queryStart = Date.now();
      
      return new Promise((resolve, reject) => {
        connection.db.get(sql, params, (err, row) => {
          const executionTime = Date.now() - queryStart;
          if (metricsCollector) {
            metricsCollector.recordQuery(executionTime, !err);
          }
          
          if (err) reject(err);
          else resolve(row);
        });
      });
    };
    
    connection.all = (sql, params = []) => {
      connection.lastUsedAt = Date.now();
      connection.queryCount++;
      const queryStart = Date.now();
      
      return new Promise((resolve, reject) => {
        connection.db.all(sql, params, (err, rows) => {
          const executionTime = Date.now() - queryStart;
          if (metricsCollector) {
            metricsCollector.recordQuery(executionTime, !err);
          }
          
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const acquisitionStart = Date.now();
      
      // Check for available connection
      if (this.availableConnections.length > 0) {
        const connection = this.availableConnections.pop();
        this.markConnectionBusy(connection);
        this.updateStats();
        
        const acquisitionTime = Date.now() - acquisitionStart;
        
        // Record metrics
        if (this.metricsCollector) {
          this.metricsCollector.recordAcquisition(acquisitionTime);
          this.metricsCollector.updateConnectionMetrics(this.getStats());
        }
        
        this.logger.debug('Connection acquired from pool', {
          connectionId: connection.id,
          acquisitionTime,
          available: this.availableConnections.length,
          busy: this.busyConnections.size
        });
        
        resolve(connection);
        return;
      }
      
      // Create new connection if pool not full
      if (this.connections.length < this.poolSize) {
        this.createConnection()
          .then(connection => {
            this.connections.push(connection);
            this.markConnectionBusy(connection);
            this.updateStats();
            
            const acquisitionTime = Date.now() - acquisitionStart;
            
            // Record metrics
            if (this.metricsCollector) {
              this.metricsCollector.recordAcquisition(acquisitionTime);
              this.metricsCollector.updateConnectionMetrics(this.getStats());
            }
            
            this.logger.debug('New connection created and acquired', {
              connectionId: connection.id,
              acquisitionTime,
              totalConnections: this.connections.length,
              busy: this.busyConnections.size
            });
            
            resolve(connection);
          })
          .catch(reject);
        return;
      }
      
      // Queue the acquisition request with safer timeout handling
      const acquisitionId = `acq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const timeout = setTimeout(() => {
        const index = this.pendingAcquisitions.findIndex(req => req.id === acquisitionId);
        if (index >= 0) {
          const request = this.pendingAcquisitions.splice(index, 1)[0];
          this.stats.timeouts++;

          this.logger.warn('Connection acquisition timeout', {
            acquisitionId,
            waitTime: Date.now() - acquisitionStart,
            queueSize: this.pendingAcquisitions.length
          });

          request.reject(new Error(`Connection acquisition timeout after ${this.acquireTimeout}ms`));
        }
      }, this.acquireTimeout);

      this.pendingAcquisitions.push({
        id: acquisitionId,
        resolve,
        reject,
        timeout,
        requestedAt: acquisitionStart
      });
      
      this.logger.debug('Connection acquisition queued', {
        queueSize: this.pendingAcquisitions.length,
        available: this.availableConnections.length,
        busy: this.busyConnections.size
      });
    });
  }

  /**
   * Release a connection back to the pool
   */
  release(connection) {
    if (!connection || !connection.id) {
      this.logger.warn('Invalid connection released');
      return;
    }

    // Atomic state check and transition
    if (!this.canTransitionConnectionState(connection, 'RELEASING')) {
      this.logger.warn('Cannot release connection in current state', {
        connectionId: connection.id,
        currentState: this.getConnectionState(connection)
      });
      return;
    }

    this.transitionConnectionState(connection, 'RELEASING');

    // Remove from busy connections
    const wasReleased = this.busyConnections.delete(connection);
    if (!wasReleased) {
      this.logger.warn('Attempted to release connection not in busy pool', {
        connectionId: connection.id
      });
      this.transitionConnectionState(connection, 'AVAILABLE'); // Revert state
      return;
    }

    this.stats.releases++;

    // Process pending acquisitions first
    if (this.pendingAcquisitions.length > 0) {
      const request = this.pendingAcquisitions.shift();
      clearTimeout(request.timeout);

      this.markConnectionBusy(connection);
      this.transitionConnectionState(connection, 'BUSY');

      this.logger.debug('Connection reassigned to waiting request', {
        connectionId: connection.id,
        acquisitionId: request.id,
        waitTime: Date.now() - request.requestedAt,
        queueSize: this.pendingAcquisitions.length
      });

      request.resolve(connection);
      return;
    }

    // Return to available pool
    this.transitionConnectionState(connection, 'AVAILABLE');
    this.availableConnections.push(connection);
    this.updateStats();

    this.logger.debug('Connection released to pool', {
      connectionId: connection.id,
      available: this.availableConnections.length,
      busy: this.busyConnections.size,
      queryCount: connection.queryCount,
      state: this.getConnectionState(connection)
    });
  }

  /**
   * Mark connection as busy
   */
  markConnectionBusy(connection) {
    this.transitionConnectionState(connection, 'BUSY');
    this.busyConnections.set(connection, Date.now());
    this.stats.acquisitions++;
  }

  /**
   * Update pool statistics
   */
  updateStats() {
    this.stats.currentBusy = this.busyConnections.size;
    this.stats.currentIdle = this.availableConnections.length;
    this.stats.maxConcurrent = Math.max(this.stats.maxConcurrent, this.stats.currentBusy);
  }

  /**
   * Execute a function with a pooled connection
   */
  async withConnection(fn) {
    const connection = await this.acquire();
    try {
      return await fn(connection);
    } finally {
      this.release(connection);
    }
  }

  /**
   * Execute a transaction with a pooled connection
   */
  async transaction(fn) {
    return this.withConnection(async (connection) => {
      await connection.run('BEGIN TRANSACTION');
      try {
        const result = await fn(connection);
        await connection.run('COMMIT');
        return result;
      } catch (error) {
        await connection.run('ROLLBACK');
        throw error;
      }
    });
  }

  /**
   * Cleanup idle connections and handle maintenance
   */
  cleanup() {
    const now = Date.now();
    const idleThreshold = now - this.idleTimeout;
    
    // Remove idle connections beyond minimum pool size
    const minConnections = Math.min(2, this.poolSize);
    let removedConnections = 0;
    
    for (let i = this.availableConnections.length - 1; i >= 0; i--) {
      if (this.availableConnections.length - removedConnections <= minConnections) {
        break;
      }
      
      const connection = this.availableConnections[i];
      if (connection.lastUsedAt < idleThreshold) {
        this.availableConnections.splice(i, 1);
        const connIndex = this.connections.findIndex(c => c.id === connection.id);
        if (connIndex >= 0) {
          this.connections.splice(connIndex, 1);
        }
        
        connection.db.close();
        removedConnections++;
        this.stats.connectionsDestroyed++;
      }
    }
    
    if (removedConnections > 0) {
      this.updateStats();
      this.logger.info('Cleaned up idle connections', {
        removed: removedConnections,
        remaining: this.connections.length,
        available: this.availableConnections.length
      });
    }
    
    // Log pool statistics periodically
    this.logger.debug('Connection pool statistics', this.getStats());
  }

  /**
   * Get current pool statistics
   */
  getStats() {
    this.updateStats();
    return {
      ...this.stats,
      totalConnections: this.connections.length,
      pendingAcquisitions: this.pendingAcquisitions.length,
      uptime: Date.now() - (this.stats.poolCreatedAt || Date.now())
    };
  }

  /**
   * Close all connections and shutdown the pool
   */
  async destroy() {
    this.logger.info('Shutting down connection pool');
    
    // Stop metrics collection
    if (this.metricsCollector) {
      this.metricsCollector.stop();
    }
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Reject all pending acquisitions with proper cleanup
    while (this.pendingAcquisitions.length > 0) {
      const request = this.pendingAcquisitions.shift();
      clearTimeout(request.timeout);
      request.reject(new Error('Connection pool is shutting down'));
    }
    
    // Close all connections with state management
    const closePromises = this.connections.map(connection => {
      return new Promise(resolve => {
        this.transitionConnectionState(connection, 'DESTROYING');
        connection.db.close(err => {
          if (err) {
            this.logger.error('Error closing connection', {
              connectionId: connection.id,
              error: err.message
            });
          }
          this.transitionConnectionState(connection, 'DESTROYED');
          this.connectionStates.delete(connection);
          resolve();
        });
      });
    });
    
    await Promise.all(closePromises);
    
    this.connections.length = 0;
    this.availableConnections.length = 0;
    this.busyConnections.clear();
    this.connectionStates.clear();

    this.logger.info('Connection pool shutdown complete', {
      finalStats: this.getStats()
    });

    this.emit('destroyed');
  }

  /**
   * Connection state management methods
   */

  getConnectionState(connection) {
    const stateInfo = this.connectionStates.get(connection);
    return stateInfo ? stateInfo.state : 'UNKNOWN';
  }

  canTransitionConnectionState(connection, newState) {
    const stateInfo = this.connectionStates.get(connection);
    if (!stateInfo) return false;

    const currentState = stateInfo.state;

    // State transition rules
    const validTransitions = {
      'CREATING': ['AVAILABLE', 'DESTROYED'],
      'AVAILABLE': ['BUSY', 'DESTROYING'],
      'BUSY': ['RELEASING', 'DESTROYING'],
      'RELEASING': ['AVAILABLE', 'BUSY', 'DESTROYING'],
      'DESTROYING': ['DESTROYED'],
      'DESTROYED': []
    };

    return validTransitions[currentState]?.includes(newState) || false;
  }

  transitionConnectionState(connection, newState) {
    const stateInfo = this.connectionStates.get(connection);
    if (!stateInfo) {
      this.logger.error('Cannot transition unknown connection state', {
        connectionId: connection.id,
        newState
      });
      return false;
    }

    if (!this.canTransitionConnectionState(connection, newState)) {
      this.logger.error('Invalid connection state transition', {
        connectionId: connection.id,
        currentState: stateInfo.state,
        newState
      });
      return false;
    }

    const oldState = stateInfo.state;
    stateInfo.state = newState;
    stateInfo.transitions.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });

    this.logger.debug('Connection state transition', {
      connectionId: connection.id,
      from: oldState,
      to: newState
    });

    return true;
  }
  
  /**
   * Get detailed metrics (including alerts and performance data)
   */
  getDetailedMetrics() {
    if (!this.metricsCollector) {
      return { 
        error: 'Metrics collection is disabled',
        basicStats: this.getStats()
      };
    }
    
    return this.metricsCollector.getMetrics();
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    if (!this.metricsCollector) {
      return { 
        error: 'Metrics collection is disabled',
        basicStats: this.getStats()
      };
    }
    
    return this.metricsCollector.getPerformanceReport();
  }
  
  /**
   * Get metrics collector instance (for advanced usage)
   */
  getMetricsCollector() {
    return this.metricsCollector;
  }
}

export default SQLiteConnectionPool;