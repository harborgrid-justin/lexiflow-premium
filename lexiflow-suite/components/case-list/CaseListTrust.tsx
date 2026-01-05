
import React from 'react';
import { CheckSquare } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton } from '../common/Table.tsx';
import { Skeleton } from '../common/Primitives.tsx';

interface CaseListTrustProps {
  isLoading?: boolean;
}

export const CaseListTrust: React.FC<CaseListTrustProps> = ({ isLoading = false }) => {
  const trustLedger = [
    { id: 'T-101', client: 'TechCorp Industries', matter: 'C-2024-001', balance: 45000, lastTx: '-$2,500 (Filing Fee)' },
    { id: 'T-102', client: 'OmniGlobal', matter: 'C-2024-112', balance: 1250000, lastTx: '+$500,000 (Deposit)' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-lg shadow-md">
          <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Trust Balance</p>
          {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1 bg-slate-700" />
          ) : (
              <p className="text-3xl font-bold font-mono mt-1">$1,295,000.00</p>
          )}
          <p className="text-xs text-emerald-400 mt-2 flex items-center"><CheckSquare className="h-3 w-3 mr-1"/> Reconciled Today</p>
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
          {isLoading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : (
            trustLedger.map(row => (
                <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-slate-500">{row.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{row.client}</TableCell>
                <TableCell>{row.matter}</TableCell>
                <TableCell className="font-mono font-bold text-slate-800">${row.balance.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-slate-500">{row.lastTx}</TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};
