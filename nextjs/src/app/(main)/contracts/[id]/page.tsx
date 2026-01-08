/**
 * Contract Detail Page - Server Component
 * Contract details with terms, milestones, and amendments
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for contracts detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of contracts IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CONTRACTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch contracts list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: ContractDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const contract = await apiFetch(API_ENDPOINTS.CONTRACTS.DETAIL(id)) as any;
    return {
      title: `${contract.title} | Contracts | LexiFlow`,
      description: `Contract details: ${contract.title}`,
    };
  } catch {
    return { title: 'Contract Not Found' };
  }
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let contract;
  let milestones;
  let amendments;
  try {
    [contract, milestones, amendments] = await Promise.all([
      apiFetch(API_ENDPOINTS.CONTRACTS.DETAIL(id)),
      apiFetch(API_ENDPOINTS.CONTRACTS.MILESTONES(id)).catch(() => []),
      apiFetch(API_ENDPOINTS.CONTRACTS.AMENDMENTS(id)).catch(() => []),
    ]);
  } catch (error) {
    notFound();
  }

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contracts" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Contracts
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {contract.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {contract.parties.join(' • ')}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${contract.status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
              }`}
          >
            {contract.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Terms */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Terms</h2>
            <div className="prose dark:prose-invert max-w-none">
              {contract.terms ? (
                <div dangerouslySetInnerHTML={{ __html: contract.terms }} />
              ) : (
                <p className="text-slate-500">No terms available</p>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Milestones</h2>
            {milestones && milestones.length > 0 ? (
              <div className="space-y-4">
                {milestones.map((milestone: any) => (
                  <div
                    key={milestone.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{milestone.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${milestone.completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}
                      >
                        {milestone.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No milestones defined</p>
            )}
          </div>

          {/* Amendments */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Amendments</h2>
            {amendments && amendments.length > 0 ? (
              <div className="space-y-4">
                {amendments.map((amendment: any, index: number) => (
                  <div
                    key={amendment.id}
                    className="border border-slate-200 dark:border-slate-700 rounded p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Amendment {index + 1}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {amendment.summary}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(amendment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No amendments</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-slate-500">Value</dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {formatCurrency(contract.value, contract.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Effective Date</dt>
                <dd className="text-slate-900 dark:text-slate-50">
                  {new Date(contract.date).toLocaleDateString()}
                </dd>
              </div>
              {contract.endDate && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">End Date</dt>
                  <dd className="text-slate-900 dark:text-slate-50">
                    {new Date(contract.endDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-slate-500">Contract Type</dt>
                <dd className="text-slate-900 dark:text-slate-50">{contract.type}</dd>
              </div>
            </dl>
          </div>

          {/* Parties */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Parties</h2>
            <ul className="space-y-2">
              {contract.parties.map((party: string, index: number) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Party {index + 1}:
                  </span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">{party}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Add Amendment
              </button>
              <button className="w-full px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
