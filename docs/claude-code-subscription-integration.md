# Claude Code Subscription Integration

## Overview

This document outlines the integration of Claude Code's subscription-based authentication system with our task
management board. The integration ensures users utilize their paid Claude subscriptions while providing seamless
AI-powered task execution.

## Architecture

### Authentication Flow

```
User → Claude Code CLI → Subscription Check → Session Management → Task Execution
```

### Key Components

1. **Subscription Detection**: Monitor authentication method used by Claude Code
2. **Session Management**: Preserve conversation continuity across interactions
3. **Warning System**: Alert users when bypassing their subscription
4. **Executor Service**: Handle Claude Code CLI interactions

## Implementation Details

### 1. Authentication Method Detection

Claude Code provides authentication source information in its JSON output:

```javascript
// Subscription-based (desired)
{
  "type": "system",
  "apiKeySource": "/login managed key",
  "session_id": "sess_abc123"
}

// Direct API key (bypassing subscription)
{
  "type": "system",
  "apiKeySource": "ANTHROPIC_API_KEY",
  "session_id": "sess_xyz789"
}
```

### 2. Subscription Warning System

When detecting direct API key usage, display warning to user:

```javascript
function detectSubscriptionUsage(apiKeySource) {
    if (apiKeySource === 'ANTHROPIC_API_KEY') {
        return {
            isUsingSubscription: false,
            warning:
                '⚠️ ANTHROPIC_API_KEY detected, your Claude subscription is not being used'
        }
    }
    return { isUsingSubscription: true }
}
```

### 3. Session Management

Extract and persist session IDs for conversation continuity:

```javascript
function extractSessionId(claudeJson) {
    const sessionFields = ['session_id', 'sessionId']
    for (const field of sessionFields) {
        if (claudeJson[field]) {
            return claudeJson[field]
        }
    }
    return null
}
```

### 4. Command Building

Build Claude Code commands with subscription optimization:

```javascript
function buildClaudeCommand(prompt, sessionId = null) {
    let command = 'npx @anthropic-ai/claude-code'

    // Add session resume for follow-ups
    if (sessionId) {
        command += ` --resume ${sessionId}`
    }

    // Enable JSON streaming for parsing
    command += ' --output-format=stream-json --verbose'

    return command
}
```

## Benefits

1. **Cost Optimization**: Prevents accidental API billing when subscription exists
2. **Session Continuity**: Maintains conversation context across task interactions
3. **Subscription Awareness**: Clear visibility into billing method being used
4. **Seamless Integration**: No custom authentication - leverages Claude Code's built-in system

## Usage Example

```javascript
const executor = new ClaudeCodeExecutor()

// Execute task with subscription detection
const result = await executor.execute({
    prompt: 'Review this code and suggest improvements',
    taskId: 'task_123'
})

// Check if using subscription
if (!result.subscription.isUsingSubscription) {
    console.warn(result.subscription.warning)
}

// Use session for follow-up
const followUp = await executor.executeFollowUp({
    prompt: 'Apply the suggested changes',
    sessionId: result.sessionId,
    taskId: 'task_123'
})
```

## Error Handling

Handle common subscription-related issues:

- **No Subscription**: Guide user to Claude Code login
- **Expired Session**: Automatically retry with new session
- **API Key Override**: Show prominent warning with guidance
- **Rate Limits**: Respect Claude Code's built-in throttling

## Security Considerations

- Never log or store API keys or session tokens
- Validate all inputs before passing to Claude Code CLI
- Use secure process spawning with proper isolation
- Monitor for unusual authentication patterns

## Testing

Test scenarios to validate:

1. **Subscription Detection**: Verify correct identification of auth method
2. **Session Persistence**: Confirm session IDs are properly extracted and reused
3. **Warning Display**: Check warnings appear for API key usage
4. **Error Handling**: Test response to authentication failures
5. **Integration**: Validate end-to-end task execution flow
