
import React, { useMemo } from 'react';
import { TimeEntry, BillingModel } from '../../types.ts';
import { Download, Clock, DollarSign, CheckCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { MetricCard } from '../common/Primitives.tsx';

interface CaseBillingProps {
    billingModel: BillingModel;
    value: number;
    entries: TimeEntry[];
}

export const CaseBilling: React.FC<CaseBillingProps> = ({ billingModel, value, entries }) => {
    const { unbilledTotal, billedTotal, totalHours, utilization } = useMemo(() => {
        const unbilled = entries
            .filter(e => e.status === 'Unbilled')
            .reduce((sum, e) => sum + e.total, 0);
        
        const billed = entries
            .filter(e => e.status === 'Billed')
            .reduce((sum, e) => sum + e.total, 0);

        const hours = entries.reduce((sum, e) => sum + (e.duration / 60), 0);
        const util = Math.min(100, Math.round(((unbilled + billed) / value) * 100));
        
        return { unbilledTotal: unbilled, billedTotal: billed, totalHours: hours, utilization: util };
    }, [entries, value]);

    return (
        <div className="space-y-6">
            {/* FIN-04: Standardized Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-slate-800 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unbilled WIP</p>
                             <div className="p-1.5 bg-blue-500/20 rounded text-blue-300 shadow-inner"><DollarSign size={14}/></div>
                        </div>
                        <p className="text-2xl font-mono font-bold tracking-tight">${unbilledTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" style={{width: '65%'}}></div>
                        </div>
                     </div>
                </div>

                <MetricCard 
                    label="Total Billed" 
                    value={`$${billedTotal.toLocaleString()}`} 
                    icon={CheckCircle} 
                    trend="Invoiced"
                    trendUp={true}
                    className="border-l-4 border-l-emerald-500 shadow-sm"
                />

                <MetricCard 
                    label="Hours Logged" 
                    value={totalHours.toFixed(1)} 
                    icon={Clock} 
                    trend={`${(totalHours * 0.9).toFixed(1)} Billable`}
                    className="border-l-4 border-l-blue-500 shadow-sm"
                />

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-blue-400 transition-colors">
                     <div className="absolute right-0 top-0 p-1">
                        <Badge variant="neutral" className="text-[9px] font-bold opacity-80 uppercase">{billingModel}</Badge>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Budget Burn</p>
                        <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{utilization}%</p>
                     </div>
                     <div className="text-[9px] text-slate-400 mt-2 font-mono font-bold">
                        CAP: ${value.toLocaleString()}
                     </div>
                </div>
            </div>

            {/* FIN-10: Advanced Ledger Pattern */}
            <Card 
                title="Consolidated Time Ledger" 
                subtitle="Matter accounting compliant with LEDES 1998B standards."
                action={<Button size="sm" variant="secondary" icon={Download} className="text-xs font-bold uppercase tracking-widest">Export LEDES</Button>}
                noPadding
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Description</th>
                                <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Rate</th>
                                <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Hours</th>
                                <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Amount</th>
                                <th scope="col" className="px-6 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {entries.map((e) => {
                                const isDebit = e.total < 0;
                                return (
                                <tr key={e.id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono font-bold text-slate-400">{e.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                                        <div className="flex items-center gap-2">
                                            {isDebit ? <ArrowUpRight className="h-3 w-3 text-red-500"/> : <ArrowDownLeft className="h-3 w-3 text-emerald-500"/>}
                                            {e.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 text-right font-mono tabular-nums">${e.rate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-bold tabular-nums">{(e.duration/60).toFixed(1)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right font-mono tabular-nums ${isDebit ? 'text-red-600' : 'text-slate-900'}`}>
                                        ${e.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Badge variant={e.status === 'Billed' ? 'success' : 'warning'} className="text-[10px] font-bold py-0.5 px-2">
                                            {e.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500">Matter Total</td>
                                <td className="px-6 py-4 text-right text-base font-mono font-black">${(unbilledTotal + billedTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    );
};
