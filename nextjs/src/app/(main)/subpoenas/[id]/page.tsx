/**
 * Subpoena Detail Page - Server Component with Data Fetching
 * Dynamic route for individual subpoena view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface SubpoenaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SubpoenaDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const subpoena: any = await apiFetch(API_ENDPOINTS.SUBPOENAS.DETAIL(id));
    return {
      title: `Subpoena: ${subpoena.type} | LexiFlow`,
      description: subpoena.description || 'Subpoena details',
    };
  } catch (error) {
    return { title: 'Subpoena Not Found' };
  }
}

export default async function SubpoenaDetailPage({ params }: SubpoenaDetailPageProps) {
  const { id } = await params;

  let subpoena: any;
  try {
    subpoena = await apiFetch(API_ENDPOINTS.SUBPOENAS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading subpoena...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{subpoena.type}</h1>
            <span className={`px-3 py-1 text-sm rounded ${subpoena.complianceStatus === 'Complied' ? 'bg-green-100 dark:bg-green-900' :
              subpoena.complianceStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-red-100 dark:bg-red-900'
              }`}>
              {subpoena.complianceStatus}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Served To:</span>
                <span className="ml-2 font-medium">{subpoena.servedTo}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Service Date:</span>
                <span className="ml-2">{subpoena.serviceDate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Response Due:</span>
                <span className="ml-2">{subpoena.responseDue}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Case Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Case Number:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{subpoena.caseNumber}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Issuing Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{subpoena.issuingParty}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Subpoena Text</h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {subpoena.fullText}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Service Proof</h2>
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Service Method:</span>
                    <div className="mt-1 text-slate-700 dark:text-slate-300">{subpoena.serviceMethod}</div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Process Server:</span>
                    <div className="mt-1 text-slate-700 dark:text-slate-300">{subpoena.processServer}</div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Served At:</span>
                    <div className="mt-1 text-slate-700 dark:text-slate-300">{subpoena.serviceLocation}</div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Proof Filed:</span>
                    <div className="mt-1 text-slate-700 dark:text-slate-300">
                      {subpoena.proofFiled ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Responses</h2>
              <div className="space-y-3">
                {subpoena.responses?.map((response: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {response.date}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mt-1">
                      {response.summary}
                    </div>
                  </div>
                ))}
                {(!subpoena.responses || subpoena.responses.length === 0) && (
                  <p className="text-slate-600 dark:text-slate-400">No responses filed</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Quash Motions</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {subpoena.quashMotions?.length || 0} motion(s) to quash filed
                {subpoena.quashMotions && subpoena.quashMotions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {subpoena.quashMotions.map((motion: any, index: number) => (
                      <div key={index} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                        <div className="font-medium text-amber-900 dark:text-amber-100">
                          {motion.title}
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Filed: {motion.filedDate} | Status: {motion.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
