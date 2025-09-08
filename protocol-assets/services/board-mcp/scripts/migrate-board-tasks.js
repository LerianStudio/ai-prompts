#!/usr/bin/env node

/**
 * Migration script to convert file-based board tasks to database-backed tasks
 * This script reads existing protocol-assets/shared/board/ directories and
 * imports them into the new @task-manager system
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TaskManagerTool } from '../src/board-tool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BoardTaskMigrator {
  constructor(boardPath, serviceUrl = 'http://localhost:3020') {
    this.boardPath = boardPath;
    this.taskManager = new TaskManagerTool(serviceUrl);
    this.migrationReport = {
      successful: [],
      failed: [],
      skipped: []
    };
  }

  async migrate() {
    console.log('🚀 Starting board task migration...\n');

    try {
      // Check if task service is running
      const health = await this.taskManager.healthCheck();
      if (!health.success) {
        throw new Error('Task management service is not available. Please start it first.');
      }
      console.log('✅ Task management service is healthy\n');

      // Check if board directory exists
      if (!this.boardExists()) {
        console.log('ℹ️  No board directory found. Migration not needed.');
        return;
      }

      // Migrate each board stage
      await this.migrateBoardStage('01.backlog', 'pending');
      await this.migrateBoardStage('02.ready', 'pending'); 
      await this.migrateBoardStage('03.done', 'completed');

      // Generate migration report
      this.generateReport();

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }

  boardExists() {
    try {
      const stats = statSync(this.boardPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  async migrateBoardStage(stagePath, defaultStatus) {
    const fullStagePath = join(this.boardPath, stagePath);
    
    try {
      const stageStats = statSync(fullStagePath);
      if (!stageStats.isDirectory()) return;
    } catch (error) {
      console.log(`ℹ️  Stage directory ${stagePath} not found, skipping...`);
      return;
    }

    console.log(`📂 Migrating stage: ${stagePath}`);
    
    const taskDirs = readdirSync(fullStagePath);
    
    for (const taskDir of taskDirs) {
      const taskPath = join(fullStagePath, taskDir);
      
      try {
        const taskStats = statSync(taskPath);
        if (!taskStats.isDirectory()) continue;

        await this.migrateTask(taskPath, taskDir, defaultStatus);
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${taskDir}: ${error.message}`);
        this.migrationReport.failed.push({
          path: taskPath,
          error: error.message
        });
      }
    }
  }

  async migrateTask(taskPath, taskDir, defaultStatus) {
    console.log(`   📝 Processing: ${taskDir}`);

    // Read task files
    const taskData = this.readTaskFiles(taskPath);
    
    if (!taskData.hasContent) {
      console.log(`   ⏩ Skipping ${taskDir}: No content found`);
      this.migrationReport.skipped.push({
        path: taskPath,
        reason: 'No content found'
      });
      return;
    }

    // Create task in database
    const result = await this.taskManager.createTask(
      taskData.title || `Migrated Task: ${taskDir}`,
      taskData.description || 'Migrated from file-based board system',
      taskData.todos
    );

    if (result.success) {
      // Update status if different from default 'pending'
      if (defaultStatus !== 'pending') {
        await this.taskManager.updateTaskStatus(result.task_id, defaultStatus);
      }

      console.log(`   ✅ Migrated: ${result.task_id} (${taskData.todos.length} todos)`);
      this.migrationReport.successful.push({
        originalPath: taskPath,
        taskId: result.task_id,
        title: taskData.title,
        todosCount: taskData.todos.length,
        status: defaultStatus
      });
    } else {
      throw new Error(result.message);
    }
  }

  readTaskFiles(taskPath) {
    const taskData = {
      title: null,
      description: null,
      todos: [],
      hasContent: false
    };

    try {
      // Try to read description.md
      const descriptionPath = join(taskPath, 'description.md');
      try {
        const descriptionContent = readFileSync(descriptionPath, 'utf-8');
        taskData.description = descriptionContent;
        taskData.hasContent = true;
        
        // Extract title from first heading or filename
        const titleMatch = descriptionContent.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          taskData.title = titleMatch[1];
        }
      } catch (error) {
        // description.md not found
      }

      // Try to read todos.md
      const todosPath = join(taskPath, 'todos.md');
      try {
        const todosContent = readFileSync(todosPath, 'utf-8');
        taskData.todos = this.parseTodosFromMarkdown(todosContent);
        taskData.hasContent = true;
      } catch (error) {
        // todos.md not found
      }

      // Check for ui-task subdirectories
      const files = readdirSync(taskPath);
      for (const file of files) {
        const filePath = join(taskPath, file);
        const fileStats = statSync(filePath);
        
        if (fileStats.isDirectory() && file.startsWith('ui-task-')) {
          const subTaskData = this.readTaskFiles(filePath);
          if (subTaskData.hasContent) {
            taskData.todos.push(...subTaskData.todos.map(todo => `[${file}] ${todo}`));
            taskData.hasContent = true;
          }
        }
      }

    } catch (error) {
      // Handle directory read errors
    }

    return taskData;
  }

  parseTodosFromMarkdown(todosContent) {
    const todos = [];
    const lines = todosContent.split('\n');
    
    for (const line of lines) {
      // Match markdown checkboxes: - [ ] or - [x]
      const todoMatch = line.match(/^[\s]*-\s+\[[x\s]\]\s+(.+)$/);
      if (todoMatch) {
        todos.push(todoMatch[1].trim());
      }
    }
    
    return todos;
  }

  generateReport() {
    console.log('\n📊 Migration Report');
    console.log('==================');
    
    console.log(`✅ Successful migrations: ${this.migrationReport.successful.length}`);
    console.log(`❌ Failed migrations: ${this.migrationReport.failed.length}`);
    console.log(`⏩ Skipped: ${this.migrationReport.skipped.length}`);
    
    if (this.migrationReport.successful.length > 0) {
      console.log('\n✅ Successfully migrated tasks:');
      for (const task of this.migrationReport.successful) {
        console.log(`   - ${task.title} (${task.taskId}) - ${task.todosCount} todos`);
      }
    }
    
    if (this.migrationReport.failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      for (const failure of this.migrationReport.failed) {
        console.log(`   - ${failure.path}: ${failure.error}`);
      }
    }

    if (this.migrationReport.skipped.length > 0) {
      console.log('\n⏩ Skipped:');
      for (const skipped of this.migrationReport.skipped) {
        console.log(`   - ${skipped.path}: ${skipped.reason}`);
      }
    }

    console.log('\n🎉 Migration completed!');
    
    if (this.migrationReport.successful.length > 0) {
      console.log('\n⚠️  Next steps:');
      console.log('   1. Verify migrated tasks in the database');
      console.log('   2. Test workflows with new task IDs'); 
      console.log('   3. Backup and remove old board directories');
      console.log('   4. Update any remaining references to file paths');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const boardPath = args[0] || 'protocol-assets/shared/board-legacy-backup';
  const serviceUrl = args[1] || 'http://localhost:3020';

  console.log(`Board path: ${boardPath}`);
  console.log(`Service URL: ${serviceUrl}\n`);

  const migrator = new BoardTaskMigrator(boardPath, serviceUrl);
  await migrator.migrate();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}