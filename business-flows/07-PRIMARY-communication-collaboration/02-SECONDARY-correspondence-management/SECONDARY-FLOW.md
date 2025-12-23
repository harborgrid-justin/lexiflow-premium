[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Correspondence Management - SECONDARY FLOW

##  Operational Objective
Email integration with automatic matter linking, thread tracking, and version control for attachments.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Email Event]) --> EmailDirection{Email<br/>Direction}
    
    EmailDirection -->|Inbound| InboundEmail[Receive Email]
    EmailDirection -->|Outbound| OutboundEmail[Send Email]
    
    InboundEmail --> ParseEmail[Parse Email Headers]
    ParseEmail --> ExtractMetadata[Extract Metadata]
    ExtractMetadata --> SenderAnalysis[Analyze Sender]
    
    SenderAnalysis --> SenderType{Sender<br/>Type}
    SenderType -->|Client| ClientEmail[Client Email]
    SenderType -->|Opposing Counsel| OpposingEmail[Opposing Counsel]
    SenderType -->|Court| CourtEmail[Court Email]
    SenderType -->|Other| OtherEmail[Other Email]
    
    ClientEmail --> MatterLinking[Auto-Link to Matter]
    OpposingEmail --> MatterLinking
    CourtEmail --> MatterLinking
    OtherEmail --> ManualLink[Manual Linking Required]
    
    MatterLinking --> ThreadTracking[Track Email Thread]
    ManualLink --> ThreadTracking
    
    ThreadTracking --> AttachmentCheck{Has<br/>Attachments?}
    AttachmentCheck -->|Yes| ProcessAttachments[Process Attachments]
    AttachmentCheck -->|No| StoreEmail[Store Email]
    
    ProcessAttachments --> AttachmentType{Attachment<br/>Type}
    AttachmentType -->|Document| ExtractDocument[Extract Document]
    AttachmentType -->|Image| ExtractImage[Extract Image]
    
    ExtractDocument --> VersionCheck[Check for Existing Versions]
    VersionCheck --> VersionExists{Version<br/>Exists?}
    
    VersionExists -->|Yes| IncrementVersion[Increment Version]
    VersionExists -->|No| CreateVersion[Create Version 1.0]
    
    IncrementVersion --> RedlineGeneration[Generate Redline]
    RedlineGeneration --> StoreEmail
    
    ExtractImage --> StoreEmail
    CreateVersion --> StoreEmail
    
    OutboundEmail --> DraftEmail[Draft Email]
    DraftEmail --> TemplateCheck{Use<br/>Template?}
    
    TemplateCheck -->|Yes| SelectTemplate[Select Template]
    TemplateCheck -->|No| ComposeEmail[Compose Email]
    
    SelectTemplate --> MergeData[Merge Data]
    MergeData --> ReviewDraft[Review Draft]
    ComposeEmail --> ReviewDraft
    
    ReviewDraft --> AttachDocuments[Attach Documents]
    AttachDocuments --> SendEmail[Send Email]
    SendEmail --> ThreadTracking
    
    StoreEmail --> CorrespondenceLog[(Correspondence Log)]
    CorrespondenceLog --> FullTextIndex[Full-Text Index]
    FullTextIndex --> End([Email Managed])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style MatterLinking fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style RedlineGeneration fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Email Parser (MIME parsing, header extraction)
- **T2:** Matter Linker (ML-based auto-linking by subject/sender)
- **T3:** Redline Generator (diff algorithm for document versions)
