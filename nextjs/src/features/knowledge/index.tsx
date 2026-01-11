// components/knowledge/index.ts

// Base Module
export * from './base/KnowledgeAnalytics';
export * from './base/KnowledgeBase';
export * from './base/KnowledgeContent';
export * from './base/PrecedentsView';
export * from './base/QAView';
export * from './base/WikiView';

// Research Module
export * from './research';

// Citation Module
export * from './citation';

// Clauses Module
export * from './clauses';

// Rules Module
export * from './rules';

// Practice Module
export * from './practice';

// Jurisdiction Module
export * from './jurisdiction';

// Stub components (temporary)
import { DataService } from '@/services/core-services';
import type { BillingTransaction } from '@/types';
import { Formatters } from '@/utils/formatters';
import React, { useEffect, useState } from 'react';

interface LedgerProps {
  className?: string;
}

export const OperatingLedger: React.FC<LedgerProps> = ({ className }) => {
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      DataService.billing.getOperatingTransactions(),
      DataService.billing.getOperatingSummary(),
    ])
      .then(([txns, sum]) => {
        if (mounted) {
          setTransactions(txns);
          setSummary(sum);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load operating ledger');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {Formatters.currency(summary.totalRevenue)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {Formatters.currency(summary.totalExpenses)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Net Income</p>
              <p className="text-2xl font-bold text-blue-600">
                {Formatters.currency(summary.netIncome)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Operating Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {Formatters.date(txn.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${txn.type === 'Revenue' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {txn.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={txn.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}>
                        {Formatters.currency(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrustLedger: React.FC<LedgerProps> = ({ className }) => {
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    currentBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    lastReconciliation: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      DataService.billing.getTrustTransactions(),
      DataService.billing.getTrustSummary(),
    ])
      .then(([txns, sum]) => {
        if (mounted) {
          setTransactions(txns);
          setSummary(sum);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load trust ledger');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {Formatters.currency(summary.currentBalance)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Deposits</p>
              <p className="text-2xl font-bold text-blue-600">
                {Formatters.currency(summary.totalDeposits)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-600">
                {Formatters.currency(summary.totalWithdrawals)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Last Reconciliation</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Formatters.date(summary.lastReconciliation)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Trust Account Transactions
            </h3>
            <div className="flex space-x-3">
              <button className="text-sm text-blue-600 hover:underline">Export CSV</button>
              <button className="text-sm text-green-600 hover:underline">Reconcile</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Client/Matter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Deposit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Withdrawal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {Formatters.date(txn.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{txn.clientName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{txn.matterNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${txn.type === 'Deposit' ? 'text-green-600' :
                        txn.type === 'Withdrawal' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {txn.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                      {txn.deposit ? Formatters.currency(txn.deposit) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                      {txn.withdrawal ? Formatters.currency(txn.withdrawal) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900 dark:text-slate-100">
                      {Formatters.currency(txn.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
