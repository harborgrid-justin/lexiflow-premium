# Enterprise Dashboard & Analytics Integration Guide

This guide demonstrates how to integrate the Enterprise Dashboard and Analytics Widgets into your LexiFlow Premium application.

## Components Created

### 1. EnterpriseDashboard
**Location:** `/home/user/lexiflow-premium/frontend/src/components/enterprise/EnterpriseDashboard.tsx`

A comprehensive executive dashboard with:
- ✅ Executive KPI cards (matters opened, revenue, billable hours, collection rate)
- ✅ Real-time activity feed
- ✅ Case pipeline visualization
- ✅ Team performance metrics
- ✅ Financial summary widgets
- ✅ Custom widget system

### 2. AnalyticsWidgets
**Location:** `/home/user/lexiflow-premium/frontend/src/components/enterprise/AnalyticsWidgets.tsx`

Advanced analytics charts for:
- ✅ Case trends (opened, closed, win rate)
- ✅ Billing trends (revenue, collections, AR aging)
- ✅ Attorney utilization (billable vs non-billable hours)
- ✅ Client acquisition (new clients, retention, lifetime value)
- ✅ Practice area performance analysis

## Basic Usage

### Option 1: Standalone Dashboard

```tsx
import { EnterpriseDashboard } from '@/components/enterprise';

export default function ExecutiveDashboardPage() {
  const handleRefresh = async () => {
    // Refresh data from API
    console.log('Refreshing dashboard data...');
  };

  const handleExport = () => {
    // Export dashboard data
    console.log('Exporting dashboard...');
  };

  return (
    <div className="p-8">
      <EnterpriseDashboard
        userId="current-user-id"
        dateRange={{
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        }}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />
    </div>
  );
}
```

### Option 2: Analytics Widgets Only

```tsx
import { AnalyticsWidgets } from '@/components/enterprise';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <AnalyticsWidgets
        dateRange={{
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date(),
        }}
        selectedWidgets={['case-trends', 'billing-trends', 'attorney-utilization']}
      />
    </div>
  );
}
```

### Option 3: Combined Layout

```tsx
import { EnterpriseDashboard, AnalyticsWidgets } from '@/components/enterprise';
import { useState } from 'react';

export default function EnterpriseHomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Executive Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'dashboard' ? (
          <EnterpriseDashboard />
        ) : (
          <AnalyticsWidgets />
        )}
      </div>
    </div>
  );
}
```

## Integration with Existing Routes

### Update Dashboard Route

Update `/home/user/lexiflow-premium/frontend/src/routes/dashboard.tsx`:

```tsx
import { EnterpriseDashboard } from '@/components/enterprise';
import { useAppController } from '@/hooks/core';
import type { Route } from "./+types/dashboard";

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  const { currentUser } = useAppController();

  return (
    <EnterpriseDashboard
      userId={currentUser?.id}
      dateRange={{
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      }}
    />
  );
}
```

### Add to Analytics Route

Update `/home/user/lexiflow-premium/frontend/src/routes/analytics/index.tsx`:

```tsx
import { AnalyticsWidgets } from '@/components/enterprise';

export default function AnalyticsIndexRoute() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Comprehensive business intelligence and performance insights
        </p>
      </div>

      <AnalyticsWidgets />
    </div>
  );
}
```

## API Integration

### Replace Mock Data with Real API Calls

Both components use mock data by default. To integrate with your backend:

```tsx
import { EnterpriseDashboard } from '@/components/enterprise';
import { useState, useEffect } from 'react';

export default function DashboardWithAPI() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoints
      const response = await fetch('/api/enterprise/dashboard');
      const data = await response.json();
      // Update component with real data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <EnterpriseDashboard
      isLoading={isLoading}
      error={error}
      onRefresh={fetchDashboardData}
    />
  );
}
```

## Customization Options

### EnterpriseDashboard Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID for personalized data |
| `dateRange` | `{ start: Date; end: Date }` | Date range for analytics |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `onRefresh` | `() => void` | Refresh handler |
| `onConfigureWidgets` | `() => void` | Widget configuration handler |
| `onExport` | `() => void` | Export handler |
| `className` | `string` | Additional CSS classes |

### AnalyticsWidgets Props

| Prop | Type | Description |
|------|------|-------------|
| `dateRange` | `{ start: Date; end: Date }` | Date range for analytics |
| `isLoading` | `boolean` | Loading state |
| `onRefresh` | `() => void` | Refresh handler |
| `selectedWidgets` | `string[]` | Widget IDs to display |
| `className` | `string` | Additional CSS classes |

### Available Widget IDs

- `'case-trends'` - Case trends chart
- `'billing-trends'` - Billing and collections charts
- `'attorney-utilization'` - Attorney utilization chart
- `'client-acquisition'` - Client acquisition charts
- `'practice-areas'` - Practice area performance radar

## Styling & Theming

Both components use:
- **Tailwind CSS** for responsive design
- **Theme Context** for dark mode support
- **Framer Motion** for animations
- **Recharts** for data visualization

All components automatically adapt to your theme settings and work seamlessly in both light and dark modes.

## Features Implemented

### Executive Dashboard Features

1. **KPI Cards**
   - Matters Opened (with target tracking)
   - Total Revenue
   - Billable Hours
   - Collection Rate

2. **Revenue Overview Chart**
   - Monthly revenue trends
   - Target comparisons
   - Collection tracking

3. **Case Pipeline Visualization**
   - Stage-by-stage breakdown
   - Total value per stage
   - Color-coded stages

4. **Team Performance**
   - Billable vs total hours
   - Individual attorney metrics
   - Utilization rates

5. **Real-Time Activity Feed**
   - Recent case activities
   - Priority indicators
   - User attribution

6. **Financial Summary Widget**
   - Revenue breakdown
   - AR outstanding
   - Realization & collection rates

### Analytics Features

1. **Case Trends**
   - Cases opened/closed over time
   - Win rate tracking
   - Outcome breakdown

2. **Billing Analytics**
   - Revenue vs collections
   - AR aging distribution
   - Realization rates

3. **Attorney Utilization**
   - Billable hours breakdown
   - Non-billable time tracking
   - Administrative overhead

4. **Client Acquisition**
   - New vs lost clients
   - Retention metrics
   - Lifetime value trends

5. **Practice Area Performance**
   - Multi-dimensional radar chart
   - Win rates by area
   - Utilization comparison

## Next Steps

1. **Replace Mock Data**: Connect to your backend API
2. **Add Filters**: Implement date range and filter controls
3. **Export Functionality**: Add PDF/Excel export capabilities
4. **Real-time Updates**: Integrate WebSocket for live data
5. **Permissions**: Add role-based access controls
6. **Customization**: Allow users to configure widget layouts

## Support

For questions or issues, refer to:
- Component source code with inline documentation
- Existing dashboard patterns in `/frontend/src/components/dashboard/`
- Analytics components in `/frontend/src/components/enterprise/analytics/`
