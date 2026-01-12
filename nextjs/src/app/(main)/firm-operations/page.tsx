/**
 * Firm Operations Page - Server Component with Data Fetching
 * Administrative and operational management with backend data
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Firm Operations | LexiFlow',
  description: 'Firm administrative and operational management',
};

export default async function FirmOperationsPage(): Promise<React.JSX.Element> {
  // Fetch firm operations data
  let hrData = null;
  let orgData = null;

  try {
    const [hr, org] = await Promise.all([
      apiFetch(API_ENDPOINTS.HR.ROOT).catch(() => null),
      apiFetch(API_ENDPOINTS.ORGANIZATIONS.LIST).catch(() => null),
    ]);
    hrData = hr;
    orgData = org;
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Firm Operations</h1>
      <Suspense fallback={<div>Loading operations...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">HR Management</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {hrData ? `${hrData.totalEmployees || 0} employees` : 'No HR data available'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Organizations</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {orgData && Array.isArray(orgData) ? `${orgData.length} organizations` : 'No organization data'}
            </p>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
