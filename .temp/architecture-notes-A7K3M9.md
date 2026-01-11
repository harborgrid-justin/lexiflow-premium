# CRM Component Architecture Notes - A7K3M9

## High-level Design Decisions

### Component Hierarchy
```
BusinessDevelopment/
├── types/
│   └── index.ts (shared types)
├── components/
│   ├── metrics/
│   │   └── BusinessDevelopmentMetrics.tsx
│   ├── leads/
│   │   ├── LeadFilters.tsx
│   │   ├── LeadPipelineChart.tsx
│   │   ├── LeadCard.tsx
│   │   └── LeadsList.tsx
│   ├── pitches/
│   │   ├── PitchCard.tsx
│   │   └── PitchesList.tsx
│   ├── rfps/
│   │   ├── RFPCard.tsx
│   │   └── RFPsList.tsx
│   └── analysis/
│       ├── WinLossAnalysisCharts.tsx
│       └── WinLossAnalysisCard.tsx
└── BusinessDevelopment.tsx (main orchestrator)

ClientAnalytics/
├── types/
│   └── index.ts
├── components/
│   ├── metrics/
│   │   └── ClientAnalyticsMetrics.tsx
│   ├── profitability/
│   │   ├── ProfitabilityChart.tsx
│   │   ├── ClientProfitabilityCard.tsx
│   │   └── ClientSegmentCharts.tsx
│   ├── ltv/
│   │   └── LifetimeValueCard.tsx
│   ├── risk/
│   │   └── RiskAssessmentCard.tsx
│   └── satisfaction/
│       └── SatisfactionCard.tsx
└── ClientAnalytics.tsx

IntakeManagement/
├── types/
│   └── index.ts
├── components/
│   ├── metrics/
│   │   └── IntakeMetrics.tsx
│   ├── requests/
│   │   ├── IntakeFilters.tsx
│   │   └── IntakeRequestCard.tsx
│   ├── forms/
│   │   ├── FormTemplateCard.tsx
│   │   └── FormFieldsEditor.tsx
│   ├── conflicts/
│   │   ├── ConflictCheckForm.tsx
│   │   └── ConflictCheckResultCard.tsx
│   └── agreements/
│       └── FeeAgreementCard.tsx
└── IntakeManagement.tsx
```

### State Management Approach
- **Local state** for tab selection and UI state in main components
- **Props drilling** for data (mock data is small enough)
- **No context needed** at this stage (data is mock/static)
- Future: Consider Context API if real data fetching is added

### Props vs. Context API Decisions
- Using **props** for all data passing
- Main components manage tab state
- Child components are presentational/controlled
- No complex state management needed for current scope

### Performance Optimization Strategies
- **React.memo** for card components (frequently re-rendered lists)
- **useMemo** for expensive calculations (metrics, aggregations)
- **useCallback** for event handlers passed to children
- Chart components already optimized via Recharts

## Integration Patterns

### Parent-Child Component Communication
- Main components pass data down as props
- Card components emit events via callback props
- No complex state lifting needed

### Sibling Component Communication
- Through parent component state
- Tab switching managed in main component
- Shared data passed from parent

## React Patterns Used

### Custom Hooks Design
- Not needed initially (mock data is static)
- Future: `useBusinessDevelopmentData()`, `useClientAnalytics()`, `useIntakeManagement()`

### Compound Components
- Tab pattern in main components
- Card pattern with header/body/actions sections

### Render Props vs. Hooks
- Using **hooks** approach (functional components)
- No render props needed

### HOC Usage
- None needed for this refactoring

## Performance Considerations

### Memoization Strategy
- Memo card components in lists
- Memo chart components
- Memo filter components
- UseMemo for metric calculations

### Code Splitting Points
- Main components can be lazy-loaded
- Chart components can be lazy-loaded
- Tab content can be lazy-loaded

### Lazy Loading Approach
```typescript
const LeadsList = React.lazy(() => import('./components/leads/LeadsList'));
const PitchesList = React.lazy(() => import('./components/pitches/PitchesList'));
```

### Re-render Optimization
- Proper key props for list items
- Memoized callbacks to prevent child re-renders
- Stable data structures (no inline object/array creation)

## Type Safety

### TypeScript Interface Design
- Shared types in `types/index.ts` for each module
- Strict prop types for all components
- Generic components where appropriate (e.g., StatusBadge<T>)

### Generic Component Patterns
```typescript
interface StatusBadgeProps<T extends string> {
  status: T;
  colorMap: Record<T, string>;
}
```

### Props Type Definitions
- All props interfaces exported
- Required vs optional clearly defined
- Event handler types explicit

### Event Handler Typing
```typescript
interface LeadCardProps {
  lead: Lead;
  onSelect?: (leadId: string) => void;
  onEdit?: (leadId: string) => void;
}
```

## Shared Component Opportunities

### StatusBadge Component
- Generic status display
- Color mapping based on status type
- Used across all CRM components

### TrendIndicator Component
- Up/down/stable indicators
- Icon + color coordination
- Reusable across analytics

### ProgressBar Component
- Visual progress indication
- Percentage-based
- Color coding for status

### MetricDisplay Component
- Consistent metric formatting
- Icon + value + label pattern
- Trend indicator integration

## Testing Strategy
- Unit tests for individual components
- Integration tests for main orchestrators
- Visual regression tests for UI consistency
- Accessibility tests for keyboard navigation
