/**
 * Litigation Strategy Page - Server Component with Data Fetching
 * Strategic litigation planning and analysis with backend data
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Litigation Strategy | LexiFlow',
  description: 'Strategic litigation planning and analysis',
};

export default async function LitigationStrategyPage(): Promise<React.JSX.Element> {
  // Fetch trial and risk data
  let trialData = null;
  let risks = [];

  try {
    const [trial, risksData] = await Promise.all([
      apiFetch(API_ENDPOINTS.TRIAL.ROOT).catch(() => null) as Promise<any>,
      apiFetch(API_ENDPOINTS.RISKS.LIST).catch(() => []) as Promise<any[]>,
    ]);
    trialData = trial;
    risks = risksData;
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Litigation Strategy</h1>
      <Suspense fallback={<div>Loading strategy...</div>}>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Trial Preparation</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {trialData ? 'Trial data loaded' : 'No trial data available'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            {risks && risks.length > 0 ? (
              <div className="space-y-2">
                {risks.map((risk: any) => (
                  <div key={risk.id} className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                    <h4 className="font-medium">{risk.title || risk.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{risk.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No risks identified</p>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
