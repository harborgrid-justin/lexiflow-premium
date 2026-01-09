/**
 * New Deadline / Docket Event Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Deadline | Docket | LexiFlow',
  description: 'Add a new deadline or docket event',
};

export default function NewDeadlinePage() {
  return (
    <>
      <PageHeader
        title="Add Deadline"
        description="Schedule a new court deadline, filing due date, or limitation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Docket & Deadlines', href: '/deadlines' },
          { label: 'New Entry' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 p-3 rounded-md text-sm mb-4 border border-amber-200 dark:border-amber-800">
                  Calculated dates will automatically adjust if the trigger date changes.
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Answer to Complaint Due"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Case <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="caseId"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select case...</option>
                      <option value="case1">Smith v. Jones</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="filing">Filing Deadline</option>
                      <option value="hearing">Court Hearing</option>
                      <option value="sol">Statute of Limitations</option>
                      <option value="discovery">Discovery Deadline</option>
                      <option value="internal">Internal Milestone</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      name="dueTime"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assignee
                  </label>
                  <select
                    name="assigneeId"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Specific Attorney or Staff...</option>
                    <option value="user1">John Doe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input type="radio" name="priority" value="normal" defaultChecked className="text-blue-600" />
                      <span className="ml-2">Normal</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="priority" value="high" className="text-red-600" />
                      <span className="ml-2 text-red-600 font-medium">High</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="priority" value="critical" className="text-purple-600" />
                      <span className="ml-2 text-purple-600 font-bold">Critical (Jurisdictional)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Notes
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Reminders
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm">1 day before</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm">1 week before</span>
                    </label>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/deadlines">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Deadline
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
