/**
 * New Interrogatories Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Draft Interrogatories | Discovery | LexiFlow',
  description: 'Create a new set of interrogatories',
};

export default function NewInterrogatoriesPage() {
  return (
    <>
      <PageHeader
        title="Draft Interrogatories"
        description="Create a new set of written questions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Interrogatories', href: '/interrogatories' },
          { label: 'New Set' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Set Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Plaintiff's First Set of Interrogatories to Defendant"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Case <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="caseId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select case...</option>
                    <option value="case1">Pending Case Selection</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Propounding Party (From)
                    </label>
                    <select
                      name="propoundingParty"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="plaintiff">Plaintiff (Us)</option>
                      <option value="defendant">Defendant (Opposing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Responding Party (To)
                    </label>
                    <select
                      name="respondingParty"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="defendant">Defendant (Opposing)</option>
                      <option value="plaintiff">Plaintiff (Us)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Service Date
                    </label>
                    <input
                      type="date"
                      name="serviceDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Response Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Questions / Content
                  </label>
                  <textarea
                    name="questions"
                    rows={8}
                    placeholder="Enter interrogatories here, numbered..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    You can also generate questions from AI templates later.
                  </p>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/interrogatories">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Draft
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
