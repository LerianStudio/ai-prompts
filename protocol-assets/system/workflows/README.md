# Workflows

This directory contains workflow definitions for automated processes.

## Available Workflows

Workflows automate multi-step processes using specialized agents:

- **backlog-to-ready**: Transforms backlog items into development-ready tasks
- **implement-subtask**: Guides implementation of specific subtasks
- **playwright-desktop-testing**: Automated UI testing workflows

## Workflow Structure

Each workflow directory contains:

- `workflow.yaml` - Workflow definition and steps
- `diagram.md` - Visual representation of the workflow (optional)
- Supporting documentation

## Using Workflows

Execute workflows using the `/run-workflow` command:

```bash
/run-workflow backlog-to-ready
/run-workflow implement-subtask
```

## Creating New Workflows

1. Create a new directory for your workflow
2. Define the workflow in `workflow.yaml`
3. Document the process in `diagram.md`
4. Test the workflow thoroughly

## Best Practices

- Keep workflows focused on specific outcomes
- Use appropriate specialized agents for each step
- Document prerequisites and dependencies
- Include error handling and validation steps
- Test workflows in isolation before integration
