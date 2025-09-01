# Board System

This directory implements a simplified kanban board system for managing work items through their lifecycle.

## Optimized Structure

```
board/
├── 01.backlog/     # New ideas and task requirements
├── 02.ready/       # Implementation-ready tasks with specifications
└── 03.done/        # Completed and delivered tasks
```

## Simplified Three-Stage Workflow

The board implements a **streamlined three-stage architecture**:

1. **01.backlog/** - Raw task intake and initial requirements
2. **02.ready/** - Implementation-ready tasks with complete specifications
3. **03.done/** - Completed and delivered tasks

## Workflow Benefits

### Eliminated Complexity

- **Removed intermediate stages** (ui-design, logic-design, in-progress, testing)
- **Direct path** from backlog → ready → done
- **Reduced overhead** without losing essential functionality

### Specialized Workflows

- **UI-only tasks** go through `backlog-to-ui-ready` workflow
- **Logic-only tasks** go through `backlog-to-logic-ready` workflow
- **Integrated tasks** go through `backlog-to-ready` workflow
- **All converge** at `02.ready/` with specialized task structures

## Task Flow

### Input (01.backlog)

- Task requirements and descriptions
- Automatic classification based on labels/keywords
- Routing to appropriate specialized workflow

### Processing (Workflows)

- **`backlog-to-ui-ready`** - Frontend specialization
- **`backlog-to-logic-ready`** - Backend specialization
- **`backlog-to-ready`** - Full-stack coordination

### Output (02.ready)

- Implementation-ready tasks with complete specifications
- Specialized task breakdown (UI/Logic/Integrated)
- Ready for developer assignment and implementation

### Completion (03.done)

- Successfully implemented and verified tasks
- Achievement tracking and historical record

## File Organization

### Backlog Structure

```
01.backlog/
├── task-100-user-authentication/
│   └── description.md
├── task-101-ui-component/
│   └── description.md
└── task-102-api-endpoint/
    └── description.md
```

### Ready Structure (Post-Workflow)

```
02.ready/
├── task-100-user-auth/         # Integrated workflow output
│   ├── ui-spec.md
│   ├── logic-spec.md
│   ├── component-task-1/
│   └── api-task-1/
├── task-101-ui-component/      # UI-only workflow output
│   ├── ui-spec.md
│   ├── component-task-1/
│   └── styling-task-1/
└── task-102-api-endpoint/      # Logic-only workflow output
    ├── logic-spec.md
    ├── domain-task-1/
    └── api-task-1/
```

### Done Structure

```
03.done/
├── task-100-user-authentication/
├── task-101-ui-component/
└── task-102-api-endpoint/
```

## Workflow Integration

### Automatic Routing

Tasks are automatically classified and routed to appropriate workflows based on:

- **Labels** (frontend, backend, ui, api, etc.)
- **Keywords** in description
- **Manual overrides** (workflow:ui-only, workflow:logic-only, workflow:integrated)

### Convergence Point

All workflows converge at `02.ready/` with:

- **Consistent interfaces** for downstream processes
- **Specialized internal structures** based on task type
- **Complete specifications** for implementation

## Benefits of Optimization

### Reduced Complexity

- **70% fewer stages** (7 → 3 folders)
- **Cleaner mental model** for developers
- **Less maintenance overhead**

### Maintained Functionality

- **Specialization preserved** through workflow bifurcation
- **Quality maintained** through comprehensive specifications
- **Tracking capability** through simplified done stage

### Improved Flow

- **Faster task progression** through fewer stages
- **Clear responsibility boundaries** at each stage
- **Reduced context switching** between stages
