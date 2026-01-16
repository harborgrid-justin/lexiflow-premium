/**
 * CaseListExperts.tsx
 *
 * Expert witness management view with specialization tracking,
 * availability status, and retention information.
 *
 * @module components/case-list/CaseListExperts
 * @category Case Management - Expert Views
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
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
// ✅ Migrated to backend API (2025-12-21)

// Types
interface Expert {
  id: string;
  name: string;
  specialty: string;
  rate: number;
  readiness: number;
  reports: number;
}

export const CaseListExperts: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: Caching
  const { data: expertsData = [], isLoading } = useQuery<{ data?: unknown[] } | unknown[]>(
    ['advisors', 'experts'],
    async () => {
      return (await DataService.warRoom.getExperts());
    }
  );

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

  // Strict backend pagination handling
  const rawList = Array.isArray(expertsData)
    ? expertsData
    : (expertsData && typeof expertsData === 'object' && 'data' in expertsData && Array.isArray(expertsData.data) ? expertsData.data : []);

  const expertsList: Expert[] = (rawList as Array<{ id?: string; name?: string; specialty?: string; expertType?: string; rate?: number; hourlyRate?: number; readiness?: number; reports?: number }>).map((item) => ({
    id: item.id || 'unknown',
    name: item.name || 'Unknown Expert',
    specialty: item.specialty || item.expertType || 'General',
    rate: item.rate || item.hourlyRate || 0,
    readiness: item.readiness || 85,
    reports: item.reports || 0
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {expertsList.map(exp => (
        <div key={exp.id} className={cn("p-6 rounded-lg border shadow-sm hover:shadow-md transition-all group", theme.surface.default, theme.border.default)}>
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {exp.name.charAt(0)}
            </div>
            <Badge variant="success">{exp.readiness}% Ready</Badge>
          </div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>{exp.name}</h3>
          <p className={cn("text-sm font-medium mb-2", theme.primary.text)}>{exp.specialty}</p>
          <div className={cn("text-sm space-y-1", theme.text.secondary)}>
            <p>Rate: <span className={cn("font-semibold", theme.text.primary)}>${exp.rate}/hr</span></p>
            <p>Reports Filed: {exp.reports}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">View CV & Conflicts</Button>
        </div>
      ))}
      {expertsList.length === 0 && (
        <div className="col-span-3 py-12 text-center text-slate-400 border-2 border-dashed rounded-lg">
          No expert witnesses retained.
        </div>
      )}
    </div>
  );
};
