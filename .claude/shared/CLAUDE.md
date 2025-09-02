# CLAUDE.md - Shared Configuration

This file provides core guidance to Claude Code applicable to all development profiles.

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

## General Development Guidelines

### Coding Conventions

Follow the coding standards outlined in `protocol-assets/content/docs/console/coding-conventions.md`:

- File naming conventions (kebab-case for components, resource naming for API clients)
- TypeScript conventions with descriptive interfaces and types
- Variable and function naming patterns
- Import/export organization and component structure
- Testing and documentation conventions

## Best Practices

<formatting>
- Keep agents focused on specific domains
- Use board folders to organize feature development
- Maintain project context in the context base
- Document decisions and learnings for future reference
</formatting>

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.