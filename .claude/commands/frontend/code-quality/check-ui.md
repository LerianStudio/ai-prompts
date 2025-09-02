---
allowed-tools: Task(*), Bash(*), Read(*), Write(*)
description: Comprehensive UI validation with visual feedback and quality assurance using Playwright
argument-hint: [--component-name=<name>] [--viewport=<size>] [--focus=<area>] [--compare] [--report]
---

# /check-ui

Comprehensive UI validation command that leverages Playwright MCP to provide visual feedback and quality assurance for UI components. This command orchestrates the complete validation workflow using specialized subagents.

<context>
## Background Information

This command provides comprehensive UI validation by orchestrating Playwright testing workflows for visual feedback and quality assurance of React components. It integrates with design system standards, accessibility requirements, and performance metrics to ensure component quality.

## Usage Patterns

```bash
/check-ui [--component-name=<name>] [options]
```

### Parameters

- `--component-name`: Name of the component to validate (optional, defaults to current focus)
- `--viewport`: Specific viewport to test (mobile, tablet, desktop, all) - default: all
- `--focus`: Specific aspect to focus on (design, accessibility, performance, responsive) - default: all
- `--compare`: Compare against previous version (requires baseline)
- `--report`: Generate detailed report (default: summary only)
  </context>

<instructions>
## Validation Process

### Step 1: Environment Setup

1. Initialize subagent coordination for UI validation workflow
2. Load design system standards from `protocol-assets/design-guides/`
3. Parse validation rules from `protocol-assets/validation-rules/`
4. Identify component location and test scenarios

### Step 2: Component Analysis

1. Launch development server or Storybook using Task(ui-validator)
2. Navigate to component under test via Playwright MCP
3. Identify available component states and variants
4. Load relevant test scenarios from `protocol-assets/test-scenarios/`

### Step 3: Comprehensive Validation via UI Validator Subagent

1. **Multi-Viewport Testing**
   - Mobile viewport (375x667) screenshot capture
   - Tablet viewport (768x1024) screenshot capture
   - Desktop viewport (1920x1080) screenshot capture
   - Save screenshots to `protocol-assets/screenshots/[component]-[viewport].png`

2. **Design System Validation**
   - Color palette compliance check against design guides
   - Typography standards verification
   - Component spacing and layout validation
   - Interactive state testing (hover, focus, disabled)

3. **Accessibility Testing**
   - Automated accessibility audit using axe-core integration
   - Keyboard navigation testing with screenshot capture
   - Color contrast validation against WCAG2AA standards
   - ARIA label and semantic structure validation

4. **Performance Monitoring**
   - Render time measurement and analysis
   - Memory usage tracking during component lifecycle
   - Layout shift detection and scoring
   - Bundle impact assessment

### Step 4: Integrated Quality Assessment

1. Compare validation results against established rules
2. Identify violations and improvement opportunities
3. Generate prioritized issue list with severity ratings
4. Create actionable recommendations with code examples

### Step 5: Comprehensive Report Generation

1. **Summary Mode (Default)**
   - Pass/Fail status for each validation category
   - Issue count and severity breakdown
   - Screenshot location references
   - Priority action items list

2. **Detailed Report Mode**
   - Complete validation metrics and scoring
   - Visual diff comparisons (if --compare used)
   - Specific recommendations with implementation guidance
   - Code examples for addressing identified issues
   - Links to relevant design system documentation

### Step 6: Integration Actions

1. Save all screenshots to `protocol-assets/screenshots/` with organized structure
2. Update validation baseline if all tests pass successfully
3. Create GitHub issue for failed validations (when configured)
4. Update component documentation with current validation results
   </instructions>

<examples>
## Usage Examples

### Basic Validation

```bash
# Validate current component across all viewports
/check-ui

# Validate specific component with full testing suite
/check-ui --component-name=Button

# Focus validation on accessibility compliance only
/check-ui --component-name=Button --focus=accessibility

# Test component responsiveness on mobile viewport only
/check-ui --component-name=DataTable --viewport=mobile
```

### Advanced Validation

```bash
# Generate comprehensive validation report
/check-ui --component-name=Card --report

# Compare current version against previous baseline
/check-ui --component-name=Modal --compare

# Update validation baseline after component changes
/check-ui --component-name=Button --update-baseline
```

### Batch Testing

```bash
# Test multiple components simultaneously
/check-ui --component-name=Button,Card,Modal --focus=accessibility

# Test all components in specific directory
/check-ui --component-name=src/components/ui/* --viewport=mobile

# Run validation with custom test scenarios
/check-ui --component-name=Form --scenario=protocol-assets/test-scenarios/form-validation.md
```

</examples>

<requirements>
## Technical Requirements

### Subagent Integration

- **UI Validator**: Comprehensive subagent for complete validation workflow including Playwright automation, design system compliance, accessibility testing, performance monitoring, and integrated report generation

### Directory Structure Requirements

```
protocol-assets/
├── design-guides/           # Design system standards and guidelines
├── validation-rules/        # Quality gates and compliance rules
├── test-scenarios/          # Component test scenario definitions
└── screenshots/            # Generated validation screenshots
    └── [component-name]/   # Component-specific screenshot organization
        ├── mobile-375x667.png
        ├── tablet-768x1024.png
        ├── desktop-1920x1080.png
        ├── focus-states.png
        ├── hover-states.png
        └── validation-report.json
```

### Tool Dependencies

- Playwright MCP server for browser automation
- axe-core integration for accessibility testing
- Design system asset access for standards validation
- Performance measurement APIs for metrics collection

## Error Handling Protocols

### Component Discovery Issues

1. Search component in Storybook registry if direct path fails
2. Check component export paths and naming conventions
3. Suggest similar component names based on fuzzy matching
4. Provide manual component path specification option

### Browser Automation Failures

1. Verify Playwright MCP server connection and status
2. Check browser dependencies and installation requirements
3. Implement graceful fallback to headless mode operation
4. Provide alternative validation methods when automation fails

### Validation Test Failures

1. Install missing dependencies (axe-core) automatically when possible
2. Provide manual testing fallback procedures and guidelines
3. Generate partial validation results for available test categories
4. Log detailed error information for debugging and resolution
   </requirements>

<formatting>
## Report Output Formats

### Console Output Format

- Immediate visual feedback with colored status indicators
- Icon-based pass/fail representation for quick scanning
- Prioritized issue list with actionable next steps
- Screenshot location references for visual review

### Machine-Readable Formats

1. **JSON Report**: Structured data for CI/CD pipeline integration
2. **XML Report**: Standards-compliant format for enterprise tools
3. **JUnit XML**: Test framework integration compatibility
4. **SARIF**: Security and quality analysis standard format

### Human-Readable Formats

1. **HTML Report**: Interactive report with embedded screenshots and navigation
2. **Markdown Report**: Documentation-friendly format with proper linking
3. **PDF Report**: Presentation-ready format for stakeholder review
4. **CSV Export**: Spreadsheet-compatible format for tracking and analysis

## CI/CD Integration Patterns

### GitHub Actions Integration

```yaml
- name: UI Component Validation
  run: |
    claude /check-ui --report --format=json > ui-validation-results.json

- name: Post Validation Results to PR
  uses: github/pr-comment@v1
  with:
    body-path: ui-validation-results.json
```

### Quality Gate Configuration

```bash
# Fail CI pipeline if critical accessibility issues found
/check-ui --fail-on=critical --focus=accessibility

# Generate validation baseline for new components
/check-ui --create-baseline --component-name=NewButton

# Update component documentation with validation status
/check-ui --update-docs --format=markdown
```

## Advanced Configuration

### Custom Validation Rules

```bash
# Use enterprise-specific validation standards
/check-ui --component-name=Table --rules=protocol-assets/validation-rules/enterprise-standards.md

# Apply custom accessibility requirements beyond WCAG
/check-ui --component-name=Form --accessibility-rules=protocol-assets/validation-rules/enhanced-a11y.md
```

### Performance Thresholds

```bash
# Set custom performance budgets for component testing
/check-ui --component-name=Chart --performance-budget=protocol-assets/performance-budgets/chart-limits.json

# Monitor specific performance metrics during validation
/check-ui --component-name=DataGrid --metrics=render-time,memory-usage,layout-shifts
```

</formatting>
</file>
