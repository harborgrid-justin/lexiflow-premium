
import React, { useState, useEffect } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Landmark, ArrowUpRight, ArrowDownLeft, Plus, FileText } from 'lucide-react';
import { FirmExpense } from '../../types';
import { DataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useWindow } from '../../context/WindowContext';

export const BillingLedger: React.FC = () => {
  const { theme, mode } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');
  
  // Enterprise Data Access
  const { data: expenses = [] } = useQuery<FirmExpense[]>(
      [STORES.EXPENSES, 'all'],
      DataService.expenses.getAll
  );

  const handleRecordTransaction = () => {
      const winId = `txn-new-${Date.now()}`;
      openWindow(
          winId,
          'Record Ledger Transaction',
          <div className="p-6 bg-white h-full">
              <div className="space-y-4">
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                          <select className="w-full border rounded p-2 text-sm">
                              <option>Expense</option>
                              <option>Income</option>
                              <option>Transfer</option>
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                          <input type="date" className="w-full border rounded p-2 text-sm" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
                      <input type="number" className="w-full border rounded p-2 text-sm" placeholder="0.00" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <textarea className="w-full border rounded p-2 text-sm h-24" placeholder="Transaction details..."></textarea>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => { alert('Transaction Logged'); closeWindow(winId); }}>Save</Button>
              </div>
          </div>
      );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
          <div className={cn("flex p-1 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
            <button 
                onClick={() => setActiveTab('operating')}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'operating' 
                        ? cn(theme.primary.DEFAULT, theme.text.inverse) 
                        : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
                )}
            >
                Operating Expenses
            </button>
            <button 
                onClick={() => setActiveTab('trust')}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'trust' 
                        ? "bg-green-600 text-white shadow" 
                        : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
                )}
            >
                Trust (IOLTA)
            </button>
          </div>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" icon={Plus} onClick={handleRecordTransaction}>Log Transaction</Button>
      </div>

      {activeTab === 'operating' ? (
        <div className="space-y-6">
            <div className={cn("rounded-lg p-6 shadow-lg border grid grid-cols-1 md:grid-cols-3 gap-6", mode === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 text-white")}>
                <div className="border-r pr-6">
                    <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.tertiary)}>Monthly Burn</p>
                    <p className={cn("text-3xl font-mono font-bold", theme.text.primary)}>$65,000</p>
                </div>
                <div className="border-r pr-6">
                    <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.tertiary)}>Expenses (MTD)</p>
                    <p className="text-2xl font-mono font-bold text-red-600 flex items-center"><ArrowDownLeft className="h-5 w-5 mr-1"/> $45,100</p>
                </div>
                <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme.text.tertiary)}>Cash Flow (MTD)</p>
                    <p className="text-2xl font-mono font-bold text-green-600 flex items-center"><ArrowUpRight className="h-5 w-5 mr-1"/> $80,320</p>
                </div>
            </div>

            <TableContainer>
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
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 border-2 border-dashed rounded-lg">
            IOLTA / Trust Account Ledger View
        </div>
      )}
    </div>
  );
};
