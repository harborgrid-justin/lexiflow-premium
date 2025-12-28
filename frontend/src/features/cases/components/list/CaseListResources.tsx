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
import { UserAvatar } from '@/components/atoms/UserAvatar';
import { ProgressBar } from '@/components/atoms/ProgressBar';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services';
import { cn } from '@/utils/cn';

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

  // Ensure resources is an array
  const resourceList = Array.isArray(resources) ? resources : [];

  if (resourceList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className={cn("text-center py-12", theme.text.tertiary)}>
          <div className="mb-4 opacity-20">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm">No resource utilization data available.</p>
          <p className="text-xs mt-2 opacity-60">Staff utilization metrics will appear here once configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resourceList.map((res, i) => (
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

