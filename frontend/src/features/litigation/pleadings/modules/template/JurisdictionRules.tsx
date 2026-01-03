import React from 'react';
import { Gavel, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

interface JurisdictionRulesProps {
  jurisdiction?: string;
}

export const JurisdictionRules: React.FC<JurisdictionRulesProps> = ({ jurisdiction }) => {
  const { theme } = useTheme();

  // Mock Rules Data (In prod, this comes from Rules Engine)
  const rules = [
    { id: 1, rule: 'Paper Size: 8.5 x 11 (Pleading Paper)', status: 'Pass' },
    { id: 2, rule: 'Font: Times New Roman, 12pt', status: 'Pass' },
    { id: 3, rule: 'Margins: 1 inch (Top/Bottom)', status: 'Warning', msg: 'Bottom margin inconsistent' },
    { id: 4, rule: 'Line Numbers: Required (Left)', status: 'Pass' },
    { id: 5, rule: 'Footer: Case Title Required', status: 'Pass' },
  ];

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center gap-2 p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800")}>
        <Gavel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className={cn("text-xs font-bold text-blue-800 dark:text-blue-200")}>Active Jurisdiction</p>
          <p className={cn("text-xs text-blue-600 dark:text-blue-300")}>{jurisdiction || 'Federal Rules (FRCP)'}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={cn("text-xs font-bold uppercase text-slate-500 pl-1")}>Compliance Checks</h4>
        {rules.map((rule) => (
          <div key={rule.id} className={cn("flex items-start gap-2 p-2 rounded text-xs", theme.surface.highlight)}>
            {rule.status === 'Pass' ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className={cn(theme.text.primary)}>{rule.rule}</p>
              {rule.msg && <p className="text-amber-600 dark:text-amber-400 font-medium">{rule.msg}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
