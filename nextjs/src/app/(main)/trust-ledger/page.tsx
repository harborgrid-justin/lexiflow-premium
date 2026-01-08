/**
 * Trust Ledger Page - Server Component with Data Fetching
 * Detailed trust account ledger with running balance
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Trust Ledger | LexiFlow',
  description: 'IOLTA trust account ledger and reconciliation',
};

async function TrustLedger() {
  const transactions = await apiFetch(API_ENDPOINTS.TRUST_LEDGER.TRANSACTIONS) as any[];
  const summary = await apiFetch(API_ENDPOINTS.TRUST_LEDGER.SUMMARY) as any;

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current Balance</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.currentBalance)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Deposits</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalDeposits)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Withdrawals</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalWithdrawals)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Last Reconciliation</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {new Date(summary.lastReconciliation).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Transaction History</h3>
          <div className="flex space-x-3">
            <button className="text-sm text-blue-600 hover:underline">Export CSV</button>
            <button className="text-sm text-green-600 hover:underline">Reconcile</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client/Matter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deposit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Withdrawal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reconciled</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{txn.clientName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{txn.matterNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getTransactionColor(txn.type)}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {txn.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    {txn.deposit ? formatCurrency(txn.deposit) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                    {txn.withdrawal ? formatCurrency(txn.withdrawal) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(txn.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {txn.reconciled ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-slate-300">○</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Reconciliation Required</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {summary.unreconciledCount} transactions pending reconciliation since {new Date(summary.lastReconciliation).toLocaleDateString()}
            </p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start Reconciliation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrustLedgerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Trust Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">IOLTA trust account transactions and reconciliation</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          New Transaction
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading trust ledger...</div>}>
        <TrustLedger />
      </Suspense>
    </div>
  );
}
