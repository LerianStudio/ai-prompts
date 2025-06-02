# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an AI prompts repository for the LerianStudio ecosystem, containing specialized prompts for different engineering roles and workflows. The repository serves as a centralized collection of domain-specific prompts for architectural analysis, security research, business analysis, and technical documentation.

## Repository Structure

### Core Prompt Categories
- **Architecture & Design**: `1-architecture-researcher.md`, `4-api-architect-researcher.md`
- **Security & Privacy**: `2-security-researcher.md`, `7-vendor-sec-anal-researcher.md`, `8-privacy-gdpr-analysis.md`
- **Business & Product**: `3-biz-product-improvement-analyst.md`
- **Infrastructure & Operations**: `5-database-researcher.md`, `6-observability-engineer.md`
- **Testing & Documentation**: `9-test-researcher.md`, `10-tech-writer-engineer.md`

### Specialized Workflows
- **memory-related/**: Memory management prompts for AI context preservation
- **avulsos/**: Utility prompts including codebase analysis and Go quality checks

## Key Prompt Patterns

### Memory Integration
All prompts are designed to work with the Memory Context Protocol (MCP):
- Use `memory_get_context` to resume work from checkpoints
- Store findings with `memory_store_chunk` and `memory_store_decision`
- Tag entries appropriately for organization and retrieval

### Structured Analysis Framework
Most prompts follow a systematic approach:
1. **Initial Exploration** - High-level mapping and tech stack identification
2. **Deep Component Analysis** - Detailed component breakdown with file references
3. **Pattern Recognition** - Architectural patterns and design decisions
4. **Documentation Creation** - Structured markdown with mermaid diagrams

### Documentation Standards
- Create documentation in `.claude/` directory
- Use mermaid diagrams for visual representations
- Include specific file references for all claims
- Maintain table of contents with navigation links

## Common Development Tasks

### Running Architecture Analysis
Use the architecture researcher prompt (`1-architecture-researcher.md`) for comprehensive codebase analysis with systematic memory storage and structured documentation output.

### Go Code Quality Checks
For Go projects, use the pattern from `avulsos/golang-pre-push-full-check.md`:
```bash
# Run full quality checks
go fmt ./...
go test ./...
gosec ./...
go run golang.org/x/vuln/cmd/govulncheck ./...
go vet ./...
# Additional linting and performance checks
```

### Memory Workflow Management
- Check pending tasks with `memory-related/get-memory.md` patterns
- Use memory tools for context preservation across sessions
- Tag findings appropriately for easy retrieval

## Integration with LerianStudio Ecosystem

This repository supports the broader LerianStudio monorepo by providing:
- Specialized analysis prompts for financial technology components
- Security and compliance analysis frameworks  
- Technical documentation generation workflows
- Multi-agent coordination patterns for large codebases

## File Naming Conventions
- Numbered prompts (1-10) represent core engineering roles
- Descriptive names for specialized workflows
- Memory-related prompts grouped in dedicated directory
- Utility prompts in `avulsos/` directory