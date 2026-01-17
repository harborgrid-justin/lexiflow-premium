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
import React from 'react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
// Removed unused DataService

// Hooks & Context

// Components
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';
import { useThemeContext } from "@/hooks/useTheme";

// Utils & Constants
// Removed unused billingQueryKeys and InvoiceStatusEnum
import { cn } from '@/lib/cn';
import { Formatters } from '@/utils/formatters';

import { useBillingInvoices } from '../hooks/useBillingInvoices';

import { getInvoiceBadgeVariant } from './utils/invoiceUtils';

// Types
// Removed unused Invoice import

// ============================================================================
// TYPES
// ============================================================================
// Removed MutationContext interface

// ============================================================================
// COMPONENT
// ============================================================================
function BillingInvoicesComponent() {
  const { theme } = useThemeContext();
  const notify = useNotify();

  // Updated Hook Usage (Rule 43: Stable/Tuple Return)
  const [
    { filteredInvoices, searchTerm, filterStatus }, // State
    { setSearchTerm, setFilterStatus, sendInvoice, markPaid } // Actions
  ] = useBillingInvoices();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+s': () => {
      notify.info('Send selected invoice (to be implemented)');
    },
    'mod+p': () => {
      notify.info('Mark invoice as paid (to be implemented)');
    }
  });

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
                <Badge variant={getInvoiceBadgeVariant(inv.status)}>
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
