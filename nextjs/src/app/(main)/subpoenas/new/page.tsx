/**
 * Issue Subpoena Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Issue Subpoena | Subpoenas | LexiFlow',
  description: 'Draft and track a new subpoena',
};

export default function NewSubpoenaPage() {
  return (
    <>
      <PageHeader
        title="Issue Subpoena"
        description="Draft and track a new subpoena"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Subpoenas', href: '/subpoenas' },
          { label: 'Issue Subpoena' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                {/* Case Link */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Case <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="caseId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select case...</option>
                    <option value="case1">Pending Case Selection Implementation</option>
                  </select>
                </div>

                {/* Recipient Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Recipient (Target) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipient"
                    required
                    placeholder="Person or Entity Name"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subpoena Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="testimony">Ad Testificandum (Testimony)</option>
                      <option value="documents">Duces Tecum (Documents)</option>
                      <option value="testimony_documents">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Service Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceMethod"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="process_server">Process Server</option>
                      <option value="certified_mail">Certified Mail</option>
                      <option value="sheriff">Sheriff / Marshal</option>
                      <option value="email">Email (if agreed)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Issuance Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Return / Response Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Requested Documents / Topics
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="List documents or testimony topics..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/subpoenas">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Issue Subpoena
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
