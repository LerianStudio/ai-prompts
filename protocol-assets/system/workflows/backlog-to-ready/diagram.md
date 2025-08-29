# Backlog to Ready Workflow - Flow Diagram

## Overview
This diagram illustrates the design-first workflow that transforms raw backlog items into development-ready sub-tasks through a series of specialized agents.

## ASCII Flow Diagram

```
INPUT: 01.backlog/*/description.md
         |
         v
┌────────────────────────────────────┐
│    STEP 1: Story Generation        │
│    Agent: user-story-generator     │
│    Uses: backlog-task-analyzer     │
└─────────────┬──────────────────────┘
              │
              v
         user-stories
              │
              v
┌────────────────────────────────────┐
│    STEP 2: UI Design               │
│    Agent: ui-ux-specialist         │
│    Creates: ui-spec.md             │
└─────────────┬──────────────────────┘
              │
              v
    01.backlog/[task-number]/ui-spec.md
              │
              v
┌────────────────────────────────────┐
│    STEP 3: Task Breakdown          │
│    Agent: task-breakdown-specialist│
│    Moves to: 02.ready/             │
└─────────────┬──────────────────────┘
              │
              v
    02.ready/task-N/ structure
    ├── description.md (original)
    ├── ui-spec.md (moved)
    ├── sub-task-1/description.md
    ├── sub-task-2/description.md
    └── sub-task-N/description.md
              │
              v
┌────────────────────────────────────┐
│    STEP 4: Todo Generation         │
│    Agent: todo-manager             │
│    Creates: todos.md in sub-tasks  │
└─────────────┬──────────────────────┘
              │
              v
OUTPUT: Development-ready tasks in 02.ready/
```

## Mermaid Flow Diagram

```mermaid
graph TD
    A[01.backlog/*/description.md] --> B[Story Generation]
    B --> |user-story-generator| C[user-stories]
    
    C --> D[UI Design]
    D --> |ui-ux-specialist| E[01.backlog/task-N/ui-spec.md]
    
    E --> F[Task Breakdown]
    C --> F
    F --> |task-breakdown-specialist| G[Move to 02.ready/]
    
    G --> H[02.ready/task-N/<br/>├── description.md<br/>├── ui-spec.md<br/>├── sub-task-1/<br/>├── sub-task-2/<br/>└── sub-task-N/]
    
    H --> I[Todo Generation]
    I --> |todo-manager| J[todos.md in each sub-task]
    
    J --> K[Development-ready tasks]
    
    style B fill:#e1f5fe
    style D fill:#f3e5f5
    style F fill:#fff3e0
    style I fill:#e8f5e8
    style K fill:#ffebee
```

## Agent Interaction Sequence

```mermaid
sequenceDiagram
    participant BT as Backlog Tasks
    participant USG as user-story-generator
    participant UXS as ui-ux-specialist
    participant TBS as task-breakdown-specialist
    participant TM as todo-manager
    participant RT as Ready Tasks
    
    BT->>USG: 01.backlog/*/description.md
    USG->>USG: Analyze with backlog-task-analyzer
    USG->>UXS: user-stories generated
    
    UXS->>UXS: Create UI specifications
    UXS->>TBS: ui-spec.md created in 01.backlog/
    
    Note over TBS: Receives both user-stories and ui-spec.md
    TBS->>TBS: Break down into sub-tasks
    TBS->>TBS: Move folder: 01.backlog → 02.ready
    TBS->>TM: Sub-task structure created
    
    TM->>TM: Generate implementation todos
    TM->>RT: todos.md files in sub-tasks
    
    Note over RT: Development-ready tasks<br/>in 02.ready/ folder
```

## Data Flow

```mermaid
flowchart LR
    subgraph Input ["📥 INPUT"]
        BL[01.backlog/*/description.md]
    end
    
    subgraph Processing ["⚙️ PROCESSING"]
        US[user-stories]
        UI[ui-spec.md]
        ST[sub-task structure]
        TD[todos.md]
    end
    
    subgraph Output ["📤 OUTPUT"]
        RD[02.ready/task-N/<br/>Complete development package]
    end
    
    BL --> US
    US --> UI
    US --> ST
    UI --> ST
    ST --> TD
    TD --> RD
    
    style Input fill:#e3f2fd
    style Processing fill:#fff8e1
    style Output fill:#e8f5e8
```

## Folder Structure Transformation

**Before (01.backlog/):**
```
01.backlog/
├── task-392/
│   └── description.md
├── task-393/
│   └── description.md
└── task-394/
    └── description.md
```

**After UI Design:**
```
01.backlog/
├── task-392/
│   ├── description.md
│   └── ui-spec.md ← Created
├── task-393/
│   ├── description.md
│   └── ui-spec.md ← Created
└── task-394/
    ├── description.md
    └── ui-spec.md ← Created
```

**Final Structure (02.ready/):**
```
02.ready/
├── task-392/
│   ├── description.md     ← Moved from 01.backlog
│   ├── ui-spec.md         ← Moved from 01.backlog
│   ├── sub-task-1/
│   │   ├── description.md ← Created
│   │   └── todos.md       ← Created
│   ├── sub-task-2/
│   │   ├── description.md ← Created
│   │   └── todos.md       ← Created
│   └── sub-task-N/
│       ├── description.md ← Created
│       └── todos.md       ← Created
└── [similar structure for other tasks]
```

## Key Features

- **Design-First Approach**: UI specifications created before technical breakdown
- **Agent Specialization**: Four specialized agents handle distinct phases
- **Structured Handoffs**: Clear communication between agents with context
- **Folder Migration**: Tasks move from backlog to ready state
- **Implementation Ready**: Final output includes detailed todos for developers

## Workflow Benefits

1. **User-Centered**: Stories follow INVEST principles
2. **Design-Driven**: UI specs guide technical implementation
3. **Developer-Ready**: Detailed sub-tasks with actionable todos
4. **Organized**: Clear folder structure and file organization
5. **Traceable**: Complete audit trail from backlog to ready state
</file>
