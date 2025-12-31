/**
 * @module components/billing/BillingInvoices
 * @category Billing
 * @description Invoice management with creation and distribution.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { CheckCircle, Download, Filter, Mail, Plus } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';
import { useTheme } from '@/providers/ThemeContext';

// Components
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';

// Utils & Constants
import { billingQueryKeys } from '@/services/infrastructure/queryKeys';
import { InvoiceStatusEnum } from '@/types/enums';
import { cn } from '@/utils/cn';
import { Formatters } from '@/utils/formatters';

// Types
import { Invoice } from '@/types';

// ============================================================================
// TYPES
// ============================================================================
interface MutationContext {
  previousInvoices?: Invoice[];
}

// ============================================================================
// COMPONENT
// ============================================================================
const BillingInvoicesComponent: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Enterprise Data Access with query keys
  const { data: invoices = [] } = useQuery<Invoice[]>(
    billingQueryKeys.billing.invoices(),
    () => (DataService && DataService.billing) ? DataService.billing.getInvoices() : Promise.resolve([])
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+s': () => {
      notify.info('Send selected invoice (to be implemented)');
    },
    'mod+p': () => {
      notify.info('Mark invoice as paid (to be implemented)');
    }
  });

  const { mutate: sendInvoice } = useMutation(
    (id: string) => (DataService && DataService.billing) ? DataService.billing.sendInvoice(id) : Promise.resolve(false),
    {
      // Concurrent-safe optimistic update: Functional state ensures latest data (Principle #5)
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(billingQueryKeys.billing.invoices())?.data;

        // Optimistically update to "Sent" - functional update pattern
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) => old.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatusEnum.SENT } : inv
          )
        );

        return { previousInvoices };
      },
      onSuccess: (_, id) => {
        notify.success(`Invoice ${id} sent successfully.`);
      },
      onError: (_, __, context?: MutationContext) => {
        // Rollback on error
        if (context?.previousInvoices) {
          queryClient.setQueryData(billingQueryKeys.billing.invoices(), context.previousInvoices);
        }
        notify.error('Failed to send invoice');
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      }
    }
  );

  // Mark Paid Mutation with concurrent-safe optimistic updates (Principle #5)
  const { mutate: markPaid } = useMutation(
    (id: string) => DataService.billing.updateInvoice(id, { status: InvoiceStatusEnum.PAID }),
    {
      // Functional update pattern prevents stale closures
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(billingQueryKeys.billing.invoices())?.data;

        // Optimistically update to "Paid"
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) => old.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatusEnum.PAID } : inv
          )
        );

        return { previousInvoices };
      },
      onSuccess: () => {
        notify.success("Invoice marked as PAID. Transaction recorded in immutable ledger.");
      },
      onError: (_, __, context?: MutationContext) => {
        // Rollback on error
        if (context?.previousInvoices) {
          queryClient.setQueryData(billingQueryKeys.billing.invoices(), context.previousInvoices);
        }
        notify.error("Failed to update invoice.");
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      }
    }
  );

  // Memoization with purpose: Filter recalc only on data/filter changes (Principle #13)
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = (inv.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  const getBadgeVariant = useCallback((status: string) => {
    if (status === InvoiceStatusEnum.PAID) return 'success';
    if (status === InvoiceStatusEnum.OVERDUE) return 'error';
    if (status === InvoiceStatusEnum.DRAFT) return 'neutral';
    return 'info';
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search invoices..."
        actions={
          <div className="flex gap-2">
            <div className={cn("flex items-center px-3 py-1.5 border rounded-md", theme.surface.highlight, theme.border.default)}>
              <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
              <select
                className={cn("bg-transparent text-sm outline-none border-none cursor-pointer", theme.text.primary)}
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <Button variant="primary" icon={Plus}>Create Invoice</Button>
          </div>
        }
      />

      <TableContainer responsive="card">
        <TableHeader>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Client / Matter</TableHead>
          <TableHead>Date Issued</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map(inv => (
            <TableRow key={inv.id}>
              <TableCell className={cn("font-mono font-medium", theme.text.primary)}>{inv.id}</TableCell>
              <TableCell>
                <div>
                  <div className={cn("font-bold text-sm", theme.text.primary)}>{inv.client}</div>
                  <div className={cn("text-xs", theme.text.secondary)}>{inv.matter}</div>
                </div>
              </TableCell>
              <TableCell>{inv.date}</TableCell>
              <TableCell>{inv.dueDate}</TableCell>
              <TableCell className={cn("text-right font-mono font-bold", theme.text.primary)}>
                {Formatters.currency(inv.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(inv.status)}>
                  {inv.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {inv.status !== 'Paid' && (
                    <Button size="sm" variant="secondary" icon={CheckCircle} onClick={() => markPaid(inv.id)} title="Mark Paid & Log Audit">Pay</Button>
                  )}
                  {inv.status === 'Draft' && <Button size="sm" variant="ghost" icon={Mail} onClick={() => sendInvoice(inv.id)}>Send</Button>}
                  <Button size="sm" variant="ghost" icon={Download}>PDF</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredInvoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className={cn("text-center py-8 italic", theme.text.tertiary)}>No invoices found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};

// Export memoized component
export const BillingInvoices = React.memo(BillingInvoicesComponent);
