/**
 * Jurisdiction Detail Page - Server Component with Data Fetching
 * Dynamic route for individual jurisdiction view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Jurisdiction } from '../../../../types';

interface JurisdictionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: JurisdictionDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const jurisdiction = (await apiFetch(API_ENDPOINTS.JURISDICTIONS.DETAIL(id))) as Jurisdiction;
    return {
      title: `${jurisdiction.name} | LexiFlow`,
      description: `Jurisdiction details for ${jurisdiction.name}`,
    };
  } catch (error) {
    return { title: 'Jurisdiction Not Found' };
  }
}

export default async function JurisdictionDetailPage({ params }: JurisdictionDetailPageProps) {
  const { id } = await params;

  let jurisdiction: Jurisdiction;
  try {
    jurisdiction = (await apiFetch(API_ENDPOINTS.JURISDICTIONS.DETAIL(id))) as Jurisdiction;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading jurisdiction...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">{jurisdiction.name}</h1>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                <span className="ml-2 font-medium">{jurisdiction.type}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Level:</span>
                <span className="ml-2 font-medium">{jurisdiction.level}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">State:</span>
                <span className="ml-2">{jurisdiction.state}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">County:</span>
                <span className="ml-2">{jurisdiction.county || 'N/A'}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Court Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Court Name:</span>
                  <span className="ml-2">{jurisdiction.courtName}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Address:</span>
                  <span className="ml-2">{jurisdiction.address}</span>
                </div>
                {jurisdiction.phone && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                    <span className="ml-2">{jurisdiction.phone}</span>
                  </div>
                )}
                {jurisdiction.website && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Website:</span>
                    <a href={jurisdiction.website} className="ml-2 text-blue-600 hover:underline">
                      {jurisdiction.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {jurisdiction.rules && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-3">Court Rules</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {jurisdiction.rules}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.caseCount || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Cases</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.judgeCount || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Judges</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.filingFee ? `$${jurisdiction.filingFee}` : 'N/A'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Filing Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
