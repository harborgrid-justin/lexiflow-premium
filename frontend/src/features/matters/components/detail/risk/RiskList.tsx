/**
 * RiskList.tsx
 * 
 * Scrollable list of identified risks with category icons, severity badges,
 * and selection highlighting.
 * 
 * @module components/case-detail/risk/RiskList
 * @category Case Management - Risk Assessment
 */

// External Dependencies
import React from 'react';
import { Shield, DollarSign, Zap, Eye } from 'lucide-react';

// Internal Dependencies - Components
import { Badge } from '../../../common/Badge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Risk } from '../../../../types';

interface RiskListProps {
  risks: Risk[];
  selectedId?: string;
  onSelect: (risk: Risk) => void;
}

export const RiskList: React.FC<RiskListProps> = ({ risks, selectedId, onSelect }) => {
  const { theme } = useTheme();

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'Legal': return <Shield className="h-4 w-4"/>;
          case 'Financial': return <DollarSign className="h-4 w-4"/>;
          case 'Reputational': return <Eye className="h-4 w-4"/>;
          default: return <Zap className="h-4 w-4"/>;
      }
  };

  const getScoreColor = (prob: string, impact: string) => {
      const pVal = prob === 'High' ? 3 : prob === 'Medium' ? 2 : 1;
      const iVal = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
      const score = pVal * iVal;

      if (score >= 6) return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      if (score >= 3) return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
  };

  return (
    <div className={cn("divide-y", theme.border.default)}>
        {risks.map(risk => (
            <div 
                key={risk.id}
                onClick={() => onSelect(risk)}
                className={cn(
                    "p-4 cursor-pointer border-l-4 transition-colors group",
                    getScoreColor(risk.probability, risk.impact),
                    selectedId === risk.id ? theme.surface.highlight : `hover:${theme.surface.highlight}`
                )}
            >
                <div className="flex justify-between items-start mb-1">
                    <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wider", theme.text.secondary)}>
                        {getCategoryIcon(risk.category || 'Other')}
                        {risk.category || 'Other'}
                    </div>
                    <Badge variant={risk.status === 'Mitigated' ? 'success' : risk.status === 'Accepted' ? 'neutral' : 'warning'}>
                        {risk.status}
                    </Badge>
                </div>
                <h4 className={cn("font-bold text-sm mb-1 line-clamp-2", theme.text.primary)}>{risk.title}</h4>
                <div className={cn("flex gap-3 text-xs", theme.text.secondary)}>
                    <span>Prob: <strong className={cn(risk.probability === 'High' ? "text-red-600" : "")}>{risk.probability}</strong></span>
                    <span>Imp: <strong className={cn(risk.impact === 'High' ? "text-red-600" : "")}>{risk.impact}</strong></span>
                </div>
            </div>
        ))}
        {risks.length === 0 && (
            <div className={cn("p-8 text-center text-sm italic", theme.text.tertiary)}>
                No risks identified yet.
            </div>
        )}
    </div>
  );
};
