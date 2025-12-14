/**
 * @module components/workflow/TaskReassignmentPanel
 * @category Workflow
 * @description Bulk task reassignment interface.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { User, ArrowRight, RefreshCcw } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from '../common/Button';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const TaskReassignmentPanel: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-6 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
      <h3 className={cn("font-bold mb-4 flex items-center", theme.text.primary)}>
        <RefreshCcw className={cn("h-5 w-5 mr-2", theme.text.secondary)}/> Bulk Reassignment
      </h3>
      
      <div className={cn("flex flex-col md:flex-row gap-4 items-center p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
        <div className="flex-1 w-full">
          <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>From User</label>
          <div className={cn("flex items-center border rounded-md px-3 py-2", theme.surface.default, theme.border.default)}>
            <User className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
            <select className={cn("bg-transparent w-full text-sm outline-none", theme.text.primary)}>
              <option>James Doe</option>
              <option>Sarah Jenkins</option>
            </select>
          </div>
        </div>
        
        <ArrowRight className={cn("h-6 w-6 hidden md:block mt-5", theme.text.tertiary)} />
        
        <div className="flex-1 w-full">
          <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>To User</label>
          <div className={cn("flex items-center border rounded-md px-3 py-2", theme.surface.default, theme.border.default)}>
            <User className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
            <select className={cn("bg-transparent w-full text-sm outline-none", theme.text.primary)}>
              <option>Alexandra H.</option>
              <option>Paralegal Pool</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className={cn("text-xs", theme.text.secondary)}>Will move <strong>5 active tasks</strong>.</p>
        <Button variant="primary" size="sm">Transfer Tasks</Button>
      </div>
    </div>
  );
};
