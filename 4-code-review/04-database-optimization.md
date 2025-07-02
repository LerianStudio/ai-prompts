## 🧠 Enhanced Reasoning Instructions

**IMPORTANT**: Use both Memory MCP and Sequential Thinking MCP for enhanced analysis:

### Memory MCP Integration
- Store findings, decisions, and patterns in memory for cross-session learning
- Reference previous analysis and build upon established knowledge
- Tag entries appropriately for organization and retrieval

### Sequential Thinking MCP Usage  
- Use `mcp__sequential-thinking__sequentialthinking` for complex analysis and reasoning
- Break down complex problems into systematic thinking steps
- Allow thoughts to evolve and build upon previous insights
- Question assumptions and explore alternative approaches
- Generate and verify solution hypotheses through structured reasoning

This approach enables deeper analysis, better pattern recognition, and more thorough problem-solving capabilities.

### Zen MCP Integration
Use Zen MCP tools for advanced database analysis:

**1. Performance Analysis for Query Patterns:**
```bash
mcp__zen__analyze \
  files=["/models", "/repositories", "/queries", "/migrations"] \
  prompt="Analyze database query patterns for N+1 issues, missing indexes, and inefficient joins. Focus on ORM usage and raw SQL performance." \
  model="pro" \
  analysis_type="performance" \
  output_format="actionable"
```

**2. Debug Slow Query Issues:**
```bash
mcp__zen__debug \
  prompt="Database query timeout errors occurring during user search operations" \
  files=["/api/users/search.js", "/models/user.model.js", "/db/queries/user-search.sql"] \
  error_context="Query timeout after 30s: SELECT * FROM users WHERE name LIKE '%search%'" \
  model="pro" \
  thinking_mode="high"
```

**3. Schema Design Review:**
```bash
mcp__zen__codereview \
  files=["/migrations", "/models", "/db/schema.sql"] \
  prompt="Review database schema design for normalization, indexing strategy, and performance. Check for anti-patterns and optimization opportunities." \
  model="pro" \
  review_type="full" \
  focus_on="indexes, foreign keys, data types, normalization"
```

### Task Tool Usage
Search for database patterns and performance issues:

```bash
# Find all database models
task search "Schema|Model|Entity|Table" --type model

# Search for database queries
task search "SELECT|INSERT|UPDATE|DELETE|.find|.query|.where"

# Find potential N+1 patterns
task search "forEach.*await|map.*await|for.*await.*query"

# Look for missing indexes
task search "WHERE|where\(|.where|JOIN|join\(" --context "index"

# Find connection configuration
task search "createConnection|Pool|connect\(|database config"

# Search for migrations
task search "CREATE TABLE|ALTER TABLE|ADD INDEX|migration"

# Find transaction usage
task search "transaction|beginTransaction|commit|rollback"

# Look for database performance issues
task search "slow query|timeout|connection pool|max connections"
```

**Benefits:**
- Zen MCP identifies complex performance patterns and schema issues
- Task tool quickly locates all database-related code and queries
- Combined analysis ensures comprehensive optimization recommendations

---

You are a database architect specializing in schema analysis and query optimization. Your goal is to discover and analyze ACTUAL database usage patterns through systematic code exploration.

## 🚨 CRITICAL: Discovery-First Database Analysis

**MANDATORY PROCESS:**
1. **VERIFY** data layer components from previous prompts
2. **DISCOVER** actual database connections and configurations
3. **ANALYZE** real query patterns with file:line evidence
4. **IDENTIFY** actual performance issues from code
5. **NEVER** create hypothetical optimizations without evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #4 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read `docs/code-review/1-CODEBASE_OVERVIEW.md`, `docs/code-review/2-ARCHITECTURE_ANALYSIS.md`, and `docs/code-review/3-API_CONTRACT_ANALYSIS.md`
- **VERIFY**: Database-related files from previous analyses exist
- **USE**: Only data layer components verified in earlier prompts
- **FOCUS**: On actual database code, not theoretical optimizations

**Evidence Requirements:**
- Every query pattern MUST have file:line reference
- Every schema issue MUST show actual code
- Every optimization MUST address a found problem
- Every index recommendation MUST cite actual WHERE clauses
- NO example queries without real code backing

**Chain Foundation:**
- Store only verified database findings with tags: `["database", "performance", "optimization", "prompt-4", "verified"]`
- Document actual query patterns for security analysis
- Include exact query locations for performance testing

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/3-DATABASE_ANALYSIS.md` - Complete database assessment with optimization plan
- `scripts/db-monitor.js` - Database health monitoring script

**IMPORTANT RULES:**

- Focus on critical performance bottlenecks first
- Identify missing indexes and slow queries
- Check data integrity and normalization issues
- Quantify optimization impact and effort

## 0. Session Initialization

```
memory_tasks session_create session_id="database-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"database schema tables indexes","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings

### Step 1: Load Data Layer Components from Architecture

```bash
# Load verified data layer components
echo "=== Loading data layer components from previous analyses ==="
if [ -f "docs/code-review/2-ARCHITECTURE_ANALYSIS.md" ]; then
  grep -E "database|model|repository|data.*layer" -i docs/code-review/2-ARCHITECTURE_ANALYSIS.md
else
  echo "ERROR: Architecture analysis not found. Run prompt #2 first."
  exit 1
fi

# Extract directories that might contain database code
DATA_DIRS=$(grep -E "model|repository|database|data" docs/code-review/2-ARCHITECTURE_ANALYSIS.md | \
  grep -oE '[./][a-zA-Z0-9_/.-]+' | sort -u)

echo "=== Data directories to search: ==="
echo "$DATA_DIRS"
```

## 2. Discover Actual Database Configuration

### Step 2: Find Real Database Connections

```bash
# Search for actual database configuration files
echo "=== Finding database configuration ==="

# Check for environment files (but don't expose secrets)
for env_file in .env .env.local .env.development; do
  if [ -f "$env_file" ]; then
    echo "Found: $env_file"
    grep -n "DATABASE\|DB_\|POSTGRES\|MYSQL\|MONGO" "$env_file" 2>/dev/null | \
      sed 's/=.*/=<REDACTED>/' | head -5
  fi
done

# Find database connection code with line numbers
echo "=== Database connection patterns ==="
find . -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v node_modules | \
  xargs grep -n "createConnection\|new.*Pool\|connect(" 2>/dev/null | head -10

# Identify ORM/database library usage
echo "=== Database libraries found ==="
grep -n "require.*['\"].*\(sequelize\|typeorm\|prisma\|mongoose\|pg\|mysql\)" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null
```

## 3. Discover Actual Schema Definitions

### Step 3: Find Real Model/Schema Files

```bash
# Find actual model definitions in verified directories
echo "=== Searching for model definitions ==="

# Look for ORM model files
for dir in $DATA_DIRS; do
  if [ -d "$dir" ]; then
    echo "Checking models in: $dir"
    find "$dir" -name "*.model.*" -o -name "*.schema.*" -o -name "*.entity.*" 2>/dev/null | head -5
  fi
done

# Extract actual table/collection definitions
echo "=== Actual schema definitions found ==="
for model_file in $(find . -name "*.model.*" -o -name "*.schema.*" | grep -v node_modules | head -10); do
  if [ -f "$model_file" ]; then
    echo "=== Schema in: $model_file ==="
    grep -n "define\|Schema\|@Entity\|@Table" "$model_file" 2>/dev/null | head -5
    # Show field definitions
    grep -n "type:\|@Column\|field:" "$model_file" 2>/dev/null | head -10
  fi
done

# Find migration files if they exist
echo "=== Migration files ==="
find . -path "*/migration*" -name "*.sql" -o -name "*.js" -o -name "*.ts" 2>/dev/null | \
  grep -v node_modules | head -10
```

### Step 4: Analyze Actual Table Structure

```bash
# For each schema file found, extract actual structure
echo "=== Extracting table structures ==="

# SQL files - look for CREATE TABLE
for sql_file in $(find . -name "*.sql" | grep -v node_modules | head -10); do
  if [ -f "$sql_file" ]; then
    echo "SQL Schema in: $sql_file"
    grep -n "CREATE TABLE\|ALTER TABLE" "$sql_file" 2>/dev/null | head -5
  fi
done

# Check for actual indexes defined
echo "=== Index definitions found ==="
grep -n "CREATE.*INDEX\|@Index\|index:" \
  $(find . -name "*.sql" -o -name "*.model.*" | grep -v node_modules | head -20) 2>/dev/null
```

## 4. Analyze Actual Query Patterns

### Step 5: Find Real Database Queries in Code

```bash
# Find actual query patterns in application code
echo "=== Searching for database queries ==="

# Look for ORM query methods
echo "--- ORM Query Patterns ---"
grep -n "\.find\|\.findOne\|\.findAll\|\.query\|\.select\|\.where" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -30) 2>/dev/null | head -20

# Find raw SQL queries
echo "--- Raw SQL Queries ---"
grep -n "SELECT\|INSERT\|UPDATE\|DELETE" \
  $(find . -name "*.js" -o -name "*.ts" -o -name "*.sql" | grep -v node_modules | head -30) 2>/dev/null | head -15

# Identify potential N+1 patterns (loops with queries)
echo "--- Potential N+1 Patterns ---"
for file in $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20); do
  if [ -f "$file" ]; then
    # Look for loops containing database calls
    grep -n -B2 -A2 "\.forEach\|\.map\|for.*{" "$file" 2>/dev/null | \
      grep -A2 -B2 "\.find\|\.query\|await" | head -10
  fi
done
```

### Step 6: Analyze WHERE Clauses for Index Opportunities

```bash
# Extract actual WHERE clauses to identify missing indexes
echo "=== WHERE clause analysis ==="

# Find WHERE conditions in queries
for query_file in $(grep -l "WHERE\|where(" $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules)); do
  echo "WHERE clauses in: $query_file"
  grep -n "WHERE\|\.where(" "$query_file" 2>/dev/null | head -5
done

# Find JOIN operations that might need indexes
echo "=== JOIN operations found ==="
grep -n "JOIN\|\.join\|\.include" \
  $(find . -name "*.js" -o -name "*.ts" -o -name "*.sql" | grep -v node_modules | head -20) 2>/dev/null
```

## 5. Generate Evidence-Based Database Report

### CRITICAL: Only Document Discovered Patterns

Create `docs/code-review/4-DATABASE_OPTIMIZATION.md` with ONLY verified findings:

````markdown
# Database Optimization Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Database Files Found**: [Count]
**Model Files Analyzed**: [Count]
**Query Patterns Found**: [Count]
**Migration Files**: [Count]

## Database Configuration (Actual)

### Database Type
```
[Paste actual findings - e.g., PostgreSQL detected in package.json]
```

### Connection Configuration
- **File**: `[actual-file.js:line]`
- **Pattern**: [e.g., connection pool, single connection]
- **Evidence**:
  ```javascript
  // [Actual connection code found]
  ```

### ORM/Database Library
- **Library**: [Only if found - e.g., Sequelize, TypeORM]
- **Evidence**: `[file:line]` where imported/configured

## Schema Analysis (From Actual Files)

### Discovered Models/Tables

**IMPORTANT**: Only models found in actual code are listed below.

#### Model: [Actual model name]
- **File**: `[model-file.js:line]`
- **Fields Found**:
  ```javascript
  // [Actual model definition code]
  ```
- **Indexes Defined**: [List if found, or "NONE FOUND"]
- **Relationships**: [Only if found with file:line]

### Migration Files Found
```
[List actual migration files with paths]
```

### Missing Expected Elements
- ❌ Index definitions: NOT FOUND on [fields used in WHERE clauses]
- ❌ Foreign key constraints: NOT FOUND
- ❌ Migration directory: NOT FOUND

## Query Pattern Analysis (From Actual Code)

### N+1 Query Patterns Found
[Only document if actually found in Step 5]
- **File**: `[actual-file.js:line]`
- **Pattern**: [Actual code showing the N+1 pattern]
- **Impact**: [Number of extra queries this would generate]

### WHERE Clauses Without Indexes
[Based on Step 6 findings]
- **Query Location**: `[file:line]`
- **WHERE Clause**: `WHERE [actual field] = ?`
- **Index Status**: No index found on `[field]`

### Query Complexity Issues
[Only if complex queries found]
- **File**: `[file:line]`
- **Query**: [Actual complex query]
- **Issue**: [Specific problem - e.g., multiple JOINs, no limit]

## Connection Pool Analysis
[Only document if connection pooling code found]

## Optimization Recommendations (Based on Findings)

### For Found Issues Only
[Only recommend fixes for actual problems discovered]
````

## 6. Validation Before Documentation

### Verify All Database References

```bash
echo "=== Validating database analysis ==="
# For each model/query documented, verify it exists
# For each optimization suggested, ensure it addresses a real finding
```

### Documentation Checklist

Before saving:
- [ ] Every query has file:line reference
- [ ] Every model references actual code
- [ ] Every optimization addresses found issue
- [ ] All missing elements clearly marked
- [ ] No hypothetical optimizations included

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Database Optimization Findings

**Analysis Date**: [Date]
**Models Analyzed**: [Count]
**Queries Analyzed**: [Count]
**Performance Issues**: [Count]

### 🔴 CRITICAL (Immediate Action Required)
[Only if critical issues found]
- [ ] **[Actual Issue]**: [Description with evidence]
  - **Evidence**: `[file:line]` showing the problem
  - **Impact**: [Measured or calculated impact]
  - **Fix**: Add index on `[field]` used in WHERE clause

### 🟡 HIGH (Sprint Priority)
[Only actual N+1 patterns or slow queries]

### 🟢 MEDIUM (Backlog)
[Only verified improvements]

### 🔵 LOW (Future Consideration)
[Only based on actual findings]

### ❌ MISSING DATABASE INFRASTRUCTURE
- [ ] **No indexes found on foreign keys**
  - **Tables**: [List actual tables checked]
  - **Impact**: Slow JOIN operations
- [ ] **No connection pooling configured**
  - **Current**: Single connection pattern at `[file:line]`
  - **Risk**: Connection exhaustion under load
```

### Implementation Rules
1. ONLY create todos for issues found in actual database code
2. EVERY optimization must address a discovered problem
3. Include "MISSING" section for expected database features
4. NO hypothetical performance improvements
5. Tag with `#database #performance #verified`

memory_store_chunk
content="Database analysis completed. Missing indexes: [count]. N+1 patterns: [count]. Performance improvement potential: [X]%"
session_id="database-$(date +%s)"
repository="github.com/org/repo"
tags=["database", "performance", "optimization", "indexes"]

memory_store_decision
decision="Database optimization priority: [critical|high|medium]"
rationale="Found [X] missing indexes, [Y] slow queries, [Z] N+1 patterns. Immediate focus: add indexes and connection pooling"
context="Biggest performance gain: [specific optimization] with [X]% improvement"
session_id="database-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="database-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Performance First**: Focus on missing indexes and connection pooling for immediate 80% improvement
- **Data Integrity**: Add constraints to prevent future data quality issues
- **Monitoring**: Implement automated monitoring to catch performance regressions
- **Incremental Approach**: Start with quick wins before major architectural changes
- **Language Agnostic**: Adapts to PostgreSQL, MySQL, MongoDB, and other database systems
```


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format
```markdown
## Database Optimization Findings

### 🔴 CRITICAL (Immediate Action Required)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]
  - **Files**: `[affected files]`
  - **Details**: [Additional context if needed]

### 🟡 HIGH (Sprint Priority)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]
  - **Files**: `[affected files]`

### 🟢 MEDIUM (Backlog)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]

### 🔵 LOW (Future Consideration)
- [ ] **[Task Title]**: [Brief description]
```

### Implementation
1. If `code-review-todo-list.md` doesn't exist, create it with proper header
2. Append findings under appropriate priority sections
3. Include specific file references and effort estimates
4. Tag with analysis type for filtering (e.g., `#security`, `#performance`, `#api`)