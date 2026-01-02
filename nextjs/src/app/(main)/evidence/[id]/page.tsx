/**
 * Evidence Detail Page - Server Component with Data Fetching
 * Fetches specific evidence item from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface EvidenceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EvidenceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const evidence = await apiFetch(API_ENDPOINTS.EVIDENCE.DETAIL(id));
    return {
      title: `Evidence ${evidence.evidenceNumber || id} | LexiFlow`,
      description: evidence.description || 'Evidence details',
    };
  } catch {
    return { title: 'Evidence Not Found' };
  }
}

export default async function EvidenceDetailPage({ params }: EvidenceDetailPageProps) {
  const { id } = await params;

  let evidence;
  try {
    evidence = await apiFetch(API_ENDPOINTS.EVIDENCE.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Evidence: {evidence.evidenceNumber || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{evidence.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Chain of Custody: {evidence.chainOfCustody}</p>
        </div>
      </div>
    </div>
  );
}
