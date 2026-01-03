/**
 * @module components/enterprise/AnalyticsWidgets
 * @category Enterprise Analytics
 * @description Advanced analytics widgets with interactive charts for enterprise insights
 *
 * Includes charts for:
 * - Case trends (opened, closed, win rate over time)
 * - Billing trends (revenue, collections, AR aging)
 * - Attorney utilization (billable vs non-billable hours)
 * - Client acquisition (new clients, retention, lifetime value)
 */

import { ChartCard } from '@/components/dashboard/widgets/ChartCard';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import {
  BarChart3,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AnalyticsWidgetsProps {
  /** Date range for analytics */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Widget selection */
  selectedWidgets?: string[];
  /** Additional CSS classes */
  className?: string;
}

interface CaseTrendData {
  month: string;
  opened: number;
  closed: number;
  won: number;
  lost: number;
  settled: number;
  winRate: number;
}

interface BillingTrendData {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
  writeOffs: number;
  realizationRate: number;
}

interface AttorneyUtilizationData {
  name: string;
  billable: number;
  nonBillable: number;
  admin: number;
  utilizationRate: number;
}

interface ClientAcquisitionData {
  month: string;
  newClients: number;
  lostClients: number;
  totalActive: number;
  retentionRate: number;
  avgLifetimeValue: number;
}

interface ARAgingData {
  range: string;
  amount: number;
  count: number;
  percentage: number;
}

interface PracticeAreaPerformanceData {
  area: string;
  revenue: number;
  cases: number;
  winRate: number;
  avgCaseValue: number;
  utilizationRate: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateCaseTrendData = (): CaseTrendData[] => [
  { month: 'Jan', opened: 42, closed: 38, won: 32, lost: 4, settled: 2, winRate: 84.2 },
  { month: 'Feb', opened: 38, closed: 41, won: 34, lost: 5, settled: 2, winRate: 82.9 },
  { month: 'Mar', opened: 51, closed: 45, won: 39, lost: 3, settled: 3, winRate: 86.7 },
  { month: 'Apr', opened: 45, closed: 48, won: 41, lost: 5, settled: 2, winRate: 85.4 },
  { month: 'May', opened: 49, closed: 44, won: 37, lost: 4, settled: 3, winRate: 84.1 },
  { month: 'Jun', opened: 53, closed: 50, won: 44, lost: 3, settled: 3, winRate: 88.0 },
  { month: 'Jul', opened: 47, closed: 46, won: 41, lost: 3, settled: 2, winRate: 89.1 },
  { month: 'Aug', opened: 52, closed: 49, won: 43, lost: 4, settled: 2, winRate: 87.8 },
  { month: 'Sep', opened: 48, closed: 51, won: 45, lost: 3, settled: 3, winRate: 88.2 },
  { month: 'Oct', opened: 55, closed: 47, won: 42, lost: 3, settled: 2, winRate: 89.4 },
  { month: 'Nov', opened: 50, closed: 52, won: 46, lost: 4, settled: 2, winRate: 88.5 },
  { month: 'Dec', opened: 47, closed: 49, won: 43, lost: 3, settled: 3, winRate: 87.8 },
];

const generateBillingTrendData = (): BillingTrendData[] => [
  { month: 'Jan', billed: 245000, collected: 220000, outstanding: 25000, writeOffs: 3200, realizationRate: 91.8 },
  { month: 'Feb', billed: 268000, collected: 245000, outstanding: 23000, writeOffs: 2800, realizationRate: 92.5 },
  { month: 'Mar', billed: 312000, collected: 280000, outstanding: 32000, writeOffs: 4100, realizationRate: 91.3 },
  { month: 'Apr', billed: 289000, collected: 265000, outstanding: 24000, writeOffs: 3500, realizationRate: 92.1 },
  { month: 'May', billed: 324000, collected: 298000, outstanding: 26000, writeOffs: 3800, realizationRate: 92.9 },
  { month: 'Jun', billed: 356000, collected: 325000, outstanding: 31000, writeOffs: 4200, realizationRate: 92.2 },
  { month: 'Jul', billed: 342000, collected: 315000, outstanding: 27000, writeOffs: 3600, realizationRate: 93.1 },
  { month: 'Aug', billed: 378000, collected: 345000, outstanding: 33000, writeOffs: 4500, realizationRate: 92.4 },
  { month: 'Sep', billed: 395000, collected: 362000, outstanding: 33000, writeOffs: 4800, realizationRate: 92.7 },
  { month: 'Oct', billed: 412000, collected: 380000, outstanding: 32000, writeOffs: 5100, realizationRate: 93.0 },
  { month: 'Nov', billed: 388000, collected: 358000, outstanding: 30000, writeOffs: 4400, realizationRate: 92.8 },
  { month: 'Dec', billed: 425000, collected: 395000, outstanding: 30000, writeOffs: 5200, realizationRate: 93.2 },
];

const generateAttorneyUtilizationData = (): AttorneyUtilizationData[] => [
  { name: 'Sarah Chen', billable: 172, nonBillable: 18, admin: 11, utilizationRate: 92.5 },
  { name: 'Michael Torres', billable: 165, nonBillable: 20, admin: 12, utilizationRate: 92.7 },
  { name: 'Jessica Park', billable: 154, nonBillable: 22, admin: 16, utilizationRate: 89.5 },
  { name: 'David Kim', billable: 148, nonBillable: 21, admin: 15, utilizationRate: 89.7 },
  { name: 'Emily Davis', billable: 142, nonBillable: 19, admin: 15, utilizationRate: 89.9 },
  { name: 'James Wilson', billable: 138, nonBillable: 24, admin: 14, utilizationRate: 87.3 },
  { name: 'Maria Garcia', billable: 135, nonBillable: 23, admin: 18, utilizationRate: 86.8 },
  { name: 'Robert Lee', billable: 131, nonBillable: 25, admin: 20, utilizationRate: 85.2 },
];

const generateClientAcquisitionData = (): ClientAcquisitionData[] => [
  { month: 'Jan', newClients: 12, lostClients: 3, totalActive: 185, retentionRate: 97.6, avgLifetimeValue: 245000 },
  { month: 'Feb', newClients: 10, lostClients: 2, totalActive: 193, retentionRate: 98.1, avgLifetimeValue: 248000 },
  { month: 'Mar', newClients: 15, lostClients: 4, totalActive: 204, retentionRate: 97.3, avgLifetimeValue: 252000 },
  { month: 'Apr', newClients: 13, lostClients: 3, totalActive: 214, retentionRate: 97.7, avgLifetimeValue: 255000 },
  { month: 'May', newClients: 18, lostClients: 2, totalActive: 230, retentionRate: 98.3, avgLifetimeValue: 260000 },
  { month: 'Jun', newClients: 16, lostClients: 5, totalActive: 241, retentionRate: 96.8, avgLifetimeValue: 258000 },
  { month: 'Jul', newClients: 14, lostClients: 3, totalActive: 252, retentionRate: 97.5, avgLifetimeValue: 262000 },
  { month: 'Aug', newClients: 19, lostClients: 4, totalActive: 267, retentionRate: 97.2, avgLifetimeValue: 265000 },
  { month: 'Sep', newClients: 17, lostClients: 2, totalActive: 282, retentionRate: 98.1, avgLifetimeValue: 268000 },
  { month: 'Oct', newClients: 21, lostClients: 3, totalActive: 300, retentionRate: 97.9, avgLifetimeValue: 272000 },
  { month: 'Nov', newClients: 15, lostClients: 4, totalActive: 311, retentionRate: 97.4, avgLifetimeValue: 270000 },
  { month: 'Dec', newClients: 20, lostClients: 2, totalActive: 329, retentionRate: 98.2, avgLifetimeValue: 275000 },
];

const generateARAgingData = (): ARAgingData[] => [
  { range: '0-30 days', amount: 185000, count: 42, percentage: 57.2 },
  { range: '31-60 days', amount: 78000, count: 18, percentage: 24.1 },
  { range: '61-90 days', amount: 38500, count: 9, percentage: 11.9 },
  { range: '90+ days', amount: 22000, count: 5, percentage: 6.8 },
];

const generatePracticeAreaData = (): PracticeAreaPerformanceData[] => [
  { area: 'Corporate Law', revenue: 850000, cases: 45, winRate: 92, avgCaseValue: 18889, utilizationRate: 88 },
  { area: 'Litigation', revenue: 720000, cases: 38, winRate: 87, avgCaseValue: 18947, utilizationRate: 85 },
  { area: 'IP & Patents', revenue: 620000, cases: 28, winRate: 90, avgCaseValue: 22143, utilizationRate: 82 },
  { area: 'Employment', revenue: 480000, cases: 52, winRate: 85, avgCaseValue: 9231, utilizationRate: 79 },
  { area: 'Real Estate', revenue: 420000, cases: 35, winRate: 88, avgCaseValue: 12000, utilizationRate: 76 },
  { area: 'Tax Law', revenue: 380000, cases: 22, winRate: 91, avgCaseValue: 17273, utilizationRate: 74 },
];

// ============================================================================
// CUSTOM CHART COLORS
// ============================================================================

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  pink: '#EC4899',
  indigo: '#6366F1',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// ============================================================================
// COMPONENT
// ============================================================================

export const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({
  isLoading = false,
  onRefresh,
  selectedWidgets,
  className,
}) => {
  useTheme();

  // Generate mock data
  const caseTrends = useMemo(() => generateCaseTrendData(), []);
  const billingTrends = useMemo(() => generateBillingTrendData(), []);
  const attorneyUtilization = useMemo(() => generateAttorneyUtilizationData(), []);
  const clientAcquisition = useMemo(() => generateClientAcquisitionData(), []);
  const arAging = useMemo(() => generateARAgingData(), []);
  const practiceAreaData = useMemo(() => generatePracticeAreaData(), []);

  const shouldShowWidget = (widgetId: string): boolean => {
    if (!selectedWidgets || selectedWidgets.length === 0) return true;
    return selectedWidgets.includes(widgetId);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Case Trends */}
      {shouldShowWidget('case-trends') && (
        <ChartCard
          title="Case Trends"
          subtitle="Cases opened, closed, and outcomes over time"
          icon={Briefcase}
          isLoading={isLoading}
          onRefresh={onRefresh}
          height={350}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={caseTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[75, 95]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="opened" fill={COLORS.primary} name="Opened" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="left" dataKey="closed" fill={COLORS.success} name="Closed" radius={[8, 8, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="winRate"
                stroke={COLORS.purple}
                strokeWidth={3}
                name="Win Rate %"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Billing Trends */}
      {shouldShowWidget('billing-trends') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Billing & Collections"
            subtitle="Monthly billed vs collected revenue"
            icon={DollarSign}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={billingTrends}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => value ? `$${(value / 1000).toFixed(0)}K` : '$0'}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="billed"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorBilled)"
                  name="Billed"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                  name="Collected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="AR Aging"
            subtitle="Accounts receivable aging breakdown"
            icon={Calendar}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={arAging as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { range, percentage } = props.payload || props;
                    return range && percentage ? `${range}: ${percentage.toFixed(1)}%` : '';
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {arAging.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) => value ? `$${(value / 1000).toFixed(0)}K` : '$0'}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Attorney Utilization */}
      {shouldShowWidget('attorney-utilization') && (
        <ChartCard
          title="Attorney Utilization"
          subtitle="Billable vs non-billable hours breakdown"
          icon={Users}
          isLoading={isLoading}
          onRefresh={onRefresh}
          height={350}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attorneyUtilization} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis type="category" dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis type="number" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="billable" stackId="a" fill={COLORS.success} name="Billable Hours" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonBillable" stackId="a" fill={COLORS.warning} name="Non-Billable" radius={[0, 0, 0, 0]} />
              <Bar dataKey="admin" stackId="a" fill={COLORS.danger} name="Admin" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Client Acquisition */}
      {shouldShowWidget('client-acquisition') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Client Acquisition"
            subtitle="New vs lost clients over time"
            icon={UserPlus}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={clientAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="newClients" fill={COLORS.success} name="New Clients" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="lostClients" fill={COLORS.danger} name="Lost Clients" radius={[8, 8, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalActive"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  name="Total Active"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Client Retention & LTV"
            subtitle="Retention rate and lifetime value trends"
            icon={TrendingUp}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={clientAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" domain={[95, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={((value: number | undefined, name: string) => {
                    if (!value) return '0';
                    if (name === 'Avg LTV') return `$${(value / 1000).toFixed(0)}K`;
                    return `${value.toFixed(1)}%`;
                  }) as any}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="retentionRate"
                  stroke={COLORS.purple}
                  strokeWidth={3}
                  name="Retention %"
                  dot={{ r: 4 }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgLifetimeValue"
                  fill={COLORS.teal}
                  name="Avg LTV"
                  radius={[8, 8, 0, 0]}
                  opacity={0.6}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Practice Area Performance */}
      {shouldShowWidget('practice-areas') && (
        <ChartCard
          title="Practice Area Performance"
          subtitle="Multi-dimensional performance analysis"
          icon={BarChart3}
          isLoading={isLoading}
          onRefresh={onRefresh}
          height={400}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={practiceAreaData}>
              <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <PolarAngleAxis dataKey="area" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar
                name="Win Rate"
                dataKey="winRate"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.3}
              />
              <Radar
                name="Utilization"
                dataKey="utilizationRate"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
};

AnalyticsWidgets.displayName = 'AnalyticsWidgets';
