
import React from 'react';
import { FirmExpense, OperatingSummary } from '../../../../types';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../common/Table';
import { Badge } from '../../../common/Badge';
import { Card } from '../../../common/Card';
import { Landmark, ArrowUpRight, ArrowDownLeft, PieChart, CreditCard } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { useQuery } from '../../../../hooks/useQueryHooks';
import { DataService } from '../../../../services/data/dataService';
import { Formatters } from '../../../../utils/formatters';

interface OperatingLedgerProps {
    expenses: FirmExpense[];
}

export const OperatingLedger: React.FC<OperatingLedgerProps> = ({ expenses: propExpenses }) => {
  const { theme, mode } = useTheme();

  const { data: summary } = useQuery<OperatingSummary>(
      ['billing', 'operating_summary'],
      DataService.billing.getOperatingSummary,
      { initialData: { balance: 0, expensesMtd: 0, cashFlowMtd: 0 } }
  );

  // Ensure expenses is always an array
  const expenses = Array.isArray(propExpenses) ? propExpenses : [];

  // Safe defaults for summary values
  const balance = summary?.balance ?? 0;
  const expensesMtd = summary?.expensesMtd ?? 0;
  const cashFlowMtd = summary?.cashFlowMtd ?? 0;

  return (
    <div className="space-y-6">
        <div className={cn("rounded-lg p-6 shadow-lg border grid grid-cols-1 md:grid-cols-3 gap-6", mode === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
            <div className={cn("border-r pr-6", theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.secondary)}>Operating Balance</p>
                <p className={cn("text-3xl font-mono font-bold mt-1 tracking-tight", theme.text.primary)}>{Formatters.currency(balance)}</p>
            </div>
            <div className={cn("border-r pr-6", theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.secondary)}>Expenses (MTD)</p>
                <p className={cn("text-2xl font-mono font-bold flex items-center", theme.status.error.text)}><ArrowDownLeft className="h-5 w-5 mr-1"/> {Formatters.currency(expensesMtd)}</p>
            </div>
            <div>
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.secondary)}>Cash Flow (MTD)</p>
                <p className={cn("text-2xl font-mono font-bold flex items-center", theme.status.success.text)}><ArrowUpRight className="h-5 w-5 mr-1"/> {Formatters.currency(cashFlowMtd)}</p>
            </div>
        </div>

        <Card title="General Ledger (Expenses)" noPadding>
            <TableContainer responsive="card" className="shadow-none border-0 rounded-none">
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
                    <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{Formatters.date(ex.date)}</TableCell>
                    <TableCell className={cn("font-medium", theme.text.primary)}>{ex.vendor}</TableCell>
                    <TableCell><Badge variant="neutral">{ex.category}</Badge></TableCell>
                    <TableCell className={cn("text-sm", theme.text.secondary)}>{ex.description}</TableCell>
                    <TableCell className={cn("font-mono font-bold text-right", theme.text.primary)}>{Formatters.currency(ex.amount)}</TableCell>
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
