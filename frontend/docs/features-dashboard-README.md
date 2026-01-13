# LexiFlow Enterprise Dashboard

## Overview

The LexiFlow Enterprise Dashboard provides a comprehensive, role-specific view of key metrics, activities, and insights for legal professionals. Built with React, TypeScript, and Tailwind CSS, it offers a modern, responsive, and highly performant user experience.

## Features

### Core Components

#### 1. **KPICard** - Executive KPI Display
- Value with animated number transitions
- Previous value comparison with percentage change
- Trend indicators (up/down/neutral) with arrow icons
- Progress bars for goal tracking
- Customizable colors and formats (currency, percentage, number, duration)
- Loading states with skeleton UI

#### 2. **StatWidget** - Compact Statistics
- Lightweight alternative to KPICard
- Quick metric display with icons
- Change indicators
- Variant styles (success, warning, danger, info)

#### 3. **ChartCard** - Chart Container
- Wrapper for Recharts components
- Built-in loading states and error handling
- Refresh, export, and expand actions
- Consistent styling across all charts
- Responsive design

#### 4. **ActivityFeed** - Recent Activity Timeline
- Real-time activity stream
- User avatars and icons
- Priority indicators
- Timestamp formatting with relative time
- Click handlers for navigation
- Empty states

#### 5. **DeadlinesList** - Upcoming Deadlines
- Priority-based color coding
- Date badges with urgency labels
- Status indicators (pending/completed/overdue)
- Filtering and sorting
- Case associations

### Role-Specific Dashboards

#### Attorney Dashboard
**Focus**: Billable hours, case deadlines, workload management
- Daily billable hours tracking
- Active cases overview
- Utilization rate metrics
- Priority deadlines (next 2 weeks)
- Case workload breakdown by phase

#### Paralegal Dashboard
**Focus**: Task queue, document review, support activities
- Task completion metrics
- Pending task queue
- Document review statistics
- High priority task alerts
- Recent activity feed
- Task categorization by type

#### Admin Dashboard
**Focus**: Firm-wide metrics, user activity, system health
- Total user count and growth
- Daily active users
- System health monitoring
- User activity trends
- System statistics (cases, documents, API usage)
- Issue tracking

#### Partner Dashboard
**Focus**: Revenue, client acquisition, case outcomes
- Monthly revenue vs targets
- New client acquisition
- Win rate and case outcomes
- Client retention metrics
- Revenue trend analysis
- Business metrics (case value, satisfaction, referrals)

### Enhanced Dashboard Overview
Default executive summary view with:
- 7 KPI cards (cases, hours, revenue, deadlines, collection rate, satisfaction, priorities)
- Case status distribution pie chart
- Billing overview bar chart
- Recent activity feed
- Upcoming deadlines list
- Quick actions panel

## API Integration

### DashboardMetricsService

```typescript
// Get executive KPIs
const kpis = await dashboardMetricsService.getKPIs(filters);

// Get case status breakdown
const cases = await dashboardMetricsService.getCaseStatusBreakdown();

// Get billing overview
const billing = await dashboardMetricsService.getBillingOverview();

// Get recent activity
const activity = await dashboardMetricsService.getRecentActivity(20);

// Get upcoming deadlines
const deadlines = await dashboardMetricsService.getUpcomingDeadlines({ days: 30 });

// Get role-specific data
const roleData = await dashboardMetricsService.getRoleDashboard('attorney');
```

## Usage

### Basic Implementation

```tsx
import { RoleDashboardRouter } from '@/features/dashboard/components/RoleDashboardRouter';
import { useAppController } from '@/hooks/core';

function DashboardPage() {
  const { currentUser } = useAppController();

  return (
    <RoleDashboardRouter
      currentUser={currentUser}
      onSelectCase={(caseId) => navigate(`/cases/${caseId}`)}
    />
  );
}
```

### Using Individual Widgets

```tsx
import { KPICard, ActivityFeed, DeadlinesList } from '@/components/dashboard/widgets';

function CustomDashboard() {
  return (
    <div className="space-y-6">
      <KPICard
        label="Active Cases"
        value={142}
        previousValue={135}
        icon={Briefcase}
        format="number"
        color="blue"
      />

      <ActivityFeed
        activities={activities}
        maxItems={10}
        onActivityClick={(activity) => handleActivity(activity)}
      />

      <DeadlinesList
        deadlines={deadlines}
        maxItems={5}
        showCompleted={false}
      />
    </div>
  );
}
```

## Styling

All components use:
- **Tailwind CSS** for utility-first styling
- **Theme Context** for dark mode support
- **Responsive Design** (mobile, tablet, desktop breakpoints)
- **Animations** via CSS transitions and Framer Motion

## Performance

- **Code Splitting**: Lazy loading for charts and heavy components
- **Memoization**: React.memo for expensive renders
- **Optimized Queries**: React Query with caching
- **Virtualization**: For long lists (activity feed, deadlines)
- **Debounced Updates**: For real-time data

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast mode support

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Customizable dashboard layouts (drag-and-drop)
- [ ] Widget marketplace
- [ ] Advanced filtering and date range selection
- [ ] Real-time WebSocket updates
- [ ] Export to PDF/Excel
- [ ] Dashboard templates
- [ ] Multi-dashboard support
- [ ] Shared dashboards for teams

## Contributing

When adding new dashboard features:
1. Follow existing component patterns
2. Include TypeScript types
3. Add loading and error states
4. Implement responsive design
5. Write tests for new components
6. Update this README

## License

Copyright © 2025 LexiFlow. All rights reserved.
