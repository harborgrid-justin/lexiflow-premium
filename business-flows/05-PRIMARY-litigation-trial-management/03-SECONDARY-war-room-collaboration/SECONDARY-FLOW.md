[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# War Room Collaboration - SECONDARY FLOW

##  Operational Objective
Real-time trial team coordination with document hot seat, task delegation, and live collaboration.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Activate War Room]) --> TeamSetup[Setup War Room Team]
    TeamSetup --> RoleAssignment[Assign Roles]
    RoleAssignment --> Roles{Team<br/>Roles}
    
    Roles -->|Lead Counsel| LeadCounsel[Lead Counsel]
    Roles -->|Co-Counsel| CoCounsel[Co-Counsel]
    Roles -->|Paralegals| Paralegals[Paralegal Team]
    Roles -->|Associates| Associates[Associate Team]
    
    LeadCounsel --> Channels[Create Communication Channels]
    CoCounsel --> Channels
    Paralegals --> Channels
    Associates --> Channels
    
    Channels --> ChannelTypes{Channel<br/>Type}
    ChannelTypes -->|General| GeneralChannel[General Updates]
    ChannelTypes -->|Witnesses| WitnessChannel[Witness Prep]
    ChannelTypes -->|Exhibits| ExhibitChannel[Exhibit Management]
    ChannelTypes -->|Research| ResearchChannel[Legal Research]
    
    GeneralChannel --> TaskDelegation[Task Delegation System]
    WitnessChannel --> TaskDelegation
    ExhibitChannel --> TaskDelegation
    ResearchChannel --> TaskDelegation
    
    TaskDelegation --> AssignTasks[Assign Tasks]
    AssignTasks --> TaskPriority{Task<br/>Priority}
    TaskPriority -->|Urgent| ImmediateTask[Immediate Action]
    TaskPriority -->|High| HighPriorityTask[High Priority]
    TaskPriority -->|Normal| NormalTask[Normal Priority]
    
    ImmediateTask --> DocumentHotSeat[Document Hot Seat]
    HighPriorityTask --> DocumentHotSeat
    NormalTask --> DocumentHotSeat
    
    DocumentHotSeat --> QuickAccess[Quick Access Docs]
    QuickAccess --> RealtimeAnnotation[Real-Time Annotation]
    RealtimeAnnotation --> CollaborativeEditing[Collaborative Editing]
    
    CollaborativeEditing --> VersionTracking[Track Versions]
    VersionTracking --> StatusUpdates[Status Updates]
    StatusUpdates --> ProgressTracking[Track Progress]
    
    ProgressTracking --> TrialDayMode{Trial<br/>Day Active?}
    TrialDayMode -->|Yes| LiveMode[Live Trial Mode]
    TrialDayMode -->|No| PrepMode[Preparation Mode]
    
    LiveMode --> CourtroomDisplay[Courtroom Display]
    CourtroomDisplay --> ExhibitPresentation[Present Exhibits]
    ExhibitPresentation --> RealTimeNotes[Real-Time Notes]
    
    PrepMode --> DailyBriefing[Daily Team Briefing]
    DailyBriefing --> NextDayPrep[Next Day Prep]
    
    RealTimeNotes --> End([War Room Active])
    NextDayPrep --> End
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style TaskDelegation fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style DocumentHotSeat fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Real-Time Messaging (WebSocket implementation)
- **T2:** Document Hot Seat (instant search across all trial docs)
- **T3:** Task Assignment System (priority queue with notifications)
