# Sequential Thinking MCP Update Summary

## Overview
Updated all prompts in the ai-prompts repository to properly guide LLMs in using the Sequential Thinking MCP tool.

## Key Changes Made

### 1. Created Sequential Thinking Guide
- **File:** `SEQUENTIAL_THINKING_GUIDE.md`
- **Content:** Comprehensive guide with:
  - Correct tool name: `mcp__sequential-thinking__sequentialthinking`
  - Usage patterns and examples
  - Integration with Memory MCP
  - Common patterns for different use cases

### 2. Updated Prompts with Correct Tool Usage

#### 1-pre-dev-product Directory
- **1-create-prd.mdc**: Added Sequential Thinking section with correct tool name and example usage
- **2-create-trd.mdc**: Already had correct references
- **0-pre-dev-orchestrator.mdc**: Updated Memory MCP references to use correct tool names

#### 2-pre-dev-feature Directory  
- **1-feature-brief.mdc**: Added Sequential Thinking section with correct tool name and example usage
- **2-technical-approach.mdc**: Updated with correct tool name and comprehensive examples
- **0-feature-orchestrator.mdc**: Updated Memory MCP references to use correct tool names

#### 3-frontend Directory
- **1-design-input-analysis.mdc**: Added Sequential Thinking section with correct tool name and design analysis examples
- **0-frontend-orchestrator.mdc**: Added both Memory MCP and Sequential Thinking sections

#### 4-code-review Directory
- All files already had correct Sequential Thinking MCP tool name references

#### 5-generate-docs Directory
- **1-documentation-discovery.mdc**: Added Sequential Thinking section with documentation analysis examples
- **0-docs-orchestrator.mdc**: Added Sequential Thinking integration section

#### 0-memory-system Directory
- **m0-memory-orchestrator.mdc**: Enhanced with concrete Sequential Thinking example

## Key Patterns Established

### 1. Tool Invocation Pattern
```
mcp__sequential-thinking__sequentialthinking
  thought="[Current analysis or thinking step]"
  nextThoughtNeeded=true/false
  thoughtNumber=1
  totalThoughts=5  // Initial estimate, can be adjusted
```

### 2. Common Use Cases
- **PRD Creation**: Breaking down vague requests, user journey mapping, feature prioritization
- **TRD Creation**: Architecture analysis, technology evaluation, system design validation
- **Feature Development**: Scope analysis, integration mapping, implementation strategy
- **Design Analysis**: Design interpretation, user flow analysis, responsive design strategy
- **Code Review**: Complex code path tracing, architectural issue identification
- **Documentation**: Gap analysis, audience mapping, priority assessment

### 3. Integration with Memory MCP
- Always retrieve context first with Memory MCP
- Use Sequential Thinking for analysis
- Store insights back to Memory MCP

## Benefits
1. **Consistency**: All prompts now use the correct tool name
2. **Examples**: Every major prompt includes concrete usage examples
3. **Context**: Clear guidance on when and how to use Sequential Thinking
4. **Integration**: Seamless integration with Memory MCP workflows

## Next Steps
- Monitor LLM usage of Sequential Thinking in practice
- Gather feedback on effectiveness
- Refine examples based on real-world usage patterns