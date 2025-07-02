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

You are a supply chain security expert specializing in dependency management and vulnerability assessment. Your goal is to discover and analyze ACTUAL dependencies through systematic exploration of package manifests.

## 🚨 CRITICAL: Discovery-First Dependency Analysis

**MANDATORY PROCESS:**
1. **DISCOVER** actual package manifests in the codebase
2. **ANALYZE** real dependencies with specific versions
3. **VERIFY** actual vulnerabilities through security scanning
4. **ASSESS** real license and maintenance issues
5. **NEVER** create hypothetical dependency lists or example CVEs

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #8 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-7 if they exist
- **VERIFY**: Technology stack from previous analyses to focus scanning
- **USE**: Only package managers actually present in the codebase
- **SCAN**: Real dependency files found through discovery
- **REJECT**: Any example packages or CVEs not found in actual scans

**Evidence Requirements:**
- Every dependency MUST come from actual manifest files
- Every vulnerability MUST have scan output evidence
- Every abandoned package MUST show actual last update date
- Every license issue MUST reference actual package
- NO example packages like "node-uuid" without evidence

**Chain Foundation:**
- Store only verified dependencies with tags: `["dependencies", "supply-chain", "verified", "prompt-8"]`
- Document actual vulnerabilities for remediation tracking
- Include exact package versions for update planning

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/7-DEPENDENCY_HEALTH.md` - Complete dependency security and health report
- `scripts/dependency-monitor.js` - Automated monitoring script

**IMPORTANT RULES:**

- Focus on critical security vulnerabilities first
- Identify abandoned and outdated packages
- Check license compliance issues
- Quantify technical debt and update effort

## 0. Session Initialization

```
memory_tasks session_create session_id="vendor-sec-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"dependencies packages libraries frameworks","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings First

### Step 1: Load Technology Stack from Prior Analysis

```bash
# FIRST: Check what technology was discovered in previous analyses
echo "=== Loading technology stack from previous analyses ==="

if [ -f "docs/code-review/1-CODEBASE_OVERVIEW.md" ]; then
  echo "Technology stack from overview:"
  grep -E "Language:|Framework:|Package Manager:" docs/code-review/1-CODEBASE_OVERVIEW.md || echo "No tech stack info found"
fi

# Look for actual security findings related to dependencies
if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  echo "Dependency vulnerabilities from security analysis:"
  grep -E "npm audit|vulnerable packages|CVE-" docs/code-review/7-SECURITY_ANALYSIS.md || echo "No dependency vulnerabilities mentioned"
fi
```

## 2. Discover Actual Package Manifests

### Step 2: Find Real Dependency Files

```bash
echo "=== Discovering package manifests in codebase ==="

# Search for actual package manifest files
PACKAGE_FILES=""

# Node.js/npm
if [ -f "package.json" ]; then
  echo "✓ FOUND: package.json (Node.js/npm)"
  PACKAGE_FILES="$PACKAGE_FILES package.json"
  # Check for lock file
  [ -f "package-lock.json" ] && echo "  ✓ Lock file: package-lock.json"
  [ -f "yarn.lock" ] && echo "  ✓ Lock file: yarn.lock"
fi

# Go
if [ -f "go.mod" ]; then
  echo "✓ FOUND: go.mod (Go modules)"
  PACKAGE_FILES="$PACKAGE_FILES go.mod"
  [ -f "go.sum" ] && echo "  ✓ Lock file: go.sum"
fi

# Python
if [ -f "requirements.txt" ]; then
  echo "✓ FOUND: requirements.txt (Python/pip)"
  PACKAGE_FILES="$PACKAGE_FILES requirements.txt"
fi
if [ -f "Pipfile" ]; then
  echo "✓ FOUND: Pipfile (Python/pipenv)"
  PACKAGE_FILES="$PACKAGE_FILES Pipfile"
  [ -f "Pipfile.lock" ] && echo "  ✓ Lock file: Pipfile.lock"
fi
if [ -f "pyproject.toml" ]; then
  echo "✓ FOUND: pyproject.toml (Python/poetry)"
  PACKAGE_FILES="$PACKAGE_FILES pyproject.toml"
fi

# Java
if [ -f "pom.xml" ]; then
  echo "✓ FOUND: pom.xml (Java/Maven)"
  PACKAGE_FILES="$PACKAGE_FILES pom.xml"
fi
if [ -f "build.gradle" ]; then
  echo "✓ FOUND: build.gradle (Java/Gradle)"
  PACKAGE_FILES="$PACKAGE_FILES build.gradle"
fi

# Ruby
if [ -f "Gemfile" ]; then
  echo "✓ FOUND: Gemfile (Ruby)"
  PACKAGE_FILES="$PACKAGE_FILES Gemfile"
  [ -f "Gemfile.lock" ] && echo "  ✓ Lock file: Gemfile.lock"
fi

if [ -z "$PACKAGE_FILES" ]; then
  echo "❌ NO PACKAGE MANIFESTS FOUND"
  exit 0
fi

# Count actual dependencies
echo "=== Analyzing dependency counts ==="
if [ -f "package.json" ]; then
  DEP_COUNT=$(jq '.dependencies | length' package.json 2>/dev/null || echo "0")
  DEV_DEP_COUNT=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "0")
  echo "Node.js: $DEP_COUNT dependencies, $DEV_DEP_COUNT devDependencies"
fi
```

## 3. Run Actual Security Vulnerability Scans

### Step 3: Scan Only for Discovered Package Managers

```bash
echo "=== Running security scans for discovered package managers ==="

# Node.js/npm vulnerability scan
if [ -f "package.json" ]; then
  echo "--- Running npm audit ---"
  npm audit --json > temp-npm-audit.json 2>/dev/null || echo "npm audit failed or not available"
  
  if [ -f "temp-npm-audit.json" ] && [ -s "temp-npm-audit.json" ]; then
    # Extract actual vulnerabilities
    VULN_COUNT=$(jq '.metadata.vulnerabilities | add' temp-npm-audit.json 2>/dev/null || echo "0")
    if [ "$VULN_COUNT" != "0" ] && [ "$VULN_COUNT" != "null" ]; then
      echo "FOUND $VULN_COUNT vulnerabilities:"
      # Show actual vulnerable packages
      jq -r '.vulnerabilities | to_entries[] | "\(.key) - Severity: \(.value.severity) - \(.value.via[0].title // "No title")"' temp-npm-audit.json 2>/dev/null | head -10
    else
      echo "✓ No vulnerabilities found in npm packages"
    fi
  fi
fi

# Python vulnerability scan
if [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
  echo "--- Running Python safety check ---"
  safety check --json > temp-safety-report.json 2>/dev/null || echo "safety not installed or scan failed"
  
  if [ -f "temp-safety-report.json" ] && [ -s "temp-safety-report.json" ]; then
    # Extract actual vulnerabilities
    python -c "import json; data=json.load(open('temp-safety-report.json')); print(f'Found {len(data)} vulnerabilities')" 2>/dev/null
  fi
fi

# Go vulnerability scan
if [ -f "go.mod" ]; then
  echo "--- Running Go vulnerability check ---"
  govulncheck ./... > temp-go-vulncheck.txt 2>&1 || echo "govulncheck not installed"
  
  if [ -f "temp-go-vulncheck.txt" ] && grep -q "Vulnerability" temp-go-vulncheck.txt 2>/dev/null; then
    echo "Go vulnerabilities found:"
    grep -A2 "Vulnerability" temp-go-vulncheck.txt | head -20
  else
    echo "✓ No vulnerabilities found in Go modules"
  fi
fi

# Clean up temp files
rm -f temp-npm-audit.json temp-safety-report.json temp-go-vulncheck.txt
```

## 4. Check Actual Package Maintenance Status

### Step 4: Analyze Real Package Health

```bash
echo "=== Checking maintenance status of actual dependencies ==="

# For npm packages - check actual last update dates
if [ -f "package.json" ]; then
  echo "--- Checking npm package maintenance ---"
  
  # Extract actual dependency names
  DEPS=$(jq -r '.dependencies | keys[]' package.json 2>/dev/null)
  
  if [ -n "$DEPS" ]; then
    echo "Checking last update for dependencies:"
    CHECKED=0
    for pkg in $(echo "$DEPS" | head -10); do
      # Get actual last publish date
      LAST_UPDATE=$(npm view "$pkg" time.modified 2>/dev/null)
      if [ -n "$LAST_UPDATE" ]; then
        echo "$pkg: Last updated $LAST_UPDATE"
        # Check if older than 2 years
        if [ -n "$LAST_UPDATE" ]; then
          UPDATE_YEAR=$(echo "$LAST_UPDATE" | cut -d'-' -f1)
          CURRENT_YEAR=$(date +%Y)
          AGE=$((CURRENT_YEAR - UPDATE_YEAR))
          [ $AGE -ge 2 ] && echo "  ⚠️  WARNING: Not updated in $AGE years"
        fi
      fi
    done
  fi
  
  # Check for deprecated packages
  echo "--- Checking for deprecated packages ---"
  npm ls 2>&1 | grep -i "deprecated" | head -5 || echo "No deprecated packages found"
fi

# For Python packages
if [ -f "requirements.txt" ]; then
  echo "--- Checking Python package maintenance ---"
  # Note: Checking maintenance status for Python packages requires additional tools
  echo "Consider using 'pip-audit' or manual PyPI checks for maintenance status"
fi
```

## 5. License Compliance Check

### Step 5: Scan Actual Package Licenses

```bash
echo "=== Checking license compliance of actual dependencies ==="

# Only run license checks if we found package managers
if [ -n "$PACKAGE_FILES" ]; then
  # For npm projects
  if [ -f "package.json" ]; then
    echo "--- Checking npm package licenses ---"
    npx license-checker --json > temp-licenses.json 2>/dev/null || echo "license-checker not available"
    
    if [ -f "temp-licenses.json" ] && [ -s "temp-licenses.json" ]; then
      # Check for actual GPL/AGPL violations
      GPL_PACKAGES=$(jq -r 'to_entries[] | select(.value.licenses | test("GPL|AGPL")) | "\(.key) - \(.value.licenses)"' temp-licenses.json 2>/dev/null)
      if [ -n "$GPL_PACKAGES" ]; then
        echo "⚠️  FOUND GPL/AGPL PACKAGES:"
        echo "$GPL_PACKAGES"
      else
        echo "✓ No GPL/AGPL license conflicts found"
      fi
      
      # Show actual license distribution
      echo "--- License Distribution ---"
      jq -r '.[] | .licenses' temp-licenses.json 2>/dev/null | sort | uniq -c | sort -rn | head -10
    fi
  fi
  
  # For Python projects
  if [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
    echo "--- Python License Check ---"
    pip-licenses --format=json > temp-py-licenses.json 2>/dev/null || echo "pip-licenses not installed"
  fi
  
  # Clean up
  rm -f temp-licenses.json temp-py-licenses.json
fi
```

## 6. Update Strategy Analysis

### Step 6: Check for Actual Outdated Packages

```bash
echo "=== Analyzing outdated packages in discovered manifests ==="

# For npm projects - check actual outdated packages
if [ -f "package.json" ]; then
  echo "--- Checking npm outdated packages ---"
  npm outdated --json > temp-outdated.json 2>/dev/null || echo "npm outdated check failed"
  
  if [ -f "temp-outdated.json" ] && [ -s "temp-outdated.json" ]; then
    # Count actual outdated packages
    OUTDATED_COUNT=$(jq 'length' temp-outdated.json 2>/dev/null || echo "0")
    echo "Found $OUTDATED_COUNT outdated packages"
    
    if [ "$OUTDATED_COUNT" -gt "0" ]; then
      # Categorize actual update types
      echo "--- Update Categories ---"
      jq -r 'to_entries[] | 
        .key as $pkg | 
        .value | 
        "\($pkg): \(.current) → \(.latest) (" + 
        (if (.latest | split(".")[0]) == (.current | split(".")[0]) then 
          if (.latest | split(".")[1]) == (.current | split(".")[1]) then "patch" 
          else "minor" end
        else "MAJOR" end) + ")"' temp-outdated.json 2>/dev/null | head -10
    fi
  fi
  rm -f temp-outdated.json
fi

# For Go projects - check actual module updates
if [ -f "go.mod" ]; then
  echo "--- Checking Go module updates ---"
  go list -u -m all 2>/dev/null | grep '\[' | head -10 || echo "No Go updates available or go not installed"
fi

# For Python projects
if [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
  echo "--- Checking Python package updates ---"
  pip list --outdated --format=json 2>/dev/null > temp-py-outdated.json || echo "pip outdated check failed"
  
  if [ -f "temp-py-outdated.json" ] && [ -s "temp-py-outdated.json" ]; then
    PY_OUTDATED=$(jq 'length' temp-py-outdated.json 2>/dev/null || echo "0")
    echo "Found $PY_OUTDATED outdated Python packages"
    jq -r '.[] | "\(.name): \(.version) → \(.latest_version)"' temp-py-outdated.json 2>/dev/null | head -10
  fi
  rm -f temp-py-outdated.json
fi
```

## 7. Generate Evidence-Based Dependency Health Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/8-DEPENDENCY_HEALTH.md` with ONLY verified findings:

````markdown
# Dependency Health Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Package Managers Found**: [List from Step 2]
**Total Dependencies Analyzed**: [Actual count]
**Vulnerabilities Found**: [Count from Step 3]
**License Issues Found**: [Count from Step 5]

## Executive Summary

**IMPORTANT**: Health score based on actual scan results only.

**Package Manager Status**:
[List only discovered package managers and their status]

**Security Status**:
- Critical vulnerabilities: [Actual count from scans]
- High vulnerabilities: [Actual count]
- License conflicts: [Actual count]

## Verified Security Vulnerabilities

[Only document if found in Step 3]

### NPM Audit Results
**Vulnerabilities Found**: [Count]

[If vulnerabilities found, paste actual npm audit output]

### Go Module Vulnerabilities
[Only if govulncheck found issues]

### Python Package Vulnerabilities
[Only if safety check found issues]

## Package Maintenance Status

[Only document if found in Step 4]

### Packages Not Updated in 2+ Years
[List actual packages with evidence]
- `[package]`: Last updated [date from npm view]
  - Current version: [version]
  - Age: [calculated years]

### Deprecated Packages
[Only list if actually found by npm ls]

## License Compliance

[Only document if found in Step 5]

### License Distribution
[Paste actual license distribution from scan]

### GPL/AGPL Conflicts Found
[Only if GPL packages were detected]
- `[package]`: [license type]
  - Risk: License incompatibility with proprietary code

## Update Strategy

[Only document if found in Step 6]

### Outdated Packages Summary
- Total outdated: [Actual count]
- Major updates needed: [Count]
- Minor updates available: [Count]
- Patch updates available: [Count]

### Critical Updates Required
[List only actual outdated packages found]

| Package | Current | Latest | Type | Last Updated |
|---------|---------|--------|------|--------------|
| [Only actual packages from scan] |

## NOT FOUND (Checked But Missing)

### Security Features Not Detected
- ❌ No vulnerability scanning in CI/CD
- ❌ No automated dependency updates
- ❌ No license policy enforcement

### Expected But Missing
- ❌ No .snyk configuration found
- ❌ No dependabot.yml found
- ❌ No renovate configuration found

## Remediation Commands

[Only include commands for actual issues found]

### Fix Discovered Vulnerabilities
```bash
# Based on actual scan results
[Only commands for real vulnerabilities]
```

### Update Outdated Packages
```bash
# For packages actually found outdated
[Specific update commands]
```

## Automated Monitoring

[Only include if vulnerabilities or issues were found]

### Recommended Scripts

```json
{
  "scripts": {
    "deps:audit": "[Command based on discovered package manager]",
    "deps:outdated": "[Command based on discovered package manager]",
    "deps:licenses": "[Command based on discovered package manager]"
  }
}
```

### CI/CD Integration

[Only suggest for discovered package managers]

```yaml
# Example for discovered package manager
name: Dependency Security Check
on:
  schedule:
    - cron: "0 0 * * *"
  pull_request:
    paths: ["[actual manifest files found]"]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security audit
        run: [actual audit command for discovered manager]
```

## Evidence-Based Recommendations

[Only include recommendations for actual issues found]

### Immediate Actions (Based on Findings)

[If critical vulnerabilities found]
1. **Fix [count] critical vulnerabilities**
   - Run: [specific fix command]
   - Affects: [list actual packages]

[If abandoned packages found]
2. **Replace [count] abandoned packages**
   - [List actual abandoned packages with replacements]

[If license conflicts found]
3. **Resolve [count] license conflicts**
   - [List actual GPL/AGPL packages found]

### Validation Before Report

```bash
echo "=== Validating dependency findings ===="

# Count actual findings
VULN_COUNT=$(grep -c "vulnerabilities found" dependency-scan.log 2>/dev/null || echo "0")
ABANDONED_COUNT=$(grep -c "years ago" dependency-scan.log 2>/dev/null || echo "0")
LICENSE_ISSUES=$(grep -c "GPL" dependency-scan.log 2>/dev/null || echo "0")
OUTDATED_COUNT=$(grep -c "outdated" dependency-scan.log 2>/dev/null || echo "0")

echo "Documented findings:"
echo "- Vulnerabilities: $VULN_COUNT"
echo "- Abandoned packages: $ABANDONED_COUNT"
echo "- License issues: $LICENSE_ISSUES"
echo "- Outdated packages: $OUTDATED_COUNT"
```

### Documentation Checklist

Before saving the dependency analysis:
- [ ] Every vulnerability has scan output evidence
- [ ] Every abandoned package has last update date
- [ ] Every license issue references actual package
- [ ] All outdated packages show current vs latest version
- [ ] No example packages (node-uuid, lodash, etc.) included
- [ ] "NOT FOUND" section lists expected but missing tools
````

## 8. Create Monitoring Script (Only If Issues Found)

### Only Create Script for Discovered Package Managers

```bash
# Only create monitoring script if issues were discovered
if [ "$VULN_COUNT" -gt 0 ] || [ "$ABANDONED_COUNT" -gt 0 ] || [ "$LICENSE_ISSUES" -gt 0 ]; then
  echo "Creating monitoring script for discovered issues..."
  
  # Determine which package manager to monitor
  MONITOR_TYPE=""
  if [ -f "package.json" ]; then
    MONITOR_TYPE="npm"
  elif [ -f "go.mod" ]; then
    MONITOR_TYPE="go"
  elif [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
    MONITOR_TYPE="python"
  fi
  
  if [ -n "$MONITOR_TYPE" ]; then
    cat > scripts/dependency-monitor.sh << 'EOF'
#!/bin/bash
# Dependency monitoring for discovered issues
# Package manager: [DETECTED_TYPE]
# Issues found: [VULN_COUNT] vulnerabilities, [ABANDONED_COUNT] abandoned, [LICENSE_ISSUES] license issues

echo "=== Dependency Health Check ==="
echo "Monitoring package manager: $MONITOR_TYPE"

# [Generate actual monitoring commands based on discovered package manager]
# [Include only checks for issues that were actually found]
EOF
    chmod +x scripts/dependency-monitor.sh
  fi
fi

```

```

memory_store_chunk
content="Dependency analysis completed. Security vulnerabilities: [count]. Abandoned packages: [count]. License issues: [count]. Technical debt: $[amount]"
  session_id="vendor-sec-$(date +%s)"
repository="github.com/org/repo"
tags=["dependencies", "security", "vulnerabilities", "licenses", "technical-debt"]

memory_store_decision
decision="Dependency health status: [healthy|at-risk|critical]"
rationale="Found [X] critical vulnerabilities, [Y] abandoned packages, [Z] license conflicts. Priority: fix security issues first"
context="Most critical issues: [specific packages/vulnerabilities requiring immediate attention]"
session_id="vendor-sec-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="vendor-sec-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Security First**: Always prioritize critical vulnerabilities and security patches
- **Abandonment Risk**: Focus on packages with no maintainer activity in 2+ years
- **License Compliance**: Check for GPL/AGPL conflicts that could cause legal issues
- **Automation**: Set up monitoring to catch issues early in CI/CD pipeline
- **Language Agnostic**: Adapts to npm, pip, Go modules, Maven, and other package managers
```


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Dependency Security Analysis Findings

**Analysis Date**: [Date]
**Package Managers Found**: [List discovered]
**Dependencies Scanned**: [Count]
**Issues Found**: [Total count with breakdown]

### 🔴 CRITICAL (Immediate Action Required)
[Only if critical vulnerabilities found with evidence]
- [ ] **Fix [CVE-ID] in [package]**: Severity [score]
  - **Evidence**: Found by [npm audit/govulncheck/safety]
  - **Current Version**: [version]
  - **Fixed Version**: [version]
  - **Effort**: 1-2 hours
  - **Command**: `[specific fix command]`

### 🟡 HIGH (Sprint Priority)
[Only for verified issues]
- [ ] **Replace abandoned [package]**: Last updated [date]
  - **Evidence**: npm view showed last publish [X] years ago
  - **Alternative**: [suggested replacement]
  - **Breaking Changes**: [Yes/No]
  - **Effort**: [estimate based on usage]

### 🟢 MEDIUM (Backlog)
[Only for actual findings]
- [ ] **Update [count] outdated packages**: Major versions behind
  - **Evidence**: npm outdated showed [list]
  - **Risk**: Potential security patches missing
  - **Effort**: [time based on breaking changes]

### 🔵 LOW (Future Consideration)
[Minor issues with evidence]
- [ ] **Configure automated dependency updates**
  - **Evidence**: No dependabot.yml or renovate config found
  - **Benefit**: Automated security patches
  - **Effort**: 2 hours setup

### ❌ MISSING SECURITY TOOLING
- [ ] **No automated vulnerability scanning**
  - **Searched**: .github/workflows/, CI config files
  - **Risk**: Vulnerabilities may go undetected
  - **Recommendation**: Add [npm audit/snyk/etc] to CI

### Implementation Rules
1. ONLY create todos for issues found in actual scans
2. EVERY vulnerability must reference the scanning tool that found it
3. EVERY abandoned package must show last update evidence
4. NO hypothetical vulnerabilities or example packages
5. Include specific commands to fix each issue
6. Tag with `#dependencies #security #verified`