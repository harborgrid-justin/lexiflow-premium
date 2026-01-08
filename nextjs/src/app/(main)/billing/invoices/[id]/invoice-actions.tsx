'use client';

/**
 * Invoice Actions Component
 *
 * Client-side form actions for invoice operations.
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CreditCard, Check, Loader2 } from 'lucide-react';
import { invoiceFormAction, recordInvoicePayment } from '../../actions';
import type { Invoice, ActionResult, PaymentMethod } from '../../types';
import { useState, useEffect } from 'react';

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [state, formAction, isPending] = useActionState(
    invoiceFormAction,
    { success: false } as ActionResult
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="flex items-center gap-2">
      {invoice.status === 'Draft' && (
        <form action={formAction}>
          <input type="hidden" name="intent" value="send" />
          <input type="hidden" name="id" value={invoice.id} />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Invoice
          </button>
        </form>
      )}

      {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && invoice.balanceDue > 0 && (
        <button
          onClick={() => setShowPaymentModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <CreditCard className="h-4 w-4" />
          Record Payment
        </button>
      )}

      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {state.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
    </div>
  );
}

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
}

function PaymentModal({ invoice, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    invoiceFormAction,
    { success: false } as ActionResult
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Record Payment
        </h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Invoice {invoice.invoiceNumber} - Balance: ${invoice.balanceDue.toFixed(2)}
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="intent" value="record-payment" />
          <input type="hidden" name="invoiceId" value={invoice.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              max={invoice.balanceDue}
              defaultValue={invoice.balanceDue}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <select
              name="method"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="check">Check</option>
              <option value="wire">Wire Transfer</option>
              <option value="ach">ACH</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reference Number
            </label>
            <input
              type="text"
              name="reference"
              placeholder="Check #, Transaction ID, etc."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
