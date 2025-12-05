
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Card } from '../../common/Card';
import { Landmark, FileText } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { STORES } from '../../../services/db';

export const TrustLedger: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: trustAccounts = [] } = useQuery<any[]>(
      [STORES.TRUST, 'all'],
      DataService.billing.getTrustAccounts
  );

  const totalLiability = trustAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-700"><Landmark className="h-8 w-8"/></div>
                <div>
                    <h3 className="text-xl font-bold text-green-900">Total Trust Liability (IOLTA)</h3>
                    <p className="text-sm text-green-700 mt-1 max-w-lg">Client funds held in trust. Strictly regulated by State Bar. Daily reconciliation required.</p>
                </div>
            </div>
            <div className="text-right mt-4 md:mt-0">
                <p className="text-4xl font-mono font-bold text-green-800 tracking-tight">${totalLiability.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <p className="text-xs text-green-600 font-bold uppercase mt-1 flex items-center justify-end"><FileText className="h-3 w-3 mr-1"/> Reconciled: Today 09:00 AM</p>
            </div>
        </div>

        <Card title="Client Trust Ledgers" noPadding>
            <TableContainer className="shadow-none border-0 rounded-none">
                <TableHeader>
                    <TableHead>Client</TableHead>
                    <TableHead>Matter Reference</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                </TableHeader>
                <TableBody>
                    {trustAccounts.map((c, i) => (
                        <TableRow key={i}>
                            <TableCell className={cn("font-bold", theme.text.primary)}>{c.client}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className={cn("text-xs font-mono", theme.text.secondary)}>{c.matterId}</span>
                                    <span className={cn("text-sm", theme.text.primary)}>{c.matter}</span>
                                </div>
                            </TableCell>
                            <TableCell className={theme.text.secondary}>{c.lastTransaction}</TableCell>
                            <TableCell className={cn("text-right font-mono font-bold", theme.text.primary)}>${c.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </Card>
    </div>
  );
};
