/**
 * New Intake Form Template Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, FilePlus, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Form | Intake | LexiFlow',
  description: 'Design a new client intake questionnaire or form',
};

export default function NewIntakeFormPage() {
  return (
    <>
      <PageHeader
        title="Design Intake Form"
        description="Create a new questionnaire for client intake"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Intake Forms', href: '/intake-forms' },
          { label: 'New Template' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Form Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Personal Injury Initial Screen"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description (Client Facing)
                      </label>
                      <textarea
                        name="description"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        placeholder="Please fill out this form to help us understand your case..."
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <FilePlus className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Form Builder</h3>
                    <p className="text-slate-500 mb-6">Drag and drop fields here to build your form</p>
                    <Button variant="outline" type="button">Add Field</Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardBody>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Practice Area
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
                        <option>General</option>
                        <option>Family Law</option>
                        <option>Criminal Defense</option>
                        <option>Corporate</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="text-sm">Active / Published</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Require Login</span>
                    </label>
                  </div>
                </CardBody>
              </Card>
              <div className="flex flex-col gap-3">
                <Button type="submit" icon={<Save className="h-4 w-4" />}>
                  Save Form
                </Button>
                <Link href="/intake-forms" className="w-full">
                  <Button type="button" variant="ghost" className="w-full" icon={<ArrowLeft className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
