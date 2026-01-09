/**
 * New Conflict Waiver Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, AlertTriangle, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Waiver | Conflict Check | LexiFlow',
  description: 'Generate a conflict of interest waiver',
};

export default function NewConflictWaiverPage() {
  return (
    <>
      <PageHeader
        title="Draft Conflict Waiver"
        description="Create a waiver for potential conflicts of interest"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Conflicts', href: '/conflict-alerts' },
          { label: 'New Waiver' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 p-4 rounded-lg flex items-start gap-3 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Ethics Alert</h4>
                    <p className="text-sm mt-1">
                      Ensure full disclosure of the nature of the conflict and the risks involved. Review Rule 1.7 (Conflict of Interest: Current Clients).
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Primary Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select client...</option>
                    <option value="client1">Corp A Inc.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Other Party (Conflict Source) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherParty"
                    placeholder="Name of opposing party or other client involved..."
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Waiver Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="joint">Joint Representation</option>
                      <option value="former">Former Client Adverse to Current</option>
                      <option value="current">Direct Adversity</option>
                      <option value="personal">Personal Interest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date Identified
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description of Conflict & Risks
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    required
                    placeholder="Describe why this is conflicting and the potential risks to the client (e.g., divided loyalty, limits on privilege)..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conditions of Waiver
                  </label>
                  <textarea
                    name="conditions"
                    rows={3}
                    placeholder="e.g. Ethical wall will be erected, separate teams..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/conflict-alerts">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary">
                Preview PDF
              </Button>
              <Button type="submit" icon={<Send className="h-4 w-4" />}>
                Create & Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
