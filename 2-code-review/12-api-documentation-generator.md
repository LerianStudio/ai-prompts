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

You are an API documentation specialist. Generate OpenAPI specifications and Postman collections from codebase analysis.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #12 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read ALL previous outputs `.claude/0-CODEBASE_OVERVIEW.md` through `.claude/11-READINESS_AUDIT.md` if they exist
- Use architectural API boundaries from prompt #1 to identify service endpoints
- Reference API contract analysis from prompt #4 as the primary source for schemas and endpoints
- Use security analysis from prompt #2 to include proper authentication schemes
- Reference database models from prompt #5 to ensure accurate request/response schemas
- Use observability requirements from prompt #6 to add monitoring endpoints
- Reference business logic from prompt #3 to include relevant business endpoints
- Use readiness audit from prompt #11 to focus on production-ready endpoints only

**Output Review:**
- If `api/openapi.yaml` or `postman/collection.json` already exist:
  1. Read and analyze existing API documentation first
  2. Cross-reference with API contract findings from the analysis chain
  3. Update schemas and endpoints based on current codebase state
  4. Verify authentication schemes reflect security requirements
  5. Add any missing endpoints identified in architectural or business analysis

**Chain Coordination:**
- Store findings in memory MCP with tags: `["api-documentation", "openapi", "postman", "prompt-12"]`
- Create API documentation that reflects comprehensive system understanding
- Ensure generated docs align with architectural decisions and security requirements
- Focus on production-ready endpoints validated by readiness audit

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `api/openapi.yaml` - OpenAPI 3.0.3 specification (root directory)
- `postman/collection.json` - Postman collection
- `postman/environment.json` - Single environment file (no multiple environments)
- `scripts/openapi-to-postman.js` - Conversion script

**IMPORTANT RULES:**

- NO emojis in generated files
- NO test folders in Postman collection structure
- If files exist, REVIEW and update instead of recreating
- Swagger/OpenAPI annotations in code take precedence over auto-generation

## 0. Session Initialization

```
memory_tasks session_create session_id="api-docs-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

## 1. Check Existing Files

```
# Check if files already exist
if [ -f "openapi.yaml" ]; then
  echo "OpenAPI spec exists - reviewing for updates"
  cat openapi.yaml | head -20
fi

if [ -f "postman/collection.json" ]; then
  echo "Postman collection exists - reviewing for updates"
  jq '.info.name' postman/collection.json
fi
```

## 2. API Discovery

```
# Find API endpoints (prioritize annotations)
grep -r "@.*Mapping\|@Get\|@Post\|@Put\|@Delete" --include="*.{go,js,ts,py,java}" .
grep -r "router\.\|app\.get\|app\.post\|HandleFunc" --include="*.{go,js,ts}" .

# Extract schemas from annotations/structs
grep -r "type.*Request\|type.*Response" --include="*.go" .
grep -r "interface.*Request\|interface.*Response" --include="*.{ts,js}" .
```

```
memory_store_chunk
  content="API Discovery: [X] endpoints found. Existing files: [status]. Languages: [detected]"
  session_id="api-docs-$(date +%s)"
  repository="github.com/org/repo"
  tags=["api", "discovery", "openapi"]
```

## 3. Generate OpenAPI Specification

Create or update `openapi.yaml`:

```yaml
openapi: 3.0.3
info:
  title: "[Project Name] API"
  version: "1.0.0"
  description: "REST API documentation"
servers:
  - url: http://localhost:8080
    description: Development
  - url: https://api.example.com
    description: Production
paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        "200":
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    type: object
        "401":
          description: Invalid credentials
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## 4. Generate Conversion Script

Create `scripts/openapi-to-postman.js`:

```javascript
const fs = require("fs");
const yaml = require("js-yaml");
const { convert } = require("openapi-to-postman");

async function generatePostmanCollection() {
  const openApiSpec = yaml.load(fs.readFileSync("openapi.yaml", "utf8"));

  const result = await convert({
    type: "string",
    data: JSON.stringify(openApiSpec),
  });

  const collection = result.output[0].data;

  // Add auth token extraction
  collection.item.forEach((folder) => {
    if (folder.name === "auth") {
      folder.item.forEach((request) => {
        if (request.name.includes("login")) {
          request.event = [
            {
              listen: "test",
              script: {
                exec: [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  '    pm.environment.set("authToken", response.token);',
                  "}",
                ],
              },
            },
          ];
        }
      });
    }
  });

  fs.mkdirSync("postman", { recursive: true });
  fs.writeFileSync(
    "postman/collection.json",
    JSON.stringify(collection, null, 2)
  );

  // Generate single environment file
  const environment = {
    name: "API Environment",
    values: [
      { key: "baseUrl", value: "http://localhost:8080", enabled: true },
      { key: "userEmail", value: "test@example.com", enabled: true },
      { key: "userPassword", value: "password123", enabled: true },
    ],
  };

  fs.writeFileSync(
    "postman/environment.json",
    JSON.stringify(environment, null, 2)
  );

  console.log("Generated Postman collection and environment");
}

generatePostmanCollection().catch(console.error);
```

## 5. Execute Generation

```
# Run the conversion
node scripts/openapi-to-postman.js

# Validate outputs
npx @stoplight/spectral-cli lint openapi.yaml
npx newman validate postman/collection.json
```

```
memory_store_chunk
  content="Generated files: openapi.yaml, postman/collection.json, postman/environment.json, scripts/openapi-to-postman.js"
  session_id="api-docs-$(date +%s)"
  repository="github.com/org/repo"
  tags=["api", "openapi", "postman", "complete"]
```

## 6. Final Validation

```
# Test Postman collection
newman run postman/collection.json -e postman/environment.json

# Update memory with results
memory_tasks workflow_analyze session_id="api-docs-$(date +%s)" repository="github.com/org/repo"
memory_tasks session_end session_id="api-docs-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Workflow**: Check existing → Discover APIs → Generate OpenAPI → Convert to Postman → Validate
- **Standards**: OpenAPI 3.0.3, Postman Collection v2.1
- **Languages**: Go, JavaScript/TypeScript, Python, Java
- **Priority**: Swagger annotations > auto-generated schemas
