/**
 * @module components/entities/EntityOrgChart
 * @category Entity Management - Organization Chart
 * @description Visual hierarchy chart for entity relationships (parent/child companies, individuals).
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border, theme.primary for consistent theming.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { Building2, User, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services/Data
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { useQuery } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Components
import { AdaptiveLoader } from '../../common/AdaptiveLoader';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { LegalEntity } from '../../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityOrgChartProps {
  entities?: LegalEntity[]; // Optional override
  onSelect: (e: LegalEntity) => void;
}

export const EntityOrgChart: React.FC<EntityOrgChartProps> = ({ entities: propEntities, onSelect }) => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: fetchedEntities = [], isLoading } = useQuery<LegalEntity[]>(
      ['entities', 'all'],
      DataService.entities.getAll,
      { enabled: !propEntities }
  );

  const entities = propEntities || fetchedEntities;
  
  const { root, children } = useMemo(() => {
      // Mock hierarchy logic: Find "TechCorp" as root, others as children
      // In a real app, this would traverse relationships recursively
      const r = entities.find(e => e.name.includes('TechCorp')) || entities[0];
      const c = entities.filter(e => e.id !== r?.id).slice(0, 3);
      return { root: r, children: c };
  }, [entities]);

  if (isLoading) return <AdaptiveLoader contentType="dashboard" shimmer />;
  if (!root) return <div>No entities to map.</div>;

  return (
    <div className="h-full p-8 overflow-auto flex justify-center">
        <div className="flex flex-col items-center space-y-8">
            {/* Root Node */}
            <div 
                onClick={() => onSelect(root)}
                className={cn(
                    "p-6 rounded-xl border-2 shadow-lg w-64 text-center cursor-pointer transition-transform hover:scale-105 z-10",
                    theme.surface.default,
                    theme.border.default
                )}
            >
                <Building2 className={cn("h-8 w-8 mx-auto mb-2", theme.primary.text)}/>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>{root.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Parent Entity</p>
            </div>

            {/* Connector */}
            <div className={cn("h-8 w-0.5 -my-4", theme.border.default, "bg-current opacity-30")}></div>
            <div className={cn("w-96 h-0.5", theme.border.default, "bg-current opacity-30")}></div>
            
            {/* Children */}
            <div className="flex gap-8">
                {children.map(child => (
                    <div key={child.id} className="flex flex-col items-center">
                        <div className={cn("h-8 w-0.5 -mt-8 mb-2", theme.border.default, "bg-current opacity-30")}></div>
                        <div 
                            onClick={() => onSelect(child)}
                            className={cn(
                                "p-4 rounded-lg border shadow-sm w-48 text-center cursor-pointer hover:border-blue-400 transition-colors",
                                theme.surface.default,
                                theme.border.default
                            )}
                        >
                            {child.type === 'Individual' ? <User className="h-5 w-5 mx-auto text-green-600 mb-1"/> : <Building2 className="h-5 w-5 mx-auto text-slate-600 mb-1"/>}
                            <h4 className={cn("font-bold text-sm truncate", theme.text.primary)}>{child.name}</h4>
                            <p className="text-[10px] text-slate-500">{child.roles[0]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};


