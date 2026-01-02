/**
 * Integrations Page - Server Component with Data Fetching
 * Third-party service integrations (Clio, MyCase, QuickBooks)
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Integrations | LexiFlow',
  description: 'Third-party service integrations and API connections',
};

async function IntegrationsList() {
  const integrations = await apiFetch(API_ENDPOINTS.INTEGRATIONS.LIST) as any[];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-amber-600';
      default: return 'text-slate-500';
    }
  };

  const getHealthBadge = (health: number) => {
    if (health >= 90) return 'bg-green-100 text-green-800';
    if (health >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Sync</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connection Health</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {integrations.map((integration: any) => (
            <tr key={integration.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {integration.serviceName}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {integration.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getHealthBadge(integration.health)}`}>
                  {integration.health}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <button className="text-blue-600 hover:underline">Configure</button>
                <button className="text-green-600 hover:underline">Sync Now</button>
                <button className="text-red-600 hover:underline">Disconnect</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Integrations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage third-party service connections</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Integration
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Integrations</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Connected</p>
          <p className="text-2xl font-bold text-green-600">6</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Errors</p>
          <p className="text-2xl font-bold text-red-600">1</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg Health</p>
          <p className="text-2xl font-bold text-amber-600">87%</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading integrations...</div>}>
        <IntegrationsList />
      </Suspense>
    </div>
  );
}
