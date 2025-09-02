---
allowed-tools: Write(*)
description: Create VSCode workspace configuration with recommended settings for JavaScript/TypeScript development
argument-hint: []
---

# Setup Code Workspace

Create a `.code-workspace` file with optimal VSCode settings for JavaScript/TypeScript development including Prettier, ESLint, and Git configuration.

## Features

- **Prettier Integration**: Automatic formatting on save for JS/TS files
- **ESLint Configuration**: Auto-fix and validation for code quality
- **Git Integration**: Automatic repository detection
- **Extension Recommendations**: Suggests essential development extensions
- **Language Support**: Optimized for JavaScript, TypeScript, and React

## Usage

```bash
/setup-code-workspace
```

Creates a standardized `.code-workspace` file in the current directory with optimal development settings.

## Implementation

The command creates a comprehensive VSCode workspace configuration that includes:

1. **Folder Structure**: Configures the current directory as the workspace root
2. **Editor Settings**: Sets up Prettier as the default formatter with format-on-save enabled
3. **ESLint Integration**: Configures automatic linting and error fixing
4. **Language-Specific Settings**: Optimizes behavior for JavaScript, TypeScript, and React files
5. **Extension Recommendations**: Suggests essential extensions for the development workflow

This configuration ensures a consistent development environment across team members and projects.
