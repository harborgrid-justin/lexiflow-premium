/**
 * Report Viewer Route
 * View and export individual reports
 */

import { analyticsApi } from '@/lib/frontend-api';
import { ChartCard } from '@/routes/analytics/components/enterprise';
import { exportToCSV, exportToExcel } from '@/shared/components/enterprise/data/export';
import { jsPDF } from 'jspdf';
import { ArrowLeft, Download, RefreshCw, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

interface ChartData {
  id: string;
  type: string;
  title: string;
  data: Record<string, unknown>[];
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

export function meta({ params }: { params: { id: string } }) {
  return createMeta({
    title: `Report ${params.id}`,
    description: 'View and export report',
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) throw new Error("Report ID is required");

  try {
    const result = await analyticsApi.getReportById(id);
    if (!result.ok) throw new Error("Report not found");
    const report = result.data;
    const metadata = report.metadata || {};

    const mappedReport = {
      id: report.id,
      name: report.name,
      description: (metadata.description as string) || '',
      type: report.reportType,
      category: report.reportType,
      generatedAt: report.generatedAt || new Date().toISOString(),
      period: (metadata.period as { start: string | null; end: string | null }) || { start: null, end: null },
      data: {
        summary: (metadata.summary as Record<string, unknown>) || {},
        charts: (metadata.charts as ChartData[]) || []
      }
    };

    return { report: mappedReport };
  } catch (error) {
    console.error("Failed to load report", error);
    throw error;
  }
}

export default function ReportViewerRoute() {
  const { report } = useLoaderData() as LoaderData;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Prepare data for export
      /* const exportData = {
        title: report.name,
        description: report.description,
        generatedAt: new Date(report.generatedAt).toLocaleString(),
        period: `${report.period.start} to ${report.period.end}`,
        summary: report.data.summary,
        charts: report.data.charts,
      }; */

      switch (format) {
        case 'pdf':
          try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(report.name, 20, 20);

            doc.setFontSize(12);
            doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 20, 30);
            doc.text(`Period: ${report.period.start} to ${report.period.end}`, 20, 40);
            doc.text(report.description, 20, 50);

            let y = 70;
            doc.setFontSize(16);
            doc.text("Summary", 20, y);
            y += 10;

            doc.setFontSize(12);
            Object.entries(report.data.summary).forEach(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              doc.text(`${label}: ${value}`, 20, y);
              y += 10;
            });

            doc.save(`${report.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
          } catch (error) {
            console.error("Failed to export PDF", error);
            alert("Failed to export PDF");
          }
          break;
        case 'excel':
          // Convert data for Excel export
          await exportToExcel(
            Object.entries(report.data.summary).map(([key, value]) => ({
              Metric: key.replace(/([A-Z])/g, ' $1').trim(),
              Value: value,
            })),
            [],
            `${report.name}-${Date.now()}.xlsx`
          );
          break;
        case 'csv': {
          const csvData = Object.entries(report.data.summary).map(([key, value]) => ({
            Metric: key.replace(/([A-Z])/g, ' $1').trim(),
            Value: value,
          }));
          const columns = [
            { id: 'Metric', key: 'Metric', header: 'Metric' },
            { id: 'Value', key: 'Value', header: 'Value' },
          ];
          await exportToCSV(csvData, columns, `${report.name}-${Date.now()}.csv`);
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen p-8">
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
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="mb-6 rounded-lg border p-4">
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
              {report.period?.start ? new Date(report.period.start).toLocaleDateString() : 'N/A'} - {report.period?.end ? new Date(report.period.end).toLocaleDateString() : 'N/A'}
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
                : String(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {report.data.charts.map((chart: ChartData) => (
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
                  <XAxis dataKey={chart.data[0]?.area ? 'area' : 'name'} stroke="#6b7280" />
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

export function ErrorBoundary({ error }: { error: unknown }) {
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
