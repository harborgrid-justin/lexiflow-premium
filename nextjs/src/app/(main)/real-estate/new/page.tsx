/**
 * New Real Estate Matter Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Home, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Property | Real Estate | LexiFlow',
  description: 'Open a new real estate transaction or property file',
};

export default function NewPropertyPage() {
  return (
    <>
      <PageHeader
        title="New Real Estate Matter"
        description="Open a new closing, lease, or property transaction"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Real Estate', href: '/real-estate' },
          { label: 'New Property' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Property Address / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. 123 Main St, Springfield"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="closing_resid">Residential Closing</option>
                      <option value="closing_comm">Commercial Closing</option>
                      <option value="lease">Lease Negotiation</option>
                      <option value="refinance">Refinance</option>
                      <option value="title_search">Title Search Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Client Role
                    </label>
                    <select
                      name="role"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="buyer">Buyer / Tenant</option>
                      <option value="seller">Seller / Landlord</option>
                      <option value="lender">Lender</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Closing Date
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Client
                  </label>
                  <input
                    type="text"
                    name="client"
                    required
                    placeholder="Search Client..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/real-estate">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Home className="h-4 w-4" />}>
              Open File
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
