/**
 * New Rate Table Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Rate Table | Billing | LexiFlow',
  description: 'Create a new billing rate schedule',
};

export default function NewRateTablePage() {
  return (
    <>
      <PageHeader
        title="Create Rate Table"
        description="Define a new standard or client-specific fee schedule"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rate Tables', href: '/rate-tables' },
          { label: 'New Table' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Table Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. 2024 Standard Rates"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      name="effectiveDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-3 border-b pb-2">Rate Definitions</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-900 p-2 rounded">
                      <div className="col-span-5 text-sm font-medium text-slate-500">Role / Position</div>
                      <div className="col-span-3 text-sm font-medium text-slate-500">Standard Rate</div>
                      <div className="col-span-4 text-sm font-medium text-slate-500">Custom Rate</div>
                    </div>

                    {/* Partner Row */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 text-sm">Senior Partner</div>
                      <div className="col-span-3 text-sm text-slate-500">$850.00 / hr</div>
                      <div className="col-span-4">
                        <input type="number" placeholder="850.00" className="w-full px-2 py-1 border rounded text-right" />
                      </div>
                    </div>

                    {/* Associate Row */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 text-sm">Senior Associate</div>
                      <div className="col-span-3 text-sm text-slate-500">$550.00 / hr</div>
                      <div className="col-span-4">
                        <input type="number" placeholder="550.00" className="w-full px-2 py-1 border rounded text-right" />
                      </div>
                    </div>

                    {/* Paralegal Row */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 text-sm">Paralegal</div>
                      <div className="col-span-3 text-sm text-slate-500">$250.00 / hr</div>
                      <div className="col-span-4">
                        <input type="number" placeholder="250.00" className="w-full px-2 py-1 border rounded text-right" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 max-w-xs"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/rate-tables">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Rate Table
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
