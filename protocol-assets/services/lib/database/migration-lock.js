/**
 * Migration Lock Manager
 * Provides file-based locking for database migrations to prevent race conditions
 */

import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { hostname } from 'os';
import { createLogger } from '../logger.js';

export class MigrationLock {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath;
    this.lockDir = options.lockDir || dirname(dbPath);
    this.lockFile = join(this.lockDir, '.migration.lock');
    this.timeout = options.timeout || 300000; // 5 minutes default
    this.retryInterval = options.retryInterval || 1000; // 1 second
    this.logger = createLogger('migration-lock');
    
    this.lockInfo = {
      pid: process.pid,
      hostname: hostname(),
      timestamp: Date.now(),
      dbPath: this.dbPath
    };
  }

  /**
   * Acquire the migration lock
   */
  async acquire() {
    const startTime = Date.now();
    const timeoutTime = startTime + this.timeout;
    
    this.logger.info('Attempting to acquire migration lock', {
      lockFile: this.lockFile,
      timeout: this.timeout,
      ...this.lockInfo
    });
    
    while (Date.now() < timeoutTime) {
      try {
        if (await this.tryAcquire()) {
          this.logger.info('Migration lock acquired successfully', {
            acquisitionTime: Date.now() - startTime,
            lockFile: this.lockFile
          });
          return true;
        }
        
        // Check if existing lock is stale
        if (await this.isLockStale()) {
          this.logger.warn('Removing stale migration lock', {
            lockFile: this.lockFile
          });
          await this.forceRelease();
          continue; // Try acquiring again
        }
        
        // Wait before retrying
        await this.sleep(this.retryInterval);
        
      } catch (error) {
        this.logger.error('Error during lock acquisition', {
          error: error.message,
          lockFile: this.lockFile
        });
        
        if (Date.now() >= timeoutTime) {
          throw new Error(`Failed to acquire migration lock after ${this.timeout}ms: ${error.message}`);
        }
        
        await this.sleep(this.retryInterval);
      }
    }
    
    throw new Error(`Migration lock acquisition timeout after ${this.timeout}ms`);
  }

  /**
   * Try to acquire the lock (atomic operation)
   */
  async tryAcquire() {
    if (existsSync(this.lockFile)) {
      return false; // Lock already exists
    }
    
    try {
      const lockContent = JSON.stringify({
        ...this.lockInfo,
        acquiredAt: Date.now()
      }, null, 2);
      
      // Atomic write - if this succeeds, we have the lock
      writeFileSync(this.lockFile, lockContent, { flag: 'wx' }); // 'wx' fails if file exists
      return true;
      
    } catch (error) {
      if (error.code === 'EEXIST') {
        return false; // Another process acquired the lock first
      }
      throw error;
    }
  }

  /**
   * Check if the existing lock is stale
   */
  async isLockStale() {
    try {
      if (!existsSync(this.lockFile)) {
        return false;
      }
      
      const lockContent = readFileSync(this.lockFile, 'utf-8');
      const existingLock = JSON.parse(lockContent);
      
      // Check age of lock (stale after 15 minutes)
      const lockAge = Date.now() - existingLock.acquiredAt;
      const maxAge = 15 * 60 * 1000; // 15 minutes
      
      if (lockAge > maxAge) {
        this.logger.warn('Lock is stale due to age', {
          lockAge: lockAge,
          maxAge: maxAge,
          existingLock
        });
        return true;
      }
      
      // Check if process still exists (Unix-like systems)
      if (existingLock.hostname === hostname()) {
        try {
          // Send signal 0 to check if process exists
          process.kill(existingLock.pid, 0);
          return false; // Process still exists
        } catch (error) {
          if (error.code === 'ESRCH') {
            this.logger.warn('Lock is stale - process no longer exists', {
              stalePid: existingLock.pid,
              error: error.code
            });
            return true; // Process doesn't exist
          }
          // Other errors mean we can't check, assume process exists
          return false;
        }
      }
      
      // Different hostname - can't check process, rely on age
      return false;
      
    } catch (error) {
      this.logger.error('Error checking if lock is stale', {
        error: error.message,
        lockFile: this.lockFile
      });
      return false; // When in doubt, don't consider it stale
    }
  }

  /**
   * Release the migration lock
   */
  async release() {
    try {
      if (!existsSync(this.lockFile)) {
        this.logger.warn('Attempted to release lock that does not exist', {
          lockFile: this.lockFile
        });
        return;
      }
      
      // Verify we own the lock before releasing
      const lockContent = readFileSync(this.lockFile, 'utf-8');
      const existingLock = JSON.parse(lockContent);
      
      if (existingLock.pid !== this.lockInfo.pid || existingLock.hostname !== this.lockInfo.hostname) {
        this.logger.error('Attempted to release lock owned by different process', {
          ourPid: this.lockInfo.pid,
          ourHostname: this.lockInfo.hostname,
          lockPid: existingLock.pid,
          lockHostname: existingLock.hostname
        });
        throw new Error('Cannot release lock owned by different process');
      }
      
      unlinkSync(this.lockFile);
      
      this.logger.info('Migration lock released successfully', {
        lockFile: this.lockFile,
        holdTime: Date.now() - existingLock.acquiredAt
      });
      
    } catch (error) {
      this.logger.error('Error releasing migration lock', {
        error: error.message,
        lockFile: this.lockFile
      });
      throw error;
    }
  }

  /**
   * Force release the lock (use with caution)
   */
  async forceRelease() {
    try {
      if (existsSync(this.lockFile)) {
        unlinkSync(this.lockFile);
        this.logger.warn('Migration lock force released', {
          lockFile: this.lockFile
        });
      }
    } catch (error) {
      this.logger.error('Error force releasing lock', {
        error: error.message,
        lockFile: this.lockFile
      });
      throw error;
    }
  }

  /**
   * Execute a function with migration lock
   */
  async withLock(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      await this.release();
    }
  }

  /**
   * Get current lock information
   */
  getLockInfo() {
    try {
      if (!existsSync(this.lockFile)) {
        return null;
      }
      
      const lockContent = readFileSync(this.lockFile, 'utf-8');
      return JSON.parse(lockContent);
      
    } catch (error) {
      this.logger.error('Error reading lock info', {
        error: error.message,
        lockFile: this.lockFile
      });
      return null;
    }
  }

  /**
   * Check if lock is currently held
   */
  isLocked() {
    return existsSync(this.lockFile);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup - ensure lock is released on process exit
   */
  setupCleanup() {
    const cleanup = () => {
      try {
        if (this.isLocked()) {
          this.forceRelease();
        }
      } catch (error) {
        // Ignore cleanup errors during shutdown
      }
    };
    
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', cleanup);
  }
}

export default MigrationLock;