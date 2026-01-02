/**
 * Compliance Alerts Dashboard Page - Server Component with Data Fetching
 * Monitor compliance alerts with severity levels and due dates
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Compliance Alerts | LexiFlow',
  description: 'Compliance monitoring dashboard and alert management',
};

async function ComplianceAlertsDashboard() {
  const alerts: any = await apiFetch(API_ENDPOINTS.COMPLIANCE_ALERTS.LIST);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-red-900 dark:text-red-200">Critical</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {alerts.summary?.critical || 0}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-orange-900 dark:text-orange-200">High</h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {alerts.summary?.high || 0}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Medium</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {alerts.summary?.medium || 0}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-green-900 dark:text-green-200">Low</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {alerts.summary?.low || 0}
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alert Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {alerts.items?.map((alert: any) => (
              <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {alert.alertType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  <Link
                    href={`/cases/${alert.caseId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {alert.caseName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alert.status === 'Resolved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                    {alert.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <Link
                    href={`/compliance-alerts/${alert.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComplianceAlertsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Compliance Alerts</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor and manage compliance alerts across all matters</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ComplianceAlertsDashboard />
      </Suspense>
    </div>
  );
}
