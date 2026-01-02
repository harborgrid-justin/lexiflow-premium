/**
 * Contracts List Page - Server Component
 * Lists contracts with key details
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Contracts | LexiFlow',
  description: 'Contract management and tracking',
};

interface Contract {
  id: string;
  title: string;
  parties: string[];
  date: string;
  status: string;
  value: number;
  currency?: string;
}

async function ContractsList() {
  const contracts: Contract[] = await apiFetch(API_ENDPOINTS.CONTRACTS.LIST);

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-rose-100 text-rose-700',
    pending: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Parties
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/contracts/${contract.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {contract.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-slate-50">
                    {contract.parties.slice(0, 2).join(', ')}
                    {contract.parties.length > 2 && ` +${contract.parties.length - 2}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {new Date(contract.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[contract.status.toLowerCase() as keyof typeof statusColors] ||
                      statusColors.draft
                      }`}
                  >
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-50">
                  {formatCurrency(contract.value, contract.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contracts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No contracts found. Create your first contract.
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default async function ContractsPage(): Promise<JSX.Element> {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Contracts</h1>
        <Link
          href="/contracts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Contract
        </Link>
      </div>

      <Suspense fallback={<LoadingState />}>
        <ContractsList />
      </Suspense>
    </div>
  );
}
