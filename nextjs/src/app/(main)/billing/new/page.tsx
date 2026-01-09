/**
 * New Invoice / Bill Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, DollarSign, FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Invoice | Billing | LexiFlow',
  description: 'Generate a new client invoice',
};

export default function NewInvoicePage() {
  return (
    <>
      <PageHeader
        title="Create Invoice"
        description="Generate a bill for services and expenses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Billing', href: '/billing' },
          { label: 'New Invoice' },
        ]}
      />

      <div className="max-w-5xl">
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardBody>
                  <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Draft Invoice</h3>
                      <p className="text-sm text-slate-500"># DRAFT-NEW</p>
                    </div>
                    <div className="text-right">
                      <label className="block text-xs uppercase text-slate-500 mb-1">Issue Date</label>
                      <input type="date" className="text-sm border rounded p-1 mb-2 block" defaultValue={new Date().toISOString().split('T')[0]} />
                      <label className="block text-xs uppercase text-slate-500 mb-1">Due Date</label>
                      <input type="date" className="text-sm border rounded p-1 block" />
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Client / Matter <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="matterId"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      >
                        <option value="">Select matter to load unbilled time...</option>
                        <option value="case1">Smith v. Jones (23-CV-101)</option>
                      </select>
                    </div>
                  </div>

                  {/* Placeholder for Dynamic Line Items */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                        <tr>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2 w-20">Hrs/Qty</th>
                          <th className="px-4 py-2 w-24">Rate</th>
                          <th className="px-4 py-2 w-24 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 py-3 text-slate-500 text-center italic" colSpan={4}>
                            Select a matter to load billable items
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 flex justify-center">
                      <Button type="button" variant="ghost" size="sm" icon={<DollarSign className="w-3 h-3" />}>Add Custom Line Item</Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Memo to Client
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Thank you for your business..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>

                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardBody title="Summary">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Services</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-$0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tax</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>$0.00</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-blue-800 dark:text-blue-200 text-xs mt-4">
                      Trust Balance Available: <span className="font-bold">$0.00</span>
                      <div className="mt-1">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Apply Trust Funds</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button type="submit" className="w-full" icon={<FileText className="w-4 h-4" />}>Generate Draft</Button>
                    <Link href="/billing">
                      <Button type="button" variant="outline" className="w-full">Cancel</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}
