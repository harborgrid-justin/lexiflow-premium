/**
 * New Retainer Agreement Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Retainer | Billing | LexiFlow',
  description: 'Create a new client retainer agreement',
};

export default function NewRetainerPage() {
  return (
    <>
      <PageHeader
        title="New Retainer Agreement"
        description="Set up a new financial agreement with a client"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Retainers', href: '/retainers' },
          { label: 'New Agreement' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Agreement Generation</h4>
                    <p className="text-sm mt-1">
                      Saving this record will optionally generate a PDF retainer agreement for signature via Docusign integration.
                    </p>
                  </div>
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
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Lead Attorney
                    </label>
                    <select
                      name="attorneyId"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select...</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-6 mb-2">Financial Terms</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Initial Deposit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input
                        type="number"
                        name="amount"
                        placeholder="e.g. 5000.00"
                        className="w-full pl-7 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Replenish Threshold (Evergreen)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input
                        type="number"
                        name="threshold"
                        placeholder="e.g. 1500.00"
                        className="w-full pl-7 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scope of Representation
                  </label>
                  <textarea
                    name="scope"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Detailed description of legal services to be provided..."
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/retainers">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<CheckCircle className="h-4 w-4" />}>
              Create Retainer
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
