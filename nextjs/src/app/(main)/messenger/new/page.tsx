/**
 * New Message / Chat Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Message | Messenger | LexiFlow',
  description: 'Send a secure message to a client or team member',
};

export default function NewMessagePage() {
  return (
    <>
      <PageHeader
        title="Compose Message"
        description="Send a secure message via the client portal or internal chat"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Messenger', href: '/messenger' },
          { label: 'Compose' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    To: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipients"
                    required
                    placeholder="Search client or staff name..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Matter (Optional)
                  </label>
                  <select
                    name="matterId"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">General Communication</option>
                    <option value="case1">Smith v. Jones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="body"
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="secure" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send Encrypted (Portal Only)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/messenger">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Send className="h-4 w-4" />}>
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
