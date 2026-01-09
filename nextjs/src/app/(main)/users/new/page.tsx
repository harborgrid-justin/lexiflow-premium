/**
 * Invite User Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Send } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invite User | Users | LexiFlow',
  description: 'Invite a new user to the firm workspace',
};

export default function NewUserPage() {
  return (
    <>
      <PageHeader
        title="Invite User"
        description="Add a new member to the firm"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Users', href: '/users' },
          { label: 'Invite' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="attorney@firm.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="attorney">Attorney</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="partner">Partner</option>
                      <option value="admin">Administrator</option>
                      <option value="staff">Support Staff</option>
                    </select>
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                       <option value="litigation">Litigation</option>
                       <option value="corporate">Corporate</option>
                       <option value="ip">Intellectual Property</option>
                       <option value="family">Family Law</option>
                       <option value="admin">Administration</option>
                    </select>
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Permissions
                  </label>
                  <div className="space-y-2">
                       <label className="flex items-center space-x-2">
                          <input type="checkbox" name="permissions" value="billing" className="rounded border-slate-300" />
                          <span>Access Billing & Financials</span>
                       </label>
                       <label className="flex items-center space-x-2">
                          <input type="checkbox" name="permissions" value="admin" className="rounded border-slate-300" />
                          <span>System Administration (Settings)</span>
                       </label>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/users">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Send className="h-4 w-4" />}>
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
