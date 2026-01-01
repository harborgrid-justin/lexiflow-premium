/**
 * Reports Route
 * Report builder and management interface
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import { Plus, FileText, Calendar, Download, Play, Edit, Trash2, Search } from 'lucide-react';
import type { Report } from '@/types/analytics-enterprise';

export function meta({}: Route.MetaArgs) {
  return createMeta({
    title: 'Reports',
    description: 'Create and manage custom reports',
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Fetch real reports from API
  const mockReports: Report[] = [
    {
      id: '1',
      name: 'Monthly Billing Summary',
      description: 'Comprehensive monthly billing and revenue report',
      type: 'billing-summary',
      category: 'financial',
      format: ['pdf', 'excel'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-month' },
      },
      status: 'active',
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
      },
      lastRun: '2024-01-01T09:00:00Z',
      nextRun: '2024-02-01T09:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Case Outcomes Report',
      description: 'Win/loss analysis by attorney and practice area',
      type: 'case-summary',
      category: 'operational',
      format: ['pdf'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-quarter' },
      },
      status: 'active',
      schedule: {
        frequency: 'quarterly',
      },
      lastRun: '2024-01-01T09:00:00Z',
      createdAt: '2023-03-15T00:00:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
    },
    {
      id: '3',
      name: 'A/R Aging Report',
      description: 'Accounts receivable aging analysis',
      type: 'ar-aging',
      category: 'financial',
      format: ['excel', 'csv'],
      parameters: {
        dateRange: { type: 'absolute', start: '2024-01-01', end: '2024-01-31' },
      },
      status: 'active',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '08:00',
      },
      lastRun: '2024-01-29T08:00:00Z',
      nextRun: '2024-02-05T08:00:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-28T16:45:00Z',
    },
    {
      id: '4',
      name: 'Client Profitability Dashboard',
      description: 'Revenue and profitability by client',
      type: 'client-profitability',
      category: 'executive',
      format: ['pdf', 'html'],
      parameters: {
        dateRange: { type: 'relative', period: 'ytd' },
      },
      status: 'active',
      createdAt: '2023-09-12T00:00:00Z',
      updatedAt: '2024-01-20T11:15:00Z',
    },
    {
      id: '5',
      name: 'Attorney Productivity Metrics',
      description: 'Utilization and billable hours by attorney',
      type: 'productivity',
      category: 'performance',
      format: ['excel'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-month' },
      },
      status: 'draft',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-25T09:30:00Z',
    },
  ];

  return { reports: mockReports };
}

export default function ReportsRoute({ loaderData }: Route.ComponentProps) {
  const { reports } = loaderData;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      operational: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      compliance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      performance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      executive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyLabel = (frequency?: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      custom: 'Custom',
    };
    return frequency ? labels[frequency as keyof typeof labels] || frequency : 'On Demand';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create, schedule, and manage custom reports
          </p>
        </div>

        <Link
          to="/reports/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Report
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Categories</option>
          <option value="financial">Financial</option>
          <option value="operational">Operational</option>
          <option value="compliance">Compliance</option>
          <option value="performance">Performance</option>
          <option value="executive">Executive</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {report.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {report.description}
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(report.category)}`}>
                {report.category}
              </span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
              {report.schedule && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  <Calendar className="h-3 w-3" />
                  {getFrequencyLabel(report.schedule.frequency)}
                </span>
              )}
            </div>

            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {report.lastRun && (
                <div>Last run: {new Date(report.lastRun).toLocaleDateString()}</div>
              )}
              {report.nextRun && (
                <div>Next run: {new Date(report.nextRun).toLocaleDateString()}</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/reports/${report.id}`}
                className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                View
              </Link>
              <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                <Play className="h-4 w-4" />
              </button>
              <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                <Edit className="h-4 w-4" />
              </button>
              <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No reports found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first report'}
          </p>
          {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
            <Link
              to="/reports/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Report
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Reports"
      message="We couldn't load your reports. Please try again."
      backTo="/"
      backLabel="Back to Dashboard"
    />
  );
}
