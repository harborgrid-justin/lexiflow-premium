import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { Button } from '@/components/ui/atoms/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { LegalEntity } from '@/types';
import { cn } from '@/shared/lib/cn';
import { CheckCircle, Clock, Plus, TrendingDown } from 'lucide-react';
import React from 'react';

interface Rate {
    firm: string;
    role: string;
    standardRate: number;
    negotiatedRate: number;
    savings: string;
    effectiveDate: string;
    status: string;
}

interface RateNegotiationProps {
    entities: LegalEntity[];
    rates?: Rate[];
}

export const RateNegotiation: React.FC<RateNegotiationProps> = ({ rates = [] }) => {
    const { theme } = useTheme();

    return (
        <div className="space-y-6">
            {rates.length > 0 && (
                <div className={cn("p-4 rounded-lg border flex justify-between items-center", theme.status.success.bg, theme.status.success.border)}>
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 bg-white/50 rounded-full shadow-sm", theme.status.success.text)}>
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-bold", theme.status.success.text)}>Rate Optimization</h3>
                            <p className={cn("text-sm", theme.status.success.text)}>Negotiated rates active.</p>
                        </div>
                    </div>
                    <Button variant="outline" className={cn("bg-white/50 border-emerald-200", theme.status.success.text, "hover:bg-white")}>View Analytics</Button>
                </div>
            )}

            <div className="flex justify-end">
                <Button variant="primary" size="sm" icon={Plus}>Add Rate</Button>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Firm</TableHead>
                    <TableHead>Timekeeper Role</TableHead>
                    <TableHead>Standard Rate</TableHead>
                    <TableHead>Negotiated Rate</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableHeader>
                <TableBody>
                    {rates.map((rate, i) => (
                        <TableRow key={i}>
                            <TableCell className={cn("font-bold", theme.text.primary)}>{rate.firm}</TableCell>
                            <TableCell>{rate.role}</TableCell>
                            <TableCell className="text-slate-400 line-through">${rate.standardRate}</TableCell>
                            <TableCell className={cn("font-mono font-bold", theme.text.primary)}>${rate.negotiatedRate}</TableCell>
                            <TableCell><span className="text-green-600 font-bold">{rate.savings}</span></TableCell>
                            <TableCell><div className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" /> {rate.effectiveDate}</div></TableCell>
                            <TableCell className="text-right">
                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approved
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                    {rates.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No rates configured.</TableCell></TableRow>}
                </TableBody>
            </TableContainer>
        </div>
    );
};
