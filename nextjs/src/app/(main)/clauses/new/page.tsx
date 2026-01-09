/**
 * New Clause Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Clause | Clauses | LexiFlow',
  description: 'Add a new standard clause to the library',
};

export default function NewClausePage() {
  return (
    <>
      <PageHeader
        title="Add Clause"
        description="Create a reusable contract clause"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Drafting', href: '/drafting' },
          { label: 'Clause Library', href: '/clauses' },
          { label: 'Add Clause' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clause Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Mutual Indemnification - Pro-Customer"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="general">General</option>
                      <option value="indemnity">Indemnification</option>
                      <option value="liability">Limitation of Liability</option>
                      <option value="confidentiality">Confidentiality</option>
                      <option value="term">Term & Termination</option>
                      <option value="ip">Intellectual Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Flavor / Bias
                    </label>
                    <select
                      name="flavor"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="neutral">Neutral / Balanced</option>
                      <option value="pro_provider">Pro-Provider / Vendor</option>
                      <option value="pro_customer">Pro-Customer / Client</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clause Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    rows={8}
                    required
                    placeholder="Enter the full text of the clause..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Usage Notes / Negotiation Strategy
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="When to use this clause, fallbacks, etc."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g. saas, silicon-valley, standard"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Comma separated</p>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/clauses">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Clause
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
