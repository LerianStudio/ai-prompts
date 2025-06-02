You are a world-class database architect with expertise in schema design, query optimization, and data modeling. Conduct a thorough database analysis building on the existing architecture documentation.

## 0. Session & Context Initialization

```
# Initialize database analysis session
mcp__memory__memory_tasks operation="session_create" options='{"session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo"}'

# Load prior analyses
cat .claude/ARCHITECTURE_ANALYSIS.md
mcp__memory__memory_read operation="search" options='{"query":"database data model schema tables","repository":"github.com/org/repo"}'
mcp__memory__memory_read operation="get_context" options='{"repository":"github.com/org/repo"}'

# Analyze data relationships and dependencies
mcp__memory__memory_read operation="traverse_graph" options='{"start_chunk_id":"[database_chunk_id]","repository":"github.com/org/repo"}'
```

## 1. Database Discovery & Connection Analysis

### Database Type Detection

```
# Find database connections and configs
grep -r "DATABASE_URL\|DB_HOST\|connection\|connect" --include="*.{js,ts,go,py,java,env,yml}" .
find . -name "*.sql" -o -name "migrations" -o -name "schema.*" -o -name "database.*"
grep -r "postgres\|mysql\|mongodb\|redis\|sqlite" --include="*.{js,ts,go,py,java}" .

# Find ORM/database libraries
grep -r "sequelize\|typeorm\|prisma\|mongoose\|knex" --include="*.{json,js,ts}" .
grep -r "database/sql\|gorm\|sqlx" --include="*.{go,mod}" .
grep -r "sqlalchemy\|django.*models" --include="*.{py,txt}" .
```

### Connection Pool Analysis

```
# Check connection configurations
grep -r "pool\|maxConnections\|connectionLimit" --include="*.{js,ts,go,py,java,yml}" .
grep -r "timeout\|idleTimeout\|connectionTimeout" --include="*.{js,ts,go,py,java,yml}" .
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Database types: [list]. Primary DB: [type]. ORMs: [list]. Connection pools: [configured/missing]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["database","schema","connections"]}'
```

## 2. Schema Extraction & Analysis

### Table/Collection Discovery

```
# Extract schema definitions
find . -path "*/migrations/*" -name "*.sql" -o -name "*.js" -o -name "*.ts" | xargs cat | grep -E "(CREATE TABLE|ALTER TABLE)"
grep -r "Schema\|Model\|Entity" --include="*.{js,ts,go,py,java}" . | grep -A20 "="

# For NoSQL
grep -r "collection\|model.*=.*new.*Schema" --include="*.{js,ts}" .
```

### Schema Structure Analysis

For each table/collection, extract:

- Column names and types
- Primary keys
- Foreign keys
- Indexes
- Constraints
- Default values
- Nullable fields

Example extraction:

```sql
-- From: migrations/001_create_users.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis:
{
  table: "users",
  columns: {
    id: { type: "UUID", primary: true, default: "gen_random_uuid()" },
    email: { type: "VARCHAR(255)", unique: true, nullable: false },
    password_hash: { type: "VARCHAR(255)", nullable: false },
    created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" },
    updated_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
  },
  indexes: ["email (unique)"],
  missing_indexes: ["created_at (for time-based queries)"]
}
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Tables found: [count]. Total columns: [count]. Relationships: [count]. Missing FK constraints: [list]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["database","schema","structure"]}'
```

## 3. Query Performance Analysis

### Slow Query Detection

```
# Find complex queries
grep -r "SELECT.*JOIN.*JOIN\|INNER JOIN.*INNER JOIN" --include="*.{sql,js,ts,go,py}" .
grep -r "GROUP BY\|HAVING\|ORDER BY.*LIMIT" --include="*.{sql,js,ts,go,py}" .
grep -r "DISTINCT\|COUNT(\*)\|SUM\|AVG" --include="*.{sql,js,ts,go,py}" .

# Find potential N+1 queries
grep -r "forEach.*await.*find\|map.*await.*query" --include="*.{js,ts}" .
```

### Index Analysis

```sql
-- Check for missing indexes on foreign keys
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.table_name AS foreign_table,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND NOT EXISTS (
    SELECT 1 FROM information_schema.statistics s
    WHERE s.table_name = tc.table_name
    AND s.column_name = kcu.column_name
);
```

### Query Optimization Opportunities

```
# Find queries without indexes
# Pattern: WHERE/JOIN on non-indexed columns
grep -r "WHERE.*=" --include="*.{sql,js,ts,go,py}" . | grep -v "id.*="

# Find SELECT * queries
grep -r "SELECT \*\|select \*" --include="*.{sql,js,ts,go,py}" .
```

```
mcp__memory__memory_create operation="store_decision" options='{"decision":"Query performance grade: [A-F]","rationale":"Found [X] slow queries, [Y] missing indexes, [Z] N+1 patterns","context":"Worst performer: [query] taking [time]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo"}'
```

## 4. Data Integrity & Normalization

### Normalization Analysis

Check for violations:

- [ ] 1NF: Repeating groups, multi-valued attributes
- [ ] 2NF: Partial dependencies
- [ ] 3NF: Transitive dependencies
- [ ] Denormalization opportunities

```
# Find potential denormalization
grep -r "JSON\|JSONB\|TEXT.*json\|array" --include="*.{sql,js,ts}" .

# Find duplicate data patterns
grep -r "user_name\|user_email" --include="*.{sql,js,ts}" . | grep -v "users table"
```

### Constraint Analysis

```sql
-- Find missing constraints
-- Check for columns that should have constraints
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'YES'
AND column_name LIKE '%_id'  -- Foreign keys should not be nullable
ORDER BY table_name, ordinal_position;
```

### Data Quality Issues

```
# Find potential data quality problems
grep -r "COALESCE\|NULLIF\|CASE WHEN.*NULL" --include="*.{sql,js,ts,go,py}" .
grep -r "trim\|lower\|upper\|replace" --include="*.{sql,js,ts,go,py}" . | grep -i "WHERE\|where"
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Normalization issues: [list]. Missing constraints: [count]. Data quality risks: [list]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["database","integrity","normalization"]}'

# Mark schema validation as refreshed
mcp__memory__memory_update operation="mark_refreshed" options='{"chunk_id":"[schema_chunk_id]","validation_notes":"Schema validated and constraints checked","repository":"github.com/org/repo"}'
```

## 5. Migration & Version Control

### Migration History Analysis

```
# Find migration files and patterns
find . -path "*/migrations/*" -o -path "*/migrate/*" | sort
ls -la migrations/ | grep -E "^[0-9]+.*\.(sql|js|ts)"

# Check for migration issues
grep -r "DROP\|TRUNCATE\|DELETE FROM" migrations/
grep -r "ALTER TABLE.*DROP COLUMN" migrations/
```

### Schema Version Tracking

```
# Find schema version table
grep -r "schema_version\|migration\|changelog" --include="*.{sql,js,ts}" .

# Check for out-of-order migrations
ls migrations/ | sort -n | awk '{print NR, $0}' | grep -v "^[0-9]* [0-9]"
```

### Rollback Safety

```
# Check if migrations have down/rollback methods
for file in migrations/*.sql; do
    if ! grep -q "DOWN\|ROLLBACK\|-- reverse" "$file"; then
        echo "No rollback: $file"
    fi
done
```

## 6. Scalability Assessment

### Partitioning Opportunities

```sql
-- Find large tables that could benefit from partitioning
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE n_live_tup > 1000000
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Sharding Considerations

```
# Find tables with tenant/user isolation
grep -r "tenant_id\|company_id\|organization_id" --include="*.{sql,js,ts}" .
grep -r "user_id.*WHERE\|WHERE.*user_id" --include="*.{sql,js,ts}" .
```

### Archive Strategy

```
# Find date-based queries that could use partitioning
grep -r "created_at.*BETWEEN\|WHERE.*created_at\|updated_at.*>" --include="*.{sql,js,ts,go,py}" .
grep -r "DATE_TRUNC\|date_part\|EXTRACT.*FROM" --include="*.{sql,js,ts,go,py}" .
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Scalability recommendations: [list]. Partition candidates: [tables]. Archive strategy: [needed/exists]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["database","scalability","partitioning"]}'
```

## 7. Database Analysis Documentation

Create `.claude/DATABASE_ANALYSIS.md`:

````markdown
# Database Analysis: [Project Name]

## Executive Summary

**Database Health Score**: [A-F]

**Key Metrics**:

- Total Tables: [X]
- Total Size: [Y GB]
- Missing Indexes: [Z]
- Slow Queries: [Count]
- Normalization Level: [1NF-3NF]

**Critical Issues**:

1. Missing indexes on foreign keys in [tables]
2. N+1 query patterns in [services]
3. No connection pooling configured

## Table of Contents

- [Database Overview](#database-overview)
- [Schema Analysis](#schema-analysis)
- [Performance Analysis](#performance-analysis)
- [Data Integrity](#data-integrity)
- [Migration Strategy](#migration-strategy)
- [Optimization Plan](#optimization-plan)

## Database Overview

### Infrastructure

- **Primary Database**: PostgreSQL 13.7
- **Read Replicas**: None configured
- **Cache Layer**: Redis (underutilized)
- **Connection Pool**: Not configured (!)

### Database Sizes

\```mermaid
pie title "Table Size Distribution"
"users (2.1 GB)" : 21
"orders (4.5 GB)" : 45  
 "order_items (1.8 GB)" : 18
"logs (1.2 GB)" : 12
"other (<100MB)" : 4
\```

### Connection Analysis

**Current Configuration**:
\```javascript
// db/config.js - PROBLEMATIC
const client = new Client({
host: process.env.DB_HOST,
database: process.env.DB_NAME,
// No pool configuration!
});
\```

**Recommended Configuration**:
\```javascript
const pool = new Pool({
host: process.env.DB_HOST,
database: process.env.DB_NAME,
max: 20, // Maximum pool size
idleTimeoutMillis: 30000, // Close idle clients after 30s
connectionTimeoutMillis: 2000, // Timeout after 2s
});
\```

## Schema Analysis

### Entity Relationship Diagram

\```mermaid
erDiagram
users ||--o{ orders : places
users ||--o{ sessions : has
users {
uuid id PK
varchar email UK "missing index"
varchar password_hash
timestamp created_at "missing index"
timestamp updated_at
}

    orders ||--|{ order_items : contains
    orders ||--|| payments : has
    orders {
        uuid id PK
        uuid user_id FK "missing index"
        varchar status "missing index"
        decimal total
        timestamp created_at
    }

    products ||--o{ order_items : includes
    products {
        uuid id PK
        varchar sku UK
        varchar name
        decimal price
        integer stock "missing check constraint"
    }

    order_items {
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
    }

\```

### Table Analysis

#### Critical Tables

**users** (2.1M rows, 2.1 GB)
\```sql
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email VARCHAR(255) UNIQUE NOT NULL, -- ✓ Indexed
password_hash VARCHAR(255) NOT NULL,
role VARCHAR(50) DEFAULT 'user', -- ✗ No index, used in WHERE
created_at TIMESTAMP DEFAULT NOW(), -- ✗ No index, used in ORDER BY
updated_at TIMESTAMP DEFAULT NOW()
);

-- Missing indexes:
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_role ON users(role) WHERE role != 'user'; -- Partial index
\```

**orders** (5.4M rows, 4.5 GB)
\```sql
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id), -- ✗ No index!
status VARCHAR(50) NOT NULL, -- ✗ No index, frequently queried
total DECIMAL(10,2) NOT NULL,
metadata JSONB, -- ⚠️ Large JSON data
created_at TIMESTAMP DEFAULT NOW()
);

-- Critical missing indexes:
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_status ON orders(user_id, status); -- Composite
\```

### Normalization Issues

#### 1. Denormalized User Data

**Location**: `orders.shipping_address`
\```json
{
"user_name": "John Doe", // Duplicated from users table
"user_email": "john@example.com", // Duplicated from users table
"address": "123 Main St"
}
\```

**Fix**: Create separate `addresses` table

#### 2. Multi-valued Attributes

**Location**: `products.tags`
\```sql
-- Current: tags stored as comma-separated string
tags VARCHAR(500) -- "electronics,mobile,smartphone"

-- Should be:
CREATE TABLE product_tags (
product_id UUID REFERENCES products(id),
tag_id UUID REFERENCES tags(id),
PRIMARY KEY (product_id, tag_id)
);
\```

## Performance Analysis

### Slow Query Report

#### 1. User Orders Query (Avg: 2.3s)

\```sql
-- Current slow query
SELECT u.\*,
COUNT(o.id) as order_count,
SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 100;

-- Optimized version (0.045s with indexes)
WITH recent_users AS (
SELECT id FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT u._,
COALESCE(o.order_count, 0) as order_count,
COALESCE(o.total_spent, 0) as total_spent
FROM users u
INNER JOIN recent_users ru ON u.id = ru.id
LEFT JOIN LATERAL (
SELECT COUNT(_) as order_count,
SUM(total) as total_spent
FROM orders
WHERE user_id = u.id
) o ON true
ORDER BY total_spent DESC
LIMIT 100;
\```

#### 2. Product Search (Avg: 1.8s)

\```sql
-- Current: Full table scan
SELECT \* FROM products
WHERE LOWER(name) LIKE '%phone%'
OR LOWER(description) LIKE '%phone%';

-- Solution: Full-text search
ALTER TABLE products ADD COLUMN search_vector tsvector;
UPDATE products SET search_vector =
to_tsvector('english', name || ' ' || COALESCE(description, ''));
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Optimized query (0.023s)
SELECT \* FROM products
WHERE search_vector @@ plainto_tsquery('english', 'phone');
\```

### Query Performance Matrix

\```mermaid
scatter title "Query Performance (ms)"
x-axis "Query Complexity" [Simple, Medium, Complex, Very Complex]
y-axis "Response Time (ms)" 0 --> 3000

    "User lookup" : [Simple, 15]
    "Order list" : [Medium, 150]
    "User analytics" : [Complex, 2300]
    "Revenue report" : [Very Complex, 2800]

    "After optimization" : [Simple, 10]
    "After optimization" : [Medium, 45]
    "After optimization" : [Complex, 200]
    "After optimization" : [Very Complex, 450]

\```

### N+1 Query Patterns

**Found in**: `services/orderService.js`
\```javascript
// Bad: N+1 queries
const users = await db.query('SELECT _ FROM users WHERE active = true');
for (const user of users) {
const orders = await db.query('SELECT _ FROM orders WHERE user_id = $1', [user.id]);
user.orders = orders;
}

// Fixed: Single query with JOIN
const usersWithOrders = await db.query(`  SELECT 
    u.*,
    COALESCE(json_agg(o.*) FILTER (WHERE o.id IS NOT NULL), '[]') as orders
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.active = true
  GROUP BY u.id`);
\```

## Data Integrity

### Missing Constraints

#### 1. Check Constraints

\```sql
-- Add data validation constraints
ALTER TABLE products
ADD CONSTRAINT check_positive_price CHECK (price > 0),
ADD CONSTRAINT check_positive_stock CHECK (stock >= 0);

ALTER TABLE orders
ADD CONSTRAINT check_valid_status
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));

ALTER TABLE order_items
ADD CONSTRAINT check_positive_quantity CHECK (quantity > 0);
\```

#### 2. Foreign Key Constraints

\```sql
-- Missing FK constraints
ALTER TABLE sessions
ADD CONSTRAINT fk_sessions_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
\```

### Data Quality Issues

#### 1. Inconsistent Email Formats

\```sql
-- Found 1,247 users with inconsistent email casing
SELECT COUNT(\*) FROM users
WHERE email != LOWER(email);

-- Fix with trigger
CREATE OR REPLACE FUNCTION lowercase_email()
RETURNS TRIGGER AS $$
BEGIN
NEW.email = LOWER(NEW.email);
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER ensure_lowercase_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION lowercase_email();
\```

#### 2. Orphaned Records
\```sql
-- 3,421 order_items reference non-existent orders
SELECT COUNT(*) FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Clean up and add constraint
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
ALTER TABLE order_items ADD FOREIGN KEY (order_id) REFERENCES orders(id);
\```

## Migration Strategy

### Current Migration State
\```
migrations/
├── 001_initial_schema.sql          ✓ Applied
├── 002_add_user_roles.sql          ✓ Applied
├── 003_create_orders.sql           ✓ Applied
├── 004_add_products.sql            ✓ Applied
├── 005_fix_user_email.sql          ✗ Failed (no rollback)
└── 006_add_order_status.sql        ✗ Pending
\```

### Migration Best Practices Implementation
\```sql
-- Template for safe migrations
-- migrations/007_add_user_indexes.sql

-- UP
BEGIN;
-- Add indexes concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
COMMIT;

-- DOWN
BEGIN;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_role;
COMMIT;

-- VERIFY
DO
$$

BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_created_at') THEN
RAISE EXCEPTION 'Index idx_users_created_at was not created';
END IF;
END $$;
\```

### Migration Tooling

\```javascript
// Implement migration runner with rollback support
class MigrationRunner {
async up(migration) {
const client = await pool.connect();
try {
await client.query('BEGIN');
await client.query(migration.up);
await client.query(
'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
[migration.version, migration.name]
);
await client.query('COMMIT');
} catch (e) {
await client.query('ROLLBACK');
throw e;
} finally {
client.release();
}
}
}
\```

## Optimization Plan

### Phase 1: Critical Performance (Week 1)

1. **Add Missing Indexes**
   \```sql
   -- Script: add_missing_indexes.sql
   CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
   CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
   CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
   CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
   CREATE INDEX CONCURRENTLY idx_users_role ON users(role) WHERE role != 'user';
   \```

   **Impact**: 80-90% query performance improvement
   **Risk**: Low (concurrent index creation)

2. **Implement Connection Pooling**
   \```javascript
   // db/pool.js
   const { Pool } = require('pg');

   const pool = new Pool({
   max: 20,
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 2000,
   });

   module.exports = pool;
   \```

   **Impact**: Handle 10x concurrent connections
   **Risk**: Low

### Phase 2: Data Integrity (Week 2)

1. **Add Missing Constraints**
   - Check constraints for data validation
   - Foreign key constraints
   - NOT NULL where appropriate
2. **Fix Data Quality Issues**
   - Normalize email formats
   - Remove orphaned records
   - Add data validation triggers

### Phase 3: Scalability Prep (Month 2)

1. **Implement Table Partitioning**
   \```sql
   -- Partition orders by created_at
   CREATE TABLE orders_partitioned (LIKE orders INCLUDING ALL)
   PARTITION BY RANGE (created_at);

   -- Create monthly partitions
   CREATE TABLE orders_2024_01 PARTITION OF orders_partitioned
   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
   \```

2. **Archive Old Data**
   - Move orders > 2 years to archive tables
   - Implement automated archival process
3. **Read Replica Setup**
   - Configure streaming replication
   - Route read queries to replicas

### Phase 4: Advanced Optimization (Quarter 2)

1. **Query Result Caching**
   - Implement Redis caching layer
   - Cache expensive aggregations
2. **Database Sharding**
   - Evaluate sharding by tenant_id
   - Plan data migration strategy

## Monitoring & Maintenance

### Key Metrics to Track

\```sql
-- Query to monitor database health
SELECT
(SELECT count(_) FROM pg_stat_activity) as active_connections,
(SELECT count(_) FROM pg_stat_activity WHERE state = 'idle in transaction') as idle_transactions,
(SELECT sum(numbackends) FROM pg_stat_database) as total_connections,
(SELECT sum(tup_fetched) FROM pg_stat_database) as rows_fetched,
(SELECT sum(n_tup_ins + n_tup_upd + n_tup_del) FROM pg_stat_user_tables) as total_modifications,
pg_database_size(current_database()) as database_size;
\```

### Automated Maintenance

\```yaml

# postgres-maintenance.yml

maintenance_tasks:
daily: - VACUUM ANALYZE; # Update statistics - REINDEX CONCURRENTLY idx_orders_user_id; # Maintain indexes

weekly: - VACUUM FULL orders WHERE created_at < NOW() - INTERVAL '1 year';

monthly: - CLUSTER orders USING idx_orders_created_at; # Physically reorder - pg_repack orders; # Online table reorganization
\```

## Cost-Benefit Analysis

| Optimization       | Effort  | Performance Gain            | Cost Savings                 | Priority |
| ------------------ | ------- | --------------------------- | ---------------------------- | -------- |
| Add indexes        | 1 day   | 80-90% faster queries       | $500/month (less CPU)        | P0       |
| Connection pooling | 2 hours | Handle 10x load             | $1000/month (less instances) | P0       |
| Fix N+1 queries    | 3 days  | 95% faster APIs             | $800/month                   | P1       |
| Table partitioning | 1 week  | 60% faster old data queries | $300/month                   | P2       |
| Read replicas      | 3 days  | Distribute read load        | Scale horizontally           | P2       |

## Recommendations Summary

### Immediate Actions (This Week)

1. ⚠️ **Add missing indexes** - Critical for performance
2. ⚠️ **Implement connection pooling** - Prevent connection exhaustion
3. ⚠️ **Fix N+1 query patterns** - Reduce database load

### Short Term (This Month)

1. Add data integrity constraints
2. Implement query result caching
3. Set up database monitoring
4. Create migration rollback procedures

### Long Term (This Quarter)

1. Evaluate table partitioning for large tables
2. Plan read replica architecture
3. Implement automated archival
4. Consider database sharding strategy

## Appendix

### Index Creation Scripts

[Provided above in Phase 1]

### Connection Pool Configuration

[Provided above in Phase 1]

### Monitoring Queries

[Provided in Monitoring section]
````

### Final Storage & Session Completion

```
# Store final database analysis
mcp__memory__memory_create operation="store_chunk" options='{"content":"[Complete database analysis with schema details and optimization plan]","session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["database","schema","performance","analysis-complete"],"files_modified":[".claude/DATABASE_ANALYSIS.md","/migrations/optimization_scripts/*"]}'

# Create database analysis thread
mcp__memory__memory_create operation="create_thread" options='{"name":"Database Analysis & Optimization","description":"Complete database schema analysis with performance optimization recommendations","chunk_ids":["[connection_chunk_id]","[schema_chunk_id]","[performance_chunk_id]","[scalability_chunk_id]"],"repository":"github.com/org/repo"}'

# Create relationships between database components
mcp__memory__memory_create operation="create_relationship" options='{"source_chunk_id":"[schema_chunk_id]","target_chunk_id":"[performance_chunk_id]","relation_type":"affects","repository":"github.com/org/repo"}'

# Generate citations for database recommendations
mcp__memory__memory_system operation="generate_citations" options='{"query":"database optimization recommendations","chunk_ids":["[all_db_chunk_ids]"],"repository":"github.com/org/repo"}'

# Analyze workflow completion
mcp__memory__memory_tasks operation="workflow_analyze" options='{"session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo"}'

# End database analysis session
mcp__memory__memory_tasks operation="session_end" options='{"session_id":"database-researcher-$(date +%s)","repository":"github.com/org/repo"}'
```

## Execution Flow

1. **Start with Connection Analysis**: Understand database setup
2. **Map Schema Structure**: Extract all tables and relationships
3. **Identify Performance Issues**: Find slow queries and missing indexes
4. **Check Data Integrity**: Validate constraints and normalization
5. **Create Optimization Plan**: Prioritize by impact and effort

Begin by identifying the database type and connection configuration.
