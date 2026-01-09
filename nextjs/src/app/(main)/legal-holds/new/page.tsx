/**
 * New Legal Hold Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Issue Legal Hold | Legal Holds | LexiFlow',
  description: 'Issue a new legal hold for preservation',
};

export default function NewLegalHoldPage() {
  return (
    <>
      <PageHeader
        title="Issue Legal Hold"
        description="Create and distribute a preservation notice"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Litigation', href: '/litigation-strategy' },
          { label: 'Legal Holds', href: '/legal-holds' },
          { label: 'New Hold' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hold Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Acme Corp Litigation Hold"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Case/Matter <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="caseId"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select matter...</option>
                      <option value="matter1">Pending Case Selection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hold Scope / Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="scope"
                    rows={4}
                    required
                    placeholder="Describe the types of documents and data to be preserved..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Custodians (Email addresses)
                  </label>
                  <input
                    type="text"
                    name="custodians"
                    placeholder="e.g. employee1@example.com, employee2@example.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple emails with commas</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sendNotification" name="sendNotification" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="sendNotification" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Send notification emails immediately
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="requireAck" name="requireAck" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <label htmlFor="requireAck" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Require custodian acknowledgement
                    </label>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/legal-holds">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Issue Hold
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
