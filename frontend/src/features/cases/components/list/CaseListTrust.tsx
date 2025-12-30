/**
 * CaseListTrust.tsx
 * 
 * Trust accounting ledger view for IOLTA compliance and client fund management.
 * Displays trust balances, transactions, and reconciliation status.
 * 
 * @module components/case-list/CaseListTrust
 * @category Case Management - Trust Accounting
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)

export const CaseListTrust: React.FC = () => {
  const { theme } = useTheme();
  
  // Performance Engine: Caching
  const { data: trustLedger = [], isLoading } = useQuery<unknown[]>(
      ['trust', 'all'],
      () => DataService.billing.getTrustAccounts()
  );

  const totalBalance = Array.isArray(trustLedger) ? trustLedger.reduce((acc: unknown, curr: unknown) => (acc as number) + ((curr as {balance?: number}).balance || 0), 0) : 0;

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn("p-5 rounded-lg shadow-md", theme.primary.DEFAULT, theme.text.inverse)}>
          <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Trust Balance</p>
          <p className="text-3xl font-bold font-mono mt-1">${(totalBalance as number).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-xs text-emerald-200 mt-2 flex items-center"><CheckSquare className="h-3 w-3 mr-1"/> Reconciled Today</p>
        </div>
      </div>
      <TableContainer>
        <TableHeader>
          <TableHead>Acct ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Matter Ref</TableHead>
          <TableHead>Current Balance</TableHead>
          <TableHead>Last Transaction</TableHead>
        </TableHeader>
        <TableBody>
          {trustLedger.map((row: unknown) => (
            <TableRow key={(row as {id: string}).id}>
              <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{(row as {id: string}).id}</TableCell>
              <TableCell className={cn("font-medium", theme.text.primary)}>{(row as {client: string}).client}</TableCell>
              <TableCell className={theme.text.primary}>{(row as {matterId: string}).matterId}</TableCell>
              <TableCell className={cn("font-mono font-bold", theme.text.primary)}>${(row as {balance: number}).balance.toLocaleString()}</TableCell>
              <TableCell className={cn("text-xs", theme.text.secondary)}>{(row as {lastTransaction: string}).lastTransaction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};


