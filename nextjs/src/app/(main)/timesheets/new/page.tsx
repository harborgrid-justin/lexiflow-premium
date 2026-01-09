/**
 * New Time Entry Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log Time | Billing | LexiFlow',
  description: 'Log billable or non-billable time',
};

export default function NewTimeEntryPage() {
  return (
    <>
      <PageHeader
        title="Log Time Entry"
        description="Record hours worked for client billing"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Timesheets', href: '/timesheets' },
          { label: 'New Entry' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                 <div className="flex justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
                      <div className="text-center">
                          <span className="block text-sm font-medium text-slate-500 mb-2">Timer Duration</span>
                          <div className="text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">00:00:00</div>
                          <div className="mt-3 flex gap-2 justify-center">
                              <Button size="sm" variant="outline">Start Timer</Button>
                              <Button size="sm" variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">Stop</Button>
                          </div>
                      </div>
                 </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Matter <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="matterId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select case or matter...</option>
                    <option value="case1">Smith v. Jones</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="hours"
                      step="0.1"
                      required
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      name="rate"
                      defaultValue="450.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Activity Code (UTBMS)
                  </label>
                  <select
                    name="activityCode"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="l110">L110 - Case Assessment</option>
                    <option value="l120">L120 - Analysis/Strategy</option>
                    <option value="a100">A100 - Activities</option>
                  </select>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Describe work performed..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                  <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs py-1 h-auto">Call with Client</Button>
                      <Button size="sm" variant="outline" className="text-xs py-1 h-auto">Draft Pleading</Button>
                      <Button size="sm" variant="outline" className="text-xs py-1 h-auto">Court Appearance</Button>
                  </div>
                </div>

                 <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="billable" defaultChecked className="rounded border-slate-300" />
                        <span className="text-sm font-medium">Billable</span>
                    </label>
                     <label className="flex items-center space-x-2">
                        <input type="checkbox" name="noCharge" className="rounded border-slate-300" />
                        <span className="text-sm font-medium">No Charge (Pro Bono)</span>
                    </label>
                 </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/timesheets">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Entry
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
