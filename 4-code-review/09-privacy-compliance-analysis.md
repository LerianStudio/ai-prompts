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
Use Zen MCP tools for advanced privacy and compliance analysis:

**1. Deep Privacy Impact Assessment:**
```bash
mcp__zen__thinkdeep \
  prompt="Perform a comprehensive privacy impact assessment. Analyze PII handling, consent mechanisms, data flows, and third-party sharing. Consider GDPR, CCPA, and emerging privacy regulations." \
  files=["/models", "/api", "/database/schemas", "/services/user", "/analytics"] \
  model="pro" \
  thinking_mode="max" \
  focus_areas=["PII identification", "consent flows", "data retention", "cross-border transfers", "third-party sharing"]
```

**2. Compliance Gap Analysis:**
```bash
mcp__zen__codereview \
  files=["/api/user", "/services/auth", "/data-processors", "/consent-flows"] \
  prompt="Review code for GDPR/CCPA compliance. Check for lawful basis, consent implementation, data subject rights, and privacy by design principles." \
  model="pro" \
  review_type="security" \
  focus_on="consent mechanisms, data minimization, purpose limitation, retention policies"
```

**3. Data Flow Mapping:**
```bash
mcp__zen__analyze \
  files=["/api", "/services", "/integrations", "/external-apis"] \
  prompt="Map all personal data flows through the system. Identify collection points, processing operations, storage locations, and data sharing with third parties." \
  model="pro" \
  analysis_type="architecture" \
  output_format="detailed"
```

### Task Tool Usage
Search for privacy patterns and compliance issues:

```bash
# Find PII fields and patterns
task search "email|phone|address|ssn|social security|birthdate|date of birth"

# Search for sensitive data categories
task search "health|medical|race|ethnicity|religion|political|sexual orientation"

# Find consent mechanisms
task search "consent|agree|terms|privacy policy|opt-in|opt-out"

# Look for data subject rights
task search "delete account|export data|download my data|right to access|data portability"

# Find encryption patterns
task search "encrypt|decrypt|hash|bcrypt|crypto|AES|RSA"

# Search for third-party integrations
task search "analytics|tracking|pixel|gtag|segment|mixpanel|facebook"

# Find data retention logic
task search "retention|purge|cleanup|expire|delete old|archive"

# Look for privacy configurations
task search "privacy.config|gdpr|ccpa|data protection|privacy settings"
```

**Benefits:**
- Zen MCP provides comprehensive privacy impact assessment beyond basic scanning
- Task tool enables rapid discovery of PII handling and compliance gaps
- Combined approach ensures thorough privacy compliance verification

---

You are a privacy engineer specializing in GDPR, CCPA, and data protection compliance. Your goal is to discover ACTUAL privacy and data protection issues through systematic code exploration.

## 🚨 CRITICAL: Discovery-First Privacy Analysis

**MANDATORY PROCESS:**
1. **VERIFY** components and data flows from prompts #1-8
2. **DISCOVER** actual PII handling in real code
3. **VALIDATE** every privacy issue with file:line evidence
4. **ASSESS** actual compliance gaps based on findings
5. **NEVER** create hypothetical privacy violations without evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #9 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-8 if they exist
- **VERIFY**: Data models and schemas from previous analyses still exist
- **USE**: Only verified API endpoints for data collection analysis
- **ANALYZE**: Actual database fields for PII identification
- **EXAMINE**: Real authentication patterns from security analysis

**Evidence Requirements:**
- Every PII field MUST have file:line reference
- Every consent mechanism MUST show actual implementation
- Every data flow MUST trace through real code
- Every compliance gap MUST reference missing implementation
- NO hypothetical GDPR violations without code evidence

**Chain Foundation:**
- Store only verified findings with tags: `["privacy", "compliance", "verified", "prompt-9"]`
- Document actual PII discovered in code
- Map real data flows with evidence
- Create compliance report based on findings only

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/9-DATA_PRIVACY_AUDIT.md` - Complete privacy compliance assessment
- `docs/code-review/9-PII_INVENTORY.md` - Personal data classification report (only if PII found)

**IMPORTANT RULES:**

- Focus on legal compliance risk first
- Identify all personal data collection points
- Check consent mechanisms and legal basis
- Assess data security and retention policies

## 0. Session Initialization

```
memory_tasks session_create session_id="privacy-gdpr-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"data model user information PII","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings First

### Step 1: Load and Verify Components from Prior Analysis

```bash
# FIRST: Verify previous analyses exist and are valid
echo "=== Loading verified components from previous prompts ==="

# Check for database schema analysis to identify PII storage
if [ -f "docs/code-review/4-DATABASE_OPTIMIZATION.md" ]; then
  echo "✓ Found database analysis - checking for PII fields"
  grep -E "CREATE TABLE|Column:|Field:" docs/code-review/4-DATABASE_OPTIMIZATION.md | grep -E "email|phone|name|address"
fi

# Get API endpoints that might collect PII
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "✓ Found API analysis - checking data collection endpoints"
  grep -E "POST|PUT.*user|profile|account" docs/code-review/3-API_CONTRACT_ANALYSIS.md
fi
```

## 2. Discover Actual PII in Code

### Step 2: Find Real Personal Data Fields with Evidence

```bash
echo "=== Searching for actual PII fields in codebase ==="

# First, get list of actual source files to analyze
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" -o -name "*.java" | grep -v node_modules | head -100)

# Search for actual PII field definitions
echo "--- Searching for PII field definitions ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for actual field definitions containing PII
    PII_FIELDS=$(grep -n "email\|phone\|address\|name\|birth\|ssn" "$file" 2>/dev/null | \
                 grep -E ":\s*(string|String|varchar|text)|@Column|field.*=|property")
    if [ -n "$PII_FIELDS" ]; then
      echo "FOUND PII FIELDS in $file:"
      echo "$PII_FIELDS" | head -5
    fi
  fi
done

# Find actual database schema definitions
echo "--- Searching for database schemas with PII ---"
SCHEMA_FILES=$(find . -name "*.sql" -o -name "*migration*" -o -name "*schema*" | grep -v node_modules | head -20)
for file in $SCHEMA_FILES; do
  if [ -f "$file" ]; then
    SCHEMA_PII=$(grep -n "CREATE TABLE\|ADD COLUMN" "$file" 2>/dev/null | \
                 grep -B2 -A2 "email\|phone\|address\|name\|birth")
    if [ -n "$SCHEMA_PII" ]; then
      echo "FOUND PII in schema $file:"
      echo "$SCHEMA_PII"
    fi
  fi
done

# Check for sensitive data categories
echo "--- Searching for sensitive data categories ---"
SENSITIVE_DATA=$(grep -n "health\|medical\|race\|religion\|political\|sexual" $SOURCE_FILES 2>/dev/null | \
                 grep -v "//\|/\*\|console\|log" | head -10)
if [ -n "$SENSITIVE_DATA" ]; then
  echo "⚠️  FOUND SENSITIVE DATA CATEGORIES:"
  echo "$SENSITIVE_DATA"
fi
```

### Step 3: Verify Data Encryption Status

```bash
echo "=== Checking encryption for discovered PII fields ==="

# For each PII field found, check if it's encrypted
echo "--- Checking field-level encryption ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ] && grep -q "email\|password\|ssn" "$file" 2>/dev/null; then
    # Check if encryption is applied near PII fields
    ENCRYPTED=$(grep -B5 -A5 "email\|password\|ssn" "$file" 2>/dev/null | \
                grep "encrypt\|hash\|bcrypt\|crypto")
    if [ -z "$ENCRYPTED" ]; then
      UNENCRYPTED=$(grep -n "password.*=\|email.*=\|ssn.*=" "$file" 2>/dev/null | \
                    grep -v "encrypt\|hash" | head -3)
      if [ -n "$UNENCRYPTED" ]; then
        echo "⚠️  UNENCRYPTED PII in $file:"
        echo "$UNENCRYPTED"
      fi
    fi
  fi
done
```

## 3. Map Actual Data Flows

### Step 4: Trace Real Data Collection Points

```bash
echo "=== Mapping actual data collection points ==="

# Find actual form submissions and API endpoints
echo "--- Data collection endpoints ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for actual data collection patterns
    COLLECTION=$(grep -n "req\.body\|request\.form\|request\.data" "$file" 2>/dev/null | \
                 grep -B2 -A2 "email\|name\|phone\|address")
    if [ -n "$COLLECTION" ]; then
      echo "DATA COLLECTION in $file:"
      echo "$COLLECTION" | head -5
      # Check if consent is collected nearby
      CONSENT_CHECK=$(grep -B10 -A10 "req\.body\|request\.form" "$file" 2>/dev/null | \
                      grep "consent\|agree\|terms")
      if [ -z "$CONSENT_CHECK" ]; then
        LINE_NUM=$(echo "$COLLECTION" | head -1 | cut -d: -f2)
        echo "  ⚠️  NO CONSENT CHECK FOUND near data collection at line $LINE_NUM"
      else
        echo "  ✓ Consent mechanism found near data collection"
      fi
    fi
  fi
done

# Find actual POST/PUT endpoints handling user data
echo "--- User data modification endpoints ---"
API_FILES=$(grep -l "router\|app\." $SOURCE_FILES 2>/dev/null | head -20)
for file in $API_FILES; do
  if [ -f "$file" ]; then
    USER_ENDPOINTS=$(grep -n "POST\|PUT\|PATCH" "$file" 2>/dev/null | \
                     grep "user\|profile\|account" | head -5)
    if [ -n "$USER_ENDPOINTS" ]; then
      echo "USER DATA ENDPOINTS in $file:"
      echo "$USER_ENDPOINTS"
    fi
  fi
done
```

### Step 5: Identify Third-Party Data Sharing

```bash
echo "=== Checking for third-party data sharing ==="

# Find actual external API calls
echo "--- External API integrations ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for external API calls that might share PII
    EXTERNAL_APIS=$(grep -n "fetch\|axios\|http" "$file" 2>/dev/null | \
                    grep -v "localhost\|127.0.0.1\|internal" | \
                    grep -B2 -A2 "email\|name\|user" | head -5)
    if [ -n "$EXTERNAL_APIS" ]; then
      echo "EXTERNAL API CALLS in $file:"
      echo "$EXTERNAL_APIS"
    fi
  fi
done

# Find actual analytics/tracking implementations
echo "--- Analytics and tracking ---"
TRACKING_FILES=$(grep -l "analytics\|gtag\|segment\|mixpanel\|facebook\|google" $SOURCE_FILES 2>/dev/null)
if [ -n "$TRACKING_FILES" ]; then
  echo "⚠️  TRACKING LIBRARIES FOUND in:"
  for file in $TRACKING_FILES; do
    echo "  $file"
    # Check what data is being sent
    grep -n "track\|identify\|event" "$file" 2>/dev/null | \
      grep -B2 -A2 "email\|name\|id" | head -3
  done
else
  echo "✓ No third-party tracking libraries detected"
fi
```

## 4. Verify Consent Implementation

### Step 6: Find Actual Consent Mechanisms

```bash
echo "=== Checking for actual consent implementation ==="

# Find actual consent collection code
echo "--- Consent collection mechanisms ---"
CONSENT_FILES=$(grep -l "consent\|agree\|terms\|gdpr" $SOURCE_FILES 2>/dev/null)
if [ -n "$CONSENT_FILES" ]; then
  for file in $CONSENT_FILES; do
    echo "Checking consent in $file:"
    # Look for actual consent checkboxes or fields
    CONSENT_IMPL=$(grep -n "checkbox.*consent\|consent.*checkbox\|acceptTerms\|agreeToTerms" "$file" 2>/dev/null | head -3)
    if [ -n "$CONSENT_IMPL" ]; then
      echo "  ✓ FOUND CONSENT IMPLEMENTATION:"
      echo "  $CONSENT_IMPL"
    fi
  done
else
  echo "❌ NO CONSENT IMPLEMENTATION FOUND"
fi

# Check for privacy policy files
echo "--- Privacy policy files ---"
PRIVACY_FILES=$(find . -name "*privacy*" -o -name "*terms*" -o -name "*gdpr*" | grep -v node_modules | head -10)
if [ -n "$PRIVACY_FILES" ]; then
  echo "Found privacy-related files:"
  echo "$PRIVACY_FILES"
else
  echo "❌ NO PRIVACY POLICY FILES FOUND"
fi

# Check for marketing consent
echo "--- Marketing consent ---"
MARKETING_CONSENT=$(grep -n "newsletter\|marketing\|promotional" $SOURCE_FILES 2>/dev/null | \
                    grep "consent\|opt.*in\|subscribe" | head -5)
if [ -n "$MARKETING_CONSENT" ]; then
  echo "MARKETING CONSENT FOUND:"
  echo "$MARKETING_CONSENT"
else
  echo "❌ NO MARKETING CONSENT MECHANISM FOUND"
fi
```

## 5. Check Privacy Rights Implementation

### Step 7: Verify GDPR Rights Implementation

```bash
echo "=== Checking implementation of privacy rights ==="

# Right to access (GDPR Art. 15) - find actual implementation
echo "--- Right to Access (data export) ---"
EXPORT_IMPL=$(grep -n "export.*data\|download.*data\|getUserData\|getMyData" $SOURCE_FILES 2>/dev/null | head -10)
if [ -n "$EXPORT_IMPL" ]; then
  echo "✓ DATA EXPORT FOUND:"
  echo "$EXPORT_IMPL"
else
  echo "❌ NO DATA EXPORT FUNCTIONALITY FOUND (GDPR Art. 15)"
fi

# Right to deletion (GDPR Art. 17) - find actual implementation
echo "--- Right to Deletion ---"
DELETION_IMPL=$(grep -n "deleteAccount\|deleteUser\|removeUser\|DELETE.*FROM.*user" $SOURCE_FILES 2>/dev/null | head -10)
if [ -n "$DELETION_IMPL" ]; then
  echo "✓ ACCOUNT DELETION FOUND:"
  echo "$DELETION_IMPL"
  # Check if it's soft delete or hard delete
  SOFT_DELETE=$(grep -B5 -A5 "deleteAccount\|deleteUser" $SOURCE_FILES 2>/dev/null | \
                grep "soft.*delete\|deleted_at\|is_deleted\|active.*false" | head -3)
  if [ -n "$SOFT_DELETE" ]; then
    echo "  ⚠️  WARNING: Using soft delete - may not comply with GDPR"
  fi
else
  echo "❌ NO ACCOUNT DELETION FUNCTIONALITY FOUND (GDPR Art. 17)"
fi

# Data portability (GDPR Art. 20) - find actual implementation
echo "--- Right to Data Portability ---"
PORTABILITY=$(grep -n "export.*json\|export.*csv\|downloadAs" $SOURCE_FILES 2>/dev/null | \
               grep -v "log\|debug" | head -5)
if [ -n "$PORTABILITY" ]; then
  echo "✓ DATA PORTABILITY FOUND:"
  echo "$PORTABILITY"
else
  echo "❌ NO DATA PORTABILITY FUNCTIONALITY FOUND (GDPR Art. 20)"
fi
```

### Step 8: Check Data Retention Policies

```bash
echo "=== Checking data retention implementation ==="

# Find actual retention/cleanup logic
echo "--- Data retention policies ---"
RETENTION=$(grep -n "retention\|cleanup\|purge\|expire" $SOURCE_FILES 2>/dev/null | \
             grep -v "cache\|session\|token" | head -10)
if [ -n "$RETENTION" ]; then
  echo "RETENTION LOGIC FOUND:"
  echo "$RETENTION"
else
  echo "❌ NO DATA RETENTION POLICIES FOUND"
fi

# Check for scheduled cleanup jobs
echo "--- Scheduled cleanup jobs ---"
CRON_FILES=$(find . -name "*cron*" -o -name "*schedule*" | grep -v node_modules | head -10)
for file in $CRON_FILES; do
  if [ -f "$file" ]; then
    CLEANUP_JOBS=$(grep -n "user\|data\|cleanup\|retention" "$file" 2>/dev/null | head -5)
    if [ -n "$CLEANUP_JOBS" ]; then
      echo "CLEANUP JOBS in $file:"
      echo "$CLEANUP_JOBS"
    fi
  fi
done
```

## 6. Generate Evidence-Based Privacy Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/9-DATA_PRIVACY_AUDIT.md` with ONLY verified findings:

````markdown
# Privacy Compliance Audit - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Files Analyzed**: [Count from $SOURCE_FILES]
**PII Fields Found**: [Count from Step 2]
**Consent Mechanisms**: [Count from Step 6]
**Privacy Rights Implemented**: [Count from Step 7]

## Executive Summary

**IMPORTANT**: Compliance assessment based on actual findings only.

**GDPR Compliance Status**:
- PII Collection: [Found/Not Found]
- Consent Implementation: [Found/Not Found]
- Data Subject Rights: [X of 3 implemented]
- Data Protection: [Encrypted/Unencrypted]

## Verified PII Discovery

[Only document if found in Step 2]

### Personal Data Fields Found

**Database Schema PII**:
[List actual fields found with file:line]

**Code-Level PII Fields**:
[List actual fields found with file:line]

### Sensitive Data Categories
[Only if found in Step 2]
- Health/Medical data: [Found at file:line or NOT FOUND]
- Racial/Ethnic data: [Found at file:line or NOT FOUND]
- Religious/Political data: [Found at file:line or NOT FOUND]

### Unencrypted PII
[Only if found in Step 3]
**WARNING**: The following PII fields are stored unencrypted:
- `[field]` at `[file:line]`

## Data Flow Analysis

[Only document if found in Steps 4-5]

### Data Collection Points
**Endpoints collecting PII without consent**:
[List actual endpoints found]

### Third-Party Data Sharing
[Only if found in Step 5]
**External APIs receiving PII**:
- `[file:line]`: Sending [data] to [service]

**Analytics/Tracking**:
[List actual tracking implementations found]

## Consent Implementation

[Only document based on findings from Step 6]

### Consent Mechanisms
- Consent checkboxes: [Found/NOT FOUND]
- Privacy policy: [Found/NOT FOUND]
- Marketing consent: [Found/NOT FOUND]

### Missing Consent
[List data collection points without consent]

## Privacy Rights Implementation

[Only document based on findings from Step 7]

### GDPR Rights Status
| Right | Article | Status | Evidence |
|-------|---------|--------|----------|
| Access | Art. 15 | [✓/❌] | [File:line or NOT FOUND] |
| Deletion | Art. 17 | [✓/❌] | [File:line or NOT FOUND] |
| Portability | Art. 20 | [✓/❌] | [File:line or NOT FOUND] |

### Data Retention
- Retention policy: [Found/NOT FOUND]
- Automated cleanup: [Found/NOT FOUND]

## NOT FOUND (Compliance Gaps)

### Missing GDPR Requirements
- ❌ No consent mechanism for PII collection
- ❌ No data export functionality (Art. 15)
- ❌ No account deletion (Art. 17)
- ❌ No data portability (Art. 20)
- ❌ No data retention policy
- ❌ No privacy policy file

### Missing Security Controls
- ❌ Unencrypted PII storage
- ❌ No audit logging for data access
- ❌ No data minimization practices

## Compliance Recommendations

[Only include recommendations for actual issues found]

### Immediate Actions (Legal Risk)

[If PII collection without consent found]
1. **Implement consent mechanism**
   - Files collecting PII: [list actual files]
   - Add consent checkboxes before data collection

[If unencrypted PII found]
2. **Encrypt PII fields**
   - Unencrypted fields: [list actual fields]
   - Implement field-level encryption

[If no privacy rights found]
3. **Implement GDPR rights**
   - Missing: [list actual missing rights]
   - Priority: Right to deletion (Art. 17)

### Validation Before Report

```bash
echo "=== Validating privacy findings ==="

# Count actual findings
PII_COUNT=$(grep -c "FOUND PII" privacy-scan.log 2>/dev/null || echo "0")
CONSENT_COUNT=$(grep -c "CONSENT IMPLEMENTATION" privacy-scan.log 2>/dev/null || echo "0")
UNENCRYPTED_COUNT=$(grep -c "UNENCRYPTED PII" privacy-scan.log 2>/dev/null || echo "0")
RIGHTS_COUNT=$(grep -c "FOUND:" privacy-scan.log 2>/dev/null | grep -E "EXPORT|DELETION|PORTABILITY" | wc -l || echo "0")

echo "Documented findings:"
echo "- PII fields: $PII_COUNT"
echo "- Consent mechanisms: $CONSENT_COUNT"
echo "- Unencrypted PII: $UNENCRYPTED_COUNT"
echo "- Privacy rights implemented: $RIGHTS_COUNT"
```

### Documentation Checklist

Before saving the privacy analysis:
- [ ] Every PII field has file:line evidence
- [ ] Every consent gap references actual endpoints
- [ ] All compliance issues based on discovered code
- [ ] No hypothetical violations included
- [ ] "NOT FOUND" section lists expected but missing features

````

## 7. Create PII Inventory (Only If Found)

### Only Create If PII Was Discovered

```bash
# Only create PII inventory if personal data was found
if [ "$PII_COUNT" -gt 0 ]; then
  cat > docs/code-review/9-PII_INVENTORY.md << 'EOF'
# Personal Data Inventory - DISCOVERED PII ONLY

## Data Classification Summary

**Discovery Date**: [Date]
**PII Fields Found**: [Count]
**Sensitive Categories**: [Count]

## Discovered Personal Data

[Only list actual PII found with file:line evidence]

### Database Schema PII
| Field | Table/File | Type | Evidence |
|-------|------------|------|----------|
| [Only actual fields found] |

### Code-Level PII
| Field | File:Line | Context | Encrypted |
|-------|-----------|---------|-----------|
| [Only actual fields found] |

### Data Flow Mapping
[Only actual flows discovered]
- Collection: [Actual endpoints found]
- Storage: [Actual database/files]
- Processing: [Actual usage found]
- Sharing: [Actual third parties found]
EOF
fi
```

```

memory_store_chunk
content="Privacy compliance analysis completed. PII fields: [count]. Consent mechanisms: [count]. GDPR rights implemented: [count]. All findings verified with file:line evidence."
session_id="privacy-gdpr-$(date +%s)"
repository="github.com/org/repo"
tags=["privacy", "gdpr", "compliance", "pii", "verified"]

memory_store_decision
decision="Privacy compliance status: [compliant|at-risk|non-compliant]"
rationale="Found [X] PII fields, [Y] without consent, [Z] unencrypted. Missing [count] GDPR rights."
context="Most critical issues: [specific privacy violations requiring immediate attention]"
session_id="privacy-gdpr-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="privacy-gdpr-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Legal Priority**: Focus on consent and data protection first
- **Evidence Required**: Every PII field must have file:line reference
- **No Assumptions**: Document only actual implementations found
- **Missing Controls**: Clearly document expected but missing privacy features
- **Compliance Gaps**: Based on discovered issues, not theoretical requirements

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Privacy Compliance Analysis Findings

**Analysis Date**: [Date]
**PII Fields Found**: [Count with file:line evidence]
**Consent Mechanisms**: [Found/Not Found]
**GDPR Rights Implemented**: [X of 3]
**Legal Risk**: [High/Medium/Low based on findings]

### 🔴 CRITICAL (Immediate Legal Risk)
[Only if PII collection without consent found]
- [ ] **Implement consent for [endpoint]**: Collecting PII at `[file:line]`
  - **Evidence**: No consent mechanism found near data collection
  - **Legal Risk**: GDPR violation - up to 4% revenue fine
  - **Effort**: 4-8 hours
  - **Solution**: Add consent checkbox before collection

### 🟡 HIGH (Privacy Rights)
[Only for verified missing rights]
- [ ] **Implement data deletion (Art. 17)**: Not found in codebase
  - **Evidence**: No deleteUser/deleteAccount functionality
  - **Legal Risk**: GDPR non-compliance
  - **Effort**: 8 hours
  - **Files**: Need to add deletion endpoint

### 🟢 MEDIUM (Data Protection)
[Only for actual findings]
- [ ] **Encrypt [field] in [table]**: Unencrypted PII at `[file:line]`
  - **Evidence**: Password/email stored in plain text
  - **Risk**: Data breach liability
  - **Effort**: 4 hours per field

### 🔵 LOW (Future Compliance)
[Minor privacy issues with evidence]

### ❌ MISSING PRIVACY FEATURES
- [ ] **No privacy policy file**
  - **Searched**: /privacy, /terms, /legal directories
  - **Risk**: Transparency violation
- [ ] **No consent management**
  - **Searched**: All data collection points
  - **Risk**: Invalid legal basis for processing

### Implementation Rules
1. ONLY create todos for PII actually found in code
2. EVERY violation must reference the discovery scan
3. EVERY missing right must note where it was searched
4. NO hypothetical GDPR articles without evidence
5. Include specific remediation steps
6. Tag with `#privacy #gdpr #compliance #verified`
```