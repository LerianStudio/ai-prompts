# Board System

This directory implements a kanban board system for managing work items through their lifecycle.

## Structure

```
board/
├── 00.inbox/       # 📥 New ideas and requests
├── 01.ready/       # ✅ Refined and ready to start
├── 02.active/      # 🚀 Work in progress (WIP limit: 5)
├── 03.review/      # 👀 Code review & testing
└── 04.done/        # ✨ Completed work
```

## Workflow Rules

1. **WIP Limits**: Maximum 5 items in active, 2 per person
2. **Flow Direction**: inbox → ready → active → review → done
3. **Blocked Items**: Keep in active with `[BLOCKED]` prefix
4. **Review Time**: Items in review > 3 days need escalation

## Naming Conventions

- Simple: `feature-name/`
- With status: `[WIP-owner]_feature-name/`
- Blocked: `[BLOCKED]_feature-name/`
- Priority: `[P1]_critical-feature/`

## Todo Manager Agent Integration

Board items now support intelligent task management through the **todo-manager agent**, providing proactive, context-aware workflow orchestration:

### Agent-Based Task Management

```bash
# Direct agent invocation for board item analysis
@todo-manager "Analyze task-392 and create comprehensive implementation todos"

# Intelligent workload optimization across board items
@todo-manager "Review all active board items and suggest task prioritization"

# Cross-board dependency coordination
@todo-manager "Analyze dependencies between user-auth and payment-system board items"
```

### Workflow Integration

The todo-manager agent seamlessly integrates with workflows for automated task management:

```yaml
# Example: Feature implementation workflow
- agent: todo-manager
  task: 'Create implementation todos for board item {{board-item-id}}'
- agent: code-reviewer
  task: 'Generate quality checklist based on implementation plan'
- agent: todo-manager
  task: 'Integrate quality requirements and finalize todo plan'
```

### Agent Capabilities

- **Contextual Analysis**: Understands board item scope, complexity, and requirements
- **Implementation Planning**: Breaks down board items into actionable todos
- **Cross-Board Intelligence**: Manages dependencies and coordinates across board items
- **Quality Integration**: Collaborates with code-reviewer and tech-writer agents
- **Workflow Orchestration**: Enables complex multi-agent task management

### Board Item vs Todo Distinction

- **Board Items**: Strategic features, epics, major deliverables moving through kanban stages
- **Todos**: Tactical implementation tasks generated and managed by todo-manager agent

### File Structure

Board items contain `todos.md` files managed by the todo-manager agent:

```
board/02.active/user-auth-feature/
├── README.md          # Main board item description
├── todos.md          # Implementation todos (managed by todo-manager agent)
└── metadata.json     # Optional structured metadata
```

## Task Metadata

Each task folder can include an optional `metadata.json` file for structured tracking:

```json
{
  "id": "task-392",
  "title": "Update frontend filters for advanced backend filtering",
  "status": "inbox",
  "created": "2024-11-21T10:00:00Z",
  "updated": "2024-11-21T10:00:00Z",
  "owner": null,
  "priority": "normal",
  "estimate": 8
}
```

### Metadata Fields

- **id**: Unique task identifier (matches folder name)
- **title**: Human-readable task title
- **status**: Current stage (inbox/ready/active/review/done)
- **created/updated**: ISO timestamps
- **owner**: Current assignee (null if unassigned)
- **priority**: Priority level (low/normal/high/critical)
- **estimate**: Effort estimate in hours (null if not estimated)

### Benefits

- Enable automated reporting and metrics
- Support task querying and filtering
- Track ownership and timing automatically
- Maintain compatibility with folder-based workflow
