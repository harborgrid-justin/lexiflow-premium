/**
 * FinancialReports Component
 * Advanced financial reporting with profitability analysis, realization rates, and revenue forecasting
 */

import {
  FINANCIAL_REPORT_TAB_LABELS,
  FINANCIAL_REPORT_TABS,
  REPORT_PERIODS,
  ReportPeriod
} from '@/config/billing.config';
import { useFinancialHelpers, useFinancialReports } from '@/features/billing/hooks/useFinancialReports';
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
interface FinancialReportsProps {
  firmId?: string;
  dateRange?: { start: string; end: string };
  onExport?: (reportType: string, format: 'pdf' | 'excel' | 'csv') => void;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  dateRange,
  onExport,
}) => {
  const {
    selectedTab,
    setSelectedTab,
    selectedPeriod,
    setSelectedPeriod,
    showFilters,
    setShowFilters,
    isLoading,
    error,
    data
  } = useFinancialReports({ dateRange });

  const { formatCurrency, formatPercent, getPerformanceColor } = useFinancialHelpers();

  const {
    profitability,
    realization,
    wipMetrics: wipMetrics,
    revenueForecast,
    timekeeperPerformance,
    matterProfitability
  } = data;

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Financial Reports & Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Comprehensive financial analysis and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {REPORT_PERIODS.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => onExport?.(selectedTab, 'excel')}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {FINANCIAL_REPORT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${selectedTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              {FINANCIAL_REPORT_TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'profitability' && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Gross Revenue
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {profitability ? formatCurrency(profitability.grossRevenue) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">+12.3% YoY</span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Gross Margin
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
                    {profitability ? formatPercent(profitability.grossMargin) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">+2.1%</span>
                  </div>
                </div>
                <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/20">
                  <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Profit
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {profitability ? formatCurrency(profitability.netProfit) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">+8.7%</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-900/20">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Margin
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {profitability ? formatPercent(profitability.netMargin) : '-'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">-1.2%</span>
                  </div>
                </div>
                <div className="rounded-full bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Profitability Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Gross Revenue
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {profitability ? formatCurrency(profitability.grossRevenue) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Direct Costs
                </span>
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  -{profitability ? formatCurrency(profitability.grossRevenue - profitability.grossProfit) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Gross Profit
                </span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {profitability ? formatCurrency(profitability.grossProfit) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Operating Expenses
                </span>
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  -{profitability ? formatCurrency(profitability.operatingExpenses) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
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
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Billing Realization
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {realization ? formatPercent(realization.billingRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {realization ? `${formatCurrency(realization.actualBillingRate)} / ${formatCurrency(realization.standardBillingRate)}` : '-'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Collection Realization
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {realization ? formatPercent(realization.collectionRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {realization ? `${formatCurrency(realization.actualCollectionAmount)} / ${formatCurrency(realization.standardCollectionAmount)}` : '-'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Realization
              </p>
              <p className={`mt-2 text-3xl font-semibold ${realization ? getPerformanceColor(realization.overallRealization, 85) : ''}`}>
                {realization ? formatPercent(realization.overallRealization) : '-'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Combined realization rate
              </p>
            </div>
          </div>

          {/* Realization Analysis */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Realization Analysis
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Billing Realization Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {realization ? formatPercent(realization.billingRealization) : '-'}
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div
                    className="absolute h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${realization ? realization.billingRealization : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Collection Realization Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {realization ? formatPercent(realization.collectionRealization) : '-'}
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div
                    className="absolute h-full bg-green-600 dark:bg-green-500"
                    style={{ width: `${realization ? realization.collectionRealization : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overall Realization Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {realization ? formatPercent(realization.overallRealization) : '-'}
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
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
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total WIP
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {wipMetrics ? formatCurrency(wipMetrics.totalWIP) : '-'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unbilled Time
              </p>
              <p className="mt-2 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {wipMetrics ? formatCurrency(wipMetrics.unbilledTime) : '-'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Age
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {wipMetrics ? wipMetrics.averageAgeDays : '-'} days
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Write-off Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">
                {wipMetrics ? formatPercent(wipMetrics.writeOffPercentage) : '-'}
              </p>
            </div>
          </div>

          {/* WIP Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
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
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Forecasting
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Projected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Variance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Variance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {revenueForecast.map((period, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {period.month}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(period.projectedRevenue)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {period.actualRevenue > 0 ? formatCurrency(period.actualRevenue) : '-'}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${period.variance > 0
                      ? 'text-green-600 dark:text-green-400'
                      : period.variance < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500'
                      }`}>
                      {period.variance !== 0 ? (
                        <>
                          {period.variance > 0 ? '+' : ''}
                          {formatCurrency(period.variance)}
                        </>
                      ) : '-'}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${period.variancePercent > 0
                      ? 'text-green-600 dark:text-green-400'
                      : period.variancePercent < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500'
                      }`}>
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
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Timekeeper Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Timekeeper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Billable Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Billing Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Realization
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {timekeeperPerformance.map((timekeeper) => (
                    <tr key={timekeeper.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {timekeeper.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {timekeeper.level}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {timekeeper.billableHours} / {timekeeper.targetHours}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`text-sm font-medium ${getPerformanceColor(timekeeper.utilizationRate)}`}>
                          {formatPercent(timekeeper.utilizationRate)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(timekeeper.billingRate)}/hr
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(timekeeper.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`text-sm font-medium ${getPerformanceColor(timekeeper.realization)}`}>
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
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Matter Profitability
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Matter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total Costs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Realization
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {matterProfitability.map((matter) => (
                    <tr key={matter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {matter.matterNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {matter.client}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(matter.totalFees)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(matter.totalCosts)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(matter.profit)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`text-sm font-medium ${getPerformanceColor(matter.profitMargin, 70)}`}>
                          {formatPercent(matter.profitMargin)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`text-sm font-medium ${getPerformanceColor(matter.realizationRate)}`}>
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
