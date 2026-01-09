/**
 * New Legal Research Project Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Research | Legal Research | LexiFlow',
  description: 'Start a new legal research project or memo',
};

export default function NewResearchPage() {
  return (
    <>
      <PageHeader
        title="Start Research Project"
        description="Initiate a new legal research query or memo"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Legal Research', href: '/legal-research' },
          { label: 'New Project' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Research Topic / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Admissibility of Social Media Evidence"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction
                    </label>
                    <select
                      name="jurisdiction"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="federal">Federal (All Circuits)</option>
                      <option value="ca">California</option>
                      <option value="ny">New York</option>
                      <option value="tx">Texas</option>
                      <option value="fl">Florida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Matter Reference
                    </label>
                    <input
                      type="text"
                      name="matter"
                      placeholder="Search for Matter..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Primary Question / Issue
                  </label>
                  <textarea
                    name="question"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="What specific legal question are you researching?"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sources to Include</h3>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="sources" value="cases" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Case Law</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="sources" value="statutes" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Statutes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="sources" value="regulations" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Regulations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="sources" value="secondary" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Secondary Sources</span>
                    </label>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/legal-research">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Search className="h-4 w-4" />}>
              Start Research
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
