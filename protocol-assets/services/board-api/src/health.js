import { DatabaseManager } from './database/database-manager.js';

export const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbPath = process.env.DB_PATH || '../../../infrastructure/data/databases/task-management.db';
    const db = new DatabaseManager(dbPath);
    await db.initialize();
    await db.all('SELECT 1');
    await db.close();

    res.json({
      service: 'board-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      service: 'board-api',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};