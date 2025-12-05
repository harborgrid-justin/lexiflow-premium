
import React from 'react';
import { FirmExpense } from '../../../types';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Badge } from '../../common/Badge';
import { Card } from '../../common/Card';
import { Landmark, ArrowUpRight, ArrowDownLeft, PieChart, CreditCard } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useQuery } from '../../../services/queryClient';
import { STORES } from '../../../services/db';
import { DataService } from '../../../services/dataService';

export const OperatingLedger: React.FC = () => {
  const { theme, mode } = useTheme();

  // Enterprise Data Access
  const { data: expenses = [] } = useQuery<FirmExpense[]>(
      [STORES.EXPENSES, 'all'],
      DataService.expenses.getAll
  );

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("rounded-lg p-6 shadow-lg border", mode === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 text-white")}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Operating Balance</p>
                    <p className="text-3xl font-mono font-bold mt-1 tracking-tight">$482,500.00</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg"><Landmark className="h-6 w-6 text-blue-400"/></div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                  <div>
                      <p className="text-[10px] opacity-60 uppercase">Income (MTD)</p>
                      <span className="text-green-400 font-mono text-sm flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/> $125,420</span>
                  </div>
                  <div>
                      <p className="text-[10px] opacity-60 uppercase">Expenses (MTD)</p>
                      <span className="text-red-400 font-mono text-sm flex items-center"><ArrowDownLeft className="h-3 w-3 mr-1"/> $45,100</span>
                  </div>
                </div>
            </div>
            
            <div className={cn("rounded-lg p-6 shadow-sm border", theme.surface, theme.border.default)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Monthly Burn</p>
                    <p className={cn("text-3xl font-mono font-bold mt-1", theme.text.primary)}>$65,000</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg"><PieChart className="h-6 w-6 text-red-500"/></div>
                </div>
                <p className={cn("text-xs mt-4 font-medium", theme.text.secondary)}>Runway: <span className={theme.text.primary}>7.4 months</span></p>
            </div>

            <div className={cn("rounded-lg p-6 shadow-sm border", theme.surface, theme.border.default)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Accounts Receivable</p>
                    <p className={cn("text-3xl font-mono font-bold mt-1", theme.text.primary)}>$112,000</p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg"><CreditCard className="h-6 w-6 text-indigo-500"/></div>
                </div>
                <p className={cn("text-xs mt-4 font-medium", theme.text.secondary)}><span className="text-red-600 font-bold">$15k</span> overdue {'>'} 60 days</p>
            </div>
        </div>

        <Card title="General Ledger (Expenses)" noPadding>
            <TableContainer className="shadow-none border-0 rounded-none">
              <TableHeader>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableHeader>
              <TableBody>
                {expenses.map(ex => (
                  <TableRow key={ex.id}>
                    <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{ex.date}</TableCell>
                    <TableCell className={cn("font-medium", theme.text.primary)}>{ex.vendor}</TableCell>
                    <TableCell><Badge variant="neutral">{ex.category}</Badge></TableCell>
                    <TableCell className={cn("text-sm", theme.text.secondary)}>{ex.description}</TableCell>
                    <TableCell className={cn("font-mono font-bold text-right", theme.text.primary)}>${ex.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={ex.status === 'Paid' ? 'success' : 'warning'}>{ex.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
        </Card>
    </div>
  );
};
