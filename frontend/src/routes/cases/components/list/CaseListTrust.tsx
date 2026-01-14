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
import { CheckSquare, Loader2 } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';

// Hooks & Context
import { useTheme } from '@/theme';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/shared/lib/cn';
// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { TrustAccount } from '@/types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CaseListTrust: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: Caching
  const { data: trustLedger = [], isLoading } = useQuery<TrustAccount[]>(
    ['trust', 'all'],
    () => DataService.billing.getTrustAccounts()
  );

  const totalBalance = trustLedger.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn("p-5 rounded-lg shadow-md", theme.primary.DEFAULT, theme.text.inverse)}>
          <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Trust Balance</p>
          <p className="text-3xl font-bold font-mono mt-1">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-200 mt-2 flex items-center"><CheckSquare className="h-3 w-3 mr-1" /> Reconciled Today</p>
        </div>
      </div>
      <TableContainer>
        <TableHeader>
          <TableHead>Acct ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Matter Ref</TableHead>
          <TableHead>Current Balance</TableHead>
          <TableHead>Last Reconciled</TableHead>
        </TableHeader>
        <TableBody>
          {trustLedger.map((account) => (
            <TableRow key={account.id}>
              <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{account.accountNumber}</TableCell>
              <TableCell className={cn("font-medium", theme.text.primary)}>{account.clientName || 'N/A'}</TableCell>
              <TableCell className={theme.text.primary}>{account.caseId || 'General'}</TableCell>
              <TableCell className={cn("font-mono font-bold", theme.text.primary)}>${account.balance.toLocaleString()}</TableCell>
              <TableCell className={cn("text-xs", theme.text.secondary)}>{formatDate(account.lastReconciledDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
