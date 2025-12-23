[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Statutory Research - SECONDARY FLOW

##  Operational Objective
Comprehensive statutory research with legislative history, annotations, and regulatory cross-references.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Statute Search]) --> QueryType{Query<br/>Type}
    QueryType -->|Citation| CitationLookup[Citation Lookup]
    QueryType -->|Keyword| KeywordSearch[Keyword Search]
    QueryType -->|Topic| TopicBrowse[Topic Browse]
    
    CitationLookup --> StatuteDatabase[(Statute Database)]
    KeywordSearch --> StatuteDatabase
    TopicBrowse --> StatuteDatabase
    
    StatuteDatabase --> CurrentVersion[Current Version]
    CurrentVersion --> HistoricalVersions[Historical Versions]
    HistoricalVersions --> LegislativeHistory[Legislative History]
    
    LegislativeHistory --> CommitteeReports[Committee Reports]
    CommitteeReports --> FloorDebates[Floor Debates]
    FloorDebates --> Amendments[Track Amendments]
    
    Amendments --> Annotations[Annotations]
    Annotations --> CaseLawCitations[Case Law Citations]
    CaseLawCitations --> SecondaryAuthorities[Secondary Authorities]
    
    SecondaryAuthorities --> RegulatoryCrossRef[Regulatory Cross-References]
    RegulatoryCrossRef --> CFRReferences[CFR References]
    CFRReferences --> StateRegulations[State Regulations]
    
    StateRegulations --> SaveStatute[Save to Research Folder]
    SaveStatute --> End([Research Complete])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style LegislativeHistory fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style Annotations fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Statute Citation Parser (USC, state code formats)
- **T2:** Legislative History Aggregator (Congress.gov API)
- **T3:** Regulatory Cross-Referencer (CFR linkage)
