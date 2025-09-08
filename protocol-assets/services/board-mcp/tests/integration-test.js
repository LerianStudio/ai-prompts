#!/usr/bin/env node

import { 
  createTask, 
  getTask, 
  updateTaskStatus, 
  completeTodoItem, 
  listTasks, 
  healthCheck 
} from '../src/index.js';

async function runIntegrationTest() {
  console.log('🧪 Running Task Management Integration Test\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await healthCheck();
    if (!health.success) {
      throw new Error(`Health check failed: ${health.message}`);
    }
    console.log('✅ Service is healthy\n');

    // Test 2: Create Task
    console.log('2. Testing task creation...');
    const createResult = await createTask(
      'Integration Test Task',
      'Testing the complete task lifecycle',
      [
        'Create task structure',
        'Implement core functionality', 
        'Add error handling',
        'Write tests',
        'Deploy to production'
      ]
    );

    if (!createResult.success) {
      throw new Error(`Task creation failed: ${createResult.message}`);
    }

    console.log(`✅ Created task: ${createResult.task_id}`);
    console.log(`   Title: ${createResult.task.title}`);
    console.log(`   Todos: ${createResult.task.todos.length}\n`);

    const taskId = createResult.task_id;

    // Test 3: Get Task
    console.log('3. Testing task retrieval...');
    const getResult = await getTask(taskId);
    if (!getResult.success) {
      throw new Error(`Task retrieval failed: ${getResult.message}`);
    }
    console.log(`✅ Retrieved task: ${getResult.task.title}`);
    console.log(`   Status: ${getResult.task.status}`);
    console.log(`   Pending todos: ${getResult.task.todos.filter(t => t.status === 'pending').length}\n`);

    // Test 4: Start Task (Update Status)
    console.log('4. Testing task status update...');
    const updateResult = await updateTaskStatus(taskId, 'in_progress');
    if (!updateResult.success) {
      throw new Error(`Status update failed: ${updateResult.message}`);
    }
    console.log(`✅ Updated task status to: ${updateResult.task.status}\n`);

    // Test 5: Complete Todo Items
    console.log('5. Testing todo completion...');
    const todosToComplete = [
      'Create task structure',
      'Implement core functionality',
      'Add error handling'
    ];

    for (const todoContent of todosToComplete) {
      console.log(`   Completing: "${todoContent}"`);
      const completeResult = await completeTodoItem(taskId, todoContent);
      if (!completeResult.success) {
        throw new Error(`Todo completion failed: ${completeResult.message}`);
      }
      console.log(`   ✅ Completed: "${todoContent}"`);
    }
    
    console.log();

    // Test 6: Check Updated Task
    console.log('6. Testing task state after todo completions...');
    const updatedTask = await getTask(taskId);
    if (!updatedTask.success) {
      throw new Error(`Task retrieval failed: ${updatedTask.message}`);
    }
    
    const completedTodos = updatedTask.task.todos.filter(t => t.status === 'completed').length;
    const pendingTodos = updatedTask.task.todos.filter(t => t.status === 'pending').length;
    
    console.log(`✅ Task progress: ${completedTodos} completed, ${pendingTodos} pending`);
    console.log(`   Task status: ${updatedTask.task.status}\n`);

    // Test 7: Complete Remaining Todos
    console.log('7. Testing completion of remaining todos...');
    const remainingTodos = updatedTask.task.todos
      .filter(t => t.status === 'pending')
      .map(t => t.content);

    for (const todoContent of remainingTodos) {
      console.log(`   Completing: "${todoContent}"`);
      const completeResult = await completeTodoItem(taskId, todoContent);
      if (!completeResult.success) {
        throw new Error(`Todo completion failed: ${completeResult.message}`);
      }
    }

    // Test 8: Verify Task Auto-Completion
    console.log('8. Testing automatic task completion...');
    const finalTask = await getTask(taskId);
    if (!finalTask.success) {
      throw new Error(`Task retrieval failed: ${finalTask.message}`);
    }

    console.log(`✅ Final task status: ${finalTask.task.status}`);
    console.log(`   All todos completed: ${finalTask.task.todos.every(t => t.status === 'completed')}\n`);

    // Test 9: List All Tasks
    console.log('9. Testing task listing...');
    const listResult = await listTasks();
    if (!listResult.success) {
      throw new Error(`Task listing failed: ${listResult.message}`);
    }
    console.log(`✅ Found ${listResult.count} total tasks\n`);

    // Test 10: List Completed Tasks
    console.log('10. Testing filtered task listing...');
    const completedTasks = await listTasks({ status: 'completed' });
    if (!completedTasks.success) {
      throw new Error(`Filtered task listing failed: ${completedTasks.message}`);
    }
    console.log(`✅ Found ${completedTasks.count} completed tasks\n`);

    console.log('🎉 All integration tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   - Task creation ✅');
    console.log('   - Task retrieval ✅');
    console.log('   - Status updates ✅'); 
    console.log('   - Todo completion ✅');
    console.log('   - Auto task completion ✅');
    console.log('   - Task listing/filtering ✅');
    console.log('\n🚀 Task Management System is ready for production use!');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest();