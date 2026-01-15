import { FileText, Scale, Box, Gavel, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { TaskStatusBackend } from '@/types';
import type { TaskRowProps } from './types';

const getModuleIcon = (module?: string, theme?: ReturnType<typeof useTheme>['theme']) => {
  switch (module) {
    case 'Documents': return <FileText className={cn('h-3 w-3 mr-1', theme?.text.tertiary)} />;
    case 'Discovery': return <Scale className="h-3 w-3 mr-1 text-purple-500" />;
    case 'Evidence': return <Box className="h-3 w-3 mr-1 text-amber-500" />;
    case 'Motions': return <Gavel className="h-3 w-3 mr-1 text-blue-500" />;
    default: return null;
  }
};

export const TaskRow: React.FC<TaskRowProps> = ({ task: t, onToggle, onTaskClick }) => {
  const { theme } = useTheme();
  const isCompleted = t.status === TaskStatusBackend.COMPLETED;

  return (
    <div className={cn('p-4 flex items-start transition-colors group h-[90px] border-b', theme.border.default, `hover:${theme.surface.highlight}`)}>
      <div className="pt-0.5 mr-4">
        <input
          type="checkbox"
          className="h-5 w-5 text-blue-600 rounded border-slate-300 cursor-pointer"
          checked={isCompleted}
          onChange={() => onToggle(t.id)}
          aria-label={`Mark ${t.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className={cn('text-sm font-bold truncate pr-2', isCompleted ? 'text-slate-400 line-through' : theme.text.primary)}>{t.title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'neutral'}>{t.priority}</Badge>
            {t.caseId && (
              <button
                onClick={() => onTaskClick(t)}
                className="flex items-center px-2 py-1 rounded text-[10px] font-medium transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 border border-transparent"
                title="Go to Case"
              >
                Case <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        </div>
        <p className={cn('text-xs mt-1 flex items-center', theme.text.secondary)}>
          {t.relatedModule && <span className={cn('flex items-center mr-3 px-1.5 py-0.5 rounded', theme.surface.highlight)}>{getModuleIcon(t.relatedModule, theme)} {t.relatedModule}</span>}
          <span className="mr-3">Due: {t.dueDate}</span>
          <span>Assignee: {t.assignee}</span>
        </p>
        {t.relatedItemTitle && (
          <p className={cn('text-xs mt-1 pl-2 border-l-2 truncate opacity-80', theme.primary.text, theme.primary.border)}>Linked: {t.relatedItemTitle}</p>
        )}
      </div>
    </div>
  );
};
