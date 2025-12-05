
import React, { useMemo } from 'react';
import { LegalEntity } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Building2, User, Loader2 } from 'lucide-react';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';

interface EntityOrgChartProps {
  entities?: LegalEntity[]; // Optional override
  onSelect: (e: LegalEntity) => void;
}

export const EntityOrgChart: React.FC<EntityOrgChartProps> = ({ entities: propEntities, onSelect }) => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: fetchedEntities = [], isLoading } = useQuery<LegalEntity[]>(
      [STORES.ENTITIES, 'all'],
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

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!root) return <div>No entities to map.</div>;

  return (
    <div className="h-full p-8 overflow-auto flex justify-center">
        <div className="flex flex-col items-center space-y-8">
            {/* Root Node */}
            <div 
                onClick={() => onSelect(root)}
                className={cn(
                    "p-6 rounded-xl border-2 shadow-lg bg-white w-64 text-center cursor-pointer transition-transform hover:scale-105 z-10",
                    theme.border.default
                )}
            >
                <Building2 className="h-8 w-8 mx-auto text-blue-600 mb-2"/>
                <h3 className="font-bold text-lg text-slate-800">{root.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Parent Entity</p>
            </div>

            {/* Connector */}
            <div className="h-8 w-0.5 bg-slate-300 -my-4"></div>
            <div className="w-96 h-0.5 bg-slate-300"></div>
            
            {/* Children */}
            <div className="flex gap-8">
                {children.map(child => (
                    <div key={child.id} className="flex flex-col items-center">
                        <div className="h-8 w-0.5 bg-slate-300 -mt-8 mb-2"></div>
                        <div 
                            onClick={() => onSelect(child)}
                            className={cn(
                                "p-4 rounded-lg border shadow-sm bg-white w-48 text-center cursor-pointer hover:border-blue-400 transition-colors",
                                theme.border.default
                            )}
                        >
                            {child.type === 'Individual' ? <User className="h-5 w-5 mx-auto text-green-600 mb-1"/> : <Building2 className="h-5 w-5 mx-auto text-slate-600 mb-1"/>}
                            <h4 className="font-bold text-sm text-slate-800 truncate">{child.name}</h4>
                            <p className="text-[10px] text-slate-500">{child.roles[0]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
