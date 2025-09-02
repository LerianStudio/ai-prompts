# Protocol Assets - Domain-Based Architecture

A structured collection of development protocols, standards, and assets organized by development domain (frontend, backend, shared) for maximum clarity and team-specific focus.

## Architecture Overview

The protocol-assets folder uses a domain-based architecture that separates concerns by development area and creates clear boundaries for team-specific assets:

```
protocol-assets/
├── frontend/        # Frontend-specific assets and workflows
├── backend/         # Backend-specific assets and workflows  
└── shared/          # Cross-domain assets and standards
```

## Domain Descriptions

### 🎨 Frontend Domain (`frontend/`)
Frontend-specific development assets and workflows:
- **design-system/** - UI component specifications and design tokens
- **docs/** - Frontend architecture and implementation patterns
- **ui-references/** - Visual design references and screenshots
- **workflows/** - Frontend development and testing workflows
- **screenshots/** - UI validation and visual testing assets

### ⚙️ Backend Domain (`backend/`)
Backend-specific development assets and workflows:
- **docs/** - Backend architecture and API documentation
- **testing/** - Backend testing protocols and scenarios
- **workflows/** - Backend development and deployment workflows

### 🤝 Shared Domain (`shared/`)
Cross-domain assets used by all teams:
- **docs/** - Shared documentation and standards
- **standards/** - Universal code quality and development standards
- **templates/** - Common project templates and boilerplates

## Navigation Guide

### For Frontend Development  
- UI components and design system → `frontend/design-system/`
- Frontend patterns and best practices → `frontend/docs/`
- Visual references and screenshots → `frontend/ui-references/`
- Frontend workflows and testing → `frontend/workflows/`

### For Backend Development
- Backend architecture and APIs → `backend/docs/`
- Backend testing protocols → `backend/testing/`
- Backend workflows and deployment → `backend/workflows/`

### For Cross-Team Collaboration
- Shared development standards → `shared/standards/`
- Common documentation and guides → `shared/docs/`
- Universal templates and boilerplates → `shared/templates/`

## Benefits of This Architecture

### ✅ Domain-Focused Organization
Each domain contains assets specific to that development area, reducing cognitive load for teams.

### ✅ Team Autonomy
Frontend and backend teams can work independently while sharing common standards.

### ✅ Scalable Collaboration
The shared domain provides a foundation for cross-team integration and consistency.

### ✅ Profile-Based Installation
The Lerian Protocol installer can selectively install assets based on project needs (frontend-only, backend-only, or full).

## Getting Started

1. **Choose Your Domain**: Navigate to the domain that matches your development focus
2. **Check Domain READMEs**: Each domain contains its own README with specific guidance  
3. **Follow Domain Conventions**: Maintain the established patterns within each domain
4. **Use Shared Resources**: Leverage shared standards and templates for consistency

## Contributing

When adding new assets to this structure:

1. **Identify the Domain**: Determine if content is frontend-specific, backend-specific, or shared
2. **Check Existing Patterns**: Look at existing organization within that domain
3. **Maintain Consistency**: Follow established naming and organization conventions
4. **Update Cross-References**: Ensure all links and references remain valid

## Lerian Protocol Integration

This structure is designed to work with the Lerian Protocol installation system:

- **Profile-Based Installation**: Choose frontend, backend, or full installation profiles
- **Domain Separation**: Assets are organized to support selective installation
- **Claude Code Integration**: Seamlessly integrates with .claude/ directory structure
- **MCP Server Support**: Assets support Context7, Playwright, Fetch, and Shadcn integrations

## Maintenance

This structure supports the Lerian Protocol's domain-based approach:
- Regular updates to domain-specific workflows and standards
- Cross-domain integration through shared assets
- Evolution of domain boundaries as the project grows
- Integration with Claude Code agents and automation

---

For domain-specific information, see the README files in each domain directory.
</file>
