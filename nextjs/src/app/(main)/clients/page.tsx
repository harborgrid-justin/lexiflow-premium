/**
 * Clients List Page - Server Component with Data Fetching
 * List view of all clients
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Clients | LexiFlow',
  description: 'Manage clients and contacts',
};

export default async function ClientsPage(): Promise<React.JSX.Element> {
  // Fetch clients from backend
  let clients: any[] = [];

  try {
    clients = await apiFetch(API_ENDPOINTS.CLIENTS.LIST) as any[];
  } catch (error) {
    console.error('Failed to load clients:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Link
          href="/clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Client
        </Link>
      </div>

      <Suspense fallback={<div>Loading clients...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients && clients.length > 0 ? (
            clients.map((client: any) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{client.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{client.email}</p>
                <p className="text-xs text-slate-500 mt-1">{client.phone}</p>
                <span className="inline-block mt-3 px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900">
                  {client.status}
                </span>
              </Link>
            ))
          ) : (
            <p className="col-span-3 text-slate-600 dark:text-slate-400">No clients available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
