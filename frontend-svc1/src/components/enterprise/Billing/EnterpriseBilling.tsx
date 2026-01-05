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
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
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

  const agingBuckets: ARAgingBucket[] = []; // TODO: Fetch from API

  const collectionItems: CollectionItem[] = []; // TODO: Fetch from API

  const writeOffRequests: WriteOffRequest[] = []; // TODO: Fetch from API

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      payment_plan: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Enterprise Billing Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Comprehensive financial management and collections
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => onExportData?.('excel')}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Outstanding
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                ${metrics.totalOutstanding.toLocaleString()}
              </p>
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

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overdue Amount
              </p>
              <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">
                ${metrics.overdueAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {metrics.overdueCount} invoices
              </p>
            </div>
            <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Days to Payment
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'aging', 'collections', 'writeoffs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${selectedTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              {tab === 'writeoffs' ? 'Write-offs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'aging' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AR Aging Analysis
          </h3>
          <div className="space-y-4">
            {agingBuckets.length > 0 ? (
              agingBuckets.map((bucket) => (
                <div
                  key={bucket.label}
                  className="border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {bucket.label}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {bucket.daysRange}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            ${bucket.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {bucket.count} invoices
                          </p>
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div
                          className="absolute h-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${bucket.percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 text-right">
                        {bucket.percentage}% of total
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No aging data available
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'collections' && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Collection Tracking
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Client / Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Days Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {collectionItems.length > 0 ? (
                  collectionItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {item.clientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {item.daysOverdue} days
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getPriorityBadge(item.priority)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {item.assignedTo || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
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
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Write-off Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Invoice / Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Original Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Write-off Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {writeOffRequests.length > 0 ? (
                  writeOffRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {request.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {request.clientName}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        ${request.originalAmount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">
                        ${request.writeOffAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div
                          className="max-w-xs truncate"
                          title={request.reason}
                        >
                          {request.reason}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {request.requestedBy}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
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
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
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
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              This Month Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Collected</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ${metrics.collectedThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Write-offs</span>
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${metrics.writeOffsThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Receivables</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ${metrics.totalReceivables.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                Generate AR Report
              </button>
              <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Send Collection Reminders
              </button>
              <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Review Write-off Requests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
