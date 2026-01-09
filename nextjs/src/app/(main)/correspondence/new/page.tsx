/**
 * New Correspondence Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log Correspondence | Correspondence | LexiFlow',
  description: 'Log or draft new legal correspondence',
};

export default function NewCorrespondencePage() {
  return (
    <>
      <PageHeader
        title="Log Correspondence"
        description="Record incoming or outgoing communication"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Communications', href: '/correspondence' },
          { label: 'New Record' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="direction" value="outgoing" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                    <span className="font-medium">Outgoing</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="direction" value="incoming" className="text-blue-600 focus:ring-blue-500" />
                    <span className="font-medium">Incoming</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Demand Letter re: Breach of Contract"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Method
                    </label>
                    <select
                      name="method"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="email">Email</option>
                      <option value="letter">Letter (USPS)</option>
                      <option value="certified">Certified Mail</option>
                      <option value="courier">Courier / FedEx</option>
                      <option value="fax">Fax</option>
                      <option value="phone">Phone Call Log</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Case
                  </label>
                  <select
                    name="caseId"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select case...</option>
                    <option value="case1">Pending Case Selection</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      From (Sender)
                    </label>
                    <input
                      type="text"
                      name="sender"
                      placeholder="Name or Email"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      To (Recipient)
                    </label>
                    <input
                      type="text"
                      name="recipient"
                      placeholder="Name or Email"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Content / Notes
                  </label>
                  <textarea
                    name="content"
                    rows={6}
                    placeholder="Body of the message or summary of the call..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/correspondence">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" icon={<Save className="h-4 w-4" />}>
                Save Draft
              </Button>
              <Button type="submit" icon={<Send className="h-4 w-4" />}>
                Save Log
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
