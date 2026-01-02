/**
 * Conflict Alerts Page - Server Component with Data Fetching
 * Real-time conflict detection dashboard
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Conflict Alerts | LexiFlow',
  description: 'Real-time conflict detection and management',
};

async function ConflictAlerts() {
  const conflicts = await apiFetch(API_ENDPOINTS.CONFLICT_ALERTS.LIST);

  const getRiskBadge = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'text-green-600';
      case 'waived': return 'text-blue-600';
      case 'pending': return 'text-amber-600';
      case 'escalated': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {conflicts.filter((c: any) => c.status === 'Pending').map((conflict: any) => (
        <div key={conflict.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow border-l-4 ${conflict.riskScore >= 80 ? 'border-red-500' :
            conflict.riskScore >= 60 ? 'border-orange-500' :
              'border-amber-500'
          }`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{conflict.conflictType}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(conflict.riskScore)}`}>
                    {getRiskLabel(conflict.riskScore)} Risk - {conflict.riskScore}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Detected {new Date(conflict.detectedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{conflict.description}</p>
              </div>
            </div>

            {/* Parties Involved */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">Parties Involved</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">New Matter</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{conflict.newMatter.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Parties: {conflict.newMatter.parties.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Conflicting Matter</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{conflict.existingMatter.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Parties: {conflict.existingMatter.parties.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Conflict Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-32">Conflict Basis:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{conflict.conflictBasis}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-32">Responsible Attorney:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{conflict.responsibleAttorney}</span>
              </div>
              {conflict.waiverRequired && (
                <div className="flex items-center text-sm">
                  <span className="text-red-600 font-semibold">⚠️ Written Conflict Waiver Required</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                Request Waiver
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Mark as Resolved
              </button>
              <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                Decline Matter
              </button>
              <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Historical Conflicts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Resolved & Historical Conflicts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolution</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {conflicts.filter((c: any) => c.status !== 'Pending').map((conflict: any) => (
                <tr key={conflict.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(conflict.detectedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                    {conflict.conflictType}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {conflict.newMatter.name} vs {conflict.existingMatter.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadge(conflict.riskScore)}`}>
                      {conflict.riskScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(conflict.status)}`}>
                      {conflict.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {conflict.resolution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ConflictAlertsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Conflict Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time conflict detection and management</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Alerts</p>
          <p className="text-2xl font-bold text-red-600">4</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Critical Risk</p>
          <p className="text-2xl font-bold text-red-600">2</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">High Risk</p>
          <p className="text-2xl font-bold text-orange-600">1</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Resolved (30d)</p>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Waiver Rate</p>
          <p className="text-2xl font-bold text-blue-600">68%</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading conflict alerts...</div>}>
        <ConflictAlerts />
      </Suspense>
    </div>
  );
}
