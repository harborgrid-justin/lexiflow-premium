[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Secure Messaging - SECONDARY FLOW

##  Operational Objective
End-to-end encrypted messaging with attorney-client privilege protection and ephemeral message support.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([New Message]) --> MessageContext{Message<br/>Context}
    
    MessageContext -->|Client Communication| ClientMessage[Client Message]
    MessageContext -->|Internal Team| InternalMessage[Internal Team Message]
    MessageContext -->|Opposing Counsel| OpposingMessage[Opposing Counsel Message]
    
    ClientMessage --> PrivilegeCheck[Check Privilege Status]
    PrivilegeCheck --> PrivilegeTag[Tag as Privileged]
    PrivilegeTag --> E2EEncryption[E2E Encryption]
    
    InternalMessage --> WorkProduct{Work<br/>Product?}
    WorkProduct -->|Yes| WorkProductTag[Tag Work Product]
    WorkProduct -->|No| StandardEncryption[Standard Encryption]
    WorkProductTag --> E2EEncryption
    
    OpposingMessage --> DiscoveryRelevant{Discovery<br/>Relevant?}
    DiscoveryRelevant -->|Yes| PreserveMessage[Preserve for Discovery]
    DiscoveryRelevant -->|No| StandardEncryption
    PreserveMessage --> StandardEncryption
    
    E2EEncryption --> SignalProtocol[Signal Protocol]
    SignalProtocol --> EphemeralOption{Ephemeral<br/>Message?}
    
    EphemeralOption -->|Yes| TimedDestruct[Set Timer]
    EphemeralOption -->|No| PermanentStore[Permanent Storage]
    
    TimedDestruct --> TTLConfig[Configure TTL]
    TTLConfig --> SendMessage[Send Message]
    
    StandardEncryption --> SendMessage
    PermanentStore --> SendMessage
    
    SendMessage --> DeliveryStatus[Track Delivery Status]
    DeliveryStatus --> ReadReceipt{Read<br/>Receipt?}
    
    ReadReceipt -->|Enabled| MarkAsRead[Mark as Read]
    ReadReceipt -->|Disabled| DeliveryConfirmation[Delivery Confirmation]
    
    MarkAsRead --> BlockchainLog[Log to Blockchain]
    DeliveryConfirmation --> BlockchainLog
    
    BlockchainLog --> AuditTrail[Immutable Audit Trail]
    AuditTrail --> End([Message Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style E2EEncryption fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style BlockchainLog fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Signal Protocol (double ratchet algorithm, forward secrecy)
- **T2:** Ephemeral Messaging (automatic deletion with blockchain log)
- **T3:** Privilege Tagger (NLP-based privilege detection)
