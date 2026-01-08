/**
 * Billing Dashboard Page - Server Component
 *
 * Main billing dashboard with financial metrics, quick actions, and navigation.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  Receipt,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  BarChart3,
  Scale,
} from 'lucide-react';
import { getBillingMetrics, getInvoiceStats, getTimeEntries, getExpenses } from './actions';
import type { BillingMetrics, InvoiceStats, TimeEntry, Expense } from './types';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Billing & Finance | LexiFlow',
  description: 'Manage invoices, track time, expenses, and monitor financial health',
  keywords: ['billing', 'invoices', 'time tracking', 'expenses', 'legal billing'],
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
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// =============================================================================
// Components
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
  };

  const valueColorClasses = {
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-emerald-900 dark:text-emerald-100',
    yellow: 'text-amber-900 dark:text-amber-100',
    red: 'text-red-900 dark:text-red-100',
    purple: 'text-purple-900 dark:text-purple-100',
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
              <TrendingUp className="h-4 w-4 rotate-180" />
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

function QuickAction({ href, icon, title, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600"
    >
      <div className="rounded-lg bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
    </Link>
  );
}

function NavigationCard({
  href,
  icon,
  title,
  description,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-700 dark:text-slate-300">
          {icon}
        </div>
        {count !== undefined && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {formatNumber(count)}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function RecentActivity({
  timeEntries,
  expenses,
}: {
  timeEntries: TimeEntry[];
  expenses: Expense[];
}) {
  const recentItems = [
    ...timeEntries.slice(0, 3).map((entry) => ({
      type: 'time' as const,
      id: entry.id,
      description: entry.description,
      amount: entry.total,
      date: entry.date,
      status: entry.status,
    })),
    ...expenses.slice(0, 2).map((expense) => ({
      type: 'expense' as const,
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      status: expense.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
          No recent activity to display
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <Link
          href="/billing/time"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {recentItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  item.type === 'time'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                }`}
              >
                {item.type === 'time' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.description.length > 40
                    ? `${item.description.substring(0, 40)}...`
                    : item.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(item.amount)}
              </p>
              <span
                className={`text-xs ${
                  item.status === 'Approved' || item.status === 'Billed'
                    ? 'text-emerald-600'
                    : item.status === 'Draft'
                    ? 'text-slate-500'
                    : 'text-amber-600'
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function BillingMetricsSection() {
  const [metricsResult, statsResult] = await Promise.all([
    getBillingMetrics('30d'),
    getInvoiceStats(),
  ]);

  const metrics: BillingMetrics = metricsResult.data || {
    totalRevenue: 0,
    collectedRevenue: 0,
    outstandingRevenue: 0,
    overdueAmount: 0,
    wipAmount: 0,
    trustBalance: 0,
    invoiceCount: 0,
    paidInvoiceCount: 0,
    overdueInvoiceCount: 0,
    unbilledTimeHours: 0,
    unbilledExpensesAmount: 0,
    collectionRate: 0,
    averageDaysToPayment: 0,
    periodStart: '',
    periodEnd: '',
  };

  const stats: InvoiceStats = statsResult.data || {
    total: 0,
    outstanding: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(metrics.totalRevenue || stats.totalAmount)}
        subtitle="This period"
        icon={<DollarSign className="h-6 w-6" />}
        color="blue"
        trend="up"
        trendValue="+12.5%"
      />
      <MetricCard
        title="Collected"
        value={formatCurrency(metrics.collectedRevenue || stats.paidAmount)}
        subtitle={`${stats.paid} invoices paid`}
        icon={<CreditCard className="h-6 w-6" />}
        color="green"
      />
      <MetricCard
        title="Outstanding"
        value={formatCurrency(metrics.outstandingRevenue || stats.outstandingAmount)}
        subtitle={`${stats.outstanding} invoices pending`}
        icon={<FileText className="h-6 w-6" />}
        color="yellow"
      />
      <MetricCard
        title="Overdue"
        value={formatCurrency(metrics.overdueAmount)}
        subtitle={`${stats.overdue || metrics.overdueInvoiceCount} invoices overdue`}
        icon={<AlertTriangle className="h-6 w-6" />}
        color="red"
      />
    </div>
  );
}

async function WIPSection() {
  const [timeResult, expenseResult] = await Promise.all([
    getTimeEntries({ status: 'Draft', billable: true }),
    getExpenses({ status: 'Draft', billable: true }),
  ]);

  const unbilledTime = timeResult.data || [];
  const unbilledExpenses = expenseResult.data || [];

  const totalUnbilledTime = unbilledTime.reduce((sum, entry) => sum + entry.total, 0);
  const totalUnbilledHours = unbilledTime.reduce((sum, entry) => sum + entry.duration, 0);
  const totalUnbilledExpenses = unbilledExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Unbilled Time"
        value={formatCurrency(totalUnbilledTime)}
        subtitle={`${formatHours(totalUnbilledHours)} hours`}
        icon={<Clock className="h-6 w-6" />}
        color="purple"
      />
      <MetricCard
        title="Unbilled Expenses"
        value={formatCurrency(totalUnbilledExpenses)}
        subtitle={`${unbilledExpenses.length} expenses`}
        icon={<Receipt className="h-6 w-6" />}
        color="purple"
      />
      <MetricCard
        title="Total WIP"
        value={formatCurrency(totalUnbilledTime + totalUnbilledExpenses)}
        subtitle="Work in Progress"
        icon={<BarChart3 className="h-6 w-6" />}
        color="blue"
      />
    </div>
  );
}

async function RecentActivitySection() {
  const [timeResult, expenseResult] = await Promise.all([
    getTimeEntries(),
    getExpenses(),
  ]);

  return (
    <RecentActivity
      timeEntries={timeResult.data || []}
      expenses={expenseResult.data || []}
    />
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function BillingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Billing & Finance
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage invoices, track time, and monitor financial health
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/billing/time/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                New Time Entry
              </Link>
              <Link
                href="/billing/invoices/new"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <FileText className="h-4 w-4" />
                Create Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Financial Metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Financial Overview
          </h2>
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <BillingMetricsSection />
          </Suspense>
        </section>

        {/* Work in Progress */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Work in Progress
          </h2>
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <WIPSection />
          </Suspense>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              href="/billing/time/new"
              icon={<Clock className="h-6 w-6" />}
              title="Record Time"
              description="Log billable or non-billable hours"
            />
            <QuickAction
              href="/billing/expenses/new"
              icon={<Receipt className="h-6 w-6" />}
              title="Add Expense"
              description="Track costs and disbursements"
            />
            <QuickAction
              href="/billing/invoices/new"
              icon={<FileText className="h-6 w-6" />}
              title="Create Invoice"
              description="Generate and send client invoices"
            />
          </div>
        </section>

        {/* Navigation Grid & Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Navigation */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Billing Modules
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NavigationCard
                href="/billing/invoices"
                icon={<FileText className="h-6 w-6" />}
                title="Invoices"
                description="Create, send, and track client invoices"
              />
              <NavigationCard
                href="/billing/time"
                icon={<Clock className="h-6 w-6" />}
                title="Time Entries"
                description="Manage billable and non-billable time"
              />
              <NavigationCard
                href="/billing/expenses"
                icon={<Receipt className="h-6 w-6" />}
                title="Expenses"
                description="Track costs and disbursements"
              />
              <NavigationCard
                href="/billing/rates"
                icon={<DollarSign className="h-6 w-6" />}
                title="Rate Tables"
                description="Manage billing rates by timekeeper"
              />
              <NavigationCard
                href="/billing/trust"
                icon={<Scale className="h-6 w-6" />}
                title="Trust Accounting"
                description="IOLTA accounts and client trust funds"
              />
              <NavigationCard
                href="/billing-reports"
                icon={<BarChart3 className="h-6 w-6" />}
                title="Reports"
                description="Financial analytics and reporting"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <Suspense
              fallback={
                <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              }
            >
              <RecentActivitySection />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
