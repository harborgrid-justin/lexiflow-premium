
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
import { Formatters } from '../../utils/formatters';
import { OperatingLedger } from '../practice/finance/OperatingLedger';
import { TrustLedger } from '../practice/finance/TrustLedger';

export const BillingLedger: React.FC = () => {
  const { theme, mode } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');
  
  // Enterprise Data Access
  const { data: expenses = [] } = useQuery<FirmExpense[]>(
      [STORES.EXPENSES, 'all'],
      DataService.expenses.getAll
  );
  
  const { data: trustAccounts = [] } = useQuery<any[]>(
      [STORES.TRUST, 'all'],
      DataService.billing.getTrustAccounts
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
          <div className={cn("flex p-1 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <button 
                onClick={() => setActiveTab('operating')}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'operating' 
                        ? cn(theme.primary.DEFAULT, theme.text.inverse) 
                        : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
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
                        : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
                )}
            >
                Trust (IOLTA)
            </button>
          </div>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" icon={Plus} onClick={handleRecordTransaction}>Log Transaction</Button>
      </div>

      {activeTab === 'operating' ? (
        <OperatingLedger expenses={expenses} />
      ) : (
        <TrustLedger trustAccounts={trustAccounts} />
      )}
    </div>
  );
};
