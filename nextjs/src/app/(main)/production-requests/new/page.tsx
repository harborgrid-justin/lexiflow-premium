/**
 * New Production Request Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Production Request | Discovery | LexiFlow',
  description: 'Create a new request for production of documents',
};

export default function NewProductionRequestPage() {
  return (
    <>
      <PageHeader
        title="New Request for Production"
        description="Draft a demand for documents or inspection"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Production Requests', href: '/production-requests' },
          { label: 'New Request' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Request Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Plaintiff's First Request for Production of Documents"
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
                      Propounding Party
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
                      Responding Party
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
                    Requested Items / Categories
                  </label>
                  <textarea
                    name="requests"
                    rows={8}
                    placeholder="List the categories of documents or ESI requested..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/production-requests">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Requests
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
