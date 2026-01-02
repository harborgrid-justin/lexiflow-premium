/**
 * Exhibits Page - Server Component with Data Fetching
 * Fetches trial exhibits from backend
 */
import React from 'react';
import ExhibitManager from '@/components/exhibits/ExhibitManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Exhibits | LexiFlow',
  description: 'Trial exhibit management and digital stickering',
};

export default async function ExhibitsPage(): Promise<React.JSX.Element> {
  // Fetch exhibits from backend
  let exhibits = [];

  try {
    exhibits = await apiFetch(API_ENDPOINTS.EXHIBITS.LIST);
  } catch (error) {
    console.error('Failed to load exhibits:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="p-8">Loading exhibits...</div>}>
        <ExhibitManager initialExhibits={exhibits} />
      </Suspense>
    </div>
  );
}
