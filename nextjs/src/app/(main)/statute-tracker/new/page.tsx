/**
 * New Statute Tracker Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { AlarmClock, ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Track Statute | Statutes | LexiFlow',
  description: 'Add a new statute of limitations deadline to track',
};

export default function NewStatutePage() {
  return (
    <>
      <PageHeader
        title="Track Statute of Limitations"
        description="Monitor a critical filling deadline or SOL"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Statute Tracker', href: '/statute-tracker' },
          { label: 'New Tracker' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Matter / Case <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="matter"
                    required
                    placeholder="Search Matter..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Cause of Action
                    </label>
                    <select
                      name="cause"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="negligence">Negligence (Personal Injury)</option>
                      <option value="contract">Breach of Contract</option>
                      <option value="fraud">Fraud</option>
                      <option value="med_mal">Medical Malpractice</option>
                      <option value="libel">Libel / Slander</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction
                    </label>
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="e.g. New York State"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Incident Date
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      SOL Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      required
                      className="w-full px-3 py-2 border border-red-300 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20 text-slate-900 dark:text-slate-50 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Tolling Exceptions
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Describe any tolling agreements or special circumstances..."
                  />
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-2">
                    <AlarmClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Critical Alert Configuration</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Reminders will be sent 180, 90, 60, 30, and 7 days before the deadline to all assigned attorneys.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/statute-tracker">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Start Tracking
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
