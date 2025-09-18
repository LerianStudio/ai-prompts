# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

<instructions>
ALL instructions within this document MUST BE FOLLOWED, these are not optional unless explicitly stated.

Core Requirements:

- ASK FOR CLARIFICATION if you are uncertain of any thing within the document
- DO NOT edit more code than you have to
- DO NOT WASTE TOKENS, be succinct and concise
  </instructions>

<context>
This repository uses a collaborative development approach with specialized agents and structured workflows. The codebase follows modern best practices with emphasis on maintainability, performance, and thoughtful implementation.
</context>

## Collaboration Guidelines

<requirements>
- **Challenge and question**: Don't immediately agree or proceed with requests that seem suboptimal, unclear, or potentially problematic
- **Push back constructively**: If a proposed approach has issues, suggest better alternatives with clear reasoning
- **Think critically**: Consider edge cases, performance implications, maintainability, and best practices before implementing
- **Seek clarification**: Ask follow-up questions when requirements are ambiguous or could be interpreted multiple ways
- **Propose improvements**: Suggest better patterns, more robust solutions, or cleaner implementations when appropriate
- **Be a thoughtful collaborator**: Act as a good teammate who helps improve the overall quality and direction of the project
</requirements>

## Restricted Commands & Manual Alternatives

<blocked-commands>
The following commands are blocked by hook configuration and should NOT be attempted:

**File Access Restrictions:**

- `Read(./.env)` - Environment files are restricted
- `Read(./.env.*)` - Environment file variants are restricted
- `Read(./secrets/**)` - Secret directories are restricted
- `Read(./config/credentials.json)` - Credential files are restricted

**System Operations:**

- `Bash(rm -rf:*)` - Destructive removal commands are blocked
- `Bash(sudo:*)` - Privileged operations are blocked
- `Bash(npm run build)` - Build commands are blocked
- NEVER use `rm -rf` or `rm` commands directly - instead provide a summary for the user to manually run these commands on the appropriate files/folders

**Git Operations:**

- `git add`, `git commit`, `git push`, `git pull` - Repository modification commands are blocked
- `git merge`, `git rebase`, `git cherry-pick` - Branch operations are blocked
- `git reset --hard`, `git clean`, `git rm`, `git mv` - Destructive operations are blocked
- `git branch -d`, `git checkout` (branch switching), `git switch` - Branch management is blocked
- `git tag` (creation/deletion), `git clone`, `git init` - Repository setup commands are blocked
- `git stash` (drop/clear/pop/apply), `git config` (modifications) - State changes are blocked

**Allowed Git Commands:**

- `git status`, `git log`, `git diff`, `git show` - Read-only status commands
- `git branch` (list only), `git tag` (list only) - Information display
- `git remote -v`, `git config --list` - Configuration viewing
- `git ls-files`, `git blame`, `git grep` - File exploration

**Manual Alternatives:**
Instead of attempting these commands, provide clear instructions for the user to run manually:

- For environment file access: "Please manually check your .env file for [specific setting]"
- For secret access: "Please manually verify secrets in ./secrets/ directory"
- For destructive operations: "Please manually run: rm -rf [specific path]"
- For privileged operations: "Please manually run with sudo: [specific command]"
- For build operations: "Please manually run: npm run build"
- For git operations: "Please manually run: git [command]" (for any blocked git operations)
  </blocked-commands>

## Best Practices

<formatting>
- Keep agents focused on specific domains
- Use board folders to organize feature development
- Maintain project context in the context base
- Document decisions and learnings for future reference
</formatting>
