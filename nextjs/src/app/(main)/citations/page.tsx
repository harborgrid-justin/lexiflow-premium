/**
 * Citations Page - Server Component
 */
import { CitationManager } from '@/components/citations/CitationManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citation Manager',
  description: 'Manage legal citations and analyze briefs',
};

export default function CitationsPage() {
  return <CitationManager />;
}
