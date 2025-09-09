import { randomUUID } from 'crypto';
import yaml from 'js-yaml';

/**
 * WorkflowOrchestrator - Transforms sequential workflows into parallel kanban tasks
 * 
 * This class takes a workflow definition and creates all necessary tasks upfront
 * with proper dependency relationships, enabling agents to work in parallel
 * on available tasks rather than waiting for sequential execution.
 */
export class WorkflowOrchestrator {
  constructor(enhancedTaskService) {
    this.taskService = enhancedTaskService;
  }

  /**
   * Initialize a complete workflow by creating all tasks with dependencies
   */
  async initializeWorkflow(workflowDefinition) {
    if (typeof workflowDefinition === 'string') {
      workflowDefinition = yaml.load(workflowDefinition);
    }

    const workflow = workflowDefinition.workflow;
    const workflowId = workflow.id || randomUUID();

    try {
      // 1. Build dependency graph from requires/creates relationships
      const dependencyGraph = this.buildDependencyGraph(workflow);
      
      // 2. Create all tasks with proper dependencies and metadata
      const createdTasks = await this.createAllWorkflowTasks(
        workflow, 
        workflowId, 
        dependencyGraph
      );

      // 3. Return workflow summary
      return {
        success: true,
        workflow_id: workflowId,
        workflow_name: workflow.name,
        total_tasks: createdTasks.length,
        tasks: createdTasks,
        message: `Workflow "${workflow.name}" initialized with ${createdTasks.length} tasks`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to initialize workflow: ${error.message}`
      };
    }
  }

  /**
   * Build dependency graph from workflow steps
   */
  buildDependencyGraph(workflow) {
    const graph = {
      steps: new Map(),
      dependencies: new Map(),
      artifacts: new Map() // Maps artifact names to the steps that create them
    };

    // First pass: catalog all steps and their artifacts
    for (const step of workflow.steps) {
      graph.steps.set(step.id, {
        ...step,
        requires: this.normalizeRequirements(step.requires),
        creates: this.normalizeArtifacts(step.creates)
      });

      // Map artifacts to their creators
      const creates = this.normalizeArtifacts(step.creates);
      for (const artifact of creates) {
        graph.artifacts.set(artifact, step.id);
      }
    }

    // Second pass: resolve dependencies
    for (const step of workflow.steps) {
      const dependencies = [];
      const requires = this.normalizeRequirements(step.requires);
      
      for (const requirement of requires) {
        const creatorStepId = graph.artifacts.get(requirement);
        if (creatorStepId && creatorStepId !== step.id) {
          dependencies.push(creatorStepId);
        }
      }

      graph.dependencies.set(step.id, dependencies);
    }

    return graph;
  }

  /**
   * Create all workflow tasks with dependencies
   */
  async createAllWorkflowTasks(workflow, workflowId, dependencyGraph) {
    const createdTasks = [];
    const stepToTaskMap = new Map();

    // Create tasks for each step
    for (const step of workflow.steps) {
      const dependencies = dependencyGraph.dependencies.get(step.id) || [];
      const dependencyTaskIds = dependencies.map(stepId => stepToTaskMap.get(stepId)).filter(Boolean);

      const taskData = {
        title: step.title || `Step: ${step.id}`,
        description: this.generateStepDescription(step, workflow),
        todos: step.todos || this.generateDefaultTodos(step),
        workflow_id: workflowId,
        step_id: step.id,
        agent_type: step.agent,
        priority: step.priority || this.calculatePriority(step, dependencyGraph),
        estimated_duration: step.estimated_duration,
        dependencies: dependencyTaskIds,
        status: dependencyTaskIds.length > 0 ? 'blocked' : 'pending'
      };

      const task = await this.taskService.createWorkflowTask(taskData);
      createdTasks.push(task);
      stepToTaskMap.set(step.id, task.id);
    }

    return createdTasks;
  }

  /**
   * Generate step description with context
   */
  generateStepDescription(step, workflow) {
    let description = step.description || `Execute step ${step.id} using ${step.agent} agent`;
    
    if (step.requires && step.requires.length > 0) {
      const requires = this.normalizeRequirements(step.requires);
      description += `\n\nRequires: ${requires.join(', ')}`;
    }
    
    if (step.creates) {
      const creates = this.normalizeArtifacts(step.creates);
      description += `\n\nCreates: ${creates.join(', ')}`;
    }

    if (step.uses) {
      description += `\n\nUses template: ${step.uses}`;
    }

    return description;
  }

  /**
   * Generate default todos if none provided
   */
  generateDefaultTodos(step) {
    const todos = [];
    
    if (step.requires) {
      const requires = this.normalizeRequirements(step.requires);
      if (requires.length > 0) {
        todos.push(`Verify requirements: ${requires.join(', ')}`);
      }
    }

    if (step.uses) {
      todos.push(`Apply template: ${step.uses}`);
    }

    todos.push(`Execute ${step.id} task`);

    if (step.creates) {
      const creates = this.normalizeArtifacts(step.creates);
      todos.push(`Produce outputs: ${creates.join(', ')}`);
    }

    return todos;
  }

  /**
   * Calculate task priority based on position in dependency chain
   */
  calculatePriority(step, dependencyGraph) {
    // Tasks with no dependencies get higher priority
    const dependencies = dependencyGraph.dependencies.get(step.id) || [];
    if (dependencies.length === 0) {
      return 100;
    }

    // Tasks deeper in the dependency chain get lower priority
    const depth = this.calculateDependencyDepth(step.id, dependencyGraph);
    return Math.max(0, 100 - (depth * 10));
  }

  /**
   * Calculate how deep a step is in the dependency chain
   */
  calculateDependencyDepth(stepId, dependencyGraph, visited = new Set()) {
    if (visited.has(stepId)) {
      return 0; // Circular dependency protection
    }

    visited.add(stepId);
    const dependencies = dependencyGraph.dependencies.get(stepId) || [];
    
    if (dependencies.length === 0) {
      return 0;
    }

    let maxDepth = 0;
    for (const depStepId of dependencies) {
      const depth = this.calculateDependencyDepth(depStepId, dependencyGraph, visited);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth + 1;
  }

  /**
   * Normalize requirements to array
   */
  normalizeRequirements(requires) {
    if (!requires) return [];
    if (typeof requires === 'string') return [requires];
    if (Array.isArray(requires)) return requires;
    return [];
  }

  /**
   * Normalize artifacts to array
   */
  normalizeArtifacts(creates) {
    if (!creates) return [];
    if (typeof creates === 'string') return [creates];
    if (Array.isArray(creates)) return creates;
    return [];
  }

  /**
   * Get workflow status and progress
   */
  async getWorkflowStatus(workflowId) {
    const progress = await this.taskService.getWorkflowProgress(workflowId);
    const tasks = await this.taskService.listWorkflowTasks({ 
      workflow_id: workflowId,
      include_todos: true 
    });

    // Group tasks by agent
    const tasksByAgent = {};
    for (const task of tasks) {
      if (!tasksByAgent[task.agent_type]) {
        tasksByAgent[task.agent_type] = [];
      }
      tasksByAgent[task.agent_type].push(task);
    }

    // Find blocking tasks
    const blockingTasks = tasks.filter(task => 
      task.status === 'failed' && task.dependents && task.dependents.length > 0
    );

    return {
      ...progress,
      tasks,
      tasks_by_agent: tasksByAgent,
      blocking_tasks: blockingTasks,
      is_complete: progress.completed_tasks === progress.total_tasks && progress.failed_tasks === 0,
      is_blocked: blockingTasks.length > 0
    };
  }

  /**
   * Get available work for a specific agent type
   */
  async getAgentWork(agentType, limit = 5) {
    return this.taskService.getAvailableWorkForAgent(agentType, limit);
  }

  /**
   * Claim a task for an agent
   */
  async claimTask(taskId, agentId) {
    return this.taskService.claimTask(taskId, agentId);
  }

  /**
   * Complete a task and activate dependencies
   */
  async completeTask(taskId) {
    const result = await this.taskService.updateTaskStatus(taskId, 'completed');
    
    if (result) {
      // Get list of newly activated tasks
      const activatedTasks = await this.taskService.activateDependentTasks(taskId);
      
      return {
        ...result,
        activated_dependent_tasks: activatedTasks
      };
    }
    
    return result;
  }

  /**
   * Validate workflow definition
   */
  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.workflow) {
      errors.push('Missing workflow root object');
      return errors;
    }

    const wf = workflow.workflow;

    if (!wf.id) {
      errors.push('Workflow must have an id');
    }

    if (!wf.steps || !Array.isArray(wf.steps)) {
      errors.push('Workflow must have steps array');
      return errors;
    }

    const stepIds = new Set();
    const artifacts = new Set();

    for (let i = 0; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      const prefix = `Step ${i + 1}`;

      if (!step.id) {
        errors.push(`${prefix}: Missing step id`);
        continue;
      }

      if (stepIds.has(step.id)) {
        errors.push(`${prefix}: Duplicate step id '${step.id}'`);
      }
      stepIds.add(step.id);

      if (!step.agent) {
        errors.push(`${prefix} (${step.id}): Missing agent assignment`);
      }

      // Check for circular dependencies
      if (step.requires) {
        const requires = this.normalizeRequirements(step.requires);
        const creates = this.normalizeArtifacts(step.creates);
        
        for (const req of requires) {
          if (creates.includes(req)) {
            errors.push(`${prefix} (${step.id}): Step cannot require its own output '${req}'`);
          }
        }
      }

      // Track artifacts for dependency validation
      if (step.creates) {
        const creates = this.normalizeArtifacts(step.creates);
        for (const artifact of creates) {
          if (artifacts.has(artifact)) {
            errors.push(`${prefix} (${step.id}): Artifact '${artifact}' is created by multiple steps`);
          }
          artifacts.add(artifact);
        }
      }
    }

    // Validate that all requirements can be satisfied
    for (const step of wf.steps) {
      if (step.requires) {
        const requires = this.normalizeRequirements(step.requires);
        for (const req of requires) {
          if (!artifacts.has(req)) {
            errors.push(`Step '${step.id}' requires '${req}' but no step creates it`);
          }
        }
      }
    }

    return errors;
  }
}