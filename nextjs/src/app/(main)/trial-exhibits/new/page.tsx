/**
 * New Exhibit Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Exhibit | Trial | LexiFlow',
  description: 'Log a new trial exhibit or evidence item',
};

export default function NewExhibitPage() {
  return (
    <>
      <PageHeader
        title="Log Trial Exhibit"
        description="Register a new exhibit for trial presentation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Trial Exhibits', href: '/trial-exhibits' },
          { label: 'New Exhibit' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Exhibit Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="number"
                      required
                      placeholder="e.g. PX-1 or DX-A"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Title / Short Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Photograph of Accident Scene"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Case / Matter
                  </label>
                  <input
                    type="text"
                    name="matter"
                    required
                    placeholder="Search for Matter..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Exhibit Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="document">Document (PDF)</option>
                      <option value="image">Image / Photo</option>
                      <option value="video">Video / Audio</option>
                      <option value="physical">Physical Object</option>
                      <option value="demonstrative">Demonstrative Aid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="proposed">Proposed / ID Only</option>
                      <option value="offered">Offered</option>
                      <option value="admitted">Admitted</option>
                      <option value="excluded">Excluded</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Digital Asset
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                    <ImageIcon className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload file</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, PNG, MP4</p>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/trial-exhibits">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Exhibit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
