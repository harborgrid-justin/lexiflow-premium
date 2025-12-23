[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Evidence Chain of Custody - SECONDARY FLOW

##  Operational Objective
Blockchain-verified chain of custody with immutable audit trails and forensic defensibility.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Evidence Collected]) --> InitialHash[Generate SHA-256 Hash]
    InitialHash --> BlockchainEntry[Create Blockchain Entry]
    BlockchainEntry --> EvidenceVault[(Evidence Vault)]
    
    EvidenceVault --> AccessRequest{Access<br/>Request}
    AccessRequest -->|Granted| AuthorizeAccess[Authorize Access]
    AccessRequest -->|Denied| LogDenial[Log Denial]
    
    AuthorizeAccess --> AccessLog[Create Access Log Entry]
    AccessLog --> UserAction[User Action]
    UserAction --> ActionType{Action<br/>Type}
    
    ActionType -->|View| ViewLog[Log View Event]
    ActionType -->|Download| DownloadLog[Log Download Event]
    ActionType -->|Modify| ModifyLog[Log Modification]
    ActionType -->|Delete| DeleteLog[Log Deletion]
    
    ViewLog --> TimestampAction[Timestamp Action]
    DownloadLog --> TimestampAction
    ModifyLog --> TimestampAction
    DeleteLog --> TimestampAction
    
    TimestampAction --> BlockchainUpdate[Update Blockchain]
    BlockchainUpdate --> ImmutableRecord[Immutable Record Created]
    
    ImmutableRecord --> IntegrityCheck[Periodic Integrity Check]
    IntegrityCheck --> VerifyHash{Hash<br/>Match?}
    VerifyHash -->|No| TamperAlert[Tamper Alert]
    VerifyHash -->|Yes| IntegrityConfirmed[Integrity Confirmed]
    
    TamperAlert --> ForensicInvestigation[Forensic Investigation]
    ForensicInvestigation --> IncidentReport[Generate Incident Report]
    
    IntegrityConfirmed --> AuditReport[Generate Audit Report]
    IncidentReport --> AuditReport
    AuditReport --> End([Chain Maintained])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style BlockchainEntry fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style TamperAlert fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Blockchain Logger (Hyperledger Fabric implementation)
- **T2:** Tamper Detection (hash verification, anomaly detection)
- **T3:** Forensic Report Generator (court-admissible chain-of-custody docs)

##  METRICS
- Evidence Integrity: 100%
- Tamper Detection Rate: Real-time
- Audit Trail Completeness: 100%
