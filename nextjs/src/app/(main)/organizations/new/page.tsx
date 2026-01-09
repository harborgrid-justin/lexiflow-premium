/**
 * New Organization Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Organization | Organizations | LexiFlow',
  description: 'Add a new organization to the contact database',
};

export default function NewOrganizationPage() {
  return (
    <>
      <PageHeader
        title="Add Organization"
        description="Create a new organization profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Directory', href: '/directory' },
          { label: 'Organizations', href: '/organizations' },
          { label: 'New Organization' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="corporation">Corporation</option>
                      <option value="law_firm">Law Firm</option>
                      <option value="government">Government Agency</option>
                      <option value="court">Court / Tribunal</option>
                      <option value="non_profit">Non-Profit</option>
                      <option value="partner">Partner / Vendor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      placeholder="e.g. Technology, Healthcare"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">System Roles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="isClient" className="rounded border-slate-300" />
                      <span className="text-sm">Client</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="isVendor" className="rounded border-slate-300" />
                      <span className="text-sm">Vendor</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="isOpponent" className="rounded border-slate-300" />
                      <span className="text-sm">Adverse Party</span>
                    </label>
                  </div>
                </div>


              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/organizations">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Organization
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
