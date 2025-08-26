---
allowed-tools: Bash(*), Read(*), Grep(*), Task(*), WebSearch(*)
description: Generate accurate project time estimates using historical data and ML patterns
argument-hint: [task-description]
---

# Estimate

Generate accurate project time estimates using historical data, velocity tracking, and pattern recognition

## Purpose

This command analyzes past commits, PR completion times, code complexity metrics, and team performance to provide accurate task estimates. It helps teams move beyond gut-feel estimates to data-backed predictions.

## Features

- 📊 Historical data analysis from git and project management tools
- 🤖 Machine learning-based prediction models
- 👥 Individual and team velocity tracking
- 📈 Complexity metrics and pattern recognition
- 🎯 Confidence intervals and risk assessment
- 📝 Detailed breakdown and recommendations

## Usage

```bash
# Estimate a specific JavaScript/TypeScript task
claude "Estimate task: Implement OAuth2 login flow with Google in React"

# Analyze historical accuracy of estimates
claude "Show estimation accuracy for the last 10 sprints"

# Estimate TypeScript refactoring effort
claude "Estimate effort for refactoring src/api/users.ts to use async/await"

# Get team member specific estimates for React components
claude "How long would it take Alice to implement the payment webhook handler in Node.js?"
```

## Instructions

### 1. Gather Historical Data

Collect data from git history and Linear:

```bash
# Get commit history with timestamps and authors
git log --pretty=format:"%h|%an|%ad|%s" --date=iso --since="6 months ago" > commit_history.txt

# Analyze PR completion times
gh pr list --state closed --limit 100 --json number,title,createdAt,closedAt,additions,deletions,files

# Get file change frequency
git log --pretty=format: --name-only --since="6 months ago" | sort | uniq -c | sort -rn

# Analyze commit patterns by author
git shortlog -sn --since="6 months ago"
```

### 2. Calculate JavaScript/TypeScript Code Complexity Metrics

Analyze code characteristics:

```typescript
interface CodeMetrics {
  lines: number
  cyclomaticComplexity: number
  dependencies: number
  testCoverage: number
  typeScriptComplexity?: number
  reactComponentComplexity?: number
  similarFiles: string[]
}

function analyzeComplexity(filePath: string): CodeMetrics {
  const metrics: CodeMetrics = {
    lines: 0,
    cyclomaticComplexity: 0,
    dependencies: 0,
    testCoverage: 0,
    similarFiles: []
  }

  // Count lines of code
  const content = readFile(filePath)
  metrics.lines = content.split('\n').length

  // Cyclomatic complexity (JavaScript/TypeScript specific)
  const conditions = content.match(
    /if\s*\(|while\s*\(|for\s*\(|case\s+|\?\s*:|&&|\|\||catch\s*\(/g
  )
  metrics.cyclomaticComplexity = (conditions?.length || 0) + 1

  // Count ES6 imports and CommonJS requires
  const imports = content.match(/import.*from|require\(/g)
  metrics.dependencies = imports?.length || 0

  // TypeScript specific complexity
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const typeDefinitions = content.match(/interface|type\s+\w+\s*=|enum/g)
    metrics.typeScriptComplexity = typeDefinitions?.length || 0
  }

  // React component complexity
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    const hooks = content.match(/use[A-Z]\w+\(/g)
    const components = content.match(
      /function\s+[A-Z]\w+|const\s+[A-Z]\w+\s*=/g
    )
    metrics.reactComponentComplexity =
      (hooks?.length || 0) + (components?.length || 0)
  }

  // Find similar files by structure
  metrics.similarFiles = findSimilarFiles(filePath)

  return metrics
}
```

### 3. Build Estimation Models

#### Time-Based Estimation

```javascript
class HistoricalEstimator {
  constructor(gitData, linearData) {
    this.gitData = gitData
    this.linearData = linearData
    this.authorVelocity = new Map()
    this.fileTypeMultipliers = new Map()
  }

  calculateAuthorVelocity(author) {
    const authorCommits = this.gitData.filter((c) => c.author === author)
    const taskCompletions = this.linearData.filter(
      (t) => t.assignee === author && t.completedAt
    )

    // Lines of code per day
    const totalLines = authorCommits.reduce(
      (sum, c) => sum + c.additions + c.deletions,
      0
    )
    const totalDays = this.calculateWorkDays(authorCommits)
    const linesPerDay = totalLines / totalDays

    // Story points per sprint
    const pointsCompleted = taskCompletions.reduce(
      (sum, t) => sum + (t.estimate || 0),
      0
    )
    const sprintCount = this.countSprints(taskCompletions)
    const pointsPerSprint = pointsCompleted / sprintCount

    return {
      linesPerDay,
      pointsPerSprint,
      averageTaskDuration: this.calculateAverageTaskDuration(taskCompletions),
      accuracy: this.calculateEstimateAccuracy(taskCompletions)
    }
  }

  estimateTask(description, assignee = null) {
    // Extract key features from description
    const features = this.extractFeatures(description)

    // Find similar completed tasks
    const similarTasks = this.findSimilarTasks(features)

    // Base estimate from similar tasks
    let baseEstimate = this.calculateMedianEstimate(similarTasks)

    // Adjust for complexity indicators
    const complexityMultiplier = this.calculateComplexityMultiplier(features)
    baseEstimate *= complexityMultiplier

    // Adjust for assignee if specified
    if (assignee) {
      const velocity = this.calculateAuthorVelocity(assignee)
      const teamAvgVelocity = this.calculateTeamAverageVelocity()
      const velocityRatio = velocity.pointsPerSprint / teamAvgVelocity
      baseEstimate *= 2 - velocityRatio // Faster devs get lower estimates
    }

    // Add confidence interval
    const confidence = this.calculateConfidence(similarTasks.length, features)

    return {
      estimate: Math.round(baseEstimate),
      confidence,
      range: {
        min: Math.round(baseEstimate * 0.7),
        max: Math.round(baseEstimate * 1.5)
      },
      basedOn: similarTasks.slice(0, 3),
      factors: this.explainFactors(features, complexityMultiplier)
    }
  }
}
```

#### Pattern Recognition

```javascript
function extractFeatures(taskDescription) {
  const features = {
    keywords: [],
    fileTypes: [],
    modules: [],
    complexity: 'medium',
    type: 'feature', // feature, bug, refactor, etc.
    hasTests: false,
    hasUI: false,
    hasAPI: false,
    hasDatabase: false
  }

  // Keywords that indicate complexity in JavaScript/TypeScript projects
  const complexityKeywords = {
    high: [
      'refactor',
      'migrate',
      'redesign',
      'optimize',
      'architecture',
      'webpack',
      'typescript migration',
      'redux'
    ],
    medium: [
      'implement',
      'add',
      'create',
      'update',
      'integrate',
      'react component',
      'api endpoint',
      'state management'
    ],
    low: [
      'fix',
      'adjust',
      'tweak',
      'change',
      'modify',
      'style',
      'css',
      'prop types'
    ]
  }

  // Detect task type
  if (taskDescription.match(/bug|fix|repair|broken/i)) {
    features.type = 'bug'
  } else if (taskDescription.match(/refactor|cleanup|optimize/i)) {
    features.type = 'refactor'
  } else if (taskDescription.match(/test|spec|coverage/i)) {
    features.type = 'test'
  }

  // Detect components
  features.hasUI = /UI|frontend|component|view|page/i.test(taskDescription)
  features.hasAPI = /API|endpoint|route|REST|GraphQL/i.test(taskDescription)
  features.hasDatabase = /database|DB|migration|schema|query/i.test(
    taskDescription
  )
  features.hasTests = /test|spec|TDD|coverage/i.test(taskDescription)

  // Extract JavaScript/TypeScript file types mentioned
  const fileTypeMatches = taskDescription.match(
    /\.(js|ts|jsx|tsx|mjs|cjs|json|css|scss|less|module\.css)/g
  )
  if (fileTypeMatches) {
    features.fileTypes = [...new Set(fileTypeMatches)]
  }

  // Detect JavaScript/TypeScript frameworks
  features.hasReact = /React|JSX|component|hooks?/i.test(taskDescription)
  features.hasVue = /Vue|SFC|composition API/i.test(taskDescription)
  features.hasAngular = /Angular|directive|service|pipe/i.test(taskDescription)
  features.hasNode = /Node|Express|Fastify|NestJS|backend/i.test(
    taskDescription
  )

  return features
}
```

### 4. Velocity Tracking

Track team and individual performance:

```javascript
class VelocityTracker {
  async analyzeVelocity(timeframe = '3 months') {
    // Get completed tasks with estimates and actual time
    const completedTasks = await this.getCompletedTasks(timeframe)

    const analysis = {
      team: {
        plannedPoints: 0,
        completedPoints: 0,
        averageVelocity: 0,
        velocityTrend: [],
        estimateAccuracy: 0
      },
      individuals: new Map(),
      taskTypes: new Map()
    }

    // Group by sprint
    const tasksBySprint = this.groupBySprint(completedTasks)

    for (const [sprint, tasks] of tasksBySprint) {
      const sprintVelocity = tasks.reduce(
        (sum, t) => sum + (t.estimate || 0),
        0
      )
      const sprintActual = tasks.reduce(
        (sum, t) => sum + (t.actualPoints || t.estimate || 0),
        0
      )

      analysis.team.velocityTrend.push({
        sprint,
        planned: sprintVelocity,
        actual: sprintActual,
        accuracy: sprintVelocity ? sprintActual / sprintVelocity : 1
      })
    }

    // Individual velocity
    const tasksByAssignee = this.groupBy(completedTasks, 'assignee')
    for (const [assignee, tasks] of tasksByAssignee) {
      analysis.individuals.set(assignee, {
        tasksCompleted: tasks.length,
        pointsCompleted: tasks.reduce((sum, t) => sum + (t.estimate || 0), 0),
        averageAccuracy: this.calculateAccuracy(tasks),
        strengths: this.identifyStrengths(tasks)
      })
    }

    return analysis
  }
}
```

### 5. Machine Learning Estimation

Use historical patterns for prediction:

```javascript
class MLEstimator {
  trainModel(historicalTasks) {
    // Feature extraction
    const features = historicalTasks.map((task) => ({
      // Text features
      titleLength: task.title.length,
      descriptionLength: task.description.length,
      hasAcceptanceCriteria: task.description.includes('Acceptance'),

      // Code features
      filesChanged: task.linkedPR?.filesChanged || 0,
      linesAdded: task.linkedPR?.additions || 0,
      linesDeleted: task.linkedPR?.deletions || 0,

      // Task features
      labels: task.labels.length,
      hasDesignDoc: task.attachments?.some((a) => a.title.includes('design')),
      dependencies: task.blockedBy?.length || 0,

      // Historical features
      assigneeAvgVelocity: this.getAssigneeVelocity(task.assignee),
      teamLoad: this.getTeamLoad(task.createdAt),

      // Target
      actualEffort: task.actualPoints || task.estimate
    }))

    // Simple linear regression (in practice, use a proper ML library)
    return this.fitLinearModel(features)
  }

  predict(taskDescription, context) {
    const features = this.extractTaskFeatures(taskDescription, context)
    const prediction = this.model.predict(features)

    // Add uncertainty based on feature similarity
    const similarityScore = this.calculateSimilarity(features)
    const uncertainty = 1 - similarityScore

    return {
      estimate: Math.round(prediction),
      confidence: similarityScore,
      breakdown: this.explainPrediction(features, prediction)
    }
  }
}
```

### 6. Estimation Report Format

```markdown
## Task Estimation Report

**Task:** Implement OAuth2 login flow with Google
**Date:** 2024-01-15

### Estimate: 5 Story Points (±2)

**Confidence:** 78%
**Estimated Hours:** 15-25 hours

### Analysis Breakdown

#### Similar Completed Tasks:

1. "Implement GitHub OAuth integration" - 5 points (actual: 6)
2. "Add Facebook login" - 4 points (actual: 4)
3. "Setup SAML SSO" - 8 points (actual: 7)

#### Complexity Factors:

- **Authentication Flow** (+1 point): OAuth2 requires multiple redirects
- **External API** (+1 point): Google API integration
- **Security** (+1 point): Token storage and validation
- **Testing** (-0.5 points): Similar tests already exist

#### Historical Data:

- Team average for auth features: 4.8 points
- Last 5 auth tasks accuracy: 85%
- Assignee velocity: 1.2x team average

#### Risk Factors:

⚠️ Google API changes frequently
⚠️ No existing OAuth2 infrastructure
✅ Team has OAuth experience
✅ Good documentation available

### Recommendations:

1. Allocate 1 point for initial Google API setup
2. Include time for security review
3. Plan for integration tests with mock OAuth server
4. Consider pairing with team member who did GitHub OAuth

### Sprint Planning:

- Can be completed in one sprint
- Best paired with other auth-related tasks
- Should not be last task in sprint (risk buffer)
```

### 7. Error Handling

```javascript
// Handle missing historical data
if (historicalTasks.length < 10) {
  console.warn('Limited historical data. Estimates may be less accurate.')
  // Fall back to rule-based estimation
}

// Handle new types of work
const similarity = findSimilarTasks(description)
if (similarity.maxScore < 0.5) {
  console.warn(
    'This appears to be a new type of task. Using conservative estimate.'
  )
  // Apply uncertainty multiplier
}

// Handle missing Linear connection
if (!linear.available) {
  console.log('Using git history only for estimation')
  // Use git-based estimation
}
```

## Example Output

```
Analyzing task: "Refactor user authentication to use JWT tokens"

📊 Historical Analysis:
- Found 23 similar authentication tasks
- Average completion: 4.2 story points
- Accuracy rate: 82%

🧮 Estimation Calculation:
Base estimate: 4 points (from similar tasks)
Adjustments:
  +1 point - Refactoring (higher complexity)
  +0.5 points - Security implications
  -0.5 points - Existing test coverage

Final estimate: 5 story points

📈 Confidence Analysis:
- High similarity to previous tasks (85%)
- Good historical data (23 samples)
- Confidence: 78%

👥 Team Insights:
- Alice: Completed 3 similar tasks (avg 4.3 points)
- Bob: Strong in refactoring (20% faster than average)
- Recommended assignee: Bob

⏱️ Time Estimates:
- Optimistic: 12 hours (3 points)
- Realistic: 20 hours (5 points)
- Pessimistic: 32 hours (8 points)

📝 Breakdown:
1. Analyze current auth system (0.5 points)
2. Design JWT token structure (0.5 points)
3. Implement JWT service (1.5 points)
4. Refactor auth middleware (1.5 points)
5. Update tests and documentation (1 point)
```

## Integration Points

### Git Integration

- Analyze commit frequency and patterns
- Track file change velocity
- Measure PR cycle times
- Identify code hotspots

### Project Management Tools

- Project management system integration
- Story point tracking
- Sprint velocity analysis
- Team capacity planning

### Code Analysis

- Cyclomatic complexity calculation
- Dependency analysis
- Test coverage impact
- Technical debt assessment

## Estimation Confidence Levels

| Confidence       | Criteria                          | Variance |
| ---------------- | --------------------------------- | -------- |
| High (90%+)      | >20 similar tasks, stable team    | ±15%     |
| Medium (70-89%)  | 5-20 similar tasks, some unknowns | ±30%     |
| Low (50-69%)     | <5 similar tasks, new domain      | ±50%     |
| Uncertain (<50%) | No historical data, high risk     | ±100%    |

## Tips

- Maintain historical data for at least 6 months
- Re-calibrate estimates after each sprint
- Track actual vs estimated for continuous improvement
- Consider external factors (holidays, team changes)
- Use pair programming multipliers for complex tasks
- Document assumptions in estimates
- Review estimates in retros
- Account for meetings and context switching (usually 60-70% coding time)
- Include buffer for code review and testing
- Factor in documentation and deployment time
