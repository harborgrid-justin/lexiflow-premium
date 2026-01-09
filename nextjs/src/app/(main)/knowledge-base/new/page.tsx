/**
 * New Knowledge Base Article Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Article | Knowledge Base | LexiFlow',
  description: 'Create a new knowledge base article or memo',
};

export default function NewArticlePage() {
  return (
    <>
      <PageHeader
        title="Create Article"
        description="Add a new memo, precedent, or guide to the knowledge base"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Knowledge Base', href: '/knowledge-base' },
          { label: 'New Article' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Guide to Summary Judgment Motions in SDNY"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-lg font-medium"
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
                      <option value="memo">Legal Memo / Research</option>
                      <option value="precedent">Precedent / Template</option>
                      <option value="procedure">Firm Procedure</option>
                      <option value="training">Training Material</option>
                      <option value="news">Legal News / Update</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction / Tag
                    </label>
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="e.g. Federal, California, Tax"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    rows={15}
                    required
                    placeholder="# Abstract\n\nEnter the content of the article here using Markdown..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Markdown is supported for formatting.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/knowledge-base">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" icon={<Save className="h-4 w-4" />}>
                Save Draft
              </Button>
              <Button type="submit" icon={<BookOpen className="h-4 w-4" />}>
                Publish Article
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
