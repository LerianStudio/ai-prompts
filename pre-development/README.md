# Pre-Development Document Generation

This folder contains specialized prompts for generating comprehensive pre-development documentation for LerianStudio plugins. These prompts ensure consistency with established standards and thorough requirement gathering for new plugin development.

## 📋 Overview

The pre-development documentation workflow consists of three sequential prompts that build upon each other to create complete project specifications:

1. **PRD Generation** - Product Requirements Document
2. **TRD Generation** - Technical Requirements Document  
3. **Implementation Plan Generation** - Detailed execution plan

## 🔗 Prompt Sequence

### **1. PRD Generation** (`prd-generation.md`)
**Role**: Senior Product Manager & Business Analyst  
**Purpose**: Create comprehensive Product Requirements Documents for new plugins

**Key Features**:
- **Thorough Questioning Phase**: Must ask comprehensive questions before writing
- **Business Context Discovery**: Domain expertise, problem definition, user personas
- **Technical Context Gathering**: Performance requirements, integration needs
- **LerianStudio Standards Alignment**: Follows established plugin patterns
- **Commercial Strategy**: Subscription models, go-to-market planning

**Output**: Complete PRD following LerianStudio standards with business requirements, user stories, success criteria, and implementation phases.

### **2. TRD Generation** (`trd-generation.md`)
**Role**: Senior Technical Architect & Systems Engineer  
**Purpose**: Translate PRD requirements into detailed technical specifications

**Prerequisites**: Completed and approved PRD

**Key Features**:
- **Technical Architecture Design**: System components, database design, API specifications
- **LerianStudio Stack Integration**: Go 1.23+, Fiber v2, PostgreSQL, Valkey/Redis
- **Performance Engineering**: Specific targets, optimization strategies, monitoring
- **Security Architecture**: Multi-tenant isolation, authentication, compliance
- **Code Examples**: Complete Go structs, interfaces, and implementation patterns

**Output**: Comprehensive TRD with implementable technical specifications, architecture diagrams, and development standards.

### **3. Implementation Plan Generation** (`implementation-plan-generation.md`)
**Role**: Senior Engineering Manager & Technical Project Lead  
**Purpose**: Create detailed execution plans with phases, timelines, and deliverables

**Prerequisites**: Completed and approved PRD and TRD

**Key Features**:
- **Phase-Based Delivery**: 3-4 phases with incremental value delivery
- **Atomic Phases**: Each phase produces production-ready functionality
- **Risk Management**: Technical and project risk assessment and mitigation
- **Detailed Timelines**: Week-by-week breakdown with specific deliverables
- **Demo Scenarios**: Concrete curl examples and acceptance criteria

**Output**: Executable implementation plan with timelines, milestones, testing strategies, and success metrics.

## 🎯 LerianStudio Standards Compliance

All prompts ensure compliance with established LerianStudio standards:

### **Technology Stack**
- **Language**: Go 1.23+
- **Web Framework**: Fiber v2
- **Primary Database**: PostgreSQL 16+
- **Cache**: Valkey/Redis 7+
- **Observability**: OpenTelemetry integration

### **Architecture Patterns**
- **Multi-Database Strategy**: PostgreSQL (transactional) + Valkey/Redis (cache) + MongoDB (metadata)
- **Hexagonal Architecture**: Clean separation of adapters, services, and domain logic
- **Performance-First Design**: Sub-50ms P99 latency targets
- **Multi-Tenant Isolation**: Organization-level data separation

### **Integration Requirements**
- **Access Manager**: Authentication and authorization
- **License SDK**: Commercial license validation
- **Event Streamer**: Event publishing and consumption
- **Midaz Core**: Native API integration

### **Commercial Standards**
- **Subscription-Based Licensing**: Enterprise-ready feature tiers
- **Performance Targets**: 99.9%+ uptime, high throughput
- **Security Requirements**: RBAC, encryption, audit trails
- **Documentation Standards**: OpenAPI specs, operational runbooks

## 🚀 Usage Instructions

### **For New Plugin Development**

1. **Start with PRD Generation**:
   ```bash
   claude pre-development/prd-generation.md
   ```
   - Answer all comprehensive questions thoroughly
   - Provide detailed business context and requirements
   - Define user personas and use cases clearly
   - Specify performance and integration needs

2. **Generate TRD from PRD**:
   ```bash
   claude pre-development/trd-generation.md
   ```
   - Provide the completed PRD as input
   - Answer technical clarification questions
   - Review and approve technical architecture decisions
   - Validate performance targets and optimization strategies

3. **Create Implementation Plan**:
   ```bash
   claude pre-development/implementation-plan-generation.md
   ```
   - Provide both completed PRD and TRD as input
   - Specify team capacity and timeline constraints
   - Review risk assessment and mitigation strategies
   - Approve phase breakdown and delivery timelines

### **Output Locations**
Documents are generated in the target plugin repository:
```
docs/pre-development-docs/
├── PRD.md                    # Product Requirements Document
├── TRD.md                    # Technical Requirements Document
└── IMPLEMENTATION_PLAN.md    # Implementation Plan
```

## 📊 Quality Assurance

### **PRD Quality Criteria**
- [ ] Comprehensive user personas and use cases (6-8 specific examples)
- [ ] Clear business value proposition and competitive differentiation
- [ ] Specific performance targets and success metrics
- [ ] Complete functional and non-functional requirements
- [ ] Risk assessment with mitigation strategies

### **TRD Quality Criteria**
- [ ] Detailed system architecture with Mermaid diagrams
- [ ] Complete database design with schemas and indexes
- [ ] Comprehensive API specifications with Go structs
- [ ] Performance optimization strategies and targets
- [ ] Security architecture with multi-tenant isolation

### **Implementation Plan Quality Criteria**
- [ ] Realistic timeline with atomic, production-ready phases
- [ ] Detailed week-by-week deliverables and acceptance criteria
- [ ] Concrete demo scenarios with curl examples
- [ ] Comprehensive risk management and mitigation strategies
- [ ] Clear success metrics and validation criteria

## 🔄 Memory Integration

All prompts integrate with Memory Context Protocol (MCP) for:
- **Session Management**: Consistent tracking across PRD/TRD/Implementation planning
- **Knowledge Persistence**: Decisions and requirements stored for future reference
- **Cross-Reference**: Integration with main analysis chain prompts (00-17)
- **Pattern Learning**: Continuous improvement of plugin development standards

## 🤝 Integration with Main Analysis Chain

These pre-development prompts complement the main analysis chain (prompts 00-17):

- **Use before development**: Generate specifications before implementing
- **Reference during analysis**: Use generated PRD/TRD during codebase analysis
- **Validate implementation**: Compare actual implementation against specifications
- **Update specifications**: Evolve documents based on implementation learnings

## 📈 Benefits

### **For Product Teams**
- **Consistent Standards**: All plugins follow established LerianStudio patterns
- **Thorough Planning**: Comprehensive requirement gathering prevents scope creep
- **Risk Mitigation**: Early identification and planning for technical risks
- **Business Alignment**: Clear value proposition and success metrics

### **For Development Teams**
- **Clear Specifications**: Implementable technical requirements and architecture
- **Proven Patterns**: Leverage established LerianStudio technical patterns
- **Quality Gates**: Built-in testing and validation criteria
- **Delivery Confidence**: Realistic timelines with incremental value delivery

### **For LerianStudio Ecosystem**
- **Architecture Consistency**: Uniform integration patterns across plugins
- **Performance Standards**: Consistent high-performance targets
- **Security Compliance**: Standardized security and compliance measures
- **Commercial Success**: Proven business models and pricing strategies

## 🔍 Example Usage Scenarios

### **Scenario 1: New Financial Plugin**
For a new risk management plugin:
1. PRD focuses on financial risk assessment requirements, compliance needs, and reporting capabilities
2. TRD designs real-time risk calculation engine with sub-second response times
3. Implementation plan phases risk engine, compliance features, and reporting dashboard

### **Scenario 2: Integration Plugin**
For a new third-party integration plugin:
1. PRD defines integration scope, data mapping requirements, and sync strategies
2. TRD designs adapter patterns, event handling, and error recovery mechanisms  
3. Implementation plan phases connector development, testing, and monitoring

### **Scenario 3: Analytics Plugin**
For a new analytics and reporting plugin:
1. PRD defines dashboard requirements, KPI calculations, and user workflows
2. TRD designs data aggregation engine, caching strategies, and visualization APIs
3. Implementation plan phases data processing, dashboard development, and performance optimization

## 📄 References

- **Plugin Examples**: `../plugin-scheduler/`, `../plugin-event-streamer/`, `../plugin-spending-control/`
- **Technical Standards**: LerianStudio architecture patterns and coding standards
- **Business Models**: Established subscription and licensing approaches
- **Performance Targets**: Proven benchmarks and optimization strategies

---

*These prompts ensure that all LerianStudio plugins maintain consistent quality, performance, and integration standards while providing thorough planning and risk mitigation for successful development projects.*