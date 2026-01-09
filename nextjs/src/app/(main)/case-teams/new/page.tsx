/**
 * Create Case Team Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Case Team | LexiFlow',
  description: 'Create a new case team assignment',
};

export default function NewCaseTeamPage() {
  return (
    <>
      <PageHeader
        title="Create Case Team"
        description="Assign team members to a case"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'Teams', href: '/case-teams' },
          { label: 'New Team' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          {/* Case Selection */}
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Case Selection
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Case <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="caseId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select a case...</option>
                    <option value="case-1">Johnson v. Smith Corp - CV-2025-001234</option>
                    <option value="case-2">Williams Estate Matter - PR-2025-000567</option>
                    <option value="case-3">ABC Corp Merger - M&A-2025-00089</option>
                    <option value="case-4">Brown Employment Dispute - EMP-2025-00456</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-1">
                    Select the case to assign team members to
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Lead Attorney */}
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Lead Attorney
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Lead Attorney <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leadAttorneyId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select lead attorney...</option>
                    <option value="att-1">John Smith - Partner, Litigation</option>
                    <option value="att-2">Jane Doe - Senior Associate, Corporate</option>
                    <option value="att-3">Michael Brown - Partner, Employment</option>
                    <option value="att-4">Sarah Williams - Associate, Real Estate</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-1">
                    The primary attorney responsible for this case
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Team Members */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Team Members
                </h3>
                <Button type="button" variant="outline" size="sm" icon={<UserPlus className="h-4 w-4" />}>
                  Add Member
                </Button>
              </div>

              {/* Member 1 */}
              <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Team Member
                    </label>
                    <select
                      name="members[0].userId"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select team member...</option>
                      <option value="user-1">Jennifer Lopez - Associate</option>
                      <option value="user-2">Robert Chen - Paralegal</option>
                      <option value="user-3">Emily Davis - Legal Assistant</option>
                      <option value="user-4">David Wilson - Associate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role on Case
                    </label>
                    <select
                      name="members[0].role"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select role...</option>
                      <option value="associate">Associate Attorney</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="legal_assistant">Legal Assistant</option>
                      <option value="reviewer">Document Reviewer</option>
                      <option value="support">Support Staff</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Responsibilities
                  </label>
                  <input
                    type="text"
                    name="members[0].responsibilities"
                    placeholder="e.g., Discovery management, Document review"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>

              {/* Member 2 */}
              <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Team Member
                    </label>
                    <select
                      name="members[1].userId"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select team member...</option>
                      <option value="user-1">Jennifer Lopez - Associate</option>
                      <option value="user-2">Robert Chen - Paralegal</option>
                      <option value="user-3">Emily Davis - Legal Assistant</option>
                      <option value="user-4">David Wilson - Associate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role on Case
                    </label>
                    <select
                      name="members[1].role"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select role...</option>
                      <option value="associate">Associate Attorney</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="legal_assistant">Legal Assistant</option>
                      <option value="reviewer">Document Reviewer</option>
                      <option value="support">Support Staff</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Responsibilities
                  </label>
                  <input
                    type="text"
                    name="members[1].responsibilities"
                    placeholder="e.g., Client communication, Court filings"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Team Settings */}
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Team Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Team Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Team Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Add any notes about this team assignment..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="notifyMembers"
                    id="notifyMembers"
                    defaultChecked
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="notifyMembers" className="text-sm text-slate-700 dark:text-slate-300">
                    Notify team members of assignment via email
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="grantAccess"
                    id="grantAccess"
                    defaultChecked
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="grantAccess" className="text-sm text-slate-700 dark:text-slate-300">
                    Automatically grant case access to team members
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Link href="/case-teams">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
