/**
 * New Citation Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Citation | Legal Research | LexiFlow',
  description: 'Add a legal citation to the research database',
};

export default function NewCitationPage() {
  return (
    <>
      <PageHeader
        title="Add Citation"
        description="Record a case law or statute citation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Legal Research', href: '/legal-research' },
          { label: 'Citations', href: '/citations' },
          { label: 'Add Citation' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Citation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="citation"
                    required
                    placeholder="e.g. Marbury v. Madison, 5 U.S. 137"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Case Name / Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Marbury v. Madison"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Court / Jurisdiction
                    </label>
                    <input
                      type="text"
                      name="court"
                      placeholder="e.g. U.S. Supreme Court"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date / Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      placeholder="1803"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status (Shepard&apos;s)
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="good">Good Law</option>
                      <option value="caution">Caution / Distinguished</option>
                      <option value="negative">Negative Treatment</option>
                      <option value="overruled">Overruled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source Link (Westlaw / Lexis / Public)
                  </label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Abstract / Summary
                  </label>
                  <textarea
                    name="summary"
                    rows={4}
                    placeholder="Brief summary of the holding..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/citations">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Citation
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
