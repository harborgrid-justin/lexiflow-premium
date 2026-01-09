/**
 * New Jurisdiction Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Globe, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Jurisdiction | Admin | LexiFlow',
  description: 'Add a new court jurisdiction or venue',
};

export default function NewJurisdictionPage() {
  return (
    <>
      <PageHeader
        title="Add Jurisdiction"
        description="Configure a new court system or venue for docketing"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jurisdictions', href: '/jurisdictions' },
          { label: 'New Venue' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jurisdiction Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. U.S. District Court, SDNY"
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
                      <option value="federal">Federal District Court</option>
                      <option value="state_supreme">State Supreme/Superior</option>
                      <option value="state_circuit">State Circuit/County</option>
                      <option value="appellate">Appellate Court</option>
                      <option value="admin">Administrative Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      name="region"
                      placeholder="e.g. NY or Federal"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Court Rules Set (Deadlines)
                  </label>
                  <select
                    name="ruleset"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="frcp">Federal Rules of Civil Procedure (FRCP)</option>
                    <option value="ny_cplr">New York CPLR</option>
                    <option value="ca_ccp">California CCP</option>
                    <option value="custom">Custom / Manual Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    E-Filing Integration
                  </label>
                  <select
                    name="efiling"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="none">None / Manual</option>
                    <option value="pacer">PACER / CM/ECF</option>
                    <option value="nyscef">NYSCEF</option>
                  </select>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/jurisdictions">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Add Jurisdiction
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
