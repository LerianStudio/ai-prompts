---
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*), Grep(*)
description: Migrate JavaScript project to TypeScript with proper typing and tooling setup
argument-hint: [migration-strategy] | --gradual | --complete | --strict | --incremental
model: sonnet
---

# /frontend:migrate-to-typescript

<instructions>
Migrate JavaScript project to TypeScript with comprehensive type safety and proper tooling setup.

<purpose>
- Convert JavaScript files to TypeScript with proper type annotations
- Configure TypeScript compiler and build tooling integration
- Establish type safety standards and development workflow
- Maintain existing functionality while adding type benefits
</purpose>

<scope>
Covers complete JavaScript to TypeScript migration including environment setup, file conversion, type definitions, error resolution, and testing validation.
</scope>
</instructions>

<context>
This command provides systematic migration from JavaScript to TypeScript, focusing on type safety, developer experience, and build system integration while preserving all existing functionality.
</context>

<process>
<migration_analysis>
  <current_state>
    <action>Analyze existing JavaScript codebase and dependencies</action>
    <elements>
      - Project structure: @package.json (analyze JS/TS mix and dependencies)
      - JavaScript files: !`find . -name "*.js" -not -path "./node_modules/*" | wc -l`
      - Existing TypeScript: !`find . -name "*.ts" -not -path "./node_modules/*" | wc -l`
      - Build system: @webpack.config.js or @vite.config.js or @rollup.config.js
    </elements>
  </current_state>
  
  <migration_strategy>
    <action>Determine migration approach based on arguments</action>
    <strategies>
      - **--gradual**: Incremental conversion with allowJs enabled
      - **--complete**: Full conversion of all JavaScript files
      - **--strict**: Enable strict TypeScript compiler options
      - **--incremental**: File-by-file conversion with validation
    </strategies>
  </migration_strategy>
  
  <environment_setup>
    <action>Configure TypeScript environment and tooling</action>
    <tasks>
      - Install TypeScript and @types packages
      - Create tsconfig.json with appropriate compiler options
      - Configure build tools (webpack/vite/rollup) for TypeScript
      - Set up IDE integration and debugging support
    </tasks>
  </environment_setup>
  
  <file_conversion>
    <action>Convert JavaScript files to TypeScript systematically</action>
    <process>
      - Rename .js to .ts/.tsx files
      - Add type annotations for functions and variables
      - Define interfaces and type definitions
      - Resolve compiler errors and type mismatches
    </process>
  </file_conversion>
  
  <validation_testing>
    <action>Validate migration and update test suites</action>
    <verification>
      - Run TypeScript compiler with strict checks
      - Update test files to TypeScript
      - Validate type coverage and safety
      - Ensure build processes work correctly
    </verification>
  </validation_testing>
</process>

<migration_phases>
<phase_1_setup>
<environment_preparation>

- Install TypeScript dependencies and tooling
- Create initial tsconfig.json configuration
- Configure build system integration
- Set up development environment
  </environment_preparation>
  </phase_1_setup>

<phase_2_conversion>
<file_transformation>

- Convert JavaScript files to TypeScript
- Add type annotations and interfaces
- Resolve immediate compiler errors
- Maintain existing functionality
  </file_transformation>
  </phase_2_conversion>

<phase_3_enhancement>
<type_safety>

- Implement advanced TypeScript features
- Add generic types and utility types
- Configure strict compiler settings
- Enhance IDE integration
  </type_safety>
  </phase_3_enhancement>

<phase_4_validation>
<quality_assurance>

- Run comprehensive test suites
- Validate type coverage metrics
- Performance testing and optimization
- Documentation updates
  </quality_assurance>
  </phase_4_validation>
  </migration_phases>

<deliverables>
- Fully typed TypeScript codebase with strict type checking
- Comprehensive tsconfig.json with optimal compiler settings
- Updated build system configuration for TypeScript
- Type definitions and interfaces for all business logic
- Enhanced IDE integration with IntelliSense support
- Updated test suites compatible with TypeScript
- Migration documentation and developer guidelines
</deliverables>

<best_practices>
<type_safety>

- Use strict compiler options from the beginning
- Prefer interfaces over type aliases for objects
- Implement proper null/undefined handling
- Use generic types for reusable components
  </type_safety>

<code_organization>

- Organize types in dedicated declaration files
- Use barrel exports for clean module structure
- Implement consistent naming conventions
- Group related types and interfaces
  </code_organization>

<performance>
- Configure incremental compilation
- Use proper module resolution strategies
- Optimize build tool integration
- Implement code splitting for large applications
</performance>
</best_practices>
