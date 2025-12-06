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
                <TableContainer responsive="card">
                    <TableHeader>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                    </TableHeader>
                    <TableBody>
                        {entries.length > 0 ? entries.map((e) => (
                            <TableRow key={e.id}>
                                <TableCell className={cn("font-mono", theme.text.secondary)}>{e.date}</TableCell>
                                <TableCell className={cn("font-medium", theme.text.primary)}>{e.description}</TableCell>
                                <TableCell className={cn("text-right font-mono", theme.text.secondary)}>${e.rate}/hr</TableCell>
                                <TableCell className={cn("text-right font-bold", theme.text.primary)}>{(e.duration/60).toFixed(1)}</TableCell>
                                <TableCell className={cn("text-right font-mono", theme.text.primary)}>${e.total.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={e.status === 'Billed' ? 'success' : 'warning'}>{e.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className={cn("px-6 py-12 text-center italic", theme.text.tertiary)}>
                                    No time entries recorded for this matter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {entries.length > 0 && (
                        <tfoot className={cn("border-t", theme.border.default, theme.surfaceHighlight)}>
                            <tr>
                                <td colSpan={4} data-label="" className={cn("px-6 py-3 text-right text-xs font-bold uppercase", theme.text.secondary)}>Ledger Total</td>
                                <td data-label="Total" className={cn("px-6 py-3 text-right text-sm font-mono font-bold", theme.text.primary)}>${(unbilledTotal + billedTotal).toFixed(2)}</td>
                                <td data-label=""></td>
                            </tr>
                        </tfoot>
                    )}
                </TableContainer>
            </Card>
        </div>
    );
};