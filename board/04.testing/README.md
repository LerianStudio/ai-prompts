# Review

**Purpose**: Items complete and undergoing review, testing, or approval.

## What Goes Here

- Code complete features awaiting review
- Items in QA testing
- Pending stakeholder approval
- Documentation review

## Flow Rules

- **Entry**: From `02.active/` when development complete
- **Exit**: To `04.done/` when approved and deployed
- **Time Limit**: Items here > 3 days need escalation

## Naming Convention

- Format: `[TYPE]_feature-name/`
- Examples:
  - `[PR-123]_homepage-redesign/`
  - `[TESTING]_api-refactor/`
  - `[APPROVED]_bug-fix-456/`

## Review Types

- `[PR-###]` - In code review (include PR number)
- `[TESTING]` - In QA/testing phase
- `[APPROVED]` - Approved, awaiting deployment
- `[CHANGES]` - Changes requested, needs updates

## Review Checklist

- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Stakeholder approved
