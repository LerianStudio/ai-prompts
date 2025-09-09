/**
 * Database Metrics Collection and Alerting System
 * Collects, aggregates, and monitors database connection pool metrics
 */

import { EventEmitter } from 'events';
import { createLogger } from '../logger.js';

export class DatabaseMetricsCollector extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.logger = createLogger('db-metrics-collector');
    this.alertThresholds = {
      highUtilization: options.highUtilizationThreshold || 0.8, // 80%
      longPendingTime: options.longPendingTimeThreshold || 5000, // 5 seconds
      highErrorRate: options.highErrorRateThreshold || 0.05, // 5%
      maxPendingConnections: options.maxPendingConnectionsThreshold || 10,
      ...options.alertThresholds
    };
    
    // Metrics storage
    this.metrics = {
      // Connection pool metrics
      connections: {
        total: 0,
        busy: 0,
        idle: 0,
        pending: 0,
        created: 0,
        destroyed: 0,
        maxConcurrent: 0
      },
      
      // Performance metrics
      performance: {
        acquisitions: 0,
        releases: 0,
        timeouts: 0,
        errors: 0,
        totalAcquisitionTime: 0,
        avgAcquisitionTime: 0,
        maxAcquisitionTime: 0,
        minAcquisitionTime: Infinity
      },
      
      // Health metrics
      health: {
        lastHealthCheck: null,
        healthCheckCount: 0,
        healthCheckErrors: 0,
        uptime: Date.now()
      },
      
      // Query metrics
      queries: {
        total: 0,
        successful: 0,
        failed: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
        maxExecutionTime: 0,
        slowQueries: 0 // > 1 second
      }
    };
    
    // Alert state tracking
    this.alertState = {
      highUtilization: { active: false, lastAlert: 0, count: 0 },
      longPendingTime: { active: false, lastAlert: 0, count: 0 },
      highErrorRate: { active: false, lastAlert: 0, count: 0 },
      connectionExhaustion: { active: false, lastAlert: 0, count: 0 }
    };
    
    // Collection intervals
    this.metricsInterval = null;
    this.alertInterval = null;
    
    this.collectionInterval = options.collectionInterval || 30000; // 30 seconds
    this.alertCheckInterval = options.alertCheckInterval || 60000; // 1 minute
    this.alertCooldown = options.alertCooldown || 300000; // 5 minutes
  }
  
  /**
   * Start metrics collection
   */
  start() {
    this.logger.info('Starting database metrics collection', {
      collectionInterval: this.collectionInterval,
      alertCheckInterval: this.alertCheckInterval,
      thresholds: this.alertThresholds
    });
    
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.collectionInterval);
    
    this.alertInterval = setInterval(() => {
      this.checkAlerts();
    }, this.alertCheckInterval);
    
    this.emit('started');
  }
  
  /**
   * Stop metrics collection
   */
  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    
    this.logger.info('Database metrics collection stopped');
    this.emit('stopped');
  }
  
  /**
   * Update connection pool metrics
   */
  updateConnectionMetrics(poolStats) {
    const connections = this.metrics.connections;
    const performance = this.metrics.performance;
    
    // Update connection counts
    connections.total = poolStats.totalConnections;
    connections.busy = poolStats.currentBusy;
    connections.idle = poolStats.currentIdle;
    connections.pending = poolStats.pendingAcquisitions;
    connections.maxConcurrent = Math.max(connections.maxConcurrent, poolStats.currentBusy);
    
    // Update performance metrics
    performance.acquisitions = poolStats.acquisitions;
    performance.releases = poolStats.releases;
    performance.timeouts = poolStats.timeouts;
    performance.errors = poolStats.errors;
    
    // Track creation/destruction
    if (poolStats.connectionsCreated > connections.created) {
      connections.created = poolStats.connectionsCreated;
    }
    if (poolStats.connectionsDestroyed > connections.destroyed) {
      connections.destroyed = poolStats.connectionsDestroyed;
    }
    
    this.emit('metrics-updated', { type: 'connections', metrics: connections });
  }
  
  /**
   * Record query execution metrics
   */
  recordQuery(executionTime, success = true) {
    const queries = this.metrics.queries;
    
    queries.total++;
    if (success) {
      queries.successful++;
    } else {
      queries.failed++;
    }
    
    queries.totalExecutionTime += executionTime;
    queries.avgExecutionTime = queries.totalExecutionTime / queries.total;
    queries.maxExecutionTime = Math.max(queries.maxExecutionTime, executionTime);
    
    if (executionTime > 1000) { // Slow query threshold: 1 second
      queries.slowQueries++;
    }
    
    this.emit('query-recorded', { executionTime, success });
  }
  
  /**
   * Record connection acquisition metrics
   */
  recordAcquisition(acquisitionTime) {
    const performance = this.metrics.performance;
    
    performance.totalAcquisitionTime += acquisitionTime;
    performance.avgAcquisitionTime = performance.totalAcquisitionTime / performance.acquisitions;
    performance.maxAcquisitionTime = Math.max(performance.maxAcquisitionTime, acquisitionTime);
    performance.minAcquisitionTime = Math.min(performance.minAcquisitionTime, acquisitionTime);
    
    this.emit('acquisition-recorded', { acquisitionTime });
  }
  
  /**
   * Update health check metrics
   */
  updateHealthMetrics(healthCheck) {
    const health = this.metrics.health;
    
    health.lastHealthCheck = Date.now();
    health.healthCheckCount++;
    
    if (healthCheck.status !== 'healthy') {
      health.healthCheckErrors++;
    }
    
    this.emit('health-updated', { healthCheck });
  }
  
  /**
   * Collect current metrics snapshot
   */
  collectMetrics() {
    const snapshot = {
      timestamp: Date.now(),
      ...this.metrics,
      calculated: {
        // Connection utilization
        connectionUtilization: this.metrics.connections.total > 0 
          ? this.metrics.connections.busy / this.metrics.connections.total 
          : 0,
        
        // Error rates
        acquisitionErrorRate: this.metrics.performance.acquisitions > 0
          ? this.metrics.performance.errors / this.metrics.performance.acquisitions
          : 0,
        
        queryErrorRate: this.metrics.queries.total > 0
          ? this.metrics.queries.failed / this.metrics.queries.total
          : 0,
        
        // Health status
        healthCheckErrorRate: this.metrics.health.healthCheckCount > 0
          ? this.metrics.health.healthCheckErrors / this.metrics.health.healthCheckCount
          : 0,
        
        // Uptime
        uptime: Date.now() - this.metrics.health.uptime
      }
    };
    
    this.logger.debug('Database metrics collected', snapshot.calculated);
    this.emit('metrics-collected', snapshot);
    
    return snapshot;
  }
  
  /**
   * Check for alert conditions
   */
  checkAlerts() {
    const snapshot = this.collectMetrics();
    const calculated = snapshot.calculated;
    const now = Date.now();
    
    // High connection utilization alert
    this.checkAlert('highUtilization', 
      calculated.connectionUtilization > this.alertThresholds.highUtilization,
      `High connection utilization: ${(calculated.connectionUtilization * 100).toFixed(1)}%`,
      { utilization: calculated.connectionUtilization, threshold: this.alertThresholds.highUtilization }
    );
    
    // Long pending connection times
    this.checkAlert('longPendingTime',
      this.metrics.connections.pending > this.alertThresholds.maxPendingConnections,
      `High pending connections: ${this.metrics.connections.pending}`,
      { pending: this.metrics.connections.pending, threshold: this.alertThresholds.maxPendingConnections }
    );
    
    // High error rate alert
    this.checkAlert('highErrorRate',
      calculated.acquisitionErrorRate > this.alertThresholds.highErrorRate,
      `High acquisition error rate: ${(calculated.acquisitionErrorRate * 100).toFixed(2)}%`,
      { errorRate: calculated.acquisitionErrorRate, threshold: this.alertThresholds.highErrorRate }
    );
    
    // Connection exhaustion alert
    this.checkAlert('connectionExhaustion',
      this.metrics.connections.busy >= this.metrics.connections.total && this.metrics.connections.pending > 0,
      'Connection pool exhausted with pending requests',
      { 
        busy: this.metrics.connections.busy, 
        total: this.metrics.connections.total, 
        pending: this.metrics.connections.pending 
      }
    );
  }
  
  /**
   * Check individual alert condition
   */
  checkAlert(alertType, condition, message, data) {
    const alert = this.alertState[alertType];
    const now = Date.now();
    
    if (condition) {
      if (!alert.active || now - alert.lastAlert > this.alertCooldown) {
        alert.active = true;
        alert.lastAlert = now;
        alert.count++;
        
        this.logger.warn(`DATABASE ALERT: ${message}`, data);
        this.emit('alert', {
          type: alertType,
          severity: 'warning',
          message,
          data,
          count: alert.count,
          timestamp: now
        });
      }
    } else if (alert.active) {
      // Alert condition resolved
      alert.active = false;
      
      this.logger.info(`DATABASE ALERT RESOLVED: ${alertType}`, data);
      this.emit('alert-resolved', {
        type: alertType,
        message: `${alertType} alert resolved`,
        timestamp: now
      });
    }
  }
  
  /**
   * Get current metrics summary
   */
  getMetrics() {
    return {
      ...this.collectMetrics(),
      alertState: { ...this.alertState }
    };
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const metrics = this.getMetrics();
    
    return {
      summary: {
        uptime: metrics.calculated.uptime,
        connectionUtilization: `${(metrics.calculated.connectionUtilization * 100).toFixed(1)}%`,
        acquisitionErrorRate: `${(metrics.calculated.acquisitionErrorRate * 100).toFixed(2)}%`,
        queryErrorRate: `${(metrics.calculated.queryErrorRate * 100).toFixed(2)}%`,
        avgAcquisitionTime: `${metrics.performance.avgAcquisitionTime.toFixed(2)}ms`,
        avgQueryTime: `${metrics.queries.avgExecutionTime.toFixed(2)}ms`
      },
      
      connections: {
        total: metrics.connections.total,
        active: metrics.connections.busy,
        idle: metrics.connections.idle,
        pending: metrics.connections.pending,
        maxConcurrent: metrics.connections.maxConcurrent
      },
      
      performance: {
        totalAcquisitions: metrics.performance.acquisitions,
        totalQueries: metrics.queries.total,
        slowQueries: metrics.queries.slowQueries,
        timeouts: metrics.performance.timeouts,
        errors: metrics.performance.errors
      },
      
      alerts: Object.entries(metrics.alertState)
        .filter(([_, state]) => state.active)
        .map(([type, state]) => ({
          type,
          count: state.count,
          lastAlert: new Date(state.lastAlert).toISOString()
        }))
    };
  }
  
  /**
   * Reset metrics (for testing or periodic reset)
   */
  reset() {
    this.metrics.performance.totalAcquisitionTime = 0;
    this.metrics.performance.avgAcquisitionTime = 0;
    this.metrics.performance.maxAcquisitionTime = 0;
    this.metrics.performance.minAcquisitionTime = Infinity;
    
    this.metrics.queries.totalExecutionTime = 0;
    this.metrics.queries.avgExecutionTime = 0;
    this.metrics.queries.maxExecutionTime = 0;
    
    this.metrics.health.uptime = Date.now();
    
    Object.keys(this.alertState).forEach(alertType => {
      this.alertState[alertType] = { active: false, lastAlert: 0, count: 0 };
    });
    
    this.logger.info('Database metrics reset');
    this.emit('metrics-reset');
  }
}

export default DatabaseMetricsCollector;