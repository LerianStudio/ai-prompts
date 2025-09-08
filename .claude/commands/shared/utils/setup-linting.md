---
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Setup code linting and quality tools for consistent code standards
argument-hint: [--project-type=<type>] [--git-scope=<scope>]
---

# /shared:utils:setup-linting

<instructions>
Setup code linting and quality tools for consistent code standards.
</instructions>

<context>
This command establishes code linting and quality tools to maintain consistent code standards across projects, with optional git-scoped validation for targeted configuration testing.
</context>

<usage_patterns>

```bash
# Git-focused linting setup (recommended for validating configuration)
/shared:utils:setup-linting --git-scope=all-changes --project-type=typescript  # Setup linting and validate on changed files
/shared:utils:setup-linting --git-scope=staged --project-type=javascript      # Setup linting and test on staged files
/shared:utils:setup-linting --git-scope=branch --project-type=react           # Setup linting and validate branch changes

# Traditional project-wide setup
/shared:utils:setup-linting --project-type=typescript                         # Setup TypeScript linting
/shared:utils:setup-linting --project-type=javascript                         # Setup JavaScript linting
/shared:utils:setup-linting --project-type=react                              # Setup React linting
/shared:utils:setup-linting                                                   # Auto-detect project type and setup
```

**Arguments:**

- `--project-type`: Specific project type for linting setup (javascript, typescript, react, python, etc.)
- `--git-scope`: Git scope for validating linting configuration - staged|unstaged|all-changes|branch|last-commit|commit-range=<range>
  </usage_patterns>

<setup>
### Git Scope Analysis (when --git-scope used)

If `--git-scope` is specified:

```bash
# Source git utilities
if ! source .claude/utils/git-utilities.sh; then
    echo "Error: Could not load git utilities. Please ensure git-utilities.sh exists." >&2
    exit 1
fi

# Get target files from git scope (allow empty for setup-linting)
target_files=$(get_git_files "$git_scope" 2>/dev/null || echo "")
if [[ -z "$target_files" ]]; then
    echo "No files found in git scope: $git_scope"
    echo "Proceeding with full linting setup, but will test on changed files when available."
else
    # Show git statistics if files exist
    get_git_stats "$git_scope"

    echo "Will validate linting configuration on files: $(echo "$target_files" | wc -l)"
    echo "$target_files" | head -10
    if [[ $(echo "$target_files" | wc -l) -gt 10 ]]; then
        echo "... and $(echo "$target_files" | wc -l | awk '{print $1-10}') more files"
    fi
    echo ""
fi
```

**Git-Scope Linting Setup Benefits:**

- **Configuration Validation**: Test linting rules on actual changed code
- **Targeted Setup**: Configure linting based on files you're actively working with
- **Immediate Feedback**: Validate linting configuration against current changes
- **Workflow Integration**: Ensure linting works with your current development workflow
  </setup>

<process>
Follow this systematic approach to setup linting: **$ARGUMENTS**

1. **Project Analysis**
   - Identify programming languages and frameworks
   - Check existing linting configuration
   - Review current code style and patterns (focus on git-scoped files if specified)
   - Assess team preferences and requirements

2. **Tool Selection by Language**

   **JavaScript/TypeScript:**

   ```bash
   npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier
   ```

3. **Configuration Setup**

   **ESLint (.eslintrc.json):**

   ```json
   {
     "extends": [
       "eslint:recommended",
       "@typescript-eslint/recommended",
       "prettier"
     ],
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint"],
     "rules": {
       "no-console": "warn",
       "no-unused-vars": "error",
       "@typescript-eslint/no-explicit-any": "warn"
     }
   }
   ```

4. **IDE Integration**
   - Configure VS Code settings
   - Setup auto-fix on save
   - Install relevant extensions

5. **CI/CD Integration**

   ```yaml
   - name: Lint code
     run: npm run lint
   ```

6. **Package.json Scripts**
   ```json
   {
     "scripts": {
       "lint": "eslint src --ext .ts,.tsx",
       "lint:fix": "eslint src --ext .ts,.tsx --fix",
       "format": "prettier --write src"
     }
   }
   ```

Remember to customize rules based on team preferences and gradually enforce stricter standards.
</process>
