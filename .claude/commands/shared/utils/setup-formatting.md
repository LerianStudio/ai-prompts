---
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Setup code formatting tools and configuration for consistent code style
argument-hint: [--project-type=<type>]
---

# /shared:utils:setup-formatting

<instructions>
Setup code formatting tools and configuration for consistent code style.

Follow this systematic approach to setup code formatting: **$ARGUMENTS**
</instructions>

<context>
This command helps establish consistent code formatting across projects by installing and configuring appropriate formatting tools based on the project's programming languages and frameworks.
</context>

<process>
1. **Project Analysis**
   - Identify programming languages and frameworks
   - Check existing formatting configuration
   - Review current code style and patterns
   - Assess team preferences and requirements

2. **Tool Selection by Language**

   **JavaScript/TypeScript:**

   ```bash
   npm install -D prettier
   npm install -D @prettier/plugin-typescript
   ```

3. **Configuration Setup**

   **Prettier (.prettierrc.json):**

   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false
   }
   ```

4. **IDE Integration**
   - Configure VS Code settings
   - Setup format on save
   - Install relevant extensions

5. **CI/CD Integration**

   ```yaml
   - name: Check formatting
     run: npm run format:check
   ```

6. **Package.json Scripts**
   ```json
   {
     "scripts": {
       "format": "prettier --write .",
       "format:check": "prettier --check ."
     }
   }
   ```

Remember to establish team formatting standards before enforcement.
</process>
