/**
 * Case Financials Page - Server Component with Data Fetching
 * Financial tracking per case with backend data
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Financials | LexiFlow',
  description: 'Case-specific financial tracking',
};

export default async function CaseFinancialsPage(): Promise<React.JSX.Element> {
  // Fetch case financial data
  let financials = null;

  try {
    financials = await apiFetch(API_ENDPOINTS.BILLING.ROOT);
  } catch (error) {
    console.error('Failed to load case financials:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Financials</h1>
      <Suspense fallback={<div>Loading financials...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h3 className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</h3>
            <p className="text-2xl font-bold">${financials?.totalRevenue || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h3 className="text-sm text-slate-600 dark:text-slate-400">Outstanding</h3>
            <p className="text-2xl font-bold">${financials?.outstanding || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h3 className="text-sm text-slate-600 dark:text-slate-400">Hours Billed</h3>
            <p className="text-2xl font-bold">{financials?.hoursBilled || 0}</p>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
