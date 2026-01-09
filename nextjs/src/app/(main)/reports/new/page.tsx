/**
 * New Report Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, BarChart2, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Report | Reports | LexiFlow',
  description: 'Design a new custom report',
};

export default function NewReportPage() {
  return (
    <>
      <PageHeader
        title="Create Custom Report"
        description="Design a new data report definition"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/reports' },
          { label: 'New Report' },
        ]}
      />

      <div className="max-w-4xl">
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardBody>
                  <h3 className="text-lg font-medium mb-4">Report Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Report Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Monthly Billable Hours by Attorney"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        placeholder="Brief description of what this report shows"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="text-lg font-medium mb-4">Data Source</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Primary Data Entity
                        </label>
                        <select
                          name="entity"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        >
                          <option value="cases">Cases</option>
                          <option value="time_entries">Time Entries</option>
                          <option value="invoices">Invoices</option>
                          <option value="tasks">Tasks</option>
                          <option value="documents">Documents</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Time Range Default
                        </label>
                        <select
                          name="timeRange"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        >
                          <option value="last_30">Last 30 Days</option>
                          <option value="last_quarter">Last Quarter</option>
                          <option value="ytd">Year to Date</option>
                          <option value="all">All Time</option>
                          <option value="custom">Custom Range</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="flex justify-between">
                <Link href="/reports">
                  <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" icon={<Save className="h-4 w-4" />}>
                  Save Report Definition
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardBody>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Visualization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Chart Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-slate-200 dark:border-slate-700 p-2 rounded text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                          <BarChart2 className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                          <span className="text-xs">Bar</span>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 p-2 rounded text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                          <div className="mx-auto mb-1 h-5 w-5 rounded-full border-2 border-slate-400"></div>
                          <span className="text-xs">Pie</span>
                        </div>
                        <div className="border border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center cursor-pointer">
                          <div className="mx-auto mb-1 h-5 w-5 border-b-2 border-l-2 border-slate-400"></div>
                          <span className="text-xs">Line</span>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 p-2 rounded text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                          <div className="mx-auto mb-1 h-5 w-5 grid grid-cols-2 gap-0.5">
                            <div className="bg-slate-400"></div>
                            <div className="bg-slate-400"></div>
                            <div className="bg-slate-400"></div>
                            <div className="bg-slate-400"></div>
                          </div>
                          <span className="text-xs">Table</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Sharing</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Share with Partners</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Share with Associates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Public (Dashboard)</span>
                    </label>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
