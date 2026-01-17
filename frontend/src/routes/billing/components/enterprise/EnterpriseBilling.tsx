/**
 * EnterpriseBilling Component
 * Main enterprise billing dashboard with AR aging, collection tracking, and write-off management
 */

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useQuery } from '@/hooks/data/useQueryHooks';

import { useEnterpriseBilling } from '../../hooks/useEnterpriseBilling';

interface ARAgingBucket {
  label: string;
  daysRange: string;
  amount: number;
  count: number;
  percentage: number;
}

interface WriteOffRequest {
  id: string;
  invoiceNumber: string;
  clientName: string;
  originalAmount: number;
  writeOffAmount: number;
  reason: string;
  requestedBy: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EnterpriseBillingProps {
  firmId?: string;
  onExportData?: (format: 'csv' | 'pdf' | 'excel') => void;
}

export function EnterpriseBilling({ firmId, onExportData }: EnterpriseBillingProps) {
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'aging' | 'collections' | 'writeoffs'
  >('overview');
  const [showFilters, setShowFilters] = useState(false);

  // Extract data fetching to custom hook (enterprise architecture compliance)
  const { metrics, collectionItems, isLoading } = useEnterpriseBilling(firmId);

  const agingBuckets: ARAgingBucket[] = useMemo(() => [], []);

  const { data: writeOffRequests = [] } = useQuery<WriteOffRequest[]>(
    ['billing', 'writeoffs'],
    () => Promise.resolve([])
  );

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[priority]
          }`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-[var(--color-surfaceRaised)] text-[var(--color-text)]',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
      contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      payment_plan: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || styles.pending
          }`}
      >
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {isLoading && <div className="text-sm">Loading billing data...</div>}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Enterprise Billing Dashboard
          </h2>
          <p className="mt-1 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Comprehensive financial management and collections
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => onExportData?.('excel')}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                Total Outstanding
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
                ${metrics.totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
              <DollarSign className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                Collection Rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
                {metrics.collectionRate}%
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">+2.3%</span>
              </div>
            </div>
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                Overdue Amount
              </p>
              <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">
                ${metrics.overdueAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[var(--color-textMuted)]">
                {metrics.overdueCount} invoices
              </p>
            </div>
            <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                Avg Days to Payment
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
                {metrics.averageDaysToPayment}
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-green-600">-3 days</span>
              </div>
            </div>
            <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-900/20">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--color-borderLight)]">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'aging', 'collections', 'writeoffs'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${selectedTab === tab
                ? 'border-blue-500 text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-textMuted)] hover:border-[var(--color-border)] hover:text-[var(--color-text)] dark:text-[var(--color-textMuted)] dark:hover:text-gray-300'
                }`}
            >
              {tab === 'writeoffs'
                ? 'Write-offs'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {selectedTab === 'aging' && (
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">AR Aging Analysis</h3>
          {agingBuckets.length === 0 && (
            <div className="py-8 text-center text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              No aging data available
            </div>
          )}
        </div>
      )}

      {selectedTab === 'collections' && (
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Collection Tracking</h3>
          {collectionItems.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              No collection items found
            </div>
          ) : (
            <div className="space-y-2">
              {collectionItems.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-[var(--color-borderLight)] p-3"
                >
                  <div>
                    <div className="font-medium text-[var(--color-text)]">{item.clientName}</div>
                    <div className="text-sm text-[var(--color-textMuted)]">{item.invoiceNumber}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'writeoffs' && (
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Write-off Management</h3>
          {writeOffRequests.length === 0 && (
            <div className="py-8 text-center text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              No write-off requests found
            </div>
          )}
        </div>
      )}

      {selectedTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">This Month Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Collected
                </span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ${metrics.collectedThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Write-offs
                </span>
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${metrics.writeOffsThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Total Receivables
                </span>
                <span className="text-lg font-semibold text-[var(--color-text)]">
                  ${metrics.totalReceivables.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Quick Actions</h3>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primaryDark)]"
              >
                Generate AR Report
              </button>
              <button
                type="button"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600"
              >
                Send Collection Reminders
              </button>
              <button
                type="button"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600"
              >
                Review Write-off Requests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
