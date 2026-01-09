/**
 * New Custodian Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, UserCheck } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Custodian | Discovery | LexiFlow',
  description: 'Add a new data custodian for legal hold',
};

export default function NewCustodianPage() {
  return (
    <>
      <PageHeader
        title="Add Data Custodian"
        description="Identify an individual or system possessing potentially relevant ESI"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Custodians', href: '/custodians' },
          { label: 'New Custodian' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full Name"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Title / Role
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-9 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="active">Active Employee</option>
                      <option value="terminated">Terminated / Ex-Employee</option>
                      <option value="leave">On Leave</option>
                      <option value="contractor">Contractor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Relevant Data Sources
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="source_email" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm">Corporate Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="source_harddrive" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm">Laptop / Hard Drive</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="source_phone" className="rounded border-slate-300" />
                      <span className="text-sm">Mobile Device</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="source_cloud" className="rounded border-slate-300" />
                      <span className="text-sm">OneDrive / Cloud Storage</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="source_slack" className="rounded border-slate-300" />
                      <span className="text-sm">Slack / Teams</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Specific details about this custodian's involvement..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="flex items-start space-x-2">
                    <input type="checkbox" name="issueHold" defaultChecked className="mt-1 rounded border-slate-300" />
                    <div>
                      <span className="text-sm font-medium">Issue Legal Hold Notice Immediately</span>
                      <p className="text-xs text-slate-500">System will send standard preservation notice via email.</p>
                    </div>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/custodians">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Add Custodian
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
