# Workflows

Clean and organized workflow definitions for automated task processing.

## Structure

```
workflows/
├── backlog-processing/          # Task preparation workflows
│   ├── ui-ready.yaml           # UI-only task processing
│   ├── logic-ready.yaml        # Logic-only task processing
│   └── integrated-ready.yaml   # Full-stack task processing
├── implementation/             # Task execution workflows
│   ├── ui-subtask.yaml         # Frontend implementation
│   └── logic-subtask.yaml      # Backend implementation
├── task-classifier.yaml       # Automatic workflow routing
└── README.md                   # This documentation
```

## Workflow Categories

### Backlog Processing

Transform raw backlog items into implementation-ready tasks:

- **`ui-ready`** - Pure frontend tasks (components, styling, interactions)
- **`logic-ready`** - Pure backend tasks (APIs, business logic, data)
- **`integrated-ready`** - Full-stack features requiring UI and logic coordination

### Implementation

Execute implementation-ready tasks:

- **`ui-subtask`** - Frontend development with visual validation
- **`logic-subtask`** - Backend development with integration testing

### Classification

- **`task-classifier.yaml`** - Intelligent routing based on labels, keywords, and patterns

## Usage

### Automatic Classification

```bash
# Tasks are automatically routed based on content analysis
/run-workflow ui-ready          # For UI-focused tasks
/run-workflow logic-ready       # For backend-focused tasks
/run-workflow integrated-ready  # For full-stack features
```

### Manual Override

Add labels to force specific routing:

- `workflow:ui-only` → `ui-ready`
- `workflow:logic-only` → `logic-ready`
- `workflow:integrated` → `integrated-ready`

### Implementation

```bash
# Execute ready tasks
/run-workflow ui-subtask        # Frontend implementation
/run-workflow logic-subtask     # Backend implementation
```

## Task Flow

```
01.backlog → [Classification] → Specialized Workflow → 02.ready → Implementation → 03.done
     ↓              ↓                    ↓                ↓            ↓           ↓
   Raw Tasks    Auto-Route         Process & Spec      Ready Tasks   Execute   Complete
```

## Benefits of Organization

### Clarity

- **Grouped by purpose** (processing vs implementation)
- **Clear naming** without redundant prefixes
- **Consistent structure** across all workflows

### Maintainability

- **Fewer files** in root directory
- **Logical grouping** makes navigation easier
- **Single source** of truth for documentation

### Scalability

- **Easy to add** new workflows in appropriate categories
- **Clear patterns** for workflow organization
- **Extensible structure** for future needs

## Classification Rules

Tasks are automatically classified using:

### UI-Pure Triggers

- **Labels**: `frontend`, `ui`, `component`, `design-system`, `styling`
- **Keywords**: "component styling", "responsive design", "animation"
- **Patterns**: "Update component", "Create button", "Fix responsive"

### Logic-Pure Triggers

- **Labels**: `backend`, `api`, `database`, `business-logic`
- **Keywords**: "business rule", "API endpoint", "data validation"
- **Patterns**: "Create API", "Update business rule", "Add integration"

### Integrated Triggers

- **Labels**: `feature`, `full-stack`, `end-to-end`
- **Keywords**: "new feature", "complete implementation"
- **Patterns**: "Implement feature", "Build workflow", "Create functionality"

## Best Practices

### Workflow Development

1. **Focused Purpose** - Each workflow should have a single, clear responsibility
2. **Consistent Structure** - Follow established patterns for steps and agents
3. **Clear Documentation** - Include comprehensive handoff prompts and descriptions

### Organization

1. **Appropriate Grouping** - Place workflows in correct category folders
2. **Descriptive Naming** - Use clear, concise workflow IDs
3. **Minimal Hierarchy** - Keep structure flat and navigable
