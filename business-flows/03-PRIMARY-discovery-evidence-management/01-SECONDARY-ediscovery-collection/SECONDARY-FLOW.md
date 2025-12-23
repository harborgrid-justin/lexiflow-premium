[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# eDiscovery Collection - SECONDARY FLOW

## Operational Objective
Forensically sound data preservation and collection, prioritizing "Preserve-in-Place" strategies for cloud ecosystems to minimize data movement and storage costs while ensuring chain of custody.

## DETAILED WORKFLOW

```mermaid
graph TB
    Start([Legal Hold Trigger]) --> IssueLegalHold[Issue Legal Hold Notice]
    IssueLegalHold --> IdentifyCustodians[Identify Custodians]
    IdentifyCustodians --> SendNotices[Send Hold Notices]
    
    SendNotices --> TrackAcknowledgment[Track Acknowledgments]
    TrackAcknowledgment --> CustodianResponse{Custodian<br/>Response?}
    CustodianResponse -->|Not Responded| EscalateNotice[Escalate Notice]
    CustodianResponse -->|Acknowledged| AssessSources[Assess Data Sources]
    EscalateNotice --> TrackAcknowledgment
    
    AssessSources --> PreservationStrategy{Preservation<br/>Strategy}
    
    PreservationStrategy -->|Cloud Ecosystems| PreserveInPlace[Preserve-in-Place]
    PreservationStrategy -->|Endpoints/Physical| CollectNow[Immediate Collection]
    
    PreserveInPlace --> CloudLock[Lock in O365/Google Vault]
    CloudLock --> LogPreservation[Log Preservation ID]
    LogPreservation --> ReadyForExport[Ready for Future Export]
    
    CollectNow --> CollectionMethod{Collection<br/>Method}
    CollectionMethod -->|Remote| RemoteAgent[Deploy Remote Agent]
    CollectionMethod -->|Onsite| OnsiteForensics[Onsite Forensics Team]
    CollectionMethod -->|Legacy Cloud| CloudAPI[Legacy API Extraction]
    
    RemoteAgent --> DataCapture[Data Capture]
    OnsiteForensics --> DataCapture
    CloudAPI --> DataCapture
    
    DataCapture --> SourceHash[Generate Hash at Source]
    SourceHash --> VerifyIntegrity[Verify Data Integrity]
    VerifyIntegrity --> BlockchainLog[Log to Blockchain]
    BlockchainLog --> TransferSecure[Secure Transfer]
    
    TransferSecure --> S3Raw[(S3/Blob Storage - Raw Zone)]
    ReadyForExport --> S3Raw
    S3Raw --> CollectionReport[Generate Collection Report]
    CollectionReport --> End([Collection/Preservation Complete])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style SourceHash fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style BlockchainLog fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
    style PreserveInPlace fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
```

## TERTIARY WORKFLOWS
- **T1:** Legal Hold Notice Generator (email templates, tracking)
- **T2:** Remote Collection Agent (silent background capture for endpoints)
- **T3:** Cloud Preservation Integrations (Microsoft Graph API, Google Vault API)
- **T4:** Chain of Custody Logger (hashing at source, blockchain notary)

## METRICS
- Custodian Response Time: <24 hours
- Preservation-in-Place Rate: >80% of cloud data (vs. full collection)
- Collection Forensic Integrity: 100% (SHA-256 verification)
- Data Transfer Security: TLS 1.3 + AES-256 encryption
