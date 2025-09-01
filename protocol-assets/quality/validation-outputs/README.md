# Validation Outputs

This directory contains AI-generated screenshots, visual comparisons, and validation reports from the UI-first development workflow using Playwright MCP.

## Directory Structure

### current/
Contains the latest AI-generated screenshots from Playwright browser automation.

**Auto-generated structure**:
```
current/
├── {component-name}/
│   ├── mobile_375x667.png      # Mobile viewport capture
│   ├── tablet_768x1024.png     # Tablet viewport capture  
│   ├── desktop_1920x1080.png   # Desktop viewport capture
│   └── metadata.json           # Capture details and timestamps
```

### diff/
Contains visual difference images comparing AI-generated UI against reference designs.

**Generated files**:
- `{component-name}_diff_{viewport}.png` - Visual diff highlighting differences
- `{component-name}_overlay_{viewport}.png` - Side-by-side comparison
- `{component-name}_metrics.json` - Similarity scores and difference metrics

### reports/
Contains comprehensive validation reports from the UI-first development process.

**Report types**:
- `{component-name}_visual-validation.md` - Visual fidelity analysis
- `{component-name}_iteration-log.md` - Try → Look → Fix iteration history
- `{component-name}_quality-gates.json` - Automated validation results
- `{component-name}_recommendations.md` - AI-generated improvement suggestions

## Automated Cleanup

- Files older than 30 days are automatically archived
- Only latest 5 iterations kept per component
- Failed validation attempts logged but not stored long-term

## Integration with Playwright MCP

This directory is configured as `--output-dir` for Playwright MCP:
- Screenshots automatically saved to `current/`
- Visual comparisons triggered by UI validation workflows
- Reports generated after each iteration cycle

## Usage in Development Workflow

1. **AI generates UI code** → Playwright captures screenshots → saved to `current/`
2. **Visual comparison** → diff images generated → saved to `diff/`  
3. **Validation analysis** → comprehensive reports → saved to `reports/`
4. **Iteration cycle** → process repeats until quality gates pass

## Quality Metrics Tracking

Reports track key metrics:
- **Visual Similarity**: Percentage match to reference design
- **Iteration Count**: Number of Try → Look → Fix cycles
- **Quality Gate Status**: Pass/fail for each validation rule
- **Performance**: Screenshot capture and comparison timing