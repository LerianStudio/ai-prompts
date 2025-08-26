# Active (WIP Limit: 5)

**Purpose**: Work currently in progress. Limited to maintain focus and flow.

## What Goes Here

- Items actively being worked on
- Maximum 5 items total (team WIP limit)
- Maximum 2 items per person

## Flow Rules

- **Entry**: Pull from `01.ready/` when capacity available
- **Exit**: Move to `03.review/` when development complete
- **Blocked**: Keep here but prefix with `[BLOCKED]_`

## Naming Convention

- Format: `[STATUS]_feature-name/` or `[OWNER]_feature-name/`
- Examples:
  - `[WIP-john]_user-authentication/`
  - `[BLOCKED]_payment-integration/`
  - `[STARTING]_dark-mode/`

## Daily Questions

1. Is this truly being worked on today?
2. Are we at or below WIP limit?
3. Anything blocked? → Add `[BLOCKED]` prefix
4. Anything ready for review? → Move to `03.review/`

## Status Prefixes

- `[WIP-name]` - Actively working (include owner)
- `[BLOCKED]` - Blocked by dependency
- `[STARTING]` - Just pulled, setup phase
- `[PAUSED]` - Temporarily on hold
