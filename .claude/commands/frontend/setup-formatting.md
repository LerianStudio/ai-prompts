---
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Setup frontend code formatting with Prettier for JavaScript, TypeScript, and framework files
argument-hint: [--framework=react|vue|angular] [--strict]
---

# /frontend:setup-formatting

<instructions>
Setup comprehensive frontend code formatting with Prettier, specifically configured for JavaScript, TypeScript, React, Vue, and Angular projects.

Follow this systematic approach to setup frontend formatting: **$ARGUMENTS**
</instructions>

<context>
This command establishes consistent frontend code formatting using Prettier with framework-specific configurations, file organization, and modern development workflow integration.
</context>

<process>
1. **Frontend Project Analysis**
   - Detect JavaScript/TypeScript files and JSX/TSX components
   - Identify frontend framework (React, Vue, Angular)
   - Check existing Prettier configuration
   - Review component file structure and naming conventions
   - Assess CSS-in-JS, styled-components, or CSS modules usage

2. **Frontend Formatting Tools Installation**

   **Base JavaScript/TypeScript:**

   ```bash
   # Core Prettier with frontend plugins
   npm install -D prettier
   npm install -D @prettier/plugin-typescript

   # Framework-specific formatting
   npm install -D prettier-plugin-organize-imports
   npm install -D prettier-plugin-tailwindcss  # If using Tailwind
   ```

   **React Projects:**

   ```bash
   npm install -D prettier-plugin-sort-imports
   ```

   **Vue Projects:**

   ```bash
   npm install -D @vue/prettier
   ```

3. **Frontend Prettier Configuration**

   **React/TypeScript (.prettierrc.json):**

   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 100,
     "tabWidth": 2,
     "useTabs": false,
     "jsxSingleQuote": true,
     "bracketSpacing": true,
     "bracketSameLine": false,
     "arrowParens": "avoid",
     "endOfLine": "lf",
     "plugins": [
       "@prettier/plugin-typescript",
       "prettier-plugin-organize-imports"
     ]
   }
   ```

   **Prettier Ignore (.prettierignore):**

   ```
   # Build outputs
   build/
   dist/
   .next/

   # Dependencies
   node_modules/

   # Generated files
   *.min.js
   *.min.css
   ```

4. **VS Code Frontend Integration**

   **Settings (.vscode/settings.json):**

   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.organizeImports": true
     },
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[json]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[css]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[scss]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

5. **Package.json Scripts**

   ```json
   {
     "scripts": {
       "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,scss,md}",
       "format:check": "prettier --check src/**/*.{js,jsx,ts,tsx,json,css,scss,md}",
       "format:staged": "prettier --write $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx|json|css|scss|md)$')"
     }
   }
   ```

6. **Frontend-Specific Formatting Rules**
   - JSX attribute formatting and prop ordering
   - Import statement organization and grouping
   - CSS-in-JS and styled-components formatting
   - Component file structure and naming consistency
   - TypeScript interface and type formatting
   - Hook dependencies and effect formatting

**Integration with Git Hooks:**

```bash
# Install husky for git hooks
npm install -D husky lint-staged

# Add to package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx,json,css,scss,md}": [
    "prettier --write",
    "git add"
  ]
}
```

Remember to establish team formatting standards that enhance component readability and maintain framework best practices.
</process>
