/**
 * Add ESI Source Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add ESI Source | ESI Sources | LexiFlow',
  description: 'Add a new ESI source for tracking',
};

export default function NewESISourcePage() {
  return (
    <>
      <PageHeader
        title="Add ESI Source"
        description="Track a new electronically stored information source"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'ESI Sources', href: '/esi-sources' },
          { label: 'Add Source' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                {/* Source Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. CEO Email Archive, Marketing Sharepoint"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Source Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sourceType"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select type...</option>
                      <option value="email">Email</option>
                      <option value="file_server">File Server</option>
                      <option value="database">Database</option>
                      <option value="cloud_storage">Cloud Storage</option>
                      <option value="mobile_device">Mobile Device</option>
                      <option value="social_media">Social Media</option>
                      <option value="application">Application</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="identified">Identified</option>
                      <option value="preserved">Preserved</option>
                      <option value="collected">Collected</option>
                      <option value="processed">Processed</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Custodian
                  </label>
                  <select
                    name="custodianId"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select custodian...</option>
                    <option value="cust-1">Pending implementation of custodian selector</option>
                  </select>
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location / Path
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. \\server\share\folder"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/esi-sources">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Add Source
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
