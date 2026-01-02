/**
 * Analytics Page - Server Component with Data Fetching
 * Fetches analytics dashboard data from backend
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Business intelligence and analytics',
};

export default async function AnalyticsPage(): Promise<React.JSX.Element> {
  // Fetch analytics dashboard data
  let dashboardData = null;

  try {
    dashboardData = await apiFetch(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Analytics</h1>
      <Suspense fallback={<div>Loading analytics...</div>}>
        {dashboardData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-sm text-slate-600 dark:text-slate-400">Total Cases</h3>
              <p className="text-2xl font-bold">{dashboardData.totalCases || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-sm text-slate-600 dark:text-slate-400">Active Matters</h3>
              <p className="text-2xl font-bold">{dashboardData.activeMatters || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-sm text-slate-600 dark:text-slate-400">Documents</h3>
              <p className="text-2xl font-bold">{dashboardData.totalDocuments || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">Analytics data unavailable</p>
        )}
      </Suspense>
    </div>
  );
}
