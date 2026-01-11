# CRM Component Refactoring Plan - A7K3M9

## Overview
Break down three large CRM components into smaller, focused components targeting ~90 LOC per file while maintaining all existing functionality.

## Target Components
1. **BusinessDevelopment.tsx** (891 LOC) → ~10 components
2. **ClientAnalytics.tsx** (832 LOC) → ~9 components
3. **IntakeManagement.tsx** (700 LOC) → ~8 components

## Refactoring Strategy

### Phase 1: BusinessDevelopment Component (891 LOC)
**Extraction Plan:**
- `BusinessDevelopmentMetrics.tsx` (~40 LOC) - Metric calculations and display
- `LeadFilters.tsx` (~60 LOC) - Filter and search UI
- `LeadPipelineChart.tsx` (~80 LOC) - Pipeline visualization chart
- `LeadCard.tsx` (~90 LOC) - Individual lead display card
- `LeadsList.tsx` (~80 LOC) - List container for leads
- `PitchCard.tsx` (~90 LOC) - Individual pitch activity card
- `PitchesList.tsx` (~70 LOC) - Pitch activities list
- `RFPCard.tsx` (~110 LOC) - Individual RFP display with sections
- `RFPsList.tsx` (~70 LOC) - RFP tracker list
- `WinLossAnalysisCharts.tsx` (~90 LOC) - Conversion trend and source charts
- `WinLossAnalysisCard.tsx` (~90 LOC) - Individual win/loss analysis card
- `BusinessDevelopment.tsx` (~120 LOC) - Main orchestrator with tabs

### Phase 2: ClientAnalytics Component (832 LOC)
**Extraction Plan:**
- `ClientAnalyticsMetrics.tsx` (~40 LOC) - Aggregate metrics calculation
- `ProfitabilityChart.tsx` (~80 LOC) - Revenue & profit trend chart
- `ClientProfitabilityCard.tsx` (~90 LOC) - Individual client profitability
- `ClientSegmentCharts.tsx` (~90 LOC) - Segment pie and bar charts
- `LifetimeValueCard.tsx` (~110 LOC) - LTV breakdown card with composition
- `RiskAssessmentCard.tsx` (~120 LOC) - Client risk factors and indicators
- `SatisfactionCard.tsx` (~110 LOC) - Satisfaction metrics with radar chart
- `ClientAnalyticsTabs.tsx` (~80 LOC) - Tab container components
- `ClientAnalytics.tsx` (~112 LOC) - Main orchestrator

### Phase 3: IntakeManagement Component (700 LOC)
**Extraction Plan:**
- `IntakeMetrics.tsx` (~40 LOC) - Metrics calculations
- `IntakeFilters.tsx` (~60 LOC) - Filter dropdowns
- `IntakeRequestCard.tsx` (~100 LOC) - Individual intake request with actions
- `FormTemplateCard.tsx` (~80 LOC) - Form template display
- `FormFieldsEditor.tsx` (~90 LOC) - Form builder field editor
- `ConflictCheckForm.tsx` (~80 LOC) - Conflict check input form
- `ConflictCheckResultCard.tsx` (~100 LOC) - Conflict check result display
- `FeeAgreementCard.tsx` (~110 LOC) - Fee agreement display
- `IntakeManagement.tsx` (~90 LOC) - Main orchestrator with tabs

## Shared Component Opportunities
- `StatusBadge.tsx` - Reusable status badge component
- `TrendIndicator.tsx` - Reusable trend indicator (up/down/stable)
- `ProgressBar.tsx` - Reusable progress bar component
- `MetricDisplay.tsx` - Reusable metric display component

## Timeline
- **Phase 1 (BusinessDevelopment)**: Extract and test 12 components
- **Phase 2 (ClientAnalytics)**: Extract and test 9 components
- **Phase 3 (IntakeManagement)**: Extract and test 9 components
- **Phase 4 (Shared Components)**: Extract and apply shared components
- **Phase 5 (Testing & Validation)**: Comprehensive testing and validation

## Success Criteria
- All components ~90 LOC or less
- All existing functionality preserved
- Proper TypeScript types maintained
- No prop drilling issues
- Proper component composition patterns
- All imports updated correctly
- Components are reusable and focused
