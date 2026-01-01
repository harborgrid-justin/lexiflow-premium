/**
 * Report Viewer Route
 * View and export individual reports
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from "./+types/$id";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import { ChartCard } from '@/components/enterprise/analytics';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ArrowLeft, Download, Share2, RefreshCw, Calendar, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel, exportToCSV } from '@/components/enterprise/data/export';

export function meta({ params }: Route.MetaArgs) {
  return createMeta({
    title: `Report ${params.id}`,
    description: 'View and export report',
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  // TODO: Fetch real report data from API
  const mockReport = {
    id,
    name: 'Monthly Billing Summary',
    description: 'Comprehensive monthly billing and revenue report',
    type: 'billing-summary',
    category: 'financial',
    generatedAt: new Date().toISOString(),
    period: {
      start: '2024-01-01',
      end: '2024-01-31',
    },
    data: {
      summary: {
        totalRevenue: 524000,
        collected: 475000,
        outstanding: 232000,
        realizationRate: 92.3,
        collectionRate: 90.6,
      },
      charts: [
        {
          id: 'revenue-trend',
          type: 'line',
          title: 'Revenue Trend',
          data: [
            { week: 'Week 1', revenue: 125000, collected: 112000 },
            { week: 'Week 2', revenue: 132000, collected: 118000 },
            { week: 'Week 3', revenue: 128000, collected: 121000 },
            { week: 'Week 4', revenue: 139000, collected: 124000 },
          ],
        },
        {
          id: 'by-practice-area',
          type: 'bar',
          title: 'Revenue by Practice Area',
          data: [
            { area: 'Corporate', revenue: 185000 },
            { area: 'Litigation', revenue: 142000 },
            { area: 'IP/Patent', revenue: 98000 },
            { area: 'Real Estate', revenue: 99000 },
          ],
        },
        {
          id: 'by-attorney',
          type: 'bar',
          title: 'Top Billing Attorneys',
          data: [
            { name: 'Sarah Chen', revenue: 112000 },
            { name: 'Michael Torres', revenue: 98000 },
            { name: 'Jessica Park', revenue: 89000 },
            { name: 'David Kim', revenue: 76000 },
            { name: 'Emily Davis', revenue: 68000 },
          ],
        },
      ],
    },
  };

  return { report: mockReport };
}

export default function ReportViewerRoute({ loaderData }: Route.ComponentProps) {
  const { report } = loaderData;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = {
        title: report.name,
        description: report.description,
        generatedAt: new Date(report.generatedAt).toLocaleString(),
        period: `${report.period.start} to ${report.period.end}`,
        summary: report.data.summary,
        charts: report.data.charts,
      };

      switch (format) {
        case 'pdf':
          // TODO: Implement PDF export with charts
          console.log('Exporting to PDF...', exportData);
          alert('PDF export will be implemented with jsPDF library');
          break;
        case 'excel':
          // Convert data for Excel export
          const excelData = Object.entries(report.data.summary).map(([key, value]) => ({
            Metric: key.replace(/([A-Z])/g, ' $1').trim(),
            Value: value,
          }));
          await exportToExcel(excelData, [], `${report.name}-${Date.now()}.xlsx`);
          break;
        case 'csv':
          const csvData = Object.entries(report.data.summary).map(([key, value]) => ({
            Metric: key.replace(/([A-Z])/g, ' $1').trim(),
            Value: value,
          }));
          const columns = [
            { key: 'Metric', header: 'Metric' },
            { key: 'Value', header: 'Value' },
          ];
          await exportToCSV(csvData, columns, `${report.name}-${Date.now()}.csv`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/reports"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {report.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Share2 className="h-4 w-4" />
            Share
          </button>

          <div className="relative group">
            <button
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 hidden w-40 rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {report.category}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {report.type}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Period</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Generated</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(report.data.summary).map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === 'number'
                ? key.toLowerCase().includes('rate')
                  ? `${value.toFixed(1)}%`
                  : `$${value.toLocaleString()}`
                : value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {report.data.charts.map((chart: any) => (
          <ChartCard key={chart.id} title={chart.title}>
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === 'line' ? (
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
                  <Line type="monotone" dataKey="collected" stroke="#10B981" name="Collected" />
                </LineChart>
              ) : chart.type === 'bar' ? (
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={chart.data[0].area ? 'area' : 'name'} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue ($)" />
                </BarChart>
              ) : null}
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Report"
      message="We couldn't load this report. Please try again."
      backTo="/reports"
      backLabel="Back to Reports"
    />
  );
}
