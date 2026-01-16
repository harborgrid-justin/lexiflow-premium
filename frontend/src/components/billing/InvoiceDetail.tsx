/**
 * InvoiceDetail Component
 * Display invoice details with payment tracking and PDF preview
 */

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import type { Invoice } from '@/types/financial';
import { CreditCard, Download, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Form } from 'react-router';
import { InvoicePreview } from './InvoicePreview';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack?: () => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice }) => {
  const { theme } = useTheme();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: cn(theme.surface.default, theme.text.secondary, 'dark:bg-slate-800 dark:text-slate-100'),
      Sent: cn(theme.colors.info, 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100'),
      Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100',
      Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100',
      Cancelled: cn(theme.surface.default, theme.text.secondary, 'dark:bg-slate-800 dark:text-slate-100'),
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${styles[status as keyof typeof styles] || styles.Draft
          }`}
      >
        {status}
      </span>
    );
  };

  const paymentPercent = (invoice.paidAmount / invoice.totalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className={cn("text-2xl font-bold", theme.text.primary)}>
              Invoice {invoice.invoiceNumber}
            </h1>
            {getStatusBadge(invoice.status)}
          </div>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>
            {invoice.clientName} - {invoice.matterDescription}
          </p>
        </div>

        <div className="flex gap-3">
          {invoice.status === 'Draft' && (
            <Form method="post">
              <input type="hidden" name="intent" value="send" />
              <button
                type="submit"
                className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm", theme.colors.primary, `hover:${theme.colors.hoverPrimary}`)}
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </button>
            </Form>
          )}
          <Form method="post">
            <input type="hidden" name="intent" value="download-pdf" />
            <button
              type="submit"
              className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm", theme.border.default, theme.surface.default, theme.text.primary, `hover:${theme.surface.hover}`)}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </Form>
        </div>
      </div>

      {/* Payment Status Card */}
      <div className={cn("rounded-lg p-6", theme.surface.default, theme.border.default)}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div>
            <p className={cn("text-sm font-medium", theme.text.secondary)}>Total Amount</p>
            <p className={cn("mt-1 text-2xl font-semibold", theme.text.primary)}>
              ${invoice.totalAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</p>
            <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
              ${invoice.paidAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance Due</p>
            <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
              ${invoice.balanceDue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
            {invoice.status === 'Overdue' && (
              <p className="mt-1 text-xs text-red-600">
                {Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
              </p>
            )}
          </div>
        </div>

        {/* Payment Progress Bar */}
        {invoice.paidAmount > 0 && invoice.balanceDue > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{paymentPercent.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${paymentPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Record Payment Button */}
        {invoice.balanceDue > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/20">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Record Payment
          </h3>
          <Form method="post" className="mt-4 space-y-4">
            <input type="hidden" name="intent" value="record-payment" />
            <input type="hidden" name="invoiceId" value={invoice.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    max={invoice.balanceDue}
                    step="0.01"
                    defaultValue={invoice.balanceDue}
                    className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="method"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                >
                  <option value="Check">Check</option>
                  <option value="Wire">Wire Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="ACH">ACH</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reference/Check Number
                </label>
                <input
                  type="text"
                  name="reference"
                  placeholder="Check #, transaction ID, etc."
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Optional payment notes"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                style={{ backgroundColor: theme.surface.elevated, borderColor: theme.border.default, color: theme.text.primary }}
                className="rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: theme.status.success.bg, color: theme.text.inverse }}
                className="rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
              >
                Record Payment
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Invoice Preview */}
      <InvoicePreview invoice={invoice} />
    </div>
  );
};
