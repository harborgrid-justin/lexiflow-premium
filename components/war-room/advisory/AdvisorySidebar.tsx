
import React from 'react';
import { Users, Briefcase, Stethoscope, Microscope, BrainCircuit, Gavel } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface AdvisorySidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  counts: { all: number; experts: number; consultants: number };
}

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
    <div className={cn("w-64 border-r flex flex-col shrink-0 bg-slate-50/50 hidden md:flex", theme.border.default)}>
        <div className="p-4 border-b border-slate-200">
            <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Roles</h4>
            <div className="space-y-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                            activeCategory === cat.id ? cn(theme.surfaceHighlight, theme.primary.text, "shadow-sm border border-slate-200") : theme.text.secondary
                        )}
                    >
                        <div className="flex items-center">
                            <cat.icon className={cn("h-4 w-4 mr-3 opacity-70")}/>
                            {cat.label}
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600")}>
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
                            activeCategory === spec.id ? cn(theme.surfaceHighlight, theme.primary.text, "font-medium") : theme.text.secondary
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
