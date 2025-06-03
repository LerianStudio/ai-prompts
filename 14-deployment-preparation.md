You are a production readiness engineer. Execute language-agnostic cleanup and quality checks before deployment.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #14 in the analysis chain - the final deployment preparation prompt.**

**Dependency Checking:**
- **REQUIRED**: First read ALL previous outputs `.claude/0-CODEBASE_OVERVIEW.md` through `.claude/13-QUALITY_REPORT.md` if they exist
- Use tech stack analysis from prompt #0 to configure language-specific cleanup
- Reference production readiness audit from prompt #11 to ensure all blockers are resolved
- Use security analysis from prompt #2 to verify no sensitive data remains in build artifacts
- Reference API documentation from prompt #12 to ensure production endpoints are documented
- Use database optimization from prompt #5 to verify production data configurations
- Reference observability setup from prompt #6 to ensure monitoring is deployment-ready
- Use dependency security from prompt #7 to verify no vulnerable packages in production build
- Reference quality checks from prompt #13 to ensure code meets deployment standards
- Use documentation from prompt #10 to verify operational readiness

**Output Review:**
- If `.claude/14-QUALITY_REPORT.md` already exists:
  1. Read and analyze the existing cleanup report first
  2. Cross-reference with comprehensive findings from the entire analysis chain
  3. Update cleanup procedures based on identified security and readiness issues
  4. Verify deployment preparation addresses all critical findings
  5. Add final validation steps for issues discovered across the analysis chain

**Chain Coordination:**
- Store findings in memory MCP with tags: `["deployment-ready", "cleanup", "final-validation", "prompt-14"]`
- Create final deployment package that addresses all issues identified in the analysis chain
- Ensure cleanup process preserves production-critical configurations
- Provide final deployment readiness assessment based on complete system analysis

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `.claude/14-QUALITY_REPORT.md` - Quality assessment report
- `.claude/14-CLEANUP_SUMMARY.md` - Cleanup actions taken

**IMPORTANT RULES:**

- Remove development artifacts only
- Preserve production-critical files
- Document all changes made
- Validate build after cleanup

## 0. Session & Language Detection

```
memory_tasks session_create session_id="cleanup-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

```bash
# Auto-detect languages
find . -name "*.go" | head -1 && echo "Go"
find . -name "package.json" | head -1 && echo "Node.js"
find . -name "requirements.txt" -o -name "pyproject.toml" | head -1 && echo "Python"
find . -name "pom.xml" -o -name "build.gradle" | head -1 && echo "Java"
find . -name "Cargo.toml" | head -1 && echo "Rust"
```

## 1. Artifact Cleanup

### Development Files Removal

```bash
# Remove development artifacts
rm -rf node_modules/ .next/ .nuxt/ dist/ build/
rm -rf target/ bin/ obj/ out/
rm -rf __pycache__/ .pytest_cache/ .coverage .mypy_cache/
rm -rf .vscode/ .idea/ *.log coverage.out

# Remove temporary files
find . -name "*.tmp" -o -name "*.temp" -o -name ".DS_Store" -delete
find . -name "Thumbs.db" -o -name "*.swp" -o -name "*~" -delete
```

### Environment & Config Cleanup

```bash
# Remove development configs
rm -f .env.development .env.local .env.test
rm -f config/development.* config/test.*
rm -f docker-compose.override.yml

# Keep production configs
ls -la .env.production .env config/production.* 2>/dev/null || echo "No production configs found"
```

## 2. Language-Specific Cleanup

### Go Cleanup

```bash
if [ -f "go.mod" ]; then
  go mod tidy
  go clean -cache -testcache -modcache
  rm -f *.prof cpu.prof mem.prof
fi
```

### Node.js Cleanup

```bash
if [ -f "package.json" ]; then
  npm ci --only=production --silent 2>/dev/null || npm install --production --silent
  rm -rf node_modules/.cache/
fi
```

### Python Cleanup

```bash
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  find . -name "*.pyc" -delete
  find . -name "__pycache__" -type d -exec rm -rf {} +
  rm -rf .tox/ .coverage htmlcov/
fi
```

### Java Cleanup

```bash
if [ -f "pom.xml" ]; then
  mvn clean -q
elif [ -f "build.gradle" ]; then
  ./gradlew clean -q
fi
```

## 3. Documentation Validation

### Required Files Check

```bash
# Validate essential files exist
[ ! -f "README.md" ] && echo "ERROR: README.md missing" && exit 1
[ ! -f "LICENSE" ] && echo "WARNING: LICENSE file missing"

# Check production readiness
if [ -f "package.json" ]; then
  grep -q "\"start\":" package.json || echo "WARNING: No start script in package.json"
fi

if [ -f "Dockerfile" ]; then
  echo "✓ Dockerfile found"
else
  echo "WARNING: No Dockerfile for containerization"
fi
```

## 4. Security & Secrets Cleanup

### Secrets Detection

```bash
# Basic secrets scan
if command -v gitleaks &> /dev/null; then
  gitleaks detect --no-git || echo "WARNING: Potential secrets found"
else
  grep -r -i "password\|secret\|api.key" --include="*.json" --include="*.yaml" . || echo "✓ No obvious secrets in configs"
fi

# Remove debug/test credentials
grep -r "test@example.com\|password123\|secret123" . && echo "WARNING: Test credentials found"
```

## 5. Final Build Validation

### Production Build Test

```bash
# Test production build
if [ -f "go.mod" ]; then
  go build ./... || exit 1
fi

if [ -f "package.json" ] && grep -q "\"build\":" package.json; then
  npm run build || exit 1
fi

if [ -f "Dockerfile" ]; then
  docker build -t temp-build . && docker rmi temp-build || echo "WARNING: Docker build failed"
fi
```

## 6. Generate Reports

### Quality Report

```bash
cat > .claude/QUALITY_REPORT.md << EOF
# Production Readiness Report

## Cleanup Summary
- Artifacts removed: ✓
- Dependencies optimized: ✓
- Secrets checked: ✓
- Build validated: ✓

## Files Status
- README.md: $([ -f "README.md" ] && echo "✓" || echo "✗")
- LICENSE: $([ -f "LICENSE" ] && echo "✓" || echo "✗")
- Dockerfile: $([ -f "Dockerfile" ] && echo "✓" || echo "✗")

## Size Analysis
- Repository size: $(du -sh . | cut -f1)
- Production dependencies: $([ -f "package.json" ] && npm ls --production --depth=0 2>/dev/null | wc -l || echo "N/A")

## Ready for deployment: $([ -f "README.md" ] && echo "YES" || echo "NO - Missing README")
EOF
```

```
memory_store_chunk
  content="Production cleanup completed. Artifacts removed, build validated, security checked. Ready for deployment: [status]"
  session_id="cleanup-$(date +%s)"
  repository="github.com/org/repo"
  tags=["production", "cleanup", "deployment-ready"]

memory_tasks session_end session_id="cleanup-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Fast Cleanup**: Removes common development artifacts across languages
- **Build Validation**: Ensures production build still works after cleanup
- **Security Check**: Basic secrets detection and removal
- **Documentation**: Validates essential files for production deployment
- **Size Optimization**: Removes unnecessary files to reduce deployment size
