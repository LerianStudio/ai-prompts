# Claude Code Custom Commands

Custom slash commands for the LerianStudio AI Prompts ecosystem.

## 🚀 Analysis Commands

### `/analyze-full`
**Complete 16-prompt analysis chain**
- Executes all prompts (00-15) with dependency tracking
- Comprehensive system documentation
- Time: ~45-60 minutes for large codebases

### `/analyze-security` 
**Security-focused analysis**
- Vulnerability assessment, dependency security, privacy compliance
- Production security audit
- Time: ~15-20 minutes

### `/analyze-architecture`
**Architecture-focused analysis** 
- System design, API contracts, database optimization
- Sequence diagram generation
- Time: ~20-25 minutes

### `/analyze-quality`
**Quality and testing analysis**
- Test coverage, production readiness, quality checks
- Deployment preparation
- Time: ~15-20 minutes

## 🧠 Memory Commands

### `/memory-status`
**Check memory context**
- Current repository status
- Active tasks and completion
- Pattern insights

### `/memory-init`
**Initialize memory session**
- Start new analysis session
- Load existing context
- Setup task tracking

### `/memory-tasks`
**Manage tasks**
- Update task status
- Add discovered tasks
- Track progress

## ⚡ Quick Commands

### `/overview`
**Quick codebase overview**
- Foundation analysis only
- Tech stack identification
- Entry point mapping

### `/security-scan`
**Quick security scan**
- Core vulnerability analysis
- Fast security assessment
- Critical findings only

### `/docs-gen`
**Generate documentation**
- Auto-generate project docs
- API reference creation
- Synthesis of all findings

### `/diagrams`
**Generate sequence diagrams**
- Mermaid visualization
- System interaction flows
- API workflow diagrams

## 🎯 Usage Examples

```bash
# Complete analysis
/analyze-full

# Security assessment
/analyze-security

# Check memory context
/memory-status

# Quick overview
/overview
```

## 🔧 Command Implementation

Commands are implemented via:
1. **CLAUDE.md definitions** - Primary method
2. **`.claude/commands/` directory** - Command documentation
3. **This registry** - Command reference

## 📋 Command Patterns

All commands follow these patterns:
- **Foundation first**: Always run `00-codebase-overview.md` 
- **Dependency tracking**: Each prompt references previous outputs
- **Memory integration**: Automatic MCP session management
- **Structured output**: Organized `.claude/` and `diagrams/` directories

## 🚧 Custom Commands

To create custom commands:
1. Add definition to `CLAUDE.md`
2. Create documentation in `.claude/commands/`
3. Update this registry
4. Test with Claude Code

Example custom command structure:
```markdown
#### `/my-command`
Description of what the command does:
```bash
# Command implementation
claude prompt1.md
claude prompt2.md
```
```