[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Document Lifecycle - SECONDARY FLOW

##  Operational Objective
Complete document lifecycle management from upload through archival with AI classification and full-text indexing.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Document Upload]) --> VirusScan[Antivirus Scan]
    VirusScan --> FileAnalysis[File Type Analysis]
    FileAnalysis --> OCRCheck{Needs<br/>OCR?}
    
    OCRCheck -->|Yes| OCRProcessing[Tesseract OCR]
    OCRCheck -->|No| TextExtract[Text Extraction]
    OCRProcessing --> MetadataExtract[Metadata Extraction]
    TextExtract --> MetadataExtract
    
    MetadataExtract --> AIClassification[AI Document Classification]
    AIClassification --> DocType{Document<br/>Type}
    
    DocType -->|Pleading| PleadingTag[Tag: Pleading]
    DocType -->|Contract| ContractTag[Tag: Contract]
    DocType -->|Evidence| EvidenceTag[Tag: Evidence]
    DocType -->|Correspondence| CorrespondenceTag[Tag: Correspondence]
    
    PleadingTag --> FullTextIndex[Full-Text Indexing]
    ContractTag --> ClauseExtraction[Extract Clauses]
    EvidenceTag --> FullTextIndex
    CorrespondenceTag --> FullTextIndex
    
    ClauseExtraction --> ClauseLibrary[(Clause Library)]
    ClauseLibrary --> FullTextIndex
    
    FullTextIndex --> VersionControl[Create Version 1.0]
    VersionControl --> StorageTier{Storage<br/>Tier}
    
    StorageTier -->|Hot| PostgreSQL[(PostgreSQL)]
    StorageTier -->|Warm| FileSystem[(File System)]
    StorageTier -->|Cold| S3Archive[(S3 Archive)]
    
    PostgreSQL --> AccessControl[Apply Access Control]
    FileSystem --> AccessControl
    S3Archive --> AccessControl
    
    AccessControl --> End([Document Stored])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style AIClassification fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style VersionControl fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** OCR Engine (Tesseract, AWS Textract for handwriting)
- **T2:** AI Document Classifier (fine-tuned BERT model)
- **T3:** Tiered Storage Manager (hot/warm/cold lifecycle policies)
