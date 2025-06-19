# Sequential Thinking MCP Integration Guide

## Overview
The Sequential Thinking MCP tool enables dynamic, reflective problem-solving through a flexible thinking process that can adapt and evolve. It's perfect for complex analysis, planning, and decision-making.

## Tool Details

**Tool Name:** `mcp__sequential-thinking__sequentialthinking`

**Key Features:**
- Thoughts can build on, question, or revise previous insights
- Can adjust total thoughts up or down as understanding deepens
- Supports branching and backtracking
- Allows expressing uncertainty and exploring alternatives
- Enables hypothesis generation and verification

## Usage Patterns

### Basic Sequential Thinking
```
mcp__sequential-thinking__sequentialthinking
  thought="[Current analysis or thinking step]"
  nextThoughtNeeded=true/false
  thoughtNumber=1
  totalThoughts=5  // Initial estimate, can be adjusted
```

### Example: Analyzing Complex Requirements
```
# First thought
mcp__sequential-thinking__sequentialthinking
  thought="The user wants a notification system. Let me break down the core requirements: 1) Real-time delivery, 2) Multiple channels (email, SMS, in-app), 3) User preferences. This seems straightforward but I need to consider scalability."
  nextThoughtNeeded=true
  thoughtNumber=1
  totalThoughts=5

# Second thought
mcp__sequential-thinking__sequentialthinking
  thought="Thinking about scalability - we need to consider: message queuing for reliability, rate limiting to prevent spam, and batch processing for efficiency. This adds complexity to the initial design."
  nextThoughtNeeded=true
  thoughtNumber=2
  totalThoughts=5

# Third thought with revision
mcp__sequential-thinking__sequentialthinking
  thought="Actually, I'm reconsidering the real-time requirement. For most notifications, near-real-time (within 1-2 minutes) might be sufficient and much easier to implement. Let me revise my approach."
  nextThoughtNeeded=true
  thoughtNumber=3
  totalThoughts=6  // Adjusting total as complexity emerges
  isRevision=true
  revisesThought=1
```

### Advanced Features

**Branching Thoughts:**
```
mcp__sequential-thinking__sequentialthinking
  thought="There are two possible architectures here: microservices or monolithic. Let me explore the microservices path first."
  nextThoughtNeeded=true
  thoughtNumber=4
  totalThoughts=8
  branchFromThought=3
  branchId="microservices-path"
```

**Expressing Uncertainty:**
```
mcp__sequential-thinking__sequentialthinking
  thought="I'm uncertain about the database choice. NoSQL would handle the unstructured notification data well, but we might need ACID compliance for user preferences. I need to explore both options."
  nextThoughtNeeded=true
  thoughtNumber=5
  totalThoughts=8
  needsMoreThoughts=true
```

## When to Use Sequential Thinking

### PRD Creation
- Breaking down vague user requests into specific requirements
- Mapping user needs to business objectives
- Identifying hidden complexity or edge cases
- Prioritizing features based on value and effort

### TRD Creation
- Evaluating technology choices
- Analyzing architectural trade-offs
- Identifying technical risks and mitigation strategies
- Planning implementation phases

### Task Generation
- Breaking down large features into atomic tasks
- Identifying dependencies between tasks
- Estimating complexity and effort
- Sequencing tasks for optimal development flow

### Code Review
- Tracing through complex code paths
- Identifying architectural issues
- Understanding business logic flow
- Finding security vulnerabilities

## Integration with Memory MCP

Sequential Thinking works best when combined with Memory MCP:

```
# Start by retrieving context
mcp__lerian-memory__memory_read
  operation="search"
  options={
    "query": "notification systems architecture patterns",
    "repository": "github.com/org/repo"
  }

# Use Sequential Thinking to analyze
mcp__sequential-thinking__sequentialthinking
  thought="Based on similar systems in our codebase, I see we use RabbitMQ for messaging. This influences our notification architecture..."
  nextThoughtNeeded=true
  thoughtNumber=1
  totalThoughts=5

# Store insights
mcp__lerian-memory__memory_create
  operation="store_decision"
  options={
    "decision": "Use message queue architecture for notifications",
    "rationale": "Based on sequential analysis: scalability needs, existing RabbitMQ infrastructure, reliability requirements",
    "repository": "github.com/org/repo",
    "session_id": "notification-design"
  }
```

## Best Practices

1. **Start with an estimate**: Begin with a reasonable totalThoughts estimate, adjust as needed
2. **Be explicit about revisions**: Use isRevision when reconsidering previous thoughts
3. **Branch when exploring alternatives**: Use branching to explore different paths
4. **Express uncertainty**: Don't hesitate to say when you're unsure
5. **Complete the thinking**: Continue until nextThoughtNeeded=false
6. **Store conclusions**: Always store final insights in Memory MCP

## Common Patterns

### Requirements Analysis Pattern
```
Thought 1: Break down the high-level request
Thought 2: Identify user personas and use cases  
Thought 3: Map to business objectives
Thought 4: Consider technical constraints
Thought 5: Synthesize into requirements
```

### Architecture Decision Pattern
```
Thought 1: Understand the problem space
Thought 2: Identify possible solutions
Thought 3-N: Explore each solution (may branch)
Thought N+1: Compare trade-offs
Thought N+2: Make recommendation with rationale
```

### Task Breakdown Pattern
```
Thought 1: Understand the feature scope
Thought 2: Identify major components
Thought 3: Break into implementation phases
Thought 4: Identify dependencies
Thought 5: Sequence tasks optimally
```

## Example: Complete Feature Analysis

```
# Initial analysis
mcp__sequential-thinking__sequentialthinking
  thought="User wants 'smart notifications'. This is vague. Let me think about what 'smart' could mean: 1) Intelligent routing based on user activity, 2) Content personalization, 3) Delivery time optimization, 4) Duplicate prevention."
  nextThoughtNeeded=true
  thoughtNumber=1
  totalThoughts=6

# Deeper exploration
mcp__sequential-thinking__sequentialthinking
  thought="For intelligent routing, we'd need to track user engagement patterns. This requires: analytics integration, ML model for prediction, A/B testing framework. This is significantly complex."
  nextThoughtNeeded=true
  thoughtNumber=2
  totalThoughts=6

# Reality check
mcp__sequential-thinking__sequentialthinking
  thought="Wait, I should verify if this complexity is justified. Let me reconsider the core user need. Maybe 'smart' just means 'not spammy' - ensuring users get relevant notifications without overwhelming them."
  nextThoughtNeeded=true
  thoughtNumber=3
  totalThoughts=7  // Adjusting as I dig deeper
  isRevision=true
  revisesThought=1

# Practical approach
mcp__sequential-thinking__sequentialthinking
  thought="A simpler 'smart' notification system could include: 1) Rate limiting per user, 2) Notification preferences, 3) Quiet hours, 4) Priority levels. This delivers value without ML complexity."
  nextThoughtNeeded=true
  thoughtNumber=4
  totalThoughts=7

# Technical planning
mcp__sequential-thinking__sequentialthinking
  thought="For implementation: Use Redis for rate limiting, PostgreSQL for preferences, RabbitMQ for delivery, simple cron for quiet hours. This leverages existing infrastructure."
  nextThoughtNeeded=true
  thoughtNumber=5
  totalThoughts=7

# Risk assessment
mcp__sequential-thinking__sequentialthinking
  thought="Potential issues: Redis failure could break rate limiting (fallback needed), preference changes need cache invalidation, quiet hours need timezone handling. All manageable."
  nextThoughtNeeded=true
  thoughtNumber=6
  totalThoughts=7

# Final synthesis
mcp__sequential-thinking__sequentialthinking
  thought="Recommendation: Start with simple 'smart' features (rate limiting, preferences, quiet hours) in Phase 1. Can add ML-based routing in Phase 2 if metrics show need. This balances user value with development effort."
  nextThoughtNeeded=false
  thoughtNumber=7
  totalThoughts=7
```

## Integration Tips

1. **Use for complex decisions**: Don't use Sequential Thinking for simple, straightforward tasks
2. **Combine with Memory**: Always retrieve context first and store insights after
3. **Document thought chains**: The thought progression is valuable documentation
4. **Allow flexibility**: Don't force a predetermined number of thoughts
5. **Focus on insights**: Each thought should add understanding, not just restate

This tool is most valuable when facing ambiguity, complexity, or when you need to thoroughly explore a problem space before making decisions.