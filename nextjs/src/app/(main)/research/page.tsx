/**
 * Research Page - Server Component
 * ResearchTool remains client component for AI interaction
 */
import { ResearchTool } from '@/components/research/ResearchTool';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Legal Research',
  description: 'AI-powered legal research',
};

export default function ResearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading research tool...</div>}>
      <ResearchTool />
    </Suspense>
  );
}
