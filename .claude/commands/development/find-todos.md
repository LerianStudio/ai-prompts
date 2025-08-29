---
allowed-tools: Grep(*), TodoWrite(*), Bash(*)
description: Find and organize TODO comments and unfinished work markers in the codebase
argument-hint: [pattern]
---

# Find Development Tasks

I'll locate all TODO comments and unfinished work markers in your codebase.

I'll use the Grep tool to efficiently search for task markers with context:

- Pattern: "TODO|FIXME|HACK|XXX|NOTE"
- Case insensitive search across all source files
- Show surrounding lines for better understanding

For each marker found, I'll show:

1. **File location** with line number
2. **The full comment** with context
3. **Surrounding code** to understand what needs to be done
4. **Priority assessment** based on the marker type

When I find multiple items, I'll create a todo list to organize them by priority:

- **Critical** (FIXME, HACK, XXX): Issues that could cause problems
- **Important** (TODO): Features or improvements needed
- **Informational** (NOTE): Context that might need attention

I'll also identify:

- TODOs that reference missing implementations
- Placeholder code that needs replacement
- Incomplete error handling
- Stubbed functions awaiting implementation

After scanning, I'll ask: "How would you like to track these?"

- Todos only: I'll maintain the local todo list
- Summary: I'll provide organized report

**Important**: I will NEVER:

- Modify existing working code without permission
- Delete TODO comments that serve as documentation
- Change the meaning or context of existing TODOs

This helps track and prioritize unfinished work systematically.
