
import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { MoreHorizontal, Play, Search } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { EmptyState } from '../../common/EmptyState';
import { Process } from './types';
import { getProcessIcon } from './utils';

interface FirmProcessListProps {
  processes: Process[];
  onSelectProcess?: (id: string) => void;
}

export const FirmProcessList: React.FC<FirmProcessListProps> = ({ processes, onSelectProcess }) => {
  const { theme } = useTheme();

  if (!processes || processes.length === 0) {
    return (
      <EmptyState 
        title="No Firm Processes" 
        description="There are no active firm processes defined. Create a new process template to get started."
        icon={Search}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes.map(bp => (
            <Card key={bp.id} noPadding className={cn("flex flex-col h-full transition-colors group cursor-pointer", `hover:${theme.primary.border}`)}>
            <div 
                className={cn("p-5 border-b flex justify-between items-start", theme.border.default, theme.surface.highlight)}
                onClick={() => onSelectProcess && onSelectProcess(bp.id)}
            >
                <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded border shadow-sm transition-all", theme.surface.default, theme.border.default, `group-hover:shadow-md`)}>
                    {getProcessIcon(bp.name)}
                </div>
                <div>
                    <h4 className={cn("font-bold text-sm transition-colors", theme.text.primary, `group-hover:${theme.primary.text}`)}>{bp.name}</h4>
                    <p className={cn("text-xs", theme.text.secondary)}>{bp.owner}</p>
                </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={bp.status === 'Active' ? 'success' : bp.status === 'Idle' ? 'neutral' : 'warning'}>{bp.status}</Badge>
                    <button className={cn(theme.text.tertiary, `hover:${theme.text.secondary}`)} onClick={(e: React.MouseEvent) => e.stopPropagation()} aria-label="Process options"><MoreHorizontal className="h-4 w-4"/></button>
                </div>
            </div>
            
            <div 
                className="p-5 flex-1 space-y-4"
                onClick={() => onSelectProcess && onSelectProcess(bp.id)}
            >
                <div className={cn("flex justify-between text-xs pb-2 border-b", theme.text.secondary, theme.border.default)}>
                <span>Trigger: <strong className={theme.text.primary}>{bp.triggers}</strong></span>
                <span>Tasks: <strong>{bp.tasks}</strong></span>
                </div>
                
                {bp.status === 'Active' && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                    <span className={theme.primary.text}>Processing...</span>
                    <span>{Math.round((bp.completed / bp.tasks) * 100)}%</span>
                    </div>
                    <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surface.highlight)}>
                    <div 
                      className={cn("h-1.5 rounded-full transition-all", theme.primary.DEFAULT)} 
                      style={{ width: `${(bp.completed / bp.tasks) * 100}%` }}
                    ></div>
                    </div>
                </div>
                )}

                {bp.status === 'Idle' && (
                <div className={cn("flex items-center justify-center h-12 rounded border border-dashed text-xs italic", theme.surface.highlight, theme.border.default, theme.text.tertiary)}>
                    Waiting for automated trigger...
                </div>
                )}
            </div>

            <div className={cn("p-3 border-t flex gap-2", theme.border.default)} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className={cn("flex-1 text-xs", theme.text.secondary)} onClick={() => onSelectProcess && onSelectProcess(bp.id)}>Logs</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onSelectProcess && onSelectProcess(bp.id)}>Config</Button>
                {bp.status !== 'Active' && <Button variant="primary" size="sm" className="flex-1 text-xs" icon={Play}>Start</Button>}
            </div>
            </Card>
        ))}
        
        {/* New Process Card */}
        <div className={cn("border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-all cursor-pointer min-h-[200px]", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}>
            <div className={cn("p-4 rounded-full shadow-sm mb-3", theme.surface.default)}>
            <Play className="h-6 w-6"/>
            </div>
            <span className="font-bold text-sm">Design New Workflow</span>
            <span className="text-xs mt-1">Drag & Drop BPMN Builder</span>
        </div>
    </div>
  );
};
