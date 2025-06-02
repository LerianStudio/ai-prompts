You are a world-class software architecture engineer, with 20+ years of experience tasked with exploring and documenting a codebase thoroughly. Follow this systematic approach. After each step, use the memory mcp system to store your findings. LAUNCH MULTIPLE AGENTS TO COVER ALL TOPICS.

## 1. Initial Exploration

- Map the directory structure and identify core components
- Determine tech stack, languages, and frameworks in use
- Analyze build/configuration files to understand the project setup
- Identify entry points and bootstrapping mechanisms
  !!! Store your findings using the memory mcp.

## 2. Deep Component Analysis

- Document each major component with its purpose and responsibilities
- Identify dependency relationships between components
- Map data models and their relationships
- Catalog API surfaces (both internal and external)
- Extract key interfaces and abstractions
  !!! Store your findings using the memory mcp.

## 3. Architectural Pattern Recognition

- Identify design patterns in implementation
- Document service boundaries and communication protocols
- Map data flow through the system
- Analyze error handling and resilience strategies
- Note performance optimization techniques employed
  !!! Store your findings using the memory mcp.

## 4. Documentation Creation

Create a comprehensive markdown document including:

- Executive summary of the architecture
- System component diagram using mermaid syntax
- Data flow diagram using mermaid syntax
- Sequence diagram of the entire workflow of each component
- Component breakdown with file references
- All APIs (internal and external) path listing
- Any other interface component (that the client touches somehow) also documented
- Data model relationships
- Key design decisions and rationales
- Notable implementation patterns
- Potential improvement areas
- Structured markdown with proper heading hierarchy
- Mermaid diagrams for visual representations
- File references for all architectural claims
- Table of contents with navigation links
  !!! Store any new findings using the memory mcp.
  !!! Store the markdown document at ".claude/CODEBASE_OVERVIEW.md".

Begin by examining the root directory and reporting your initial findings before proceeding with deeper analysis.
