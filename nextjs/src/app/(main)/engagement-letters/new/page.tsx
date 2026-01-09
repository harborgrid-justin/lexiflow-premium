/**
 * New Engagement Letter Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, FileSignature, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Engagement Letter | Operations | LexiFlow',
  description: 'Draft a new client engagement letter',
};

export default function NewEngagementLetterPage() {
  return (
    <>
      <PageHeader
        title="Draft Engagement Letter"
        description="Create a new legal services agreement"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Engagement Letters', href: '/engagement-letters' },
          { label: 'New Letter' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 p-4 rounded-lg flex items-center justify-between border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">AI Drafting Available</h4>
                      <p className="text-sm mt-0.5">
                        Use LexiFlow AI to generate the scope of work based on intake notes.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="bg-white dark:bg-slate-800">Use AI Assistant</Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select client...</option>
                    <option value="client1">Jane Doe</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Template
                    </label>
                    <select
                      name="template"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="standard">Standard Hourly</option>
                      <option value="contingency">Contingency Fee</option>
                      <option value="flat">Flat Fee</option>
                      <option value="limited">Limited Scope</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Matter Name
                    </label>
                    <input
                      type="text"
                      name="matterName"
                      placeholder="e.g. Purchase of 123 Main St"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scope of Services
                  </label>
                  <textarea
                    name="scope"
                    rows={5}
                    required
                    placeholder="We agree to represent you in connection with..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hourly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input type="number" name="rate" className="w-full pl-7 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Retainer Req.
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input type="number" name="retainer" className="w-full pl-7 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Effective Date
                    </label>
                    <input type="date" name="date" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exclusions (What we are NOT doing)
                  </label>
                  <textarea
                    name="exclusions"
                    rows={3}
                    placeholder="Our representation does not include appeals, tax advice..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/engagement-letters">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<FileSignature className="h-4 w-4" />}>
              Create Draft
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
