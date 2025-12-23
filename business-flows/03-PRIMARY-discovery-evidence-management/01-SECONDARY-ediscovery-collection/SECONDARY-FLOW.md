[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# eDiscovery Collection - SECONDARY FLOW

##  Operational Objective
Forensically sound data collection with legal hold management and custodian coordination.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Legal Hold Trigger]) --> IssueLegalHold[Issue Legal Hold Notice]
    IssueLegalHold --> IdentifyCustodians[Identify Custodians]
    IdentifyCustodians --> SendNotices[Send Hold Notices]
    
    SendNotices --> TrackAcknowledgment[Track Acknowledgments]
    TrackAcknowledgment --> CustodianResponse{Custodian<br/>Response?}
    CustodianResponse -->|Not Responded| EscalateNotice[Escalate Notice]
    CustodianResponse -->|Acknowledged| ScheduleCollection[Schedule Collection]
    EscalateNotice --> TrackAcknowledgment
    
    ScheduleCollection --> CollectionMethod{Collection<br/>Method}
    CollectionMethod -->|Remote| RemoteAgent[Deploy Remote Agent]
    CollectionMethod -->|Onsite| OnsiteForensics[Onsite Forensics Team]
    CollectionMethod -->|Cloud| CloudAPI[Cloud API Collection]
    
    RemoteAgent --> DataCapture[Data Capture]
    OnsiteForensics --> DataCapture
    CloudAPI --> DataCapture
    
    DataCapture --> ForensicHash[Generate Forensic Hash]
    ForensicHash --> VerifyIntegrity[Verify Data Integrity]
    VerifyIntegrity --> BlockchainLog[Log to Blockchain]
    BlockchainLog --> TransferSecure[Secure Transfer]
    
    TransferSecure --> EvidenceVault[(Evidence Vault)]
    EvidenceVault --> CollectionReport[Generate Collection Report]
    CollectionReport --> End([Collection Complete])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style ForensicHash fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style BlockchainLog fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Legal Hold Notice Generator (email templates, tracking)
- **T2:** Remote Collection Agent (silent background capture)
- **T3:** Cloud API Integrations (O365, GSuite, Slack, Teams)

##  METRICS
- Custodian Response Time: <24 hours
- Collection Forensic Integrity: 100%
- Data Transfer Security: AES-256 encryption
