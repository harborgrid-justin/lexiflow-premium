
import React from 'react';
import { Card } from '../../common/Card';
import { Globe, Gavel, Scale, Briefcase, BookOpen, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { Case } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface MatterInfoProps {
  caseData: Case;
}

interface InfoItem {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType | null;
    highlight?: boolean;
    color?: string;
    mono?: boolean;
}

export const MatterInfo: React.FC<MatterInfoProps> = ({ caseData }) => {
  const { theme } = useTheme();

  // Helper to format jurisdiction
  const jurisdictionDisplay = caseData.jurisdictionConfig 
    ? `${caseData.jurisdictionConfig.courtLevel} - ${caseData.jurisdictionConfig.state}` 
    : caseData.jurisdiction || 'N/A';
  
  // Helper for Valuation
  const valDisplay = caseData.valuation 
    ? `${caseData.valuation.amount.toLocaleString()} ${caseData.valuation.currency}`
    : `$${(caseData.value || 0).toLocaleString()}`;

  const items: (InfoItem | null)[] = [
    { label: 'Matter Type', value: `${caseData.matterType || 'General'} ${caseData.matterSubType ? `(${caseData.matterSubType})` : ''}`, icon: null, highlight: true },
    { label: 'Est. Value / Exposure', value: valDisplay, icon: DollarSign, mono: true },
    { label: 'Jurisdiction', value: jurisdictionDisplay, icon: Globe },
    { label: 'Venue / Court', value: caseData.court || 'N/A', icon: Gavel },
    { label: 'Presiding Judge', value: caseData.judge || 'Unassigned', icon: Scale },
    { label: 'Magistrate Judge', value: caseData.magistrateJudge || 'N/A', icon: Scale },
    { label: 'Opposing Counsel', value: caseData.opposingCounsel || 'N/A', icon: Briefcase },
    { label: 'Originating Case', value: caseData.origCaseNumber || 'N/A', icon: BookOpen },
    caseData.dateTerminated ? { label: 'Date Terminated', value: caseData.dateTerminated, icon: Calendar, color: theme.status.error.text } : null,
  ];

  return (
    <Card title="Matter Particulars" className={cn("border-t-4", theme.primary.border)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {items.filter((item): item is InfoItem => Boolean(item)).map((item, i) => (
                <div key={i} className="min-w-0">
                    <dt className={cn("text-xs font-bold uppercase mb-1 truncate", theme.text.tertiary)}>{item.label}</dt>
                    <dd className={cn("text-sm flex items-start break-words", item.color || theme.text.primary, item.mono ? "font-mono font-bold" : "")}>
                        {item.highlight && <span className={cn("w-2 h-2 rounded-full mr-2 mt-1.5 shrink-0", theme.primary.DEFAULT)}></span>}
                        {item.icon && <item.icon className={cn("h-3.5 w-3.5 mr-2 mt-0.5 shrink-0", theme.text.tertiary)}/>}
                        <span className="flex-1">{item.value}</span>
                    </dd>
                </div>
            ))}
            
            <div className={cn("col-span-1 sm:col-span-2 p-3 rounded border", theme.surfaceHighlight, theme.border.light)}>
                <dt className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>Case Abstract</dt>
                <dd className={cn("text-sm leading-relaxed max-h-32 overflow-y-auto custom-scrollbar", theme.text.secondary)}>{caseData.description}</dd>
            </div>
            
            {(caseData.origJudgmentDate || caseData.noticeOfAppealDate || caseData.solDate) && (
                <div className={cn("col-span-1 sm:col-span-2 flex flex-wrap gap-4 p-2 rounded text-xs border", theme.surfaceHighlight, theme.border.subtle, theme.text.secondary)}>
                   {caseData.origJudgmentDate && (
                       <span className="flex items-center"><Gavel className="h-3 w-3 mr-1 opacity-50"/> <strong>Orig. Judgment:</strong>&nbsp;{caseData.origJudgmentDate}</span>
                   )}
                   {caseData.noticeOfAppealDate && (
                       <span className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 opacity-50"/> <strong>Notice of Appeal:</strong>&nbsp;{caseData.noticeOfAppealDate}</span>
                   )}
                   {caseData.solDate && (
                       <span className={cn("flex items-center", theme.status.error.text)}><AlertCircle className="h-3 w-3 mr-1"/> <strong>SOL Expiry:</strong>&nbsp;{caseData.solDate}</span>
                   )}
                </div>
            )}
        </div>
    </Card>
  );
};
