/**
 * Research Page - Server Component
 */
import { ResearchTool } from '@/components/research/ResearchTool';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Research',
  description: 'AI-powered legal research',
};

export default function ResearchPage() {
  return <ResearchTool />;
}
