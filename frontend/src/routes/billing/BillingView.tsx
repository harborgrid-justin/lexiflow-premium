/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useBilling } from './BillingProvider';

/**
 * BillingView - Pure Presentation Layer
 *
 * Responsibilities:
 * - Render UI based on context
 * - NO business logic
 * - NO data fetching
 * - Event handlers pass events up
 */
export function BillingView() {
  const { state, metrics, actions, isPending } = useBilling();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Billing & Finance"
        subtitle="Invoice management, time tracking, and financial reporting"
        actions={
          <Button variant="primary" size="md">
            <DollarSign className="w-4 h-4" />
            Create Invoice
          </Button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          trend="+12.5%"
        />
        <MetricCard
          title="Outstanding"
          value={`$${metrics.outstandingBalance.toLocaleString()}`}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          subtitle={`${metrics.overdueInvoices} overdue`}
        />
        <MetricCard
          title="Paid Invoices"
          value={metrics.paidInvoices.toString()}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          subtitle={`${metrics.pendingInvoices} pending`}
        />
        <MetricCard
          title="Billable Hours"
          value={metrics.totalBillableHours.toFixed(1)}
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          subtitle={`${metrics.unbilledHours.toFixed(1)} unbilled`}
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="flex space-x-4" aria-label="Billing sections">
          <TabButton
            active={state.activeTab === 'invoices'}
            onClick={() => actions.setActiveTab('invoices')}
            disabled={isPending}
          >
            Invoices ({state.invoices.length})
          </TabButton>
          <TabButton
            active={state.activeTab === 'transactions'}
            onClick={() => actions.setActiveTab('transactions')}
            disabled={isPending}
          >
            Transactions ({state.transactions.length})
          </TabButton>
          <TabButton
            active={state.activeTab === 'time'}
            onClick={() => actions.setActiveTab('time')}
            disabled={isPending}
          >
            Time Entries ({state.timeEntries.length})
          </TabButton>
          <TabButton
            active={state.activeTab === 'rates'}
            onClick={() => actions.setActiveTab('rates')}
            disabled={isPending}
          >
            Rates
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Loading...</div>
          </div>
        )}

        {!isPending && state.activeTab === 'invoices' && (
          <div className="space-y-2">
            {state.invoices.map(invoice => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}

        {!isPending && state.activeTab === 'transactions' && (
          <div className="space-y-2">
            {state.transactions.map(txn => (
              <TransactionRow key={txn.id} transaction={txn} />
            ))}
          </div>
        )}

        {!isPending && state.activeTab === 'time' && (
          <div className="space-y-2">
            {state.timeEntries.map(entry => (
              <TimeEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {!isPending && state.activeTab === 'rates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.rates.map(rate => (
              <RateCard key={rate.id} rate={rate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Presentation Components
function MetricCard({ title, value, icon, trend, subtitle }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  subtitle?: string;
}) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: 'var(--color-textMuted)' }} className="text-sm">{title}</span>
        {icon}
      </div>
      <div style={{ color: 'var(--color-text)' }} className="text-2xl font-semibold mb-1">
        {value}
      </div>
      {(trend || subtitle) && (
        <div className="text-xs text-slate-500">
          {trend && <span className="text-emerald-600">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

import type { Invoice } from '@/types';

function TabButton({ active, onClick, disabled, children }: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', active
        ? cn(theme.border.focus, theme.colors.primary)
        : cn('border-transparent', theme.text.secondary, `hover:${theme.text.primary}`)
        , disabled && 'opacity-50 cursor-not-allowed')}
    >
      {children}
    </button>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: 'var(--color-text)' }} className="font-medium">
            Invoice #{invoice.invoiceNumber}
          </div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">
            {invoice.clientName} • Due {new Date(invoice.dueDate).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: 'var(--color-text)' }} className="text-lg font-semibold">
            ${invoice.totalAmount.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${invoice.status === 'paid' ? 'text-emerald-600' :
            invoice.status === 'pending' ? 'text-amber-600' :
              'text-rose-600'
            }`}>
            {invoice.status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: 'var(--color-text)' }} className="font-medium">
            {transaction.description}
          </div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">
            {new Date(transaction.date).toLocaleDateString()} • {transaction.method}
          </div>
        </div>
        <div className={`text-lg font-semibold ${transaction.type === 'payment' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
          }`}>
          {transaction.type === 'payment' ? '+' : ''}${transaction.amount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function TimeEntryRow({ entry }: { entry: TimeEntry }) {
  const hours = entry.duration || 0;
  const rate = entry.rate || 0;
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div style={{ color: 'var(--color-text)' }} className="font-medium">
            {entry.description}
          </div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">
            {entry.userId} • {new Date(entry.date).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: 'var(--color-text)' }} className="text-lg font-semibold">
            {hours}h
          </div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-xs">
            ${(hours * rate).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RateCard({ rate }: { rate: BillingRate }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
      <div style={{ color: 'var(--color-text)' }} className="font-medium mb-2">
        {rate.title}
      </div>
      <div className="text-2xl font-bold text-blue-600 mb-1">
        ${rate.hourlyRate}/hr
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {rate.description}
      </div>
    </div>
  );
}
