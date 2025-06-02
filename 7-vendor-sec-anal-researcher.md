You are a world-class software supply chain security expert with expertise in dependency management, vulnerability assessment, and technical debt quantification. Conduct a thorough dependency health analysis.

## 0. Context Loading

```
# Load prior analyses
cat .claude/ARCHITECTURE_ANALYSIS.md
cat .claude/SECURITY_ANALYSIS.md
memory_search query="dependencies packages libraries frameworks" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

## 1. Dependency Discovery & Inventory

### Package Manager Detection

```
# Find package manifests
find . -name "package.json" -o -name "package-lock.json" -o -name "yarn.lock" -o -name "pnpm-lock.yaml"
find . -name "go.mod" -o -name "go.sum" -o -name "Gopkg.toml" -o -name "glide.yaml"
find . -name "requirements.txt" -o -name "Pipfile" -o -name "poetry.lock" -o -name "setup.py"
find . -name "pom.xml" -o -name "build.gradle" -o -name "Gemfile" -o -name "Cargo.toml"

# Count total dependencies
cat package.json | jq '.dependencies | length'
cat package.json | jq '.devDependencies | length'
```

### Dependency Tree Analysis

```
# Extract all dependencies with versions
npm list --depth=0 --json 2>/dev/null | jq '.dependencies | keys'
pip freeze | wc -l
go list -m all | wc -l

# Find direct vs transitive dependencies
npm list --depth=0 | grep -v "├─" | wc -l  # Direct
npm list | wc -l  # Total including transitive
```

```
memory_store_chunk
  content="Package managers: [list]. Total deps: [count]. Direct: [X], Transitive: [Y]. Languages: [list]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["dependencies", "inventory", "package-managers"]
```

## 2. Security Vulnerability Scanning

### Automated Security Checks

```
# Node.js/npm
npm audit --json > npm-audit.json
npm audit --production --json > npm-audit-prod.json

# Python
safety check --json > safety-report.json
pip-audit --desc > pip-audit.txt

# Go
nancy sleuth > nancy-report.txt
gosec -fmt json -out gosec-report.json ./...

# Ruby
bundle audit check > bundle-audit.txt

# General
snyk test --json > snyk-report.json
```

### CVE Analysis

```
# Extract CVE information
grep -r "CVE-" *.json *.txt | sort | uniq

# Check for critical vulnerabilities
jq '.vulnerabilities | map(select(.severity == "critical" or .severity == "high"))' npm-audit.json
```

### Vulnerable Package Details

```javascript
// Parse audit results
const auditData = JSON.parse(fs.readFileSync("npm-audit.json"));
const criticalVulns = auditData.vulnerabilities
  .filter((v) => v.severity === "critical" || v.severity === "high")
  .map((v) => ({
    package: v.name,
    severity: v.severity,
    cve: v.cves,
    fixAvailable: v.fixAvailable,
    directDependency: v.isDirect,
  }));
```

```
memory_store_chunk
  content="Vulnerabilities found: [count]. Critical: [X], High: [Y]. Direct deps affected: [list]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["dependencies", "security", "vulnerabilities", "cve"]
```

## 3. Maintenance & Abandonment Detection

### Last Update Analysis

```
# Check npm package last publish dates
npm view lodash time.modified
npm list --depth=0 --json | jq '.dependencies | keys[]' | xargs -I {} npm view {} time.modified

# Check for packages not updated in 2+ years
for pkg in $(npm list --depth=0 --json | jq -r '.dependencies | keys[]'); do
  last_update=$(npm view $pkg time.modified 2>/dev/null)
  if [ ! -z "$last_update" ]; then
    update_timestamp=$(date -d "$last_update" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S.%fZ" "$last_update" +%s 2>/dev/null)
    current_timestamp=$(date +%s)
    days_old=$(( ($current_timestamp - $update_timestamp) / 86400 ))
    if [ $days_old -gt 730 ]; then
      echo "$pkg: $days_old days since last update"
    fi
  fi
done
```

### Repository Health Checks

```
# Check GitHub metrics for packages
check_github_health() {
  local repo_url=$1
  # Extract owner/repo from npm package
  local github_url=$(npm view $1 repository.url | grep -o 'github.com/[^/]*/[^.]*' | head -1)

  if [ ! -z "$github_url" ]; then
    # Use GitHub API to check health
    curl -s "https://api.github.com/repos/${github_url#github.com/}" | jq '{
      archived: .archived,
      last_push: .pushed_at,
      open_issues: .open_issues_count,
      stars: .stargazers_count,
      forks: .forks_count
    }'
  fi
}
```

### Maintainer Analysis

```
# Check number of maintainers
npm view express maintainers | wc -l

# Check weekly downloads (popularity)
npm view express downloads

# Check for deprecated packages
npm list --depth=0 | grep -i "deprecated"
```

```
memory_store_decision
  decision="Dependency health: [healthy|at-risk|critical]"
  rationale="Found [X] abandoned packages, [Y] with single maintainer, [Z] deprecated"
  context="Most critical: [package] with [issue]"
  session_id="[session]"
  repository="github.com/org/repo"
```

## 4. License Compliance Analysis

### License Discovery

```
# Find all licenses
license-checker --json > licenses.json

# Check for problematic licenses
license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;BSD-2-Clause;ISC;CC0-1.0' --failOn 'GPL;AGPL;LGPL'

# Find unknown licenses
license-checker --unknown

# Extract license summary
jq -r '.[] | "\(.licenses) - \(.name)"' licenses.json | sort | uniq -c | sort -rn
```

### License Compatibility Matrix

```
# Check for license conflicts
grep -E "(GPL|AGPL|LGPL)" licenses.json
grep -E "(Commercial|Proprietary|UNLICENSED)" licenses.json

# Copyleft license check
jq '. | to_entries | .[] | select(.value.licenses | contains("GPL"))' licenses.json
```

```
memory_store_chunk
  content="Licenses found: [list with counts]. Incompatible: [list]. Unknown: [count]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["dependencies", "licenses", "compliance"]
```

## 5. Update Strategy Analysis

### Version Lag Assessment

```
# Check how outdated packages are
npm outdated --json > outdated.json

# Categorize updates needed
jq '. | to_entries | map({
  package: .key,
  current: .value.current,
  wanted: .value.wanted,
  latest: .value.latest,
  type: (if .value.current == .value.latest then "current"
         elif .value.wanted == .value.latest then "patch"
         elif (.value.latest | split(".")[0]) == (.value.current | split(".")[0]) then "minor"
         else "major" end)
})' outdated.json
```

### Breaking Change Analysis

```
# Find major version updates available
npm outdated | grep -E "^[^ ]+ +[0-9]+\.[^ ]+ +[0-9]+\.[^ ]+ +[0-9]+\.[^ ]+" | awk '$2 != $4 {print $1 " " $2 " -> " $4}'

# Check breaking changes in changelogs
for pkg in $(npm outdated --json | jq -r 'keys[]'); do
  echo "=== $pkg ==="
  npm view $pkg versions --json | tail -5
done
```

### Update Risk Assessment

```javascript
// Categorize update risks
const updates = require("./outdated.json");
const riskCategories = {
  low: [], // Patch updates
  medium: [], // Minor updates
  high: [], // Major updates
  critical: [], // Security updates needed
};

Object.entries(updates).forEach(([pkg, info]) => {
  const risk = assessUpdateRisk(pkg, info);
  riskCategories[risk].push({
    package: pkg,
    from: info.current,
    to: info.latest,
    breaking: risk === "high",
  });
});
```

## 6. Technical Debt Quantification

### Dependency Metrics

```
# Calculate technical debt score
calculate_debt_score() {
  local total_deps=$(npm list | wc -l)
  local outdated=$(npm outdated | wc -l)
  local vulnerable=$(npm audit --json | jq '.metadata.vulnerabilities.total')
  local deprecated=$(npm list | grep -c "deprecated")

  # Score calculation (0-100, higher is worse)
  local debt_score=$((
    ($outdated * 100 / $total_deps) * 0.3 +
    ($vulnerable * 10) * 0.4 +
    ($deprecated * 5) * 0.3
  ))

  echo "Technical Debt Score: $debt_score/100"
}
```

### Cost Analysis

```javascript
// Estimate update costs
const updateCosts = {
  patch: 0.5, // hours
  minor: 2, // hours
  major: 8, // hours
  security: 1, // hours (priority)
};

const totalCost = Object.entries(outdated).reduce((total, [pkg, info]) => {
  const updateType = getUpdateType(info);
  return total + updateCosts[updateType];
}, 0);

console.log(`Estimated update effort: ${totalCost} hours`);
```

## 7. Alternative Package Research

### Find Replacements

```
# For each problematic package, find alternatives
research_alternatives() {
  local package=$1
  echo "Researching alternatives for: $package"

  # Search npm for similar packages
  npm search $package --json | jq '.[] | {
    name: .name,
    description: .description,
    downloads: .downloads,
    updated: .date
  }'

  # Check bundlephobia for size comparison
  curl -s "https://bundlephobia.com/api/size?package=$package" | jq
}

# For abandoned packages
for pkg in $(cat abandoned-packages.txt); do
  research_alternatives $pkg > "alternatives-$pkg.json"
done
```

### Migration Effort Estimation

```javascript
// Analyze code changes needed for migrations
const analyzeMigration = (fromPkg, toPkg) => {
  // Find all imports
  const imports = execSync(
    `grep -r "require.*${fromPkg}\\|from.*${fromPkg}" --include="*.js" --include="*.ts" .`
  ).toString();
  const importCount = imports.split("\n").length;

  // Find all usages
  const usages = execSync(
    `grep -r "${fromPkg}\\." --include="*.js" --include="*.ts" . | wc -l`
  ).toString();

  return {
    files: importCount,
    usages: parseInt(usages),
    effort: importCount * 0.5 + parseInt(usages) * 0.1, // hours
  };
};
```

## 8. Dependency Health Documentation

Create `.claude/DEPENDENCY_HEALTH.md`:

````markdown
# Dependency Health Analysis: [Project Name]

## Executive Summary

**Dependency Health Score**: [C] (Scale: A-F)

**Key Metrics**:

- Total Dependencies: 847 (142 direct, 705 transitive)
- Security Vulnerabilities: 23 (3 critical, 7 high, 13 moderate)
- Outdated Packages: 67 (31% of direct dependencies)
- Abandoned Packages: 5
- License Issues: 2 GPL dependencies

**Technical Debt**: $47,000 (235 developer hours at $200/hour)

**Critical Actions Required**:

1. Fix 3 critical security vulnerabilities
2. Replace 5 abandoned packages
3. Update 15 packages with breaking changes
4. Remove 2 GPL licensed dependencies

## Table of Contents

- [Dependency Inventory](#dependency-inventory)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Maintenance Status](#maintenance-status)
- [License Compliance](#license-compliance)
- [Update Strategy](#update-strategy)
- [Technical Debt](#technical-debt)
- [Recommendations](#recommendations)

## Dependency Inventory

### Language Breakdown

\```mermaid
pie title "Dependencies by Language"
"JavaScript (npm)" : 523
"Python (pip)" : 187
"Go modules" : 89
"Ruby gems" : 48
\```

### Dependency Tree Visualization

\```mermaid
graph TD
App[Application]

    subgraph "Frontend Dependencies"
        React[react@17.0.2]
        Redux[redux@4.1.0]
        Axios[axios@0.21.1]
        Lodash[lodash@4.17.19]
    end

    subgraph "Backend Dependencies"
        Express[express@4.17.1]
        Mongoose[mongoose@5.11.15]
        JWT[jsonwebtoken@8.5.1]
        Bcrypt[bcrypt@3.0.0]
    end

    subgraph "Dev Dependencies"
        Jest[jest@26.6.3]
        ESLint[eslint@7.21.0]
        Webpack[webpack@4.46.0]
    end

    App --> React & Express
    React --> Redux & Axios
    Express --> Mongoose & JWT & Bcrypt

    style Lodash fill:#ff6b6b
    style Mongoose fill:#ffd93d
    style Webpack fill:#ff6b6b

\```

**Legend**:

- 🔴 Red: Security vulnerabilities
- 🟡 Yellow: Outdated (>1 year)
- 🟢 Green: Healthy

### Direct vs Transitive

| Type       | Count   | Vulnerable    | Outdated      | Abandoned     |
| ---------- | ------- | ------------- | ------------- | ------------- |
| Direct     | 142     | 8 (5.6%)      | 44 (31%)      | 3 (2.1%)      |
| Transitive | 705     | 15 (2.1%)     | 156 (22%)     | 8 (1.1%)      |
| **Total**  | **847** | **23 (2.7%)** | **200 (24%)** | **11 (1.3%)** |

## Security Vulnerabilities

### Critical Vulnerabilities (Immediate Action Required)

#### 1. lodash - Prototype Pollution

**Severity**: Critical (CVSS 9.8)
**Current Version**: 4.17.19
**Fixed Version**: 4.17.21
**CVE**: CVE-2021-23337

**Impact**: Remote Code Execution possible
**Usage in Code**:
\```javascript
// Found in 47 files
import _ from 'lodash';
_.merge(config, userInput); // Vulnerable pattern
\```

**Fix**:
\```bash
npm update lodash@^4.17.21

# or

npm install lodash@4.17.21
\```

#### 2. axios - SSRF Vulnerability

**Severity**: Critical (CVSS 9.1)
**Current Version**: 0.21.1
**Fixed Version**: 0.21.4
**CVE**: CVE-2021-3749

**Impact**: Server-Side Request Forgery
**Usage**: API client in 23 files

**Fix**:
\```bash
npm update axios@^0.21.4
\```

#### 3. mongoose - Injection Vulnerability

**Severity**: High (CVSS 8.6)
**Current Version**: 5.11.15
**Fixed Version**: 5.13.15
**CVE**: CVE-2022-2564

[Continue for all critical/high vulnerabilities...]

### Vulnerability Timeline

\```mermaid
gantt
title Security Vulnerability Discovery Timeline
dateFormat YYYY-MM-DD

    section Critical
    lodash CVE-2021-23337      :crit, 2021-02-01, 2024-01-15
    axios CVE-2021-3749        :crit, 2021-08-31, 2024-01-15

    section High
    mongoose injection         :high, 2022-07-01, 2024-01-15
    express open redirect      :high, 2022-11-01, 2024-01-15

    section Medium
    webpack dev server         :med, 2021-05-01, 2024-01-15

\```

### Security Audit Summary

\```bash

# npm audit summary

found 23 vulnerabilities (3 critical, 7 high, 13 moderate)
18 vulnerabilities require manual review
5 vulnerabilities have available fixes
3 require breaking changes
2 can be auto-fixed
\```

## Maintenance Status

### Abandoned Packages (Replace Immediately)

#### 1. node-uuid

**Last Update**: 4 years ago (2020-01-15)
**Weekly Downloads**: 2.1M → 50K (declining)
**Maintainers**: 1 (inactive)
**GitHub**: Archived

**Alternative**: `uuid` (official successor)
\```diff

- const uuid = require('node-uuid');

* const { v4: uuidv4 } = require('uuid');

- uuid.v4();

* uuidv4();
  \```

**Migration Effort**: 2 hours (15 files affected)

#### 2. request

**Last Update**: 3 years ago  
**Status**: Officially deprecated
**Alternative**: `axios` or `node-fetch`

\```diff

- const request = require('request');
- request('https://api.example.com', (err, res, body) => {
- console.log(body);
- });

* const axios = require('axios');
* const { data } = await axios.get('https://api.example.com');
* console.log(data);
  \```

**Migration Effort**: 8 hours (43 files affected)

[Continue for all abandoned packages...]

### Packages at Risk

| Package   | Warning Signs                      | Risk Level | Action                     |
| --------- | ---------------------------------- | ---------- | -------------------------- |
| momentjs  | Maintenance mode, large size       | Medium     | Plan migration to date-fns |
| bower     | Deprecated, no updates             | High       | Remove, use npm only       |
| gulp      | Declining usage, slow updates      | Medium     | Consider webpack/vite      |
| phantomjs | Deprecated, Chrome headless better | High       | Migrate to Puppeteer       |

### Maintenance Metrics

\```mermaid
scatter title "Package Health Matrix"
x-axis "Last Update (months ago)" 0 --> 48
y-axis "GitHub Stars (thousands)" 0 --> 50

    React : [2, 45]
    Express : [6, 38]
    Lodash : [8, 35]
    jQuery : [12, 28]
    Request : [36, 22]
    node-uuid : [48, 3]

    line "Abandonment threshold" : [24, 0] --> [24, 50]

\```

## License Compliance

### License Distribution

\```mermaid
pie title "License Types"
"MIT" : 623
"Apache-2.0" : 89
"BSD-3-Clause" : 67
"ISC" : 45
"GPL-3.0" : 2
"Unknown" : 21
\```

### Problematic Licenses

#### GPL Licensed Dependencies

**Risk**: Copyleft contamination

1. **package-gpl** (GPL-3.0)

   - Used in: build process only
   - Risk: Low (not distributed)
   - Action: Safe to keep

2. **readline-gpl** (GPL-2.0)
   - Used in: CLI tool
   - Risk: High (distributed)
   - Action: Replace with `readline-sync` (MIT)

#### Unknown Licenses

\```
Package Location Risk
─────────────────────────────────────────────
custom-logger /src/utils High - No license file
internal-tool /scripts Low - Internal only  
mystery-lib node_modules High - Verify or remove
\```

### License Compatibility Matrix

| Your License | Compatible With           | Incompatible With    |
| ------------ | ------------------------- | -------------------- |
| MIT          | MIT, Apache-2.0, BSD, ISC | GPL (if distributed) |
| Apache-2.0   | MIT, Apache-2.0, BSD      | GPL-2.0              |
| Proprietary  | MIT, Apache-2.0, BSD      | GPL, LGPL, AGPL      |

## Update Strategy

### Update Priority Matrix

\```mermaid
graph TD
subgraph "P0 - Security Critical"
S1[lodash 4.17.19 → 4.17.21]
S2[axios 0.21.1 → 0.21.4]
end

    subgraph "P1 - Major Updates"
        M1[react 17.0.2 → 18.2.0]
        M2[webpack 4.46.0 → 5.89.0]
        M3[jest 26.6.3 → 29.7.0]
    end

    subgraph "P2 - Minor Updates"
        Mi1[express 4.17.1 → 4.18.2]
        Mi2[mongoose 5.13.15 → 7.6.3]
    end

    subgraph "P3 - Patch Updates"
        P1[typescript 4.2.3 → 4.2.4]
        P2[eslint 7.21.0 → 7.32.0]
    end

\```

### Breaking Changes Analysis

#### React 17 → 18 Migration

**Effort**: 40 hours
**Breaking Changes**:

- New JSX Transform
- Automatic Batching
- Suspense changes
- StrictMode behavior

**Migration Steps**:
\```bash

# 1. Update React packages

npm install react@18 react-dom@18

# 2. Update render method

# Before:

ReactDOM.render(<App />, container);

# After:

const root = ReactDOM.createRoot(container);
root.render(<App />);

# 3. Run codemod

npx react-codemod update-react-imports
\```

**Files Affected**: 127
**Test Coverage Required**: 95%

[Continue for other major updates...]

### Update Schedule

| Phase     | Packages                   | Effort | Timeline    |
| --------- | -------------------------- | ------ | ----------- |
| Week 1    | Security patches (5)       | 8h     | Immediate   |
| Week 2    | Abandoned replacements (5) | 40h    | Required    |
| Month 1   | Minor updates (23)         | 24h    | Recommended |
| Quarter 1 | Major updates (8)          | 120h   | Planned     |
| Quarter 2 | Framework migrations       | 200h   | Strategic   |

## Technical Debt

### Debt Calculation

\```
Vulnerability Remediation: $4,000 (20 hours)
Abandoned Package Migration: $8,000 (40 hours)
Major Version Updates: $24,000 (120 hours)
License Compliance: $1,000 (5 hours)
Testing & Validation: $10,000 (50 hours)
─────────────────────────────────────────────
Total Technical Debt: $47,000 (235 hours)
\```

### ROI Analysis

| Action             | Cost    | Benefit                 | ROI      |
| ------------------ | ------- | ----------------------- | -------- |
| Security patches   | $4,000  | Prevent breach ($500K+) | 125x     |
| Remove abandoned   | $8,000  | Reduce maintenance 30%  | 3x/year  |
| Major updates      | $24,000 | Performance +40%        | 2x/year  |
| License compliance | $1,000  | Avoid legal issues      | Critical |

### Debt Accumulation Trend

\```mermaid
line title "Technical Debt Over Time"
x-axis [Q1-2023, Q2-2023, Q3-2023, Q4-2023, Q1-2024]
y-axis "Debt ($K)" 0 --> 50
"Security Debt" : [5, 8, 12, 18, 23]
"Update Debt" : [10, 15, 20, 28, 35]
"Total Debt" : [15, 23, 32, 46, 58]
\```

## Automated Monitoring

### Dependency Health Dashboard

\```typescript
// monitoring/dependency-health.ts
interface DependencyMetrics {
total: number;
vulnerable: number;
outdated: number;
abandoned: number;
licenseIssues: number;
lastAudit: Date;
debtScore: number;
}

class DependencyMonitor {
async collectMetrics(): Promise<DependencyMetrics> {
const auditResults = await this.runAudit();
const outdatedResults = await this.checkOutdated();
const licenseResults = await this.checkLicenses();

    return {
      total: this.countDependencies(),
      vulnerable: auditResults.vulnerabilities.length,
      outdated: outdatedResults.length,
      abandoned: this.checkAbandoned().length,
      licenseIssues: licenseResults.problematic.length,
      lastAudit: new Date(),
      debtScore: this.calculateDebtScore()
    };

}

async alert(metrics: DependencyMetrics): Promise<void> {
if (metrics.vulnerable > 0) {
await this.sendAlert('CRITICAL', `${metrics.vulnerable} security vulnerabilities found`);
}
if (metrics.debtScore > 50) {
await this.sendAlert('WARNING', `Technical debt score: ${metrics.debtScore}/100`);
}
}
}
\```

### CI/CD Integration

\```yaml

# .github/workflows/dependency-check.yml

name: Dependency Health Check

on:
schedule: - cron: '0 0 \* \* _' # Daily
pull_request:
paths: - 'package_.json' - 'requirements.txt' - 'go.mod'

jobs:
security-check:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3

      - name: Run security audit
        run: |
          npm audit --audit-level=moderate
          safety check
          nancy sleuth

      - name: Check for outdated packages
        run: |
          npm outdated
          pip list --outdated

      - name: License compliance check
        run: |
          npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD;ISC'

      - name: Calculate tech debt
        run: |
          node scripts/calculate-tech-debt.js

      - name: Generate report
        run: |
          node scripts/generate-dependency-report.js > dependency-report.md

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const report = fs.readFileSync('dependency-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });

\```

## Recommendations

### Immediate Actions (This Week)

1. 🚨 **Fix critical security vulnerabilities**
   \```bash
   npm audit fix

   # Review and test changes

   npm test
   \```

2. 🚨 **Replace abandoned packages**

   - node-uuid → uuid
   - request → axios
   - phantomjs → puppeteer

3. 🚨 **Remove GPL dependencies** (if distributing)

### Short Term (This Month)

1. **Implement automated monitoring**

   - Set up daily security scans
   - Create dependency dashboard
   - Add to CI/CD pipeline

2. **Update minor versions**

   - Run `npm update` for patches
   - Test thoroughly
   - Update lock files

3. **Document update procedures**
   - Create runbooks
   - Document breaking changes
   - Plan rollback strategies

### Long Term (This Quarter)

1. **Major framework updates**

   - React 17 → 18
   - Webpack 4 → 5
   - Node 14 → 18

2. **Reduce dependency count**

   - Audit necessity of each package
   - Combine similar packages
   - Implement tree-shaking

3. **Establish governance**
   - Approval process for new dependencies
   - Regular review cycles
   - Security response team

## Tools & Scripts

### Useful Commands

\```bash

# Quick health check

npm run deps:check

# Generate full report

npm run deps:report

# Auto-fix what's possible

npm run deps:fix

# Check specific package alternatives

npm run deps:alternatives -- lodash
\```

### Update Scripts

\```json
// package.json scripts
{
"deps:check": "npm audit && npm outdated",
"deps:report": "node scripts/dependency-health-report.js",
"deps:fix": "npm audit fix && npm update",
"deps:alternatives": "node scripts/find-alternatives.js"
}
\```

## Appendix

### Dependency Upgrade Checklist

- [ ] Run full test suite before updates
- [ ] Update one major version at a time
- [ ] Check breaking changes in CHANGELOG
- [ ] Update TypeScript definitions
- [ ] Test in staging environment
- [ ] Have rollback plan ready
- [ ] Monitor error rates post-deploy

### Resources

- [NPM Security Best Practices](https://docs.npmjs.com/security)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Snyk Vulnerability Database](https://snyk.io/vuln)
- [License Compatibility](https://opensource.guide/legal/)
````

### Final Storage

```
memory_store_chunk
  content="[Complete dependency analysis with vulnerabilities and update strategy]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["dependencies", "security", "licenses", "technical-debt", "analysis-complete"]
  files_modified=[".claude/DEPENDENCY_HEALTH.md", "scripts/dependency-monitor.js"]
```

## Execution Flow

1. **Inventory Dependencies**: Map all package managers and counts
2. **Scan for Vulnerabilities**: Run security audits
3. **Check Maintenance Status**: Find abandoned/outdated packages
4. **Verify Licenses**: Ensure compliance
5. **Calculate Technical Debt**: Quantify update effort
6. **Create Update Plan**: Prioritize by risk and effort

Begin by discovering all package manifests and dependency files.
