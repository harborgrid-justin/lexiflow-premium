
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Button } from '../../common/Button';
import { Download, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { LegalEntity } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface RateNegotiationProps {
  entities: LegalEntity[];
}

export const RateNegotiation: React.FC<RateNegotiationProps> = ({ entities }) => {
  const { theme } = useTheme();
  
  const lawFirms = entities.filter(e => e.type === 'Law Firm');

  // Mock rate data
  const rates = lawFirms.map((firm, i) => ({
      firm: firm.name,
      role: 'Partner',
      standardRate: 1100,
      negotiatedRate: 850,
      savings: '22%',
      effectiveDate: '2024-01-01',
      status: 'Approved'
  }));
  
  // Add associate rows
  lawFirms.forEach((firm, i) => {
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
        <div className={cn("p-4 rounded-lg border flex justify-between items-center bg-emerald-50 border-emerald-100")}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm">
                    <TrendingDown className="h-6 w-6"/>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-emerald-900">Rate Optimization</h3>
                    <p className="text-sm text-emerald-700">Total savings of <strong>$1.2M</strong> projected for FY2024 via negotiated discounts.</p>
                </div>
            </div>
            <Button variant="outline" className="bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50">View Analytics</Button>
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
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
