# Playwright Desktop Testing Workflow - Flow Diagram

## Overview
This diagram represents the flow of the Playwright Desktop UI Testing Workflow, showing the sequential steps, agent responsibilities, and data dependencies for comprehensive UI component validation at 1920×1080 resolution.

## ASCII Flow Diagram

```
┌─────────────────────┐
│  Component Spec     │ (Input)
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ Environment Setup   │ [ui-validator]
│ - Playwright Init   │
│ - Desktop Browser   │
└──────────┬──────────┘
           │ creates: desktop-browser-session
           v
┌─────────────────────┐
│ Component Discovery │ [ui-validator]
│ - Navigate to UI    │
│ - Inventory Components
└──────────┬──────────┘
           │ creates: component-inventory
           v
┌─────────────────────┐
│ Desktop Visual Test │ [ui-validator]
│ - Screenshots       │
│ - Interactions      │
│ - Performance       │
└──────────┬──────────┘
           │ creates: desktop-screenshots-and-metrics
           v
┌─────────────────────┐
│ Compliance Validation│ [standards-validator]
│ - Design Standards  │
│ - Accessibility     │
│ - Performance       │
└──────────┬──────────┘
           │ creates: compliance-scores-and-issues
           v
┌─────────────────────┐
│ Report Generation   │ [report-generator]
│ - Validation Report │
│ - Recommendations   │
│ - Action Items      │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ Actionable Report   │ (Output)
│ Overall Score: X%   │
└─────────────────────┘
```

## Mermaid Flow Diagram

```mermaid
flowchart TD
    Input([Component Specification]) --> Setup
    
    Setup[Environment Setup<br/>🤖 ui-validator<br/>• Playwright MCP Init<br/>• Desktop Browser Session] 
    Setup --> |desktop-browser-session| Discovery
    
    Discovery[Component Discovery<br/>🤖 ui-validator<br/>• Navigate to Component<br/>• Create Inventory]
    Discovery --> |component-inventory| Testing
    
    Testing[Desktop Visual Testing<br/>🤖 ui-validator<br/>• Screenshots @ 1920×1080<br/>• Interaction Testing<br/>• Performance Metrics<br/>• Accessibility Audit]
    Testing --> |desktop-screenshots-and-metrics| Validation
    
    Validation[Compliance Validation<br/>🤖 standards-validator<br/>• Design System Check<br/>• Accessibility Standards<br/>• Performance Benchmarks]
    Validation --> |compliance-scores-and-issues| Report
    
    Report[Report Generation<br/>🤖 report-generator<br/>• Validation Summary<br/>• Issue Categorization<br/>• Actionable Recommendations]
    Report --> Output
    
    Output([📋 Validation Report<br/>• Overall Quality Score<br/>• Critical/Warning/Advisory Issues<br/>• Implementation Guidance])
    
    style Setup fill:#e1f5fe
    style Discovery fill:#e8f5e8
    style Testing fill:#fff3e0
    style Validation fill:#fce4ec
    style Report fill:#f3e5f5
    style Input fill:#f5f5f5
    style Output fill:#e8f5e8
```

## Agent Responsibilities

### 🤖 ui-validator
- **Steps**: environment-setup, component-discovery, desktop-visual-testing
- **Focus**: Browser automation, visual testing, interaction validation
- **Outputs**: Screenshots, performance data, accessibility snapshots

### 🤖 standards-validator  
- **Steps**: compliance-validation
- **Focus**: Design system compliance, accessibility standards, performance benchmarks
- **Outputs**: Compliance scores, categorized issues, severity assessments

### 🤖 report-generator
- **Steps**: report-generation
- **Focus**: Comprehensive reporting, actionable recommendations
- **Outputs**: Validation reports, implementation guidance

## Data Flow Dependencies

1. **component-specification** → **desktop-browser-session**
2. **desktop-browser-session** → **component-inventory** 
3. **component-inventory** → **desktop-screenshots-and-metrics**
4. **desktop-screenshots-and-metrics** → **compliance-scores-and-issues**
5. **compliance-scores-and-issues** + **desktop-screenshots-and-metrics** → **actionable-validation-report**

## Handoff Points

The workflow includes three key handoff prompts:

1. **ui-validator → standards-validator**: Desktop testing evidence package transfer
2. **standards-validator → report-generator**: Compliance analysis results transfer  
3. **workflow completion**: Final validation report delivery

## Key Features

- **Resolution**: Fixed at 1920×1080 for consistent desktop testing
- **Evidence Collection**: Screenshots, metrics, logs, interaction behaviors
- **Multi-faceted Validation**: Visual, functional, accessibility, performance
- **Actionable Output**: Specific recommendations with implementation guidance
</file>
