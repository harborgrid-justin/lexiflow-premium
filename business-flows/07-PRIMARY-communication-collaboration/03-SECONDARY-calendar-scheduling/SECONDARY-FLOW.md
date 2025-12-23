[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Calendar & Scheduling - SECONDARY FLOW

##  Operational Objective
Rule-based deadline calculation with multi-calendar sync and intelligent conflict resolution.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Calendar Event]) --> EventType{Event<br/>Type}
    
    EventType -->|Court Date| CourtDate[Court Date Entry]
    EventType -->|Deadline| DeadlineCalc[Deadline Calculation]
    EventType -->|Meeting| MeetingSchedule[Meeting Schedule]
    EventType -->|Hearing| HearingSchedule[Hearing Schedule]
    
    CourtDate --> CourtType{Court<br/>Type}
    CourtType -->|Federal| FederalRules[Apply FRCP Rules]
    CourtType -->|State| StateRules[Apply State Rules]
    
    FederalRules --> RuleBasedCalc[Rule-Based Calculator]
    StateRules --> RuleBasedCalc
    
    RuleBasedCalc --> BusinessDays[Calculate Business Days]
    BusinessDays --> HolidayCheck[Check Holidays]
    HolidayCheck --> GenerateDeadlines[Generate Cascading Deadlines]
    
    DeadlineCalc --> DeadlineType{Deadline<br/>Type}
    DeadlineType -->|Discovery| DiscoveryDeadline[Discovery Deadline]
    DeadlineType -->|Motion| MotionDeadline[Motion Deadline]
    DeadlineType -->|Filing| FilingDeadline[Filing Deadline]
    
    DiscoveryDeadline --> RuleBasedCalc
    MotionDeadline --> RuleBasedCalc
    FilingDeadline --> RuleBasedCalc
    
    GenerateDeadlines --> CreateEvents[Create Calendar Events]
    CreateEvents --> NotificationSchedule[Schedule Notifications]
    NotificationSchedule --> ReminderTiming{Reminder<br/>Timing}
    
    ReminderTiming -->|Critical| MultipleReminders[Multiple Reminders]
    ReminderTiming -->|Standard| StandardReminder[Standard Reminder]
    
    MultipleReminders --> Reminder30Days[30 Days Before]
    MultipleReminders --> Reminder7Days[7 Days Before]
    MultipleReminders --> Reminder1Day[1 Day Before]
    
    MeetingSchedule --> AttendeeList[Identify Attendees]
    AttendeeList --> AvailabilityCheck[Check Availability]
    AvailabilityCheck --> ConflictDetection{Conflicts?}
    
    ConflictDetection -->|Yes| ProposeAlternates[Propose Alternates]
    ConflictDetection -->|No| ScheduleMeeting[Schedule Meeting]
    ProposeAlternates --> AvailabilityCheck
    
    HearingSchedule --> RuleBasedCalc
    
    ScheduleMeeting --> SendInvites[Send Invites]
    SendInvites --> CalendarSync[Sync to External Calendars]
    
    CreateEvents --> CalendarSync
    Reminder30Days --> CalendarSync
    Reminder7Days --> CalendarSync
    Reminder1Day --> CalendarSync
    StandardReminder --> CalendarSync
    
    CalendarSync --> SyncTargets{Sync<br/>Targets}
    SyncTargets -->|Outlook| OutlookSync[Microsoft Exchange]
    SyncTargets -->|Google| GoogleCalendarSync[Google Calendar API]
    SyncTargets -->|Apple| AppleCalendarSync[Apple Calendar]
    
    OutlookSync --> VerifySync[Verify Sync]
    GoogleCalendarSync --> VerifySync
    AppleCalendarSync --> VerifySync
    
    VerifySync --> End([Calendar Updated])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style RuleBasedCalc fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style CalendarSync fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Deadline Calculator (FRCP/state rules engine with business day logic)
- **T2:** Conflict Resolver (ML-based optimal meeting time finder)
- **T3:** Multi-Calendar Sync (bidirectional Outlook/Google/Apple CalDAV)
