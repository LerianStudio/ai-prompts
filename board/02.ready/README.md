# Ready

**Purpose**: Queue of refined items that are ready to start when capacity is available.

## What Goes Here

- Refined requirements with clear acceptance criteria
- Estimated work items
- Prioritized features and fixes

## Flow Rules

- **Entry**: From `00.inbox/` after refinement
- **Exit**: Pull to `02.active/` when starting work
- **Order**: Maintain priority order (top = highest priority)

## Requirements Before Moving Here

- [ ] Clear description and scope
- [ ] Acceptance criteria defined
- [ ] Dependencies identified
- [ ] Rough estimate provided

## Naming Convention

- Format: `feature-name/` or `issue-number-description/`
- Include priority in folder if needed: `[P1]_critical-fix/`
