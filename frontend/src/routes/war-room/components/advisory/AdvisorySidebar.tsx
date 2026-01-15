/**
 * @module components/war-room/advisory/AdvisorySidebar
 * @category WarRoom
 * @description Sidebar for filtering advisors by role and specialty.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Users, Briefcase, Stethoscope, Microscope, BrainCircuit, Gavel } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AdvisorySidebarProps {
  /** Currently active filter category. */
  activeCategory: string;
  /** Callback when a category is selected. */
  onSelectCategory: (category: string) => void;
  /** Count metrics for each category. */
  counts: { all: number; experts: number; consultants: number };
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdvisorySidebar: React.FC<AdvisorySidebarProps> = ({ activeCategory, onSelectCategory, counts }) => {
  const { theme } = useTheme();

  const categories = [
    { id: 'All', label: 'All Advisors', icon: Users, count: counts.all },
    { id: 'Experts', label: 'Expert Witnesses', icon: Briefcase, count: counts.experts },
    { id: 'Consultants', label: 'Jury & Strategy', icon: BrainCircuit, count: counts.consultants },
  ];

  const specialties = [
    { id: 'Forensic Accounting', label: 'Forensics', icon: Microscope },
    { id: 'Medical Diagnostics', label: 'Medical', icon: Stethoscope },
    { id: 'Botany / Environmental', label: 'Environmental', icon: Briefcase },
    { id: 'Voir Dire Strategy', label: 'Jury Selection', icon: Gavel },
  ];

  return (
    <div className={cn("w-64 border-r flex flex-col shrink-0 hidden md:flex", theme.surface.highlight, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
            <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Roles</h4>
            <div className="space-y-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                            activeCategory === cat.id ? cn(theme.surface.default, theme.primary.text, "shadow-sm border", theme.border.default) : theme.text.secondary
                        )}
                    >
                        <div className="flex items-center">
                            <cat.icon className={cn("h-4 w-4 mr-3 opacity-70")}/>
                            {cat.label}
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", theme.surface.highlight, theme.text.secondary)}>
                            {cat.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        <div className="p-4">
            <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Specialties</h4>
            <div className="space-y-1">
                {specialties.map(spec => (
                    <button
                        key={spec.id}
                        onClick={() => onSelectCategory(spec.id)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center",
                            activeCategory === spec.id ? cn(theme.surface.default, theme.primary.text, "font-medium") : theme.text.secondary
                        )}
                    >
                        <spec.icon className={cn("h-3.5 w-3.5 mr-3 opacity-60")}/>
                        {spec.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
