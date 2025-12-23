[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Performance Metrics - SECONDARY FLOW

##  Operational Objective
Real-time attorney utilization tracking, matter velocity analysis, and client satisfaction measurement.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Metrics Request]) --> MetricType{Metric<br/>Type}
    
    MetricType -->|Attorney Utilization| AttorneyMetrics[Attorney Utilization]
    MetricType -->|Matter Velocity| MatterMetrics[Matter Velocity]
    MetricType -->|Client Satisfaction| ClientMetrics[Client Satisfaction]
    
    AttorneyMetrics --> TimeData[(Time Entry Data)]
    TimeData --> BillableHours[Calculate Billable Hours]
    BillableHours --> UtilizationRate[Utilization Rate %]
    
    UtilizationRate --> TargetComparison[Compare to Target]
    TargetComparison --> IndustryBenchmark[Industry Benchmarking]
    IndustryBenchmark --> PerformanceScore[Performance Score]
    
    PerformanceScore --> Ranking[Rank Attorneys]
    Ranking --> TopPerformers[Identify Top Performers]
    TopPerformers --> UnderPerformers[Identify Underperformers]
    
    MatterMetrics --> MatterData[(Matter Database)]
    MatterData --> TimeToResolution[Time to Resolution]
    TimeToResolution --> StageAnalysis[Stage Analysis]
    StageAnalysis --> BottleneckDetection[Bottleneck Detection]
    
    BottleneckDetection --> ProcessMapping[Process Mapping]
    ProcessMapping --> ImprovementOpportunities[Improvement Opportunities]
    ImprovementOpportunities --> RecommendedActions[Recommended Actions]
    
    ClientMetrics --> SurveyData[(Survey Responses)]
    SurveyData --> NPSCalculation[Calculate NPS]
    NPSCalculation --> SentimentAnalysis[AI Sentiment Analysis]
    SentimentAnalysis --> SatisfactionTrends[Satisfaction Trends]
    
    SatisfactionTrends --> ClientFeedback[Analyze Feedback]
    ClientFeedback --> ActionItems[Generate Action Items]
    ActionItems --> FollowUpRequired[Follow-Up Required]
    
    UnderPerformers --> Dashboard[Performance Dashboard]
    RecommendedActions --> Dashboard
    FollowUpRequired --> Dashboard
    
    Dashboard --> RealtimeMetrics[Real-Time Metrics]
    RealtimeMetrics --> VisualizationLayer[Visualization Layer]
    VisualizationLayer --> End([Metrics Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style IndustryBenchmark fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style SentimentAnalysis fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Utilization Calculator (billable hours / available hours, target: 75-85%)
- **T2:** Matter Velocity Tracker (stage duration analysis, bottleneck identification)
- **T3:** NPS Calculator (Promoters - Detractors / Total × 100)
