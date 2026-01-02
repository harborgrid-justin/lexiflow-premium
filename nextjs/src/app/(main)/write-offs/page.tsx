/**
 * Write-Offs List Page - Server Component with Data Fetching
 * List view of all write-offs
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Write-Offs | LexiFlow',
  description: 'Manage write-offs and adjustments',
};

interface WriteOff {
  id: string;
  amount: number;
  reason: string;
  approver: string;
  date: string;
  status: string;
  clientName: string;
  caseNumber: string;
  category: string;
}

export default async function WriteOffsPage() {
  // Fetch write-offs from backend
  let writeOffs: WriteOff[] = [];

  try {
    writeOffs = await apiFetch(API_ENDPOINTS.WRITE_OFFS.LIST);
  } catch (error) {
    console.error('Failed to load write-offs:', error);
  }

  const totalWriteOffs = writeOffs.reduce((sum, wo) => sum + wo.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Write-Offs</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Total Write-Offs: <span className="font-bold text-2xl text-rose-600 dark:text-rose-400">${totalWriteOffs.toLocaleString()}</span>
          </p>
        </div>
        <Link
          href="/write-offs/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Write-Off
        </Link>
      </div>

      <Suspense fallback={<div>Loading write-offs...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {writeOffs && writeOffs.length > 0 ? (
            writeOffs.map((writeOff) => (
              <Link
                key={writeOff.id}
                href={`/write-offs/${writeOff.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{writeOff.category}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Client: {writeOff.clientName}</p>
                    <p className="text-xs text-slate-500 mt-1">Case: {writeOff.caseNumber}</p>
                    <p className="text-xs text-slate-500">Reason: {writeOff.reason}</p>
                    <p className="text-xs text-slate-500">Approver: {writeOff.approver}</p>
                    <p className="text-xs text-slate-500">Date: {writeOff.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      -${writeOff.amount.toLocaleString()}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      {writeOff.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No write-offs available</p>
          )}
        </div>
      </Suspense>

      <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
        <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-200 mb-2">Write-Off Policy</h2>
        <p className="text-sm text-rose-800 dark:text-rose-300">
          All write-offs require partner approval and must be documented with detailed justification. Write-offs impact revenue reporting and tax calculations.
        </p>
      </div>
    </div>
  );
}
