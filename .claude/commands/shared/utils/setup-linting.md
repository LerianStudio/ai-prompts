---
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Setup code linting and quality tools for consistent code standards
argument-hint: [--project-type=<type>]
---

# /shared:utils:setup-linting

<instructions>
Setup code linting and quality tools for consistent code standards.
</instructions>

<context>
This command establishes code linting and quality tools to maintain consistent code standards across projects.
</context>

<usage_patterns>

```bash
# Setup linting for specific project types
/shared:utils:setup-linting --project-type=typescript    # Setup TypeScript linting
/shared:utils:setup-linting --project-type=javascript    # Setup JavaScript linting
/shared:utils:setup-linting --project-type=react         # Setup React linting
/shared:utils:setup-linting --project-type=python        # Setup Python linting
/shared:utils:setup-linting                              # Auto-detect project type and setup
```

**Arguments:**

- `--project-type`: Specific project type for linting setup (javascript, typescript, react, python, etc.)
  </usage_patterns>

<process>
Follow this systematic approach to setup linting: **$ARGUMENTS**

1. **Project Analysis**
   - Identify programming languages and frameworks
   - Check existing linting configuration
   - Review current code style and patterns
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
