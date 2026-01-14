/**
 * @module components/war-room/opposition/OppositionSidebar
 * @category WarRoom
 * @description Sidebar navigation for filtering opposition entities.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Users, Briefcase, Gavel, Microscope, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface OppositionSidebarProps {
  /** Currently active filter category. */
  activeCategory: string;
  /** Callback when a category is selected. */
  onSelectCategory: (category: string) => void;
  /** Count metrics for each category. */
  counts: { all: number; counsel: number; parties: number; experts: number };
}

// ============================================================================
// COMPONENT
// ============================================================================
export const OppositionSidebar: React.FC<OppositionSidebarProps> = ({ activeCategory, onSelectCategory, counts }) => {
  const { theme } = useTheme();

  const categories = [
    { id: 'All', label: 'All Entities', icon: Users, count: counts.all },
    { id: 'Counsel', label: 'Opposing Counsel', icon: Gavel, count: counts.counsel },
    { id: 'Parties', label: 'Parties', icon: Briefcase, count: counts.parties },
    { id: 'Experts', label: 'Experts', icon: Microscope, count: counts.experts },
  ];

  return (
    <div className={cn("w-64 border-r flex flex-col shrink-0 hidden md:flex", theme.surface.highlight, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
            <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Categories</h4>
            <div className="space-y-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                            activeCategory === cat.id 
                                ? cn(theme.surface.highlight, theme.text.primary, "shadow-sm border", theme.border.default) 
                                : cn(theme.text.secondary, "hover:bg-slate-100 dark:hover:bg-slate-800")
                        )}
                    >
                        <div className="flex items-center">
                            <cat.icon className={cn("h-4 w-4 mr-3 opacity-70")}/>
                            {cat.label}
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", theme.surface.default, theme.text.secondary)}>
                            {cat.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        <div className="p-4">
            <div className={cn("p-3 rounded-lg border bg-red-50 border-red-100 text-red-800")}>
                <h4 className="text-xs font-bold uppercase mb-2 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1"/> Intelligence
                </h4>
                <p className="text-xs leading-relaxed">
                    Opposing counsel has a high settlement rate (85%) when faced with aggressive discovery motions.
                </p>
            </div>
        </div>
    </div>
  );
};
