/**
 * New Trust Transaction Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Transaction | Trust Ledger | LexiFlow',
  description: 'Record a deposit or disbursement from the trust account',
};

export default function NewTrustTransactionPage() {
  return (
    <>
      <PageHeader
        title="Record Trust Transaction"
        description="Log a deposit or disbursement for IOLTA compliance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Trust Ledger', href: '/trust-ledger' },
          { label: 'New Transaction' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="type" value="deposit" defaultChecked className="text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Deposit (Credit)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="type" value="disbursement" className="text-red-600 focus:ring-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-400">Disbursement (Debit)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client / Matter <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="matterId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select client matter...</option>
                    <option value="matter1">Smith v. Jones (23-CV-101)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        className="w-full pl-7 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="refNumber"
                      placeholder="Check #, Wire ID, etc."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Method
                    </label>
                    <select
                      name="method"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="check">Check</option>
                      <option value="wire">Wire Transfer</option>
                      <option value="ach">ACH</option>
                      <option value="cash">Cash</option>
                      <option value="cc">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payee / Payer
                  </label>
                  <input
                    type="text"
                    name="party"
                    placeholder="Who paid or was paid?"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Memo
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    required
                    placeholder="Purpose of transaction..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="cleared" className="rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction has cleared bank</span>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/trust-ledger">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Record Transaction
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
