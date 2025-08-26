# Templates

Centralized repository for all reusable templates, checklists, and structured documents used across the project lifecycle.

## Directory Structure

```
templates/
├── checklists/          # Process checklists for various workflows
│   ├── code-review.md   # Code review process checklist
│   ├── development.md   # Development lifecycle checklist
│   ├── launch.md        # Launch/deployment checklist
│   └── ui-requirements.md # UI/UX requirements gathering checklist
│
├── documents/           # Document templates
│   ├── endpoint-documentation.md  # API endpoint documentation template
│   ├── product-requirements-document.md  # PRD template
│   ├── product-requirements-proposal.md  # PRP template
│   └── workflow.md      # Workflow definition template
│
└── README.md           # This file
```

## Purpose

The templates folder provides a single source of truth for:

- **Checklists**: Step-by-step guides ensuring consistent quality and completeness
- **Document Templates**: Standardized formats for technical and product documentation
- **Workflow Templates**: Reusable patterns for automated processes
- **Code Scaffolds**: Boilerplate structures for common implementations

## Usage Guide

### Checklists

Checklists are actionable, trackable documents used during active development phases:

- **development.md**: Comprehensive checklist covering all development phases from setup to deployment
- **ui-requirements.md**: Structured approach to gathering and documenting UI/UX requirements
- **code-review.md**: Ensures thorough and consistent code reviews
- **launch.md**: Pre-deployment verification and launch procedures

**When to use**: During active work phases when you need to track progress and ensure nothing is missed.

### Document Templates

Templates provide consistent structure for various documentation needs:

- **product-requirements-document.md**: Full PRD template for feature specifications
- **product-requirements-proposal.md**: Lighter PRP for initial proposals
- **endpoint-documentation.md**: API endpoint documentation format
- **workflow.md**: Template for defining new automated workflows

**When to use**: When creating new documentation that needs to follow project standards.

## Integration with Workflows

These templates are referenced by workflow automation files in `/workflows/*.yaml`:

```yaml
templates:
  - file: templates/checklists/development.md
    context: Development phase tracking
```

## Adding New Templates

1. **Determine Category**: Is it a checklist or a document template?
2. **Create File**: Place in appropriate subdirectory
3. **Follow Naming**: Use descriptive, hyphenated lowercase names
4. **Include Metadata**: Add workflow references and ownership info
5. **Document Usage**: Update this README with the new template

## Template Variables

Templates can include placeholder variables for dynamic content:

- `[Feature/Initiative Name]` - Project or feature name
- `@username` - GitHub username references  
- `YYYY-MM-DD` - Date placeholders
- `{{variable}}` - Workflow-injected variables

## Best Practices

### Do's
- ✅ Keep templates focused and single-purpose
- ✅ Include clear sections and hierarchies
- ✅ Add helpful comments and examples
- ✅ Version control all changes
- ✅ Regular reviews and updates based on lessons learned

### Don'ts
- ❌ Don't duplicate content across templates
- ❌ Don't make templates overly complex
- ❌ Don't hardcode project-specific values
- ❌ Don't skip template reviews during updates

## Maintenance

Templates should be reviewed and updated:
- After each major project milestone
- When workflow processes change
- Based on retrospective feedback
- Quarterly for relevance and accuracy

## Related Resources

- `/workflows/` - Automated workflow definitions
- `/context/` - Project-specific context and guidelines
- `/board/` - Task tracking and project management

## Contributing

To propose template changes:
1. Create a feature branch
2. Make your changes
3. Update this README if needed
4. Submit a PR with clear description of improvements
