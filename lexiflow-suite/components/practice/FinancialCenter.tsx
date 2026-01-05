
import React, { useState, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { MetricCard } from '../common/Primitives.tsx';
import { DollarSign, Landmark, CreditCard, PieChart, ArrowUpRight, ArrowDownLeft, Plus, Download, Activity, Wallet, FileText } from 'lucide-react';
import { MOCK_EXPENSES } from '../../data/models/firmExpense.ts';
import { Badge } from '../common/Badge.tsx';

export const FinancialCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');
  // Guideline 3: Transition for tab switching
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: 'operating' | 'trust') => {
      startTransition(() => {
          setActiveTab(tab);
      });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
                onClick={() => handleTabChange('operating')}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'operating' 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Operating Account
            </button>
            <button 
                onClick={() => handleTabChange('trust')}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'trust' 
                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                IOLTA / Trust
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" size="sm" icon={Download} className="flex-1 sm:flex-none">Export</Button>
              <Button variant="primary" size="sm" icon={Plus} className="flex-1 sm:flex-none">Record Tx</Button>
          </div>
      </div>

      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      {activeTab === 'operating' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Balance Card - Dark Mode Enterprise Style */}
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Operating Balance</p>
                            <p className="text-3xl font-mono font-bold tracking-tight">$482,500.00</p>
                        </div>
                        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700"><Landmark className="h-6 w-6 text-blue-400"/></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Income (MTD)</p>
                            <span className="text-green-400 font-mono text-sm font-bold flex items-center">
                                <ArrowUpRight className="h-3.5 w-3.5 mr-1.5"/> $125,420
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Expenses (MTD)</p>
                            <span className="text-red-400 font-mono text-sm font-bold flex items-center">
                                <ArrowDownLeft className="h-3.5 w-3.5 mr-1.5"/> $45,100
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <MetricCard 
                label="Monthly Burn Rate" 
                value="$65,000" 
                icon={PieChart}
                trend="Runway: 7.4 months"
                trendUp={true} // Neutral interpretation
                className="border-l-4 border-l-red-500"
            />

            <MetricCard 
                label="Accounts Receivable" 
                value="$112,000" 
                icon={CreditCard}
                trend="$15k overdue > 60 days"
                trendUp={false}
                className="border-l-4 border-l-amber-500"
            />
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
                {MOCK_EXPENSES.map(ex => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-mono text-slate-500 text-xs">{ex.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{ex.vendor}</TableCell>
                    <TableCell><Badge variant="neutral">{ex.category}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-600">{ex.description}</TableCell>
                    <TableCell className="font-mono font-bold text-slate-800 text-right">${ex.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={ex.status === 'Paid' ? 'success' : 'warning'}>{ex.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm border border-emerald-100"><Landmark className="h-8 w-8"/></div>
                <div>
                    <h3 className="text-xl font-bold text-emerald-900">Total Trust Liability (IOLTA)</h3>
                    <p className="text-sm text-emerald-800 mt-1 max-w-lg leading-relaxed">Client funds held in trust. Strictly regulated by State Bar. Daily reconciliation required.</p>
                </div>
            </div>
            <div className="text-right mt-4 md:mt-0 relative z-10">
              <p className="text-4xl font-mono font-bold text-emerald-800 tracking-tight drop-shadow-sm">$1,295,000.00</p>
              <div className="flex items-center justify-end mt-2">
                 <Badge variant="success" className="bg-white border-emerald-200 text-emerald-700 shadow-sm">
                    <FileText className="h-3 w-3 mr-1"/> Reconciled: Today 09:00 AM
                 </Badge>
              </div>
            </div>
          </div>

          <Card title="Client Trust Ledgers" noPadding>
            <div className="divide-y divide-slate-100">
              {[
                { client: 'TechCorp Industries', matter: 'Martinez v. TechCorp', id: 'C-2024-001', bal: 45000 },
                { client: 'OmniGlobal', matter: 'Merger Acquisition', id: 'C-2024-112', bal: 1250000 },
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-200">
                        <Wallet size={18}/>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{c.client}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{c.id}</span>
                            <span className="text-xs text-slate-500">{c.matter}</span>
                        </div>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="font-mono font-bold text-slate-900 text-lg">${c.bal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      <button className="text-xs text-blue-600 hover:underline font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">View Transactions</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};
