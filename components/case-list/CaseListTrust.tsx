
import React from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const CaseListTrust: React.FC = () => {
  const { theme } = useTheme();
  
  // Performance Engine: Caching
  const { data: trustLedger = [], isLoading } = useQuery<any[]>(
      [STORES.TRUST, 'all'],
      DataService.billing.getTrustAccounts
  );

  const totalBalance = trustLedger.reduce((acc, curr) => acc + curr.balance, 0);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn("p-5 rounded-lg shadow-md", theme.primary.DEFAULT, theme.text.inverse)}>
          <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Trust Balance</p>
          <p className="text-3xl font-bold font-mono mt-1">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
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
          {trustLedger.map(row => (
            <TableRow key={row.id}>
              <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{row.id}</TableCell>
              <TableCell className={cn("font-medium", theme.text.primary)}>{row.client}</TableCell>
              <TableCell className={theme.text.primary}>{row.matterId}</TableCell>
              <TableCell className={cn("font-mono font-bold", theme.text.primary)}>${row.balance.toLocaleString()}</TableCell>
              <TableCell className={cn("text-xs", theme.text.secondary)}>{row.lastTransaction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
