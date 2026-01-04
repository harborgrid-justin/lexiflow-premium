/**
 * MatterInfo.tsx
 *
 * Case matter details card with jurisdiction, venue, judge, billing model,
 * and filing date information.
 *
 * @module components/case-detail/overview/MatterInfo
 * @category Case Management - Overview
 */

// External Dependencies
import { AlertCircle, BookOpen, Briefcase, Calendar, DollarSign, Gavel, Globe, Scale } from 'lucide-react';
import React from 'react';

// Internal Dependencies - Components
import { Card } from '@/components/ui/molecules/Card';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Case } from '@/types';

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
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {items.filter((item): item is InfoItem => Boolean(item)).map((item, i) => (
          <div key={i} className="min-w-0">
            <dt className={cn("text-xs font-bold uppercase mb-1 truncate", theme.text.tertiary)}>{item.label}</dt>
            <dd className={cn("text-sm flex items-start break-words", item.color || theme.text.primary, item.mono ? "font-mono font-bold" : "")}>
              {item.highlight && <span className={cn("w-2 h-2 rounded-full mr-2 mt-1.5 shrink-0", theme.primary.DEFAULT)}></span>}
              {item.icon && <item.icon className={cn("h-3.5 w-3.5 mr-2 mt-0.5 shrink-0", theme.text.tertiary)} />}
              <span className="flex-1">{item.value}</span>
            </dd>
          </div>
        ))}

        <div className={cn("col-span-1 sm:col-span-2 p-3 rounded border", theme.surface.highlight, theme.border.default)}>
          <dt className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>Case Abstract</dt>
          <dd className={cn("text-sm leading-relaxed max-h-32 overflow-y-auto custom-scrollbar", theme.text.secondary)}>{caseData.description}</dd>
        </div>

        {caseData.origJudgmentDate && (
          <div className="min-w-0">
            <dt className={cn("text-xs font-bold uppercase mb-1 flex items-center", theme.text.tertiary)}><Gavel className="h-3 w-3 mr-1 opacity-50" />Orig. Judgment</dt>
            <dd className={cn("text-sm", theme.text.secondary)}>{caseData.origJudgmentDate}</dd>
          </div>
        )}
        {caseData.noticeOfAppealDate && (
          <div className="min-w-0">
            <dt className={cn("text-xs font-bold uppercase mb-1 flex items-center", theme.text.tertiary)}><AlertCircle className="h-3 w-3 mr-1 opacity-50" />Notice of Appeal</dt>
            <dd className={cn("text-sm", theme.text.secondary)}>{caseData.noticeOfAppealDate}</dd>
          </div>
        )}
        {caseData.solDate && (
          <div className="min-w-0">
            <dt className={cn("text-xs font-bold uppercase mb-1 flex items-center", theme.status.error.text)}><AlertCircle className="h-3 w-3 mr-1" />SOL Expiry</dt>
            <dd className={cn("text-sm", theme.status.error.text)}>{caseData.solDate}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
};
