/**
 * New Corporate Entity Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Entity | Corporate | LexiFlow',
  description: 'Register a new corporate entity or subsidiary',
};

export default function NewEntityPage() {
  return (
    <>
      <PageHeader
        title="Add Corporate Entity"
        description="Register a new managed entity or subsidiary"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Entity Director', href: '/entity-director' },
          { label: 'New Entity' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Acme Holdings, LLC"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Structure Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="llc">LLC (Limited Liability Co.)</option>
                      <option value="c_corp">C-Corporation</option>
                      <option value="s_corp">S-Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="non_profit">Non-Profit (501c3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction of Inc.
                    </label>
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="e.g. Delaware"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      EIN / Tax ID
                    </label>
                    <input
                      type="text"
                      name="ein"
                      placeholder="XX-XXXXXXX"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date of Formation
                    </label>
                    <input
                      type="date"
                      name="formationDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Registered Agent
                  </label>
                  <input
                    type="text"
                    name="agent"
                    placeholder="Name and Address"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/entity-director">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Building2 className="h-4 w-4" />}>
              Register Entity
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
