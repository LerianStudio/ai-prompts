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

---

You are a database architect specializing in schema analysis, query optimization, and performance tuning. Identify database issues and create optimization roadmap.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #3 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/2-API_CONTRACT_ANALYSIS.md` if they exist
- Use architectural data layer components identified in previous analysis
- Reference API contract requirements for database performance
- Align database optimization with API endpoint performance requirements

**Output Review:**
- If `docs/code-review/3-DATABASE_ANALYSIS.md` already exists:
  1. Read and analyze the existing output first
  2. Cross-reference with architectural and API changes from prompts 0-2
  3. Update database optimization for new schema changes
  4. Verify index recommendations are still relevant
  5. Add database considerations for API performance requirements

**Chain Coordination:**
- Store findings in memory MCP with tags: `["database", "performance", "optimization", "prompt-3"]`
- Focus database analysis on data models identified in architectural analysis
- Optimize database performance for API endpoints identified in prompt #2
- Create database optimization foundation for subsequent security and business analysis

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

## 1. Database Discovery

### Find Database Types & Connections

```bash
# Detect database systems
grep -r "DATABASE_URL\|DB_HOST\|connection" --include="*.{js,ts,go,py,env,yml}" .
grep -r "postgres\|mysql\|mongodb\|redis\|sqlite" --include="*.{js,ts,go,py}" .

# Find ORM/libraries
grep -r "sequelize\|typeorm\|prisma\|mongoose\|gorm\|sqlalchemy" --include="*.{js,ts,go,py}" .

# Check connection pooling
grep -r "pool\|maxConnections\|connectionLimit" --include="*.{js,ts,go,py,yml}" .
```

## 2. Schema Analysis

### Extract Table Structure

```bash
# Find migrations and schema files
find . -path "*/migrations/*" -name "*.sql" -o -name "*.js" -o -name "*.ts" | head -10
grep -r "CREATE TABLE\|ALTER TABLE" --include="*.sql" .

# Find model definitions
grep -r "Schema\|Model\|Entity" --include="*.{js,ts,go,py}" . | head -10
```

### Schema Health Check

```bash
# Find missing foreign key constraints
grep -r "References\|REFERENCES\|belongsTo\|hasMany" --include="*.{js,ts,sql}" .

# Check for data types inconsistencies
grep -r "VARCHAR\|TEXT\|INTEGER\|DECIMAL" --include="*.sql" . | head -10
```

## 3. Performance Analysis

### Find Slow Queries

```bash
# Identify N+1 query patterns
grep -r "forEach.*await.*find\|map.*await.*query" --include="*.{js,ts}" .

# Find complex queries
grep -r "SELECT.*JOIN.*JOIN\|GROUP BY\|ORDER BY.*LIMIT" --include="*.{sql,js,ts}" .

# Check for SELECT * usage
grep -r "SELECT \*\|select \*" --include="*.{sql,js,ts}" .
```

### Missing Index Detection

```bash
# Find WHERE clauses without indexes
grep -r "WHERE.*=" --include="*.{sql,js,ts}" . | grep -v "id.*=" | head -10

# Find JOIN operations
grep -r "JOIN\|join" --include="*.{sql,js,ts}" . | head -10
```

## 4. Generate Database Report

### Create Optimization Assessment

````bash
cat > docs/code-review/3-DATABASE_ANALYSIS.md << 'EOF'
# Database Analysis

## Executive Summary
**Health Score**: [A-F Grade]
**Critical Issues**: [count]
**Missing Indexes**: [count]
**Slow Queries**: [count]
**Optimization Potential**: [X]% performance improvement

## Critical Findings

### 🔴 IMMEDIATE ACTION REQUIRED
- [ ] [X] missing indexes on foreign keys
- [ ] [Y] N+1 query patterns found
- [ ] [Z] queries without pagination

### 🟡 HIGH PRIORITY
- [ ] [A] tables missing constraints
- [ ] [B] denormalization opportunities
- [ ] [C] connection pooling not configured

## Schema Analysis

### Table Overview
| Table | Rows | Size | Indexes | Issues |
|-------|------|------|---------|--------|
| users | [count] | [size] | [count] | Missing created_at index |
| orders | [count] | [size] | [count] | No foreign key index |

### Missing Indexes (Critical)
```sql
-- Add these immediately
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_users_created_at ON users(created_at);
````

## Performance Issues

### N+1 Query Problems

```javascript
// ❌ Bad: N+1 pattern (found in [X] files)
const users = await User.findAll();
for (const user of users) {
  const orders = await Order.findByUserId(user.id);
  user.orders = orders;
}

// ✅ Fixed: Single query with JOIN
const users = await User.findAll({
  include: [{ model: Order, as: "orders" }],
});
```

### Slow Query Optimization

```sql
-- ❌ Current slow query (850ms)
SELECT * FROM orders
WHERE user_id = ? AND status = ?
ORDER BY created_at DESC;

-- ✅ Optimized with index (45ms)
-- Requires: CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);
```

## Data Integrity Issues

### Missing Constraints

```sql
-- Add data validation
ALTER TABLE products
ADD CONSTRAINT check_positive_price CHECK (price > 0),
ADD CONSTRAINT check_positive_stock CHECK (stock >= 0);

ALTER TABLE orders
ADD CONSTRAINT check_valid_status
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));
```

### Orphaned Records

```sql
-- Check for orphaned data
SELECT COUNT(*) FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Clean up and add constraint
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
ALTER TABLE order_items ADD FOREIGN KEY (order_id) REFERENCES orders(id);
```

## Optimization Roadmap

### Phase 1: Critical Performance (Week 1)

#### 1. Add Missing Indexes

```sql
-- Script: add_critical_indexes.sql
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_products_category ON products(category_id);
```

**Impact**: 80-90% query performance improvement
**Risk**: Low (concurrent creation)

#### 2. Implement Connection Pooling

```javascript
// db/pool.js
const { Pool } = require("pg");

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

**Impact**: Handle 10x concurrent connections
**Risk**: Low

### Phase 2: Data Integrity (Week 2-3)

#### 1. Add Constraints

- Check constraints for data validation
- Foreign key constraints for referential integrity
- NOT NULL constraints where appropriate

#### 2. Fix N+1 Patterns

```javascript
// Fix service layer queries
class OrderService {
  async getUserOrders(userId) {
    // Single query instead of N+1
    return Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, include: [Product] }],
    });
  }
}
```

### Phase 3: Scalability (Month 2)

#### 1. Table Partitioning

```sql
-- Partition large tables by date
CREATE TABLE orders_partitioned (LIKE orders INCLUDING ALL)
PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### 2. Query Optimization

- Add composite indexes for complex queries
- Implement query result caching
- Optimize full-text search with GIN indexes

## Monitoring Setup

### Database Health Metrics

```sql
-- Monitor query performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 10;

-- Check connection usage
SELECT count(*) as connections,
       state,
       application_name
FROM pg_stat_activity
GROUP BY state, application_name;
```

### Automated Monitoring

```javascript
// scripts/db-monitor.js
class DatabaseMonitor {
  async checkPerformance() {
    const slowQueries = await db.query(`
      SELECT query, mean_time, calls 
      FROM pg_stat_statements 
      WHERE mean_time > 100
      ORDER BY mean_time DESC
    `);

    return {
      slowQueryCount: slowQueries.length,
      avgQueryTime:
        slowQueries.reduce((sum, q) => sum + q.mean_time, 0) /
        slowQueries.length,
    };
  }

  async checkConnections() {
    const result = await db.query(
      "SELECT count(*) as active FROM pg_stat_activity"
    );
    return { activeConnections: result[0].active };
  }
}

module.exports = DatabaseMonitor;
```

## Cost-Benefit Analysis

| Optimization       | Effort  | Performance Gain     | Cost Savings | Priority |
| ------------------ | ------- | -------------------- | ------------ | -------- |
| Add indexes        | 1 day   | 80% faster queries   | $500/month   | P0       |
| Connection pooling | 4 hours | 10x concurrency      | $1000/month  | P0       |
| Fix N+1 queries    | 3 days  | 90% faster APIs      | $800/month   | P1       |
| Table partitioning | 1 week  | 60% faster reporting | $300/month   | P2       |

## Immediate Actions

### Week 1

1. 🚨 **Add missing indexes**

   ```bash
   psql -f scripts/add_critical_indexes.sql
   ```

2. 🚨 **Implement connection pooling**

   ```bash
   npm install pg
   # Update database configuration
   ```

3. 🚨 **Fix top 3 N+1 patterns**
   - User orders query
   - Product categories query
   - Order items query

### Week 2-4

1. **Add data constraints**
2. **Implement query monitoring**
3. **Set up automated performance alerts**
4. **Create database backup strategy**

## Success Metrics

- P95 query latency: < 100ms (current: 450ms)
- Database connection efficiency: > 80%
- Slow query count: < 5 (current: 23)
- Index usage ratio: > 95%

EOF

# Create monitoring script

cat > scripts/db-monitor.js << 'EOF'
#!/usr/bin/env node

const { Pool } = require('pg');

class DatabaseMonitor {
constructor() {
this.pool = new Pool({
connectionString: process.env.DATABASE_URL
});
}

async checkHealth() {
try {
const slowQueries = await this.pool.query(`        SELECT query, mean_time, calls 
        FROM pg_stat_statements 
        WHERE mean_time > 100 
        ORDER BY mean_time DESC 
        LIMIT 5
     `);

      const connections = await this.pool.query(`
        SELECT count(*) as active
        FROM pg_stat_activity
        WHERE state = 'active'
      `);

      const indexUsage = await this.pool.query(`
        SELECT schemaname, tablename,
               100 * idx_tup_fetch / (seq_tup_read + idx_tup_fetch) as index_usage_pct
        FROM pg_stat_user_tables
        WHERE (seq_tup_read + idx_tup_fetch) > 0
        ORDER BY index_usage_pct ASC
        LIMIT 5
      `);

      const report = {
        timestamp: new Date().toISOString(),
        slowQueries: slowQueries.rows.length,
        activeConnections: connections.rows[0].active,
        lowIndexUsage: indexUsage.rows.filter(r => r.index_usage_pct < 95),
        status: this.calculateHealthStatus(slowQueries.rows.length, connections.rows[0].active)
      };

      console.log('Database Health Report:', JSON.stringify(report, null, 2));
      return report;

    } catch (error) {
      console.error('Database health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }

}

calculateHealthStatus(slowQueries, activeConnections) {
if (slowQueries > 10 || activeConnections > 80) return 'CRITICAL';
if (slowQueries > 5 || activeConnections > 50) return 'WARNING';
return 'HEALTHY';
}

async close() {
await this.pool.end();
}
}

if (require.main === module) {
const monitor = new DatabaseMonitor();
monitor.checkHealth().then(() => monitor.close());
}

module.exports = DatabaseMonitor;
EOF

chmod +x scripts/db-monitor.js

```

```

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
