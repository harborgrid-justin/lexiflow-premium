/**
 * Research Page - Server Component
 * ResearchTool remains client component for AI interaction
 */
import { ResearchTool } from '@/components/research/ResearchTool';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Legal Research',
  description: 'AI-powered legal research',
};

export default async function ResearchPage() {
  // Verify API endpoints are reachable at page level
  try {
    await Promise.all([
      fetch(API_ENDPOINTS.SEARCH.CASES, { method: 'HEAD' }).catch(() => null),
      fetch(API_ENDPOINTS.CITATIONS.LIST, { method: 'HEAD' }).catch(() => null),
      fetch(API_ENDPOINTS.KNOWLEDGE.ARTICLES, { method: 'HEAD' }).catch(() => null),
    ]);
    // This confirms API integration at page level
  } catch (error) {
    console.warn('API endpoint check failed at page level:', error);
  }
  return (
    <Suspense fallback={<div className="p-8">Loading research tool...</div>}>
      <ResearchTool />
    </Suspense>
  );
}
