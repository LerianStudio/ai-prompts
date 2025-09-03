#!/usr/bin/env node

/**
 * End-to-end workflow test for the new @task-manager system
 * Simulates the complete process from task creation through completion
 * following the new database-backed workflow patterns
 */

import { 
  createTask, 
  getTask, 
  updateTaskStatus, 
  completeTodoItem, 
  listTasks, 
  healthCheck 
} from '../src/index.js';

class WorkflowEndToEndTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTests() {
    console.log('🧪 End-to-End Workflow Test for @task-manager System');
    console.log('='.repeat(60));
    console.log();

    try {
      // Test service health
      await this.testServiceHealth();

      // Simulate complete workflow
      await this.simulateTaskBredownSpecialist();
      await this.simulateFrontendDeveloper();
      await this.simulateWorkflowCompletion();

      // Verify database integrity
      await this.verifyDatabaseIntegrity();

      // Generate final report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Workflow test failed:', error.message);
      this.testResults.errors.push({
        test: 'Workflow execution',
        error: error.message
      });
    }
  }

  async testServiceHealth() {
    console.log('1️⃣ Testing service health...');
    const health = await healthCheck();
    
    if (health.success) {
      console.log('✅ Task management service is healthy');
      this.testResults.passed++;
    } else {
      throw new Error('Service health check failed');
    }
    console.log();
  }

  async simulateTaskBredownSpecialist() {
    console.log('2️⃣ Simulating task-breakdown-specialist workflow...');
    
    // Create a comprehensive frontend task as the specialist would
    const taskTitle = 'UI Implementation: User Profile Dashboard';
    const taskDescription = `
# User Story
As a user, I want to view and edit my profile information so that I can keep my account details up to date.

## Priority
**Priority**: High

## Acceptance Criteria
- **Given** I am logged in
- **When** I navigate to my profile page
- **Then** I can view my current profile information
- **And** I can edit and save changes to my profile

## Technical Specifications
- Create responsive profile dashboard using shadcn/ui components
- Implement form validation for profile updates
- Add accessibility features (ARIA labels, keyboard navigation)
- Follow established design patterns and Tailwind CSS conventions

## Dependencies
- **Depends on**: Authentication system
- **Blocks**: Settings page implementation

## Risks & Mitigation
- **Risk**: Form validation complexity
- **Mitigation**: Use existing form validation utilities
    `.trim();

    const todos = [
      // Component Development Phase
      "Create ProfileDashboard component at `/src/components/ProfileDashboard.tsx`",
      "Implement shadcn/ui Card and Form components integration",
      "Define ProfileData interface and component props",
      
      // Styling Implementation Phase  
      "Apply Tailwind CSS classes for responsive layout",
      "Implement design tokens and consistent spacing",
      "Ensure visual consistency with design system",
      
      // Interactive Features Phase
      "Add form submission and validation handlers",
      "Implement save/cancel button interactions",
      "Handle loading and error states",
      
      // Responsive Design Phase
      "Implement mobile-first responsive layout",
      "Test across different screen sizes",
      "Optimize for tablet and desktop views",
      
      // Accessibility Compliance Phase
      "Add ARIA labels and semantic HTML",
      "Implement keyboard navigation support", 
      "Test with screen readers",
      
      // Testing & Integration Phase
      "Unit tests for ProfileDashboard component",
      "Integration tests for form submission",
      "E2E tests for complete user workflow"
    ];

    const result = await createTask(taskTitle, taskDescription, todos);
    
    if (result.success) {
      console.log(`✅ Task created successfully: ${result.task_id}`);
      console.log(`   Title: ${result.task.title}`);
      console.log(`   Todos: ${result.task.todos.length} organized in phases`);
      this.testResults.passed++;
      this.taskId = result.task_id;
    } else {
      throw new Error(`Task creation failed: ${result.message}`);
    }
    console.log();
  }

  async simulateFrontendDeveloper() {
    console.log('3️⃣ Simulating frontend-developer workflow...');
    
    // 1. Start the task
    console.log('   📋 Starting task implementation...');
    const startResult = await updateTaskStatus(this.taskId, 'in_progress');
    if (!startResult.success) {
      throw new Error(`Failed to start task: ${startResult.message}`);
    }
    console.log('   ✅ Task set to in_progress');

    // 2. Get task details
    const taskDetails = await getTask(this.taskId);
    if (!taskDetails.success) {
      throw new Error(`Failed to get task details: ${taskDetails.message}`);
    }

    console.log(`   📝 Loaded task with ${taskDetails.task.todos.length} todos`);
    
    // 3. Simulate implementing todos phase by phase
    const phases = [
      'Component Development',
      'Styling Implementation', 
      'Interactive Features',
      'Responsive Design',
      'Accessibility Compliance',
      'Testing & Integration'
    ];

    let completedCount = 0;
    for (const phase of phases) {
      console.log(`   🔧 Implementing ${phase} phase...`);
      
      // Complete 3 todos from this phase
      const phaseTodos = taskDetails.task.todos.slice(completedCount, completedCount + 3);
      
      for (const todo of phaseTodos) {
        const completeResult = await completeTodoItem(this.taskId, todo.content);
        if (completeResult.success) {
          console.log(`      ✅ Completed: "${todo.content.substring(0, 50)}..."`);
          completedCount++;
        } else {
          throw new Error(`Failed to complete todo: ${completeResult.message}`);
        }
      }
      
      // Small delay to simulate implementation time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`   🎉 All ${completedCount} todos completed!`);
    this.testResults.passed++;
    console.log();
  }

  async simulateWorkflowCompletion() {
    console.log('4️⃣ Simulating workflow completion...');
    
    // Verify task auto-completed
    const finalTask = await getTask(this.taskId);
    if (!finalTask.success) {
      throw new Error(`Failed to get final task state: ${finalTask.message}`);
    }

    console.log(`   📊 Final task status: ${finalTask.task.status}`);
    console.log(`   📋 Completed todos: ${finalTask.task.todos.filter(t => t.status === 'completed').length}/${finalTask.task.todos.length}`);
    
    if (finalTask.task.status === 'completed') {
      console.log('   ✅ Task automatically completed when all todos finished');
      this.testResults.passed++;
    } else {
      throw new Error(`Expected task to be completed, but status is: ${finalTask.task.status}`);
    }
    console.log();
  }

  async verifyDatabaseIntegrity() {
    console.log('5️⃣ Verifying database integrity...');
    
    // List all tasks
    const allTasks = await listTasks();
    if (!allTasks.success) {
      throw new Error(`Failed to list tasks: ${allTasks.message}`);
    }

    console.log(`   📈 Total tasks in database: ${allTasks.count}`);
    
    // Verify our test task exists
    const testTask = allTasks.tasks.find(t => t.id === this.taskId);
    if (!testTask) {
      throw new Error('Test task not found in database');
    }

    console.log('   ✅ Test task found in database');
    console.log(`   📝 Task title: "${testTask.title}"`);
    console.log(`   📊 Task status: ${testTask.status}`);
    console.log(`   📋 Todo count: ${testTask.todos.length}`);

    // Verify data consistency
    const completedTodos = testTask.todos.filter(t => t.status === 'completed');
    if (completedTodos.length === testTask.todos.length && testTask.status === 'completed') {
      console.log('   ✅ Database integrity verified - all todos completed, task completed');
      this.testResults.passed++;
    } else {
      throw new Error('Database integrity issue - todo/task status mismatch');
    }
    console.log();
  }

  generateTestReport() {
    console.log('📊 End-to-End Test Report');
    console.log('='.repeat(30));
    
    console.log(`✅ Tests passed: ${this.testResults.passed}`);
    console.log(`❌ Tests failed: ${this.testResults.failed}`);
    console.log(`🔍 Errors: ${this.testResults.errors.length}`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Error Details:');
      for (const error of this.testResults.errors) {
        console.log(`   - ${error.test}: ${error.error}`);
      }
    }

    console.log();
    if (this.testResults.passed > 0 && this.testResults.failed === 0) {
      console.log('🎉 All end-to-end tests PASSED!');
      console.log();
      console.log('✅ Workflow Validation Complete:');
      console.log('   - Task creation via @task-manager.createTask() ✅');
      console.log('   - Task progression via @task-manager.updateTaskStatus() ✅');
      console.log('   - Todo completion via @task-manager.completeTodoItem() ✅');
      console.log('   - Auto task completion when all todos done ✅');
      console.log('   - Database integrity and consistency ✅');
      console.log('   - Agent coordination via task_id ✅');
      console.log();
      console.log('🚀 The new @task-manager system is ready for production use!');
      console.log('   Replace file-based workflows with database-backed task management.');
    } else {
      console.log('❌ Some tests failed. Please review errors above.');
      process.exit(1);
    }
  }
}

// Run the test
const test = new WorkflowEndToEndTest();
test.runTests().catch(console.error);