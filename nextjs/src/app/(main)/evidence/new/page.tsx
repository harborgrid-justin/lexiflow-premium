/**
 * Add Evidence Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log Evidence | Evidence | LexiFlow',
  description: 'Log new evidence into chain of custody',
};

export default function NewEvidencePage() {
  return (
    <>
      <PageHeader
        title="Log Evidence"
        description="Log new physical or digital evidence"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Evidence', href: '/evidence' },
          { label: 'Log Evidence' },
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

                {/* Evidence Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="e.g. Hard Drive S/N 123456, Box of Documents"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Evidence Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="physical">Physical Document</option>
                      <option value="electronic">Electronic / Digital</option>
                      <option value="device">Hardware Device</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Current Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="collected">Collected</option>
                      <option value="processing">In Processing</option>
                      <option value="review">In Review</option>
                      <option value="archived">Archived</option>
                      <option value="destroyed">Destructed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Custodian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="custodian"
                      required
                      placeholder="Person who possessed item"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Evidence Room A, Shelf 2 or S3 Bucket"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Chain of Custody Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/evidence">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Log Evidence
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
