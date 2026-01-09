/**
 * New Document Draft Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, FileEdit, Wand2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Start Draft | Drafting | LexiFlow',
  description: 'Create a new legal document from template or AI',
};

export default function NewDraftPage() {
  return (
    <>
      <PageHeader
        title="Start New Draft"
        description="Create a document from a template or usage AI assistance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Drafting', href: '/drafting' },
          { label: 'New Draft' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-medium mb-4">Document Details</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Document Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g. Motion for Summary Judgment"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Client / Matter <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="matter"
                                        required
                                        placeholder="Search..."
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Opposing Council
                                    </label>
                                    <input
                                        type="text"
                                        name="opposing"
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                                    />
                                </div>
                            </div>
                         </div>
                    </CardBody>
                </Card>

                 <Card>
                    <CardBody>
                        <h3 className="text-lg font-medium mb-4">Generation Method</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="cursor-pointer">
                                <input type="radio" name="method" value="template" className="peer sr-only" defaultChecked />
                                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 text-center">
                                    <FileEdit className="mx-auto mb-2 h-6 w-6 text-slate-600 dark:text-slate-400" />
                                    <span className="block text-sm font-medium">Standard Template</span>
                                </div>
                            </label>
                             <label className="cursor-pointer">
                                <input type="radio" name="method" value="ai" className="peer sr-only" />
                                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 text-center">
                                    <Wand2 className="mx-auto mb-2 h-6 w-6 text-purple-500" />
                                    <span className="block text-sm font-medium">AI Drafter</span>
                                </div>
                            </label>
                             <label className="cursor-pointer">
                                <input type="radio" name="method" value="blank" className="peer sr-only" />
                                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 text-center">
                                    <div className="mx-auto mb-2 h-6 w-6 border border-slate-400 rounded bg-white dark:bg-slate-800"></div>
                                    <span className="block text-sm font-medium">Blank Doc</span>
                                </div>
                            </label>
                         </div>
                    </CardBody>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardBody>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Template Selection</h3>
                        <div className="space-y-3">
                            <select size={10} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 p-2 text-sm">
                                <optgroup label="Civil Litigation">
                                    <option>Complaint (General Negligence)</option>
                                    <option>Answer with Counterclaims</option>
                                    <option>Motion to Dismiss</option>
                                    <option>Interrogatories</option>
                                </optgroup>
                                <optgroup label="Contracts">
                                    <option>NDA (Mutual)</option>
                                    <option>Service Agreement</option>
                                    <option>Employment Contract</option>
                                </optgroup>
                            </select>
                        </div>
                    </CardBody>
                </Card>
                 <div className="flex flex-col gap-3">
                    <Button type="submit" icon={<FileEdit className="h-4 w-4" />}>
                        Create Document
                    </Button>
                    <Link href="/drafting" className="w-full">
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
