/**
 * ActiveWorkstreams.tsx
 * 
 * Dashboard widget displaying active project workstreams with progress tracking.
 * 
 * @module components/case-detail/overview/ActiveWorkstreams
 * @category Case Management - Overview
 */

// External Dependencies
import React from 'react';
import { Briefcase } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Project } from '@/types';

interface ActiveWorkstreamsProps {
  activeProjects: Project[];
}

export const ActiveWorkstreams: React.FC<ActiveWorkstreamsProps> = ({ activeProjects }) => {
  const { theme } = useTheme();
  
  // LAYOUT-STABLE: Render empty state with same structure instead of null
  if (activeProjects.length === 0) {
    return (
      <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
          <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
            <Briefcase className={cn("h-4 w-4 mr-2", theme.primary.text)}/> Active Workstreams
          </h3>
        </div>
        <div className={cn("p-8 text-center", theme.text.tertiary)}>
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No active workstreams</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
                <Briefcase className={cn("h-4 w-4 mr-2", theme.primary.text)}/> Active Workstreams
            </h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3">
            {activeProjects.map(proj => {
                const total = (proj.tasks || []).length;
                const done = (proj.tasks || []).filter(t => t.status === 'Done').length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                    <div key={proj.id} className={cn("flex items-center gap-4 p-3 border rounded-lg", theme.surface.default, theme.border.default)}>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className={cn("text-sm font-bold", theme.text.primary)}>{proj.title}</span>
                                <span className={cn("text-xs font-bold", theme.primary.text)}>{pct}%</span>
                            </div>
                            <div 
                                className={cn("w-full rounded-full h-1.5", theme.surface.highlight)}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Progress for ${proj.title}`}
                            >
                                { }
                                <div className={cn("h-1.5 rounded-full", theme.primary.DEFAULT)} style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={cn("text-xs block", theme.text.secondary)}>Lead</span>
                            <span className={cn("text-xs font-medium", theme.text.primary)}>{proj.lead}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
