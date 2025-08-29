# /check-ui Command Documentation

This document explains how to use the `/check-ui` command for automated desktop UI component validation using the Playwright MCP workflow.

## Command Syntax

```bash
/check-ui [component-name] [options]
```

### Basic Usage

```bash
# Test a specific component
/check-ui Button

# Test multiple components
/check-ui Button Input Card

# Test with verbose output
/check-ui Button --verbose

# Test with custom output location
/check-ui Button --output=/custom/path
```

## Command Parameters

### Required Parameters

#### component-name
- **Description**: Name of the UI component to test
- **Type**: String
- **Examples**: `Button`, `Input`, `Modal`, `DataTable`
- **Location**: Component must be available on localhost:8083

### Optional Parameters

#### --output
- **Description**: Custom output directory for reports and screenshots
- **Default**: `protocol-assets/screenshots/`
- **Example**: `--output=./test-results/`

#### --verbose
- **Description**: Enable detailed console output during testing
- **Default**: `false`
- **Usage**: `--verbose` or `-v`

#### --skip-screenshots
- **Description**: Skip screenshot capture (faster testing)
- **Default**: `false`
- **Usage**: `--skip-screenshots`

#### --config
- **Description**: Custom configuration file path
- **Default**: Uses default Playwright MCP configuration
- **Example**: `--config=./custom-playwright-config.json`

## How It Works

### 1. Command Initialization
When you run `/check-ui Button`, the command:
- Parses the component name and options
- Loads the `playwright-desktop-testing.yaml` workflow
- Initializes the three specialized agents:
  - `ui-validator` - Browser automation and visual testing
  - `standards-validator` - Design system compliance checking  
  - `report-generator` - Report creation and recommendations

### 2. Workflow Execution
The workflow executes in sequence:

```
[ui-validator] → [standards-validator] → [report-generator]
```

#### Step 1: UI Validation (ui-validator agent)
- Initializes headless browser at 1920×1080 resolution
- Navigates to `localhost:8083`
- Discovers the specified component on the page
- Takes desktop screenshot at full resolution
- Tests component interactions (hover, click, focus)
- Runs accessibility audit using browser tools
- Collects performance metrics (LCP, FID, CLS)
- Generates interaction logs and evidence

#### Step 2: Standards Validation (standards-validator agent)  
- Loads design guides from `protocol-assets/design-guides/`
- Loads validation rules from `protocol-assets/validation-rules/`
- Analyzes screenshots against color palette standards
- Validates typography compliance (fonts, sizes, weights)
- Checks spacing and layout consistency
- Applies accessibility compliance rules (WCAG 2.1 AA)
- Evaluates performance against benchmarks
- Calculates compliance scores for each category

#### Step 3: Report Generation (report-generator agent)
- Synthesizes all validation results and scores
- Prioritizes issues by severity (Critical/Warning/Advisory)
- Generates specific, actionable recommendations
- Creates console summary with progress bars
- Saves detailed markdown report with visual evidence
- Provides implementation guidance and next steps

### 3. Output Generation
The command produces multiple outputs:

#### Console Output
```
✅ Button Component Validation Complete
📊 Overall Quality Score: 85.5%

Design System: ████████░░ 80% (2 warnings)
Accessibility: █████████░ 90% (1 advisory)  
Performance: ██████████ 100% (all passed)

📋 Issues Summary:
  ❌ 0 Critical  |  ⚠️ 2 Warnings  |  💡 1 Advisory

📁 Detailed Report: protocol-assets/screenshots/button/validation-report.md
🖼️ Visual Evidence: protocol-assets/screenshots/button/desktop-1920x1080.png
```

#### File Outputs
- **Screenshot**: `protocol-assets/screenshots/{component}/desktop-1920x1080.png`
- **Detailed Report**: `protocol-assets/screenshots/{component}/validation-report.md`
- **JSON Summary**: `protocol-assets/screenshots/{component}/validation-summary.json`

## Example Workflows

### Testing a Simple Button Component

```bash
/check-ui Button
```

**Expected Output:**
- Desktop screenshot of button in various states
- Design system compliance analysis
- Accessibility audit results  
- Performance metrics
- Detailed report with specific recommendations

### Testing Complex Components

```bash  
/check-ui DataTable --verbose
```

**For complex components, additional validation includes:**
- Interaction testing (sorting, filtering, pagination)
- Performance under load (large datasets)
- Accessibility of complex interactions
- Keyboard navigation patterns

### Batch Testing Multiple Components

```bash
/check-ui Button Input Card Modal
```

**The command will:**
- Test each component sequentially
- Generate separate reports for each
- Provide summary of all components tested
- Highlight cross-component consistency issues

## Understanding the Output

### Quality Score Breakdown

The overall quality score is calculated as:
```
Overall Score = (Design × 0.4) + (Accessibility × 0.35) + (Performance × 0.25)
```

#### Design System Compliance (40% weight)
- **Color Usage**: RGB/HSL values match approved palette
- **Typography**: Font families, sizes, weights from standards
- **Spacing**: Margins, padding follow spacing scale
- **Component Standards**: Layout patterns, interaction states

#### Accessibility Compliance (35% weight)  
- **Color Contrast**: Text meets WCAG 2.1 AA ratios (4.5:1)
- **Keyboard Navigation**: Full keyboard accessibility
- **ARIA Implementation**: Proper labels, roles, states
- **Screen Reader**: Compatible with assistive technologies

#### Performance Standards (25% weight)
- **Loading Performance**: FCP <100ms, LCP <200ms  
- **Interaction Response**: Click response <16ms
- **Visual Stability**: CLS <0.1
- **Memory Usage**: Efficient resource utilization

### Issue Severity Levels

#### ❌ Critical Issues (Must Fix)
- Accessibility violations that block users
- Major design system deviations  
- Severe performance problems
- Broken core functionality

#### ⚠️ Warning Issues (Should Fix)
- Minor spacing inconsistencies
- Non-critical accessibility improvements
- Performance optimizations
- Design system minor deviations

#### 💡 Advisory Issues (Consider)
- Enhancement opportunities
- Best practice suggestions  
- Optimization recommendations
- Future improvement ideas

## Troubleshooting

### Common Issues

#### "Component not found on localhost:8083"
**Solution:**
- Ensure development server is running
- Verify component is rendered on the page
- Check component naming matches exactly

#### "Playwright MCP connection failed"
**Solution:**
- Install Playwright MCP: `claude mcp add playwright npx @playwright/mcp@latest`
- Verify MCP configuration in `.claude/mcp-config.json`
- Check browser permissions and dependencies

#### "Screenshots not generating"
**Solution:**
- Verify output directory permissions
- Check available disk space
- Ensure headless browser can run
- Try `--skip-screenshots` to isolate issue

#### "Validation rules not loading"
**Solution:**
- Verify `protocol-assets/` directory structure exists
- Check design guides and validation rules files are present
- Ensure file permissions allow reading

### Debug Mode

For detailed troubleshooting, use verbose mode:

```bash
/check-ui Button --verbose
```

This provides:
- Step-by-step execution details
- Agent communication logs
- File system operations
- Performance timing information
- Error stack traces if issues occur

## Configuration

### Custom MCP Configuration

Edit `.claude/mcp-config.json` to customize:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--viewport-size=1920,1080",
        "--output-dir=custom-screenshots",
        "--timeout=60000"
      ]
    }
  }
}
```

### Custom Validation Rules

Create custom validation rules in:
- `protocol-assets/design-guides/` - Design system standards
- `protocol-assets/validation-rules/` - Quality gates and thresholds
- `protocol-assets/test-scenarios/` - Testing procedures

### Development Server Requirements

The command expects components to be available at `localhost:8083`. Ensure:
- Development server is running
- Component is rendered and visible
- No authentication barriers
- Component is in a testable state

## Integration with Development Workflow

### Pre-Commit Testing
```bash
# Test critical components before commit
/check-ui Button Input Card
```

### CI/CD Integration
The command can be integrated into automated pipelines:
- Run on every pull request
- Block deployments if critical issues found
- Generate reports for design review
- Track quality metrics over time

### Design Review Process
Use `/check-ui` output for:
- Design system compliance verification
- Accessibility review checklist
- Performance impact assessment
- Cross-component consistency validation

## Best Practices

### When to Use `/check-ui`

**Always Use:**
- Before committing UI component changes
- After updating design system tokens
- When adding new interactive features
- Before production deployment

**Consider Using:**
- During development for quick validation
- When debugging visual or interaction issues
- For component library maintenance
- When onboarding new team members

### Interpreting Results

**Focus Priority:**
1. **Critical Issues**: Block deployment, fix immediately
2. **Warning Issues**: Address before next release
3. **Advisory Issues**: Plan for future iterations

**Score Interpretation:**
- **90%+**: Excellent, ready for production
- **80-89%**: Good, minor improvements needed
- **70-79%**: Acceptable, address warnings  
- **<70%**: Needs improvement before release

### Optimizing Test Performance

**For Faster Testing:**
- Use `--skip-screenshots` for quick validation
- Test components individually rather than in batches
- Ensure development server is optimized
- Use SSD storage for better I/O performance

**For Comprehensive Testing:**
- Always include screenshots for visual validation
- Use verbose mode to understand all checks
- Test in clean browser state
- Include performance measurements

The `/check-ui` command transforms your development workflow by providing immediate, comprehensive feedback on UI component quality, accessibility, and performance - ensuring every component meets your highest standards before reaching users.
</file>
