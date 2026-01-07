/**
 * Statute Alerts Page - Client Component
 * Critical deadline alerts with real-time countdown timers
 *
 * Uses 'use client' for:
 * - Real-time countdown updates via setInterval
 * - Dynamic state management for alerts
 * - Browser-side date calculations
 */
'use client';

import { API_ENDPOINTS, clientFetch } from '@/lib/api-config';
import { Suspense, useEffect, useState } from 'react';

// Note: Client components cannot export metadata directly
// Metadata should be exported from parent layout or use next/head

async function StatuteAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await clientFetch(API_ENDPOINTS.STATUTE_ALERTS.LIST) as any[];
        setAlerts(data);
      } catch (error) {
        console.error('Failed to fetch statute alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const calculateCountdown = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return { expired: true, text: 'EXPIRED', color: 'text-red-600' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let color = 'text-slate-900';
    if (days === 0 && hours < 24) color = 'text-red-600';
    else if (days < 3) color = 'text-orange-600';
    else if (days < 7) color = 'text-amber-600';

    return {
      expired: false,
      text: days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`,
      color,
      days,
    };
  };

  if (loading) {
    return <div className="text-center py-12">Loading statute alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts - Within 24 hours */}
      {alerts.filter((a: any) => calculateCountdown(a.deadline).days === 0).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🚨</span>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100">CRITICAL - Due Within 24 Hours</h2>
          </div>
          <div className="space-y-3">
            {alerts.filter((a: any) => calculateCountdown(a.deadline).days === 0).map((alert: any) => {
              const countdown = calculateCountdown(alert.deadline);
              return (
                <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{alert.statuteType}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{alert.caseName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Matter: {alert.matterNumber}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-2xl font-bold ${countdown.color} animate-pulse`}>{countdown.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(alert.deadline).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Mark Complete
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      View Case
                    </button>
                    <button className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700">
                      Request Extension
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Alerts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">All Statute Deadlines</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Countdown</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statute Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsible Attorney</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {alerts.map((alert: any) => {
                const countdown = calculateCountdown(alert.deadline);
                return (
                  <tr key={alert.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 ${countdown.expired ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {new Date(alert.deadline).toLocaleDateString()}
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(alert.deadline).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${countdown.color}`}>
                        {countdown.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{alert.caseName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{alert.matterNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                      {alert.statuteType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {alert.responsibleAttorney}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getUrgencyBadge(alert.urgency)}`}>
                        {alert.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button className="text-green-600 hover:underline">Complete</button>
                      <button className="text-blue-600 hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StatuteAlertsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Statute Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Critical deadline monitoring with real-time countdowns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Due Today</p>
          <p className="text-2xl font-bold text-red-600">3</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Due This Week</p>
          <p className="text-2xl font-bold text-orange-600">8</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Due This Month</p>
          <p className="text-2xl font-bold text-amber-600">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Compliance Rate</p>
          <p className="text-2xl font-bold text-green-600">98%</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading statute alerts...</div>}>
        <StatuteAlerts />
      </Suspense>
    </div>
  );
}
