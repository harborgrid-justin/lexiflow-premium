/**
 * Mediation List Page - Server Component
 * Overview of mediation sessions with mediator, parties, dates, and outcomes
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Mediation | LexiFlow',
  description: 'Track mediation sessions and alternative dispute resolution',
};

export default async function MediationPage(): Promise<React.JSX.Element> {
  const sessions = await apiFetch(API_ENDPOINTS.MEDIATION.LIST);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Mediation Sessions</h1>
        <Link
          href="/mediation/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Schedule Mediation
        </Link>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading sessions...</div>}>
        <div className="grid grid-cols-1 gap-6">
          {sessions?.map((session: any) => (
            <div key={session.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/mediation/${session.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                    {session.caseName || `Mediation #${session.id}`}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session.caseNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.outcome === 'Settled' ? 'bg-green-100 text-green-800' :
                    session.outcome === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      session.outcome === 'Failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                  }`}>
                  {session.outcome || 'Scheduled'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Mediator</span>
                  <p className="font-medium">{session.mediatorName}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Session Date</span>
                  <p className="font-medium">{new Date(session.sessionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Parties</span>
                  <p className="font-medium">{session.parties?.length || 0} parties</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Location</span>
                  <p className="font-medium">{session.location || 'Virtual'}</p>
                </div>
              </div>

              {session.settlementAmount && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Settlement Amount: </span>
                  <span className="font-semibold text-green-600">${session.settlementAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}

          {(!sessions || sessions.length === 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
              <p className="text-slate-500 mb-4">No mediation sessions scheduled.</p>
              <Link
                href="/mediation/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Your First Mediation
              </Link>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
