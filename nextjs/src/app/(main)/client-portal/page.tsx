/**
 * Client Portal Page - Server Component with Data Fetching
 * Displays client portal access status and document sharing
 */
import React from 'react';
import { ClientPortalList } from '@/components/client-portal/ClientPortalList';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Client Portal',
  description: 'Manage client portal access and document sharing',
};

export default async function ClientPortalPage(): Promise<React.JSX.Element> {
  // Fetch initial client portal data from backend
  let clients = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.CLIENT_PORTAL.LIST).catch(() => ({ data: [] }));
    clients = data?.data || [];
  } catch (error) {
    console.error('Failed to load client portal data:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading client portal...</div>}>
        <ClientPortalList initialClients={clients} />
      </Suspense>
    </div>
  );
}
