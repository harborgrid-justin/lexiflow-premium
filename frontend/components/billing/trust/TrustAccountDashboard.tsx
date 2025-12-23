/**
 * Trust Account Dashboard Component
 * 
 * ARCHITECTURAL PHILOSOPHY:
 * - **Separation of Concerns**: Business logic in hooks, UI in component
 * - **Type Safety**: Every prop, state, and callback is explicitly typed
 * - **Render Optimization**: React.memo prevents unnecessary re-renders
 * - **Accessibility**: ARIA labels, keyboard navigation, screen reader support
 * - **Compliance First**: Surfaces compliance issues prominently
 * 
 * WHY THIS DESIGN:
 * 1. Dashboard pattern provides at-a-glance compliance monitoring
 * 2. Card-based layout allows modular composition and responsive design
 * 3. Real-time compliance checks prevent violations before they occur
 * 4. Color-coded severity levels (error/warning) guide attorney attention
 * 5. Memoized computed values prevent expensive recalculations on re-render
 */

import React, { useMemo, useCallback, useState } from 'react';
import { Landmark, AlertCircle, CheckCircle, Clock, TrendingUp, Users, FileText } from 'lucide-react';
import { Card } from '../../common/Card';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Formatters } from '../../../utils/formatters';
import { useTrustAccounts } from '../../../hooks/useTrustAccounts';
import type { TrustAccount } from '../../../types/trust-accounts';
import { TrustAccountStatus } from '../../../types/trust-accounts';

/**
 * Dashboard Statistics Card Props
 * WHY: Isolated component props prevent prop drilling and enable reusability
 */
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

/**
 * Memoized Stat Card Component
 * WHY: React.memo prevents re-render when parent re-renders but props unchanged
 */
const StatCard = React.memo<StatCardProps>(({
  icon,
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  onClick,
}) => {
  const { theme } = useTheme();

  const variantStyles = useMemo(() => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.status.success.bg,
          border: theme.status.success.border,
          text: theme.status.success.text,
          icon: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'warning':
        return {
          bg: theme.status.warning.bg,
          border: theme.status.warning.border,
          text: theme.status.warning.text,
          icon: 'text-amber-600 dark:text-amber-400',
        };
      case 'error':
        return {
          bg: theme.status.error.bg,
          border: theme.status.error.border,
          text: theme.status.error.text,
          icon: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          bg: theme.bg.secondary,
          border: theme.border.primary,
          text: theme.text.primary,
          icon: theme.text.secondary,
        };
    }
  }, [variant, theme]);

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full text-left rounded-lg p-6 border transition-all',
        variantStyles.bg,
        variantStyles.border,
        onClick && 'hover:shadow-md cursor-pointer',
        !onClick && 'cursor-default'
      )}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', variantStyles.icon)}>
              {icon}
            </div>
            <h3 className={cn('text-sm font-medium', theme.text.secondary)}>
              {title}
            </h3>
          </div>
          
          <div className={cn('text-3xl font-bold mb-1', variantStyles.text)}>
            {value}
          </div>
          
          {subtitle && (
            <p className={cn('text-sm', theme.text.secondary)}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={cn(
                  'h-4 w-4',
                  trend.direction === 'up' && 'text-emerald-600',
                  trend.direction === 'down' && 'text-rose-600 rotate-180',
                  trend.direction === 'neutral' && 'text-slate-600'
                )}
              />
              <span className={cn('text-sm font-medium', theme.text.secondary)}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

StatCard.displayName = 'StatCard';

/**
 * Compliance Issue Card Props
 */
interface ComplianceIssueProps {
  issue: {
    accountId: string;
    issue: string;
    severity: 'warning' | 'error';
  };
  accountName: string;
  onViewAccount: (accountId: string) => void;
}

/**
 * Memoized Compliance Issue Card
 * WHY: Each issue is independent, memo prevents cascade re-renders
 */
const ComplianceIssueCard = React.memo<ComplianceIssueProps>(({
  issue,
  accountName,
  onViewAccount,
}) => {
  const { theme } = useTheme();

  const severityColor = useMemo(() => {
    return issue.severity === 'error'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-amber-600 dark:text-amber-400';
  }, [issue.severity]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        theme.bg.tertiary,
        theme.border.primary
      )}
    >
      <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', severityColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', theme.text.primary)}>
          {accountName}
        </p>
        <p className={cn('text-sm mt-1', theme.text.secondary)}>
          {issue.issue}
        </p>
        <button
          onClick={() => onViewAccount(issue.accountId)}
          className={cn(
            'text-sm font-medium mt-2 hover:underline',
            theme.text.link
          )}
        >
          View Account →
        </button>
      </div>
    </div>
  );
});

ComplianceIssueCard.displayName = 'ComplianceIssueCard';

/**
 * Account List Item Props
 */
interface AccountListItemProps {
  account: TrustAccount;
  onClick: (accountId: string) => void;
}

/**
 * Memoized Account List Item
 */
const AccountListItem = React.memo<AccountListItemProps>(({ account, onClick }) => {
  const { theme } = useTheme();

  const statusColor = useMemo(() => {
    switch (account.status) {
      case TrustAccountStatus.ACTIVE:
        return 'text-emerald-600 dark:text-emerald-400';
      case TrustAccountStatus.INACTIVE:
        return 'text-slate-600 dark:text-slate-400';
      case TrustAccountStatus.SUSPENDED:
        return 'text-amber-600 dark:text-amber-400';
      case TrustAccountStatus.CLOSED:
        return 'text-rose-600 dark:text-rose-400';
      default:
        return theme.text.secondary;
    }
  }, [account.status, theme]);

  const needsReconciliation = useMemo(() => {
    if (!account.nextReconciliationDue) return false;
    const dueDate = new Date(account.nextReconciliationDue);
    const now = new Date();
    return dueDate <= now;
  }, [account.nextReconciliationDue]);

  return (
    <button
      onClick={() => onClick(account.id)}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all hover:shadow-md',
        theme.bg.tertiary,
        theme.border.primary
      )}
      aria-label={`View ${account.accountName}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={cn('text-sm font-bold truncate', theme.text.primary)}>
              {account.accountName}
            </p>
            <span
              className={cn(
                'text-xs font-medium uppercase px-2 py-0.5 rounded',
                statusColor
              )}
            >
              {account.status}
            </span>
          </div>
          
          <p className={cn('text-xs mb-2', theme.text.secondary)}>
            {account.clientName} • {account.accountType.toUpperCase()}
          </p>
          
          <div className="flex items-center gap-4">
            <div>
              <p className={cn('text-xs', theme.text.secondary)}>Balance</p>
              <p className={cn('text-lg font-mono font-bold', theme.text.primary)}>
                {Formatters.currency(account.balance)}
              </p>
            </div>
            
            {account.lastReconciledDate && (
              <div>
                <p className={cn('text-xs', theme.text.secondary)}>Last Reconciled</p>
                <p className={cn('text-xs font-medium', theme.text.primary)}>
                  {new Date(account.lastReconciledDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          {needsReconciliation && (
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">
                Reconciliation Overdue
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

AccountListItem.displayName = 'AccountListItem';

/**
 * Main Dashboard Component
 */
export const TrustAccountDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState<'all' | 'iolta' | 'client'>('all');

  // Fetch trust accounts with computed values
  const {
    accounts,
    isLoading,
    isError,
    error,
    totalBalance,
    ioltaAccounts,
    activeAccounts,
    accountsNeedingReconciliation,
    complianceIssues,
    refetch,
  } = useTrustAccounts();

  /**
   * COMPUTED VALUES: Memoized dashboard statistics
   * WHY: Prevent recalculation on every render, only when accounts change
   */
  const stats = useMemo(() => {
    const errorCount = complianceIssues.filter((i) => i.severity === 'error').length;
    const warningCount = complianceIssues.filter((i) => i.severity === 'warning').length;
    const ioltaBalance = ioltaAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    return {
      totalBalance,
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      ioltaBalance,
      needsReconciliation: accountsNeedingReconciliation.length,
      errorCount,
      warningCount,
    };
  }, [accounts, activeAccounts, ioltaAccounts, totalBalance, accountsNeedingReconciliation, complianceIssues]);

  /**
   * FILTERED ACCOUNTS: Based on selected view
   * WHY: Memoized filtering prevents recalculation on every render
   */
  const filteredAccounts = useMemo(() => {
    switch (selectedView) {
      case 'iolta':
        return accounts.filter((acc) => acc.accountType === 'iolta');
      case 'client':
        return accounts.filter((acc) => acc.accountType === 'client_trust');
      default:
        return accounts;
    }
  }, [accounts, selectedView]);

  /**
   * EVENT HANDLERS: Memoized callbacks prevent child re-renders
   * WHY: useCallback ensures function identity stability
   */
  const handleViewAccount = useCallback((accountId: string) => {
    console.log('Navigate to account:', accountId);
    // TODO: Implement navigation to account detail
  }, []);

  const handleCreateAccount = useCallback(() => {
    console.log('Open create account form');
    // TODO: Implement create account flow
  }, []);

  const handleReconcileAccount = useCallback((accountId: string) => {
    console.log('Open reconciliation wizard:', accountId);
    // TODO: Implement reconciliation flow
  }, []);

  /**
   * LOADING STATE
   */
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-64', theme.bg.primary)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={cn('text-sm', theme.text.secondary)}>Loading trust accounts...</p>
        </div>
      </div>
    );
  }

  /**
   * ERROR STATE
   */
  if (isError) {
    return (
      <div className={cn('p-6 rounded-lg border', theme.status.error.bg, theme.status.error.border)}>
        <div className="flex items-start gap-3">
          <AlertCircle className={cn('h-5 w-5 flex-shrink-0', theme.status.error.text)} />
          <div>
            <h3 className={cn('text-sm font-medium mb-1', theme.status.error.text)}>
              Failed to Load Trust Accounts
            </h3>
            <p className={cn('text-sm', theme.status.error.text)}>
              {error?.message || 'An unknown error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className={cn(
                'mt-3 px-4 py-2 text-sm font-medium rounded-lg',
                'bg-rose-600 text-white hover:bg-rose-700'
              )}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * MAIN DASHBOARD RENDER
   */
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-2xl font-bold', theme.text.primary)}>
            Trust Account Management
          </h1>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            IOLTA & Client Trust Account Compliance Dashboard
          </p>
        </div>
        <button
          onClick={handleCreateAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Create Account
        </button>
      </div>

      {/* Critical Compliance Issues Banner */}
      {stats.errorCount > 0 && (
        <div
          className={cn(
            'p-4 rounded-lg border flex items-start gap-3',
            theme.status.error.bg,
            theme.status.error.border
          )}
        >
          <AlertCircle className={cn('h-5 w-5 flex-shrink-0', theme.status.error.text)} />
          <div>
            <h3 className={cn('text-sm font-bold', theme.status.error.text)}>
              {stats.errorCount} Critical Compliance {stats.errorCount === 1 ? 'Issue' : 'Issues'} Detected
            </h3>
            <p className={cn('text-sm mt-1', theme.status.error.text)}>
              Immediate action required to maintain state bar compliance.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Landmark className="h-5 w-5" />}
          title="Total Trust Liability"
          value={Formatters.currency(stats.totalBalance)}
          subtitle="All trust accounts"
          variant="success"
        />
        
        <StatCard
          icon={<Users className="h-5 w-5" />}
          title="Active Accounts"
          value={stats.activeAccounts}
          subtitle={`${stats.totalAccounts} total accounts`}
        />
        
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          title="Needs Reconciliation"
          value={stats.needsReconciliation}
          subtitle="Overdue monthly reconciliation"
          variant={stats.needsReconciliation > 0 ? 'warning' : 'default'}
          onClick={stats.needsReconciliation > 0 ? () => handleReconcileAccount(accountsNeedingReconciliation[0].id) : undefined}
        />
        
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          title="IOLTA Balance"
          value={Formatters.currency(stats.ioltaBalance)}
          subtitle={`${ioltaAccounts.length} IOLTA accounts`}
          variant="success"
        />
      </div>

      {/* Compliance Issues Section */}
      {complianceIssues.length > 0 && (
        <Card title="Compliance Issues" className="border-amber-200 dark:border-amber-800">
          <div className="space-y-3">
            {complianceIssues.map((issue, index) => {
              const account = accounts.find((a) => a.id === issue.accountId);
              return (
                <ComplianceIssueCard
                  key={`${issue.accountId}-${index}`}
                  issue={issue}
                  accountName={account?.accountName || 'Unknown Account'}
                  onViewAccount={handleViewAccount}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* Accounts Needing Reconciliation */}
      {accountsNeedingReconciliation.length > 0 && (
        <Card
          title="Reconciliation Required"
          className="border-amber-200 dark:border-amber-800"
        >
          <p className={cn('text-sm mb-4', theme.text.secondary)}>
            {accountsNeedingReconciliation.length} {accountsNeedingReconciliation.length === 1 ? 'account' : 'accounts'} {accountsNeedingReconciliation.length === 1 ? 'requires' : 'require'} monthly three-way reconciliation.
          </p>
          <div className="space-y-3">
            {accountsNeedingReconciliation.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div>
                  <p className={cn('text-sm font-medium', theme.text.primary)}>
                    {account.accountName}
                  </p>
                  <p className={cn('text-xs', theme.text.secondary)}>
                    Due: {account.nextReconciliationDue ? new Date(account.nextReconciliationDue).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <button
                  onClick={() => handleReconcileAccount(account.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reconcile
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Accounts List */}
      <Card title="Trust Accounts">
        {/* View Selector */}
        <div className="flex gap-2 mb-4">
          {(['all', 'iolta', 'client'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                selectedView === view
                  ? 'bg-blue-600 text-white'
                  : cn('hover:bg-slate-100 dark:hover:bg-slate-800', theme.text.secondary)
              )}
            >
              {view === 'all' && 'All Accounts'}
              {view === 'iolta' && 'IOLTA'}
              {view === 'client' && 'Client Trust'}
            </button>
          ))}
        </div>

        {/* Accounts Grid */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Landmark className={cn('h-12 w-12 mx-auto mb-3', theme.text.secondary)} />
            <p className={cn('text-sm font-medium', theme.text.secondary)}>
              No {selectedView !== 'all' ? selectedView.toUpperCase() : ''} accounts found
            </p>
            <button
              onClick={handleCreateAccount}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Create your first account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAccounts.map((account) => (
              <AccountListItem
                key={account.id}
                account={account}
                onClick={handleViewAccount}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
