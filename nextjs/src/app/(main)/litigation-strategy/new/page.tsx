/**
 * New Litigation Strategy Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Lightbulb, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Strategy | Litigation | LexiFlow',
  description: 'Create a new litigation strategy plan or case analysis',
};

export default function NewStrategyPage() {
  return (
    <>
      <PageHeader
        title="Develop Case Strategy"
        description="Outline a new strategic plan or focus for a matter"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Strategy', href: '/litigation-strategy' },
          { label: 'New Plan' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Strategy Plan Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Defense Strategy - Liability Phase"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Matter Reference <span className="text-red-500">*</span>
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
                        Core Theory of the Case
                      </label>
                      <textarea
                        name="theory"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        placeholder="The defendant was not negligent because..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Key Facts / Narratives
                      </label>
                      <textarea
                        name="facts"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        placeholder="Relevant background facts..."
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardBody>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Risk Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Probability of Success (%)
                      </label>
                      <input type="range" min="0" max="100" className="w-full" />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Exposure ($ Estimate)
                      </label>
                      <input type="number" placeholder="0.00" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800" />
                    </div>
                  </div>
                </CardBody>
              </Card>
              <div className="flex flex-col gap-3">
                <Button type="submit" icon={<Save className="h-4 w-4" />}>
                  Save Plan
                </Button>
                <Link href="/litigation-strategy" className="w-full">
                  <Button type="button" variant="ghost" className="w-full" icon={<ArrowLeft className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
