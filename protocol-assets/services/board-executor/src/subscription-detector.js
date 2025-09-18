import { EventEmitter } from 'events';
import { createLogger } from '../../lib/logger.js';

/**
 * Subscription Detector - Monitors Claude Code usage and authentication
 * Helps track subscription status and warn about potential issues
 */
export class SubscriptionDetector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.logger = createLogger('subscription-detector');
    this.usageStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      authenticationSources: new Map(), // Track where auth comes from
      lastExecution: null,
      executionHistory: [] // Keep recent history
    };
    this.maxHistorySize = options.maxHistorySize || 100;
  }

  /**
   * Analyze authentication source from Claude Code execution
   */
  analyzeAuthentication(source) {
    const timestamp = new Date().toISOString();

    if (!source) {
      this._recordWarning('unknown_auth_source', 'Authentication source not detected');
      return;
    }

    // Track authentication sources
    const currentCount = this.usageStats.authenticationSources.get(source) || 0;
    this.usageStats.authenticationSources.set(source, currentCount + 1);

    this.logger.debug('Authentication source detected', {
      source,
      count: currentCount + 1,
      timestamp
    });

    // Check for potential subscription issues
    this._checkSubscriptionHealth(source);
  }

  /**
   * Record execution attempt
   */
  recordExecution(success, error = null) {
    const timestamp = new Date().toISOString();

    this.usageStats.totalExecutions++;
    if (success) {
      this.usageStats.successfulExecutions++;
    } else {
      this.usageStats.failedExecutions++;
    }

    this.usageStats.lastExecution = timestamp;

    // Add to history
    const historyEntry = {
      timestamp,
      success,
      error: error?.message || null
    };

    this.usageStats.executionHistory.push(historyEntry);

    // Trim history if too large
    if (this.usageStats.executionHistory.length > this.maxHistorySize) {
      this.usageStats.executionHistory = this.usageStats.executionHistory.slice(-this.maxHistorySize);
    }

    // Check for concerning patterns
    this._checkExecutionPatterns();

    this.logger.debug('Execution recorded', {
      success,
      totalExecutions: this.usageStats.totalExecutions,
      successRate: this._getSuccessRate()
    });
  }

  /**
   * Generate usage report
   */
  generateUsageReport() {
    const successRate = this._getSuccessRate();
    const recentFailures = this._getRecentFailures();

    return {
      totalExecutions: this.usageStats.totalExecutions,
      successfulExecutions: this.usageStats.successfulExecutions,
      failedExecutions: this.usageStats.failedExecutions,
      successRate: `${successRate.toFixed(1)}%`,
      lastExecution: this.usageStats.lastExecution,
      authenticationSources: Object.fromEntries(this.usageStats.authenticationSources),
      recentFailures,
      recommendations: this._generateRecommendations(),
      healthStatus: this._getHealthStatus()
    };
  }

  /**
   * Register warning callback
   */
  onWarning(callback) {
    this.on('warning', callback);
  }

  /**
   * Check subscription health based on authentication source
   */
  _checkSubscriptionHealth(source) {
    // Check for common subscription issues
    if (source.includes('env') || source.includes('environment')) {
      // Using environment variables - generally good
      this.logger.debug('Using environment-based authentication');
    } else if (source.includes('file') || source.includes('config')) {
      // Using config files - also good
      this.logger.debug('Using file-based authentication');
    } else if (source.includes('cli') || source.includes('default')) {
      // Using CLI authentication - might have limitations
      this._recordWarning('cli_auth', 'Using CLI authentication - consider setting up API key');
    } else {
      // Unknown source - potential issue
      this._recordWarning('unknown_auth', `Unknown authentication source: ${source}`);
    }
  }

  /**
   * Check execution patterns for issues
   */
  _checkExecutionPatterns() {
    const recentExecutions = this.usageStats.executionHistory.slice(-10); // Last 10

    if (recentExecutions.length >= 5) {
      const recentFailures = recentExecutions.filter(e => !e.success).length;
      const failureRate = recentFailures / recentExecutions.length;

      if (failureRate >= 0.8) { // 80% failure rate
        this._recordWarning('high_failure_rate', 'High failure rate detected - possible subscription issue');
      }

      // Check for rate limiting patterns
      const rateLimitErrors = recentExecutions.filter(e =>
        e.error && e.error.includes('rate limit')
      ).length;

      if (rateLimitErrors >= 3) {
        this._recordWarning('rate_limiting', 'Rate limiting detected - consider upgrading subscription');
      }
    }
  }

  /**
   * Record and emit warning
   */
  _recordWarning(type, message) {
    const warning = {
      type,
      message,
      timestamp: new Date().toISOString()
    };

    this.logger.warn('Subscription warning', warning);
    this.emit('warning', warning);
  }

  /**
   * Get success rate percentage
   */
  _getSuccessRate() {
    if (this.usageStats.totalExecutions === 0) return 0;
    return (this.usageStats.successfulExecutions / this.usageStats.totalExecutions) * 100;
  }

  /**
   * Get recent failures
   */
  _getRecentFailures() {
    return this.usageStats.executionHistory
      .filter(e => !e.success)
      .slice(-5) // Last 5 failures
      .map(e => ({
        timestamp: e.timestamp,
        error: e.error
      }));
  }

  /**
   * Generate recommendations based on usage patterns
   */
  _generateRecommendations() {
    const recommendations = [];
    const successRate = this._getSuccessRate();

    if (successRate < 50) {
      recommendations.push('High failure rate detected. Check API key configuration and subscription status.');
    }

    if (this.usageStats.totalExecutions > 100 && successRate > 95) {
      recommendations.push('Excellent success rate! Your Claude Code setup is working well.');
    }

    const cliAuthCount = this.usageStats.authenticationSources.get('cli') || 0;
    const totalAuth = Array.from(this.usageStats.authenticationSources.values()).reduce((a, b) => a + b, 0);

    if (cliAuthCount / totalAuth > 0.8) {
      recommendations.push('Consider setting up API key environment variable for more reliable authentication.');
    }

    if (recommendations.length === 0) {
      recommendations.push('No specific recommendations at this time.');
    }

    return recommendations;
  }

  /**
   * Get overall health status
   */
  _getHealthStatus() {
    const successRate = this._getSuccessRate();

    if (successRate >= 90) return 'excellent';
    if (successRate >= 75) return 'good';
    if (successRate >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Reset statistics
   */
  reset() {
    this.usageStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      authenticationSources: new Map(),
      lastExecution: null,
      executionHistory: []
    };

    this.logger.info('Usage statistics reset');
  }
}