import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { Button } from '@/components/ui/atoms/Button';
import { TrendingDown, Clock, CheckCircle} from 'lucide-react';
import { LegalEntity } from '@/types';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

interface RateNegotiationProps {
  entities: LegalEntity[];
}

export const RateNegotiation: React.FC<RateNegotiationProps> = ({ entities }) => {
  const { theme } = useTheme();

  const lawFirms = entities.filter(e => e.type === 'Law Firm');

  // Mock rate data
  const rates = lawFirms.map((firm) => ({
      firm: firm.name,
      role: 'Partner',
      standardRate: 1100,
      negotiatedRate: 850,
      savings: '22%',
      effectiveDate: '2024-01-01',
      status: 'Approved'
  }));

  // Add associate rows
  lawFirms.forEach((firm) => {
      rates.push({
          firm: firm.name,
          role: 'Associate',
          standardRate: 650,
          negotiatedRate: 525,
          savings: '19%',
          effectiveDate: '2024-01-01',
          status: 'Approved'
      });
  });

  return (
    <div className="space-y-6">
        <div className={cn("p-4 rounded-lg border flex justify-between items-center", theme.status.success.bg, theme.status.success.border)}>
            <div className="flex items-center gap-4">
                <div className={cn("p-3 bg-white/50 rounded-full shadow-sm", theme.status.success.text)}>
                    <TrendingDown className="h-6 w-6"/>
                </div>
                <div>
                    <h3 className={cn("text-lg font-bold", theme.status.success.text)}>Rate Optimization</h3>
                    <p className={cn("text-sm", theme.status.success.text)}>Total savings of <strong>$1.2M</strong> projected for FY2024 via negotiated discounts.</p>
                </div>
            </div>
            <Button variant="outline" className={cn("bg-white/50 border-emerald-200", theme.status.success.text, "hover:bg-white")}>View Analytics</Button>
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
                        <TableCell><div className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3"/> {rate.effectiveDate}</div></TableCell>
                        <TableCell className="text-right">
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>
                                <CheckCircle className="h-3 w-3 mr-1"/> Approved
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
