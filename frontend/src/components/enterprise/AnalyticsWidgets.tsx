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

import {
  analyticsService,
  type ARAgingData,
  type AttorneyUtilizationData,
  type BillingTrendData,
  type CaseTrendData,
  type ClientAcquisitionData,
  type PracticeAreaPerformanceData,
} from '@/api/intelligence/enterprise-analytics.service';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { ChartCard } from '@/features/dashboard/widgets/ChartCard';
import { cn } from '@/shared/lib/cn';
import {
  BarChart3,
  Briefcase,
  Calendar,
  DollarSign,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  dateRange,
  isLoading = false,
  onRefresh,
  selectedWidgets,
  className,
}) => {
  useTheme();

  // State for API data
  const [caseTrends, setCaseTrends] = useState<CaseTrendData[]>([]);
  const [billingTrends, setBillingTrends] = useState<BillingTrendData[]>([]);
  const [attorneyUtilization, setAttorneyUtilization] = useState<AttorneyUtilizationData[]>([]);
  const [clientAcquisition, setClientAcquisition] = useState<ClientAcquisitionData[]>([]);
  const [arAging, setArAging] = useState<ARAgingData[]>([]);
  const [practiceAreaData, setPracticeAreaData] = useState<PracticeAreaPerformanceData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setError(null);

        const filters = dateRange
          ? {
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString(),
          }
          : undefined;

        const [
          caseTrendsData,
          billingTrendsData,
          attorneyUtilizationData,
          clientAcquisitionData,
          arAgingData,
          practiceAreaPerformanceData,
        ] = await Promise.all([
          analyticsService.getCaseTrends(filters),
          analyticsService.getBillingTrends(filters),
          analyticsService.getAttorneyUtilization(filters),
          analyticsService.getClientAcquisition(filters),
          analyticsService.getARAgingData(filters),
          analyticsService.getPracticeAreaPerformance(filters),
        ]);

        setCaseTrends(caseTrendsData);
        setBillingTrends(billingTrendsData);
        setAttorneyUtilization(attorneyUtilizationData);
        setClientAcquisition(clientAcquisitionData);
        setArAging(arAgingData);
        setPracticeAreaData(practiceAreaPerformanceData);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    // Trigger data refetch
    const event = new Event('refetch');
    window.dispatchEvent(event);
  };

  const shouldShowWidget = (widgetId: string): boolean => {
    if (!selectedWidgets || selectedWidgets.length === 0) return true;
    return selectedWidgets.includes(widgetId);
  };

  const isDataLoading = isLoading || dataLoading;

  // Empty state component
  const EmptyState: React.FC<{ message: string; onAdd?: () => void }> = ({ message, onAdd }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
      <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
      <p className="text-sm mb-3">{message}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Data
        </button>
      )}
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Case Trends */}
      {shouldShowWidget('case-trends') && (
        <ChartCard
          title="Case Trends"
          subtitle="Cases opened, closed, and outcomes over time"
          icon={Briefcase}
          isLoading={isDataLoading}
          onRefresh={handleRefresh}
          height={350}
        >
          {caseTrends.length === 0 ? (
            <EmptyState message="No case trend data available" />
          ) : (
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
          )}
        </ChartCard>
      )}

      {/* Billing Trends */}
      {shouldShowWidget('billing-trends') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Billing & Collections"
            subtitle="Monthly billed vs collected revenue"
            icon={DollarSign}
            isLoading={isDataLoading}
            onRefresh={handleRefresh}
            height={320}
          >
            {billingTrends.length === 0 ? (
              <EmptyState message="No billing data available" />
            ) : (
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
            )}
          </ChartCard>

          <ChartCard
            title="AR Aging"
            subtitle="Accounts receivable aging breakdown"
            icon={Calendar}
            isLoading={isDataLoading}
            onRefresh={handleRefresh}
            height={320}
          >
            {arAging.length === 0 ? (
              <EmptyState message="No AR aging data available" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={arAging}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: unknown) => {
                      const { range, percentage } = (props as { payload: { range: string; percentage: number } }).payload || props;
                      return range && percentage ? `${range}: ${percentage.toFixed(1)}%` : '';
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {arAging.map((_entry, index) => (
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
            )}
          </ChartCard>
        </div>
      )}

      {/* Attorney Utilization */}
      {shouldShowWidget('attorney-utilization') && (
        <ChartCard
          title="Attorney Utilization"
          subtitle="Billable vs non-billable hours breakdown"
          icon={Users}
          isLoading={isDataLoading}
          onRefresh={handleRefresh}
          height={350}
        >
          {attorneyUtilization.length === 0 ? (
            <EmptyState message="No attorney utilization data available" />
          ) : (
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
          )}
        </ChartCard>
      )}

      {/* Client Acquisition */}
      {shouldShowWidget('client-acquisition') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Client Acquisition"
            subtitle="New vs lost clients over time"
            icon={UserPlus}
            isLoading={isDataLoading}
            onRefresh={handleRefresh}
            height={320}
          >
            {clientAcquisition.length === 0 ? (
              <EmptyState message="No client acquisition data available" />
            ) : (
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
            )}
          </ChartCard>

          <ChartCard
            title="Client Retention & LTV"
            subtitle="Retention rate and lifetime value trends"
            icon={TrendingUp}
            isLoading={isDataLoading}
            onRefresh={handleRefresh}
            height={320}
          >
            {clientAcquisition.length === 0 ? (
              <EmptyState message="No client retention data available" />
            ) : (
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
                    formatter={(value: number | undefined, name?: string) => {
                      if (!value) return '0';
                      if (name === 'Avg LTV') return `$${(value / 1000).toFixed(0)}K`;
                      return `${value.toFixed(1)}%`;
                    }}
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
            )}
          </ChartCard>
        </div>
      )}

      {/* Practice Area Performance */}
      {shouldShowWidget('practice-areas') && (
        <div>
          <ChartCard
            title="Practice Area Performance"
            subtitle="Multi-dimensional performance analysis"
            icon={BarChart3}
            isLoading={isDataLoading}
            onRefresh={handleRefresh}
            height={400}
          >
            {practiceAreaData.length === 0 ? (
              <EmptyState message="No practice area data available" />
            ) : (
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
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};

AnalyticsWidgets.displayName = 'AnalyticsWidgets';
