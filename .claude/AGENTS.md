# Lerian Protocol Agents Integration Guide

This document provides comprehensive guidance on using the specialized Claude Code agents implemented for Lerian Protocol development.

## Agent Overview

We have implemented 10 specialized agents optimized for Lerian Protocol applications:

### 🏗️ Architecture & Development

- **nextjs-architecture-expert**: Next.js architecture specialist for App Router, Server Components, and migration strategies
- **react-performance-optimizer**: React performance optimization for large-scale board applications
- **code-reviewer**: Comprehensive code review with security and quality focus
- **debugger**: Systematic debugging for complex application issues

### 🔍 Analysis & Planning

- **error-detective**: Log analysis and error pattern detection specialist
- **task-decomposition-expert**: Complex goal breakdown and workflow orchestration
- **performance-profiler**: Performance analysis and Core Web Vitals optimization
- **monitoring-specialist**: Production monitoring and observability expert

### 🔒 Security

- **security-auditor**: OWASP compliance and vulnerability assessment
- **penetration-tester**: Ethical hacking and security testing

## Usage Patterns

### Using Individual Agents

To use a specific agent, reference them with the `@` syntax:

```
@nextjs-architecture-expert help me migrate this React component to use Next.js App Router
```

```
@security-auditor review the authentication flow in src/auth/
```

```
@performance-profiler analyze the board rendering performance with 1000+ tasks
```

### Agent Collaboration Workflows

Many tasks benefit from multiple agents working together:

#### Full-Stack Feature Development

```
@task-decomposition-expert create a plan for implementing real-time task collaboration

# Then execute the plan with:
@nextjs-architecture-expert implement the API routes
@react-performance-optimizer optimize the real-time updates
@security-auditor review the WebSocket security
@monitoring-specialist add performance metrics
```

#### Performance Optimization Workflow

```
@performance-profiler identify bottlenecks in the board rendering
@react-performance-optimizer implement virtualization solutions
@monitoring-specialist set up performance tracking
@code-reviewer review the optimization changes
```

#### Security Hardening Workflow

```
@security-auditor conduct a comprehensive security review
@penetration-tester perform security testing
@code-reviewer implement security fixes
@monitoring-specialist add security monitoring
```

## Agent Specializations

### nextjs-architecture-expert

**Best for**: App Router migration, Server Components, ISR, routing architecture

```typescript
// Example usage areas:
- Converting pages/ to app/ directory structure
- Implementing Server Components for board data
- Setting up middleware for authentication
- Optimizing bundle splitting and code organization
```

### react-performance-optimizer

**Best for**: Large board optimization, virtualization, React 19 features

```typescript
// Example usage areas:
- Implementing task list virtualization for 1000+ items
- Optimizing drag-and-drop performance
- Using React 19 concurrent features (useTransition, useDeferredValue)
- Memory leak prevention in long-running board sessions
```

### code-reviewer

**Best for**: Quality assurance, security review, best practices

```typescript
// Example usage areas:
- Pre-commit code review automation
- Security vulnerability detection
- Performance anti-pattern identification
- Lerian Protocol compliance checking
```

### debugger

**Best for**: Complex bugs, production issues, state management problems

```typescript
// Example usage areas:
- WebSocket connection debugging
- Task state synchronization issues
- Memory leaks in board components
- React hydration mismatches in Next.js
```

### error-detective

**Best for**: Log analysis, production monitoring, incident investigation

```typescript
// Example usage areas:
- Analyzing application logs for error patterns
- Correlating errors across services (board-api, board-ui)
- Real-time anomaly detection
- Performance degradation analysis
```

### task-decomposition-expert

**Best for**: Complex project planning, workflow orchestration, multi-agent coordination

```typescript
// Example usage areas:
- Breaking down large features into development phases
- Coordinating multiple agent workflows
- Risk assessment and mitigation planning
- Resource allocation and timeline estimation
```

### security-auditor

**Best for**: OWASP compliance, authentication security, input validation

```typescript
// Example usage areas:
- JWT token security review
- API authentication flow auditing
- Input sanitization verification
- CORS and CSP configuration review
```

### penetration-tester

**Best for**: Security testing, vulnerability exploitation, red team operations

```typescript
// Example usage areas:
- Automated security scanning
- Authentication bypass testing
- SQL injection and XSS testing
- Network security assessment
```

### performance-profiler

**Best for**: Core Web Vitals, bundle analysis, runtime performance

```typescript
// Example usage areas:
- Lighthouse CI integration
- Bundle size optimization
- Memory usage profiling
- Real-time performance monitoring
```

### monitoring-specialist

**Best for**: Production monitoring, alerting, SLA compliance

```typescript
// Example usage areas:
- Grafana dashboard configuration
- Prometheus metrics setup
- Incident response automation
- Performance regression detection
```

## Integration with Lerian Protocol

### Board Management Workflows

```typescript
// Optimizing large board performance
@performance-profiler analyze board with 2000 tasks
@react-performance-optimizer implement virtualization
@monitoring-specialist add board performance metrics

// Securing board operations
@security-auditor review board permissions system
@penetration-tester test authorization bypass
@code-reviewer implement security fixes

// Debugging sync issues
@error-detective analyze WebSocket disconnection logs
@debugger investigate task state conflicts
@monitoring-specialist add real-time sync monitoring
```

### Development Best Practices

#### 1. Feature Development Cycle

```bash
# 1. Planning Phase
@task-decomposition-expert "break down new board filtering feature"

# 2. Implementation Phase
@nextjs-architecture-expert "implement API routes for filtering"
@react-performance-optimizer "optimize filter performance"

# 3. Quality Assurance
@code-reviewer "review filtering implementation"
@security-auditor "check filter input validation"

# 4. Testing & Monitoring
@penetration-tester "test filter bypass attempts"
@monitoring-specialist "add filtering performance metrics"
```

#### 2. Performance Optimization Cycle

```bash
# 1. Analysis
@performance-profiler "audit board loading performance"
@error-detective "analyze slow query logs"

# 2. Optimization
@react-performance-optimizer "implement task virtualization"
@nextjs-architecture-expert "optimize API data fetching"

# 3. Validation
@monitoring-specialist "verify performance improvements"
@code-reviewer "review optimization code quality"
```

#### 3. Security Review Cycle

```bash
# 1. Assessment
@security-auditor "conduct OWASP Top 10 review"
@penetration-tester "perform authentication testing"

# 2. Remediation
@code-reviewer "fix identified vulnerabilities"
@debugger "test security fix edge cases"

# 3. Verification
@penetration-tester "verify vulnerability fixes"
@monitoring-specialist "add security monitoring"
```

## Agent Collaboration Matrix

| Primary Agent               | Best Collaborators                            | Use Case                       |
| --------------------------- | --------------------------------------------- | ------------------------------ |
| nextjs-architecture-expert  | react-performance-optimizer, security-auditor | Full-stack feature development |
| react-performance-optimizer | performance-profiler, monitoring-specialist   | Performance optimization       |
| security-auditor            | penetration-tester, code-reviewer             | Security hardening             |
| error-detective             | debugger, monitoring-specialist               | Production issue resolution    |
| task-decomposition-expert   | All agents                                    | Complex project planning       |

## Common Workflows

### New Feature Implementation

1. **@task-decomposition-expert** - Break down requirements
2. **@nextjs-architecture-expert** - Design technical architecture
3. **@react-performance-optimizer** - Implement with performance in mind
4. **@code-reviewer** - Quality assurance review
5. **@security-auditor** - Security compliance check
6. **@monitoring-specialist** - Add observability

### Performance Issue Investigation

1. **@error-detective** - Analyze logs and symptoms
2. **@performance-profiler** - Measure and profile performance
3. **@debugger** - Root cause analysis
4. **@react-performance-optimizer** - Implement optimizations
5. **@monitoring-specialist** - Verify improvements

### Security Incident Response

1. **@security-auditor** - Initial security assessment
2. **@penetration-tester** - Exploit verification
3. **@error-detective** - Log analysis for breach indicators
4. **@code-reviewer** - Implement security fixes
5. **@monitoring-specialist** - Enhanced security monitoring

## Best Practices

### 1. Agent Selection

- Use **specific agents** for specialized tasks
- Combine **complementary agents** for complex workflows
- Start with **@task-decomposition-expert** for large projects

### 2. Workflow Coordination

- Plan agent sequences based on dependencies
- Use handoff protocols between agents
- Document decisions and findings

### 3. Quality Gates

- Always include **@code-reviewer** in development workflows
- Use **@security-auditor** for security-sensitive changes
- Add **@monitoring-specialist** for production changes

### 4. Continuous Improvement

- Use **@performance-profiler** for regular health checks
- Leverage **@error-detective** for proactive monitoring
- Apply **@penetration-tester** for regular security assessments

## Troubleshooting

### Agent Not Responding as Expected

1. Check agent expertise matches your task
2. Provide specific, detailed context
3. Try breaking complex tasks into smaller pieces

### Performance Issues

1. Use **@performance-profiler** to identify bottlenecks
2. Combine with **@react-performance-optimizer** for solutions
3. Add monitoring with **@monitoring-specialist**

### Security Concerns

1. Start with **@security-auditor** for assessment
2. Use **@penetration-tester** for validation
3. Implement fixes with **@code-reviewer**

## Integration Examples

See the `/examples/` directory for complete workflow examples:

- `board-performance-optimization.md` - Complete performance optimization workflow
- `security-hardening-process.md` - End-to-end security review process
- `feature-development-cycle.md` - Full-stack feature implementation

## Support

For questions or issues with agent usage:

1. Check this documentation first
2. Review agent-specific documentation in `.claude/agents/shared/`
3. Use **@task-decomposition-expert** to break down complex problems

---

_This documentation is maintained alongside the Lerian Protocol agent implementations and should be updated when new agents are added or existing ones are modified._
