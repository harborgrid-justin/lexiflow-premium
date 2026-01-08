/**
 * Witnesses List Page - Server Component with Data Fetching
 * List view of all witnesses
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Witnesses | LexiFlow',
  description: 'Manage witnesses and testimony',
};

export default async function WitnessesPage(): Promise<React.JSX.Element> {
  // Fetch witnesses from backend
  let witnesses: any[] = [];

  try {
    witnesses = await apiFetch(API_ENDPOINTS.WITNESSES.LIST) as any[];
  } catch (error) {
    console.error('Failed to load witnesses:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Witnesses</h1>
        <Link
          href="/witnesses/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Witness
        </Link>
      </div>

      <Suspense fallback={<div>Loading witnesses...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {witnesses && witnesses.length > 0 ? (
            witnesses.map((witness: any) => (
              <Link
                key={witness.id}
                href={`/witnesses/${witness.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{witness.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{witness.type}</p>
                <p className="text-xs text-slate-500 mt-2">{witness.email || witness.phone}</p>
              </Link>
            ))
          ) : (
            <p className="col-span-3 text-slate-600 dark:text-slate-400">No witnesses available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
