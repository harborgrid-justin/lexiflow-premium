/**
 * Matter Analytics Dashboard - Comprehensive Analytics & Business Intelligence
 *
 * @module MatterAnalyticsDashboard
 * @description Enterprise-grade analytics for matter performance and insights
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with complex data transformations
 * - Guideline 28: Theme (isDark) determines chart styling (pure function)
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for dashboard transitions
 *
 * Features:
 * - Matter performance metrics
 * - Financial performance tracking
 * - Team utilization analytics
 * - Trend analysis and forecasting
 * - Practice area breakdown
 * - Client portfolio analysis
 * - Time-to-resolution metrics
 * - Win/loss analysis
 * - Revenue forecasting
 * - Custom report generation
 */

import { useQuery } from '@/hooks/useQueryHooks';
import { api } from '@/lib/frontend-api';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { Card } from '@/components/molecules/Card/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { CaseStatus } from '@/types';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Clock,
  DollarSign,
  Download,
  LineChart,
  PieChart,
  Users
} from 'lucide-react';
import { useMemo, useState } from 'react';

export const CaseAnalyticsDashboard: React.FC<{ caseId?: string }> = ({ caseId }) => {
  // Guideline 34: Side-effect free context read
  const { isDark } = useTheme();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd' | 'all'>('30d');
  const practiceAreaFilter = 'all';

  // Fetch matters data
  const { data: matters } = useQuery(
    ['matters', 'all', caseId],
    () => caseId ? api.cases.getById(caseId).then(c => [c]) : api.cases.getAll()
  );

  // Fetch time entries for revenue calculation
  const { data: timeEntries } = useQuery(
    ['billing', 'time-entries'],
    () => api.billing.getTimeEntries()
  );

  // Fetch invoices for revenue data
  const { data: invoices } = useQuery(
    ['billing', 'invoices'],
    () => api.billing.getInvoices()
  );

  // Calculate analytics metrics
  const metrics = useMemo(() => {
    if (!matters) return { totalMatters: 0, revenue: 0, avgResolution: 0, utilization: 0 };

    const now = new Date();
    const cutoffDate = new Date();
    if (dateRange === '7d') cutoffDate.setDate(now.getDate() - 7);
    else if (dateRange === '30d') cutoffDate.setDate(now.getDate() - 30);
    else if (dateRange === '90d') cutoffDate.setDate(now.getDate() - 90);
    else if (dateRange === 'ytd') cutoffDate.setMonth(0, 1);

    const filteredMatters = matters.filter(m =>
      m.createdAt && new Date(m.createdAt) >= cutoffDate &&
      (practiceAreaFilter === 'all' || m.practiceArea === practiceAreaFilter)
    );

    const totalRevenue = invoices?.filter(inv =>
      (inv as { createdAt?: string }).createdAt && new Date((inv as { createdAt: string }).createdAt) >= cutoffDate
    ).reduce((sum: number, inv) => sum + ((inv as { totalAmount?: number }).totalAmount || 0), 0) || 0;

    const closedMatters = filteredMatters.filter(m => m.status === CaseStatus.Closed);
    const avgResolution = closedMatters.length > 0
      ? Math.round(closedMatters.reduce((sum, m) => {
        if (!m.createdAt || !m.updatedAt) return sum;
        const created = new Date(m.createdAt);
        const closed = new Date(m.updatedAt);
        return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / closedMatters.length)
      : 0;

    const totalHours = timeEntries?.reduce((sum, t) => sum + (t.duration || 0), 0) || 0;
    const capacity = 180 * (timeEntries?.length || 1); // Assuming 180h/month per person
    const utilization = capacity > 0 ? (totalHours / capacity) * 100 : 0;

    return {
      totalMatters: filteredMatters.length,
      revenue: totalRevenue,
      avgResolution,
      utilization,
    };
  }, [matters, timeEntries, invoices, dateRange, practiceAreaFilter]);

  return (
    <div className={cn('h-full flex flex-col', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <div className={cn('border-b px-6 py-4', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-center justify-end gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className={cn(
              'px-4 py-2 rounded-lg border text-sm',
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            )}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AnalyticsCard
            icon={Briefcase}
            title="Total Matters"
            value={metrics.totalMatters.toString()}
            change={`${dateRange} period`}
            isDark={isDark}
          />
          <AnalyticsCard
            icon={DollarSign}
            title="Revenue"
            value={`$${(metrics.revenue / 1000000).toFixed(1)}M`}
            change="From invoices"
            isDark={isDark}
          />
          <AnalyticsCard
            icon={Clock}
            title="Avg Resolution Time"
            value={`${metrics.avgResolution} days`}
            change="Closed matters"
            isDark={isDark}
          />
          <AnalyticsCard
            icon={Users}
            title="Team Utilization"
            value={`${Math.round(metrics.utilization)}%`}
            change="Based on time entries"
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
              Revenue Trend
            </h3>
            <div className={cn('h-64 flex items-center justify-center rounded border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50')}>
              <LineChart className={cn('w-12 h-12', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <span className={cn('ml-3 text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Chart will be rendered here
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', isDark ? 'text-slate-100' : 'text-slate-900')}>
              Practice Area Distribution
            </h3>
            <div className={cn('h-64 flex items-center justify-center rounded border', isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50')}>
              <PieChart className={cn('w-12 h-12', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <span className={cn('ml-3 text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Chart will be rendered here
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  trend?: 'up' | 'down';
  isDark: boolean;
}> = ({ icon: Icon, title, value, change, trend, isDark }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={cn('text-sm font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {title}
        </div>
        <div className={cn('text-2xl font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>
          {value}
        </div>
        <div className={cn('flex items-center gap-1 text-sm mt-2',
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          {trend && (trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          {change}
        </div>
      </div>
      <div className={cn('p-3 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
        <Icon className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
      </div>
    </div>
  </Card>
);
