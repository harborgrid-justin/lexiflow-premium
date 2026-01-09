/**
 * Log New CLE Credit Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log CLE Credit | LexiFlow',
  description: 'Log a new continuing legal education credit',
};

export default function NewCLECreditPage() {
  return (
    <>
      <PageHeader
        title="Log CLE Credit"
        description="Record a new continuing legal education credit"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'CLE', href: '/cle' },
          { label: 'New Credit' },
        ]}
      />

      <div className="max-w-3xl">
        <Card>
          <CardBody>
            <form className="space-y-6">
              {/* Course Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Course Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Provider *
                    </label>
                    <input
                      type="text"
                      name="provider"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., State Bar Association"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date Completed *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Credit Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Credit Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Credits Earned *
                    </label>
                    <input
                      type="number"
                      name="credits"
                      step="0.5"
                      min="0"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="General">General</option>
                      <option value="Ethics">Ethics</option>
                      <option value="Specialty">Specialty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jurisdiction *
                    </label>
                    <select
                      name="jurisdiction"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select jurisdiction</option>
                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Texas">Texas</option>
                      <option value="Florida">Florida</option>
                      <option value="Illinois">Illinois</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the course content"
                  />
                </div>
              </div>

              {/* Certificate Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Certificate
                </h3>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    Drag and drop your certificate here, or click to browse
                  </p>
                  <input type="file" name="certificate" className="hidden" id="certificate-upload" accept=".pdf,.jpg,.jpeg,.png" />
                  <label htmlFor="certificate-upload">
                    <Button variant="outline" size="sm" type="button">
                      Select File
                    </Button>
                  </label>
                  <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <Link href="/cle">
                  <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" icon={<Save className="h-4 w-4" />}>
                  Save Credit
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
