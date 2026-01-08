/**
 * @module components/billing/BillingAnalytics
 * @category Billing
 * @description Comprehensive billing analytics dashboard with charts and metrics
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Users, Calendar, Download } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useChartTheme } from '@/components/organisms/ChartHelpers';
import { Currency } from '@/components/ui/atoms/Currency';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BillingAnalyticsProps {
  dateRange?: { start: Date; end: Date };
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const BillingAnalyticsComponent: React.FC<BillingAnalyticsProps> = ({
  dateRange,
  className
}) => {
  const { theme } = useTheme();
  const chartTheme = useChartTheme();

  // Mock data - in production, fetch from API
  const revenueData = [
    { month: 'Jul', billed: 125000, collected: 118000, outstanding: 7000 },
    { month: 'Aug', billed: 135000, collected: 128000, outstanding: 7000 },
    { month: 'Sep', billed: 142000, collected: 135000, outstanding: 7000 },
    { month: 'Oct', billed: 138000, collected: 132000, outstanding: 6000 },
    { month: 'Nov', billed: 156000, collected: 148000, outstanding: 8000 },
    { month: 'Dec', billed: 168000, collected: 160000, outstanding: 8000 }
  ];

  const realizationData = [
    { name: 'Collected', value: 89, color: chartTheme.colors.success },
    { name: 'Write-offs', value: 5, color: chartTheme.colors.danger },
    { name: 'Outstanding', value: 6, color: chartTheme.colors.warning }
  ];

  const attorneyProductivity = [
    { name: 'Sarah Chen', billableHours: 182, nonBillable: 18, utilizationRate: 91 },
    { name: 'Michael Ross', billableHours: 176, nonBillable: 24, utilizationRate: 88 },
    { name: 'Emily Davis', billableHours: 168, nonBillable: 32, utilizationRate: 84 },
    { name: 'James Wilson', billableHours: 164, nonBillable: 36, utilizationRate: 82 }
  ];

  const clientRevenue = [
    { name: 'Acme Corp', value: 125000 },
    { name: 'TechStart Inc', value: 98000 },
    { name: 'Global Industries', value: 87000 },
    { name: 'Smith Enterprises', value: 76000 },
    { name: 'Others', value: 114000 }
  ];

  const metrics = [
    {
      label: 'Total Revenue (YTD)',
      value: 864000,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      label: 'Avg. Collection Time',
      value: '32 days',
      change: '-5 days',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Realization Rate',
      value: '89%',
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Active Clients',
      value: '47',
      change: '+8',
      trend: 'up',
      icon: Users,
      color: 'text-amber-600'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={cn("h-6 w-6", theme.primary.text)} />
            <div>
              <h2 className={cn("text-xl font-bold", theme.text.primary)}>Billing Analytics</h2>
              <p className={cn("text-sm", theme.text.secondary)}>
                Performance insights and financial metrics
              </p>
            </div>
          </div>
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border",
              "hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={cn(
                "rounded-lg shadow-sm border p-4",
                theme.surface.default,
                theme.border.default
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-sm font-medium", theme.text.secondary)}>
                  {metric.label}
                </span>
                <Icon className={cn("h-5 w-5", metric.color)} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", theme.text.primary)}>
                  {typeof metric.value === 'number' ? (
                    <Currency value={metric.value} />
                  ) : (
                    metric.value
                  )}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  metric.trend === 'up' ? "text-emerald-600" : "text-red-600"
                )}>
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <h3 className={cn("font-bold mb-4", theme.text.primary)}>Revenue Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.text }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.text }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                contentStyle={chartTheme.tooltipStyle}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Bar dataKey="billed" fill={chartTheme.colors.primary} name="Billed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" fill={chartTheme.colors.success} name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outstanding" fill={chartTheme.colors.warning} name="Outstanding" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Realization Rate */}
        <div className={cn(
          "rounded-lg shadow-sm border p-4",
          theme.surface.default,
          theme.border.default
        )}>
          <h3 className={cn("font-bold mb-4", theme.text.primary)}>Realization Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={realizationData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={(entry) => `${entry.value}%`}
                >
                  {realizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTheme.tooltipStyle}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attorney Productivity */}
        <div className={cn(
          "rounded-lg shadow-sm border p-4",
          theme.surface.default,
          theme.border.default
        )}>
          <h3 className={cn("font-bold mb-4", theme.text.primary)}>Attorney Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attorneyProductivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTheme.text }}
                  width={100}
                />
                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                <Legend />
                <Bar dataKey="billableHours" fill={chartTheme.colors.primary} name="Billable Hours" radius={[0, 4, 4, 0]} />
                <Bar dataKey="nonBillable" fill={chartTheme.colors.secondary} name="Non-billable" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Client Revenue Distribution */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <h3 className={cn("font-bold mb-4", theme.text.primary)}>Top Clients by Revenue</h3>
        <div className="space-y-3">
          {clientRevenue.map((client, index) => {
            const total = clientRevenue.reduce((sum, c) => sum + c.value, 0);
            const percentage = (client.value / total) * 100;

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm font-medium", theme.text.primary)}>
                    {client.name}
                  </span>
                  <span className={cn("text-sm font-medium", theme.text.primary)}>
                    <Currency value={client.value} />
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={cn("text-xs", theme.text.secondary)}>
                  {percentage.toFixed(1)}% of total revenue
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const BillingAnalytics = memo(BillingAnalyticsComponent);
BillingAnalytics.displayName = 'BillingAnalytics';
