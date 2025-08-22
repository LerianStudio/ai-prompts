# Workflows

This directory contains YAML workflow definitions that orchestrate the Lerian Protocol automation processes.

## Purpose

The workflows folder serves as a centralized location for:

- YAML workflow orchestration files
- Process definitions and step sequences
- Agent coordination specifications
- Input/output parameter definitions
- Validation and error handling rules
- Workflow execution configurations

## Structure

This directory is organized to provide workflow definitions that control how agents, templates, and context knowledge are combined to produce automated outputs through the stage-gate system.

## Workflow Skeleton Template

The `.workflow/workflows/skeleton.yaml` file serves as a comprehensive template for creating new workflow definitions. This skeleton provides:

### Template Structure

- **Placeholders**: All configurable elements use `{{PLACEHOLDER_NAME}}` syntax
- **Complete Schema**: Includes all possible workflow sections and properties
- **Step Sequences**: Structured pattern for multi-step agent orchestration
- **Validation Points**: Built-in checkpoints and conditional logic
- **Documentation**: Embedded notes and handoff prompts

### Key Placeholder Categories

- `{{WORKFLOW_*}}`: Basic workflow metadata (ID, name, description, type)
- `{{PROJECT_TYPE_*}}`: Applicable project categories
- `{{STEP_*_*}}`: Individual step configurations (agent, action, creates, requires, notes)
- `{{CYCLE_*}}`: Repeatable process definitions
- `{{FLOW_DIAGRAM}}`: Mermaid diagram specification
- `{{WHEN_TO_USE_*}}`: Decision guidance criteria
- `{{HANDOFF_*_*}}`: Inter-agent communication prompts

### Usage

1. Copy the skeleton.yaml template
2. Replace placeholders with specific values for your workflow
3. Customize step sequences and agent assignments
4. Define validation checkpoints and conditional logic
5. Test the workflow with sample inputs

## Getting Started

To create new workflows, define YAML files in this folder that specify the workflow steps, required inputs, agent assignments, template usage, and output specifications as outlined in the workflow schema documentation.
