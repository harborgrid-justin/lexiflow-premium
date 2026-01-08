/**
 * Billing Analytics Dashboard - Server Component
 *
 * Comprehensive analytics dashboard displaying profitability metrics,
 * realization rates, WIP analysis, revenue forecasting, and performance data.
 *
 * @module billing/analytics/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Users,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Activity,
  Percent,
} from 'lucide-react';
import {
  getProfitabilityMetrics,
  getRealizationMetrics,
  getWIPMetrics,
  getRevenueForecast,
  getTimekeeperPerformance,
  getMatterProfitability,
} from './actions';
import {
  formatCurrency,
  formatPercentage,
  formatHours,
  determineTrend,
  type ProfitabilityMetrics,
  type RealizationMetrics,
  type WorkInProgressMetrics,
  type RevenueForecasting,
  type TimekeeperPerformance,
  type MatterProfitability,
} from '@/lib/analytics/profitability';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Billing Analytics | LexiFlow',
  description: 'Comprehensive financial analytics including profitability, realization, and performance metrics',
  keywords: ['billing analytics', 'profitability', 'realization', 'WIP', 'legal billing'],
};

// =============================================================================
// Types
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color: string;
}

// =============================================================================
// Helper Components
// =============================================================================

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  };

  const valueColorClasses = {
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-emerald-900 dark:text-emerald-100',
    yellow: 'text-amber-900 dark:text-amber-100',
    red: 'text-red-900 dark:text-red-100',
    purple: 'text-purple-900 dark:text-purple-100',
    indigo: 'text-indigo-900 dark:text-indigo-100',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                ? 'text-red-600'
                : 'text-slate-500'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${valueColorClasses[color]}`}>{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, label, color }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {formatPercentage(percentage)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

// =============================================================================
// Data Section Components
// =============================================================================

async function ProfitabilitySection() {
  const result = await getProfitabilityMetrics();
  const metrics = result.data || {
    grossRevenue: 0,
    grossProfit: 0,
    grossMargin: 0,
    operatingExpenses: 0,
    netProfit: 0,
    netMargin: 0,
    ebitda: 0,
  };

  const profitTrend = metrics.netMargin >= 20 ? 'up' : metrics.netMargin >= 10 ? 'neutral' : 'down';

  return (
    <section className="mb-8">
      <SectionHeader
        title="Profitability Metrics"
        subtitle="Gross and net profit analysis with margin calculations"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load profitability metrics'} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gross Revenue"
          value={formatCurrency(metrics.grossRevenue)}
          subtitle="Total revenue before deductions"
          icon={<DollarSign className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Gross Profit"
          value={formatCurrency(metrics.grossProfit)}
          subtitle={`${formatPercentage(metrics.grossMargin)} margin`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
          trend={metrics.grossMargin >= 50 ? 'up' : 'neutral'}
          trendValue={formatPercentage(metrics.grossMargin)}
        />
        <MetricCard
          title="Operating Expenses"
          value={formatCurrency(metrics.operatingExpenses)}
          subtitle="Total operating costs"
          icon={<BarChart3 className="h-6 w-6" />}
          color="yellow"
        />
        <MetricCard
          title="Net Profit"
          value={formatCurrency(metrics.netProfit)}
          subtitle={`${formatPercentage(metrics.netMargin)} net margin`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color={metrics.netProfit >= 0 ? 'green' : 'red'}
          trend={profitTrend}
          trendValue={formatPercentage(metrics.netMargin)}
        />
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">EBITDA</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(metrics.ebitda)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Earnings Before Interest, Taxes, Depreciation, and Amortization
            </p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
            <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function RealizationSection() {
  const result = await getRealizationMetrics();
  const metrics = result.data || {
    standardBillingRate: 0,
    actualBillingRate: 0,
    billingRealization: 0,
    standardCollectionAmount: 0,
    actualCollectionAmount: 0,
    collectionRealization: 0,
    overallRealization: 0,
  };

  return (
    <section className="mb-8">
      <SectionHeader
        title="Realization Metrics"
        subtitle="Billing and collection realization analysis"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load realization metrics'} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Billing Realization"
          value={formatPercentage(metrics.billingRealization)}
          subtitle={`Standard: ${formatCurrency(metrics.standardBillingRate)}/hr - Actual: ${formatCurrency(metrics.actualBillingRate)}/hr`}
          icon={<Percent className="h-6 w-6" />}
          color={metrics.billingRealization >= 90 ? 'green' : metrics.billingRealization >= 80 ? 'yellow' : 'red'}
          trend={metrics.billingRealization >= 90 ? 'up' : metrics.billingRealization >= 80 ? 'neutral' : 'down'}
        />
        <MetricCard
          title="Collection Realization"
          value={formatPercentage(metrics.collectionRealization)}
          subtitle={`Collected ${formatCurrency(metrics.actualCollectionAmount)} of ${formatCurrency(metrics.standardCollectionAmount)}`}
          icon={<DollarSign className="h-6 w-6" />}
          color={metrics.collectionRealization >= 95 ? 'green' : metrics.collectionRealization >= 85 ? 'yellow' : 'red'}
          trend={metrics.collectionRealization >= 95 ? 'up' : metrics.collectionRealization >= 85 ? 'neutral' : 'down'}
        />
        <MetricCard
          title="Overall Realization"
          value={formatPercentage(metrics.overallRealization)}
          subtitle="Combined billing and collection"
          icon={<Target className="h-6 w-6" />}
          color={metrics.overallRealization >= 85 ? 'green' : metrics.overallRealization >= 75 ? 'yellow' : 'red'}
          trend={metrics.overallRealization >= 85 ? 'up' : metrics.overallRealization >= 75 ? 'neutral' : 'down'}
        />
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Realization Breakdown</h3>
        <div className="space-y-4">
          <ProgressBar
            value={metrics.billingRealization}
            max={100}
            label="Billing Realization"
            color="bg-blue-500"
          />
          <ProgressBar
            value={metrics.collectionRealization}
            max={100}
            label="Collection Realization"
            color="bg-emerald-500"
          />
          <ProgressBar
            value={metrics.overallRealization}
            max={100}
            label="Overall Realization"
            color="bg-purple-500"
          />
        </div>
      </div>
    </section>
  );
}

async function WIPSection() {
  const result = await getWIPMetrics();
  const metrics = result.data || {
    totalWIP: 0,
    unbilledTime: 0,
    unbilledExpenses: 0,
    billedNotCollected: 0,
    averageAgeDays: 0,
    writeOffAmount: 0,
    writeOffPercentage: 0,
  };

  return (
    <section className="mb-8">
      <SectionHeader
        title="Work in Progress (WIP)"
        subtitle="Unbilled work and aging analysis"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load WIP metrics'} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total WIP"
          value={formatCurrency(metrics.totalWIP)}
          subtitle="All work in progress"
          icon={<Briefcase className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          title="Unbilled Time"
          value={formatCurrency(metrics.unbilledTime)}
          subtitle="Time not yet billed"
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Unbilled Expenses"
          value={formatCurrency(metrics.unbilledExpenses)}
          subtitle="Expenses not yet billed"
          icon={<DollarSign className="h-6 w-6" />}
          color="yellow"
        />
        <MetricCard
          title="Billed Not Collected"
          value={formatCurrency(metrics.billedNotCollected)}
          subtitle="Pending collections"
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average WIP Age</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.averageAgeDays.toFixed(0)} days
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${
                metrics.averageAgeDays <= 30
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : metrics.averageAgeDays <= 60
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Write-Offs</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(metrics.writeOffAmount)}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {formatPercentage(metrics.writeOffPercentage)} of WIP
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${
                metrics.writeOffPercentage <= 2
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : metrics.writeOffPercentage <= 5
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function RevenueForecastSection() {
  const result = await getRevenueForecast();
  const forecasts = result.data || [];

  const totalProjected = forecasts.reduce((sum, f) => sum + f.projectedRevenue, 0);
  const totalActual = forecasts.reduce((sum, f) => sum + f.actualRevenue, 0);
  const totalVariance = totalActual - totalProjected;

  return (
    <section className="mb-8">
      <SectionHeader
        title="Revenue Forecasting"
        subtitle="Projected vs actual revenue comparison"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load forecast data'} />}
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <MetricCard
          title="Projected Revenue"
          value={formatCurrency(totalProjected)}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Actual Revenue"
          value={formatCurrency(totalActual)}
          icon={<DollarSign className="h-6 w-6" />}
          color={totalActual >= totalProjected ? 'green' : 'yellow'}
        />
        <MetricCard
          title="Variance"
          value={formatCurrency(Math.abs(totalVariance))}
          subtitle={totalVariance >= 0 ? 'Above target' : 'Below target'}
          icon={totalVariance >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          color={totalVariance >= 0 ? 'green' : 'red'}
          trend={totalVariance >= 0 ? 'up' : 'down'}
        />
      </div>
      {forecasts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Monthly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-left font-medium text-slate-600 dark:text-slate-400">Period</th>
                  <th className="pb-3 text-right font-medium text-slate-600 dark:text-slate-400">Projected</th>
                  <th className="pb-3 text-right font-medium text-slate-600 dark:text-slate-400">Actual</th>
                  <th className="pb-3 text-right font-medium text-slate-600 dark:text-slate-400">Variance</th>
                  <th className="pb-3 text-right font-medium text-slate-600 dark:text-slate-400">Variance %</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast, index) => (
                  <tr
                    key={forecast.month}
                    className={index !== forecasts.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}
                  >
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{forecast.month}</td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                      {formatCurrency(forecast.projectedRevenue)}
                    </td>
                    <td className="py-3 text-right text-slate-900 dark:text-white">
                      {formatCurrency(forecast.actualRevenue)}
                    </td>
                    <td
                      className={`py-3 text-right ${
                        forecast.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {forecast.variance >= 0 ? '+' : ''}{formatCurrency(forecast.variance)}
                    </td>
                    <td
                      className={`py-3 text-right ${
                        forecast.variancePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {forecast.variancePercent >= 0 ? '+' : ''}{formatPercentage(forecast.variancePercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

async function TimekeeperPerformanceSection() {
  const result = await getTimekeeperPerformance();
  const performers = result.data || [];

  return (
    <section className="mb-8">
      <SectionHeader
        title="Timekeeper Performance"
        subtitle="Individual utilization and realization metrics"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load timekeeper data'} />}
      {performers.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Timekeeper</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Level</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Billable Hrs</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Target Hrs</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Utilization</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Rate</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Revenue</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Realization</th>
                </tr>
              </thead>
              <tbody>
                {performers.map((performer, index) => (
                  <tr
                    key={performer.id}
                    className={`${
                      index !== performers.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                    } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {performer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{performer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{performer.level}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                      {formatHours(performer.billableHours)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                      {formatHours(performer.targetHours)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          performer.utilizationRate >= 90
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : performer.utilizationRate >= 75
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {formatPercentage(performer.utilizationRate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                      {formatCurrency(performer.billingRate)}/hr
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                      {formatCurrency(performer.revenue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          performer.realization >= 95
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : performer.realization >= 85
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {formatPercentage(performer.realization)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">No timekeeper performance data available</p>
        </div>
      )}
    </section>
  );
}

async function MatterProfitabilitySection() {
  const result = await getMatterProfitability();
  const matters = result.data || [];

  // Sort by profit margin descending and take top 10
  const topMatters = [...matters]
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 10);

  return (
    <section className="mb-8">
      <SectionHeader
        title="Matter Profitability"
        subtitle="Top matters by profit margin"
      />
      {!result.success && <ErrorState message={result.error || 'Failed to load matter data'} />}
      {topMatters.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Matter</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-400">Client</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Fees</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Costs</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Profit</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Margin</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Hours</th>
                  <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">Realization</th>
                </tr>
              </thead>
              <tbody>
                {topMatters.map((matter, index) => (
                  <tr
                    key={matter.id}
                    className={`${
                      index !== topMatters.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                    } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{matter.matterNumber}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {matter.matterDescription}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{matter.client}</td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                      {formatCurrency(matter.totalFees)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                      {formatCurrency(matter.totalCosts)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${
                        matter.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(matter.profit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          matter.profitMargin >= 30
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : matter.profitMargin >= 15
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {formatPercentage(matter.profitMargin)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                      {formatHours(matter.hoursWorked)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          matter.realizationRate >= 95
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : matter.realizationRate >= 85
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {formatPercentage(matter.realizationRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">No matter profitability data available</p>
        </div>
      )}
    </section>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function BillingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/billing"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
                <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Billing Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Profitability, realization, and performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Profitability Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            </div>
          }
        >
          <ProfitabilitySection />
        </Suspense>

        {/* Realization Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            </div>
          }
        >
          <RealizationSection />
        </Suspense>

        {/* WIP Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            </div>
          }
        >
          <WIPSection />
        </Suspense>

        {/* Revenue Forecast Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          }
        >
          <RevenueForecastSection />
        </Suspense>

        {/* Timekeeper Performance Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          }
        >
          <TimekeeperPerformanceSection />
        </Suspense>

        {/* Matter Profitability Section */}
        <Suspense
          fallback={
            <div className="mb-8">
              <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          }
        >
          <MatterProfitabilitySection />
        </Suspense>
      </div>
    </div>
  );
}
