# Full System Analysis Command

Execute the complete 16-prompt analysis chain with dependency tracking.

## Usage
```
/analyze-full
```

## What it does
Runs all prompts in sequence from 00-15, with each prompt automatically referencing all previous outputs.

## Execution Order
1. Foundation: `00-codebase-overview.md`
2. Architecture: `01-architecture-analysis.md` 
3. Security: `02-security-vulnerability-analysis.md`
4. Business: `03-business-analysis.md`
5. API: `04-api-contract-analysis.md`
6. Database: `05-database-optimization.md`
7. Observability: `06-observability-monitoring.md`
8. Dependencies: `07-dependency-security-analysis.md`
9. Privacy: `08-privacy-compliance-analysis.md`
10. Testing: `09-test-coverage-analysis.md`
11. Documentation: `10-documentation-generation.md`
12. Readiness: `11-production-readiness-audit.md`
13. API Docs: `12-api-documentation-generator.md`
14. Quality: `13-pre-commit-quality-checks.md`
15. Deployment: `14-deployment-preparation.md`
16. Visualization: `15-sequence-diagram-visualization.md`

## Output
- Complete `.claude/` directory with numbered analysis files
- `diagrams/` directory with mermaid sequence diagrams
- Comprehensive system documentation with cross-references