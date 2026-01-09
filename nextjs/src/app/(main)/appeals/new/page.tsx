/**
 * File New Appeal Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'File Appeal | Appeals | LexiFlow',
  description: 'File a new appeal for a case',
};

export default function NewAppealPage() {
  return (
    <>
      <PageHeader
        title="File Appeal"
        description="Initiate a new appeal process"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Litigation', href: '/litigation-strategy' },
          { label: 'Appeals', href: '/appeals' },
          { label: 'File Appeal' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                {/* Case Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Original Case <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="caseId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select case...</option>
                    <option value="case1">Pending Case Selection</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Appellate Court <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="court"
                      required
                      placeholder="e.g. 9th Circuit Court of Appeals"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Docket Number
                    </label>
                    <input
                      type="text"
                      name="docketNumber"
                      placeholder="Appellate Docket No."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Filing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="filingDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="notice_filed">Notice Filed</option>
                      <option value="briefing">Briefing Stage</option>
                      <option value="oral_argument">Oral Argument</option>
                      <option value="submitted">Submitted</option>
                      <option value="decided">Decided</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Issues on Appeal
                  </label>
                  <textarea
                    name="issues"
                    rows={4}
                    placeholder="Summary of legal issues..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/appeals">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Appeal
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
