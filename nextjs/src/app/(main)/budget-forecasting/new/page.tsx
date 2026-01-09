/**
 * New Budget Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Calculator, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Budget | Forecasting | LexiFlow',
  description: 'Create a new case budget or financial forecast',
};

export default function NewBudgetPage() {
  return (
    <>
      <PageHeader
        title="Create Case Budget"
        description="Establish a financial plan or forecast for a matter"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Forecasting', href: '/budget-forecasting' },
          { label: 'New Budget' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Q1 Litigation Budget - Smith Case"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Matter
                    </label>
                    <input
                      type="text"
                      name="matter"
                      required
                      placeholder="Search for Matter..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Budget Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="fixed_fee">Fixed Fee Cap</option>
                      <option value="phase_based">Phase Based (UTBMS)</option>
                      <option value="monthly">Monthly Retainer</option>
                      <option value="estimate">Loose Estimate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Total Limit ($)
                    </label>
                    <input
                      type="number"
                      name="total"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="alert_notify" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Alert me when 80% usage reached</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/budget-forecasting">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Budget
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
