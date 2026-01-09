/**
 * New Document / Upload Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, CloudUpload, FileUp } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Upload Document | Documents | LexiFlow',
  description: 'Upload and tag new legal documents',
};

export default function NewDocumentPage() {
  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Add a new file to the document management system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Documents', href: '/documents' },
          { label: 'Upload' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <CloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">Drag and drop file here</h3>
                  <p className="text-sm text-slate-500 mb-4">or click to browse from your computer</p>
                  <Button type="button" variant="outline" size="sm">Select File</Button>
                  <p className="text-xs text-slate-400 mt-4">Supported: PDF, DOCX, MSG, EML, XLSX (Max 50MB)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="File name will be used if blank"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category / Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="pleading">Pleading / Court Filing</option>
                      <option value="correspondence">Correspondence</option>
                      <option value="evidence">Evidence / Discovery</option>
                      <option value="contract">Contract / Agreement</option>
                      <option value="memo">Memo / Notes</option>
                      <option value="admin">Administrative</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Case <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="caseId"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select case...</option>
                      <option value="case1">Smith v. Jones</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags / Keywords
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Comma separated tags..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Options</h4>
                  <label className="flex items-center space-x-2 mb-2">
                    <input type="checkbox" name="privileged" className="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Privileged</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="ocr" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Run OCR (Text Recognition)</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/documents">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<FileUp className="h-4 w-4" />}>
              Start Upload
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
