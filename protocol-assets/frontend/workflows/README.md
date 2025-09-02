# Frontend Workflows

Frontend development workflows and automation for component development, visual validation, and deployment processes.

## Structure

```
workflows/
├── backlog-to-ready/    # Task preparation and readiness workflows
└── implementation/      # Feature implementation and validation workflows
```

## Components

### Backlog to Ready (`backlog-to-ready/`)

Task preparation workflows for moving items from backlog to ready state:

#### Phase 1: UI-Only Preparation
- `ui-ready.yaml` - Pure UI component preparation without business logic
- User story breakdown focused on visual requirements
- Design approval and UI specification validation

#### Phase 2: UI-Logic Integration Preparation  
- `ui-logic-ready.yaml` - Logic integration preparation for existing UI components
- Integration planning for state management, API connections, event handling
- Specification of logic connection points in completed UI components

**Purpose:**
- Two-phase approach: UI-first, then logic integration
- Ensure tasks are well-defined for each development phase
- Validate design specifications and integration requirements
- Establish clear acceptance criteria for both UI and logic phases

### Implementation (`implementation/`)

Feature implementation workflows following two-phase frontend approach:

#### Phase 1: UI-Only Implementation
- `ui-subtask.yaml` - Pure UI component implementation without business logic
- Visual component development, styling, basic interactions
- Focus on presentation layer only (no state management or API integration)

#### Phase 2: UI-Logic Integration Implementation
- `ui-logic-subtask.yaml` - Logic integration into existing UI components
- State management, API integration, event handling implementation  
- Connect business logic to completed UI without modifying presentation

**Purpose:**
- Clean separation between UI presentation and business logic
- Efficient development workflow with specialized focus areas
- Maintain UI integrity while adding functional capabilities
- Support independent UI and logic development teams

## Two-Phase Frontend Development Approach

### Phase 1: UI-Only Development
- **Focus**: Pure visual presentation without business logic
- **Components**: UI component structure, styling, basic interactions
- **Technologies**: HTML/JSX, CSS/Tailwind, basic event handlers
- **Validation**: Visual testing, accessibility, responsive design
- **Agent**: `frontend-developer` specialized in UI presentation

### Phase 2: UI-Logic Integration  
- **Focus**: Connect business logic to existing UI components
- **Components**: State management, API integration, event handling
- **Technologies**: React Context/Redux/Zustand, API clients, data flow
- **Validation**: Integration testing, data flow validation, performance
- **Agent**: `frontend-developer` specialized in logic integration

### Benefits of Two-Phase Approach
- **Clean Separation**: UI presentation independent of business logic
- **Parallel Development**: UI and backend teams can work simultaneously
- **Easier Testing**: Visual and logic testing can be isolated
- **Maintainability**: Changes to UI or logic don't affect each other
- **Reusability**: UI components can be reused with different logic

## YAML Workflow Definitions

All workflows follow standardized YAML formats including:

- **Trigger Conditions**: User story updates, design changes, code commits
- **Validation Steps**: Visual validation, testing, and quality checks
- **Approval Processes**: Design sign-off and code review requirements
- **Integration Points**: Cross-team coordination and dependency management

## Contributing

When adding frontend workflows:

1. **Visual Validation**: Include screenshot comparison and visual testing
2. **Design Integration**: Coordinate with design approval processes
3. **Quality Gates**: Implement comprehensive testing and validation steps
4. **Cross-Team Coordination**: Consider backend API and shared component dependencies

## Integration Points

Frontend workflows integrate with:

- **Backend Workflows**: API integration and deployment coordination
- **Design System**: Component validation and consistency checking
- **Quality Standards**: Testing protocols and performance requirements
