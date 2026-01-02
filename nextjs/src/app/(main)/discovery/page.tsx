/**
 * Discovery Page - Server Component with Data Fetching
 * Fetches discovery data and requests from backend
 */
import React from 'react';
import DiscoveryPlatform from '@/components/discovery/DiscoveryPlatform';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Discovery | LexiFlow',
  description: 'Manage discovery process, requests, and legal holds',
};

export default async function DiscoveryPage(): Promise<React.JSX.Element> {
  // Fetch discovery data from backend
  let discoveryRequests = [];
  let legalHolds = [];
  let custodians = [];

  try {
    const [requests, holds, custodiansData] = await Promise.all([
      apiFetch(API_ENDPOINTS.DISCOVERY_REQUESTS.LIST).catch(() => []),
      apiFetch(API_ENDPOINTS.LEGAL_HOLDS.LIST).catch(() => []),
      apiFetch(API_ENDPOINTS.CUSTODIANS.LIST).catch(() => []),
    ]);
    discoveryRequests = requests;
    legalHolds = holds;
    custodians = custodiansData;
  } catch (error) {
    console.error('Failed to load discovery data:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="p-8">Loading discovery platform...</div>}>
        <DiscoveryPlatform
          initialRequests={discoveryRequests}
          initialHolds={legalHolds}
          initialCustodians={custodians}
        />
      </Suspense>
    </div>
  );
}
