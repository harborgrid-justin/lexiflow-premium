/**
 * New Case Intake Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Briefcase, Plus, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Case | Case Management | LexiFlow',
  description: 'Open a new legal case or matter',
};

export default function NewCasePage() {
  return (
    <>
      <PageHeader
        title="Open New Case"
        description="Initialize a new matter, assign team, and set strategy"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'New Case' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Core Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Case Title / Style of Cause <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Smith v. Enterprise Corp."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Internal Matter Number
                      </label>
                      <input
                        type="text"
                        name="matterNumber"
                        placeholder="Auto-generated if blank"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Court Case Number
                      </label>
                      <input
                        type="text"
                        name="courtCaseNumber"
                        placeholder="e.g. 23-CV-00123"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Primary Client <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="clientId"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      >
                        <option value="">Select client...</option>
                        <option value="client1">Acme Corp</option>
                        <option value="client2">Jane Doe</option>
                      </select>
                      <Button type="button" variant="outline" icon={<Plus className="h-4 w-4" />} title="Add Client" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Practice Area
                    </label>
                    <select
                      name="practiceArea"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="litigation">Civil Litigation</option>
                      <option value="corporate">Corporate / Transactional</option>
                      <option value="family">Family Law</option>
                      <option value="criminal">Criminal Defense</option>
                      <option value="ip">Intellectual Property</option>
                      <option value="re">Real Estate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction / Court
                    </label>
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="e.g. SDNY or Cook County Circuit"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="open">Open / Active</option>
                      <option value="pending">Pending Intake</option>
                      <option value="discovery">Discovery Phase</option>
                      <option value="trial">Trial Ready</option>
                      <option value="appeal">On Appeal</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Opposing Party
                  </label>
                  <input
                    type="text"
                    name="opposingParty"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Case Description / Summary
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Brief overview of facts and claims..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Case Team</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Lead Attorney <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="leadAttorney"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      >
                        <option value="">Select...</option>
                        <option value="attorney1">Partner A</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Paralegal / Support
                      </label>
                      <select
                        name="paralegal"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      >
                        <option value="">Select...</option>
                        <option value="staff1">Staff B</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/cases">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Briefcase className="h-4 w-4" />}>
              Create Case
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
