/**
 * CaseListResources.tsx
 * 
 * Resource utilization dashboard showing attorney/paralegal allocation
 * and capacity across active cases.
 * 
 * @module components/case-list/CaseListResources
 * @category Case Management - Resource Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { UserAvatar } from '../common/UserAvatar';
import { ProgressBar } from '../common/ProgressBar';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '../../services/queryClient';

// Services & Utils
import { DataService } from '../../services/dataService';
import { cn } from '../../utils/cn';

export const CaseListResources: React.FC = () => {
  const { theme } = useTheme();
  
  const { data: resources = [], isLoading } = useQuery<any[]>(
      ['hr', 'utilization'],
      () => DataService.hr.getUtilizationMetrics()
  );

  if (isLoading) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <div key={i} className={cn("p-6 rounded-lg border shadow-sm transition-all hover:border-blue-300", theme.surface.default, theme.border.default)}>
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar name={res.name} size="lg"/>
              <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>{res.name}</h3>
                <p className={cn("text-sm", theme.text.secondary)}>{res.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <ProgressBar label="Utilization" value={res.utilization} colorClass={res.utilization > 90 ? 'bg-red-500' : 'bg-blue-600'} />
              <div className={cn("flex justify-between text-sm pt-2 border-t", theme.border.default)}>
                <span className={theme.text.secondary}>Active Matters</span>
                <span className={cn("font-bold", theme.text.primary)}>{res.cases}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
