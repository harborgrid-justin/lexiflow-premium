/**
 * New Approval Request Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, FileCheck, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Request Approval | Documents | LexiFlow',
  description: 'Submit a document for partner or client approval',
};

export default function NewApprovalPage() {
  return (
    <>
      <PageHeader
        title="Request Approval"
        description="Route a document for review and signature"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Approvals', href: '/document-approvals' },
          { label: 'New Request' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document to Approve <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="document"
                    required
                    placeholder="Search Document..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Approver (Internal)
                    </label>
                    <select
                      name="approver"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select Partner...</option>
                      <option value="partner1">Jane Smith (Partner)</option>
                      <option value="partner2">John Doe (Partner)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" name="client_review" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requires Client Approval (External)</span>
                  </label>
                  <div className="pl-6 text-sm text-slate-500">
                    If checked, the document will be sent to the client portal after internal approval.
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message to Approver
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Please review section 4.2 specifically..."
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/document-approvals">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Send className="h-4 w-4" />}>
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
