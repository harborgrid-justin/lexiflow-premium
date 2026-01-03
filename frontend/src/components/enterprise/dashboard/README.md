# Enterprise Dashboard Components

## Overview

This directory contains production-ready, enterprise-grade dashboard components for the LexiFlow Premium platform. These components provide comprehensive data visualization, real-time monitoring, and analytics capabilities with proper TypeScript types, error boundaries, and loading states.

## Components

### Core Dashboard Components

#### 1. **ExecutiveSummaryPanel**
High-level executive dashboard with comprehensive KPIs and metrics.

```tsx
import { ExecutiveSummaryPanel } from '@/components/enterprise/dashboard';

<ExecutiveSummaryPanel
  summary={{
    totalRevenue: 1250000,
    revenueChange: 12.5,
    totalCases: 156,
    casesChange: 8.2,
    activeCases: 89,
    activeCasesChange: 5.1,
    teamSize: 24,
    averageEfficiency: 87.5,
    efficiencyChange: 3.2,
    billableHours: 1840,
    billableHoursChange: 6.8,
    collectionRate: 94.2,
    collectionRateChange: 1.5,
    clientSatisfaction: 92.8,
    satisfactionChange: 2.1,
    upcomingDeadlines: 12,
    overdueItems: 3,
  }}
  period="This Month"
  comparisonPeriod="vs Last Month"
/>
```

**Features:**
- 8 primary KPI cards with animated counters
- Trend indicators with percentage changes
- Critical alerts section for deadlines and overdue items
- Responsive grid layout
- Loading and error states

---

#### 2. **RealTimeActivityFeed**
Live activity feed with real-time updates and filtering.

```tsx
import { RealTimeActivityFeed } from '@/components/enterprise/dashboard';

<RealTimeActivityFeed
  activities={[
    {
      id: '1',
      type: 'case_created',
      title: 'New Case Created',
      description: 'Smith v. Johnson - Personal Injury',
      timestamp: new Date(),
      user: { id: '1', name: 'John Doe' },
      priority: 'high',
    },
    // ... more activities
  ]}
  maxItems={10}
  showFilter={true}
  autoRefresh={true}
  refreshInterval={30000}
  onActivityClick={(activity) => console.log(activity)}
/>
```

**Features:**
- Real-time activity stream
- Filterable by activity type
- Auto-refresh capability
- Priority indicators
- User avatars and timestamps
- Click handlers for navigation

---

#### 3. **AdvancedAnalyticsDashboard**
Multi-chart analytics dashboard with various visualization types.

```tsx
import { AdvancedAnalyticsDashboard } from '@/components/enterprise/dashboard';

<AdvancedAnalyticsDashboard
  charts={[
    {
      type: 'line',
      title: 'Revenue Trend',
      data: monthlyData,
      dataKeys: ['revenue', 'expenses'],
      showLegend: true,
      showGrid: true,
      height: 350,
    },
    {
      type: 'bar',
      title: 'Case Distribution',
      data: caseData,
      dataKeys: ['active', 'pending', 'closed'],
      colors: ['#3b82f6', '#f59e0b', '#10b981'],
    },
    {
      type: 'pie',
      title: 'Practice Areas',
      data: practiceData,
      dataKeys: ['value'],
    },
  ]}
  layout="grid"
  columns={2}
  onExport={(chartId) => exportChart(chartId)}
  onExpand={(chartId) => expandChart(chartId)}
/>
```

**Supported Chart Types:**
- Line charts
- Area charts
- Bar charts
- Pie charts
- Radar charts
- Scatter plots
- Composed charts

---

#### 4. **PerformanceMetricsGrid**
Detailed performance metrics with benchmarks and trends.

```tsx
import { PerformanceMetricsGrid } from '@/components/enterprise/dashboard';

<PerformanceMetricsGrid
  metrics={[
    {
      id: '1',
      category: 'Productivity',
      name: 'Cases Closed',
      value: 45,
      target: 50,
      benchmark: 40,
      unit: 'cases',
      trend: {
        current: 45,
        previous: 38,
        change: 7,
        changePercentage: 18.4,
        trend: 'up',
      },
      status: 'good',
      description: 'Monthly case closure rate',
    },
    // ... more metrics
  ]}
  showBenchmarks={true}
  showTargets={true}
  showTrends={true}
  groupBy="category"
/>
```

**Features:**
- Performance metrics with status indicators
- Progress bars for target tracking
- Trend analysis
- Benchmark comparisons
- Grouping and filtering
- Sortable by multiple criteria

---

#### 5. **TrendAnalysisWidget**
Advanced trend analysis with AI-powered predictions.

```tsx
import { TrendAnalysisWidget } from '@/components/enterprise/dashboard';

<TrendAnalysisWidget
  title="Revenue Forecast"
  data={historicalData}
  predictions={forecastData}
  trendData={{
    current: 125000,
    previous: 110000,
    change: 15000,
    changePercentage: 13.6,
    trend: 'up',
    prediction: 140000,
    confidence: 0.85,
  }}
  metric="Revenue"
  unit="USD"
  chartType="area"
  showPredictions={true}
  showConfidenceInterval={true}
  showInsights={true}
/>
```

**Features:**
- Historical data visualization
- AI-powered predictions
- Confidence intervals
- Automated insights generation
- Multiple time range filters
- Trend indicators

---

### Utility Components

#### 6. **DashboardErrorBoundary**
Robust error boundary for dashboard components.

```tsx
import { DashboardErrorBoundary } from '@/components/enterprise/dashboard';

<DashboardErrorBoundary
  onError={(error, errorInfo) => logError(error, errorInfo)}
  onReset={() => refetchData()}
  isolate={true}
  showDetails={true}
>
  <YourDashboardComponent />
</DashboardErrorBoundary>
```

**Features:**
- Graceful error handling
- Error details display
- Recovery actions
- Error logging integration
- Isolated or full-page mode

---

#### 7. **Dashboard Skeleton Loaders**
Professional loading states for all dashboard components.

```tsx
import {
  DashboardSkeleton,
  KPICardSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton,
  MetricsGridSkeleton,
} from '@/components/enterprise/dashboard';

// Full dashboard skeleton
<DashboardSkeleton />

// Individual component skeletons
<KPICardSkeleton />
<ChartSkeleton height={350} showHeader={true} />
<ActivityFeedSkeleton items={5} />
<MetricsGridSkeleton columns={4} rows={2} />
```

---

## TypeScript Types

All components come with comprehensive TypeScript types:

```typescript
import type {
  ExecutiveSummary,
  Activity,
  ActivityType,
  DashboardMetric,
  PerformanceMetric,
  TrendData,
  ChartDataPoint,
  BaseDashboardProps,
} from '@/types/dashboard';
```

## Best Practices

### 1. Error Handling
Always wrap dashboard components in error boundaries:

```tsx
<DashboardErrorBoundary isolate={true}>
  <ExecutiveSummaryPanel {...props} />
</DashboardErrorBoundary>
```

### 2. Loading States
Use skeleton loaders during data fetching:

```tsx
{isLoading ? (
  <DashboardSkeleton />
) : (
  <ExecutiveSummaryPanel summary={data} />
)}
```

### 3. Auto-refresh
Implement auto-refresh for real-time data:

```tsx
<RealTimeActivityFeed
  activities={activities}
  autoRefresh={true}
  refreshInterval={30000}
  onRefresh={refetchActivities}
/>
```

### 4. Responsive Design
All components are fully responsive and adapt to different screen sizes. Use the provided grid layouts:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Your components */}
</div>
```

### 5. Dark Mode Support
All components support dark mode through the theme context:

```tsx
import { useTheme } from '@/contexts/theme/ThemeContext';

const { theme, isDark } = useTheme();
```

## Performance Optimization

### Memoization
Components use React.memo and useMemo for optimal performance:

```tsx
const filteredData = useMemo(
  () => data.filter(item => item.status === 'active'),
  [data]
);
```

### Code Splitting
Use lazy loading for heavy dashboard components:

```tsx
const AdvancedAnalytics = lazy(() =>
  import('@/components/enterprise/dashboard').then(m => ({
    default: m.AdvancedAnalyticsDashboard
  }))
);

<Suspense fallback={<ChartSkeleton />}>
  <AdvancedAnalytics {...props} />
</Suspense>
```

## Integration Example

Complete dashboard page example:

```tsx
import React, { useState, useEffect } from 'react';
import {
  ExecutiveSummaryPanel,
  RealTimeActivityFeed,
  AdvancedAnalyticsDashboard,
  PerformanceMetricsGrid,
  DashboardErrorBoundary,
  DashboardSkeleton,
} from '@/components/enterprise/dashboard';

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData().then(setData).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 p-6">
      <DashboardErrorBoundary isolate={false}>
        <ExecutiveSummaryPanel
          summary={data.summary}
          period="This Month"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeActivityFeed
            activities={data.activities}
            autoRefresh={true}
            refreshInterval={30000}
          />

          <PerformanceMetricsGrid
            metrics={data.metrics}
            showBenchmarks={true}
          />
        </div>

        <AdvancedAnalyticsDashboard
          charts={data.charts}
          layout="grid"
          columns={2}
        />
      </DashboardErrorBoundary>
    </div>
  );
};
```

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus indicators

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)
- TailwindCSS (styling)

## License

Proprietary - LexiFlow Premium Platform
