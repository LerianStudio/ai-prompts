---
allowed-tools: Task(*), Read(*), LS(*), Glob(*)
description: Execute workflow YAML files using specialized agents from protocol-assets directory
argument-hint: [--workflow-name=<name>]
---

# /shared:utils:run-workflow

## Instructions

Execute workflow YAML files from the `protocol-assets/system/workflows/` directory using the Task tool with specialized agents.

1. Locate and read the specified workflow YAML file
2. Parse workflow configuration including agents, steps, and handoff prompts
3. Execute workflow steps in sequence using appropriate specialized agents
4. Handle data passing between workflow steps as defined
5. Process user input according to workflow's input_prompt specification

## Context

Workflows provide structured automation for complex development tasks that require multiple specialized agents working in sequence. The workflow system uses YAML configuration files to define step-by-step processes, agent assignments, and data flow between operations.

## Requirements

- Must locate workflow file in `protocol-assets/system/workflows/[workflow-name].yaml`
- Must parse YAML configuration correctly for agents and steps
- Must use Task tool with specified specialized agents
- Must follow defined workflow steps in correct sequence
- Must handle handoff prompts between different agents
- Must process input according to workflow's input_prompt specification

## Examples

```bash
# Execute description-to-task workflow
/shared:utils:run-workflow --workflow-name=description-to-task

# Execute any workflow by name (without .yaml extension)
/shared:utils:run-workflow --workflow-name=<workflow-name>
```

The description-to-task workflow example:

- Processes feature descriptions through user story generation
- Creates todo items and sub-task files
- Moves tasks from backlog to ready status
- Uses specialized agents: user-story-generator, todo-manager
- Prompts for input (e.g., path to description.md file)
  </examples>

## Process

## Workflow Execution Process

### Step 1: Workflow Discovery

- Read specified workflow YAML from `protocol-assets/system/workflows/[workflow-name].yaml`
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
