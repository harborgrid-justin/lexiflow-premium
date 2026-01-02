/**
 * Judgment Detail Page - Server Component with Data Fetching
 * Dynamic route for individual judgment view with terms, liens, garnishments, payments
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface JudgmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: JudgmentDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const judgment = await apiFetch(API_ENDPOINTS.JUDGMENTS.DETAIL(id)) as any;
    return {
      title: `Judgment ${judgment.judgmentNumber} | LexiFlow`,
      description: `Judgment details for case ${judgment.caseNumber}`,
    };
  } catch (error) {
    return { title: 'Judgment Not Found' };
  }
}

export default async function JudgmentDetailPage({ params }: JudgmentDetailPageProps) {
  const { id } = await params;

  let judgment: any;
  try {
    judgment = await apiFetch(API_ENDPOINTS.JUDGMENTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading judgment...</div>}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">Judgment {judgment.judgmentNumber}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Case: {judgment.caseNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">
                  ${judgment.amount?.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {judgment.status}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Date Entered:</span>
                <span className="ml-2">{judgment.dateEntered}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                <span className="ml-2">{judgment.type}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Judgment Terms</h2>
            <div className="space-y-3">
              {judgment.terms?.map((term: any, idx: number) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <span className="text-slate-700 dark:text-slate-300">{term.description}</span>
                  <span className="font-semibold">${term.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Liens & Garnishments */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Liens</h2>
              <div className="space-y-2">
                {judgment.liens?.map((lien: any) => (
                  <div key={lien.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                    <div className="font-semibold">{lien.type}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Amount: ${lien.amount?.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Filed: {lien.filedDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Garnishments</h2>
              <div className="space-y-2">
                {judgment.garnishments?.map((garnishment: any) => (
                  <div key={garnishment.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                    <div className="font-semibold">{garnishment.type}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Amount: ${garnishment.amount?.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Status: {garnishment.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {judgment.payments?.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3">{payment.date}</td>
                    <td className="px-4 py-3">{payment.method}</td>
                    <td className="px-4 py-3 text-right">${payment.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${payment.balance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
