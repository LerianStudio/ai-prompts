/**
 * Integration tests for BoardTool
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BoardTool } from '../src/board-tool.js';
import { EnhancedTaskService } from '../../board-service/src/services/enhanced-task-service.js';
import { Task } from '../src/types.js';
import path from 'path';
import fs from 'fs/promises';

describe('BoardTool Integration', () => {
  let boardTool: BoardTool;
  let taskService: EnhancedTaskService;
  let testDbPath: string;

  beforeEach(async () => {
    // Create test database in memory
    testDbPath = ':memory:';
    taskService = new EnhancedTaskService(testDbPath);
    await taskService.initialize();
    
    boardTool = new BoardTool(taskService);
  });

  afterEach(async () => {
    if (taskService) {
      await taskService.close();
    }
  });

  describe('Tool Definitions', () => {
    test('should return correct tool definitions', () => {
      const tools = boardTool.getToolDefinitions();
      
      expect(tools).toHaveLength(5);
      expect(tools.map(t => t.name)).toEqual([
        'create_task',
        'update_task', 
        'delete_task',
        'get_task',
        'list_tasks'
      ]);
      
      // Check that all tools have proper annotations
      tools.forEach(tool => {
        expect(tool.annotations).toBeDefined();
        expect(typeof tool.annotations.destructive).toBe('boolean');
        expect(typeof tool.annotations.idempotent).toBe('boolean');
      });
    });

    test('should mark read-only operations correctly', () => {
      const tools = boardTool.getToolDefinitions();
      const readOnlyTools = tools.filter(t => t.annotations.readOnly);
      
      expect(readOnlyTools.map(t => t.name)).toEqual(['get_task', 'list_tasks']);
    });

    test('should mark destructive operations correctly', () => {
      const tools = boardTool.getToolDefinitions();
      const destructiveTools = tools.filter(t => t.annotations.destructive);
      
      expect(destructiveTools.map(t => t.name)).toEqual([
        'create_task',
        'update_task', 
        'delete_task'
      ]);
    });
  });

  describe('Task Operations', () => {
    test('should create a task successfully', async () => {
      const result = await boardTool.handleTool('create_task', {
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'high'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const task = JSON.parse(result.content[0].text);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test description');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('high');
      expect(task.id).toBeDefined();
    });

    test('should update a task successfully', async () => {
      // First create a task
      const createResult = await boardTool.handleTool('create_task', {
        title: 'Original Task',
        status: 'todo'
      });
      
      const createdTask = JSON.parse(createResult.content[0].text);
      
      // Then update it
      const updateResult = await boardTool.handleTool('update_task', {
        id: createdTask.id,
        title: 'Updated Task',
        status: 'in-progress'
      });

      const updatedTask = JSON.parse(updateResult.content[0].text);
      expect(updatedTask.title).toBe('Updated Task');
      expect(updatedTask.status).toBe('in-progress');
      expect(updatedTask.id).toBe(createdTask.id);
    });

    test('should delete a task successfully', async () => {
      // First create a task
      const createResult = await boardTool.handleTool('create_task', {
        title: 'Task to Delete',
        status: 'todo'
      });
      
      const createdTask = JSON.parse(createResult.content[0].text);
      
      // Then delete it
      const deleteResult = await boardTool.handleTool('delete_task', {
        id: createdTask.id
      });

      const result = JSON.parse(deleteResult.content[0].text);
      expect(result.success).toBe(true);
    });

    test('should get a task successfully', async () => {
      // First create a task
      const createResult = await boardTool.handleTool('create_task', {
        title: 'Task to Get',
        description: 'Test description',
        status: 'done'
      });
      
      const createdTask = JSON.parse(createResult.content[0].text);
      
      // Then get it
      const getResult = await boardTool.handleTool('get_task', {
        id: createdTask.id
      });

      const retrievedTask = JSON.parse(getResult.content[0].text);
      expect(retrievedTask).toEqual(createdTask);
    });

    test('should list tasks successfully', async () => {
      // Create some test tasks
      await boardTool.handleTool('create_task', {
        title: 'Task 1',
        status: 'todo',
        priority: 'high'
      });
      
      await boardTool.handleTool('create_task', {
        title: 'Task 2', 
        status: 'in-progress',
        priority: 'low'
      });

      // List all tasks
      const listResult = await boardTool.handleTool('list_tasks', {});
      
      const result = JSON.parse(listResult.content[0].text);
      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.summary).toContain('Found 2 tasks total');
    });

    test('should filter tasks by status', async () => {
      // Create tasks with different statuses
      await boardTool.handleTool('create_task', {
        title: 'Todo Task',
        status: 'todo'
      });
      
      await boardTool.handleTool('create_task', {
        title: 'In Progress Task',
        status: 'in-progress'
      });

      // Filter by status
      const listResult = await boardTool.handleTool('list_tasks', {
        status: 'todo'
      });
      
      const result = JSON.parse(listResult.content[0].text);
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe('todo');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tool names', async () => {
      await expect(
        boardTool.handleTool('invalid_tool', {})
      ).rejects.toThrow('Unknown tool');
    });

    test('should handle missing task ID for get_task', async () => {
      await expect(
        boardTool.handleTool('get_task', {})
      ).rejects.toThrow('Task ID is required');
    });

    test('should handle non-existent task', async () => {
      await expect(
        boardTool.handleTool('get_task', { id: 'non-existent' })
      ).rejects.toThrow('Task not found');
    });

    test('should handle invalid parameters', async () => {
      await expect(
        boardTool.handleTool('create_task', {
          title: '',  // Empty title should fail
        })
      ).rejects.toThrow('cannot be empty');
    });

    test('should handle invalid status', async () => {
      await expect(
        boardTool.handleTool('create_task', {
          title: 'Test Task',
          status: 'invalid-status'
        })
      ).rejects.toThrow('Status must be one of');
    });

    test('should handle invalid priority', async () => {
      await expect(
        boardTool.handleTool('create_task', {
          title: 'Test Task',
          priority: 'invalid-priority'
        })
      ).rejects.toThrow('Priority must be one of');
    });
  });

  describe('Completions', () => {
    test('should provide status completions', async () => {
      const completions = await boardTool.getCompletions('create_task', 'status');
      expect(completions).toEqual(['todo', 'in-progress', 'done']);
    });

    test('should provide priority completions', async () => {
      const completions = await boardTool.getCompletions('create_task', 'priority');
      expect(completions).toEqual(['low', 'medium', 'high']);
    });

    test('should provide task ID completions', async () => {
      // Create a task first
      await boardTool.handleTool('create_task', {
        title: 'Test Task'
      });

      const completions = await boardTool.getCompletions('get_task', 'id');
      expect(completions).toHaveLength(1);
      expect(typeof completions[0]).toBe('string');
    });

    test('should return empty completions for unknown parameters', async () => {
      const completions = await boardTool.getCompletions('create_task', 'unknown');
      expect(completions).toEqual([]);
    });
  });
});