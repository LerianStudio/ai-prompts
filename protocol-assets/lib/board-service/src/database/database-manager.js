import sqlite3 from 'sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.migrationsPath = join(__dirname, '../../migrations');
  }

  async initialize() {
    if (this.db) return;
    
    console.log(`Initializing database at: ${this.dbPath}`);
    
    // Ensure directory exists
    const dbDir = dirname(this.dbPath);
    await import('fs').then(fs => fs.promises.mkdir(dbDir, { recursive: true }));
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, async (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          // Enable foreign keys and WAL mode
          await this.run('PRAGMA foreign_keys = ON');
          await this.run('PRAGMA journal_mode = WAL');
          
          // Run migrations
          await this.runMigrations();
          
          console.log('Database initialized successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Promisify database methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async runMigrations() {
    try {
      // Create migrations table if it doesn't exist
      await this.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id          INTEGER PRIMARY KEY,
          filename    TEXT NOT NULL UNIQUE,
          applied_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec'))
        )
      `);

      // Get applied migrations
      const appliedMigrations = await this.all('SELECT filename FROM migrations ORDER BY id');
      const appliedFilenames = appliedMigrations.map(row => row.filename);

      // Get available migration files
      let migrationFiles;
      try {
        migrationFiles = readdirSync(this.migrationsPath)
          .filter(file => file.endsWith('.sql'))
          .sort();
      } catch (error) {
        console.log('No migrations directory found, skipping migrations');
        return;
      }

      // Apply new migrations
      for (const filename of migrationFiles) {
        if (!appliedFilenames.includes(filename)) {
          console.log(`Applying migration: ${filename}`);
          
          const migrationPath = join(this.migrationsPath, filename);
          const sql = readFileSync(migrationPath, 'utf-8');
          
          // Split SQL by semicolons and execute each statement
          const statements = sql.split(';').filter(stmt => stmt.trim());
          
          await this.run('BEGIN TRANSACTION');
          try {
            for (const statement of statements) {
              if (statement.trim()) {
                await this.run(statement);
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
}