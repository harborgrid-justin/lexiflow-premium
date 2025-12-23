[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Notification System - SECONDARY FLOW

##  Operational Objective
Intelligent notification routing with urgency-based escalation and multi-channel delivery.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Notification Trigger]) --> TriggerType{Trigger<br/>Type}
    
    TriggerType -->|Deadline| DeadlineNotif[Deadline Notification]
    TriggerType -->|Task| TaskNotif[Task Notification]
    TriggerType -->|Status Update| StatusNotif[Status Update]
    TriggerType -->|System Alert| SystemNotif[System Alert]
    
    DeadlineNotif --> UrgencyAnalysis[Analyze Urgency]
    TaskNotif --> UrgencyAnalysis
    StatusNotif --> UrgencyAnalysis
    SystemNotif --> UrgencyAnalysis
    
    UrgencyAnalysis --> UrgencyLevel{Urgency<br/>Level}
    
    UrgencyLevel -->|Critical| CriticalPath[Critical Path]
    UrgencyLevel -->|High| HighPath[High Priority]
    UrgencyLevel -->|Medium| MediumPath[Medium Priority]
    UrgencyLevel -->|Low| LowPath[Low Priority]
    
    CriticalPath --> EscalationChain[Escalation Chain]
    EscalationChain --> PrimaryRecipient[Primary Recipient]
    PrimaryRecipient --> SMS[Send SMS]
    PrimaryRecipient --> PhoneCall[Automated Phone Call]
    PrimaryRecipient --> Email[Send Email]
    PrimaryRecipient --> Push[Push Notification]
    
    SMS --> DeliveryTracking[Track Delivery]
    PhoneCall --> DeliveryTracking
    Email --> DeliveryTracking
    Push --> DeliveryTracking
    
    DeliveryTracking --> AckTimeout{Acknowledged<br/>in 15min?}
    AckTimeout -->|No| EscalateManager[Escalate to Manager]
    AckTimeout -->|Yes| NotificationLog[Log Notification]
    
    EscalateManager --> ManagerNotif[Manager Multi-Channel]
    ManagerNotif --> ManagerAck{Manager<br/>Ack?}
    ManagerAck -->|No| ExecutiveEscalation[Executive Escalation]
    ManagerAck -->|Yes| NotificationLog
    
    ExecutiveEscalation --> NotificationLog
    
    HighPath --> MultiChannel[Multi-Channel Delivery]
    MultiChannel --> EmailNotif[Email Notification]
    MultiChannel --> PushNotif[Push Notification]
    MultiChannel --> InAppNotif[In-App Notification]
    
    EmailNotif --> NotificationLog
    PushNotif --> NotificationLog
    InAppNotif --> NotificationLog
    
    MediumPath --> SingleChannel[Single Channel]
    SingleChannel --> InAppOnly[In-App Only]
    InAppOnly --> NotificationLog
    
    LowPath --> BatchNotif[Batch Notification]
    BatchNotif --> DailyDigest[Daily Digest]
    DailyDigest --> DigestEmail[Digest Email]
    DigestEmail --> NotificationLog
    
    NotificationLog --> UserPreferences[Check User Preferences]
    UserPreferences --> DoNotDisturb{Do Not<br/>Disturb?}
    
    DoNotDisturb -->|Yes| QueueNotif[Queue for Later]
    DoNotDisturb -->|No| DeliverNotif[Deliver Notification]
    
    QueueNotif --> End([Notification Queued])
    DeliverNotif --> End2([Notification Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style UrgencyAnalysis fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style EscalationChain fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
    style End2 fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Urgency Classifier (ML model based on deadline proximity, matter importance)
- **T2:** Escalation Engine (multi-tier escalation with acknowledgment tracking)
- **T3:** Multi-Channel Orchestrator (SMS via Twilio, email via SendGrid, push via FCM)
