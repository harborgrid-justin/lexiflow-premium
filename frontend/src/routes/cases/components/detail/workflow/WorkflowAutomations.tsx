/**
 * WorkflowAutomations.tsx
 * 
 * Workflow automation visualization showing trigger-action rules
 * for document processing, deadline monitoring, and notifications.
 * 
 * @module components/case-detail/workflow/WorkflowAutomations
 * @category Case Management - Workflow
 */

// External Dependencies
import { Zap, Clock, Plus } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

export const WorkflowAutomations: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 gap-6">
        {/* Automation Visualization Cards */}
        <div className={cn("p-6 rounded-xl border shadow-sm relative overflow-hidden group", theme.surface.default, theme.border.default)}>
            <div className={cn("absolute top-0 left-0 w-1 h-full", theme.status.warning.bg)}></div>
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full", theme.surface.highlight, theme.status.warning.text)}><Zap className="h-6 w-6"/></div>
                    <div>
                        <h4 className={cn("font-bold", theme.text.primary)}>Document Upload Trigger</h4>
                        <p className={cn("text-sm mt-1", theme.text.secondary)}>IF new document contains "Motion" THEN create task "Review Motion".</p>
                        <div className="mt-3 flex gap-2">
                            <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>Module: Documents</span>
                            <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>Module: Workflow</span>
                        </div>
                    </div>
                </div>
                <div className="h-6 w-11 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div></div>
            </div>
        </div>

        <div className={cn("p-6 rounded-xl border shadow-sm relative overflow-hidden group", theme.surface.default, theme.border.default)}>
            <div className={cn("absolute top-0 left-0 w-1 h-full", theme.action.primary.bg)}></div>
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full", theme.surface.highlight, theme.text.link)}><Clock className="h-6 w-6"/></div>
                    <div>
                        <h4 className={cn("font-bold", theme.text.primary)}>SLA Breach Warning</h4>
                        <p className={cn("text-sm mt-1", theme.text.secondary)}>IF "High Priority" task is overdue {'>'} 24h THEN notify Senior Partner.</p>
                        <div className="mt-3 flex gap-2">
                            <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>Role: Senior Partner</span>
                        </div>
                    </div>
                </div>
                <div className="h-6 w-11 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div></div>
            </div>
        </div>

        <div className={cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer hover:border-blue-500", theme.border.default, theme.text.tertiary, theme.text.link, theme.surface.default)}>
            <Plus className="h-8 w-8 mb-2"/>
            <span className="font-bold">Create New Automation</span>
        </div>
    </div>
  );
};
