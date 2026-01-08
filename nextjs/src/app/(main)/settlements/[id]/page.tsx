/**
 * Settlement Detail Page - Server Component with Data Fetching
 * Dynamic route for individual settlement view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface SettlementDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PaymentScheduleItem {
  date: string;
  amount: number;
  description: string;
}

interface SettlementDetail {
  id: string;
  offerAmount: number;
  party: string;
  date: string;
  acceptanceStatus: string;
  caseNumber: string;
  offerType: string;
  terms: string;
  paymentSchedule: PaymentScheduleItem[];
  releases: string[];
  confidentialityClause: string;
  effectiveDate: string | null;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for settlements detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of settlements IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.SETTLEMENTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch settlements list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: SettlementDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const settlement = await apiFetch(API_ENDPOINTS.SETTLEMENTS.DETAIL(id)) as SettlementDetail;
    return {
      title: `Settlement - ${settlement.offerType} | LexiFlow`,
      description: `Settlement offer for case ${settlement.caseNumber}`,
    };
  } catch (error) {
    return { title: 'Settlement Not Found' };
  }
}

export default async function SettlementDetailPage({ params }: SettlementDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let settlement: SettlementDetail;
  try {
    settlement = await apiFetch(API_ENDPOINTS.SETTLEMENTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading settlement...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{settlement.offerType}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Case: {settlement.caseNumber}</p>
              <p className="text-slate-600 dark:text-slate-400">Party: {settlement.party}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${settlement.offerAmount.toLocaleString()}
              </div>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mt-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {settlement.acceptanceStatus}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-6">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Offer Date:</span>
              <span className="ml-2">{settlement.date}</span>
            </div>
            {settlement.effectiveDate && (
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Effective Date:</span>
                <span className="ml-2">{settlement.effectiveDate}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Settlement Terms</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
                <p className="whitespace-pre-wrap">{settlement.terms}</p>
              </div>
            </div>

            {settlement.paymentSchedule && settlement.paymentSchedule.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Payment Schedule</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlement.paymentSchedule.map((payment, index) => (
                        <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-2">{payment.date}</td>
                          <td className="px-4 py-2 font-semibold">${payment.amount.toLocaleString()}</td>
                          <td className="px-4 py-2">{payment.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {settlement.releases && settlement.releases.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Releases</h2>
                <ul className="list-disc list-inside space-y-1">
                  {settlement.releases.map((release, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300">{release}</li>
                  ))}
                </ul>
              </div>
            )}

            {settlement.confidentialityClause && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Confidentiality Clause</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border-l-4 border-amber-500">
                  <p className="whitespace-pre-wrap">{settlement.confidentialityClause}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Accept Settlement
            </button>
            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
              Reject Settlement
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              Counter Offer
            </button>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
