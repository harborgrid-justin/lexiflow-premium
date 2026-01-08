'use client';

/**
 * New Write-Off Request Form Component
 *
 * Client-side form for creating write-off requests.
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FileX,
  DollarSign,
  FileText,
  MessageSquare,
  Tag,
  Loader2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  writeOffFormAction,
  WRITE_OFF_CATEGORIES,
  type WriteOffCategory,
} from '../../write-off-actions';
import type { ActionResult } from '../../types';

interface PrefillData {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  balanceDue?: number;
}

interface NewWriteOffFormProps {
  prefillData: PrefillData;
}

export function NewWriteOffForm({ prefillData }: NewWriteOffFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(prefillData.balanceDue?.toString() || '');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<WriteOffCategory | ''>('');
  const [notes, setNotes] = useState('');
  const [invoiceId, setInvoiceId] = useState(prefillData.invoiceId);
  const [invoiceSearch, setInvoiceSearch] = useState(prefillData.invoiceNumber || '');

  const [state, formAction, isPending] = useActionState(
    writeOffFormAction,
    { success: false } as ActionResult
  );

  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect);
    }
  }, [state.success, state.redirect, router]);

  const amountValue = parseFloat(amount) || 0;
  const maxAmount = prefillData.balanceDue || Infinity;
  const isAmountValid = amountValue > 0 && amountValue <= maxAmount;
  const isReasonValid = reason.length >= 10;
  const isFormValid = invoiceId && isAmountValid && isReasonValid;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="intent" value="create" />
      <input type="hidden" name="invoiceId" value={invoiceId} />

      {/* Invoice Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <FileText className="h-5 w-5 text-slate-400" />
          Invoice Selection
        </h2>

        {prefillData.invoiceId ? (
          // Show pre-filled invoice info
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  {prefillData.invoiceNumber}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {prefillData.clientName}
                </p>
              </div>
              {prefillData.balanceDue !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-blue-700 dark:text-blue-400">Balance Due</p>
                  <p className="font-bold text-blue-900 dark:text-blue-200">
                    ${prefillData.balanceDue.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setInvoiceId('');
                setInvoiceSearch('');
              }}
              className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Select different invoice
            </button>
          </div>
        ) : (
          // Show invoice search
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Search Invoice <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Enter invoice number or client name..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Search for the invoice you want to write off
            </p>
            {!invoiceId && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                Please select an invoice to continue
              </p>
            )}
          </div>
        )}
      </div>

      {/* Write-Off Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-slate-400" />
          Write-Off Details
        </h2>

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Write-Off Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            {prefillData.balanceDue !== undefined && (
              <p className="mt-1 text-xs text-slate-500">
                Maximum: ${prefillData.balanceDue.toFixed(2)} (invoice balance)
              </p>
            )}
            {amount && !isAmountValid && (
              <p className="mt-1 text-xs text-red-600">
                {amountValue <= 0
                  ? 'Amount must be greater than zero'
                  : `Amount cannot exceed invoice balance of $${maxAmount.toFixed(2)}`}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Tag className="mr-1 inline h-4 w-4" />
              Category
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as WriteOffCategory | '')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select a category...</option>
              {WRITE_OFF_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <MessageSquare className="h-5 w-5 text-slate-400" />
          Reason for Write-Off
        </h2>

        <div className="space-y-4">
          {/* Main Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              rows={4}
              required
              minLength={10}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this amount should be written off..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span
                className={
                  reason.length < 10 ? 'text-amber-600' : 'text-slate-500'
                }
              >
                {reason.length < 10
                  ? `${10 - reason.length} more characters required`
                  : 'Minimum requirement met'}
              </span>
              <span className="text-slate-500">{reason.length}/1000</span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context or supporting information..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">
              Approval Required
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              This write-off request will be submitted for approval. Once approved,
              the invoice balance and accounts receivable will be adjusted accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/billing/write-offs')}
          disabled={isPending}
          className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !isFormValid}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileX className="h-4 w-4" />
              Submit Write-Off Request
            </>
          )}
        </button>
      </div>
    </form>
  );
}
