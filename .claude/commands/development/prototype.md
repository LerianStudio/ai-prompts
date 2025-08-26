---
allowed-tools: Bash(*), Read(*), Write(*), MultiEdit(*), Edit(*), Glob(*), Grep(*), LS(*), Task(*), TodoWrite(*)
description: Create working proof-of-concept implementations to validate ideas and demonstrate functionality
argument-hint: <feature or concept to prototype>
---

# /prototype

Create a working proof-of-concept implementation to validate ideas, test hypotheses, or demonstrate functionality quickly.

## Overview

This command helps you build minimal, functional prototypes in 2-4 hours to:

- Validate technical feasibility
- Test core assumptions
- Demonstrate key functionality
- Explore integration possibilities
- Gather performance metrics

## Usage

```
/prototype <feature or concept description>
```

**Examples:**

- `/prototype React component library with Storybook`
- `/prototype real-time chat with WebSocket client`
- `/prototype drag-and-drop file upload component`

## Approach

1. **Time-boxed Development**: 2-4 hours maximum
2. **Single Feature Focus**: One core capability only
3. **Mock Dependencies**: Use in-memory/fake services
4. **Happy Path Priority**: Skip edge cases initially
5. **Quick Validation**: Measure key metrics early

### Setup

```bash
# Create isolated environment
mkdir prototype-$(date +%Y%m%d)-${FEATURE_NAME}
cd prototype-$(date +%Y%m%d)-${FEATURE_NAME}

# Initialize React/TypeScript project
npx create-react-app . --template typescript
# or
npx create-next-app@latest . --typescript --tailwind --eslint
# or
npm create vite@latest . -- --template react-ts
```

## Templates

### React Component Prototype

```typescript
// src/components/PrototypeComponent.tsx
import React, { useState, useEffect } from 'react';
import './PrototypeComponent.css';

interface PrototypeProps {
  title: string;
  data?: any[];
  onAction?: (item: any) => void;
}

export const PrototypeComponent: React.FC<PrototypeProps> = ({
  title,
  data = [],
  onAction
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => {
      setResults(data);
      setLoading(false);
    }, 500);
  }, [data]);

  const handleClick = (item: any) => {
    onAction?.(item);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="prototype-component">
      <h2>{title}</h2>
      <div className="results">
        {results.map((item, index) => (
          <div key={index} onClick={() => handleClick(item)}>
            {JSON.stringify(item)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Custom Hook Prototype

```typescript
// src/hooks/usePrototype.ts
import { useState, useEffect, useCallback } from 'react'

interface UsePrototypeOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface PrototypeState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const usePrototype = <T>(
  fetcher: () => Promise<T>,
  options: UsePrototypeOptions = {}
) {
  const [state, setState] = useState<PrototypeState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await fetcher()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [fetcher])

  useEffect(() => {
    fetchData()

    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.autoRefresh, options.refreshInterval])

  return {
    ...state,
    refetch: fetchData
  }
}
```

### Data Pipeline (TypeScript)

```typescript
// pipeline.ts - Stream processing prototype
import { readLines } from '@std/io/read_lines.ts'

async function* processStream(input: AsyncIterable<string>) {
  for await (const line of input) {
    // Transform logic
    const processed = line.toUpperCase().trim()
    if (processed.length > 0) {
      yield {
        original: line,
        processed,
        timestamp: Date.now()
      }
    }
  }
}

// Usage
const file = await Deno.open('input.txt')
const lines = readLines(file)

for await (const result of processStream(lines)) {
  console.log(JSON.stringify(result))
}
```

### Integration Examples

#### Database Connection

```typescript
// Quick PostgreSQL prototype
import { Client } from 'https://deno.land/x/postgres/mod.ts'

const client = new Client({
  user: 'prototype',
  database: 'prototype_db',
  hostname: 'localhost',
  port: 5432
})

await client.connect()

// Test query
const result = await client.queryObject`
  SELECT * FROM users WHERE active = true LIMIT 5
`

console.log('Sample data:', result.rows)
```

#### Message Queue (Go)

```go
// Quick Redis Pub/Sub prototype
package main

import (
    "fmt"
    "github.com/redis/go-redis/v9"
    "context"
    "time"
)

func main() {
    ctx := context.Background()
    rdb := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })

    // Publisher prototype
    go func() {
        for i := 0; i < 10; i++ {
            rdb.Publish(ctx, "prototype-channel", fmt.Sprintf("Message %d", i))
            time.Sleep(time.Second)
        }
    }()

    // Subscriber prototype
    sub := rdb.Subscribe(ctx, "prototype-channel")
    for msg := range sub.Channel() {
        fmt.Printf("Received: %s\n", msg.Payload)
    }
}
```

### UI Components

#### React Component

```jsx
// PrototypeComponent.jsx
export default function PrototypeFeature({ data }) {
  const [state, setState] = useState(data)
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setState((prev) => ({ ...prev, updated: Date.now() }))
    setLoading(false)
  }

  return (
    <div style={{ padding: 20, border: '1px solid #ccc' }}>
      <h3>Prototype: {state.name}</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing...' : 'Test Action'}
      </button>
    </div>
  )
}
```

### Algorithm Testing

```typescript
// algorithm-prototype.ts
function prototypeAlgorithm(input: number[]): {
  result: number[]
  metrics: {
    iterations: number
    comparisons: number
    timeMs: number
  }
} {
  const start = performance.now()
  let iterations = 0
  let comparisons = 0

  // Prototype algorithm implementation
  const result = [...input]

  for (let i = 0; i < result.length; i++) {
    iterations++
    for (let j = i + 1; j < result.length; j++) {
      comparisons++
      if (result[i] > result[j]) {
        ;[result[i], result[j]] = [result[j], result[i]]
      }
    }
  }

  return {
    result,
    metrics: {
      iterations,
      comparisons,
      timeMs: performance.now() - start
    }
  }
}

// Test with sample data
const testData = Array.from({ length: 100 }, () => Math.random() * 1000)
const output = prototypeAlgorithm(testData)
console.log('Metrics:', output.metrics)
```

### Testing & Validation

```typescript
// prototype-test.ts
Deno.test('Prototype validation', async (t) => {
  await t.step('performance baseline', () => {
    const start = performance.now()
    const result = prototypeFunction(testInput)
    const duration = performance.now() - start

    assert(duration < 100, `Too slow: ${duration}ms`)
    assertEquals(result.length, expectedLength)
  })

  await t.step('edge cases', () => {
    assertDoesNotThrow(() => prototypeFunction([]))
    assertDoesNotThrow(() => prototypeFunction(null))
  })
})
```

## Deliverables

Each prototype includes:

### 1. Working Code

- Minimal functional implementation
- Core feature demonstration
- Basic error handling
- Sample data/test cases

### 2. Documentation

````markdown
# Prototype: [Feature Name]

## Status

✅ **Working** | ⏱️ **Built in:** X hours | 📦 **Dependencies:** [list]

## What Works

- ✅ Core functionality
- ✅ Basic validation
- ✅ Sample integration

## Limitations

- ⚠️ No authentication
- ⚠️ In-memory storage
- ⚠️ Single-user only

## Performance

- **Throughput:** X ops/sec
- **Response time:** Y ms
- **Memory usage:** Z MB

## Quick Start

```bash
# Setup and run
cd prototype-dir
[install command]
[run command]

# Test the feature
curl -X POST http://localhost:8000/api/test
```
````

## Next Steps

1. Add authentication
2. Implement persistence
3. Handle edge cases
4. Add monitoring

## Key Insights

- [Technical discovery 1]
- [Performance characteristic 2]
- [Integration complexity 3]

```

### 3. Test Results
- Performance benchmarks
- Functional validation
- Integration test results

## Common Prototype Types

- **API Endpoints**: REST/GraphQL with mock data
- **CLI Tools**: Basic functionality with core commands
- **Data Pipelines**: Stream processing and transformation
- **Auth Flows**: Login, registration, token validation
- **Real-time Features**: WebSocket connections, live updates
- **Background Jobs**: Queue processing, scheduled tasks
- **Third-party Integration**: API connections, webhooks
- **UI Components**: Interactive elements, form handling

## Best Practices

### Do
- ✅ Start with minimal viable implementation
- ✅ Use familiar technologies for speed
- ✅ Mock external dependencies
- ✅ Document assumptions and limitations
- ✅ Measure key performance metrics
- ✅ Focus on core use case only

### Don't
- ❌ Spend time on edge cases
- ❌ Over-engineer the solution
- ❌ Add complex configuration
- ❌ Worry about production readiness
- ❌ Perfect the code quality initially
- ❌ Build comprehensive error handling
```
