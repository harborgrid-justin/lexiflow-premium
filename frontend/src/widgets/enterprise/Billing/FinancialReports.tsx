/**
 * FinancialReports Component
 * Advanced financial reporting with profitability analysis, realization rates, and revenue forecasting
 */

import { cn } from '@/lib/utils';
import {
  type MatterProfitability,
  type ProfitabilityMetrics,
  type RealizationMetrics,
  type RevenueForecasting,
  type TimekeeperPerformance,
  type WorkInProgressMetrics,
  billingApiService
} from '@/services/api/billing.service';
import { useTheme } from '@/theme/ThemeContext';
import {
  Activity,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  PieChart,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FinancialReportsProps {
  firmId?: string;
  dateRange?: { start: string; end: string };
  onExport?: (reportType: string, format: 'pdf' | 'excel' | 'csv') => void;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  dateRange,
  onExport,
}) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'profitability' | 'realization' | 'wip' | 'forecasting' | 'performance'>('profitability');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for API data
  const [profitability, setProfitability] = useState<ProfitabilityMetrics | null>(null);
  const [realization, setRealization] = useState<RealizationMetrics | null>(null);
  const [wipMetrics, setWipMetrics] = useState<WorkInProgressMetrics | null>(null);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecasting[]>([]);
  const [timekeeperPerformance, setTimekeeperPerformance] = useState<TimekeeperPerformance[]>([]);
  const [matterProfitability, setMatterProfitability] = useState<MatterProfitability[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const filters = dateRange
          ? { startDate: dateRange.start, endDate: dateRange.end }
          : undefined;

        const [
          profitabilityData,
          realizationData,
          wipData,
          forecastData,
          performanceData,
          matterData,
        ] = await Promise.all([
          billingApiService.getProfitabilityMetrics(filters),
          billingApiService.getRealizationMetrics(filters),
          billingApiService.getWIPMetrics(filters),
          billingApiService.getRevenueForecast(filters),
          billingApiService.getTimekeeperPerformance(filters),
          billingApiService.getMatterProfitability(filters),
        ]);

        setProfitability(profitabilityData);
        setRealization(realizationData);
        setWipMetrics(wipData);
        setRevenueForecast(forecastData);
        setTimekeeperPerformance(performanceData);
        setMatterProfitability(matterData);
      } catch (err) {
        console.error('Failed to fetch financial reports:', err);
        setError('Failed to load financial data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const getPerformanceColor = (value: number, threshold: number = 90) => {
    if (value >= threshold) return theme.status.success;
    if (value >= threshold - 10) return theme.status.warning;
    return theme.status.error;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading financial reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
            Financial Reports & Analytics
          </h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>
            Comprehensive financial analysis and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium shadow-sm",
              theme.border.default,
              theme.surface.default,
              theme.text.primary,
              `hover:${theme.surface.highlight}`
            )}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm",
              theme.border.default,
              theme.surface.default,
              theme.text.primary,
              `hover:${theme.surface.highlight}`
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => onExport?.(selectedTab, 'excel')}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm",
              "bg-blue-600 hover:bg-blue-700" // Interactive buttons often keep brand colors, or could move to theme.interactive.primary
            )}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <nav className="-mb-px flex space-x-8">
          {(['profitability', 'realization', 'wip', 'forecasting', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                selectedTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : cn("border-transparent hover:border-gray-300", theme.text.secondary)
              )}
            >
              {tab === 'wip' ? 'WIP' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'profitability' && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>
                    Gross Revenue
                  </p>
                  <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                    {profitability ? formatCurrency(profitability.grossRevenue) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className={cn("h-4 w-4", theme.status.success)} />
                    <span className={theme.status.success}>+12.3% YoY</span>
                  </div>
                </div>
                <div className={cn("rounded-full p-3 bg-blue-50 dark:bg-blue-900/20")}>
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>
                    Gross Margin
                  </p>
                  <p className={cn("mt-2 text-3xl font-semibold", theme.status.success)}>
                    {profitability ? formatPercent(profitability.grossMargin) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className={cn("h-4 w-4", theme.status.success)} />
                    <span className={theme.status.success}>+2.1%</span>
                  </div>
                </div>
                <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/20">
                  <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>
                    Net Profit
                  </p>
                  <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                    {profitability ? formatCurrency(profitability.netProfit) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className={cn("h-4 w-4", theme.status.success)} />
                    <span className={theme.status.success}>+8.7%</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-900/20">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm font-medium", theme.text.secondary)}>
                    Net Margin
                  </p>
                  <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                    {profitability ? formatPercent(profitability.netMargin) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingDown className={cn("h-4 w-4", theme.status.error)} />
                    <span className={theme.status.error}>-1.2%</span>
                  </div>
                </div>
                <div className="rounded-full bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Profitability Breakdown
            </h3>
            <div className="space-y-4">
              <div className={cn("flex items-center justify-between border-b pb-3", theme.border.default)}>
                <span className={cn("text-sm font-medium", theme.text.secondary)}>
                  Gross Revenue
                </span>
                <span className={cn("text-lg font-semibold", theme.text.primary)}>
                  {profitability ? formatCurrency(profitability.grossRevenue) : '-'}
                </span>
              </div>
              <div className={cn("flex items-center justify-between border-b pb-3", theme.border.default)}>
                <span className={cn("text-sm font-medium", theme.text.secondary)}>
                  Direct Costs
                </span>
                <span className={cn("text-lg font-semibold", theme.status.error)}>
                  -{profitability ? formatCurrency(profitability.grossRevenue - profitability.grossProfit) : '-'}
                </span>
              </div>
              <div className={cn("flex items-center justify-between border-b pb-3", theme.border.default)}>
                <span className={cn("text-sm font-medium", theme.text.primary)}>
                  Gross Profit
                </span>
                <span className={cn("text-lg font-semibold", theme.status.success)}>
                  {profitability ? formatCurrency(profitability.grossProfit) : '-'}
                </span>
              </div>
              <div className={cn("flex items-center justify-between border-b pb-3", theme.border.default)}>
                <span className={cn("text-sm font-medium", theme.text.secondary)}>
                  Operating Expenses
                </span>
                <span className={cn("text-lg font-semibold", theme.status.error)}>
                  -{profitability ? formatCurrency(profitability.operatingExpenses) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className={cn("text-base font-semibold", theme.text.primary)}>
                  Net Profit
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profitability ? formatCurrency(profitability.netProfit) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'realization' && (
        <div className="space-y-6">
          {/* Realization Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Billing Realization
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                {realization ? formatPercent(realization.billingRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {realization ? `${formatCurrency(realization.actualBillingRate)} / ${formatCurrency(realization.standardBillingRate)}` : '-'}
              </p>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Collection Realization
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                {realization ? formatPercent(realization.collectionRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {realization ? `${formatCurrency(realization.actualCollectionAmount)} / ${formatCurrency(realization.standardCollectionAmount)}` : '-'}
              </p>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Overall Realization
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", realization ? getPerformanceColor(realization.overallRealization, 85) : '')}>
                {realization ? formatPercent(realization.overallRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Combined realization rate
              </p>
            </div>
          </div>

          {/* Realization Analysis */}
          <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Realization Analysis
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", theme.text.secondary)}>
                    Billing Realization Rate
                  </span>
                  <span className={cn("text-sm font-semibold", theme.text.primary)}>
                    {realization ? formatPercent(realization.billingRealization) : '-'}
                  </span>
                </div>
                <div className={cn("relative h-4 rounded-full overflow-hidden", theme.surface.subtle)}>
                  <div
                    className="absolute h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${realization ? realization.billingRealization : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", theme.text.secondary)}>
                    Collection Realization Rate
                  </span>
                  <span className={cn("text-sm font-semibold", theme.text.primary)}>
                    {realization ? formatPercent(realization.collectionRealization) : '-'}
                  </span>
                </div>
                <div className={cn("relative h-4 rounded-full overflow-hidden", theme.surface.subtle)}>
                  <div
                    className="absolute h-full bg-green-600 dark:bg-green-500"
                    style={{ width: `${realization ? realization.collectionRealization : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", theme.text.secondary)}>
                    Overall Realization Rate
                  </span>
                  <span className={cn("text-sm font-semibold", theme.text.primary)}>
                    {realization ? formatPercent(realization.overallRealization) : '-'}
                  </span>
                </div>
                <div className={cn("relative h-4 rounded-full overflow-hidden", theme.surface.subtle)}>
                  <div
                    className="absolute h-full bg-purple-600 dark:bg-purple-500"
                    style={{ width: `${realization ? realization.overallRealization : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'wip' && (
        <div className="space-y-6">
          {/* WIP Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Total WIP
              </p>
              <p className={cn("mt-2 text-2xl font-semibold", theme.text.primary)}>
                {wipMetrics ? formatCurrency(wipMetrics.totalWIP) : '-'}
              </p>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Unbilled Time
              </p>
              <p className={cn("mt-2 text-2xl font-semibold", theme.status.warning)}>
                {wipMetrics ? formatCurrency(wipMetrics.unbilledTime) : '-'}
              </p>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Average Age
              </p>
              <p className={cn("mt-2 text-2xl font-semibold", theme.text.primary)}>
                {wipMetrics ? wipMetrics.averageAgeDays : '-'} days
              </p>
            </div>

            <div className={cn("rounded-lg border p-6 shadow-sm", theme.border.default, theme.surface.default)}>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Write-off Rate
              </p>
              <p className={cn("mt-2 text-2xl font-semibold", theme.status.error)}>
                {wipMetrics ? formatPercent(wipMetrics.writeOffPercentage) : '-'}
              </p>
            </div>
          </div>

          {/* WIP Breakdown */}
          <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Work in Progress Breakdown
            </h3>
            <div className="space-y-4">
              {wipMetrics && [
                { label: 'Unbilled Time', amount: wipMetrics.unbilledTime, color: 'bg-blue-600' },
                { label: 'Unbilled Expenses', amount: wipMetrics.unbilledExpenses, color: 'bg-green-600' },
                { label: 'Billed Not Collected', amount: wipMetrics.billedNotCollected, color: 'bg-yellow-600' },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm font-medium", theme.text.secondary)}>
                      {item.label}
                    </span>
                    <span className={cn("text-sm font-semibold", theme.text.primary)}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className={cn("relative h-3 rounded-full overflow-hidden", theme.surface.subtle)}>
                    <div
                      className={`absolute h-full ${item.color}`}
                      style={{ width: `${(item.amount / wipMetrics.totalWIP) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'forecasting' && (
        <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
          <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              Revenue Forecasting
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={cn("min-w-full divide-y", theme.divide.default)}>
              <thead className={theme.surface.subtle}>
                <tr>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Period
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Projected
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Actual
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Variance
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Variance %
                  </th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                {revenueForecast.map((period, index) => (
                  <tr key={index} className={cn(`hover:${theme.surface.highlight}`)}>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                      {period.month}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                      {formatCurrency(period.projectedRevenue)}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                      {period.actualRevenue > 0 ? formatCurrency(period.actualRevenue) : '-'}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium",
                      period.variance > 0
                        ? theme.status.success
                        : period.variance < 0
                          ? theme.status.error
                          : theme.text.secondary
                    )}>
                      {period.variance !== 0 ? (
                        <>
                          {period.variance > 0 ? '+' : ''}
                          {formatCurrency(period.variance)}
                        </>
                      ) : '-'}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium",
                      period.variancePercent > 0
                        ? theme.status.success
                        : period.variancePercent < 0
                          ? theme.status.error
                          : theme.text.secondary
                    )}>
                      {period.variancePercent !== 0 ? (
                        <>
                          {period.variancePercent > 0 ? '+' : ''}
                          {formatPercent(period.variancePercent)}
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'performance' && (
        <div className="space-y-6">
          {/* Timekeeper Performance */}
          <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
            <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
                Timekeeper Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className={cn("min-w-full divide-y", theme.divide.default)}>
                <thead className={theme.surface.subtle}>
                  <tr>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Timekeeper
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Billable Hours
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Utilization
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Billing Rate
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Revenue
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Realization
                    </th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                  {timekeeperPerformance.map((timekeeper) => (
                    <tr key={timekeeper.id} className={cn(`hover:${theme.surface.highlight}`)}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={cn("font-medium", theme.text.primary)}>
                            {timekeeper.name}
                          </div>
                          <div className={cn("text-sm", theme.text.secondary)}>
                            {timekeeper.level}
                          </div>
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {timekeeper.billableHours} / {timekeeper.targetHours}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn("text-sm font-medium", getPerformanceColor(timekeeper.utilizationRate))}>
                          {formatPercent(timekeeper.utilizationRate)}
                        </span>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {formatCurrency(timekeeper.billingRate)}/hr
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                        {formatCurrency(timekeeper.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn("text-sm font-medium", getPerformanceColor(timekeeper.realization))}>
                          {formatPercent(timekeeper.realization)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matter Profitability */}
          <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
            <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
                Matter Profitability
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className={cn("min-w-full divide-y", theme.divide.default)}>
                <thead className={theme.surface.subtle}>
                  <tr>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Matter
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Total Fees
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Total Costs
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Profit
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Margin
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Realization
                    </th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                  {matterProfitability.map((matter) => (
                    <tr key={matter.id} className={cn(`hover:${theme.surface.highlight}`)}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={cn("font-medium", theme.text.primary)}>
                            {matter.matterNumber}
                          </div>
                          <div className={cn("text-sm", theme.text.secondary)}>
                            {matter.client}
                          </div>
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {formatCurrency(matter.totalFees)}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {formatCurrency(matter.totalCosts)}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.status.success)}>
                        {formatCurrency(matter.profit)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn("text-sm font-medium", getPerformanceColor(matter.profitMargin, 70))}>
                          {formatPercent(matter.profitMargin)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn("text-sm font-medium", getPerformanceColor(matter.realizationRate))}>
                          {formatPercent(matter.realizationRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
