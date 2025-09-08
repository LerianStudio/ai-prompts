---
allowed-tools: Task(*), Read(*), LS(*), Glob(*)
description: Execute workflow YAML files using specialized agents from protocol-assets directory
argument-hint: [--workflow-path=<path>]
---

# /shared:utils:run-workflow

<instructions>
Execute workflow YAML files using the Task tool with specialized agents.

1. Locate and read the specified workflow YAML file from the given path
2. Parse workflow configuration including agents, steps, and handoff prompts
3. Execute workflow steps in sequence using appropriate specialized agents
4. Handle data passing between workflow steps as defined
5. Process user input according to workflow's input_prompt specification
   </instructions>

<context>
Workflows provide structured automation for complex development tasks that require multiple specialized agents working in sequence. The workflow system uses YAML configuration files to define step-by-step processes, agent assignments, and data flow between operations.
</context>

<requirements>
- Must locate workflow file at the specified path
- Must parse YAML configuration correctly for agents and steps
- Must use Task tool with specified specialized agents
- Must follow defined workflow steps in correct sequence
- Must handle handoff prompts between different agents
- Must process input according to workflow's input_prompt specification
</requirements>

<example>
```bash
# Execute workflow from frontend workflows directory
/shared:utils:run-workflow --workflow-path=protocol-assets/frontend/workflows/file-workflow.yaml

# Execute any workflow by path

/shared:utils:run-workflow --workflow-path=<path-to-workflow.yaml>

```

The file-workflow example:

- Demonstrates file processing through specialized agents
- Creates tasks on kanban board using MCP board tools
- Processes files through creation, validation, and reporting
- Uses specialized agents: file-creator, file-reader, task-breakdown-specialist
- Updates board task progress throughout workflow execution
</example>

<process>
## Workflow Execution Process

### Step 1: Workflow Discovery

- Read specified workflow YAML from the provided path
- Parse workflow configuration structure
- Identify required agents, steps, and input requirements

### Step 2: Input Processing

- Accept workflow input as specified in the workflow's input_prompt
- Validate input format and requirements
- Prepare data for first workflow step

### Step 3: Sequential Execution

- Execute each workflow step using Task tool
- Use appropriate specialized agents (user-story-generator, todo-manager, etc.)
- Follow defined workflow steps in correct sequence
- Handle handoff prompts between agents

### Step 4: Data Flow Management

- Pass data between workflow steps as defined in YAML
- Maintain context and state across agent transitions
- Ensure proper data formatting for each step

The workflow system enables complex multi-agent automation while maintaining clear structure and reproducible results.
</process>
```
