import { Button } from '@/shared/ui/atoms/Button/Button';
import { CheckSquare, FastForward, Pause, Play } from 'lucide-react';
interface WorkflowQuickActionsProps {
  caseId: string;
  onAction: (action: string) => void;
}

export function WorkflowQuickActions({ caseId: _caseId, onAction }: WorkflowQuickActionsProps) {
  return (
    <div className="flex gap-1" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-green-600" title="Start Next Task" onClick={() => onAction('start')}>
        <Play className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-amber-600" title="Pause Workflow" onClick={() => onAction('pause')}>
        <Pause className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-blue-600" title="Skip Step" onClick={() => onAction('skip')}>
        <FastForward className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-purple-600" title="Log Completion" onClick={() => onAction('log')}>
        <CheckSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}

WorkflowQuickActions.displayName = 'WorkflowQuickActions';
