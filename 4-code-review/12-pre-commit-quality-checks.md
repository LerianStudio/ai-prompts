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
Use Zen MCP tools for comprehensive quality analysis:

**1. Code Quality Assessment:**
```bash
mcp__zen__codereview \
  files=["/src", "/lib", "/api", "/services"] \
  prompt="Perform a comprehensive code quality review. Check for code smells, anti-patterns, maintainability issues, and adherence to best practices." \
  model="pro" \
  review_type="full" \
  focus_on="code complexity, duplication, naming conventions, SOLID principles"
```

**2. Pre-commit Validation Strategy:**
```bash
mcp__zen__thinkdeep \
  prompt="Analyze our development workflow and create an effective pre-commit quality gate strategy. Consider linting, testing, security checks, and build validation." \
  files=[".github/workflows", "package.json", "Makefile", ".pre-commit-config.yaml"] \
  model="pro" \
  thinking_mode="high" \
  focus_areas=["automation", "developer experience", "fast feedback", "quality gates"]
```

**3. Build and Test Analysis:**
```bash
mcp__zen__analyze \
  files=["package.json", "tsconfig.json", "webpack.config.js", "jest.config.js"] \
  prompt="Analyze our build and test configuration. Identify optimization opportunities, missing quality checks, and configuration issues." \
  model="pro" \
  analysis_type="quality" \
  output_format="actionable"
```

### Task Tool Usage
Search for quality tools and configurations:

```bash
# Find linter configurations
task search "eslint|prettier|tslint|pylint|flake8|rubocop|golangci"

# Search for test configurations
task search "jest|mocha|pytest|unittest|rspec|go test"

# Find build scripts
task search "build:|compile:|bundle:|webpack|rollup|vite"

# Look for pre-commit hooks
task search "pre-commit|husky|lint-staged|git hook"

# Find CI/CD configurations
task search ".github/workflows|.gitlab-ci|jenkinsfile|circleci"

# Search for code quality tools
task search "sonarqube|codeclimate|codecov|coveralls"

# Find formatting rules
task search "prettierrc|editorconfig|rustfmt|gofmt|black"

# Look for dependency checks
task search "npm audit|yarn audit|safety|bundler-audit|cargo audit"
```

**Benefits:**
- Zen MCP provides holistic code quality assessment beyond basic linting
- Task tool enables rapid discovery of all quality configurations
- Combined approach ensures comprehensive pre-commit validation

---

You are a software quality engineer responsible for discovering ACTUAL quality tooling and build configurations. Your goal is to find and execute existing quality checks, not create hypothetical pipelines.

## 🚨 CRITICAL: Discovery-First Quality Analysis

**MANDATORY PROCESS:**
1. **DISCOVER** actual build tools and quality configurations
2. **FIND** existing linters, formatters, and test scripts
3. **EXECUTE** only the tools that are actually configured
4. **DOCUMENT** real issues found with file:line evidence
5. **NEVER** suggest quality tools not already in the project

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #12 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-11 if they exist
- **VERIFY**: Technology stack from overview to find correct tools
- **USE**: Security vulnerabilities found to focus quality checks
- **CHECK**: Test gaps to ensure quality coverage
- **ANALYZE**: Code issues from all previous analyses

**Evidence Requirements:**
- Every quality tool MUST be found in project configuration
- Every linting error MUST have file:line reference
- Every build failure MUST show actual error output
- Every test failure MUST include actual test names
- NO hypothetical quality pipelines without evidence

**Chain Foundation:**
- Store only verified findings with tags: `["quality-checks", "pre-commit", "verified", "prompt-12"]`
- Document actual tools found and their output
- Map real quality issues with evidence
- Create report based on actual execution only

## 0. Session Initialization

```
# Initialize quality check session
memory_tasks session_create session_id="quality-check-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"linting formatting build test scripts","repository":"github.com/org/repo"}'
```

## 1. Discover Actual Project Configuration

### Step 1: Find Language and Build Tools

```bash
echo "=== Discovering project configuration ==="

# Check for actual configuration files
LANGUAGE=""
BUILD_TOOL=""

# Node.js/TypeScript
if [ -f "package.json" ]; then
  echo "✓ Found package.json - Node.js/TypeScript project"
  LANGUAGE="nodejs"
  BUILD_TOOL="npm"
  [ -f "yarn.lock" ] && BUILD_TOOL="yarn"
  [ -f "pnpm-lock.yaml" ] && BUILD_TOOL="pnpm"
fi

# Go
if [ -f "go.mod" ]; then
  echo "✓ Found go.mod - Go project"
  LANGUAGE="go"
  BUILD_TOOL="go"
fi

# Python
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  echo "✓ Found Python project files"
  LANGUAGE="python"
  if [ -f "pyproject.toml" ]; then
    grep -q "poetry" pyproject.toml && BUILD_TOOL="poetry"
    grep -q "setuptools" pyproject.toml && BUILD_TOOL="setuptools"
  else
    BUILD_TOOL="pip"
  fi
fi

# Java
if [ -f "pom.xml" ]; then
  echo "✓ Found pom.xml - Maven project"
  LANGUAGE="java"
  BUILD_TOOL="maven"
elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
  echo "✓ Found build.gradle - Gradle project"
  LANGUAGE="java"
  BUILD_TOOL="gradle"
fi

# Rust
if [ -f "Cargo.toml" ]; then
  echo "✓ Found Cargo.toml - Rust project"
  LANGUAGE="rust"
  BUILD_TOOL="cargo"
fi

if [ -z "$LANGUAGE" ]; then
  echo "❌ NO BUILD CONFIGURATION FOUND"
  # Try to detect by file extensions
  find . -name "*.js" -o -name "*.ts" | head -1 && LANGUAGE="javascript"
  find . -name "*.go" | head -1 && LANGUAGE="go"
  find . -name "*.py" | head -1 && LANGUAGE="python"
  find . -name "*.java" | head -1 && LANGUAGE="java"
  find . -name "*.rs" | head -1 && LANGUAGE="rust"
fi

echo "Language: $LANGUAGE"
echo "Build tool: $BUILD_TOOL"
```

### Step 2: Discover Quality Tool Configurations

```bash
echo "=== Discovering quality tools in project ==="

# Find linting configurations
echo "--- Checking for linter configs ---"
LINTER_CONFIG=""
FORMATTER_CONFIG=""

# JavaScript/TypeScript linters
if [ "$LANGUAGE" = "nodejs" ]; then
  [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.yml" ] && LINTER_CONFIG="eslint" && echo "✓ Found ESLint config"
  [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f ".prettierrc.js" ] && FORMATTER_CONFIG="prettier" && echo "✓ Found Prettier config"
  [ -f "tslint.json" ] && LINTER_CONFIG="tslint" && echo "✓ Found TSLint config (deprecated)"
  
  # Check package.json for lint scripts
  if [ -f "package.json" ]; then
    grep -q "\"lint\":" package.json && echo "✓ Found lint script in package.json"
    grep -q "\"format\":" package.json && echo "✓ Found format script in package.json"
    grep -q "\"test\":" package.json && echo "✓ Found test script in package.json"
    grep -q "\"build\":" package.json && echo "✓ Found build script in package.json"
  fi
fi

# Python linters
if [ "$LANGUAGE" = "python" ]; then
  [ -f ".flake8" ] && LINTER_CONFIG="flake8" && echo "✓ Found Flake8 config"
  [ -f ".pylintrc" ] && LINTER_CONFIG="pylint" && echo "✓ Found Pylint config"
  [ -f "pyproject.toml" ] && grep -q "\[tool.ruff\]" pyproject.toml && LINTER_CONFIG="ruff" && echo "✓ Found Ruff config"
  [ -f "pyproject.toml" ] && grep -q "\[tool.black\]" pyproject.toml && FORMATTER_CONFIG="black" && echo "✓ Found Black config"
  [ -f ".isort.cfg" ] || ([ -f "pyproject.toml" ] && grep -q "\[tool.isort\]" pyproject.toml) && echo "✓ Found isort config"
  [ -f "mypy.ini" ] || ([ -f "pyproject.toml" ] && grep -q "\[tool.mypy\]" pyproject.toml) && echo "✓ Found mypy config"
fi

# Go linters
if [ "$LANGUAGE" = "go" ]; then
  [ -f ".golangci.yml" ] || [ -f ".golangci.yaml" ] && LINTER_CONFIG="golangci-lint" && echo "✓ Found golangci-lint config"
  [ -f "Makefile" ] && grep -q "lint\|fmt\|vet" Makefile && echo "✓ Found lint targets in Makefile"
fi

# Java linters
if [ "$LANGUAGE" = "java" ]; then
  [ -f "checkstyle.xml" ] && LINTER_CONFIG="checkstyle" && echo "✓ Found Checkstyle config"
  [ -f "spotbugs.xml" ] && echo "✓ Found SpotBugs config"
  [ -f "pom.xml" ] && grep -q "maven-checkstyle-plugin" pom.xml && LINTER_CONFIG="checkstyle" && echo "✓ Found Checkstyle in pom.xml"
fi

# Rust linters
if [ "$LANGUAGE" = "rust" ]; then
  [ -f "rustfmt.toml" ] || [ -f ".rustfmt.toml" ] && FORMATTER_CONFIG="rustfmt" && echo "✓ Found rustfmt config"
  [ -f "clippy.toml" ] || [ -f ".clippy.toml" ] && LINTER_CONFIG="clippy" && echo "✓ Found clippy config"
fi

if [ -z "$LINTER_CONFIG" ] && [ -z "$FORMATTER_CONFIG" ]; then
  echo "❌ NO LINTER OR FORMATTER CONFIGURATION FOUND"
fi

# Check for pre-commit hooks
echo "--- Checking for pre-commit hooks ---"
if [ -f ".pre-commit-config.yaml" ]; then
  echo "✓ Found pre-commit configuration"
  PRE_COMMIT_CONFIG="found"
fi

if [ -d ".git/hooks" ] && [ -f ".git/hooks/pre-commit" ]; then
  echo "✓ Found git pre-commit hook"
  GIT_HOOKS="found"
fi

# Check for CI configuration
echo "--- Checking for CI configuration ---"
[ -f ".github/workflows" ] && echo "✓ Found GitHub Actions workflows"
[ -f ".gitlab-ci.yml" ] && echo "✓ Found GitLab CI config"
[ -f ".circleci/config.yml" ] && echo "✓ Found CircleCI config"
[ -f "Jenkinsfile" ] && echo "✓ Found Jenkins pipeline"
```

## 2. Execute Discovered Quality Tools

### Step 3: Run Only Configured Tools

```bash
echo "=== Executing discovered quality tools ==="

# Execute based on what we actually found
if [ -n "$LANGUAGE" ]; then
  echo "Running quality checks for $LANGUAGE project..."
  
  # Check for npm/yarn scripts first (most reliable)
  if [ -f "package.json" ] && [ "$LANGUAGE" = "nodejs" ]; then
    echo "--- Checking npm scripts ---"
    
    # Run lint if it exists
    if grep -q "\"lint\":" package.json; then
      echo "✓ Running npm lint script..."
      npm run lint 2>&1 | tee lint-output.log || echo "⚠️  Lint errors found"
      LINT_ERRORS=$(grep -c "error" lint-output.log 2>/dev/null || echo "0")
      echo "Lint errors: $LINT_ERRORS"
    else
      echo "❌ No lint script found in package.json"
    fi
    
    # Run format check if it exists
    if grep -q "\"format\":" package.json; then
      echo "✓ Running npm format script..."
      npm run format 2>&1 || echo "Format check completed"
    fi
    
    # Run tests if they exist
    if grep -q "\"test\":" package.json; then
      echo "✓ Running npm test script..."
      npm test 2>&1 | tee test-output.log || echo "⚠️  Test failures found"
      TEST_FAILURES=$(grep -c "fail" test-output.log 2>/dev/null || echo "0")
      echo "Test failures: $TEST_FAILURES"
      # Extract specific failing tests
      if [ "$TEST_FAILURES" -gt 0 ]; then
        grep -A2 -B2 "fail\|FAIL" test-output.log | head -10
      fi
    else
      echo "❌ No test script found in package.json"
    fi
    
    # Run build if it exists
    if grep -q "\"build\":" package.json; then
      echo "✓ Running npm build script..."
      npm run build 2>&1 || echo "⚠️  Build errors found"
    fi
  fi
  
  # Python with discovered tools
  if [ "$LANGUAGE" = "python" ]; then
    # Run discovered Python linter
    if [ "$LINTER_CONFIG" = "flake8" ] && command -v flake8 &> /dev/null; then
      echo "✓ Running flake8..."
      flake8 . 2>&1 | tee flake8-output.log || echo "⚠️  Flake8 errors found"
      FLAKE8_ERRORS=$(wc -l < flake8-output.log)
      echo "Flake8 issues: $FLAKE8_ERRORS"
    elif [ "$LINTER_CONFIG" = "pylint" ] && command -v pylint &> /dev/null; then
      echo "✓ Running pylint..."
      find . -name "*.py" -not -path "./venv/*" | xargs pylint 2>&1 | tee pylint-output.log || true
    elif [ "$LINTER_CONFIG" = "ruff" ] && command -v ruff &> /dev/null; then
      echo "✓ Running ruff..."
      ruff check . 2>&1 | tee ruff-output.log || echo "⚠️  Ruff errors found"
    fi
    
    # Run formatter if configured
    if [ "$FORMATTER_CONFIG" = "black" ] && command -v black &> /dev/null; then
      echo "✓ Running black --check..."
      black . --check 2>&1 || echo "⚠️  Code formatting needed"
    fi
    
    # Run pytest if available
    if command -v pytest &> /dev/null && [ -d "tests" ] || find . -name "test_*.py" | head -1; then
      echo "✓ Running pytest..."
      pytest -v 2>&1 | tee pytest-output.log || echo "⚠️  Test failures"
    fi
  fi
  
  # Go with discovered tools
  if [ "$LANGUAGE" = "go" ]; then
    # Always available Go tools
    echo "✓ Running go fmt..."
    UNFMT_FILES=$(gofmt -l .)
    if [ -n "$UNFMT_FILES" ]; then
      echo "⚠️  Unformatted files:"
      echo "$UNFMT_FILES"
    fi
    
    echo "✓ Running go vet..."
    go vet ./... 2>&1 | tee govet-output.log || echo "⚠️  go vet issues found"
    
    # Run configured linter
    if [ "$LINTER_CONFIG" = "golangci-lint" ] && command -v golangci-lint &> /dev/null; then
      echo "✓ Running golangci-lint..."
      golangci-lint run 2>&1 | tee golangci-output.log || echo "⚠️  Linting issues found"
    fi
    
    # Run tests
    echo "✓ Running go test..."
    go test ./... 2>&1 | tee gotest-output.log || echo "⚠️  Test failures"
    
    # Check build
    echo "✓ Running go build..."
    go build ./... 2>&1 || echo "⚠️  Build errors"
  fi
  
  # Check for Makefile targets
  if [ -f "Makefile" ]; then
    echo "--- Checking Makefile targets ---"
    if grep -q "^lint:" Makefile; then
      echo "✓ Running make lint..."
      make lint 2>&1 || echo "⚠️  Make lint failed"
    fi
    if grep -q "^test:" Makefile; then
      echo "✓ Running make test..."
      make test 2>&1 || echo "⚠️  Make test failed"
    fi
  fi
fi
```

### Step 4: Execute Pre-commit Hooks If Configured

```bash
echo "=== Checking pre-commit hooks ==="

if [ -n "$PRE_COMMIT_CONFIG" ] && command -v pre-commit &> /dev/null; then
  echo "✓ Running pre-commit hooks..."
  pre-commit run --all-files 2>&1 | tee pre-commit-output.log || echo "⚠️  Pre-commit checks failed"
  
  # Extract specific failures
  PRECOMMIT_FAILURES=$(grep -c "Failed" pre-commit-output.log 2>/dev/null || echo "0")
  echo "Pre-commit failures: $PRECOMMIT_FAILURES"
elif [ -n "$GIT_HOOKS" ] && [ -x ".git/hooks/pre-commit" ]; then
  echo "✓ Running git pre-commit hook..."
  .git/hooks/pre-commit 2>&1 || echo "⚠️  Git hook failed"
else
  echo "❌ No pre-commit hooks configured"
fi
```

## 3. Analyze Quality Check Results

### Step 5: Check for Common Issues

```bash
echo "=== Checking for common code issues ==="

# Get actual source files
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.java" | grep -v node_modules | grep -v venv | head -100)

# Check for large files
echo "--- Large file check ---"
LARGE_FILES=$(find . -type f -size +5M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./venv/*" -not -path "./target/*" 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  LARGE FILES FOUND:"
  echo "$LARGE_FILES" | while read -r file; do
    SIZE=$(ls -lh "$file" | awk '{print $5}')
    echo "  $file ($SIZE)"
  done
else
  echo "✓ No large files found"
fi

# Check for potential secrets (basic patterns)
echo "--- Basic secrets check ---"
SECRETS_FOUND=0
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for hardcoded secrets
    POTENTIAL_SECRETS=$(grep -n "api[_-]key.*=.*['\"]" "$file" 2>/dev/null | grep -v "example\|test\|mock")
    if [ -n "$POTENTIAL_SECRETS" ]; then
      echo "⚠️  POTENTIAL SECRET in $file:"
      echo "$POTENTIAL_SECRETS"
      SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
  fi
done

if [ "$SECRETS_FOUND" -eq 0 ]; then
  echo "✓ No obvious secrets found"
fi

# Count TODO/FIXME comments
echo "--- TODO/FIXME check ---"
TODO_FILES=$(grep -l "TODO\|FIXME\|HACK\|XXX" $SOURCE_FILES 2>/dev/null)
TODO_COUNT=$(grep -c "TODO\|FIXME\|HACK\|XXX" $SOURCE_FILES 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
if [ -n "$TODO_COUNT" ] && [ "$TODO_COUNT" -gt 0 ]; then
  echo "Found $TODO_COUNT TODO/FIXME comments in $(echo "$TODO_FILES" | wc -l) files"
  # Show a few examples
  grep -n "TODO\|FIXME" $SOURCE_FILES 2>/dev/null | head -5
else
  echo "✓ No TODO/FIXME comments found"
fi

# Check documentation existence
echo "--- Documentation check ---"
[ -f "README.md" ] || [ -f "README.rst" ] || [ -f "README.txt" ] && echo "✓ README found" || echo "❌ NO README FOUND"
[ -f "LICENSE" ] || [ -f "LICENSE.md" ] || [ -f "LICENSE.txt" ] && echo "✓ LICENSE found" || echo "❌ NO LICENSE FOUND"
```

## 4. Generate Evidence-Based Quality Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/12-QUALITY_REPORT.md` with ONLY verified findings:

```bash
cat > docs/code-review/12-QUALITY_REPORT.md << 'EOF'
# Pre-commit Quality Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: $(date)
**Language Detected**: $LANGUAGE
**Build Tool**: $BUILD_TOOL
**Linter Config**: $LINTER_CONFIG
**Formatter Config**: $FORMATTER_CONFIG
**Pre-commit Hooks**: $PRE_COMMIT_CONFIG

## Configured Quality Tools

### Build Configuration
[Only list what was actually found]
- Language: $LANGUAGE
- Build tool: $BUILD_TOOL
- Package manager: [npm/yarn/pip/etc if found]

### Quality Tools Found
- Linter: $LINTER_CONFIG [or NOT FOUND]
- Formatter: $FORMATTER_CONFIG [or NOT FOUND]
- Pre-commit: $PRE_COMMIT_CONFIG [or NOT FOUND]
- Git hooks: $GIT_HOOKS [or NOT FOUND]

## Quality Check Execution Results

[Only document tools that were actually run]

### Linting Results
[If linter was run]
- Tool: [actual linter used]
- Errors found: [count from output]
- Files with issues: [list with evidence]
  - `[file:line]`: [actual error message]

### Test Results
[If tests were run]
- Test runner: [actual runner used]
- Tests run: [count]
- Failures: [count]
- Failed tests: [list actual test names]

### Build Results
[If build was run]
- Build command: [actual command]
- Status: [Success/Failed]
- Errors: [list actual errors if any]

### Format Check Results
[If formatter was run]
- Tool: [actual formatter]
- Files needing formatting: [count and list]

## Common Issues Found

### Large Files
[Only if found in Step 5]
- Count: [number]
- Files: [list with sizes]

### Potential Secrets
[Only if found in Step 5]
- Files with hardcoded values: [count]
- Locations: [file:line references]

### Technical Debt
[Only if TODO/FIXME found]
- TODO/FIXME comments: [count]
- Distribution: [X files]

### Missing Documentation
[Based on actual checks]
- README: [Found/Not Found]
- LICENSE: [Found/Not Found]

## NOT FOUND (Expected Quality Tools)

### Missing Quality Infrastructure
[Only list if searched but not found]
- ❌ No linter configuration
- ❌ No formatter configuration
- ❌ No pre-commit hooks
- ❌ No test scripts
- ❌ No build scripts
- ❌ No CI/CD configuration

### Missing Documentation
- ❌ No README file
- ❌ No LICENSE file
- ❌ No CONTRIBUTING guide

## Evidence-Based Recommendations

[Only recommendations for actual issues found]

### Immediate Actions

[If no linter found]
1. **Add Linter Configuration**
   - Language: $LANGUAGE
   - Recommended: [appropriate linter for language]
   - No linting currently configured

[If lint errors found]
2. **Fix Linting Errors**
   - Errors found: [count]
   - Critical files: [list files with most errors]
   - Run: [actual command to fix]

[If no tests found]
3. **Add Test Scripts**
   - No test script in package.json/Makefile
   - Test files exist but no runner configured

### Quality Gate Status

**OVERALL STATUS**: [PASS with warnings/FAIL]

**Blocking Issues**:
[Only list actual blocking issues found]
- [ ] Lint errors: [count]
- [ ] Test failures: [count]
- [ ] Build errors: [count]
- [ ] Potential secrets: [count]

**Warnings**:
[Non-blocking issues]
- [ ] Large files: [count]
- [ ] TODO comments: [count]
- [ ] Missing documentation: [list]

EOF
```

## 5. Store Quality Check Results

```bash
# Store only actual findings
memory_store_chunk
content="Quality check completed. Language: $LANGUAGE. Linter: ${LINTER_CONFIG:-not found}. Tests: ${TEST_FAILURES:-0} failures. Build: ${BUILD_STATUS:-unknown}. Issues found with evidence."
session_id="quality-check-$(date +%s)"
repository="github.com/org/repo"
tags=["quality", "pre-commit", "build-status", "verified"]

memory_store_decision
decision="Pre-commit quality gate: [pass/fail based on actual results]"
rationale="Found [X] lint errors, [Y] test failures, [Z] build issues. All findings verified with tool output."
context="Actual quality tools executed: $LINTER_CONFIG, $FORMATTER_CONFIG"
session_id="quality-check-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="quality-check-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Discovery First**: Only run tools actually configured in the project
- **Evidence Required**: Every issue must come from actual tool output
- **No Assumptions**: Don't suggest tools not already in use
- **Clear Failures**: Document exactly what failed with evidence
- **Language Agnostic**: Adapt to whatever build system is found


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