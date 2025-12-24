/**
 * CaseDetailMobileMenu.tsx
 * 
 * Mobile-only overlay menu for quick access to common case actions
 * (document upload, time entry, task creation).
 * 
 * @module components/case-detail/CaseDetailMobileMenu
 * @category Case Management - Mobile UI
 */

// External Dependencies
import React from 'react';
import { FileText, Clock, Plus } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../utils/cn';

interface CaseDetailMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CaseDetailMobileMenu: React.FC<CaseDetailMobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden flex items-end justify-center pb-6" onClick={onClose}>
        <div className={cn("rounded-xl shadow-2xl w-[90%] max-w-sm p-4 animate-in slide-in-from-bottom duration-200 space-y-2", theme.surface.default)} onClick={e => e.stopPropagation()}>
            <h4 className={cn("text-sm font-bold uppercase tracking-wide mb-3 px-2", theme.text.secondary)}>Quick Actions</h4>
            <button onClick={() => onNavigate('Documents')} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <FileText className={cn("h-5 w-5 mr-3", theme.primary.text)}/> Upload Document
            </button>
            <button onClick={() => onNavigate('Billing')} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <Clock className={cn("h-5 w-5 mr-3", theme.status.success.text)}/> Log Billable Time
            </button>
            <button onClick={() => onNavigate('Workflow')} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <Plus className={cn("h-5 w-5 mr-3", theme.action.primary.text)}/> Add Task
            </button>
            <button onClick={onClose} className={cn("w-full p-3 rounded-lg font-bold mt-2", theme.surface.highlight, theme.text.secondary)}>
                Cancel
            </button>
        </div>
    </div>
  );
};
