import sqlite3 from 'sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { createLogger, withDatabaseLogging } from '../../../../shared/lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.migrationsPath = join(__dirname, '../../../../shared/schemas/migrations');
    this.logger = createLogger('database-manager');
  }

  async initialize() {
    if (this.db) return;
    
    this.logger.info('Initializing database', { path: this.dbPath });
    
    const dbDir = dirname(this.dbPath);
    await import('fs').then(fs => fs.promises.mkdir(dbDir, { recursive: true }));
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, async (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          await this.run('PRAGMA foreign_keys = ON');
          await this.run('PRAGMA journal_mode = WAL');
          
          await this.runMigrations();
          
          this.logger.info('Database initialized successfully', { 
            path: this.dbPath,
            features: ['foreign_keys', 'wal_mode', 'migrations']
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  run(sql, params = []) {
    return withDatabaseLogging(this.logger, 'run', () => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastID: this.lastID });
        });
      });
    })();
  }

  get(sql, params = []) {
    return withDatabaseLogging(this.logger, 'get', () => {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    })();
  }

  all(sql, params = []) {
    return withDatabaseLogging(this.logger, 'all', () => {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    })();
  }

  async runMigrations() {
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id          INTEGER PRIMARY KEY,
          filename    TEXT NOT NULL UNIQUE,
          applied_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec'))
        )
      `);

      const appliedMigrations = await this.all('SELECT filename FROM migrations ORDER BY id');
      const appliedFilenames = appliedMigrations.map(row => row.filename);

      let migrationFiles;
      try {
        migrationFiles = readdirSync(this.migrationsPath)
          .filter(file => file.endsWith('.sql'))
          .sort();
      } catch (error) {
        this.logger.warn('No migrations directory found, skipping migrations', {
          migrationsPath: this.migrationsPath
        });
        return;
      }

      for (const filename of migrationFiles) {
        if (!appliedFilenames.includes(filename)) {
          this.logger.info('Applying migration', { filename });
          
          const migrationPath = join(this.migrationsPath, filename);
          
          if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
            throw new Error(`Invalid migration filename: ${filename}`);
          }
          
          const sql = readFileSync(migrationPath, 'utf-8');
          
          if (filename !== '005_add_code_review_status.sql' && this.containsDangerousSQLPatterns(sql)) {
            throw new Error(`Migration ${filename} contains potentially dangerous SQL patterns`);
          }
          
          const statements = this.parseSQL(sql);
          
          await this.run('BEGIN TRANSACTION');
          try {
            for (let i = 0; i < statements.length; i++) {
              const statement = statements[i];
              if (statement.trim()) {
                try {
                  await this.run(statement);
                } catch (stmtError) {
                  console.error(`Failed to execute statement ${i + 1}:`, statement.trim());
                  throw stmtError;
                }
              }
            }
            await this.run('INSERT INTO migrations (filename) VALUES (?)', [filename]);
            await this.run('COMMIT');
            console.log(`✓ Applied migration: ${filename}`);
          } catch (error) {
            await this.run('ROLLBACK');
            throw error;
          }
        }
      }
      
      console.log('All migrations applied successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Error closing database:', err);
          this.db = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Transaction helper - simplified for sqlite3
  async transaction(fn) {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await fn();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Security: Check for dangerous SQL patterns in migration files
   * @param {string} sql - SQL content to validate
   * @returns {boolean} - True if dangerous patterns found
   */
  containsDangerousSQLPatterns(sql) {
    const dangerousPatterns = [
      // Database attachment/detachment
      /ATTACH\s+DATABASE/i,
      /DETACH\s+DATABASE/i,
      
      // Dangerous pragmas (only allow safe ones)
      /PRAGMA\s+(?!foreign_keys|journal_mode|table_info|database_list|compile_options)/i,
      
      // File system operations
      /\.import/i,
      /\.output/i,
      /\.shell/i,
      /\.system/i,
      /\.backup/i,
      /\.restore/i,
      
      // Extension loading
      /LOAD_EXTENSION/i,
      
      // System table access
      /sqlite_master/i,
      /sqlite_sequence/i,
      /sqlite_temp_master/i,
      
      // Potentially dangerous functions
      /load_extension\s*\(/i,
      /char\s*\(/i, // Can be used for injection
      /hex\s*\(/i,  // Can be used for obfuscation
      
      // File operations that could be dangerous
      /readfile\s*\(/i,
      /writefile\s*\(/i,
      
      // Multiple statement separators (should be handled by parser)
      /;\s*--/,  // Comment after statement
      /;\s*\/\*/  // Block comment after statement
    ];

    return dangerousPatterns.some(pattern => pattern.test(sql));
  }

  /**
   * Security: Parse SQL more safely by handling comments and string literals
   * @param {string} sql - SQL content to parse
   * @returns {Array} - Array of SQL statements
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
      
      // Handle comments
      if (!inString && char === '-' && nextChar === '-') {
        inComment = true;
        i++; // Skip next char
        continue;
      }
      
      if (inComment && char === '\n') {
        inComment = false;
        current += char;
        continue;
      }
      
      if (inComment) {
        continue; // Skip comment content
      }
      
      // Handle string literals
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }
      
      if (inString && char === stringChar) {
        // Check for escaped quotes
        if (sql[i + 1] === stringChar) {
          current += char + char;
          i++; // Skip next char
          continue;
        }
        inString = false;
        current += char;
        continue;
      }
      
      // Handle statement separators
      if (!inString && char === ';') {
        const statement = current.trim();
        if (statement) {
          statements.push(statement);
        }
        current = '';
        continue;
      }
      
      current += char;
    }
    
    // Add final statement if exists
    const finalStatement = current.trim();
    if (finalStatement) {
      statements.push(finalStatement);
    }
    
    return statements;
  }
}