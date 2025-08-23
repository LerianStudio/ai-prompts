---
allowed-tools: Bash(*), Read(*), Grep(*)
description: Generate conventional commit messages based on git changes that can be copy-pasted
argument-hint: [scope] (optional scope for the commit, e.g., api, ui, docs)
---

# Commit Generator

Analyzes current git changes and generates conventional commit messages following the Conventional Commits 1.0.0 specification that you can copy and paste.

## Usage

This command examines your git staging area and working directory to suggest properly formatted conventional commit messages based on the changes detected.

```bash
/commit-generator
/commit-generator api
/commit-generator ui
```

## Process

1. **Git Status Analysis**
   - Runs `git status --porcelain` to identify changed files
   - Runs `git diff --cached` to analyze staged changes
   - Runs `git diff` to analyze unstaged changes

2. **Change Classification**
   - Analyzes file patterns and change types
   - Determines appropriate commit type (feat, fix, docs, style, etc.)
   - Identifies potential breaking changes

3. **Message Generation**
   - Creates conventional commit message following the format:

     ```
     <type>[optional scope]: <description>

     [optional body]

     [optional footer(s)]
     ```

   - Provides multiple suggestions when appropriate
   - Includes guidance on breaking changes

## Supported Commit Types

Based on the Conventional Commits specification and Angular convention:

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that do not affect the meaning of the code
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **perf:** A code change that improves performance
- **test:** Adding missing tests or correcting existing tests
- **build:** Changes that affect the build system or external dependencies
- **ci:** Changes to CI configuration files and scripts
- **chore:** Other changes that don't modify src or test files
- **revert:** Reverts a previous commit

## Examples

### Basic Feature Addition

```bash
/commit-generator
```

**Output:**

```
feat: add user authentication system

- Implement JWT token validation
- Add login/logout endpoints
- Create user session management
```

### With Scope

```bash
/commit-generator api
```

**Output:**

```
feat(api): add user authentication endpoints

- Implement /auth/login endpoint
- Add /auth/logout endpoint
- Include JWT token validation middleware
```

### Breaking Change

```
feat!: change user API response format

BREAKING CHANGE: user endpoint now returns user object instead of user array
```

## Notes

- If no changes are detected, the command will prompt you to stage changes first
- Multiple commit suggestions may be provided for complex changesets
- Breaking changes are automatically detected and flagged
- The command respects conventional commit standards for consistent git history
