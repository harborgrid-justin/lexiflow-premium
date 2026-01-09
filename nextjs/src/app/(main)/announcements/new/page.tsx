/**
 * New Announcement Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Megaphone, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Post Announcement | Internal | LexiFlow',
  description: 'Create a firm-wide announcement or news post',
};

export default function NewAnnouncementPage() {
  return (
    <>
      <PageHeader
        title="Post Announcement"
        description="Share news or updates with the firm"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Announcements', href: '/announcements' },
          { label: 'New Post' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Office Closure for Holiday"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="general">General News</option>
                      <option value="hr">HR / Personnel</option>
                      <option value="it">IT / System Maintenance</option>
                      <option value="marketing">Marketing Win</option>
                      <option value="urgent">Urgent / Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="all">Entire Firm</option>
                      <option value="partners">Partners Only</option>
                      <option value="attorneys">Attorneys Only</option>
                      <option value="staff">Staff Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Type your announcement details here..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="pin" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pin to Dashboard Top</span>
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="email_notify" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send Email Notification</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/announcements">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Send className="h-4 w-4" />}>
              Post Announcement
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
