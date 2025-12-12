import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, Clock, AlertTriangle } from 'lucide-react';

export interface BillingSummary {
  totalRevenue: number;
  totalBilled: number;
  totalUnbilled: number;
  totalOutstanding: number;
  revenueChange: number;
  averageRate: number;
  billableHours: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    client: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: Date;
  }>;
}

export interface BillingSummaryWidgetProps {
  data?: BillingSummary;
  loading?: boolean;
  currency?: string;
  onInvoiceClick?: (invoiceId: string) => void;
  className?: string;
}

export const BillingSummaryWidget: React.FC<BillingSummaryWidgetProps> = ({
  data,
  loading = false,
  currency = '$',
  onInvoiceClick,
  className = '',
}) => {
  const [summary, setSummary] = useState<BillingSummary>(
    data || {
      totalRevenue: 0,
      totalBilled: 0,
      totalUnbilled: 0,
      totalOutstanding: 0,
      revenueChange: 0,
      averageRate: 0,
      billableHours: 0,
      recentInvoices: [],
    }
  );

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data]);

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const metrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      change: summary.revenueChange,
    },
    {
      label: 'Outstanding',
      value: formatCurrency(summary.totalOutstanding),
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Unbilled',
      value: formatCurrency(summary.totalUnbilled),
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Avg Rate',
      value: `${formatCurrency(summary.averageRate)}/hr`,
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-16"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Revenue Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Billed This Month
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalBilled)}
            </div>
            {summary.revenueChange !== 0 && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  summary.revenueChange > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${summary.revenueChange < 0 ? 'rotate-180' : ''}`}
                />
                <span>{Math.abs(summary.revenueChange)}% from last month</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
          >
            <div className={`p-2 rounded w-fit mb-2 ${metric.bgColor}`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Invoices */}
      {summary.recentInvoices.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Invoices
          </h4>
          <div className="space-y-2">
            {summary.recentInvoices.slice(0, 3).map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => onInvoiceClick?.(invoice.id)}
                className={`bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 ${
                  onInvoiceClick ? 'cursor-pointer hover:shadow-md' : ''
                } transition-shadow`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {invoice.client}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(invoice.amount)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {invoice.status}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Billable Hours */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Billable Hours This Month
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.billableHours}h
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BillingSummaryWidget;
