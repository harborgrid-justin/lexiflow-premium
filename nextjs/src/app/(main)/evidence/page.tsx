/**
 * Evidence Page - Server Component with Data Fetching
 * Fetches evidence items from backend
 */
import React from 'react';
import EvidenceVault from '@/components/evidence/EvidenceVault';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Evidence Vault | LexiFlow',
  description: 'Secure chain of custody and forensic asset management',
};

export default async function EvidencePage(): Promise<React.JSX.Element> {
  // Fetch evidence items from backend
  let evidenceItems = [];

  try {
    evidenceItems = await apiFetch(API_ENDPOINTS.EVIDENCE.LIST);
  } catch (error) {
    console.error('Failed to load evidence:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="p-8">Loading evidence vault...</div>}>
        <EvidenceVault initialEvidence={evidenceItems} />
      </Suspense>
    </div>
  );
}
