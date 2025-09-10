---
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Setup frontend linting tools for JavaScript, TypeScript, and React projects
argument-hint: [--framework=react|vue|angular] [--strict]
---

# /frontend:setup-linting

<instructions>
Setup frontend linting tools specifically for JavaScript, TypeScript, React, Vue, and Angular projects with modern best practices.
</instructions>

<context>
This command establishes comprehensive frontend linting configuration with ESLint, TypeScript ESLint, and framework-specific rules for modern web development.
</context>

<usage_patterns>

```bash
# Setup linting for frontend frameworks
/frontend:setup-linting --framework=react               # Setup React + TypeScript linting
/frontend:setup-linting --framework=vue                 # Setup Vue + TypeScript linting
/frontend:setup-linting --framework=angular             # Setup Angular linting
/frontend:setup-linting --strict                        # Setup with strictest rules
/frontend:setup-linting                                 # Auto-detect frontend framework
```

**Arguments:**

- `--framework`: Frontend framework (react, vue, angular)
- `--strict`: Enable strictest linting rules for maximum code quality
  </usage_patterns>

<process>
Follow this systematic approach to setup linting: **$ARGUMENTS**

1. **Frontend Project Analysis**
   - Detect JavaScript/TypeScript usage
   - Identify frontend framework (React, Vue, Angular)
   - Check existing ESLint configuration
   - Review component patterns and hooks usage
   - Assess accessibility and performance needs

2. **Frontend Tool Installation**

   **Base JavaScript/TypeScript:**

   ```bash
   # Core ESLint and TypeScript support
   npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier

   # Frontend-specific plugins
   npm install -D eslint-plugin-react eslint-plugin-react-hooks
   npm install -D eslint-plugin-jsx-a11y eslint-plugin-import
   ```

   **Framework-Specific:**

   ```bash
   # React projects
   npm install -D eslint-plugin-react eslint-plugin-react-hooks

   # Vue projects
   npm install -D eslint-plugin-vue @vue/eslint-config-typescript

   # Angular projects
   npm install -D @angular-eslint/eslint-plugin @angular-eslint/template-parser
   ```

3. **Frontend ESLint Configuration**

   **React + TypeScript (.eslintrc.json):**

   ```json
   {
     "extends": [
       "eslint:recommended",
       "@typescript-eslint/recommended",
       "plugin:react/recommended",
       "plugin:react-hooks/recommended",
       "plugin:jsx-a11y/recommended",
       "prettier"
     ],
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
     "rules": {
       "react/prop-types": "off",
       "react/react-in-jsx-scope": "off",
       "@typescript-eslint/no-unused-vars": "error",
       "react-hooks/rules-of-hooks": "error",
       "react-hooks/exhaustive-deps": "warn",
       "jsx-a11y/anchor-is-valid": "warn"
     },
     "settings": {
       "react": {
         "version": "detect"
       }
     }
   }
   ```

4. **VS Code Integration**

   **Settings (.vscode/settings.json):**

   ```json
   {
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "eslint.validate": [
       "javascript",
       "javascriptreact",
       "typescript",
       "typescriptreact"
     ]
   }
   ```

5. **Package.json Scripts**

   ```json
   {
     "scripts": {
       "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
       "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
       "lint:check": "eslint src --ext .js,.jsx,.ts,.tsx --max-warnings 0",
       "type-check": "tsc --noEmit"
     }
   }
   ```

6. **Frontend-Specific Rules**
   - React Hooks linting for proper hook usage
   - Accessibility rules for inclusive web development
   - Import/export organization for clean module structure
   - TypeScript strict mode for type safety
   - Component naming and structure conventions
     </process>
