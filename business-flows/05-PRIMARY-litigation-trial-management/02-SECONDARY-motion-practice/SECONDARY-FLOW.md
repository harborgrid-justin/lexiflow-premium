[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Motion Practice - SECONDARY FLOW

##  Operational Objective
AI-powered motion practice with success prediction, briefing schedules, and judicial analytics.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Motion Decision]) --> MotionType{Motion<br/>Type}
    MotionType -->|MTD| MotionToDismiss[Motion to Dismiss]
    MotionType -->|MSJ| SummaryJudgment[Summary Judgment]
    MotionType -->|MIL| MotionInLimine[Motion in Limine]
    
    MotionToDismiss --> DraftMotion[Draft Motion]
    SummaryJudgment --> DraftMotion
    MotionInLimine --> DraftMotion
    
    DraftMotion --> LegalResearch[Legal Research]
    LegalResearch --> JudgeAnalytics[Judge Analytics]
    JudgeAnalytics --> SuccessPrediction[AI Success Prediction]
    
    SuccessPrediction --> ProbabilityScore{Success<br/>Probability}
    ProbabilityScore -->|>70%| HighConfidence[High Confidence]
    ProbabilityScore -->|40-70%| MediumConfidence[Medium Confidence]
    ProbabilityScore -->|<40%| LowConfidence[Low Confidence]
    
    HighConfidence --> FileMotion[File Motion]
    MediumConfidence --> RefineArguments[Refine Arguments]
    LowConfidence --> AlternativeStrategy[Consider Alternative]
    RefineArguments --> FileMotion
    
    FileMotion --> BriefingSchedule[Calculate Briefing Schedule]
    BriefingSchedule --> OpposingDeadline[Opposing Response Deadline]
    OpposingDeadline --> ReplyDeadline[Reply Brief Deadline]
    ReplyDeadline --> HearingDate[Schedule Hearing]
    
    HearingDate --> PrepareOralArg[Prepare Oral Argument]
    PrepareOralArg --> MootCourt[Moot Court Practice]
    MootCourt --> Hearing[Oral Argument]
    
    Hearing --> CourtRuling[Await Ruling]
    CourtRuling --> End([Motion Decided])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style SuccessPrediction fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style BriefingSchedule fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Motion Success Predictor (logistic regression on judge history)
- **T2:** Briefing Calendar (rule-based deadline calculator)
- **T3:** Oral Argument Prep (Q&A generator based on brief)
