/**
 * @module components/enterprise/EnterpriseDashboard
 * @category Enterprise Components
 * @description Comprehensive enterprise executive dashboard with KPIs, analytics, and real-time insights
 *
 * Features:
 * - Executive KPI cards (matters opened, revenue, billable hours, collection rate)
 * - Real-time activity feed
 * - Case pipeline visualization
 * - Team performance metrics
 * - Financial summary widgets
 * - Custom widget system
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  Target,
  Calendar,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity as ActivityIcon,
  FileText,
  CheckCircle2,
  XCircle,
  Minus,
  Filter,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { KPICard } from '@/components/dashboard/widgets/KPICard';
import { ActivityFeed } from '@/components/dashboard/widgets/ActivityFeed';
import { ChartCard } from '@/components/dashboard/widgets/ChartCard';
import type { Activity } from '@/types/dashboard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EnterpriseDashboardProps {
  /** User ID for personalized data */
  userId?: string;
  /** Date range for analytics */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Widget configuration handler */
  onConfigureWidgets?: () => void;
  /** Export handler */
  onExport?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface KPIMetric {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: typeof DollarSign;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  target?: number;
}

interface CasePipelineStage {
  stage: string;
  count: number;
  value: number;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  billableHours: number;
  totalHours: number;
  utilizationRate: number;
  activeCases: number;
  revenue: number;
}

interface FinancialSummary {
  totalRevenue: number;
  collected: number;
  outstanding: number;
  writeOffs: number;
  realizationRate: number;
  collectionRate: number;
}

// ============================================================================
// MOCK DATA (Replace with real API calls)
// ============================================================================

const generateMockKPIs = (): KPIMetric[] => [
  {
    id: 'matters-opened',
    label: 'Matters Opened',
    value: 47,
    previousValue: 38,
    icon: Briefcase,
    format: 'number',
    color: 'blue',
    target: 50,
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: 2847500,
    previousValue: 2456000,
    icon: DollarSign,
    format: 'currency',
    color: 'green',
  },
  {
    id: 'billable-hours',
    label: 'Billable Hours',
    value: 3842,
    previousValue: 3654,
    icon: Clock,
    format: 'number',
    color: 'purple',
  },
  {
    id: 'collection-rate',
    label: 'Collection Rate',
    value: 88.7,
    previousValue: 86.2,
    icon: Target,
    format: 'percentage',
    color: 'orange',
    target: 90,
  },
];

const generateMockActivities = (): Activity[] => [
  {
    id: '1',
    type: 'case_created',
    title: 'New Case Opened',
    description: 'TechCorp Inc. v. Competitor - Patent Infringement',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: { id: '1', name: 'Sarah Chen', avatar: '' },
    priority: 'high',
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Payment Received',
    description: '$45,000 received from Global Industries',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    user: { id: '2', name: 'Michael Torres', avatar: '' },
    priority: 'medium',
  },
  {
    id: '3',
    type: 'task_completed',
    title: 'Discovery Completed',
    description: 'All document requests submitted in Johnson case',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    user: { id: '3', name: 'Jessica Park', avatar: '' },
    priority: 'low',
  },
  {
    id: '4',
    type: 'deadline_approaching',
    title: 'Upcoming Deadline',
    description: 'Motion to dismiss due in 48 hours - Anderson v. State',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    user: { id: '4', name: 'David Kim', avatar: '' },
    priority: 'critical',
  },
  {
    id: '5',
    type: 'case_closed',
    title: 'Case Closed',
    description: 'Martinez dispute settled favorably',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    user: { id: '5', name: 'Emily Davis', avatar: '' },
    priority: 'medium',
  },
];

const generateCasePipelineData = (): CasePipelineStage[] => [
  { stage: 'Lead', count: 23, value: 580000, color: '#94A3B8' },
  { stage: 'Consultation', count: 18, value: 720000, color: '#3B82F6' },
  { stage: 'Retained', count: 31, value: 1240000, color: '#8B5CF6' },
  { stage: 'Active', count: 127, value: 5080000, color: '#10B981' },
  { stage: 'Settlement', count: 12, value: 540000, color: '#F59E0B' },
  { stage: 'Trial', count: 8, value: 960000, color: '#EF4444' },
];

const generateTeamPerformanceData = (): TeamMember[] => [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Partner',
    billableHours: 186,
    totalHours: 201,
    utilizationRate: 92.5,
    activeCases: 15,
    revenue: 558000,
  },
  {
    id: '2',
    name: 'Michael Torres',
    role: 'Partner',
    billableHours: 178,
    totalHours: 192,
    utilizationRate: 92.7,
    activeCases: 12,
    revenue: 489000,
  },
  {
    id: '3',
    name: 'Jessica Park',
    role: 'Associate',
    billableHours: 172,
    totalHours: 192,
    utilizationRate: 89.5,
    activeCases: 18,
    revenue: 344000,
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Associate',
    billableHours: 165,
    totalHours: 184,
    utilizationRate: 89.7,
    activeCases: 14,
    revenue: 330000,
  },
  {
    id: '5',
    name: 'Emily Davis',
    role: 'Junior Associate',
    billableHours: 158,
    totalHours: 176,
    utilizationRate: 89.9,
    activeCases: 16,
    revenue: 237000,
  },
];

const generateRevenueData = () => [
  { month: 'Jul', revenue: 245000, target: 250000, collected: 220000 },
  { month: 'Aug', revenue: 268000, target: 260000, collected: 245000 },
  { month: 'Sep', revenue: 312000, target: 280000, collected: 280000 },
  { month: 'Oct', revenue: 289000, target: 290000, collected: 265000 },
  { month: 'Nov', revenue: 324000, target: 300000, collected: 298000 },
  { month: 'Dec', revenue: 356000, target: 320000, collected: 325000 },
];

const generateFinancialSummary = (): FinancialSummary => ({
  totalRevenue: 2847500,
  collected: 2524000,
  outstanding: 323500,
  writeOffs: 45200,
  realizationRate: 92.3,
  collectionRate: 88.7,
});

// ============================================================================
// COMPONENT
// ============================================================================

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  userId,
  dateRange,
  isLoading = false,
  error = null,
  onRefresh,
  onConfigureWidgets,
  onExport,
  className,
}) => {
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Generate mock data (replace with real API calls)
  const kpiMetrics = useMemo(() => generateMockKPIs(), []);
  const activities = useMemo(() => generateMockActivities(), []);
  const casePipeline = useMemo(() => generateCasePipelineData(), []);
  const teamPerformance = useMemo(() => generateTeamPerformanceData(), []);
  const revenueData = useMemo(() => generateRevenueData(), []);
  const financialSummary = useMemo(() => generateFinancialSummary(), []);

  // Render error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
            Failed to Load Dashboard
          </h3>
          <p className={cn('text-sm mb-4', theme.text.secondary)}>{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-3xl font-bold', theme.text.primary)}>
            Executive Dashboard
          </h1>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Comprehensive business intelligence and performance insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['week', 'month', 'quarter', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                  selectedTimeframe === timeframe
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isLoading && 'animate-spin'
              )}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onConfigureWidgets && (
            <button
              onClick={onConfigureWidgets}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Configure widgets"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <KPICard
              label={metric.label}
              value={metric.value}
              previousValue={metric.previousValue}
              icon={metric.icon}
              format={metric.format}
              color={metric.color}
              isLoading={isLoading}
              target={metric.target}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Overview */}
          <ChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue, target, and collections"
            icon={DollarSign}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                  name="Collected"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Case Pipeline */}
          <ChartCard
            title="Case Pipeline"
            subtitle="Cases by stage with total value"
            icon={BarChart3}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casePipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="stage" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={((value: number, name: string) => {
                    if (name === 'value') {
                      return [`$${(value / 1000).toFixed(0)}K`, 'Total Value'];
                    }
                    return [value, 'Cases'];
                  }) as any}
                />
                <Legend />
                <Bar dataKey="count" name="Cases" radius={[8, 8, 0, 0]}>
                  {casePipeline.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Team Performance */}
          <ChartCard
            title="Team Performance"
            subtitle="Attorney utilization and billable hours"
            icon={Users}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="billableHours" fill="#3B82F6" name="Billable Hours" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalHours" fill="#E5E7EB" name="Total Hours" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right Column - Activity Feed & Widgets (1/3 width) */}
        <div className="space-y-6">
          {/* Financial Summary Widget */}
          <div className={cn('p-6 rounded-xl border', theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>Financial Summary</h3>
              <DollarSign className={cn('h-5 w-5', theme.text.secondary)} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Total Revenue</span>
                  <span className={cn('text-lg font-bold text-emerald-600 dark:text-emerald-400')}>
                    ${(financialSummary.totalRevenue / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Collected</span>
                  <span className={cn('text-sm font-medium', theme.text.primary)}>
                    ${(financialSummary.collected / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(financialSummary.collected / financialSummary.totalRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Outstanding AR</span>
                  <span className={cn('text-sm font-medium text-orange-600 dark:text-orange-400')}>
                    ${(financialSummary.outstanding / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', theme.text.secondary)}>Realization Rate</span>
                  <span className={cn('text-sm font-bold text-blue-600 dark:text-blue-400')}>
                    {financialSummary.realizationRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn('text-xs', theme.text.secondary)}>Collection Rate</span>
                  <span className={cn('text-sm font-bold text-purple-600 dark:text-purple-400')}>
                    {financialSummary.collectionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Activity Feed */}
          <div className={cn('p-6 rounded-xl border', theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>Recent Activity</h3>
              <ActivityIcon className={cn('h-5 w-5', theme.text.secondary)} />
            </div>
            <ActivityFeed
              activities={activities}
              isLoading={isLoading}
              maxItems={5}
              showAvatars={false}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className={cn('text-xs font-medium', theme.text.secondary)}>Win Rate</span>
              </div>
              <div className={cn('text-2xl font-bold text-emerald-600 dark:text-emerald-400')}>87.5%</div>
            </div>
            <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className={cn('text-xs font-medium', theme.text.secondary)}>Utilization</span>
              </div>
              <div className={cn('text-2xl font-bold text-blue-600 dark:text-blue-400')}>76.4%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EnterpriseDashboard.displayName = 'EnterpriseDashboard';
