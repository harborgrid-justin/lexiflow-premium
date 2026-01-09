/**
 * New Document Template Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Template | Templates | LexiFlow',
  description: 'Create a new document automation template',
};

export default function NewTemplatePage() {
  return (
    <>
      <PageHeader
        title="Create Template"
        description="Design a reusable document template"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Documents', href: '/documents' },
          { label: 'Templates', href: '/templates' },
          { label: 'New Template' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Standard NDA, Client Engagement Letter"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="contracts">Contracts</option>
                      <option value="pleadings">Pleadings</option>
                      <option value="letters">Correspondence</option>
                      <option value="forms">Internal Forms</option>
                      <option value="memos">Memos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Access Level
                    </label>
                    <select
                      name="access"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="public">Firm-wide</option>
                      <option value="department">Department Only</option>
                      <option value="private">Private (Me Only)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Briefly describe what this template is used for..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Template Source
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Upload Word Doc (.docx)</span>
                      <span className="text-xs text-slate-500">Supports standard placeholders</span>
                    </div>
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Open Web Editor</span>
                      <span className="text-xs text-slate-500">Create from scratch using online editor</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Detected Variables (Auto-populated after upload)
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-500 italic">
                    No document uploaded yet. Variables like {'{{ClientName}}'} will appear here.
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/templates">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Save Template
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
