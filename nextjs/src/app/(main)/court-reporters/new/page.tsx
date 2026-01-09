/**
 * New Court Reporter Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Court Reporter | Court Reporters | LexiFlow',
  description: 'Add a court reporter or agency to the directory',
};

export default function NewCourtReporterPage() {
  return (
    <>
      <PageHeader
        title="Add Court Reporter"
        description="Register a new reporter or reporting agency"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Directory', href: '/directory' },
          { label: 'Court Reporters', href: '/court-reporters' },
          { label: 'New Reporter' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name or Agency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Jane Doe or Apex Reporting Services"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="individual">Individual Reporter</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Service Area
                    </label>
                    <input
                      type="text"
                      name="serviceArea"
                      placeholder="e.g. New York Metro"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="scheduling@example.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Available Services
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="services" value="stenography" className="rounded border-slate-300" />
                      <span>Real-time Stenography</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="services" value="video" className="rounded border-slate-300" />
                      <span>Legal Videography</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="services" value="transcription" className="rounded border-slate-300" />
                      <span>Expedited Transcription</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="services" value="conference" className="rounded border-slate-300" />
                      <span>Conference Room Facilities</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Rates
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Rate sheet or special instructions..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/court-reporters">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Reporter
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
