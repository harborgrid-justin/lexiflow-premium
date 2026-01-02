/**
 * Organizations Detail Page - Server Component with Data Fetching
 * Dynamic route for individual organization view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const org: any = await apiFetch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id));
    return {
      title: `${org.name} | LexiFlow`,
      description: `Organization profile for ${org.name}`,
    };
  } catch (error) {
    return { title: 'Organization Not Found' };
  }
}

export default async function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const { id } = await params;

  let org: any;
  try {
    org = await apiFetch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading organization...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{org.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
              <span className="ml-2 font-medium">{org.type}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Industry:</span>
              <span className="ml-2">{org.industry}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
              <p className="text-slate-700 dark:text-slate-300">{org.address}</p>
              <p className="text-slate-700 dark:text-slate-300">{org.phone}</p>
              <p className="text-slate-700 dark:text-slate-300">{org.email}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
