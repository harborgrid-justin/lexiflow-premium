/**
 * Organizations List Page - Server Component with Data Fetching
 * List view of all organizations
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Organizations | LexiFlow',
  description: 'Manage organizations and entities',
};

export default async function OrganizationsPage(): Promise<React.JSX.Element> {
  // Fetch organizations from backend
  let organizations = [];

  try {
    organizations = await apiFetch(API_ENDPOINTS.ORGANIZATIONS.LIST);
  } catch (error) {
    console.error('Failed to load organizations:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link
          href="/organizations/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Organization
        </Link>
      </div>

      <Suspense fallback={<div>Loading organizations...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations && organizations.length > 0 ? (
            organizations.map((org: any) => (
              <Link
                key={org.id}
                href={`/organizations/${org.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{org.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{org.type}</p>
                <p className="text-xs text-slate-500 mt-1">{org.industry}</p>
              </Link>
            ))
          ) : (
            <p className="col-span-3 text-slate-600 dark:text-slate-400">No organizations available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
