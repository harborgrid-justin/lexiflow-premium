[< Back to Index](../../00-ENTERPRISE-TAXONOMY-INDEX.md) | [< Back to Primary Flow](../PRIMARY-FLOW.md)

# Financial Reporting - SECONDARY FLOW

##  Operational Objective
Comprehensive financial analysis with P&L statements, AR aging, realization rates, and budget variance tracking.

##  DETAILED WORKFLOW

```mermaid
graph TB
    Start([Financial Report Request]) --> ReportType{Report<br/>Type}
    
    ReportType -->|P&L| ProfitLoss[P&L Statement]
    ReportType -->|AR| AccountsReceivable[AR Aging]
    ReportType -->|Realization| RealizationRate[Realization Rate]
    ReportType -->|Budget| BudgetVariance[Budget Variance]
    
    ProfitLoss --> RevenueData[(Revenue Data)]
    RevenueData --> RevenueRecognition[Revenue Recognition]
    RevenueRecognition --> ExpenseData[(Expense Data)]
    ExpenseData --> CostAllocation[Cost Allocation]
    
    CostAllocation --> GrossProfit[Calculate Gross Profit]
    GrossProfit --> OperatingExpenses[Operating Expenses]
    OperatingExpenses --> NetIncome[Calculate Net Income]
    
    NetIncome --> PracticeAreaBreakdown[Practice Area Breakdown]
    PracticeAreaBreakdown --> ProfitabilityAnalysis[Profitability Analysis]
    ProfitabilityAnalysis --> MarginCalculation[Margin Calculation]
    
    AccountsReceivable --> InvoiceData[(Invoice Database)]
    InvoiceData --> AgingBuckets[Aging Buckets]
    AgingBuckets --> Current[0-30 Days]
    AgingBuckets --> Days30[31-60 Days]
    AgingBuckets --> Days60[61-90 Days]
    AgingBuckets --> Over90[90+ Days]
    
    Current --> CollectionRisk[Collection Risk Score]
    Days30 --> CollectionRisk
    Days60 --> CollectionRisk
    Over90 --> CollectionRisk
    
    CollectionRisk --> RiskLevel{Risk<br/>Level}
    RiskLevel -->|High| PriorityCollection[Priority Collection]
    RiskLevel -->|Medium| StandardFollowUp[Standard Follow-Up]
    RiskLevel -->|Low| MonitorOnly[Monitor Only]
    
    PriorityCollection --> ActionableInsights[Actionable Insights]
    StandardFollowUp --> ActionableInsights
    MonitorOnly --> ActionableInsights
    
    RealizationRate --> BilledHours[(Billed Hours)]
    BilledHours --> CollectedRevenue[(Collected Revenue)]
    CollectedRevenue --> RealizationCalc[Realization = Collected / Billed]
    
    RealizationCalc --> WriteOffAnalysis[Write-Off Analysis]
    WriteOffAnalysis --> WriteOffReasons[Analyze Write-Off Reasons]
    WriteOffReasons --> PricingStrategy[Pricing Strategy Review]
    PricingStrategy --> RevenueOptimization[Revenue Optimization]
    
    BudgetVariance --> BudgetedAmounts[(Budgeted Amounts)]
    BudgetedAmounts --> ActualAmounts[(Actual Amounts)]
    ActualAmounts --> VarianceCalculation[Calculate Variance]
    
    VarianceCalculation --> VarianceAnalysis{Variance<br/>Type}
    VarianceAnalysis -->|Favorable| FavorableVariance[Favorable Variance]
    VarianceAnalysis -->|Unfavorable| UnfavorableVariance[Unfavorable Variance]
    
    FavorableVariance --> VarianceExplanation[Variance Explanation]
    UnfavorableVariance --> VarianceExplanation
    
    VarianceExplanation --> ForecastAdjustment[Forecast Adjustment]
    ForecastAdjustment --> UpdatedForecast[Updated Forecast]
    
    MarginCalculation --> FinancialDashboard[Financial Dashboard]
    ActionableInsights --> FinancialDashboard
    RevenueOptimization --> FinancialDashboard
    UpdatedForecast --> FinancialDashboard
    
    FinancialDashboard --> ExecutiveReport[Executive Report]
    ExecutiveReport --> End([Report Delivered])
    
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:3px,color:#fff
    style ProfitabilityAnalysis fill:#10b981,stroke:#065f46,stroke-width:2px,color:#fff
    style CollectionRisk fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#fff
    style End fill:#6366f1,stroke:#312e81,stroke-width:3px,color:#fff
```

##  TERTIARY WORKFLOWS
- **T1:** P&L Generator (GAAP-compliant accounting, practice area allocation)
- **T2:** AR Aging Engine (automated collection risk scoring)
- **T3:** Realization Calculator (collected / billed × 100, target: >90%)
