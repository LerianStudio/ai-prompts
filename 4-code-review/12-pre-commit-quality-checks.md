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

You are a world-class software quality engineer responsible for ensuring code quality before commits. Execute a comprehensive pre-push quality pipeline that detects language, runs appropriate checks, fixes issues, and validates the build.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #11 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read ALL previous outputs `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/10-OBSERVABILITY_MONITORING.md` if they exist
- Use tech stack analysis from prompt #0 to configure language-specific pipelines
- Reference security vulnerabilities from prompt #6 to add security-focused quality checks
- Use test coverage gaps from prompt #9 to ensure critical paths have tests
- Use architectural patterns from prompt #1 to validate code follows established patterns
- Reference database schema from prompt #3 to validate data access patterns
- Use API contracts from prompt #2 to ensure endpoint implementations match specifications
- Reference privacy compliance from prompt #8 to ensure data handling quality

**Output Review:**
- If `docs/code-review/11-QUALITY_REPORT.md` already exists:
  1. Read and analyze the existing quality report first
  2. Cross-reference with comprehensive findings from the entire analysis chain
  3. Update quality checks based on identified vulnerabilities, compliance, and performance gaps
  4. Verify build pipeline addresses all critical issues
  5. Add quality gates for security, privacy, and performance issues identified

**Chain Coordination:**
- Store findings in memory MCP with tags: `["quality-checks", "pre-commit", "build-validation", "prompt-11"]`
- Create quality pipeline that validates against all known issues from the analysis chain
- Ensure quality gates prevent committing code with critical security, privacy, or performance issues
- Focus quality checks on components and patterns identified as high-risk across all analysis domains

## 0. Session Initialization & Language Detection

```
# Initialize quality check session
memory_tasks session_create session_id="quality-check-[timestamp]" repository="github.com/org/repo"

# Get context from previous quality checks
memory_get_context repository="github.com/org/repo"
memory_search query="quality issues code standards build failures" repository="github.com/org/repo"
```

### Automatic Language Detection

```bash
# Detect primary languages in the repository
find . -name "*.go" | head -1 && echo "Go detected"
find . -name "package.json" | head -1 && echo "Node.js/TypeScript detected"
find . -name "requirements.txt" -o -name "pyproject.toml" | head -1 && echo "Python detected"
find . -name "pom.xml" -o -name "build.gradle" | head -1 && echo "Java detected"
find . -name "Cargo.toml" | head -1 && echo "Rust detected"
find . -name "*.cs" -o -name "*.csproj" | head -1 && echo ".NET detected"
find . -name "composer.json" | head -1 && echo "PHP detected"
```

```
memory_store_chunk
  content="Languages detected: [list]. Primary language: [main]. Build tools: [detected tools]"
  session_id="quality-check-[timestamp]"
  repository="github.com/org/repo"
  tags=["quality", "language-detection", "build-tools"]
```

## 1. Pre-Flight Checks

### Repository Status & Staging

```bash
# Check repository state
git status --porcelain
git diff --cached --name-only
git branch --show-current

# Verify we're not on main/master without explicit permission
current_branch=$(git branch --show-current)
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
  echo "⚠️  WARNING: Committing directly to $current_branch"
  read -p "Continue? (y/N): " confirm
  [[ $confirm != [yY] ]] && exit 1
fi
```

### Dependencies & Environment Check

```bash
# Check for dependency lock files and sync
if [ -f "package.json" ]; then
  [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && echo "⚠️  Missing lock file"
  [ -f "package-lock.json" ] && npm ci --silent || npm install --silent
  [ -f "yarn.lock" ] && yarn install --silent
fi

if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt --quiet --disable-pip-version-check
fi

if [ -f "go.mod" ]; then
  go mod download && go mod tidy
fi

if [ -f "pom.xml" ]; then
  mvn dependency:resolve --quiet
fi

if [ -f "Cargo.toml" ]; then
  cargo fetch
fi
```

## 2. Language-Specific Quality Pipelines

### Go Quality Pipeline

```bash
if [ -f "go.mod" ]; then
  echo "🔍 Running Go quality checks..."

  # Format code
  echo "  📝 Formatting code..."
  go fmt ./...

  # Vet analysis
  echo "  🔍 Running go vet..."
  go vet ./... || { echo "❌ go vet failed"; exit 1; }

  # Security scan
  echo "  🔒 Security scan..."
  if command -v gosec &> /dev/null; then
    gosec ./... || echo "⚠️  gosec found potential issues"
  fi

  # Vulnerability check
  echo "  🛡️  Vulnerability check..."
  if command -v govulncheck &> /dev/null; then
    govulncheck ./... || echo "⚠️  Vulnerabilities found"
  fi

  # Performance anti-patterns
  echo "  ⚡ Performance check..."
  if command -v perfsprint &> /dev/null; then
    perfsprint ./... || echo "⚠️  Performance issues detected"
  fi

  # Linting
  echo "  📋 Linting..."
  if command -v golangci-lint &> /dev/null; then
    golangci-lint run ./...
  elif command -v staticcheck &> /dev/null; then
    staticcheck ./...
  fi

  # Tests
  echo "  🧪 Running tests..."
  go test -race -coverprofile=coverage.out ./... || { echo "❌ Tests failed"; exit 1; }

  # Build verification
  echo "  🔨 Build verification..."
  go build ./... || { echo "❌ Build failed"; exit 1; }
fi
```

### Node.js/TypeScript Quality Pipeline

```bash
if [ -f "package.json" ]; then
  echo "🔍 Running Node.js/TypeScript quality checks..."

  # Type checking
  if grep -q "typescript" package.json; then
    echo "  📝 Type checking..."
    npx tsc --noEmit || { echo "❌ Type check failed"; exit 1; }
  fi

  # Linting
  echo "  📋 Linting..."
  if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || grep -q "eslint" package.json; then
    npx eslint . --fix --max-warnings 0 || { echo "❌ ESLint failed"; exit 1; }
  fi

  # Formatting
  echo "  📝 Formatting..."
  if grep -q "prettier" package.json; then
    npx prettier --write . --ignore-unknown
  fi

  # Security audit
  echo "  🔒 Security audit..."
  npm audit --audit-level high || echo "⚠️  Security vulnerabilities found"

  # Tests
  echo "  🧪 Running tests..."
  if grep -q "\"test\":" package.json; then
    npm test || { echo "❌ Tests failed"; exit 1; }
  fi

  # Build verification
  echo "  🔨 Build verification..."
  if grep -q "\"build\":" package.json; then
    npm run build || { echo "❌ Build failed"; exit 1; }
  fi
fi
```

### Python Quality Pipeline

```bash
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  echo "🔍 Running Python quality checks..."

  # Code formatting
  echo "  📝 Formatting..."
  if command -v black &> /dev/null; then
    black . --check || black .
  fi

  if command -v isort &> /dev/null; then
    isort . --check-only || isort .
  fi

  # Linting
  echo "  📋 Linting..."
  if command -v ruff &> /dev/null; then
    ruff check . --fix || { echo "❌ Ruff linting failed"; exit 1; }
  elif command -v flake8 &> /dev/null; then
    flake8 . || { echo "❌ Flake8 failed"; exit 1; }
  fi

  # Type checking
  echo "  📝 Type checking..."
  if command -v mypy &> /dev/null; then
    mypy . || echo "⚠️  Type check issues found"
  fi

  # Security scan
  echo "  🔒 Security scan..."
  if command -v bandit &> /dev/null; then
    bandit -r . || echo "⚠️  Security issues found"
  fi

  if command -v safety &> /dev/null; then
    safety check || echo "⚠️  Vulnerable dependencies found"
  fi

  # Tests
  echo "  🧪 Running tests..."
  if command -v pytest &> /dev/null; then
    pytest --maxfail=1 -q || { echo "❌ Tests failed"; exit 1; }
  elif [ -f "test_*.py" ] || find . -name "test_*.py" | grep -q .; then
    python -m unittest discover -s . -p "test_*.py" || { echo "❌ Tests failed"; exit 1; }
  fi
fi
```

### Java Quality Pipeline

```bash
if [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
  echo "🔍 Running Java quality checks..."

  if [ -f "pom.xml" ]; then
    # Maven pipeline
    echo "  📋 Maven compile & test..."
    mvn clean compile test || { echo "❌ Maven build/test failed"; exit 1; }

    # Security scan
    echo "  🔒 Security scan..."
    mvn org.owasp:dependency-check-maven:check || echo "⚠️  Security vulnerabilities found"

    # Code quality
    if mvn help:describe -Dplugin=com.github.spotbugs:spotbugs-maven-plugin &> /dev/null; then
      mvn spotbugs:check || echo "⚠️  SpotBugs found issues"
    fi

  elif [ -f "build.gradle" ]; then
    # Gradle pipeline
    echo "  📋 Gradle build & test..."
    ./gradlew build test || { echo "❌ Gradle build/test failed"; exit 1; }

    # Security scan
    echo "  🔒 Security scan..."
    ./gradlew dependencyCheckAnalyze || echo "⚠️  Security vulnerabilities found"
  fi
fi
```

### Rust Quality Pipeline

```bash
if [ -f "Cargo.toml" ]; then
  echo "🔍 Running Rust quality checks..."

  # Format check
  echo "  📝 Format check..."
  cargo fmt -- --check || cargo fmt

  # Linting
  echo "  📋 Clippy linting..."
  cargo clippy -- -D warnings || { echo "❌ Clippy failed"; exit 1; }

  # Security audit
  echo "  🔒 Security audit..."
  if command -v cargo-audit &> /dev/null; then
    cargo audit || echo "⚠️  Security vulnerabilities found"
  fi

  # Tests
  echo "  🧪 Running tests..."
  cargo test || { echo "❌ Tests failed"; exit 1; }

  # Build verification
  echo "  🔨 Build verification..."
  cargo build --release || { echo "❌ Build failed"; exit 1; }
fi
```

## 3. Universal Quality Checks

### Git Hooks & Pre-commit Checks

```bash
# Check for common issues
echo "🔍 Universal quality checks..."

# Large files check
echo "  📦 Checking for large files..."
large_files=$(find . -type f -size +50M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./target/*" -not -path "./build/*")
if [ -n "$large_files" ]; then
  echo "⚠️  Large files detected:"
  echo "$large_files"
  read -p "Continue anyway? (y/N): " confirm
  [[ $confirm != [yY] ]] && exit 1
fi

# Secrets detection
echo "  🔐 Scanning for secrets..."
if command -v gitleaks &> /dev/null; then
  gitleaks detect --verbose || { echo "❌ Secrets detected"; exit 1; }
elif command -v truffleHog &> /dev/null; then
  truffleHog --regex --entropy=False . || echo "⚠️  Potential secrets found"
else
  # Basic regex check
  if grep -r -E "(api[_-]?key|secret|password|token|auth)" --include="*.{js,ts,py,go,java}" . | grep -v -E "(test|spec|example|mock)" | head -5; then
    echo "⚠️  Potential secrets found in code"
  fi
fi

# TODO/FIXME/HACK check
echo "  📝 Checking for TODO/FIXME/HACK comments..."
todo_count=$(grep -r -E "(TODO|FIXME|HACK|XXX)" --include="*.{js,ts,py,go,java,rs,cs}" . | wc -l)
if [ "$todo_count" -gt 0 ]; then
  echo "  📋 Found $todo_count TODO/FIXME/HACK comments"
  if [ "$todo_count" -gt 50 ]; then
    echo "⚠️  High number of TODO items - consider cleanup"
  fi
fi
```

### Documentation Checks

```bash
# Documentation completeness
echo "  📚 Documentation checks..."

# README existence
[ ! -f "README.md" ] && [ ! -f "README.rst" ] && echo "⚠️  No README file found"

# Changelog for versioned projects
if [ -f "package.json" ] || [ -f "setup.py" ] || [ -f "Cargo.toml" ]; then
  [ ! -f "CHANGELOG.md" ] && [ ! -f "CHANGELOG.rst" ] && echo "⚠️  No CHANGELOG found"
fi

# License file
[ ! -f "LICENSE" ] && [ ! -f "LICENSE.md" ] && [ ! -f "LICENSE.txt" ] && echo "⚠️  No LICENSE file found"
```

## 4. Build & Integration Verification

### Final Build Check

```bash
echo "🔨 Final build verification..."

# Language-specific build commands
if [ -f "go.mod" ]; then
  go build ./... || { echo "❌ Go build failed"; exit 1; }
fi

if [ -f "package.json" ] && grep -q "\"build\":" package.json; then
  npm run build || { echo "❌ Node.js build failed"; exit 1; }
fi

if [ -f "pom.xml" ]; then
  mvn compile -q || { echo "❌ Maven compile failed"; exit 1; }
fi

if [ -f "build.gradle" ]; then
  ./gradlew build -q || { echo "❌ Gradle build failed"; exit 1; }
fi

if [ -f "Cargo.toml" ]; then
  cargo build || { echo "❌ Rust build failed"; exit 1; }
fi

if [ -f "pyproject.toml" ] && grep -q "build-system" pyproject.toml; then
  python -m build || echo "⚠️  Python build check failed"
fi
```

### Performance & Size Checks

```bash
echo "📊 Performance checks..."

# Bundle size check for web projects
if [ -f "package.json" ] && [ -d "dist" ]; then
  bundle_size=$(du -sh dist/ | cut -f1)
  echo "  📦 Bundle size: $bundle_size"
fi

# Binary size for compiled languages
if [ -f "go.mod" ]; then
  go build -o temp_binary . 2>/dev/null && {
    binary_size=$(ls -lh temp_binary | awk '{print $5}')
    echo "  📦 Binary size: $binary_size"
    rm temp_binary
  }
fi
```

## 5. Quality Report & Memory Storage

### Generate Quality Report

```bash
echo "📊 Generating quality report..."

# Create quality summary
cat > docs/code-review/11-QUALITY_REPORT.md << EOF
# Quality Check Report - $(date)

## Summary
- ✅ **Build**: Successful
- ✅ **Tests**: Passed
- ✅ **Linting**: Clean
- ✅ **Security**: Scanned
- ✅ **Dependencies**: Checked

## Details
- **Languages**: $(echo "$detected_languages" | tr '\n' ', ')
- **Files changed**: $(git diff --cached --name-only | wc -l)
- **Tests run**: $(echo "$test_results")
- **Security issues**: $(echo "$security_issues")

## Recommendations
$(echo "$recommendations")
EOF
```

### Store Quality Metrics

```
# Store quality check results
memory_store_chunk
  content="Quality check completed. Languages: [detected]. Issues found: [count]. Build status: [success/fail]. Test coverage: [percentage]. Security scan: [clean/issues found]"
  session_id="quality-check-[timestamp]"
  repository="github.com/org/repo"
  tags=["quality", "pre-commit", "build-status", "security"]

# Store any quality issues for pattern analysis
memory_store_decision
  decision="Pre-commit quality gate: [pass/fail]"
  rationale="Quality checks completed with [X] issues found. Critical: [list]. Warnings: [list]"
  context="Automated quality pipeline execution before commit"
  session_id="quality-check-[timestamp]"
  repository="github.com/org/repo"

# Find similar quality issues across projects
memory_read find_similar problem="build failures code quality issues" repository="github.com/org/repo"

# Generate insights from quality patterns
memory_intelligence auto_insights repository="github.com/org/repo" session_id="quality-check-[timestamp]"

# Complete quality check session
memory_tasks workflow_analyze session_id="quality-check-[timestamp]" repository="github.com/org/repo"
memory_tasks session_end session_id="quality-check-[timestamp]" repository="github.com/org/repo"
```

## 6. Execution Summary

```bash
echo "✅ Pre-push quality check completed!"
echo "📊 Summary:"
echo "  - Languages processed: $detected_languages"
echo "  - Quality checks: ✅"
echo "  - Build verification: ✅"
echo "  - Security scan: ✅"
echo "  - Ready for commit: ✅"
echo ""
echo "🚀 You can now safely push your changes!"
```

This comprehensive quality check ensures consistent code quality across all languages while being flexible enough to adapt to different project requirements.


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format
```markdown
## Pre-commit Quality Analysis Findings

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