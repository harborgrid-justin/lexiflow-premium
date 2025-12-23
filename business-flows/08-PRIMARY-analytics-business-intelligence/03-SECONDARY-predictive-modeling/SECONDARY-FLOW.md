[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Predictive Modeling - SECONDARY FLOW

##  Operational Objective
Machine learning models for case outcome prediction, budget forecasting, judge behavior, and client churn.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Prediction Request]) --> ModelType{Model<br/>Type}
    
    ModelType -->|Case Outcome| OutcomeModel[Case Outcome Prediction]
    ModelType -->|Budget| BudgetModel[Budget Forecast]
    ModelType -->|Judge| JudgeModel[Judge Behavior]
    ModelType -->|Churn| ChurnModel[Client Churn]
    
    OutcomeModel --> HistoricalCases[(Historical Cases)]
    HistoricalCases --> FeatureExtraction[Feature Extraction]
    FeatureExtraction --> CaseFeatures{Case<br/>Features}
    
    CaseFeatures -->|Jurisdiction| JurisdictionFeat[Jurisdiction]
    CaseFeatures -->|Judge| JudgeFeat[Assigned Judge]
    CaseFeatures -->|Case Type| CaseTypeFeat[Case Type]
    CaseFeatures -->|Damages| DamagesFeat[Damages Amount]
    
    JurisdictionFeat --> MLPipeline[ML Pipeline]
    JudgeFeat --> MLPipeline
    CaseTypeFeat --> MLPipeline
    DamagesFeat --> MLPipeline
    
    MLPipeline --> TrainedModel[Trained Model]
    TrainedModel --> Prediction[Generate Prediction]
    Prediction --> ProbabilityScore[Probability Score]
    ProbabilityScore --> ConfidenceInterval[Confidence Interval]
    
    ConfidenceInterval --> FactorAnalysis[Factor Analysis]
    FactorAnalysis --> KeyDrivers[Identify Key Drivers]
    KeyDrivers --> StrategyRecommendation[Strategy Recommendation]
    
    BudgetModel --> HistoricalSpend[(Historical Spend)]
    HistoricalSpend --> SpendPatterns[Analyze Spend Patterns]
    SpendPatterns --> SeasonalityAnalysis[Seasonality Analysis]
    SeasonalityAnalysis --> TimeSeriesModel[Time Series Model]
    
    TimeSeriesModel --> ForecastBudget[Forecast Budget]
    ForecastBudget --> BudgetRange[Budget Range]
    BudgetRange --> BudgetAlerts[Budget Alerts]
    BudgetAlerts --> VarianceMonitoring[Variance Monitoring]
    
    JudgeModel --> JudgeDatabase[(Judge Database)]
    JudgeDatabase --> RulingHistory[Ruling History]
    RulingHistory --> PatternRecognition[Pattern Recognition]
    PatternRecognition --> MotionSuccessRate[Motion Success Rate]
    
    MotionSuccessRate --> GrantDenyRatio[Grant/Deny Ratio]
    GrantDenyRatio --> JudicialProfile[Judicial Profile]
    JudicialProfile --> JudgeRecommendation[Judge-Specific Recommendations]
    
    ChurnModel --> ClientBehavior[(Client Behavior)]
    ClientBehavior --> EngagementMetrics[Engagement Metrics]
    EngagementMetrics --> SatisfactionHistory[Satisfaction History]
    SatisfactionHistory --> ChurnRiskScore[Churn Risk Score]
    
    ChurnRiskScore --> RiskSegmentation{Risk<br/>Segment}
    RiskSegmentation -->|High Risk| ImmediateIntervention[Immediate Intervention]
    RiskSegmentation -->|Medium Risk| ProactiveOutreach[Proactive Outreach]
    RiskSegmentation -->|Low Risk| StandardCare[Standard Care]
    
    ImmediateIntervention --> RetentionStrategy[Retention Strategy]
    ProactiveOutreach --> RetentionStrategy
    StandardCare --> RetentionStrategy
    
    StrategyRecommendation --> PredictionsOutput[Predictions Output]
    VarianceMonitoring --> PredictionsOutput
    JudgeRecommendation --> PredictionsOutput
    RetentionStrategy --> PredictionsOutput
    
    PredictionsOutput --> ModelPerformance[Track Model Performance]
    ModelPerformance --> AccuracyMetrics[Accuracy Metrics]
    AccuracyMetrics --> ModelRetraining[Model Retraining]
    
    ModelRetraining --> End([Predictions Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style MLPipeline fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style ChurnRiskScore fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** Case Outcome Model (XGBoost, features: judge, jurisdiction, damages, case type)
- **T2:** Budget Forecast Model (ARIMA time series, seasonality adjustment)
- **T3:** Judge Behavior Model (random forest, historical ruling patterns)
- **T4:** Churn Prediction Model (logistic regression, engagement + satisfaction scores)

##  METRICS
- Case Outcome Accuracy: >75%
- Budget Forecast MAE: <15%
- Judge Prediction AUC: >0.80
- Churn Prediction Recall: >70%
