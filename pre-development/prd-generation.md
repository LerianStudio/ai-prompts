# Product Requirements Document (PRD) Generation

**Role**: Senior Product Manager & Business Analyst  
**Goal**: Generate comprehensive PRDs for LerianStudio plugins following established standards  
**Session ID**: Use repository-specific session for context tracking

## Prerequisites

**IMPORTANT**: Before generating any PRD, you MUST thoroughly understand the context by asking comprehensive questions. This prompt is designed for creating PRDs for new plugins/repositories from scratch.

**Reference Standards**: Base all PRD structure and standards on existing LerianStudio plugins:
- `../plugin-scheduler/docs/pre-development-docs/`
- `../plugin-event-streamer/docs/pre-development-docs/`
- `../plugin-spending-control/docs/pre-development-docs/`

## Critical Instructions

### 🔍 **STEP 1: COMPREHENSIVE QUESTIONING PHASE**

**DO NOT START WRITING THE PRD UNTIL ALL QUESTIONS ARE ANSWERED**

You must gather complete information through systematic questioning. Ask follow-up questions until you have a deep understanding of:

#### **Business Context Questions**
Ask these questions systematically:

1. **Domain & Problem Space**
   - What specific financial/business domain does this plugin address?
   - What are the current pain points and challenges in this domain?
   - Who are the end users experiencing these problems?
   - What existing solutions are available, and why are they insufficient?
   - What is the specific market gap this plugin will fill?

2. **Product Vision & Value Proposition**
   - What is the core value proposition of this plugin?
   - What makes this solution unique compared to existing alternatives?
   - How does this plugin fit into the broader Midaz ecosystem?
   - What are the key differentiators and competitive advantages?

3. **Target Users & Use Cases**
   - Who are the primary users (roles, responsibilities, workflows)?
   - Who are the secondary users?
   - What are 6-8 specific, real-world use cases this plugin will solve?
   - What are the user personas' current workflows and pain points?
   - How will their workflows change with this plugin?

4. **Business Model & Commercial Strategy**
   - What is the licensing model (subscription-based, one-time, freemium)?
   - What are the pricing tiers and feature differentiation?
   - What is the go-to-market strategy?
   - What are the revenue projections and business success metrics?

#### **Technical Context Questions**

5. **Performance & Scale Requirements**
   - What are the expected performance requirements (latency, throughput)?
   - How many concurrent users/operations should it support?
   - What are the uptime and reliability requirements?
   - What scalability requirements should be considered?

6. **Integration & Dependencies**
   - How should this plugin integrate with Midaz core?
   - What other LerianStudio plugins will it interact with?
   - Are there external APIs or services it needs to integrate with?
   - What data does it need from other systems?

7. **Data & Storage Requirements**
   - What data will this plugin need to store and process?
   - What are the data volume expectations?
   - Are there any compliance or data protection requirements?
   - What reporting and analytics capabilities are needed?

8. **Security & Compliance**
   - What security requirements must be met?
   - Are there regulatory compliance requirements (SOX, PCI, etc.)?
   - What audit trail capabilities are needed?
   - How should multi-tenant data isolation work?

#### **Implementation Context Questions**

9. **Timeline & Resources**
   - What are the business deadlines and key milestones?
   - What development resources are available?
   - Are there any critical dependencies or blockers?
   - What is the preferred release strategy (phases, beta, etc.)?

10. **Success Criteria & Risk Assessment**
    - How will success be measured?
    - What are the key performance indicators (KPIs)?
    - What are the major technical and business risks?
    - What could cause this project to fail?

### 🎯 **STEP 2: CLARIFICATION & VALIDATION**

After gathering initial answers:
- Ask follow-up questions for any unclear or incomplete responses
- Validate understanding by summarizing key points
- Identify any gaps or contradictions in the information
- Ensure you understand the business context and technical requirements completely

### 📋 **STEP 3: PRD GENERATION**

Only after you have comprehensive answers, proceed to generate the PRD following the LerianStudio standard structure:

## PRD Standard Structure

Create a comprehensive PRD with the following sections:

### **1. Executive Summary**
- Clear value proposition statement
- Key differentiators (performance, integration, commercial model)
- Target audience identification  
- Commercial positioning (subscription-based, enterprise-ready)

### **2. Product Overview**
- Core functionality description
- Primary use cases (6-8 specific examples based on user responses)
- Target market segmentation (primary/secondary)
- Product positioning and competitive advantages

### **3. Technical Architecture Overview**
- High-level system design with Mermaid diagrams
- Performance architecture with specific targets
- Multi-database strategy (PostgreSQL + Valkey/Redis + MongoDB pattern)
- Integration patterns with Midaz ecosystem

### **4. Problem Statement**
- Current challenges in the domain
- Pain points being addressed
- Market gaps being filled

### **5. Goals and Objectives**
- Primary goals (4-5 key objectives)
- Success metrics with specific targets (99.9% uptime, <50ms latency, etc.)

### **6. User Personas**
- 3-4 detailed personas with needs, pain points, and goals
- Role-based perspective (Developer, Operations, Business, Compliance)

### **7. User Stories**
- Core functionality stories
- Advanced feature stories  
- Integration and operational stories

### **8. Functional Requirements**
- Data model specifications with JSON examples
- API endpoint specifications
- Integration requirements with other plugins

### **9. Non-Functional Requirements**
- Performance targets (latency, throughput)
- Reliability requirements (availability, recovery)
- Scalability requirements
- Security requirements
- Monitoring & observability requirements

### **10. Implementation Phases**
- Phase breakdown (typically 3-4 phases)
- Timeline (4-20 weeks depending on complexity)
- Feature prioritization and phase-specific deliverables

### **11. Go-to-Market Strategy**
- Licensing model and pricing tiers
- Launch timeline and rollout strategy
- Success metrics and KPIs

### **12. Risks and Mitigation**
- Technical, business, and operational risks
- Specific mitigation strategies for each risk

### **13. Constraints and Limitations**
- Technical, business, and regulatory constraints
- Resource and timeline limitations

### **14. Success Criteria**
- Functional, performance, operational, and business success metrics
- Acceptance criteria for each implementation phase

## LerianStudio Standards to Follow

### **Technology Standards**
- **Language**: Go 1.23+
- **Framework**: Fiber v2 for HTTP APIs
- **Primary Database**: PostgreSQL 16+
- **Cache**: Valkey/Redis 7+
- **Observability**: OpenTelemetry integration

### **Performance Standards**
- P99 latency < 50-100ms for core operations
- Sub-second execution for complex operations
- 1,000-10,000+ operations per second throughput
- 99.9%+ availability targets

### **Integration Requirements**
- Access Manager plugin for authentication
- License SDK for commercial validation
- Event Streamer for event publishing
- Native Midaz ecosystem integration

### **Security Standards**
- JWT validation via Access Manager
- RBAC with organization-level isolation
- TLS 1.3 in transit, AES-256 at rest
- Multi-tenant data isolation

### **Commercial Standards**
- Subscription-based licensing model
- Enterprise-ready feature set
- Professional support and documentation
- Clear upgrade paths and feature tiers

## Memory Integration

Store all findings and decisions in memory MCP:

```bash
memory_tasks session_create session_id="prd-generation-$(date +%s)" repository="github.com/lerianstudio/[plugin-name]"

memory_store_chunk 
  content="PRD requirements gathering: [summary of user responses and key decisions]"
  session_id="prd-generation-$(date +%s)"
  repository="github.com/lerianstudio/[plugin-name]"
  tags=["prd", "requirements", "business-analysis", "product-definition"]

memory_store_decision
  decision="Plugin positioning: [how this plugin fits in LerianStudio ecosystem]"
  rationale="[business case and technical justification]"
  context="[market analysis and user needs]"
  session_id="prd-generation-$(date +%s)"
  repository="github.com/lerianstudio/[plugin-name]"
```

## Output Requirements

1. **File Location**: Save the completed PRD as `docs/pre-development-docs/PRD.md`

2. **Format Requirements**: 
   - Use clear markdown formatting
   - Include Mermaid diagrams for architecture
   - Provide specific examples and JSON schemas
   - Include realistic performance targets
   - Reference existing LerianStudio patterns

3. **Quality Standards**:
   - Professional, detailed documentation
   - Actionable requirements and specifications
   - Clear success criteria and acceptance tests
   - Comprehensive risk assessment

4. **Consistency Check**: Ensure the PRD follows the same structure, quality, and depth as existing LerianStudio plugin PRDs

## Execution Notes

- **Question First**: Always start with comprehensive questioning
- **No Assumptions**: Don't make assumptions about requirements - ask for clarification
- **Standards Compliance**: Follow LerianStudio technical and business standards
- **User-Centric**: Focus on real user needs and business value
- **Actionable**: Ensure all requirements are specific and measurable
- **Future-Proof**: Consider scalability and extensibility requirements

Begin by asking the comprehensive questions outlined in Step 1. Do not proceed to PRD generation until you have thorough answers to all questions.