[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Production Management - SECONDARY FLOW

##  Operational Objective
Automated document production with Bates numbering, privilege review, and load file generation.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Production Request]) --> ReviewSets[Select Review Sets]
    ReviewSets --> ResponsiveDocs[Filter Responsive Docs]
    ResponsiveDocs --> PrivilegeReview[Privilege Review]
    
    PrivilegeReview --> PrivilegeLog[Generate Privilege Log]
    PrivilegeLog --> BatesNumbering[Apply Bates Numbering]
    BatesNumbering --> BatesFormat{Bates<br/>Format}
    
    BatesFormat -->|Prefix| ApplyPrefix[Apply Prefix]
    BatesFormat -->|Suffix| ApplySuffix[Apply Suffix]
    BatesFormat -->|Custom| CustomFormat[Custom Format]
    
    ApplyPrefix --> RedactionReview[Redaction Review]
    ApplySuffix --> RedactionReview
    CustomFormat --> RedactionReview
    
    RedactionReview --> ApplyRedactions[Apply Redactions]
    ApplyRedactions --> ProductionFormat{Production<br/>Format}
    
    ProductionFormat -->|Native| NativeFiles[Native Files]
    ProductionFormat -->|TIFF| TIFFConversion[TIFF Conversion]
    ProductionFormat -->|PDF| PDFConversion[PDF Conversion]
    
    NativeFiles --> LoadFiles[Generate Load Files]
    TIFFConversion --> LoadFiles
    PDFConversion --> LoadFiles
    
    LoadFiles --> DATFile[DAT File]
    LoadFiles --> OPTFile[OPT File]
    LoadFiles --> LFPFile[LFP File]
    
    DATFile --> QualityControl[QC Review]
    OPTFile --> QualityControl
    LFPFile --> QualityControl
    
    QualityControl --> QCPassed{QC<br/>Passed?}
    QCPassed -->|No| FixIssues[Fix Issues]
    QCPassed -->|Yes| PackageProduction[Package Production]
    FixIssues --> QualityControl
    
    PackageProduction --> DeliveryMethod{Delivery<br/>Method}
    DeliveryMethod -->|Secure Upload| SecurePortal[Secure Portal]
    DeliveryMethod -->|Physical| PhysicalMedia[Physical Media]
    DeliveryMethod -->|Email| EncryptedEmail[Encrypted Email]
    
    SecurePortal --> ProductionLog[Log Production]
    PhysicalMedia --> ProductionLog
    EncryptedEmail --> ProductionLog
    
    ProductionLog --> NotifyOpposing[Notify Opposing Counsel]
    NotifyOpposing --> End([Production Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style BatesNumbering fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style LoadFiles fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Bates Stamping Engine (customizable formats, OCR-aware placement)
- **T2:** Load File Generator (Concordance DAT, IPRO OPT, Summation LFP)
- **T3:** Automated Redaction (AI-powered PII detection)

##  METRICS
- Production Turnaround: <48 hours
- QC Error Rate: <1%
- Load File Accuracy: 99.9%
