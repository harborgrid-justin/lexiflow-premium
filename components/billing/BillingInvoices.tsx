import React, { useState, useMemo } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SearchToolbar } from '../common/SearchToolbar';
import { Plus, Mail, Download, Filter, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { ChainService } from '../../services/chainService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useNotify } from '../../hooks/useNotify';
import { UserId } from '../../types';

interface Invoice {
  id: string;
  client: string;
  matter: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export const BillingInvoices: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Enterprise Data Access
  const { data: invoices = [] } = useQuery<Invoice[]>(
      [STORES.INVOICES, 'all'],
      DataService.billing.getInvoices as any 
  );

  const { mutate: sendInvoice, isLoading: isSending } = useMutation(
      DataService.billing.sendInvoice,
      {
          onSuccess: (_, id) => {
              notify.success(`Invoice ${id} sent successfully.`);
              queryClient.invalidate([STORES.INVOICES, 'all']);
          }
      }
  );

  // Mark Paid Mutation
  const { mutate: markPaid } = useMutation(
      async (id: string) => {
          // 1. Update Invoice Status in DB
          await DataService.billing.updateInvoice(id, { status: 'Paid' });
          
          // 2. Create Immutable Audit Record
          const prevHash = '0000000000000000000000000000000000000000000000000000000000000000'; // In real app, fetch last hash from DB
          await ChainService.createEntry({
              timestamp: new Date().toISOString(),
              user: 'Current User', // Replace with actual user name
              userId: 'current-user-id' as UserId, // Replace with actual user ID
              action: 'INVOICE_PAID',
              resource: `Invoice/${id}`,
              ip: '127.0.0.1' // Replace with actual IP
          }, prevHash);
      },
      {
          onSuccess: () => {
              notify.success("Invoice marked as PAID. Transaction recorded in immutable ledger.");
              queryClient.invalidate([STORES.INVOICES, 'all']);
          },
          onError: () => notify.error("Failed to update invoice.")
      }
  );

  const filteredInvoices = useMemo(() => {
      return invoices.filter(inv => {
        const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
  }, [invoices, searchTerm, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
        <SearchToolbar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search invoices..."
            actions={
                <div className="flex gap-2">
                    <div className={cn("flex items-center px-3 py-1.5 border rounded-md", theme.surfaceHighlight, theme.border.default)}>
                        <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                        <select 
                            className={cn("bg-transparent text-sm outline-none border-none cursor-pointer", theme.text.primary)}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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
                            ${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                inv.status === 'Paid' ? 'success' : 
                                inv.status === 'Overdue' ? 'error' : 
                                inv.status === 'Draft' ? 'neutral' : 'info'
                            }>
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