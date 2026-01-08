/**
 * CRM Page - Server Component with Data Fetching
 * Fetches client list from backend
 */
import React from 'react';
import ClientCRM from '@/components/crm/ClientCRM';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'CRM | LexiFlow',
  description: 'Client Relationship Management',
};

export default async function CrmPage(): Promise<React.JSX.Element> {
  // Fetch clients from backend
  let clients = [];

  try {
    clients = await apiFetch(API_ENDPOINTS.CLIENTS.LIST);
  } catch (error) {
    console.error('Failed to load clients:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading CRM...</div>}>
        <ClientCRM initialClients={clients} />
      </Suspense>
    </div>
  );
}
