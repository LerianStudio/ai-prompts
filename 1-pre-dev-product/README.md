# Pre-Development Planning Chain

This directory contains a comprehensive pre-development workflow that transforms user ideas into detailed, implementable technical specifications through an interactive, feedback-driven process.

## Quick Start

To begin the pre-development process, start with the orchestrator:

```bash
claude 1-pre-development/0-pre-dev-orchestrator.mdc
```

## Workflow Overview

### 📋 Phase 1: Product Requirements Document (PRD)
```bash
claude 1-pre-development/1-create-prd.mdc
```
- **Purpose**: Transform your idea into clear business requirements
- **User Input Required**: Initial idea, answers to clarifying questions, PRD review
- **Output**: `docs/pre-development/prd-[feature-name].md`

### 🔧 Phase 2: Technical Requirements Document (TRD)
```bash
claude 1-pre-development/2-create-trd.mdc
```
- **Purpose**: Convert business requirements into technical specifications
- **User Input Required**: Technical decisions, architecture preferences, TRD review
- **Output**: `docs/pre-development/trd-[feature-name].md`

### 📝 Phase 3: Task Generation
```bash
claude 1-pre-development/3-generate-tasks.mdc
```
- **Purpose**: Break down requirements into atomic, implementable phases
- **User Input Required**: Task prioritization, scope adjustments
- **Output**: `docs/pre-development/tasks/tasks-[feature-name].md`

### ✅ Phase 4: Chain Validation
```bash
claude 1-pre-development/4-validate-chain.mdc
```
- **Purpose**: Ensure consistency across all documents
- **User Input Required**: Review validation report, decision on issues
- **Output**: `docs/pre-development/validation-report-[feature-name].md`

### 🔨 Phase 5: Sub-Task Generation (Optional)
```bash
claude 1-pre-development/5-generate-sub-tasks.mdc
```
- **Purpose**: Create detailed implementation plans
- **User Input Optional**: Review sub-task granularity
- **Output**: `docs/pre-development/tasks/MT-*/` directories

## Key Features

### User Feedback Integration
- **Mandatory checkpoints** at each phase ensure alignment with your vision
- **Iterative refinement** allows you to adjust requirements as needed
- **Clear decision points** let you control the planning depth

### Document Consistency
- Each phase builds upon the previous one
- Requirements are traceable through all documents
- Validation ensures nothing is missed

### Implementation Ready
- Tasks are atomic and deployable
- Sub-tasks provide step-by-step implementation guidance
- All technical decisions are documented

## Best Practices

1. **Start Small**: Begin with a focused feature description
2. **Be Specific**: Provide detailed answers to clarifying questions
3. **Review Carefully**: Each phase's output becomes input for the next
4. **Iterate When Needed**: Use validation results to refine documents
5. **Save Context**: Use Memory MCP to preserve decisions across sessions

## Example Usage

```bash
# Start with an idea
claude 1-pre-development/1-create-prd.mdc
# Input: "I need a user authentication system"
# ... answer questions, review PRD ...

# Define technical approach
claude 1-pre-development/2-create-trd.mdc
# ... make technical decisions, review TRD ...

# Break into tasks
claude 1-pre-development/3-generate-tasks.mdc
# ... adjust task priorities ...

# Validate consistency
claude 1-pre-development/4-validate-chain.mdc
# ... review and address any issues ...

# Optional: Get implementation details
claude 1-pre-development/5-generate-sub-tasks.mdc
```

## Output Structure

```
docs/pre-development/
├── prd-[feature-name].md              # Business requirements
├── trd-[feature-name].md              # Technical specifications
├── validation-report-[feature-name].md # Consistency check
└── tasks/
    ├── tasks-[feature-name].md        # Main development phases
    └── MT-[XX]-[task-name]/           # Detailed sub-tasks
        ├── overview.md
        └── ST-[XX]-[subtask-name].md
```

## Integration with Other Chains

After completing pre-development:
1. Begin implementation following the generated tasks
2. Use the code review chain to validate implementation:
   ```bash
   claude 2-code-review/00-code-review-orchestrator.mdc
   ```

## Need Help?

- Review the orchestrator for detailed workflow guidance
- Each prompt file contains specific instructions and examples
- Use Memory MCP to maintain context across sessions