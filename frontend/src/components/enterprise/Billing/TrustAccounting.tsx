/**
 * TrustAccounting Component
 * IOLTA trust accounting with client ledgers and three-way reconciliation
 */

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  Plus,
  Search,
  Shield,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

// Types
interface TrustAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: 'IOLTA' | 'Non-IOLTA';
  balance: number;
  currency: string;
  lastReconciled?: string;
  status: 'active' | 'inactive';
}

interface ClientTrustLedger {
  id: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterDescription?: string;
  balance: number;
  lastActivity?: string;
  status: 'active' | 'inactive' | 'depleted';
}

interface TrustTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'interest';
  clientName: string;
  matterDescription: string;
  amount: number;
  balance: number;
  description: string;
  checkNumber?: string;
  reference?: string;
}

interface ThreeWayReconciliation {
  id: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'discrepancy';
  bankStatementBalance: number;
  mainLedgerBalance: number;
  clientLedgersTotalBalance: number;
  difference: number;
  outstandingChecks: number;
  depositsInTransit: number;
  reconciledBy?: string;
  notes?: string;
}

interface ComplianceAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  message: string;
  clientName?: string;
  date: string;
  resolved: boolean;
}

interface TrustAccountingProps {
  accountId?: string;
  onReconcile?: (reconciliation: ThreeWayReconciliation) => void;
  onTransactionCreate?: (transaction: Partial<TrustTransaction>) => void;
}

export const TrustAccounting: React.FC<TrustAccountingProps> = ({
  accountId: initialAccountId,
  onReconcile,
  onTransactionCreate,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ledgers' | 'transactions' | 'reconciliation' | 'compliance'>('overview');
  const [selectedAccount, setSelectedAccount] = useState<string>(initialAccountId || '');
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const handleReconcile = (reconciliation: ThreeWayReconciliation) => {
    if (onReconcile) {
      onReconcile(reconciliation);
    }
  };

  const handleCreateTransaction = (transaction: Partial<TrustTransaction>) => {
    if (onTransactionCreate) {
      onTransactionCreate(transaction);
      setShowNewTransaction(false);
    }
  };

  // Mock data
  const trustAccounts: TrustAccount[] = [
    {
      id: '1',
      accountNumber: 'XXXX-4567',
      accountName: 'IOLTA Trust Account',
      bankName: 'First National Bank',
      accountType: 'IOLTA',
      balance: 2567890.50,
      currency: 'USD',
      lastReconciled: '2024-01-01',
      status: 'active',
    },
    {
      id: '2',
      accountNumber: 'XXXX-8901',
      accountName: 'Client Retainer Trust',
      bankName: 'First National Bank',
      accountType: 'Non-IOLTA',
      balance: 456780.00,
      currency: 'USD',
      lastReconciled: '2024-01-01',
      status: 'active',
    },
  ];

  const clientLedgers: ClientTrustLedger[] = [
    {
      id: '1',
      clientId: 'C-001',
      clientName: 'Acme Corporation',
      matterId: 'M-2024-001',
      matterDescription: 'Corporate Acquisition',
      balance: 125000.00,
      lastActivity: '2024-01-02',
      status: 'active',
    },
    {
      id: '2',
      clientId: 'C-002',
      clientName: 'TechStart LLC',
      matterId: 'M-2024-045',
      matterDescription: 'Patent Litigation',
      balance: 78500.00,
      lastActivity: '2023-12-28',
      status: 'active',
    },
    {
      id: '3',
      clientId: 'C-003',
      clientName: 'GlobalTrade Inc',
      matterId: 'M-2024-112',
      matterDescription: 'International Contract Dispute',
      balance: 0.00,
      lastActivity: '2023-12-15',
      status: 'depleted',
    },
  ];

  const transactions: TrustTransaction[] = [
    {
      id: '1',
      date: '2024-01-02',
      type: 'deposit',
      clientName: 'Acme Corporation',
      matterDescription: 'Corporate Acquisition',
      amount: 50000.00,
      balance: 125000.00,
      description: 'Initial retainer deposit',
      checkNumber: '1234',
      reference: 'Wire Transfer',
    },
    {
      id: '2',
      date: '2024-01-02',
      type: 'withdrawal',
      clientName: 'TechStart LLC',
      matterDescription: 'Patent Litigation',
      amount: -12500.00,
      balance: 78500.00,
      description: 'Legal fees - December 2023',
      checkNumber: '5678',
    },
  ];

  const reconciliations: ThreeWayReconciliation[] = [
    {
      id: '1',
      date: '2024-01-01',
      status: 'completed',
      bankStatementBalance: 2567890.50,
      mainLedgerBalance: 2567890.50,
      clientLedgersTotalBalance: 2567890.50,
      difference: 0.00,
      outstandingChecks: 0,
      depositsInTransit: 0,
      reconciledBy: 'Sarah Johnson',
      notes: 'All balances match - no discrepancies',
    },
    {
      id: '2',
      date: '2023-12-01',
      status: 'completed',
      bankStatementBalance: 2456780.00,
      mainLedgerBalance: 2456780.00,
      clientLedgersTotalBalance: 2456780.00,
      difference: 0.00,
      outstandingChecks: 1,
      depositsInTransit: 0,
      reconciledBy: 'Michael Chen',
    },
  ];

  const complianceAlerts: ComplianceAlert[] = [
    {
      id: '1',
      severity: 'critical',
      type: 'Negative Balance',
      message: 'Client ledger balance cannot be negative',
      clientName: 'Smith Family Trust',
      date: '2024-01-03',
      resolved: false,
    },
    {
      id: '2',
      severity: 'warning',
      type: 'Reconciliation Overdue',
      message: 'Monthly reconciliation is overdue by 5 days',
      date: '2024-01-03',
      resolved: false,
    },
    {
      id: '3',
      severity: 'info',
      type: 'Low Balance Alert',
      message: 'Client trust balance below minimum threshold',
      clientName: 'Johnson LLC',
      date: '2024-01-02',
      resolved: true,
    },
  ];

  const totalTrustBalance = trustAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalClientLedgers = clientLedgers.reduce((sum, ledger) => sum + ledger.balance, 0);
  const reconciliationMatch = Math.abs(totalTrustBalance - totalClientLedgers) < 0.01;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      depleted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      discrepancy: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || styles.active}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getAlertIcon = (severity: 'critical' | 'warning' | 'info') => {
    if (severity === 'critical') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    } else if (severity === 'warning') {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3 flex-1">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, clients..."
            className="flex-1 border-none bg-transparent focus:outline-none text-sm text-gray-700 dark:text-gray-300"
          />
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewTransaction(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Account Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Trust Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Select an account</option>
          {trustAccounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.accountName} - {account.accountNumber}
            </option>
          ))}
        </select>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Trust Accounting (IOLTA)
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Client trust funds with three-way reconciliation and compliance tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewTransaction(true)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <Shield className="h-4 w-4" />
            Reconcile
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Trust Balance
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                ${totalTrustBalance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Client Ledgers Total
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                ${totalClientLedgers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Reconciliation Status
              </p>
              <p className={`mt-2 text-3xl font-semibold ${reconciliationMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {reconciliationMatch ? 'Match' : 'Mismatch'}
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                {reconciliationMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={reconciliationMatch ? 'text-green-600' : 'text-red-600'}>
                  {reconciliationMatch ? 'Balanced' : `$${Math.abs(totalTrustBalance - totalClientLedgers).toFixed(2)} difference`}
                </span>
              </div>
            </div>
            <div className={`rounded-full p-3 ${reconciliationMatch ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <Shield className={`h-6 w-6 ${reconciliationMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Clients
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {clientLedgers.filter(l => l.status === 'active').length}
              </p>
            </div>
            <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-900/20">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      {complianceAlerts.filter(a => !a.resolved).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                {complianceAlerts.filter(a => !a.resolved).length} Compliance Alert{complianceAlerts.filter(a => !a.resolved).length !== 1 ? 's' : ''}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                Critical issues require immediate attention
              </p>
            </div>
            <button className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
              View All
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'ledgers', 'transactions', 'reconciliation', 'compliance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${selectedTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trust Accounts */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Trust Accounts
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {trustAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {account.accountName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.bankName} - {account.accountNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last reconciled: {account.lastReconciled ? new Date(account.lastReconciled).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${account.balance.toLocaleString()}
                    </p>
                    {getStatusBadge(account.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Transactions
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {transaction.clientName}
                      </h4>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${transaction.type === 'deposit'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${transaction.amount >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'ledgers' && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Client Trust Ledgers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Client / Matter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {clientLedgers.map((ledger) => (
                  <tr key={ledger.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {ledger.clientName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ledger.matterDescription}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${ledger.balance.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {ledger.lastActivity ? new Date(ledger.lastActivity).toLocaleDateString() : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(ledger.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'reconciliation' && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Three-Way Reconciliation
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {reconciliations.map((reconciliation) => (
              <div key={reconciliation.id} className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Reconciliation - {new Date(reconciliation.date).toLocaleDateString()}
                    </h4>
                    {reconciliation.reconciledBy && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        By {reconciliation.reconciledBy}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(reconciliation.status)}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Bank Statement Balance
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${reconciliation.bankStatementBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Main Ledger Balance
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${reconciliation.mainLedgerBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Client Ledgers Total
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${reconciliation.clientLedgersTotalBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {reconciliation.difference !== 0 && (
                  <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Difference: ${Math.abs(reconciliation.difference).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {reconciliation.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Notes:</span> {reconciliation.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'compliance' && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Compliance Alerts
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {complianceAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${alert.resolved
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50'
                    : alert.severity === 'critical'
                      ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                      : alert.severity === 'warning'
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
                        : 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {alert.type}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {alert.message}
                    </p>
                    {alert.clientName && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Client: {alert.clientName}
                      </p>
                    )}
                  </div>
                  {!alert.resolved && (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
