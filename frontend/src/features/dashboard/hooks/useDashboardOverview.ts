import { useState } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { dashboardMetricsService } from '@/api/intelligence/legacy-dashboard-metrics.service';

export type DateRange = 'week' | 'month' | 'quarter' | 'year';

export function useDashboardOverview() {
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Fetch dashboard data
  const { data: kpis, isLoading: kpisLoading } = useQuery(
    ['dashboard', 'kpis', dateRange],
    () => dashboardMetricsService.getKPIs()
  );

  const { data: caseBreakdown, isLoading: casesLoading } = useQuery(
    ['dashboard', 'cases', dateRange],
    () => dashboardMetricsService.getCaseStatusBreakdown()
  );

  const { data: billingData, isLoading: billingLoading } = useQuery(
    ['dashboard', 'billing', dateRange],
    () => dashboardMetricsService.getBillingOverview()
  );

  const { data: activities, isLoading: activitiesLoading } = useQuery(
    ['dashboard', 'activity'],
    () => dashboardMetricsService.getRecentActivity(15)
  );

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery(
    ['dashboard', 'deadlines'],
    () => dashboardMetricsService.getUpcomingDeadlines({ days: 30 })
  );

  const isLoading = kpisLoading || casesLoading || billingLoading || activitiesLoading || deadlinesLoading;

  return {
    dateRange,
    setDateRange,
    kpis,
    caseBreakdown,
    billingData,
    activities,
    deadlines,
    isLoading,
    loadingState: {
        kpis: kpisLoading,
        cases: casesLoading,
        billing: billingLoading,
        activities: activitiesLoading,
        deadlines: deadlinesLoading
    }
  };
}
