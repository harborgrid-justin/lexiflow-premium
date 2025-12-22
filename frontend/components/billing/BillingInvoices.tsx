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
import React, { useState, useMemo } from 'react';
import { Plus, Mail, Download, Filter, CheckCircle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery, useMutation, queryClient } from '../../hooks/useQueryHooks';
import { STORES } from '../../services/data/db';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNotify } from '../../hooks/useNotify';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useCallback } from 'react';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SearchToolbar } from '../common/SearchToolbar';

// Utils & Constants
import { cn } from '../../utils/cn';
import { Formatters } from '../../utils/formatters';
import { billingQueryKeys } from '../../services/infrastructure/queryKeys';
import { InvoiceStatusEnum } from '../../types/enums';

// Types
import { Invoice } from '../../types';

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

  const { mutate: sendInvoice, isLoading: isSending } = useMutation(
      (id: string) => (DataService && DataService.billing) ? DataService.billing.sendInvoice(id) : Promise.resolve(false),
      {
          // Optimistic update
          onMutate: async (id: string) => {
            const previousInvoices = queryClient.getQueryState<Invoice[]>(billingQueryKeys.billing.invoices())?.data;
            
            // Optimistically update to "Sent"
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
          onError: (error, id, context: unknown) => {
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

  // Mark Paid Mutation with optimistic updates
  const { mutate: markPaid } = useMutation(
      (id: string) => DataService.billing.updateInvoice(id, { status: InvoiceStatusEnum.PAID }),
      {
          // Optimistic update
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
          onError: (error, id, context: unknown) => {
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

  const filteredInvoices = useMemo(() => {
      return invoices.filter(inv => {
        const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
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
                        <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                        <select 
                            className={cn("bg-transparent text-sm outline-none border-none cursor-pointer", theme.text.primary)}
                            value={filterStatus}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFilterStatus(e.target.value)}
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

