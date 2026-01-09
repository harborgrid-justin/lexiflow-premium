/**
 * New Ethical Wall Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Ban, Save, Shield } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Setup Wall | Security | LexiFlow',
  description: 'Configure a new ethical wall or information screen',
};

export default function NewEthicalWallPage() {
  return (
    <>
      <PageHeader
        title="Establish Ethical Wall"
        description="Configure an information screen to prevent conflicts of interest"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Ethical Walls', href: '/ethical-walls' },
          { label: 'New Wall' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Wall Name / Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Screen for Matter 123 vs Matter 456"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Restricted Matter
                    </label>
                    <input
                      type="text"
                      name="matter"
                      required
                      placeholder="Search Matter..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Screen
                    </label>
                    <select
                      name="reason"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="conflict">Former Client Conflict</option>
                      <option value="family">Family Relationship</option>
                      <option value="financial">Financial Interest</option>
                      <option value="witness">Attesting Witness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Restricted Individuals (Screened Out)</h3>
                  <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                    <div className="flex gap-2 mb-2 items-center">
                      <Ban className="h-4 w-4 text-red-500" />
                      <input
                        type="text"
                        placeholder="Add user to block..."
                        className="bg-transparent border-b border-red-300 dark:border-red-700 w-full focus:outline-none text-sm p-1"
                      />
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">These users will be completely blocked from accessing this matter.</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="notify" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send Notification to Screened Individuals</span>
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="audit" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Strict Audit Logging</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/ethical-walls">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Shield className="h-4 w-4" />}>
              Activate Wall
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
