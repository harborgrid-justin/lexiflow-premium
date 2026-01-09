/**
 * EnterpriseBilling Component
 * Main enterprise billing dashboard with AR aging, collection tracking, and write-off management
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/backend';
import { cn } from '@/shared/lib/utils';
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
import React, { useMemo, useState } from 'react';
import { BillingOverview, dashboardMetricsService } from '../../../services/api/dashboard-metrics.service';

// Types
interface BillingSummaryMetrics {
  totalOutstanding: number;
  totalReceivables: number;
  collectedThisMonth: number;
  collectionRate: number;
  writeOffsThisMonth: number;
  averageDaysToPayment: number;
  overdueAmount: number;
  overdueCount: number;
}

interface ARAgingBucket {
  label: string;
  daysRange: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CollectionItem {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  lastContactDate?: string;
  assignedTo?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'contacted' | 'payment_plan';
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

interface EnterpriseBillingProps {
  firmId?: string;
  onExportData?: (format: 'csv' | 'pdf' | 'excel') => void;
}

export const EnterpriseBilling: React.FC<EnterpriseBillingProps> = ({
  onExportData,
}) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'aging' | 'collections' | 'writeoffs'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  const { data: billingData, isLoading: _isLoading } = useQuery(
    ['billing', 'overview'],
    () => dashboardMetricsService.getBillingOverview()
  );

  const metrics: BillingSummaryMetrics = useMemo(() => {
    if (!billingData || billingData.length === 0) {
      return {
        totalOutstanding: 0,
        totalReceivables: 0,
        collectedThisMonth: 0,
        collectionRate: 0,
        writeOffsThisMonth: 0,
        averageDaysToPayment: 0,
        overdueAmount: 0,
        overdueCount: 0,
      };
    }

    const total = billingData.reduce(
      (acc, curr: BillingOverview) => ({
        totalOutstanding: acc.totalOutstanding + curr.outstanding,
        collected: acc.collected + curr.collected,
        writeOffs: acc.writeOffs + curr.writeOffs,
        billed: acc.billed + curr.billed,
      }),
      { totalOutstanding: 0, collected: 0, writeOffs: 0, billed: 0 }
    );

    return {
      totalOutstanding: total.totalOutstanding,
      totalReceivables: total.totalOutstanding,
      collectedThisMonth: total.collected, // Approximation
      collectionRate: total.billed ? (total.collected / total.billed) * 100 : 0,
      writeOffsThisMonth: total.writeOffs,
      averageDaysToPayment: 0, // Not available
      overdueAmount: 0, // Not available
      overdueCount: 0, // Not available
    };
  }, [billingData]);

  const agingBuckets: ARAgingBucket[] = useMemo(() => {
    if (!billingData || !Array.isArray(billingData)) {
      return [];
    }
    const overviewWithBuckets = billingData.find((item: { agingBuckets?: unknown }) => item.agingBuckets);
    if (!overviewWithBuckets || !(overviewWithBuckets as { agingBuckets?: unknown[] }).agingBuckets) {
      return [];
    }
    return (overviewWithBuckets as { agingBuckets: { label: string; amount: number; count: number; total: number }[] }).agingBuckets.map((bucket: { label: string; amount: number; count: number; total: number }) => ({
      label: bucket.label,
      daysRange: bucket.label,
      amount: bucket.amount,
      count: bucket.count,
      percentage: bucket.total > 0 ? (bucket.amount / bucket.total) * 100 : 0,
    }));
  }, [billingData]);

  const { data: collectionItemsData = [] } = useQuery<CollectionItem[]>(
    ['billing', 'collections'],
    async () => {
      try {
        return await dashboardMetricsService.getCollectionItems();
      } catch {
        return [];
      }
    }
  );
  const collectionItems: CollectionItem[] = collectionItemsData;

  const { data: writeOffRequestsData = [] } = useQuery<WriteOffRequest[]>(
    ['billing', 'writeoffs'],
    async () => {
      try {
        return await dashboardMetricsService.getWriteOffRequests();
      } catch {
        return [];
      }
    }
  );
  const writeOffRequests: WriteOffRequest[] = writeOffRequestsData;

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: cn(theme.status.error.bg, theme.status.error.text),
      medium: cn(theme.status.warning.bg, theme.status.warning.text),
      low: cn(theme.status.success.bg, theme.status.success.text),
    };
    return (
      <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', styles[priority])}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: cn(theme.surface.subtle, theme.text.secondary),
      in_progress: cn(theme.status.info.bg, theme.status.info.text),
      contacted: cn(theme.status.warning.bg, theme.status.warning.text),
      payment_plan: cn(theme.status.success.bg, theme.status.success.text),
      approved: cn(theme.status.success.bg, theme.status.success.text),
      rejected: cn(theme.status.error.bg, theme.status.error.text),
    };
    return (
      <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', styles[status] || styles.pending)}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
            Enterprise Billing Dashboard
          </h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>
            Comprehensive financial management and collections
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => onExportData?.('excel')}
            className={cn("inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cn("rounded-lg border p-6 shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Total Outstanding
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                ${metrics.totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className={cn("rounded-full p-3", theme.status.info.bg)}>
              <DollarSign className={cn("h-6 w-6", theme.status.info.text)} />
            </div>
          </div>
        </div>

        <div className={cn("rounded-lg border p-6 shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Collection Rate
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.status.success.text)}>
                {metrics.collectionRate}%
              </p>
              <div className={cn("mt-1 flex items-center gap-1 text-sm", theme.status.success.text)}>
                <TrendingUp className="h-4 w-4" />
                <span>+2.3%</span>
              </div>
            </div>
            <div className={cn("rounded-full p-3", theme.status.success.bg)}>
              <CheckCircle className={cn("h-6 w-6", theme.status.success.text)} />
            </div>
          </div>
        </div>

        <div className={cn("rounded-lg border p-6 shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Overdue Amount
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.status.error.text)}>
                ${metrics.overdueAmount.toLocaleString()}
              </p>
              <p className={cn("mt-1 text-sm", theme.text.muted)}>
                {metrics.overdueCount} invoices
              </p>
            </div>
            <div className={cn("rounded-full p-3", theme.status.error.bg)}>
              <AlertTriangle className={cn("h-6 w-6", theme.status.error.text)} />
            </div>
          </div>
        </div>

        <div className={cn("rounded-lg border p-6 shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm font-medium", theme.text.secondary)}>
                Avg Days to Payment
              </p>
              <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
                {metrics.averageDaysToPayment}
              </p>
              <div className={cn("mt-1 flex items-center gap-1 text-sm", theme.status.success.text)}>
                <TrendingDown className="h-4 w-4" />
                <span>-3 days</span>
              </div>
            </div>
            <div className={cn("rounded-full p-3", theme.status.warning.bg)}>
              <Clock className={cn("h-6 w-6", theme.status.warning.text)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'aging', 'collections', 'writeoffs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                selectedTab === tab
                  ? cn(theme.border.primary, theme.text.primary)
                  : cn('border-transparent hover:border-gray-300', theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              {tab === 'writeoffs' ? 'Write-offs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'aging' && (
        <div className={cn("rounded-lg border p-6", theme.surface.default, theme.border.default)}>
          <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
            AR Aging Analysis
          </h3>
          <div className="space-y-4">
            {agingBuckets.length > 0 ? (
              agingBuckets.map((bucket) => (
                <div
                  key={bucket.label}
                  className={cn("border-b pb-4 last:border-b-0", theme.border.default)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className={cn("font-medium", theme.text.primary)}>
                            {bucket.label}
                          </h4>
                          <p className={cn("text-sm", theme.text.secondary)}>
                            {bucket.daysRange}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-lg font-semibold", theme.text.primary)}>
                            ${bucket.amount.toLocaleString()}
                          </p>
                          <p className={cn("text-sm", theme.text.secondary)}>
                            {bucket.count} invoices
                          </p>
                        </div>
                      </div>
                      <div className={cn("relative h-2 rounded-full overflow-hidden", theme.surface.subtle)}>
                        <div
                          className="absolute h-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${bucket.percentage}%` }}
                        />
                      </div>
                      <p className={cn("mt-1 text-xs text-right", theme.text.secondary)}>
                        {bucket.percentage}% of total
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={cn("text-center py-8", theme.text.secondary)}>
                No aging data available
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'collections' && (
        <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              Collection Tracking
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={cn("min-w-full divide-y", theme.divide.default)}>
              <thead className={cn(theme.surface.subtle)}>
                <tr>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Client / Invoice
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Amount
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Days Overdue
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Priority
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Assigned To
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Status
                  </th>
                  <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                {collectionItems.length > 0 ? (
                  collectionItems.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(`hover:${theme.surface.highlight}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className={cn("font-medium", theme.text.primary)}>
                            {item.clientName}
                          </div>
                          <div className={cn("text-sm", theme.text.secondary)}>
                            {item.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {item.daysOverdue} days
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getPriorityBadge(item.priority)}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {item.assignedTo || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button className={cn("hover:underline", theme.text.accent)}>
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className={cn("px-6 py-8 text-center", theme.text.secondary)}
                    >
                      No collection items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'writeoffs' && (
        <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              Write-off Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={cn("min-w-full divide-y", theme.divide.default)}>
              <thead className={cn(theme.surface.subtle)}>
                <tr>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Invoice / Client
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Original Amount
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Write-off Amount
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Reason
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Requested By
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Status
                  </th>
                  <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                {writeOffRequests.length > 0 ? (
                  writeOffRequests.map((request) => (
                    <tr
                      key={request.id}
                      className={cn(`hover:${theme.surface.highlight}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className={cn("font-medium", theme.text.primary)}>
                            {request.invoiceNumber}
                          </div>
                          <div className={cn("text-sm", theme.text.secondary)}>
                            {request.clientName}
                          </div>
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        ${request.originalAmount.toLocaleString()}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.status.error.text)}>
                        ${request.writeOffAmount.toLocaleString()}
                      </td>
                      <td className={cn("px-6 py-4 text-sm", theme.text.primary)}>
                        <div
                          className="max-w-xs truncate"
                          title={request.reason}
                        >
                          {request.reason}
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        {request.requestedBy}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button className={cn("hover:text-opacity-80", theme.status.success.text)}>
                              Approve
                            </button>
                            <button className={cn("hover:text-opacity-80", theme.status.error.text)}>
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <button className={cn("hover:underline", theme.text.accent)}>
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className={cn("px-6 py-8 text-center", theme.text.secondary)}
                    >
                      No write-off requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Stats */}
          <div className={cn("rounded-lg border p-6", theme.surface.default, theme.border.default)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              This Month Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", theme.text.secondary)}>Collected</span>
                <span className={cn("text-lg font-semibold", theme.status.success.text)}>
                  ${metrics.collectedThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", theme.text.secondary)}>Write-offs</span>
                <span className={cn("text-lg font-semibold", theme.status.error.text)}>
                  ${metrics.writeOffsThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", theme.text.secondary)}>Total Receivables</span>
                <span className={cn("text-lg font-semibold", theme.text.primary)}>
                  ${metrics.totalReceivables.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cn("rounded-lg border p-6", theme.surface.default, theme.border.default)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className={cn("w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm", theme.interactive.primary)}>
                Generate AR Report
              </button>
              <button className={cn("w-full rounded-md border px-4 py-2 text-sm font-medium shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
                Send Collection Reminders
              </button>
              <button className={cn("w-full rounded-md border px-4 py-2 text-sm font-medium shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
                Review Write-off Requests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
