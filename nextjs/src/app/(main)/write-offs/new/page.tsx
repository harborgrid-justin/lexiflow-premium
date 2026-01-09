/**
 * New Write-Off Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Eraser, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Request Write-Off | Billing | LexiFlow',
  description: 'Request a billing write-off or discount',
};

export default function NewWriteOffPage() {
  return (
    <>
      <PageHeader
        title="Request Write-Off"
        description="Submit a request to write off billable time or expenses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Write-Offs', href: '/write-offs' },
          { label: 'New Request' },
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
                      Related Invoice / Pre-Bill
                    </label>
                    <input
                      type="text"
                      name="invoice"
                      required
                      placeholder="Search Invoice..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Write-Off Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      required
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reason
                  </label>
                  <select
                    name="reason"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="client_satisfaction">Client Satisfaction / Relationship</option>
                    <option value="training">Associate Training</option>
                    <option value="error">Billing Error</option>
                    <option value="cap_exceeded">Budget Cap Exceeded</option>
                    <option value="uncollectible">Uncollectible / Bad Debt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Explanation
                  </label>
                  <textarea
                    name="explanation"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Provide details for why this amount should be written off..."
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/write-offs">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Eraser className="h-4 w-4" />}>
              Submit for Approval
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
