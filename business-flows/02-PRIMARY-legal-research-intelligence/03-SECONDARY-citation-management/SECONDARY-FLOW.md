[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Citation Management - SECONDARY FLOW

##  Operational Objective
Comprehensive citation tracking with Bluebook compliance, authority strength signals, and citation graphs.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Add Citation]) --> CitationType{Citation<br/>Type}
    CitationType -->|Case| CaseCitation[Case Citation]
    CitationType -->|Statute| StatuteCitation[Statute Citation]
    CitationType -->|Secondary| SecondaryCitation[Secondary Source]
    
    CaseCitation --> BluebookValidation[Bluebook Validation]
    StatuteCitation --> BluebookValidation
    SecondaryCitation --> BluebookValidation
    
    BluebookValidation --> FormatCheck{Format<br/>Correct?}
    FormatCheck -->|No| AutoCorrect[Auto-Correct Format]
    FormatCheck -->|Yes| RunCitator[Run Citator Check]
    AutoCorrect --> RunCitator
    
    RunCitator --> AuthorityStrength[Authority Strength Signal]
    AuthorityStrength --> TreatmentAnalysis[Treatment Analysis]
    TreatmentAnalysis --> CitingReferences[Citing References]
    CitingReferences --> CitedReferences[Cited References]
    
    CitedReferences --> CitationGraph[Build Citation Graph]
    CitationGraph --> VisualizeNetwork[Visualize Network]
    VisualizeNetwork --> IdentifyKeyAuthorities[Identify Key Authorities]
    
    IdentifyKeyAuthorities --> OrganizeBrief[Organize for Brief]
    OrganizeBrief --> TableOfAuthorities[Generate Table of Authorities]
    TableOfAuthorities --> ExportCitations[Export Citations]
    
    ExportCitations --> End([Citations Managed])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style BluebookValidation fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style CitationGraph fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Bluebook Formatter (regex validation, auto-correction)
- **T2:** Citation Graph Builder (D3.js network visualization)
- **T3:** Table of Authorities Generator (Bluebook-compliant sorting)
