/**
 * Exhibit Detail Page - Server Component with Data Fetching
 * Fetches specific exhibit from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ExhibitDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExhibitDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id));
    return {
      title: `Exhibit ${exhibit.exhibitNumber || id} | LexiFlow`,
      description: exhibit.description || 'Exhibit details',
    };
  } catch {
    return { title: 'Exhibit Not Found' };
  }
}

export default async function ExhibitDetailPage({ params }: ExhibitDetailPageProps) {
  const { id } = await params;

  let exhibit;
  try {
    exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Exhibit: {exhibit.exhibitNumber || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{exhibit.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Type: {exhibit.type}</p>
        </div>
      </div>
    </div>
  );
}
