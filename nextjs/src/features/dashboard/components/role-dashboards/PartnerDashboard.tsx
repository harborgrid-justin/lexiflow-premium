/**
 * @module features/dashboard/role-dashboards/PartnerDashboard
 * @category Dashboard
 * @description Partner-specific dashboard focused on revenue, client acquisition, and case outcomes
 */

import React from 'react';
import { DollarSign, TrendingUp, Users, Award, Target, Briefcase } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { dashboardMetricsService } from '@/services/api/dashboard-metrics.service';
import { KPICard, ChartCard, StatWidget } from '@/components/dashboard/widgets';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const PartnerDashboard: React.FC = () => {
  const { theme } = useTheme();

  const { isLoading } = useQuery(
    ['dashboard', 'partner'],
    () => dashboardMetricsService.getRoleDashboard('partner')
  );

  const { } = useQuery(
    ['dashboard', 'partner-billing'],
    () => dashboardMetricsService.getBillingOverview()
  );

  if (isLoading) {
    return <LazyLoader message="Loading partner dashboard..." />;
  }

  const mockRevenueData = [
    { month: 'Jan', revenue: 450000, target: 500000 },
    { month: 'Feb', revenue: 520000, target: 500000 },
    { month: 'Mar', revenue: 485000, target: 500000 },
    { month: 'Apr', revenue: 550000, target: 500000 },
    { month: 'May', revenue: 610000, target: 550000 },
    { month: 'Jun', revenue: 580000, target: 550000 },
  ];

  const mockCaseOutcomes = [
    { outcome: 'Won', count: 24 },
    { outcome: 'Settled', count: 18 },
    { outcome: 'Ongoing', count: 32 },
    { outcome: 'Lost', count: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Partner KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Monthly Revenue"
          value={580000}
          previousValue={550000}
          target={550000}
          icon={DollarSign}
          format="currency"
          color="green"
        />
        <KPICard
          label="New Clients"
          value={8}
          previousValue={6}
          icon={Users}
          format="number"
          color="blue"
        />
        <KPICard
          label="Win Rate"
          value={88.9}
          previousValue={85.2}
          icon={Award}
          format="percentage"
          color="purple"
        />
        <KPICard
          label="Client Retention"
          value={94.5}
          previousValue={92.1}
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
          <LineChart data={mockRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
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
            <BarChart data={mockCaseOutcomes}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="outcome" stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
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
              value="$45,200"
              change="+8.5% vs last month"
              changePositive
              variant="success"
              icon={DollarSign}
            />
            <StatWidget
              label="Client Satisfaction Score"
              value="4.8/5.0"
              change="+0.2 improvement"
              changePositive
              variant="success"
              icon={Award}
            />
            <StatWidget
              label="Active Client Matters"
              value={142}
              change="+12 this month"
              changePositive
              variant="info"
              icon={Briefcase}
            />
            <StatWidget
              label="Referral Rate"
              value="32%"
              change="+5% increase"
              changePositive
              variant="success"
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
