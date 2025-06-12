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

You are a supply chain security expert specializing in dependency management and vulnerability assessment. Analyze dependency health and security risks.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #7 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read all previous outputs `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/6-SECURITY_ANALYSIS.md` if they exist
- Use tech stack analysis from overview to focus dependency assessment
- Reference architectural dependencies to understand supply chain attack surface
- Incorporate security vulnerabilities to prioritize dependency security
- Align dependency monitoring with API and database requirements

**Output Review:**
- If `docs/code-review/7-DEPENDENCY_HEALTH.md` already exists:
  1. Read and analyze the existing output first
  2. Cross-reference with tech stack, API, database, and security changes from prompts 0-6
  3. Update dependency analysis for new packages and versions
  4. Verify vulnerability assessments against current security findings
  5. Add supply chain considerations for business-critical dependencies

**Chain Coordination:**
- Store findings in memory MCP with tags: `["supply-chain", "dependencies", "security", "prompt-7"]`
- Focus dependency analysis on components identified in foundational analysis
- Prioritize dependency security based on vulnerability findings and business criticality
- Create dependency monitoring aligned with security and performance requirements

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

## 1. Dependency Discovery

### Find Package Manifests

```bash
# Detect package managers
find . -name "package.json" -o -name "go.mod" -o -name "requirements.txt" -o -name "pom.xml" | head -10

# Count dependencies
cat package.json | jq '.dependencies | length' 2>/dev/null || echo "No package.json"
go list -m all | wc -l 2>/dev/null || echo "No Go modules"
pip freeze | wc -l 2>/dev/null || echo "No pip packages"
```

## 2. Security Vulnerability Scanning

### Run Security Audits

```bash
# Language-specific audits
npm audit --json > npm-audit.json 2>/dev/null || echo "No npm audit"
safety check --json > safety-report.json 2>/dev/null || echo "No safety"
go run github.com/sonatypecommunity/nancy@latest sleuth > nancy-report.txt 2>/dev/null || echo "No nancy"

# Extract critical vulnerabilities
grep -r "CVE-" *.json *.txt 2>/dev/null | head -10
jq '.vulnerabilities | map(select(.severity == "critical" or .severity == "high"))' npm-audit.json 2>/dev/null | head -5
```

## 3. Maintenance & Abandonment Detection

### Check Package Health

```bash
# Find packages not updated in 2+ years
npm list --depth=0 --json 2>/dev/null | jq -r '.dependencies | keys[]' | head -10 | while read pkg; do
  last_update=$(npm view $pkg time.modified 2>/dev/null)
  if [ ! -z "$last_update" ]; then
    echo "$pkg: $last_update"
  fi
done | head -10

# Check for deprecated packages
npm list --depth=0 2>/dev/null | grep -i "deprecated" | head -5
```

## 4. License Compliance Check

### Scan Licenses

```bash
# Find license issues
npx license-checker --json > licenses.json 2>/dev/null || echo "No license-checker"
npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;ISC' --failOn 'GPL;AGPL' 2>/dev/null || echo "License conflicts found"

# Extract license summary
jq -r '.[] | "\(.licenses) - \(.name)"' licenses.json 2>/dev/null | sort | uniq -c | head -10
```

## 5. Update Strategy Analysis

### Check Outdated Packages

```bash
# Find outdated packages
npm outdated --json > outdated.json 2>/dev/null || echo "No outdated check"
go list -u -m all 2>/dev/null | grep '\[' | head -10
pip list --outdated 2>/dev/null | head -10

# Categorize update types
jq '. | to_entries | map({
  package: .key,
  current: .value.current,
  latest: .value.latest,
  type: (if .value.current == .value.latest then "current"
         elif (.value.latest | split(".")[0]) == (.value.current | split(".")[0]) then "minor"
         else "major" end)
})' outdated.json 2>/dev/null | head -20
```

## 6. Generate Dependency Health Report

### Create Security Assessment

````bash
cat > docs/code-review/7-DEPENDENCY_HEALTH.md << 'EOF'
# Dependency Health Analysis

## Executive Summary
**Health Score**: [A-F Grade]
**Total Dependencies**: [count]
**Critical Vulnerabilities**: [count]
**Abandoned Packages**: [count]
**License Issues**: [count]

## Critical Findings

### 🔴 IMMEDIATE ACTION REQUIRED
- [ ] [X] critical security vulnerabilities
- [ ] [Y] abandoned packages need replacement
- [ ] [Z] GPL license conflicts

### 🟡 HIGH PRIORITY
- [ ] [A] packages severely outdated (2+ years)
- [ ] [B] packages with single maintainer
- [ ] [C] major version updates available

## Security Vulnerabilities

### Critical Issues
| Package | CVE | Severity | Current | Fixed | Impact |
|---------|-----|----------|---------|--------|--------|
| [package] | [cve] | Critical | [version] | [version] | [description] |

### Remediation Commands
```bash
# Fix critical vulnerabilities
npm audit fix
npm install package@latest

# For manual fixes
npm install lodash@4.17.21
npm install axios@0.21.4
````

## Abandoned Packages

### Packages to Replace Immediately

| Package   | Last Update | Downloads  | Status     | Alternative |
| --------- | ----------- | ---------- | ---------- | ----------- |
| node-uuid | 4 years ago | Declining  | Archived   | uuid        |
| request   | 3 years ago | Deprecated | Deprecated | axios       |

### Migration Examples

```diff
- const uuid = require('node-uuid');
+ const { v4: uuidv4 } = require('uuid');

- const request = require('request');
+ const axios = require('axios');
```

## License Compliance

### License Distribution

- MIT: [count] packages
- Apache-2.0: [count] packages
- BSD: [count] packages
- GPL (❌ CONFLICT): [count] packages
- Unknown: [count] packages

### Actions Required

1. Replace GPL packages: [list]
2. Investigate unknown licenses: [list]
3. Document license compatibility

## Update Strategy

### Priority Matrix

**P0 - Security Critical**: [list packages]
**P1 - Major Updates**: [list packages]
**P2 - Minor Updates**: [list packages]

### Update Schedule

| Phase   | Packages               | Effort | Timeline    |
| ------- | ---------------------- | ------ | ----------- |
| Week 1  | Security patches       | 8h     | Immediate   |
| Week 2  | Abandoned replacements | 24h    | Required    |
| Month 1 | Minor updates          | 16h    | Recommended |

## Technical Debt Calculation

```
Security Remediation: $2,000 (10 hours)
Abandoned Replacements: $4,000 (20 hours)
Major Updates: $8,000 (40 hours)
License Compliance: $1,000 (5 hours)
─────────────────────────────────────
Total Technical Debt: $15,000 (75 hours)
```

## Automated Monitoring

### Package Scripts

```json
{
  "scripts": {
    "deps:audit": "npm audit && safety check",
    "deps:outdated": "npm outdated",
    "deps:licenses": "license-checker --onlyAllow 'MIT;Apache-2.0;BSD;ISC'",
    "deps:health": "node scripts/dependency-health-check.js"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/dependency-check.yml
name: Dependency Security Check
on:
  schedule:
    - cron: "0 0 * * *" # Daily
  pull_request:
    paths: ["package*.json", "go.mod", "requirements.txt"]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security audit
        run: npm audit --audit-level=high
      - name: License check
        run: npx license-checker --failOn 'GPL;AGPL'
```

## Recommendations

### Immediate Actions (This Week)

1. 🚨 **Fix critical vulnerabilities**

   ```bash
   npm audit fix
   npm test  # Verify fixes don't break anything
   ```

2. 🚨 **Replace abandoned packages**

   - node-uuid → uuid
   - request → axios
   - phantomjs → puppeteer

3. 🚨 **Remove GPL dependencies**

### Short Term (This Month)

1. **Implement monitoring**

   - Daily security scans
   - Automated outdated package detection
   - License compliance checks

2. **Update strategies**
   - Create update testing procedures
   - Document breaking change migrations
   - Establish dependency approval process

### Long Term (This Quarter)

1. **Dependency governance**

   - Approval process for new dependencies
   - Regular dependency review meetings
   - Security response procedures

2. **Reduce dependency count**
   - Audit necessity of each package
   - Combine similar functionality
   - Prefer standard library solutions
     EOF

# Create monitoring script

cat > scripts/dependency-monitor.js << 'EOF'
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

class DependencyMonitor {
async checkSecurity() {
try {
execSync('npm audit --audit-level=high', { stdio: 'inherit' });
return { status: 'pass', vulnerabilities: 0 };
} catch (error) {
return { status: 'fail', vulnerabilities: 'detected' };
}
}

async checkOutdated() {
try {
const result = execSync('npm outdated --json', { encoding: 'utf8' });
const outdated = JSON.parse(result || '{}');
return Object.keys(outdated).length;
} catch (error) {
return 0;
}
}

async checkLicenses() {
try {
execSync('npx license-checker --onlyAllow "MIT;Apache-2.0;BSD;ISC"', { stdio: 'inherit' });
return { status: 'compliant' };
} catch (error) {
return { status: 'violations' };
}
}

async generateReport() {
const security = await this.checkSecurity();
const outdated = await this.checkOutdated();
const licenses = await this.checkLicenses();

    const report = {
      timestamp: new Date().toISOString(),
      security,
      outdatedPackages: outdated,
      licenses,
      overallHealth: this.calculateHealth(security, outdated, licenses)
    };

    fs.writeFileSync('docs/code-review/dependency-health-report.json', JSON.stringify(report, null, 2));
    console.log('Dependency health report generated');
    return report;

}

calculateHealth(security, outdated, licenses) {
if (security.status === 'fail') return 'CRITICAL';
if (licenses.status === 'violations') return 'HIGH_RISK';
if (outdated > 10) return 'MEDIUM_RISK';
return 'HEALTHY';
}
}

if (require.main === module) {
new DependencyMonitor().generateReport();
}

module.exports = DependencyMonitor;
EOF

chmod +x scripts/dependency-monitor.js

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
