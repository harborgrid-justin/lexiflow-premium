/**
 * New Compliance Audit Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Play, ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Audit | Compliance | LexiFlow',
  description: 'Initiate a new compliance audit or conflict check',
};

export default function NewComplianceAuditPage() {
  return (
    <>
      <PageHeader
        title="Run Compliance Audit"
        description="Initiate a new manual compliance scan or conflict check"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Compliance', href: '/compliance' },
          { label: 'New Audit' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Audit Name / Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Q4 Trust Account Review"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Audit Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="conflict_check">Conflict Check</option>
                      <option value="trust_account">IOLTA / Trust Account</option>
                      <option value="data_retention">Data Retention / Privacy</option>
                      <option value="kyc">KYC / Client Intake</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Entity
                    </label>
                    <input
                      type="text"
                      name="target"
                      placeholder="e.g. Client Name or Account ID"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scope of Review
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="scope" value="firm_wide" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Firm Wide</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="scope" value="specific_matter" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Specific Matter Only</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="Enter any specific instructions or context for this audit..."
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/compliance">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Play className="h-4 w-4" size={16} />}>
              Start Audit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
