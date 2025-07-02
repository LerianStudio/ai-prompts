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

You are a technical writer specializing in discovering ACTUAL documentation gaps through systematic exploration. Your goal is to identify what documentation exists, what's missing, and generate only what's needed based on evidence.

## 🚨 CRITICAL: Discovery-First Documentation Analysis

**MANDATORY PROCESS:**
1. **DISCOVER** existing documentation files and their content
2. **VERIFY** accuracy against actual codebase findings
3. **IDENTIFY** real documentation gaps with evidence
4. **GENERATE** only missing documentation based on discoveries
5. **NEVER** create hypothetical documentation without gaps identified

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #13 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-12 if they exist
- **VERIFY**: Components and architecture from previous analyses still exist
- **USE**: Security findings for security documentation needs
- **CHECK**: API endpoints from prompt #3 for API doc requirements
- **EXAMINE**: Test coverage gaps for testing documentation needs

**Evidence Requirements:**
- Every documentation gap MUST reference what's missing
- Every generated section MUST fill an identified gap
- Every update MUST correct verified inaccuracies
- Every recommendation MUST address discovered issues
- NO template documentation without identifying needs first

**Chain Foundation:**
- Store only verified findings with tags: `["documentation", "gaps", "verified", "prompt-13"]`
- Document actual documentation coverage and gaps
- Generate documentation only for verified needs
- Create documentation based on discovered codebase reality

## File Organization

**REQUIRED OUTPUT LOCATIONS:**
- `docs/code-review/13-DOCUMENTATION_GAPS.md` - Documentation coverage analysis with evidence
- Generate new docs ONLY if gaps are identified with evidence
- Update existing docs ONLY if inaccuracies are found

**IMPORTANT RULES:**
- First discover what documentation already exists
- Identify gaps based on codebase vs documentation comparison
- Generate only missing documentation sections
- Update only verified inaccuracies with evidence

## 0. Session Initialization

```
memory_tasks session_create session_id="doc-analyzer-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"documentation readme setup guide","repository":"github.com/org/repo"}'
```

## 1. Discover Existing Documentation

### Step 1: Find All Documentation Files

```bash
echo "=== Discovering existing documentation ===="

# Find all markdown files
echo "--- Searching for documentation files ---"
DOC_FILES=$(find . -name "*.md" -o -name "*.rst" -o -name "*.txt" | grep -v node_modules | grep -v vendor | sort)
DOC_COUNT=$(echo "$DOC_FILES" | grep -v "^$" | wc -l)
echo "Found $DOC_COUNT documentation files"

if [ "$DOC_COUNT" -eq 0 ]; then
  echo "❌ NO DOCUMENTATION FILES FOUND"
  echo "This project has no markdown, RST, or text documentation"
else
  echo "Documentation files found:"
  echo "$DOC_FILES" | head -20
fi

# Check for common documentation locations
echo "--- Checking standard documentation locations ---"
[ -f "README.md" ] && echo "✓ README.md exists" || echo "❌ NO README.md"
[ -f "CONTRIBUTING.md" ] && echo "✓ CONTRIBUTING.md exists" || echo "❌ NO CONTRIBUTING.md"
[ -f "LICENSE" ] || [ -f "LICENSE.md" ] && echo "✓ LICENSE exists" || echo "❌ NO LICENSE"
[ -d "docs" ] && echo "✓ docs/ directory exists" || echo "❌ NO docs/ directory"
[ -f "CHANGELOG.md" ] && echo "✓ CHANGELOG.md exists" || echo "❌ NO CHANGELOG.md"
[ -f "CODE_OF_CONDUCT.md" ] && echo "✓ CODE_OF_CONDUCT.md exists" || echo "❌ NO CODE_OF_CONDUCT.md"

# Find API documentation
echo "--- Searching for API documentation ---"
API_DOCS=$(find . -name "*api*" -name "*.md" -o -name "*API*" -name "*.md" | grep -v node_modules)
[ -n "$API_DOCS" ] && echo "✓ API documentation found: $API_DOCS" || echo "❌ NO API DOCUMENTATION"

# Find setup/installation docs
echo "--- Searching for setup documentation ---"
SETUP_DOCS=$(find . -name "*setup*" -o -name "*install*" -o -name "*getting*started*" | grep -i "\.md\|\.rst" | grep -v node_modules)
[ -n "$SETUP_DOCS" ] && echo "✓ Setup documentation found: $SETUP_DOCS" || echo "❌ NO SETUP DOCUMENTATION"
```

## 2. Analyze Existing Documentation Content

### Step 2: Check README Content Coverage

```bash
echo "=== Analyzing existing README.md ===="

if [ -f "README.md" ]; then
  echo "README.md exists - checking content coverage..."
  
  # Check for essential sections
  echo "--- Checking README sections ---"
  grep -q "## Install\|## Setup\|## Getting Started" README.md && echo "✓ Installation section found" || echo "❌ NO INSTALLATION SECTION"
  grep -q "## Usage\|## Example\|## Quick Start" README.md && echo "✓ Usage section found" || echo "❌ NO USAGE SECTION"
  grep -q "## API\|## Documentation" README.md && echo "✓ Documentation links found" || echo "❌ NO DOCUMENTATION LINKS"
  grep -q "## Contribut" README.md && echo "✓ Contributing section found" || echo "❌ NO CONTRIBUTING SECTION"
  grep -q "## License" README.md && echo "✓ License section found" || echo "❌ NO LICENSE SECTION"
  
  # Check for code examples
  echo "--- Checking for code examples ---"
  CODE_BLOCKS=$(grep -c '```' README.md || echo "0")
  echo "Code blocks in README: $CODE_BLOCKS"
  [ "$CODE_BLOCKS" -eq 0 ] && echo "❌ NO CODE EXAMPLES IN README"
  
  # Check if README references actual project files
  echo "--- Checking README accuracy ---"
  if grep -q "npm install" README.md && [ ! -f "package.json" ]; then
    echo "⚠️  README mentions npm but no package.json found"
  fi
  if grep -q "pip install" README.md && [ ! -f "requirements.txt" ] && [ ! -f "setup.py" ]; then
    echo "⚠️  README mentions pip but no Python setup files found"
  fi
else
  echo "❌ NO README.md FILE EXISTS"
fi

# Discover actual project metadata
echo "--- Discovering project metadata ---"
PROJECT_NAME=""
PROJECT_DESC=""
if [ -f "package.json" ]; then
  PROJECT_NAME=$(jq -r '.name' package.json 2>/dev/null || echo "")
  PROJECT_DESC=$(jq -r '.description' package.json 2>/dev/null || echo "")
  echo "Node.js project: $PROJECT_NAME"
elif [ -f "go.mod" ]; then
  PROJECT_NAME=$(head -1 go.mod | awk '{print $2}')
  echo "Go project: $PROJECT_NAME"
elif [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
  echo "Python project detected"
fi
```

## 3. Check API Documentation Coverage

### Step 3: Compare API Endpoints vs Documentation

```bash
echo "=== Checking API documentation coverage ===="

# First, find actual API endpoints from previous analysis
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "Using API analysis from prompt #3..."
  ANALYZED_ENDPOINTS=$(grep -E "^### (GET|POST|PUT|DELETE|PATCH)" docs/code-review/3-API_CONTRACT_ANALYSIS.md | wc -l)
  echo "Endpoints found in analysis: $ANALYZED_ENDPOINTS"
fi

# Find API documentation
API_DOC_FILES=$(find . -name "*api*.md" -o -name "*API*.md" | grep -v node_modules | grep -v code-review)
if [ -n "$API_DOC_FILES" ]; then
  echo "API documentation files found:"
  for doc in $API_DOC_FILES; do
    echo "  Checking $doc..."
    DOCUMENTED_ENDPOINTS=$(grep -E "^#+ (GET|POST|PUT|DELETE|PATCH)" "$doc" 2>/dev/null | wc -l)
    echo "    Endpoints documented: $DOCUMENTED_ENDPOINTS"
    # Show a few documented endpoints for verification
    grep -E "^#+ (GET|POST|PUT|DELETE|PATCH)" "$doc" 2>/dev/null | head -3
  done
else
  echo "❌ NO API DOCUMENTATION FILES FOUND"
fi

# Check for OpenAPI/Swagger
echo "--- Checking for OpenAPI/Swagger ---"
OPENAPI_FILES=$(find . -name "openapi.*" -o -name "swagger.*" | grep -v node_modules)
if [ -n "$OPENAPI_FILES" ]; then
  echo "✓ OpenAPI/Swagger found: $OPENAPI_FILES"
else
  echo "❌ NO OPENAPI/SWAGGER SPECIFICATION"
fi

# Check for inline API documentation
echo "--- Checking for inline API documentation ---"
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v node_modules | head -50)
INLINE_DOCS=$(grep -l "@api\|@swagger\|@route\|@endpoint" $SOURCE_FILES 2>/dev/null | wc -l)
echo "Files with inline API documentation: $INLINE_DOCS"
```

## 4. Verify Setup Documentation

### Step 4: Check Setup and Installation Docs

```bash
echo "=== Verifying setup documentation ==="

# Check for setup documentation
if [ -f "docs/SETUP.md" ] || [ -f "docs/setup.md" ] || [ -f "INSTALL.md" ]; then
  echo "Setup documentation found"
  SETUP_FILE=$(ls docs/SETUP.md docs/setup.md INSTALL.md 2>/dev/null | head -1)
  
  # Verify setup steps match project type
  echo "--- Verifying setup accuracy ---"
  if [ -f "package.json" ]; then
    grep -q "npm install\|yarn install" "$SETUP_FILE" && echo "✓ Node.js setup steps found" || echo "❌ Missing Node.js setup steps"
  fi
  if [ -f "go.mod" ]; then
    grep -q "go mod\|go get" "$SETUP_FILE" && echo "✓ Go setup steps found" || echo "❌ Missing Go setup steps"
  fi
  if [ -f "requirements.txt" ]; then
    grep -q "pip install" "$SETUP_FILE" && echo "✓ Python setup steps found" || echo "❌ Missing Python setup steps"
  fi
  
  # Check for environment setup
  grep -q ".env\|environment\|config" "$SETUP_FILE" && echo "✓ Environment setup found" || echo "❌ NO ENVIRONMENT SETUP"
else
  echo "❌ NO SETUP DOCUMENTATION FOUND"
fi

# Check for actual environment example
echo "--- Checking for environment examples ---"
[ -f ".env.example" ] && echo "✓ .env.example exists" || echo "❌ NO .env.example"
[ -f ".env.sample" ] && echo "✓ .env.sample exists" || echo "❌ NO .env.sample"
[ -f "config/example.yml" ] && echo "✓ config example exists"

# Verify database setup documentation
echo "--- Checking database setup docs ---"
if [ -f "docs/code-review/4-DATABASE_OPTIMIZATION.md" ]; then
  echo "Database analysis available from prompt #4"
  # Check if setup docs mention database
  if [ -n "$SETUP_FILE" ]; then
    grep -q "database\|migration\|schema" "$SETUP_FILE" && echo "✓ Database setup documented" || echo "❌ NO DATABASE SETUP DOCS"
  fi
fi
```

## 5. Check Development Documentation

### Step 5: Verify Development Workflow Docs

```bash
echo "=== Checking development documentation ==="

# Check for development guide
DEV_DOCS=$(find . -name "*develop*" -o -name "*DEVELOP*" -o -name "*contrib*" | grep -i "\.md" | grep -v node_modules)
if [ -n "$DEV_DOCS" ]; then
  echo "Development documentation found: $DEV_DOCS"
  
  for doc in $DEV_DOCS; do
    echo "--- Analyzing $doc ---"
    # Check for essential development sections
    grep -q "test\|Test" "$doc" && echo "✓ Testing section found" || echo "❌ NO TESTING SECTION"
    grep -q "lint\|format\|style" "$doc" && echo "✓ Code style section found" || echo "❌ NO CODE STYLE SECTION"
    grep -q "branch\|git\|commit" "$doc" && echo "✓ Git workflow found" || echo "❌ NO GIT WORKFLOW"
  done
else
  echo "❌ NO DEVELOPMENT DOCUMENTATION FOUND"
fi

# Check for actual development scripts
echo "--- Verifying development scripts ---"
if [ -f "package.json" ]; then
  echo "Checking package.json scripts:"
  jq -r '.scripts | keys[]' package.json 2>/dev/null | grep -E "dev|test|lint|format" | while read script; do
    echo "  ✓ Script found: npm run $script"
  done
fi

if [ -f "Makefile" ]; then
  echo "Checking Makefile targets:"
  grep -E "^[a-z-]+:" Makefile | grep -E "test|lint|format|dev" | while read target; do
    echo "  ✓ Target found: make ${target%:*}"
  done
fi

# Check for IDE configurations
echo "--- Checking IDE configurations ---"
[ -d ".vscode" ] && echo "✓ VS Code configuration found" || echo "❌ No .vscode config"
[ -f ".editorconfig" ] && echo "✓ EditorConfig found" || echo "❌ No .editorconfig"
```

## 6. Identify Documentation Gaps

### Step 6: Compare Codebase vs Documentation

```bash
echo "=== Identifying documentation gaps ==="

# Count actual components vs documented components
echo "--- Component documentation coverage ---"
if [ -d "src" ]; then
  COMPONENT_COUNT=$(find src -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v test | wc -l)
  echo "Source files found: $COMPONENT_COUNT"
  
  if [ -d "docs/components" ]; then
    DOC_COUNT=$(find docs/components -name "*.md" | wc -l)
    echo "Component docs found: $DOC_COUNT"
    echo "Coverage: $((DOC_COUNT * 100 / COMPONENT_COUNT))%"
  else
    echo "❌ NO COMPONENT DOCUMENTATION DIRECTORY"
  fi
fi

# Check for undocumented features from previous analyses
echo "--- Cross-checking with previous analyses ---"
if [ -f "docs/code-review/1-CODEBASE_OVERVIEW.md" ]; then
  echo "Checking features from codebase overview..."
  # This would compare features found vs documented
fi

if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  echo "Checking if security measures are documented..."
  # Look for security documentation
  SECURITY_DOCS=$(find . -name "*security*" -o -name "*SECURITY*" | grep -i "\.md" | grep -v code-review | wc -l)
  [ "$SECURITY_DOCS" -eq 0 ] && echo "❌ NO SECURITY DOCUMENTATION"
fi

# Check for missing operational docs
echo "--- Operational documentation gaps ---"
[ ! -f "docs/DEPLOYMENT.md" ] && [ ! -f "DEPLOYMENT.md" ] && echo "❌ NO DEPLOYMENT DOCUMENTATION"
[ ! -f "docs/MONITORING.md" ] && [ ! -f "MONITORING.md" ] && echo "❌ NO MONITORING DOCUMENTATION"
[ ! -f "TROUBLESHOOTING.md" ] && echo "❌ NO TROUBLESHOOTING GUIDE"
```

## 7. Generate Evidence-Based Documentation Report

### CRITICAL: Document Only Discovered Gaps

Create `docs/code-review/13-DOCUMENTATION_GAPS.md` with ONLY verified findings:

````markdown
# Documentation Gap Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Documentation Files Found**: [Count from Step 1]
**Standard Docs Present**: [List from checks]
**Critical Gaps Identified**: [Count]

## Executive Summary

**Documentation Coverage Status**:
- README.md: [Exists/Missing - with section gaps if exists]
- API Documentation: [Coverage percentage based on endpoints]
- Setup Documentation: [Complete/Partial/Missing]
- Development Guide: [Complete/Partial/Missing]

## Verified Documentation Gaps

[Only document if found in Steps 1-6]

### Missing Core Documentation
❌ NO README.md [if not found]
❌ NO LICENSE file [if not found]
❌ NO CONTRIBUTING.md [if not found]
❌ NO API documentation [if not found]

### README.md Gaps
[Only if README exists but missing sections]
- Missing installation instructions
- No usage examples (0 code blocks found)
- No contributing section
- Incorrect setup commands (mentions npm but no package.json)

### API Documentation Gaps
[Only if API endpoints found but not documented]
- Endpoints discovered: [Count from analysis]
- Endpoints documented: [Count]
- Coverage: [X]%
- Missing endpoints: [List specific undocumented endpoints]

### Setup Documentation Issues
[Only if setup docs exist but incomplete]
- Missing environment variable documentation
- No database setup instructions
- Missing dependency installation steps

### Development Documentation Gaps
[Only if missing critical sections]
- No testing guidelines
- Missing code style guide
- No debugging instructions

## Documentation Accuracy Issues

[Only document verified inaccuracies]

### Outdated Information
- README mentions [X] but codebase uses [Y]
- Setup guide references old dependencies

### Missing Operational Documentation
❌ NO deployment guide
❌ NO monitoring documentation
❌ NO troubleshooting guide
❌ NO security documentation

## NOT GENERATED (No Gaps Found)

[List what documentation was checked and found complete]
- ✓ README.md exists with all sections
- ✓ API fully documented
- ✓ Setup guide complete

## Evidence-Based Recommendations

### Immediate Actions (Critical Gaps)

[Only for actual gaps found]
1. **Create README.md**
   - Project has no README file
   - Include: description, setup, usage, contributing

2. **Document [X] API endpoints**
   - Found in: [files]
   - Currently undocumented
   - Priority: Authentication and core endpoints

3. **Add setup documentation**
   - No installation instructions found
   - Project type: [detected type]
   - Required sections: dependencies, environment, database

### Quality Improvements

[Only for existing but incomplete docs]
1. **Update README.md**
   - Add missing sections: [list]
   - Fix incorrect commands: [list]
   - Add code examples

2. **Expand API documentation**
   - Add request/response examples
   - Document error codes
   - Include authentication details

## Validation Checklist

Before creating any documentation:
- [ ] Gap verified through discovery scan
- [ ] No existing documentation covers this
- [ ] Content based on actual codebase
- [ ] Examples from real code, not templates
- [ ] Accuracy verified against current code
````

## 8. Generate Only Missing Documentation

### Step 8: Create Documentation Only for Verified Gaps

```bash
echo "=== Generating documentation for verified gaps only ==="

# Only generate if critical gaps were found
if [ "$DOC_COUNT" -eq 0 ] || [ ! -f "README.md" ]; then
  echo "CRITICAL: No documentation found - would generate:"
  echo "  - README.md with basic structure"
  echo "  - LICENSE file"
  echo "  - Basic setup instructions"
  # Note: Actual generation would happen here based on project type
fi

# Only generate API docs if endpoints are undocumented
if [ "$ANALYZED_ENDPOINTS" -gt 0 ] && [ "$DOCUMENTED_ENDPOINTS" -eq 0 ]; then
  echo "Would generate API documentation for $ANALYZED_ENDPOINTS endpoints"
  # Note: Would extract actual endpoint details from code
fi

# Document what WON'T be generated
echo "--- Documentation NOT generated (already exists or no gap) ---"
[ -f "README.md" ] && echo "✓ README.md already exists"
[ -n "$API_DOC_FILES" ] && echo "✓ API documentation already exists"
[ -n "$SETUP_DOCS" ] && echo "✓ Setup documentation already exists"
```

```
memory_store_chunk
content="Documentation gap analysis completed. Found: [X] missing docs, [Y] incomplete sections, [Z] outdated references. Generated only missing documentation."
session_id="doc-analyzer-$(date +%s)"
repository="github.com/org/repo"
tags=["documentation", "gaps", "analysis", "verified"]

memory_store_decision
decision="Documentation generation: [generated X files | no generation needed]"
rationale="Based on gap analysis: [specific gaps found]. Existing docs: [count]. Missing critical docs: [list]"
context="Most critical gap: [specific missing documentation]"
session_id="doc-analyzer-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="doc-analyzer-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Discovery First**: Always check what documentation exists before generating
- **Gap-Based Generation**: Only create documentation for verified gaps
- **Accuracy Verification**: Check existing docs against actual codebase
- **Evidence Required**: Every gap must be verified through discovery
- **No Templates**: Generate based on actual code structure and needs
- **Language Agnostic**: Adapts discovery to any project type

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Documentation Gap Analysis Findings

**Analysis Date**: [Date]
**Documentation Files Found**: [Count]
**Critical Gaps**: [Count with evidence]
**API Coverage**: [X% documented]

### 🔴 CRITICAL (Immediate Action Required)
[Only if core docs missing]
- [ ] **Create README.md**: Project has no README file
  - **Evidence**: find . -name "README*" returned 0 results
  - **Impact**: New developers cannot onboard
  - **Effort**: 2-4 hours
  - **Content**: Project description, setup, usage, contributing

### 🟡 HIGH (Sprint Priority)
[Only for verified gaps]
- [ ] **Document [X] API endpoints**: Found but undocumented
  - **Evidence**: [X] endpoints in code, 0 in docs
  - **Missing**: [List specific endpoints]
  - **Effort**: 1 hour per endpoint
  - **Files**: `[actual API files]`

### 🟢 MEDIUM (Backlog)
[Only for actual findings]
- [ ] **Update outdated setup instructions**: Commands don't match project
  - **Evidence**: README mentions npm but project uses yarn
  - **Current**: "npm install" in README
  - **Should be**: "yarn install" (found yarn.lock)
  - **Effort**: 30 minutes

### 🔵 LOW (Future Consideration)
[Minor gaps with evidence]
- [ ] **Add code examples to README**: Currently has 0 examples
  - **Evidence**: grep -c '```' README.md returned 0
  - **Benefit**: Better developer onboarding
  - **Effort**: 1 hour

### ❌ MISSING DOCUMENTATION
- [ ] **No API documentation**
  - **Searched**: find . -name "*api*.md" found 0 files
  - **Impact**: [X] endpoints undocumented
- [ ] **No setup guide**  
  - **Searched**: docs/SETUP.md, INSTALL.md - not found
  - **Impact**: Unclear installation process

### Implementation Rules
1. ONLY create todos for gaps found in discovery scans
2. EVERY gap must include the search/check that found it
3. EVERY update must show current vs correct content
4. NO hypothetical documentation needs
5. Include specific locations and evidence
6. Tag with `#documentation #gaps #verified`
```

### Implementation
1. If `code-review-todo-list.md` doesn't exist, create it with proper header
2. Append only verified gaps with evidence
3. Include discovery commands that found each gap
4. Reference actual missing sections or files