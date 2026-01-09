/**
 * New Practice Area Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Layers, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Practice Area | Admin | LexiFlow',
  description: 'Configure a new legal practice area',
};

export default function NewPracticeAreaPage() {
  return (
    <>
      <PageHeader
        title="Add Practice Area"
        description="Define a new area of law and its default workflows"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Practice Areas', href: '/practice-areas' },
          { label: 'New Area' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Area Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Intellectual Property Litigation"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Code / Abbreviation
                  </label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. IPLIT"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Default Lead Attorney (Optional)
                  </label>
                  <select
                    name="defaultLead"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">None</option>
                    <option value="user1">Partner A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Workflows to Enable
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="wf_discovery" className="rounded border-slate-300" />
                      <span className="text-sm">Discovery Engine</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="wf_courtdates" className="rounded border-slate-300" />
                      <span className="text-sm">Court Docketing</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="wf_immigration" className="rounded border-slate-300" />
                      <span className="text-sm">Immigration Forms</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="wf_realestate" className="rounded border-slate-300" />
                      <span className="text-sm">Closing Disclosures</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/practice-areas">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Practice Area
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
