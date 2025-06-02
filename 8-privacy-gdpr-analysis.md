You are a world-class privacy engineer and data protection officer with expertise in GDPR, CCPA, and data governance. Conduct a thorough privacy audit building on the existing architecture documentation.

## 0. Session & Context Initialization

```
# Initialize privacy analysis session
mcp__memory__memory_tasks operation="session_create" options='{"session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo"}'

# Load prior analyses to understand data flow
cat .claude/ARCHITECTURE_ANALYSIS.md
cat .claude/DATABASE_ANALYSIS.md
cat .claude/API_CONTRACT.md
mcp__memory__memory_read operation="search" options='{"query":"data model user information PII","repository":"github.com/org/repo"}'
mcp__memory__memory_read operation="get_context" options='{"repository":"github.com/org/repo"}'

# Detect potential conflicts with privacy regulations
mcp__memory__memory_analyze operation="detect_conflicts" options='{"repository":"github.com/org/repo"}'
```

## 1. PII Discovery & Classification

### Identify Personal Data Fields

```
# Search for common PII patterns
grep -r "email\|phone\|address\|ssn\|social.*security" --include="*.{js,ts,go,py,java,sql}" .
grep -r "birth.*date\|dob\|age\|gender" --include="*.{js,ts,go,py,java,sql}" .
grep -r "name\|first.*name\|last.*name\|full.*name" --include="*.{js,ts,go,py,java,sql}" .
grep -r "credit.*card\|card.*number\|cvv\|billing" --include="*.{js,ts,go,py,java,sql}" .
grep -r "ip.*address\|location\|latitude\|longitude" --include="*.{js,ts,go,py,java,sql}" .

# Search for health/sensitive data
grep -r "health\|medical\|diagnosis\|prescription" --include="*.{js,ts,go,py,java,sql}" .
grep -r "race\|ethnicity\|religion\|political" --include="*.{js,ts,go,py,java,sql}" .
```

### Data Classification Matrix

```
# Find data models and schemas
find . -name "*.model.*" -o -name "*schema*" -o -name "*entity*" | xargs grep -l "class\|interface\|type"

# Extract field types
grep -r "@Column\|@Field\|property\|field" --include="*.{ts,js,java,py}" . | grep -B2 -A2 "string\|text\|varchar"
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"PII fields found: [list]. Data categories: [personal|sensitive|health|financial]. Risk level: [high|medium|low]","session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo","tags":["privacy","pii","data-classification"]}'
```

## 2. Data Flow Mapping

### Trace Data Through System

```
# Find data collection points
grep -r "req\.body\|request\.form\|input\|payload" --include="*.{js,ts,go,py}" . | grep -B5 -A5 "email\|name\|phone"

# Find data storage
grep -r "INSERT\|CREATE\|save\|create" --include="*.{js,ts,go,py,sql}" . | grep -B5 -A5 "users\|customers\|accounts"

# Find data transmission
grep -r "send\|post\|put\|fetch" --include="*.{js,ts,go,py}" . | grep -B5 -A5 "user\|customer\|personal"
```

### Third-Party Data Sharing

```
# Find external API calls
grep -r "axios\|fetch\|request\|http" --include="*.{js,ts,go,py}" . | grep -v "localhost\|internal"
grep -r "api\..*\.com\|webhook\|integration" --include="*.{js,ts,go,py,env}" .

# Find analytics/tracking
grep -r "analytics\|tracking\|gtag\|segment\|mixpanel" --include="*.{js,ts,html}" .
grep -r "dataLayer\|ga\('send'\|track\(" --include="*.{js,ts,html}" .
```

### Data Export Points

```
# Find export functionality
grep -r "export\|download\|csv\|pdf\|report" --include="*.{js,ts,go,py}" .
grep -r "SELECT \*.*FROM.*users\|customers" --include="*.{sql,js,ts,go,py}" .
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Data flows: [entry points] → [storage] → [processing] → [export]. Third parties: [list]. Tracking: [analytics tools]","session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo","tags":["privacy","data-flow","third-party"]}'
```

## 3. Consent & Legal Basis Analysis

### Consent Collection

```
# Find consent mechanisms
grep -r "consent\|agree\|terms\|privacy\|opt.*in\|opt.*out" --include="*.{js,ts,jsx,tsx,html}" .
grep -r "checkbox\|toggle.*privacy\|accept.*terms" --include="*.{js,ts,jsx,tsx}" .

# Find privacy policy references
find . -name "*privacy*" -o -name "*terms*" -o -name "*gdpr*" -o -name "*consent*"
```

### Legal Basis Verification

```
# Check for purpose limitation
grep -r "purpose\|reason\|why.*collect" --include="*.{js,ts,md,txt}" .

# Find marketing/promotional use
grep -r "marketing\|promotional\|newsletter\|subscribe" --include="*.{js,ts,py,go}" .
```

```
mcp__memory__memory_create operation="store_decision" options='{"decision":"Consent compliance: [compliant|partial|non-compliant]","rationale":"Found [X] data collection points, [Y] have consent, [Z] missing legal basis","context":"Critical gaps: [list of unconsented data collection]","session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo"}'
```

## 4. Data Retention & Deletion

### Retention Policy Detection

```
# Find deletion logic
grep -r "DELETE.*FROM.*users\|customers" --include="*.{sql,js,ts,go,py}" .
grep -r "destroy\|remove\|purge\|delete.*user" --include="*.{js,ts,go,py}" .

# Find scheduled jobs
grep -r "cron\|schedule\|job.*delete\|cleanup\|retention" --include="*.{js,ts,go,py,yml}" .

# Check for soft deletes vs hard deletes
grep -r "deleted_at\|is_deleted\|soft.*delete\|archived" --include="*.{sql,js,ts,go,py}" .
```

### Right to Erasure (RTBF)

```
# Find user deletion endpoints
grep -r "delete.*account\|delete.*profile\|remove.*user" --include="*.{js,ts,go,py}" .

# Check cascade deletes
grep -r "CASCADE\|RESTRICT\|NO ACTION" --include="*.{sql,js,ts}" .
grep -r "references\|foreign.*key\|belongsTo\|hasMany" --include="*.{js,ts,go,py}" .
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Retention policies: [found/missing]. Deletion coverage: [X%]. RTBF implementation: [complete/partial/missing]","session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo","tags":["privacy","retention","deletion","rtbf"]}'
```

## 5. Security & Encryption Analysis

### Data at Rest Encryption

```
# Find encryption usage
grep -r "encrypt\|decrypt\|crypto\|cipher" --include="*.{js,ts,go,py}" .
grep -r "bcrypt\|argon\|scrypt\|pbkdf" --include="*.{js,ts,go,py}" .

# Check database encryption
grep -r "encrypted\|encryption.*key\|master.*key" --include="*.{sql,yml,env,config}" .

# Find unencrypted sensitive data
grep -r "password.*=\|secret.*=\|key.*=" --include="*.{js,ts,go,py}" . | grep -v "hash\|encrypted"
```

### Data in Transit

```
# Check HTTPS enforcement
grep -r "http:\/\/" --include="*.{js,ts,go,py,env}" . | grep -v "localhost\|127.0.0.1"
grep -r "SSL\|TLS\|https\|secure" --include="*.{js,ts,go,py,yml,conf}" .

# Find API key transmission
grep -r "api.*key\|authorization\|bearer" --include="*.{js,ts,go,py}" .
```

### Access Controls

```
# Find authentication checks
grep -r "auth\|authenticate\|requireAuth\|isAuthenticated" --include="*.{js,ts,go,py}" .

# Find authorization/permission checks
grep -r "authorize\|permission\|role\|can\|able.*to" --include="*.{js,ts,go,py}" .

# Check for audit logging
grep -r "audit\|log.*access\|track.*view" --include="*.{js,ts,go,py}" .
```

## 6. Cross-Border Data Transfer

### Geographic Data Storage

```
# Find region/location references
grep -r "region\|datacenter\|aws.*region\|gcp.*zone" --include="*.{yml,yaml,tf,env,config}" .
grep -r "eu-\|us-\|asia-" --include="*.{yml,yaml,tf,env,config}" .

# Check for data residency requirements
grep -r "residency\|localization\|domestic\|cross.*border" --include="*.{md,txt,js,ts}" .
```

### International Transfer Mechanisms

```
# Find CDN usage
grep -r "cdn\|cloudfront\|cloudflare\|akamai" --include="*.{js,ts,yml,env}" .

# Find international APIs
grep -r "\.com\|\.eu\|\.co\.uk" --include="*.{js,ts,go,py,env}" . | grep -i "api\|endpoint"
```

## 7. Privacy Rights Implementation

### Data Subject Rights

```
# Find data access endpoints (GDPR Article 15)
grep -r "export.*data\|download.*data\|get.*my.*data" --include="*.{js,ts,go,py}" .

# Find data portability (GDPR Article 20)
grep -r "export.*json\|export.*csv\|portable\|transfer.*data" --include="*.{js,ts,go,py}" .

# Find rectification (GDPR Article 16)
grep -r "update.*profile\|edit.*personal\|correct.*data" --include="*.{js,ts,go,py}" .

# Find restriction/objection (GDPR Articles 18, 21)
grep -r "restrict\|object\|opt.*out\|disable.*processing" --include="*.{js,ts,go,py}" .
```

### Privacy by Design

```
# Check for data minimization
grep -r "SELECT \*" --include="*.{sql,js,ts,go,py}" . # Should be minimal

# Find default privacy settings
grep -r "default.*private\|default.*false.*public\|privacy.*default" --include="*.{js,ts,go,py}" .

# Check for privacy impact assessments
find . -name "*privacy*impact*" -o -name "*pia*" -o -name "*dpia*"
```

## 8. Privacy Analysis Documentation

Create `.claude/DATA_PRIVACY_AUDIT.md`:

````markdown
# Data Privacy Audit: [Project Name]

## Executive Summary

**Privacy Maturity Level**: [1-5]
**GDPR Compliance**: [%]
**CCPA Compliance**: [%]

**Critical Findings**:

1. [x] PII fields stored unencrypted
2. No consent mechanism for [Y] data collection points
3. Missing data retention policy
4. No automated RTBF implementation

**Legal Risk**: [High|Medium|Low]

## Table of Contents

- [Personal Data Inventory](#personal-data-inventory)
- [Data Flow Analysis](#data-flow-analysis)
- [Consent & Legal Basis](#consent--legal-basis)
- [Data Security](#data-security)
- [Privacy Rights](#privacy-rights)
- [Compliance Gaps](#compliance-gaps)
- [Remediation Plan](#remediation-plan)

## Personal Data Inventory

### Data Classification

\```mermaid
graph TB
subgraph "Personal Data (GDPR Art. 4)"
PD1[Name]
PD2[Email]
PD3[Phone]
PD4[Address]
PD5[IP Address]
end

    subgraph "Sensitive Data (GDPR Art. 9)"
        SD1[Health Data]
        SD2[Biometric]
        SD3[Religious/Political]
    end

    subgraph "Financial Data"
        FD1[Card Numbers]
        FD2[Bank Accounts]
        FD3[Transaction History]
    end

    subgraph "Behavioral Data"
        BD1[Browsing History]
        BD2[Purchase History]
        BD3[Preferences]
    end

\```

### PII Field Mapping

| Field         | Table/Model | Type      | Sensitivity | Encrypted  | Purpose          | Legal Basis         |
| ------------- | ----------- | --------- | ----------- | ---------- | ---------------- | ------------------- |
| email         | users       | Personal  | High        | ❌         | Authentication   | Consent             |
| full_name     | users       | Personal  | Medium      | ❌         | Display          | Consent             |
| phone         | users       | Personal  | Medium      | ❌         | 2FA              | Legitimate Interest |
| ip_address    | sessions    | Personal  | Low         | ❌         | Security         | Legitimate Interest |
| credit_card   | payments    | Financial | Critical    | ⚠️ Partial | Payment          | Contract            |
| address       | orders      | Personal  | Medium      | ❌         | Shipping         | Contract            |
| date_of_birth | profiles    | Personal  | High        | ❌         | Age Verification | Legal Obligation    |

**Risk Summary**:

- 15 PII fields identified
- 3 fields properly encrypted
- 7 fields missing legal basis documentation
- 5 fields collected without explicit consent

## Data Flow Analysis

### Data Lifecycle

\```mermaid
graph LR
subgraph "Collection"
C1[Web Forms]
C2[API Endpoints]
C3[Mobile App]
C4[Third-party OAuth]
end

    subgraph "Processing"
        P1[Validation]
        P2[Enrichment]
        P3[Analytics]
        P4[ML Training]
    end

    subgraph "Storage"
        S1[(Primary DB)]
        S2[(Analytics DB)]
        S3[Object Storage]
        S4[Backups]
    end

    subgraph "Sharing"
        SH1[Payment Processor]
        SH2[Email Service]
        SH3[Analytics Platform]
        SH4[Ad Networks]
    end

    subgraph "Deletion"
        D1[Manual Delete]
        D2[Retention Policy]
        D3[RTBF Request]
    end

    C1 & C2 & C3 & C4 --> P1
    P1 --> P2 --> P3 --> P4
    P2 --> S1 & S2
    P3 --> S3
    S1 --> S4
    P2 --> SH1 & SH2
    P3 --> SH3 & SH4
    S1 --> D1 & D2 & D3

\```

### Third-Party Data Sharing

#### Current Integrations

| Third Party      | Data Shared            | Purpose             | Data Agreement    | Audit    |
| ---------------- | ---------------------- | ------------------- | ----------------- | -------- |
| Stripe           | Name, Email, Card      | Payment Processing  | ✅ DPA Signed     | ⚠️ 2023  |
| SendGrid         | Email, Name            | Transactional Email | ❌ No DPA         | ❌ Never |
| Google Analytics | IP, Behavior           | Analytics           | ⚠️ Standard Terms | ❌ Never |
| Facebook Pixel   | Email (hashed), Events | Marketing           | ❌ No DPA         | ❌ Never |
| AWS S3           | All Data (backups)     | Storage             | ✅ DPA Signed     | ✅ 2024  |

#### Data Processor Risks

- 2 processors without signed DPAs (GDPR violation)
- 3 processors not audited in 12+ months
- Facebook Pixel sharing PII without consent

### Cross-Border Transfers

\```mermaid
graph TB
EU[EU Users] --> US_Server[US Servers]
US_Server --> EU_Storage[EU Storage]

    US_Server -.->|"⚠️ No SCCs"| India[India Support Team]
    US_Server -->|"✅ Privacy Shield"| US_Analytics[US Analytics]

    style India fill:#ff6b6b
    style US_Analytics fill:#51cf66

\```

**Transfer Mechanisms**:

- EU→US: ⚠️ Privacy Shield invalidated, no SCCs
- US→India: ❌ No safeguards for support access
- Backups: ✅ Encrypted, EU-only storage

## Consent & Legal Basis

### Consent Collection Analysis

#### Current State

\```javascript
// Found in: src/components/SignupForm.js

<form onSubmit={handleSignup}>
  <input name="email" required />
  <input name="password" required />
  {/* ⚠️ No consent checkbox */}
  <button type="submit">Sign Up</button>
</form>

// ❌ Marketing emails sent without consent
await emailService.addToNewsletter(user.email);
\```

#### Required Implementation

\```javascript
// Compliant consent collection

<form onSubmit={handleSignup}>
  <input name="email" required />
  <input name="password" required />
  
  {/* Granular consent */}
  <ConsentCheckbox 
    name="terms"
    required
    label="I agree to the Terms of Service"
  />
  
  <ConsentCheckbox
    name="privacy"
    required  
    label="I have read and understand the Privacy Policy"
  />
  
  <ConsentCheckbox
    name="marketing"
    optional
    label="Send me promotional emails (optional)"
  />
  
  <button type="submit">Sign Up</button>
</form>
\```

### Legal Basis Mapping

| Processing Activity | Current Basis       | Valid? | Required Action          |
| ------------------- | ------------------- | ------ | ------------------------ |
| Account Creation    | None documented     | ❌     | Add consent mechanism    |
| Order Processing    | Implicit            | ⚠️     | Document as contract     |
| Marketing Emails    | None                | ❌     | Require explicit consent |
| Analytics           | Legitimate Interest | ⚠️     | Needs balancing test     |
| Security Monitoring | Legitimate Interest | ✅     | Document properly        |
| Payment Processing  | Contract            | ✅     | No action needed         |

## Data Security

### Encryption Analysis

#### At Rest

\```sql
-- Current: Most PII stored in plaintext
CREATE TABLE users (
id UUID PRIMARY KEY,
email VARCHAR(255), -- ❌ Plaintext
full_name VARCHAR(255), -- ❌ Plaintext
phone VARCHAR(50), -- ❌ Plaintext
password_hash VARCHAR(255) -- ✅ Bcrypt
);

-- Required: Field-level encryption
CREATE TABLE users (
id UUID PRIMARY KEY,
email VARCHAR(255), -- Encrypted with AES-256
email_hash VARCHAR(64), -- For lookups
full_name TEXT, -- Encrypted with AES-256
phone TEXT, -- Encrypted with AES-256
password_hash VARCHAR(255)
);
\```

#### In Transit

- ✅ HTTPS enforced on all endpoints
- ❌ Internal services communicate over HTTP
- ⚠️ Database connections not using SSL
- ❌ Redis cache unencrypted

### Access Controls

#### Current Gaps

\```javascript
// ❌ No access logging
app.get('/api/users/:id', async (req, res) => {
const user = await User.findById(req.params.id);
res.json(user); // Returns all fields!
});

// ✅ Required implementation
app.get('/api/users/:id',
requireAuth,
checkPermission('users.read'),
auditLog('user.access'),
async (req, res) => {
const user = await User.findById(req.params.id);
res.json(user.toPublicJSON()); // Limited fields
}
);
\```

## Privacy Rights

### Right to Access (GDPR Art. 15)

**Status**: ⚠️ Partial Implementation

\```javascript
// Current: Manual process only
// Found in: src/controllers/UserController.js
async function exportUserData(userId) {
const user = await User.findById(userId);
return { user }; // ❌ Incomplete - missing related data
}

// Required: Complete data export
async function exportUserData(userId) {
const data = {
profile: await User.findById(userId),
orders: await Order.findByUser(userId),
sessions: await Session.findByUser(userId),
payments: await Payment.findByUser(userId),
consents: await Consent.findByUser(userId),
thirdPartySharing: await getThirdPartySharing(userId),
processingPurposes: getProcessingPurposes(),
retentionPeriods: getRetentionPeriods(),
exportDate: new Date(),
exportFormat: 'GDPR Article 15 Response'
};

return data;
}
\```

### Right to Erasure (GDPR Art. 17)

**Status**: ❌ Not Implemented

Required Implementation:
\```javascript
class PrivacyService {
async deleteUser(userId, reason) {
await db.transaction(async (trx) => {
// 1. Log deletion request
await AuditLog.create({
action: 'RTBF_REQUEST',
userId,
reason,
timestamp: new Date()
}, { transaction: trx });

      // 2. Delete from primary systems
      await User.destroy({ where: { id: userId }, transaction: trx });
      await Order.anonymize({ where: { userId }, transaction: trx });
      await Session.destroy({ where: { userId }, transaction: trx });

      // 3. Queue deletion from third parties
      await QueueService.add('delete-from-third-parties', { userId });

      // 4. Schedule backup deletion
      await QueueService.add('delete-from-backups', {
        userId,
        delay: '30 days' // Legal hold period
      });
    });

}
}
\```

### Right to Data Portability (GDPR Art. 20)

**Status**: ❌ Not Implemented

\```javascript
// Required implementation
async function exportPortableData(userId) {
const data = await exportUserData(userId);

// Convert to standard format
return {
format: 'application/json',
version: '1.0',
exported: new Date().toISOString(),
data: {
'@context': 'https://schema.org',
'@type': 'Person',
email: data.profile.email,
name: data.profile.name,
// Map to standard schema
}
};
}
\```

## Compliance Gaps

### GDPR Compliance Matrix

| Requirement               | Article    | Status       | Gap                           |
| ------------------------- | ---------- | ------------ | ----------------------------- |
| Lawful Basis              | Art. 6     | ⚠️ Partial   | Missing for 40% of processing |
| Consent                   | Art. 7     | ❌ Failed    | No consent management         |
| Information Notices       | Art. 13-14 | ⚠️ Partial   | Privacy policy outdated       |
| Right of Access           | Art. 15    | ⚠️ Partial   | Manual process only           |
| Right to Rectification    | Art. 16    | ✅ Compliant | -                             |
| Right to Erasure          | Art. 17    | ❌ Failed    | Not implemented               |
| Right to Restrict         | Art. 18    | ❌ Failed    | Not implemented               |
| Data Portability          | Art. 20    | ❌ Failed    | Not implemented               |
| Right to Object           | Art. 21    | ❌ Failed    | Not implemented               |
| Automated Decision Making | Art. 22    | N/A          | No automated decisions        |
| Data Protection by Design | Art. 25    | ❌ Failed    | No privacy controls           |
| Records of Processing     | Art. 30    | ❌ Failed    | No documentation              |
| Security                  | Art. 32    | ⚠️ Partial   | Encryption gaps               |
| Breach Notification       | Art. 33-34 | ⚠️ Partial   | No automated process          |
| DPO                       | Art. 37-39 | ❓ Unknown   | Check if required             |

**Overall GDPR Score**: 35/100

### CCPA Compliance Matrix

| Requirement         | Status       | Gap                          |
| ------------------- | ------------ | ---------------------------- |
| Privacy Notice      | ⚠️ Partial   | Missing required disclosures |
| Right to Know       | ❌ Failed    | No automated process         |
| Right to Delete     | ❌ Failed    | Same as GDPR RTBF            |
| Right to Opt-Out    | ❌ Failed    | No opt-out mechanism         |
| Non-Discrimination  | ✅ Compliant | No discriminatory practices  |
| Verifiable Requests | ❌ Failed    | No verification process      |
| Service Providers   | ⚠️ Partial   | Missing agreements           |

**Overall CCPA Score**: 25/100

## Remediation Plan

### Phase 1: Critical (Legal Risk) - Week 1-2

1. **Implement Consent Management**
   \```typescript
   // Priority: CRITICAL
   interface ConsentRecord {
   userId: string;
   type: 'terms' | 'privacy' | 'marketing' | 'cookies';
   version: string;
   granted: boolean;
   timestamp: Date;
   ipAddress: string;
   userAgent: string;
   }

   class ConsentService {
   async recordConsent(consent: ConsentRecord): Promise<void>;
   async getConsents(userId: string): Promise<ConsentRecord[]>;
   async withdrawConsent(userId: string, type: string): Promise<void>;
   }
   \```

2. **Encrypt PII at Rest**
   \```bash

   # Database encryption migration

   ALTER TABLE users ADD COLUMN email_encrypted TEXT;
   ALTER TABLE users ADD COLUMN name_encrypted TEXT;
   ALTER TABLE users ADD COLUMN phone_encrypted TEXT;

   # Application-level encryption

   npm install @aws-sdk/client-kms
   \```

3. **Stop Unauthorized Data Sharing**
   - Remove Facebook Pixel immediately
   - Implement consent checks before analytics
   - Sign DPAs with all processors

### Phase 2: High Priority - Week 3-4

1. **Implement Privacy Rights APIs**
   \```typescript
   // REST API endpoints
   POST /api/privacy/access-request
   GET /api/privacy/my-data
   POST /api/privacy/delete-request  
   POST /api/privacy/rectify
   POST /api/privacy/restrict
   POST /api/privacy/portability
   GET /api/privacy/consent
   DELETE /api/privacy/consent/:type
   \```

2. **Data Retention Implementation**
   \```sql
   -- Add retention metadata
   ALTER TABLE users ADD COLUMN retention_period INTERVAL;
   ALTER TABLE users ADD COLUMN retention_reason VARCHAR(255);

   -- Automated deletion job
   DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '90 days';
   DELETE FROM logs WHERE created_at < NOW() - INTERVAL '365 days';
   \```

3. **Update Privacy Documentation**
   - Privacy Policy with all required disclosures
   - Cookie Policy
   - Data Processing Records
   - Privacy Impact Assessments

### Phase 3: Compliance Completion - Month 2

1. **Automated Compliance Tools**
   \```typescript
   class PrivacyAutomation {
   // Daily compliance checks
   async checkDataRetention(): Promise<RetentionReport>;
   async auditThirdPartySharing(): Promise<SharingReport>;
   async validateConsents(): Promise<ConsentReport>;

   // Breach detection
   async detectPotentialBreach(): Promise<BreachAlert>;
   async notifyAuthorities(breach: Breach): Promise<void>;
   }
   \```

2. **Privacy Engineering**

   - Implement privacy-preserving analytics
   - Add differential privacy to reports
   - Implement data minimization

3. **Compliance Monitoring Dashboard**
   \```typescript
   interface PrivacyMetrics {
   consentRate: number;
   deletionRequests: number;
   accessRequests: number;
   breachesDetected: number;
   encryptionCoverage: number;
   retentionCompliance: number;
   }
   \```

## Technical Implementation

### Encryption Service

\```typescript
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

class EncryptionService {
private kms: KMSClient;
private keyId: string;

async encryptField(plaintext: string): Promise<string> {
const command = new EncryptCommand({
KeyId: this.keyId,
Plaintext: Buffer.from(plaintext)
});

    const { CiphertextBlob } = await this.kms.send(command);
    return Buffer.from(CiphertextBlob).toString('base64');

}

async decryptField(ciphertext: string): Promise<string> {
const command = new DecryptCommand({
CiphertextBlob: Buffer.from(ciphertext, 'base64')
});

    const { Plaintext } = await this.kms.send(command);
    return Buffer.from(Plaintext).toString();

}
}
\```

### Consent Widget

\```typescript
// React component for consent collection
const ConsentManager: React.FC = () => {
const [consents, setConsents] = useState({
necessary: true, // Always true
analytics: false,
marketing: false,
personalization: false
});

const handleSave = async () => {
await fetch('/api/privacy/consent', {
method: 'POST',
body: JSON.stringify(consents)
});
};

return (
<ConsentModal>
<h2>Privacy Settings</h2>
<ConsentToggle
        name="necessary"
        disabled
        checked={true}
        label="Necessary cookies (required)"
      />
<ConsentToggle
name="analytics"
checked={consents.analytics}
onChange={(v) => setConsents({...consents, analytics: v})}
label="Analytics cookies"
/>
{/_ More toggles _/}
<button onClick={handleSave}>Save Preferences</button>
</ConsentModal>
);
};
\```

## Monitoring & Metrics

### Privacy KPIs

\```sql
-- Consent metrics
SELECT
COUNT(_) FILTER (WHERE marketing_consent = true) _ 100.0 / COUNT(_) as marketing_consent_rate,
COUNT(_) FILTER (WHERE analytics_consent = true) _ 100.0 / COUNT(_) as analytics_consent_rate
FROM user_consents
WHERE created_at > NOW() - INTERVAL '30 days';

-- Privacy request metrics  
SELECT
request_type,
COUNT(_) as total_requests,
AVG(completed_at - created_at) as avg_completion_time,
COUNT(_) FILTER (WHERE completed_at IS NULL) as pending
FROM privacy_requests
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY request_type;

-- Encryption coverage
SELECT
(COUNT(_) FILTER (WHERE email_encrypted IS NOT NULL) _ 100.0 / COUNT(_)) as email_encryption_rate,
(COUNT(_) FILTER (WHERE name_encrypted IS NOT NULL) _ 100.0 / COUNT(_)) as name_encryption_rate
FROM users;
\```

## Cost Analysis

| Initiative                | Cost | Benefit                   | ROI      |
| ------------------------- | ---- | ------------------------- | -------- |
| Consent Management        | $15k | Avoid €20M GDPR fine      | Critical |
| Encryption Implementation | $25k | Prevent data breach costs | High     |
| Privacy Rights Automation | $30k | Reduce manual work 90%    | High     |
| Compliance Monitoring     | $10k | Early detection of issues | Medium   |
| DPA Negotiations          | $5k  | Legal compliance          | Required |

**Total Budget**: $85k
**Potential Fine Avoidance**: €20M (4% of revenue)
**Reputation Protection**: Invaluable

## Recommendations

### Immediate Actions (This Week)

1. 🚨 **Stop all non-consented data collection**
2. 🚨 **Remove Facebook Pixel and non-compliant trackers**
3. 🚨 **Implement basic consent checkboxes**
4. 🚨 **Sign DPAs with all data processors**

### Short Term (This Month)

1. Encrypt all PII at rest
2. Implement privacy rights endpoints
3. Update privacy policy
4. Create data retention policy
5. Train team on privacy

### Long Term (This Quarter)

1. Achieve full GDPR compliance
2. Implement privacy by design
3. Automate compliance monitoring
4. Conduct privacy impact assessments
5. Consider privacy certifications

## Appendix

### Privacy Policy Template

[Include template based on findings]

### DPA Template

[Include processor agreement template]

### Consent Flow Diagrams

[Include user journey diagrams]

### Compliance Checklist

[Include detailed checklist for ongoing compliance]
````

### Final Storage & Session Completion

```
# Store final privacy audit
mcp__memory__memory_create operation="store_chunk" options='{"content":"[Complete privacy audit with PII inventory and compliance gaps]","session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo","tags":["privacy","gdpr","ccpa","pii","compliance","audit-complete"],"files_modified":[".claude/DATA_PRIVACY_AUDIT.md","/privacy/*"]}'

# Create privacy compliance thread
mcp__memory__memory_create operation="create_thread" options='{"name":"Privacy & GDPR Compliance Audit","description":"Complete privacy audit with PII classification, data flow analysis, and compliance gap assessment","chunk_ids":["[pii_chunk_id]","[data_flow_chunk_id]","[consent_chunk_id]","[retention_chunk_id]"],"repository":"github.com/org/repo"}'

# Detect regulation conflicts
mcp__memory__memory_analyze operation="detect_conflicts" options='{"repository":"github.com/org/repo"}'

# Generate citations for legal references
mcp__memory__memory_system operation="generate_citations" options='{"query":"GDPR CCPA privacy regulations","chunk_ids":["[all_privacy_chunk_ids]"],"repository":"github.com/org/repo"}'

# Analyze workflow completion
mcp__memory__memory_tasks operation="workflow_analyze" options='{"session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo"}'

# End privacy analysis session
mcp__memory__memory_tasks operation="session_end" options='{"session_id":"privacy-gdpr-$(date +%s)","repository":"github.com/org/repo"}'
```

## Execution Flow

1. **Start with PII Discovery**: Find all personal data fields
2. **Map Data Flows**: Trace data through the system
3. **Check Legal Compliance**: Verify consent and legal basis
4. **Assess Security**: Check encryption and access controls
5. **Verify Privacy Rights**: Test GDPR/CCPA implementations
6. **Create Remediation Plan**: Prioritize by legal risk

Begin by discovering all personal data fields in the codebase.
