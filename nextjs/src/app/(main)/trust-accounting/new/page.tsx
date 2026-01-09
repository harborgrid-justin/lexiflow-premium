/**
 * New Trust Transaction Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, DollarSign, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Transaction | Trust Accounting | LexiFlow',
  description: 'Record a deposit or withdrawal from client trust account (IOLTA)',
};

export default function NewTrustTransactionPage() {
  return (
    <>
      <PageHeader
        title="Trust Transaction"
        description="Record a deposit or withdrawal from IOLTA/Trust"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Trust Accounting', href: '/trust-accounting' },
          { label: 'New Transaction' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium"
                    >
                      <option value="deposit">Deposit (Client Funds In)</option>
                      <option value="disbursement">Disbursement (Payment Out)</option>
                      <option value="transfer">Transfer to Operating</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        name="amount"
                        required
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Matter Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="matter"
                    required
                    placeholder="Search for Matter or Case..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Memo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="e.g. Settlement Funds from Insurance Co."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Check / Reference Number
                    </label>
                    <input
                      type="text"
                      name="ref_number"
                      placeholder="e.g. CK 12345"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/trust-accounting">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Save & Add Another
              </Button>
              <Button type="submit" icon={<Save className="h-4 w-4" />}>
                Record Transaction
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
