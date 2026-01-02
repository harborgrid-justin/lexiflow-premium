/**
 * Discovery Detail Page - Server Component with Data Fetching
 * Fetches specific discovery request from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface DiscoveryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DiscoveryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const request = await apiFetch(API_ENDPOINTS.DISCOVERY_REQUESTS.DETAIL(id));
    return {
      title: `Discovery Request ${id} | LexiFlow`,
      description: request.description || 'Discovery request details',
    };
  } catch {
    return { title: 'Discovery Request Not Found' };
  }
}

export default async function DiscoveryDetailPage({ params }: DiscoveryDetailPageProps) {
  const { id } = await params;

  let request;
  try {
    request = await apiFetch(API_ENDPOINTS.DISCOVERY_REQUESTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Discovery Request: {id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{request.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Status: {request.status}</p>
        </div>
      </div>
    </div>
  );
}
