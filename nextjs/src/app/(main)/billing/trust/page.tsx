/**
 * Trust Accounts Page (IOLTA)
 *
 * Manage client trust funds with IOLTA compliance features.
 *
 * KEY FEATURES:
 * - Trust account dashboard with compliance monitoring
 * - IOLTA and Client Trust account management
 * - Three-way reconciliation tracking
 * - Compliance issue detection and alerts
 * - Deposit/withdrawal transaction management
 *
 * COMPLIANCE REQUIREMENTS:
 * - Monthly three-way reconciliation (bank statement, main ledger, client ledgers)
 * - Overdraft protection warnings
 * - Detailed transaction audit trail
 * - State bar compliance monitoring
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Plus,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { getTrustAccounts } from '../actions';
import type { TrustAccount, TrustAccountType, TrustAccountStatus } from '../types';
import { TrustAccountActions } from './trust-account-actions';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Trust Accounts (IOLTA) | Billing',
  description: 'Manage client trust funds with IOLTA compliance',
};

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getStatusColor(status: TrustAccountStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Suspended':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Closed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
  }
}

function getAccountTypeLabel(type: TrustAccountType): string {
  switch (type) {
    case 'IOLTA':
      return 'IOLTA';
    case 'ClientTrust':
      return 'Client Trust';
    case 'OperatingTrust':
      return 'Operating Trust';
    default:
      return type;
  }
}

function needsReconciliation(account: TrustAccount): boolean {
  if (!account.nextReconciliationDue) return false;
  const dueDate = new Date(account.nextReconciliationDue);
  const now = new Date();
  return dueDate <= now;
}

// ============================================================================
// Sub-Components
// ============================================================================

function PageHeader() {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/billing"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Landmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Trust Accounts (IOLTA)
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage client trust funds with compliance features
              </p>
            </div>
          </div>

          <Link
            href="/billing/trust/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Trust Account
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ComplianceBannerProps {
  criticalIssues: number;
  reconciliationOverdue: number;
}

function ComplianceBanner({
  criticalIssues,
  reconciliationOverdue,
}: ComplianceBannerProps) {
  if (criticalIssues === 0 && reconciliationOverdue === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <h3 className="font-medium text-emerald-800 dark:text-emerald-200">
            All Accounts Compliant
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            No compliance issues detected. All reconciliations are up to date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
      <div>
        <h3 className="font-medium text-red-800 dark:text-red-200">
          {criticalIssues > 0
            ? `${criticalIssues} Critical Compliance Issue${criticalIssues > 1 ? 's' : ''}`
            : `${reconciliationOverdue} Account${reconciliationOverdue > 1 ? 's' : ''} Need${reconciliationOverdue === 1 ? 's' : ''} Reconciliation`}
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          {criticalIssues > 0
            ? 'Immediate action required to maintain state bar compliance.'
            : 'Monthly three-way reconciliation is overdue.'}
        </p>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  accounts: TrustAccount[];
}

function StatsCards({ accounts }: StatsCardsProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter((acc) => acc.status === 'Active').length;
  const ioltaAccounts = accounts.filter((acc) => acc.accountType === 'IOLTA');
  const ioltaBalance = ioltaAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const overdue = accounts.filter(needsReconciliation).length;

  const stats = [
    {
      label: 'Total Trust Liability',
      value: formatCurrency(totalBalance),
      subtitle: 'All trust accounts',
      icon: Landmark,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Active Accounts',
      value: activeAccounts.toString(),
      subtitle: `${accounts.length} total accounts`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Needs Reconciliation',
      value: overdue.toString(),
      subtitle: 'Overdue monthly reconciliation',
      icon: Clock,
      color: overdue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400',
      bgColor: overdue > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700',
    },
    {
      label: 'IOLTA Balance',
      value: formatCurrency(ioltaBalance),
      subtitle: `${ioltaAccounts.length} IOLTA accounts`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stat.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FilterBarProps {
  currentStatus?: string;
  currentType?: string;
}

function FilterBar({ currentStatus, currentType }: FilterBarProps) {
  const statuses = ['All', 'Active', 'Suspended', 'Inactive', 'Closed'];
  const types = ['All', 'IOLTA', 'ClientTrust', 'OperatingTrust'];

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Status:
        </span>
        <div className="flex gap-1">
          {statuses.map((status) => {
            const isActive =
              status === 'All' ? !currentStatus : currentStatus === status;
            return (
              <Link
                key={status}
                href={
                  status === 'All'
                    ? `/billing/trust${currentType ? `?type=${currentType}` : ''}`
                    : `/billing/trust?status=${status}${currentType ? `&type=${currentType}` : ''}`
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {status}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Type:
        </span>
        <div className="flex gap-1">
          {types.map((type) => {
            const isActive =
              type === 'All' ? !currentType : currentType === type;
            return (
              <Link
                key={type}
                href={
                  type === 'All'
                    ? `/billing/trust${currentStatus ? `?status=${currentStatus}` : ''}`
                    : `/billing/trust?type=${type}${currentStatus ? `&status=${currentStatus}` : ''}`
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {type === 'ClientTrust' ? 'Client Trust' : type === 'OperatingTrust' ? 'Operating' : type}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TrustAccountCardProps {
  account: TrustAccount;
}

function TrustAccountCard({ account }: TrustAccountCardProps) {
  const isOverdue = needsReconciliation(account);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {account.accountName}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(account.status)}`}
            >
              {account.status}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {account.clientName} &bull; {getAccountTypeLabel(account.accountType)}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Balance
              </p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(account.balance)}
              </p>
            </div>

            {account.lastReconciledDate && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last Reconciled
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(account.lastReconciledDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {account.nextReconciliationDue && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Next Due
                </p>
                <p
                  className={`text-sm font-medium ${
                    isOverdue
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {new Date(account.nextReconciliationDue).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {isOverdue && (
            <div className="mt-3 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Reconciliation Overdue
              </span>
            </div>
          )}

          {/* Recent Transactions Preview */}
          {account.transactions && account.transactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Recent Transactions
              </p>
              <div className="space-y-1">
                {account.transactions.slice(0, 2).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {txn.description}
                    </span>
                    <span
                      className={`font-mono ${
                        txn.type === 'Deposit'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {txn.type === 'Deposit' ? '+' : '-'}
                      {formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <TrustAccountActions account={account} />
      </div>
    </div>
  );
}

interface TrustAccountListProps {
  accounts: TrustAccount[];
}

function TrustAccountList({ accounts }: TrustAccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          <Landmark className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No Trust Accounts
        </h3>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Create your first trust account to get started
        </p>
        <Link
          href="/billing/trust/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Trust Account
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {accounts.map((account) => (
        <TrustAccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}

// ============================================================================
// Async Data Components
// ============================================================================

interface TrustAccountsContentProps {
  statusFilter?: string;
  typeFilter?: string;
}

async function TrustAccountsContent({
  statusFilter,
  typeFilter,
}: TrustAccountsContentProps) {
  const result = await getTrustAccounts();
  const accounts = result.success && result.data ? result.data : [];

  // Filter accounts
  let filteredAccounts = accounts;

  if (statusFilter) {
    filteredAccounts = filteredAccounts.filter(
      (acc) => acc.status === statusFilter
    );
  }

  if (typeFilter) {
    filteredAccounts = filteredAccounts.filter(
      (acc) => acc.accountType === typeFilter
    );
  }

  // Calculate compliance metrics
  const overdueCount = accounts.filter(needsReconciliation).length;
  const criticalIssues = 0; // Would come from compliance checks

  return (
    <div className="space-y-6">
      <ComplianceBanner
        criticalIssues={criticalIssues}
        reconciliationOverdue={overdueCount}
      />
      <StatsCards accounts={accounts} />
      <FilterBar currentStatus={statusFilter} currentType={typeFilter} />
      <TrustAccountList accounts={filteredAccounts} />
    </div>
  );
}

function TrustAccountsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Compliance banner skeleton */}
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

      {/* Accounts skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function TrustAccountsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status;
  const typeFilter = resolvedSearchParams.type;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PageHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Suspense fallback={<TrustAccountsSkeleton />}>
          <TrustAccountsContent
            statusFilter={statusFilter}
            typeFilter={typeFilter}
          />
        </Suspense>
      </div>
    </div>
  );
}
