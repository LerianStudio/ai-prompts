import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger, withDatabaseLogging } from '../../../lib/logger.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseManager {
  constructor(dbConfig = {}) {
    // PostgreSQL configuration
    this.config = {
      host: dbConfig.host || process.env.DB_HOST || 'postgres',
      port: dbConfig.port || process.env.DB_PORT || 5432,
      database: dbConfig.database || process.env.DB_NAME || 'board_api',
      user: dbConfig.user || process.env.DB_USER || 'board_user',
      password: dbConfig.password || process.env.DB_PASSWORD || 'board_password',
      max: dbConfig.max || 20, // Maximum number of clients in the pool
      idleTimeoutMillis: dbConfig.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis || 2000,
      ...dbConfig
    };

    this.pool = null;
    this.migrationsPath = join(__dirname, '../../schemas/migrations');
    this.logger = createLogger('database-manager');
  }

  async initialize() {
    if (this.pool) return;

    this.logger.info('Initializing PostgreSQL database', {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user
    });

    try {
      this.pool = new Pool(this.config);

      // Test the connection
      const client = await this.pool.connect();
      try {
        await client.query('SELECT NOW()');
        this.logger.info('Database connection established');
      } finally {
        client.release();
      }

      await this.runMigrations();

      this.logger.info('Database initialized successfully', {
        host: this.config.host,
        database: this.config.database,
        features: ['connection_pool', 'migrations']
      });
    } catch (error) {
      this.logger.error('Failed to initialize database', { error: error.message });
      throw error;
    }
  }

  async run(sql, params = []) {
    return withDatabaseLogging(this.logger, 'run', async () => {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return {
          changes: result.rowCount,
          lastID: result.rows[0]?.id || null,
          rows: result.rows
        };
      } finally {
        client.release();
      }
    })();
  }

  async get(sql, params = []) {
    return withDatabaseLogging(this.logger, 'get', async () => {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    })();
  }

  async all(sql, params = []) {
    return withDatabaseLogging(this.logger, 'all', async () => {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    })();
  }

  async runMigrations() {
    try {
      // Create migrations table with PostgreSQL syntax
      await this.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id          SERIAL PRIMARY KEY,
          filename    TEXT NOT NULL UNIQUE,
          applied_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
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
          
          if (filename !== '001_initial_schema.sql' &&
              filename !== '002_claude_integration.sql' &&
              filename !== '005_add_code_review_status.sql' &&
              filename !== '007_add_agent_execution.sql' &&
              filename !== '008_add_agent_execution_safe.sql' &&
              this.containsDangerousSQLPatterns(sql)) {
            throw new Error(`Migration ${filename} contains potentially dangerous SQL patterns`);
          }
          
          const statements = this.parseSQL(sql);
          
          await this.run('BEGIN');
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
            await this.run('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
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
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  async close() {
    if (this.pool) {
      try {
        await this.pool.end();
        this.logger.info('Database connection pool closed');
        this.pool = null;
      } catch (error) {
        this.logger.error('Error closing database pool:', { error: error.message });
      }
    }
  }

  async transaction(fn) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  containsDangerousSQLPatterns(sql) {
    // PostgreSQL-specific dangerous patterns
    const dangerousPatterns = [
      /;\s*--/, // Comment injection
      /;\s*\/\*/, // Block comment injection
      /COPY\s+.*FROM\s+PROGRAM/i, // System command execution
      /CREATE\s+OR\s+REPLACE\s+FUNCTION.*LANGUAGE\s+(C|plpythonu|plperlu|pltclu)/i, // Unsafe languages
      /lo_import\s*\(/i, // Large object import
      /lo_export\s*\(/i, // Large object export
      /pg_read_file\s*\(/i, // File system access
      /pg_ls_dir\s*\(/i, // Directory listing
      /pg_stat_file\s*\(/i, // File stat access
    ];

    return dangerousPatterns.some(pattern => pattern.test(sql));
  }

  parseSQL(sql) {
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let inDollarQuoted = false;
    let dollarTag = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      // Handle dollar-quoted strings (PostgreSQL)
      if (!inString && !inComment && char === '$') {
        const remaining = sql.slice(i);
        const dollarMatch = remaining.match(/^\$([^$]*)\$/);
        if (dollarMatch) {
          if (!inDollarQuoted) {
            // Start of dollar-quoted string
            inDollarQuoted = true;
            dollarTag = dollarMatch[0];
            current += dollarMatch[0];
            i += dollarMatch[0].length - 1;
            continue;
          } else if (remaining.startsWith(dollarTag)) {
            // End of dollar-quoted string
            inDollarQuoted = false;
            current += dollarTag;
            i += dollarTag.length - 1;
            dollarTag = '';
            continue;
          }
        }
      }

      if (inDollarQuoted) {
        current += char;
        continue;
      }

      if (!inString && char === '-' && nextChar === '-') {
        inComment = true;
        i++;
        continue;
      }

      if (inComment && char === '\n') {
        inComment = false;
        current += char;
        continue;
      }

      if (inComment) {
        continue;
      }

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }

      if (inString && char === stringChar) {
        if (sql[i + 1] === stringChar) {
          current += char + char;
          i++;
          continue;
        }
        inString = false;
        current += char;
        continue;
      }

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

    const finalStatement = current.trim();
    if (finalStatement) {
      statements.push(finalStatement);
    }

    return statements;
  }
}