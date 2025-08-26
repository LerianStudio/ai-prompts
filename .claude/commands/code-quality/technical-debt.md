---
allowed-tools: Bash(*), Read(*), Grep(*), Glob(*), LS(*), Task(*), TodoWrite(*), Write(*), MultiEdit(*), Edit(*)
description: Assess and prioritize technical debt with actionable remediation strategies
argument-hint: <project-path or component>
---

# /technical-debt

Assess and prioritize technical debt in the specified project or component with actionable remediation strategies.

## Overview

This command performs comprehensive technical debt analysis across multiple dimensions:

- **Code Quality**: Complexity, duplication, anti-patterns
- **Dependencies**: Outdated packages, security vulnerabilities
- **Performance**: Inefficient patterns, resource management
- **Testing**: Coverage gaps, test quality issues
- **Documentation**: Missing or outdated documentation
- **Architecture**: Design violations, coupling issues
- **Security**: Vulnerabilities and unsafe patterns

## Usage

```
/technical-debt <project-path or component>
```

**Examples:**

- `/technical-debt .` (analyze entire project)
- `/technical-debt src/auth` (analyze auth module)
- `/technical-debt backend/api` (analyze API layer)

## Analysis Process

### 1. Code Quality Assessment

**Static Analysis:**

```bash
# Multi-language static analysis
if [ -f "Cargo.toml" ]; then
  cargo clippy -- -D warnings
  cargo audit
  cargo outdated
fi

if [ -f "go.mod" ]; then
  golangci-lint run
  staticcheck ./...
  go mod tidy && git diff --exit-code go.mod go.sum
fi

if [ -f "package.json" ]; then
  npm audit
  npx eslint . --max-warnings 0
fi

if [ -f "deno.json" ]; then
  deno lint
  deno check **/*.ts
fi
```

**Complexity Metrics:**

```bash
# Cyclomatic complexity indicators
rg "if|else|while|for|match|switch|case|catch|\?\?" --count-matches

# Function length analysis (>25 lines flagged)
rg "fn |func |def |function " -A 30 -B 1 | rg "^--$" --count

# Large files (>500 lines)
find . -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.ts" -o -name "*.py" |
  xargs wc -l | sort -nr | head -15
```

### 2. Code Smell Detection

**Duplication Analysis:**

```bash
# Duplicate code detection
rg "(.{40,})" --only-matching | sort | uniq -c | sort -nr | head -15

# Similar function signatures
rg "fn |func |def |function " -o | sort | uniq -c | sort -nr | head -10

# Repeated string literals (>10 chars)
rg '"[^"]{10,}"' -o | sort | uniq -c | sort -nr | head -20
```

**Anti-Pattern Detection:**

```bash
# God objects (many methods)
rg "impl.*{|class.*{" -A 150 | rg "fn |def |public.*(" --count-matches

# Long parameter lists (>4 parameters)
rg "\([^)]*,[^)]*,[^)]*,[^)]*," -n

# Deep nesting (>4 levels)
rg "^[[:space:]]{16,}" --count-matches

# Magic numbers
rg "\b\d{2,}\b" --type rust --type go --type java | head -15
```

**Language-Specific Issues:**

```bash
# Rust: Unsafe patterns
rg "unwrap\(\)|expect\(|panic!" --type rust -n
rg "Rc<RefCell|Arc<Mutex" --type rust -n
rg "clone\(\)" --type rust -c

# Go: Common issues
rg "interface\{\}" --type go -n
rg "panic\(|recover\(\)" --type go -n

# General: TODO debt
rg "TODO|FIXME|XXX|HACK" -n --max-count 20
```

### 3. Dependency Health

**Security & Updates:**

```bash
# Security vulnerabilities
cargo audit 2>/dev/null || echo "Rust: cargo-audit not available"
govulncheck ./... 2>/dev/null || echo "Go: govulncheck not available"
npm audit 2>/dev/null || echo "Node.js: npm not available"

# Outdated dependencies
cargo outdated --root-deps-only 2>/dev/null
go list -u -m all 2>/dev/null | grep "\["
npm outdated 2>/dev/null
```

**Unused Dependencies:**

```bash
# Potentially unused imports
rg "^use |^import |^from.*import" | sort | uniq -c | sort -n | tail -10

# Unused crate features (Rust)
rg "features.*=.*\[" Cargo.toml 2>/dev/null
```

### 4. Performance Analysis

**Inefficient Patterns:**

```bash
# Memory allocation in loops
rg "Vec::new\(\).*loop|String::new\(\).*loop" --type rust
rg "make\(.*\).*for|append.*loop" --type go
rg "new.*\[\].*for|ArrayList.*loop" --type java

# Synchronous bottlenecks
rg "\.block\(\)|\.wait\(\)|Thread\.sleep" -n

# N+1 query patterns
rg "query.*loop|select.*for.*in" -n
```

**Resource Management:**

```bash
# Missing cleanup patterns
rg "File\.|Connection\.|Stream\." --type java -A 3 | rg -v "try|finally|resources"
rg "os\.Open|http\.Get" --type go -A 3 | rg -v "defer.*Close"

# Large allocations
rg "Vec::with_capacity\([0-9]{4,}" --type rust
rg "make.*[0-9]{4,}" --type go
```

### 5. Test Quality Assessment

**Coverage Analysis:**

```bash
# Test coverage (language-specific)
cargo tarpaulin --ignore-tests 2>/dev/null || echo "Rust: Install cargo-tarpaulin"
go test -cover ./... 2>/dev/null || echo "Go: No tests found"
npm test -- --coverage 2>/dev/null || echo "Node.js: No coverage config"

# Find untested files
find src/ -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.ts" |
  while read f; do
    base=$(basename "$f" | sed 's/\.[^.]*$//')
    if ! find . -name "*test*$base*" -o -name "*$base*test*" | grep -q .; then
      echo "Missing tests: $f"
    fi
  done | head -10
```

**Test Quality Issues:**

```bash
# Flaky test patterns
rg "sleep|Sleep|Thread\.sleep|setTimeout" test/ tests/ -n 2>/dev/null

# Missing assertions
rg "test.*fn|@Test|it\(" -A 8 | rg -v "assert|expect|should" -B 8 -A 3 | head -15

# Poor test naming
rg "test.*fn test[0-9]|@Test.*void test[0-9]|it\(.*test[0-9]" -n 2>/dev/null
```

### 6. Documentation Debt

**Missing Documentation:**

```bash
# Undocumented public APIs
rg "pub fn|public.*class|public.*interface|export " -A 1 | rg -v "//|/\*|\*|#" | head -10

# Outdated documentation markers
rg "TODO|FIXME|XXX|@deprecated" docs/ README.md -n 2>/dev/null

# Missing essential files
[ ! -f README.md ] && echo "❌ Missing README.md"
[ ! -f CONTRIBUTING.md ] && echo "⚠️ Missing CONTRIBUTING.md"
[ ! -f LICENSE ] && echo "⚠️ Missing LICENSE"
```

**Documentation Quality:**

```bash
# README completeness check
if [ -f README.md ]; then
  sections=("Installation" "Usage" "API" "Contributing" "License")
  for section in "${sections[@]}"; do
    grep -iq "$section" README.md || echo "⚠️ README missing: $section"
  done
fi

# Commented-out code (potential debt)
rg "//.*fn |//.*function|//.*def |//.*class" -n | head -5
```

### 7. Architecture Analysis

**Dependency Violations:**

```bash
# Circular dependencies
cargo check 2>&1 | grep "cyclic" 2>/dev/null
go mod graph 2>/dev/null | awk '{print $1, $2}' | sort | uniq |
  awk '{print $2, $1}' | sort | comm -12 - <(go mod graph 2>/dev/null | sort)

# Layer violations (domain depending on infrastructure)
rg "use.*database|import.*database" src/domain/ -n 2>/dev/null | head -5
```

**Coupling Analysis:**

```bash
# High coupling indicators
rg "import.*\*|use.*::\*" -n | head -10

# Feature flag sprawl
rg "feature.*flag|if.*enabled|toggle" -c
```

### 8. Security Assessment

**Security Anti-Patterns:**

```bash
# Hardcoded secrets detection
rg "password.*=|secret.*=|key.*=|token.*=" -n | head -5
rg "\b[A-Za-z0-9]{25,}\b" --type rust --type go | head -8

# Unsafe operations
rg "unsafe|\.unwrap\(\)|panic!" --type rust -c
rg "eval\(|exec\(|system\(" -n | head -5

# SQL injection risks
rg "query.*\+|SELECT.*\+|INSERT.*\+" -n | head -5
```

## Debt Scoring & Prioritization

### Priority Matrix

**🔴 Critical (Fix Immediately)**

- Security vulnerabilities with known exploits
- Performance bottlenecks in critical user paths
- Test failures preventing releases
- Dependencies with active CVEs

**🟡 High (Next Sprint)**

- Code complexity >15 cyclomatic complexity
- Test coverage <70% on core modules
- Dependencies 2+ major versions behind
- Missing documentation for public APIs

**🟢 Medium (Next Quarter)**

- Code duplication >15%
- Non-critical performance optimizations
- Test quality improvements
- Architecture refinements

**⚪ Low (Backlog)**

- Style guide violations
- Minor dependency updates
- Documentation polish
- Code organization improvements

### Quantified Metrics

```bash
# Calculate debt metrics
echo "=== Technical Debt Metrics ==="

# Lines of code
total_loc=$(find . -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.ts" -o -name "*.py" |
           xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
test_loc=$(find test* -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.ts" -o -name "*.py" 2>/dev/null |
          xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

echo "📊 Total LOC: $total_loc"
echo "🧪 Test LOC: $test_loc"
echo "📈 Test Ratio: $(echo "scale=2; $test_loc * 100 / $total_loc" | bc 2>/dev/null || echo "N/A")%"

# Complexity indicators
complex_files=$(find . -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.ts" |
               xargs wc -l | awk '$1 > 500 {print $2}' | wc -l)
echo "🏗️ Large files (>500 LOC): $complex_files"

# Debt indicators
todo_count=$(rg "TODO|FIXME|XXX|HACK" --count-matches 2>/dev/null |
            awk -F: '{sum += $2} END {print sum+0}')
echo "📝 TODO/FIXME count: $todo_count"
```

## Remediation Roadmap

### Immediate Actions (This Sprint)

- [ ] Fix critical security vulnerabilities (CVE fixes)
- [ ] Address performance bottlenecks in hot paths
- [ ] Resolve failing tests blocking releases
- [ ] Update dependencies with known security issues

### Short-term Actions (2-3 Sprints)

- [ ] Refactor functions with high cyclomatic complexity (>15)
- [ ] Eliminate code duplication hotspots (>80% similarity)
- [ ] Improve error handling patterns
- [ ] Add missing tests for core business logic
- [ ] Document public APIs and main workflows

### Long-term Actions (Next Quarter)

- [ ] Architectural improvements (reduce coupling)
- [ ] Technology stack modernization assessment
- [ ] Comprehensive test suite enhancement
- [ ] Performance optimization implementation
- [ ] Documentation overhaul and maintenance

## Deliverables

### 1. Assessment Report

```markdown
# Technical Debt Assessment - [Project Name]

## Executive Summary

- **Overall Health Score**: X/10
- **Critical Issues**: Y items requiring immediate attention
- **Estimated Effort**: Z story points to address high-priority items

## Findings by Category

### 🔴 Critical Issues

1. **Security**: [vulnerability details]
2. **Performance**: [bottleneck locations]
3. **Stability**: [test failures, error rates]

### 🟡 High Priority

1. **Code Quality**: [complexity hotspots]
2. **Dependencies**: [outdated packages]
3. **Testing**: [coverage gaps]

### 📊 Metrics Summary

- Code complexity: [average, hotspots]
- Test coverage: [percentage, gaps]
- Dependency health: [outdated, vulnerable]
- Documentation coverage: [missing areas]

### 🛠️ Recommended Actions

[Prioritized remediation plan with effort estimates]
```

### 2. Workflow Integration

- Pre-commit hooks for code quality gates
- CI/CD integration for continuous debt monitoring
- Dependency update scheduling
- Security scanning in deployment pipeline
- Code quality metrics dashboard

### 3. Prevention Strategy

- Development guidelines and coding standards
- Regular debt assessment schedule (monthly)
- Team education on debt prevention
- Integration with sprint planning process
- Long-term architecture evolution plan

## Monitoring & Follow-up

**Regular Reviews:**

- Weekly: Critical issue status
- Monthly: Debt metrics trending
- Quarterly: Architecture and strategy review

**Success Metrics:**

- Reduction in critical/high priority debt items
- Improvement in code quality scores
- Faster development velocity
- Reduced production incidents
- Improved team satisfaction with codebase
