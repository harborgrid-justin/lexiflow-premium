'use client';

/**
 * Trust Account Actions Component
 *
 * Client-side actions for trust account operations including:
 * - Deposit funds
 * - Withdraw funds
 * - Reconcile account
 * - View transaction history
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckSquare,
  FileText,
  X,
} from 'lucide-react';
import { trustAccountFormAction } from '../actions';
import type { TrustAccount, ActionResult } from '../types';
import { useState, useEffect } from 'react';

interface TrustAccountActionsProps {
  account: TrustAccount;
}

export function TrustAccountActions({ account }: TrustAccountActionsProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [state, formAction, isPending] = useActionState(
    trustAccountFormAction,
    { success: false } as ActionResult
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      setShowMenu(false);
      setShowDepositModal(false);
      setShowWithdrawModal(false);
    }
  }, [state.success, router]);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {account.status === 'Active' && (
                <>
                  {/* Deposit */}
                  <button
                    onClick={() => {
                      setShowDepositModal(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
                    Record Deposit
                  </button>

                  {/* Withdraw */}
                  <button
                    onClick={() => {
                      setShowWithdrawModal(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                    Record Withdrawal
                  </button>

                  {/* Reconcile */}
                  <form action={formAction}>
                    <input type="hidden" name="intent" value="reconcile" />
                    <input type="hidden" name="accountId" value={account.id} />
                    <input
                      type="hidden"
                      name="reconciliationDate"
                      value={new Date().toISOString()}
                    />
                    <input
                      type="hidden"
                      name="bankStatementBalance"
                      value={account.balance.toString()}
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckSquare className="h-4 w-4 text-purple-500" />
                      )}
                      Reconcile
                    </button>
                  </form>
                </>
              )}

              {/* View Transactions */}
              <button
                onClick={() => {
                  router.push(`/billing/trust/${account.id}/transactions`);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                View Transactions
              </button>

              {account.status !== 'Active' && (
                <p className="px-4 py-2 text-sm text-slate-400">
                  Account is {account.status.toLowerCase()}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Deposit
              </h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="intent" value="deposit" />
              <input type="hidden" name="accountId" value={account.id} />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount
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
                    required
                    className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Retainer deposit from client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payor Name
                </label>
                <input
                  type="text"
                  name="payorName"
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Client name or payor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Check Number (optional)
                </label>
                <input
                  type="text"
                  name="checkNumber"
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Check #"
                />
              </div>

              {state.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {state.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Record Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Withdrawal
              </h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="intent" value="withdraw" />
              <input type="hidden" name="accountId" value={account.id} />

              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                Current balance: ${account.balance.toFixed(2)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount
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
                    max={account.balance}
                    required
                    className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Payment for services rendered"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payee Name
                </label>
                <input
                  type="text"
                  name="payeeName"
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purpose
                </label>
                <select
                  name="purpose"
                  required
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="payment_to_client">Payment to Client</option>
                  <option value="payment_to_vendor">Payment to Vendor</option>
                  <option value="fee_transfer">Fee Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Check Number (optional)
                </label>
                <input
                  type="text"
                  name="checkNumber"
                  className="w-full rounded-lg border border-slate-300 py-2 px-4 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Check #"
                />
              </div>

              {state.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {state.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Record Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
