/**
 * Collections Queue Page - Server Component with Data Fetching
 * Outstanding receivables and collection management
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Collections Queue | LexiFlow',
  description: 'Outstanding receivables and collection management',
};

async function CollectionsQueue() {
  const collections = await apiFetch(API_ENDPOINTS.COLLECTIONS_QUEUE.LIST) as any[];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAgingColor = (days: number) => {
    if (days < 30) return 'text-green-600';
    if (days < 60) return 'text-amber-600';
    if (days < 90) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matter</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Days Overdue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {collections.map((item: any) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.clientName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.clientId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {item.matterNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">
                {formatCurrency(item.outstandingAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-semibold ${getAgingColor(item.daysOverdue)}`}>
                  {item.daysOverdue} days
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {item.lastContact ? new Date(item.lastContact).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900 dark:text-slate-100">{item.nextAction}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.nextActionDate ? new Date(item.nextActionDate).toLocaleDateString() : 'Not scheduled'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                  {item.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <button className="text-blue-600 hover:underline">Contact</button>
                <button className="text-green-600 hover:underline">Payment Plan</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CollectionsQueuePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Collections Queue</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Outstanding receivables and collection management</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">$284,350</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">0-30 Days</p>
          <p className="text-2xl font-bold text-green-600">$82,140</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">31-60 Days</p>
          <p className="text-2xl font-bold text-amber-600">$94,220</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">61-90 Days</p>
          <p className="text-2xl font-bold text-orange-600">$58,990</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">90+ Days</p>
          <p className="text-2xl font-bold text-red-600">$49,000</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading collections queue...</div>}>
        <CollectionsQueue />
      </Suspense>
    </div>
  );
}
