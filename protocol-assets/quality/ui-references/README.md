# UI References

This directory contains reference designs and prototypes used for UI-first development with Playwright visual validation.

## Directory Structure

### screenshots/
Store target screenshots from designers, mockups, or existing applications that serve as visual references for UI development.

**Naming Convention**: `{component-name}_{variant}_{viewport}.png`
- Example: `button_primary_desktop.png`
- Example: `navigation_mobile_collapsed.png`

### figma-exports/
Store Figma prototype exports, JSON data from framelink MCP, or other design tool exports that provide semantic component data.

**Supported Formats**:
- JSON exports from Figma API
- SVG exports with embedded metadata
- Design token exports

### component-refs/
Store component-specific reference materials including interaction states, responsive behavior documentation, and accessibility requirements.

**Structure per component**:
```
component-refs/
├── button/
│   ├── states.md          # Hover, focus, disabled states
│   ├── responsive.md      # Behavior across viewports
│   ├── accessibility.md   # A11y requirements
│   └── interactions.md    # Click, keyboard, touch behaviors
```

## Usage in UI-First Workflow

1. **Reference Analysis**: UI agents analyze reference materials to understand visual requirements
2. **Iterative Development**: AI generates UI code and compares against references using Playwright
3. **Visual Validation**: Automated screenshot comparison ensures fidelity to reference designs
4. **Quality Gates**: References serve as ground truth for validation rules

## Integration with Board System

References are linked to board items in `02.ui-design/` phase:
```
02.ui-design/task-N/
├── reference-design.png    # Symlink to quality/ui-references/screenshots/
├── ui-spec.md             # Generated from reference analysis
└── validation-results/    # Comparison results from Playwright
```

## Best Practices

- **High Quality References**: Use high-resolution screenshots and detailed design specifications
- **Multiple Viewports**: Provide references for mobile, tablet, and desktop when needed
- **Component States**: Include all interactive states (hover, focus, disabled, error)
- **Consistent Naming**: Follow naming conventions for easy automation
- **Version Control**: Track changes to reference materials for design evolution