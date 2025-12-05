
import React from 'react';
import { TimeEntry, BillingModel } from '../../types';
import { Download, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CaseBillingProps {
    billingModel: BillingModel;
    value: number;
    entries: TimeEntry[];
}

export const CaseBilling: React.FC<CaseBillingProps> = ({ billingModel, value, entries }) => {
    const { theme } = useTheme();

    // Calculate totals dynamically based on props
    const unbilledTotal = entries
        .filter(e => e.status === 'Unbilled')
        .reduce((sum, e) => sum + e.total, 0);
    
    const billedTotal = entries
        .filter(e => e.status === 'Billed')
        .reduce((sum, e) => sum + e.total, 0);

    const totalHours = entries.reduce((sum, e) => sum + (e.duration / 60), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={cn("p-5 rounded-lg shadow-md flex flex-col justify-between bg-slate-900 text-white border border-slate-800")}>
                    <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Unbilled WIP</p>
                        <p className="text-2xl font-mono font-bold mt-1">${unbilledTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{width: '65%'}}></div>
                    </div>
                </div>
                <div className={cn("p-5 rounded-lg shadow-sm flex flex-col justify-between border", theme.surface, theme.border.default)}>
                    <p className={cn("text-xs uppercase font-bold tracking-wider", theme.text.secondary)}>Total Billed</p>
                    <div className="flex items-end justify-between">
                        <p className={cn("text-2xl font-mono font-bold", theme.text.primary)}>${billedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <TrendingUp className="h-5 w-5 text-green-600 mb-1"/>
                    </div>
                </div>
                <div className={cn("p-5 rounded-lg shadow-sm flex flex-col justify-between border", theme.surface, theme.border.default)}>
                    <p className={cn("text-xs uppercase font-bold tracking-wider", theme.text.secondary)}>Hours Logged</p>
                    <div className="flex items-end justify-between">
                        <p className={cn("text-2xl font-bold", theme.text.primary)}>{totalHours.toFixed(1)} <span className={cn("text-sm font-normal", theme.text.tertiary)}>hrs</span></p>
                        <Clock className="h-5 w-5 text-blue-600 mb-1"/>
                    </div>
                </div>
                <div className={cn("p-5 rounded-lg shadow-sm flex flex-col justify-between border", theme.surface, theme.border.default)}>
                    <p className={cn("text-xs uppercase font-bold tracking-wider", theme.text.secondary)}>Matter Budget</p>
                    <div className="flex items-end justify-between">
                        <p className={cn("text-2xl font-mono font-bold", theme.text.primary)}>${value.toLocaleString()}</p>
                        <Badge variant="neutral">{billingModel}</Badge>
                    </div>
                </div>
            </div>

            <Card 
                title="Time Ledger" 
                action={<Button size="sm" variant="outline" icon={Download}>Export LEDES</Button>}
                noPadding
            >
                <div className="overflow-x-auto">
                    <table className={cn("min-w-full divide-y", theme.border.default)}>
                        <thead className={cn(theme.surfaceHighlight)}>
                            <tr>
                                <th className={cn("px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Date</th>
                                <th className={cn("px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Description</th>
                                <th className={cn("px-6 py-3 text-right text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Rate</th>
                                <th className={cn("px-6 py-3 text-right text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Hours</th>
                                <th className={cn("px-6 py-3 text-right text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Total</th>
                                <th className={cn("px-6 py-3 text-center text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>Status</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", theme.border.light, theme.surface)}>
                            {entries.length > 0 ? entries.map((e, idx) => (
                                <tr key={e.id} className={cn("transition-colors group", `hover:${theme.surfaceHighlight}`)}>
                                    <td className={cn("px-6 py-3 whitespace-nowrap text-sm font-mono", theme.text.secondary)}>{e.date}</td>
                                    <td className={cn("px-6 py-3 text-sm font-medium", theme.text.primary)}>{e.description}</td>
                                    <td className={cn("px-6 py-3 whitespace-nowrap text-sm text-right font-mono", theme.text.secondary)}>${e.rate}/hr</td>
                                    <td className={cn("px-6 py-3 whitespace-nowrap text-sm text-right font-bold", theme.text.primary)}>{(e.duration/60).toFixed(1)}</td>
                                    <td className={cn("px-6 py-3 whitespace-nowrap text-sm text-right font-mono", theme.text.primary)}>${e.total.toFixed(2)}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-center">
                                        <Badge variant={e.status === 'Billed' ? 'success' : 'warning'}>{e.status}</Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className={cn("px-6 py-12 text-center italic", theme.text.tertiary)}>
                                        No time entries recorded for this matter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {entries.length > 0 && (
                            <tfoot className={cn("border-t", theme.border.default, theme.surfaceHighlight)}>
                                <tr>
                                    <td colSpan={4} className={cn("px-6 py-3 text-right text-xs font-bold uppercase", theme.text.secondary)}>Ledger Total</td>
                                    <td className={cn("px-6 py-3 text-right text-sm font-mono font-bold", theme.text.primary)}>${(unbilledTotal + billedTotal).toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>
        </div>
    );
};
