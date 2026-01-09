/**
 * New Workflow Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Workflow | Automation | LexiFlow',
  description: 'Design a new automated workflow',
};

export default function NewWorkflowPage() {
  return (
    <>
      <PageHeader
        title="Create Workflow"
        description="Design a new automation sequence"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Automation', href: '/workflows' },
          { label: 'New Workflow' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Workflow Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. New Client Onboarding, Case Closing Protocol"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Trigger Event <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="trigger"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="manual">Manual Start</option>
                      <option value="case_created">Case Created</option>
                      <option value="case_closed">Case Closed</option>
                      <option value="document_added">Document Added</option>
                      <option value="task_completed">Task Completed</option>
                      <option value="schedule">Scheduled Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="administrative">Administrative</option>
                      <option value="legal_process">Legal Process</option>
                      <option value="billing">Billing</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Describe what this workflow accomplishes..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Workflow Steps</h3>
                    <Button type="button" size="sm" variant="secondary">Add Step</Button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Play className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No steps defined yet. Save to open the visual designer.</p>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/workflows">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save & Design
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
