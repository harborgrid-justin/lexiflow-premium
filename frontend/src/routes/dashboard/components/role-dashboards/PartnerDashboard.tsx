/**
 * @module features/dashboard/role-dashboards/PartnerDashboard
 * @category Dashboard
 * @description Partner-specific dashboard focused on revenue, client acquisition, and case outcomes
 */

import React from 'react';
import { type PartnerDashboardData, dashboardMetricsService } from '@/lib/frontend-api';
import { useTheme } from "@/hooks/useTheme";
import { ChartCard, KPICard, StatWidget } from '../../widgets';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/lib/cn';
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { Award, DollarSign, Target, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const PartnerDashboard: React.FC = () => {
  const { theme, mode } = useTheme();

  const { data, isLoading } = useQuery<PartnerDashboardData>(
    ['dashboard', 'partner'],
    () => dashboardMetricsService.getRoleDashboard('partner') as Promise<PartnerDashboardData>
  );

  useQuery(
    ['dashboard', 'partner-billing'],
    () => dashboardMetricsService.getBillingOverview()
  );

  if (isLoading) {
    return <LazyLoader message="Loading partner dashboard..." />;
  }

  // Fallback data
  const kpis = data?.kpis || {
    monthlyRevenue: { value: 0, previousValue: 0, target: 0 },
    newClients: { value: 0, previousValue: 0 },
    winRate: { value: 0, previousValue: 0 },
    clientRetention: { value: 0, previousValue: 0 },
  };

  const revenueTrends = data?.revenueTrends || [];
  const caseOutcomes = data?.caseOutcomes || [];
  const businessMetrics = data?.businessMetrics || {
    avgCaseValue: { value: 0, change: 0 },
    cac: { value: 0, change: 0 },
    nps: { value: 0, change: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Partner KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Monthly Revenue"
          value={kpis.monthlyRevenue.value}
          previousValue={kpis.monthlyRevenue.previousValue}
          target={kpis.monthlyRevenue.target}
          icon={DollarSign}
          format="currency"
          color="green"
        />
        <KPICard
          label="New Clients"
          value={kpis.newClients.value}
          previousValue={kpis.newClients.previousValue}
          icon={Users}
          format="number"
          color="blue"
        />
        <KPICard
          label="Win Rate"
          value={kpis.winRate.value}
          previousValue={kpis.winRate.previousValue}
          icon={Award}
          format="percentage"
          color="purple"
        />
        <KPICard
          label="Client Retention"
          value={kpis.clientRetention.value}
          previousValue={kpis.clientRetention.previousValue}
          icon={Target}
          format="percentage"
          color="green"
        />
      </div>

      {/* Revenue Trends */}
      <ChartCard
        title="Revenue vs Target"
        subtitle="6-month performance overview"
        icon={DollarSign}
        height={350}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Actual Revenue" />
            <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Case Outcomes & Client Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Case Outcomes"
          subtitle="Current year performance"
          icon={Award}
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={caseOutcomes}>
              <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="outcome" stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
            Business Metrics
          </h3>
          <div className="space-y-3">
            <StatWidget
              label="Average Case Value"
              value={`$${businessMetrics.avgCaseValue.value.toLocaleString()}`}
              change={`${businessMetrics.avgCaseValue.change > 0 ? '+' : ''}${businessMetrics.avgCaseValue.change}% vs last month`}
              changePositive={businessMetrics.avgCaseValue.change >= 0}
              variant="success"
              icon={DollarSign}
            />
            <StatWidget
              label="Client Acquisition Cost"
              value={`$${businessMetrics.cac.value.toLocaleString()}`}
              change={`${businessMetrics.cac.change > 0 ? '+' : ''}${businessMetrics.cac.change}% vs last month`}
              changePositive={businessMetrics.cac.change <= 0}
              variant="warning"
              icon={Users}
            />
            <StatWidget
              label="Net Promoter Score"
              value={businessMetrics.nps.value}
              change={`${businessMetrics.nps.change > 0 ? '+' : ''}${businessMetrics.nps.change} points`}
              changePositive={businessMetrics.nps.change >= 0}
              variant="info"
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
