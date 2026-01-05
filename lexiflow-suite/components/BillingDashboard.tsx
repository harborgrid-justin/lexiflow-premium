
import React, { useTransition, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, Download, Users, Activity, LayoutDashboard, FileText, Calculator, Landmark, TrendingDown, Briefcase } from 'lucide-react';
import { MOCK_WIP_DATA, MOCK_REALIZATION_DATA } from '../data/mockBilling.ts';
import { MOCK_CLIENTS } from '../data/mockClients.ts';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { MetricCard } from './common/Primitives.tsx';
import { InvoiceBuilder } from './finance/InvoiceBuilder.tsx';
import { RateManager } from './finance/RateManager.tsx';
import { LedgerReconciliation } from './finance/LedgerReconciliation.tsx';
import { BudgetForecaster } from './finance/BudgetForecaster.tsx';

interface BillingDashboardProps {
  navigateTo?: (view: string) => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
        setActiveTab(tabId);
    });
  };

  const tabs = [
    { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
    { id: 'rates', label: 'Fee Schedules', icon: Calculator },
    { id: 'ledger', label: 'Trust Ledger', icon: Landmark },
    { id: 'forecast', label: 'Forecasting', icon: TrendingDown },
  ];

  // Overview Data Logic
  const wipData = MOCK_WIP_DATA;
  const realizationData = MOCK_REALIZATION_DATA;
  const clients = MOCK_CLIENTS;
  const totalWip = useMemo(() => wipData.reduce((acc, curr) => acc + curr.wip, 0), [wipData]);

  const handleNav = (view: string) => {
      if (navigateTo) {
          startTransition(() => {
              navigateTo(view);
          });
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
        <div className="px-6 pt-6 pb-2 shrink-0">
            <PageHeader 
                title="Billing & Finance" 
                subtitle="Financial operations, invoicing, and trust account management."
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Download}>Export Reports</Button>
                        <Button variant="primary" icon={DollarSign}>Record Payment</Button>
                    </div>
                }
            />

            <TabNavigation 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
            />
        </div>

        <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            <div className="max-w-7xl mx-auto h-full">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* KPI Section - Using FIN-04 Financial KPI Design Pattern */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* KPI 1: Total WIP */}
                            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group cursor-default relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate pr-2">Total WIP</div>
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <DollarSign className="h-4 w-4"/>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <div className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">${totalWip.toLocaleString()}</div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <TrendingUp className="h-3 w-3 mr-1"/> +12%
                                </span>
                                <span className="text-slate-400 font-medium">vs last month</span>
                            </div>
                            <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-600 w-[65%] rounded-full group-hover:bg-blue-500 transition-colors"></div>
                            </div>
                            </div>

                            {/* KPI 2: Realization Rate */}
                            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate pr-2">Realization Rate</div>
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Activity className="h-4 w-4"/>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <div className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">92.4%</div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Target: <span className="font-bold text-slate-700">90%</span></span>
                                <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wide">On Track</span>
                            </div>
                            <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[92.4%] rounded-full"></div>
                            </div>
                            </div>

                            {/* KPI 3: Outstanding */}
                            <div className="p-5 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50 hover:shadow-md transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] text-red-600 uppercase tracking-wider font-bold truncate pr-2">Overdue (60+)</div>
                                <div className="p-1.5 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <AlertCircle className="h-4 w-4"/>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <div className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">$12,450</div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="inline-flex items-center text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                                    3 Invoices
                                </span>
                                <span className="text-red-500/80 font-medium cursor-pointer hover:underline">View Aging</span>
                            </div>
                            <div className="h-1 w-full bg-red-200 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-red-500 w-[15%] rounded-full"></div>
                            </div>
                            </div>
                        </div>

                        {/* Visualizations Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* FIN-23 Expense Bar Style Container */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-900">WIP vs Billed (Top Clients)</h3>
                                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors">View All</button>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wipData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#64748b'}} dy={10}/>
                                    <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#64748b'}} tickFormatter={(v) => `$${v/1000}k`}/>
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                    />
                                    <Bar dataKey="billed" stackId="a" fill="#cbd5e1" radius={[0,0,4,4]} barSize={32} name="Billed"/>
                                    <Bar dataKey="wip" stackId="a" fill="#3b82f6" radius={[4,4,0,0]} barSize={32} name="WIP"/>
                                </BarChart>
                                </ResponsiveContainer>
                            </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-900">Realization Breakdown</h3>
                                    <div className="flex gap-2">
                                        <span className="flex items-center text-[10px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Collected</span>
                                        <span className="flex items-center text-[10px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Write-off</span>
                                    </div>
                                </div>
                                <div className="h-64 flex justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={realizationData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                            {realizationData.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-slate-900 tracking-tight">85%</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Collected</span>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Client Portfolio Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center text-sm">
                                    <Users className="h-4 w-4 mr-2 text-blue-600"/> Client Portfolio
                                </h3>
                                <div className="flex gap-2">
                                    <button className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1">My Clients</button>
                                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Firm Wide</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                {/* My Clients Section */}
                                <div className="p-4 space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Portfolio</h4>
                                    {clients.slice(0, 1).map(client => (
                                        <div 
                                            key={client.id} 
                                            className="flex items-center p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                                            onClick={() => handleNav('crm')}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                                                <span className="text-blue-700 font-bold text-xs">{client.name.substring(0, 2)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{client.name}</div>
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{client.industry}</div>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <div className="text-sm font-bold text-slate-900 tabular-nums">${(client.totalBilled/1000).toFixed(0)}k</div>
                                                <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-1">
                                                Active
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Firm Clients Section */}
                                <div className="p-4 bg-slate-50/30 space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Firm Wide</h4>
                                    {clients.map(client => (
                                        <div 
                                            key={`firm-${client.id}`} 
                                            className="flex items-center p-3 border border-slate-200 bg-white rounded-xl hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group"
                                            onClick={() => handleNav('crm')}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mr-3">
                                                {client.industry === 'Technology' ? <Activity className="h-5 w-5 text-slate-500"/> : <Briefcase className="h-5 w-5 text-slate-500"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate">{client.name}</div>
                                                <div className="text-[10px] text-slate-500 flex items-center mt-0.5">
                                                    <Briefcase className="h-3 w-3 mr-1 opacity-70"/> {client.matters.length} Matters
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {/* FIN-100 Account Tier Style */}
                                                <div className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold border border-amber-500/30 shadow-sm uppercase tracking-wider">
                                                    PLATINUM
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'invoices' && <InvoiceBuilder />}
                {activeTab === 'rates' && <RateManager />}
                {activeTab === 'ledger' && <LedgerReconciliation />}
                {activeTab === 'forecast' && <BudgetForecaster />}
            </div>
        </div>
    </div>
  );
};
