[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Production Management - SECONDARY FLOW

## Operational Objective
Execute the technical production of discoverable documents following the "Review" phase. This workflow transforms reviewed documents into a deliverable format (TIFF/PDF/Native) with Bates numbering, confidentiality endorsements, and industry-standard load files, ensuring strict adherence to the ESI protocol.

## DETAILED WORKFLOW

```mermaid
graph TB
    Start([Production Request]) --> DefineSet[Define Production Set]
    DefineSet --> FilterCriteria[Filter: Responsive + Not Privileged]
    FilterCriteria --> ReviewQC[Review QC Check]
    
    ReviewQC --> QCCheck{Review<br/>Complete?}
    QCCheck -->|No| ReturnToReview[Return to Review Team]
    QCCheck -->|Yes| LockSet[Lock Production Set]
    
    LockSet --> Endorsements[Apply Endorsements]
    Endorsements --> Stamps[Confidentiality/Attorney Eyes Only]
    
    Stamps --> BatesNumbering[Apply Bates Numbering]
    BatesNumbering --> Imaging[Imaging & Conversion]
    
    Imaging --> FormatCheck{Format<br/>Type}
    FormatCheck -->|Standard| ConvertToImage[Convert to TIFF/PDF]
    FormatCheck -->|Native/Excel| SlipSheet[Generate Slip Sheet]
    FormatCheck -->|Privileged| PrivSlipSheet[Privilege Slip Sheet]
    
    ConvertToImage --> BurnRedactions[Burn-in Redactions]
    SlipSheet --> Placeholders[Insert Placeholders]
    
    BurnRedactions --> LoadFiles[Generate Load Files]
    Placeholders --> LoadFiles
    PrivSlipSheet --> LoadFiles
    
    LoadFiles --> TechQC[Production QC]
    TechQC --> TechCheck{Technical<br/>Pass?}
    
    TechCheck -->|No| FixTech[Fix Broken Links/Images]
    FixTech --> TechQC
    TechCheck -->|Yes| Package[Package Production]
    
    Package --> Delivery[Secure Delivery]
    Delivery --> SecurePortal[Secure Portal Upload]
    Delivery --> PhysicalMedia[Encrypted Physical Media]
    
    SecurePortal --> AuditLog[Generate Production Log]
    PhysicalMedia --> AuditLog
    
    AuditLog --> Notify[Notify Opposing Counsel]
    Notify --> End([Production Complete])

    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style BatesNumbering fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style LoadFiles fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

## TERTIARY WORKFLOWS
- **T1: Bates Stamping Engine:** Sequential numbering across document families, handling gaps and prefixes.
- **T2: Endorsement & Redaction Burn-in:** Permanently applying "CONFIDENTIAL" stamps and burning in redaction boxes so text is unrecoverable in images.
- **T3: Load File Generator:** Creating Concordance (DAT/OPT/LFP) and EDRM XML deliverables.
- **T4: Slip Sheet Generation:** Automatically creating placeholder pages for native files (e.g., Excel spreadsheets) or withheld privileged documents.

## METRICS
- **Production Turnaround:** < 24 hours from "Set Locked" to "Delivered".
- **Bates Continuity:** 100% (Zero gaps or duplicates).
- **Load File Integrity:** 100% (No broken links between DAT and images).
- **Redaction Safety:** 100% (Zero text bleed-through on burned images).
