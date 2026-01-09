/**
 * New Conflict Check Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Play, Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Run Conflict Check | Conflicts | LexiFlow',
  description: 'Initiate a new conflict of interest check',
};

export default function NewConflictCheckPage() {
  return (
    <>
      <PageHeader
        title="Run Conflict Check"
        description="Search for potential conflicts of interest"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations', href: '/operations' },
          { label: 'Conflict Checks', href: '/conflicts' },
          { label: 'New Check' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Search Subject (Client / Party Name) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="query"
                      required
                      placeholder="Enter name to check..."
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                    <Button type="button" variant="secondary" icon={<Search className="h-4 w-4" />}>
                      Test Search
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Matter (Optional)
                    </label>
                    <select
                      name="matterId"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">-- General / New Client --</option>
                      <option value="matter1">Pending Matter Selection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Requester
                    </label>
                    <input
                      type="text"
                      name="requester"
                      defaultValue="Current User"
                      readOnly
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Search Scope
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="checkClients" name="scope" value="clients" defaultChecked className="rounded border-slate-300" />
                      <label htmlFor="checkClients">Active & Past Clients</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="checkParties" name="scope" value="parties" defaultChecked className="rounded border-slate-300" />
                      <label htmlFor="checkParties">Adverse Parties</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="checkDeclined" name="scope" value="declined" className="rounded border-slate-300" />
                      <label htmlFor="checkDeclined">Declined Representations</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Context for this conflict check..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/conflicts">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Play className="h-4 w-4" />}>
              Run Full Check
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
