
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Project, Case } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface ActiveWorkstreamsProps {
  activeProjects: Project[];
}

export const ActiveWorkstreams: React.FC<ActiveWorkstreamsProps> = ({ activeProjects }) => {
  const { theme } = useTheme();
  
  if (activeProjects.length === 0) return null;

  return (
    <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
            <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
                <Briefcase className={cn("h-4 w-4 mr-2", theme.primary.text)}/> Active Workstreams
            </h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3">
            {activeProjects.map(proj => {
                const total = proj.tasks.length;
                const done = proj.tasks.filter(t => t.status === 'Done').length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                    <div key={proj.id} className={cn("flex items-center gap-4 p-3 border rounded-lg", theme.surface, theme.border.default)}>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className={cn("text-sm font-bold", theme.text.primary)}>{proj.title}</span>
                                <span className={cn("text-xs font-bold", theme.primary.text)}>{pct}%</span>
                            </div>
                            <div 
                                className={cn("w-full rounded-full h-1.5", theme.surfaceHighlight)}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Progress for ${proj.title}`}
                            >
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
