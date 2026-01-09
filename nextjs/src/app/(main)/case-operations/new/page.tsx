/**
 * New Case Operation Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Operation | Operations | LexiFlow',
  description: 'Create a new automated workflow or case operation rule',
};

export default function NewCaseOperationPage() {
  return (
    <>
      <PageHeader
        title="New Operation"
        description="Define an automated workflow or operational rule"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations', href: '/case-operations' },
          { label: 'New Rule' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Auto-Assign Discovery Tasks"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trigger Event
                  </label>
                  <select
                    name="trigger"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="case_created">Case Created</option>
                    <option value="status_change">Status Changed</option>
                    <option value="doc_uploaded">Document Uploaded</option>
                    <option value="docket_update">Docket Updated (PACER)</option>
                    <option value="deadline_approaching">Deadline Approaching</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Practice Area
                    </label>
                    <select
                      name="practice_area"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="all">Global (All Cases)</option>
                      <option value="litigation">Civil Litigation</option>
                      <option value="corporate">Corporate</option>
                      <option value="family">Family Law</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Action Type
                    </label>
                    <select
                      name="action_type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="create_task">Create Task</option>
                      <option value="send_email">Send Email Notification</option>
                      <option value="apply_tag">Apply Tag</option>
                      <option value="generate_doc">Generate Document</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Action Configuration (JSON)
                  </label>
                  <textarea
                    name="config"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm"
                    placeholder='{ "assignee": "paralegal", "priority": "high" }'
                  />
                  <p className="text-xs text-slate-500 mt-1">Define parameters for the selected action.</p>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/case-operations">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Operation
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
