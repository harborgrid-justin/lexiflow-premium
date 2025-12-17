/**
 * @module components/workflow/WorkflowAutomations
 * @category Workflow
 * @description Workflow automation management with triggers and actions.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Zap, Clock, Plus, Loader2, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { queryKeys } from '../../utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { EmptyState } from '../common/EmptyState';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================
export const WorkflowAutomations: React.FC = () => {
  const { theme } = useTheme();
  
  // Load automations from IndexedDB via useQuery for accurate, cached data
  const { data: automations = [], isLoading } = useQuery(
    queryKeys.workflowsExtended.automations(),
    DataService.workflow.getAutomations
  );

  if (isLoading) {
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600 h-8 w-8"/></div>;
  }

  if (automations.length === 0) {
      return (
        <EmptyState 
            title="No Automations Configured" 
            description="Create your first automation rule to streamline your workflow."
            icon={Zap}
            action={
                <div className={cn("border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer mt-4", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}>
                    <Plus className="h-6 w-6 mb-1"/>
                    <span className="font-bold text-sm">Create New Automation</span>
                </div>
            }
        />
      );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
        {/* Automation Visualization Cards */}
        {automations.map(auto => (
            <div key={auto.id} className={cn("p-6 rounded-xl border shadow-sm relative overflow-hidden group", theme.surface.default, theme.border.default)}>
                <div className={cn("absolute top-0 left-0 w-1 h-full", auto.color === 'amber' ? "bg-amber-500" : "bg-blue-500")}></div>
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-full", auto.color === 'amber' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600")}>
                            {auto.icon === 'Zap' ? <Zap className="h-6 w-6"/> : <Clock className="h-6 w-6"/>}
                        </div>
                        <div>
                            <h4 className={cn("font-bold", theme.text.primary)}>{auto.title}</h4>
                            <p className={cn("text-sm mt-1", theme.text.secondary)}>{auto.description}</p>
                            <div className="mt-3 flex gap-2">
                                <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>Module: {auto.module}</span>
                                {auto.target && <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>Target: {auto.target}</span>}
                            </div>
                        </div>
                    </div>
                    <div className={cn("h-6 w-11 rounded-full relative cursor-pointer transition-colors", auto.active ? "bg-green-500" : "bg-slate-300")}>
                        <div className={cn("absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all", auto.active ? "right-1" : "left-1")}></div>
                    </div>
                </div>
            </div>
        ))}

        <div className={cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}>
            <Plus className="h-8 w-8 mb-2"/>
            <span className="font-bold">Create New Automation</span>
        </div>
    </div>
  );
};
