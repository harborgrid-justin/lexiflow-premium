import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { queryKeys } from '@/utils/queryKeys';
import { AlertTriangle, CheckCircle, Gavel, Loader2 } from 'lucide-react';
import React from 'react';

interface JurisdictionRulesProps {
  jurisdiction?: string;
  documentId?: string;
}

export const JurisdictionRules: React.FC<JurisdictionRulesProps> = ({ jurisdiction, documentId }) => {
  const { theme } = useTheme();

  // Fetch jurisdiction rules from backend
  const { data: rulesData = [], isLoading } = useQuery(
    jurisdiction ? queryKeys.jurisdiction.rules(jurisdiction) : [],
    () => jurisdiction ? DataService.rules.search('', jurisdiction) : Promise.resolve([]),
    { enabled: !!jurisdiction }
  );

  // Format rules from backend or provide empty state
  const rules = rulesData.length > 0 ? rulesData.map((rule: any, idx: number) => ({
    id: idx + 1,
    rule: rule.name || rule.description || 'Rule',
    status: 'Pass' as const,
    msg: rule.notes || undefined
  })) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      </div>
    );
  }

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
        <h4 className={cn("text-xs font-bold uppercase text-slate-500 pl-1")}>Compliance Rules</h4>
        {rules.length === 0 ? (
          <p className={cn("text-xs", theme.text.tertiary)}>No rules available for {jurisdiction || 'this jurisdiction'}.</p>
        ) : (
          rules.map((rule) => (
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
          ))
        )}
      </div>
    </div>
  );
};
