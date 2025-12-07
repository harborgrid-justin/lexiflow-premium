
import React, { useMemo, useState } from 'react';
import { Badge } from '../common/Badge';
import { LegalEntity } from '../../types';
import { Building2, User, Gavel, Briefcase } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { SearchInputBar } from '../common/RefactoredCommon';
import { VirtualList } from '../common/VirtualList';

interface EntityGridProps {
  entities: LegalEntity[];
  onSelect: (entity: LegalEntity) => void;
}

export const EntityGrid: React.FC<EntityGridProps> = ({ entities, onSelect }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const getIcon = (type: string) => {
      switch(type) {
          case 'Corporation': return <Building2 className="h-4 w-4 text-blue-600"/>;
          case 'Court': return <Gavel className="h-4 w-4 text-purple-600"/>;
          case 'Law Firm': return <Briefcase className="h-4 w-4 text-slate-600"/>;
          default: return <User className="h-4 w-4 text-green-600"/>;
      }
  };

  const filtered = useMemo(() => {
      return entities.filter(e => {
          const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType === 'All' || e.type === filterType;
          return matchesSearch && matchesType;
      });
  }, [entities, searchTerm, filterType]);

  const renderRow = (ent: LegalEntity) => (
      <div 
        key={ent.id} 
        onClick={() => onSelect(ent)} 
        className={cn("flex items-center border-b h-[72px] px-6 hover:bg-slate-50 transition-colors cursor-pointer group", theme.border.light)}
      >
        <div className="w-[35%] flex items-center gap-3 pr-4">
            <div className={cn("p-2 rounded-lg border shadow-sm", theme.surfaceHighlight, theme.border.default)}>
                {getIcon(ent.type)}
            </div>
            <div className="min-w-0">
                <p className={cn("font-bold text-sm truncate group-hover:text-blue-600 transition-colors", theme.text.primary)}>{ent.name}</p>
                <p className={cn("text-xs truncate", theme.text.secondary)}>{ent.email || ent.company || '-'}</p>
            </div>
        </div>
        <div className="w-[15%] text-sm text-slate-600">
            {ent.type}
        </div>
        <div className="w-[20%]">
             <div className="flex flex-wrap gap-1">
                {ent.roles.map(r => <span key={r} className={cn("text-[10px] px-1.5 py-0.5 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>{r}</span>)}
            </div>
        </div>
        <div className="w-[15%] text-xs text-slate-500">
             {ent.city}, {ent.state}
        </div>
        <div className="w-[15%] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className={cn("w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden")}>
                    <div className={cn("h-full", ent.riskScore > 50 ? "bg-red-500" : "bg-green-500")} style={{ width: `${ent.riskScore}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-400">{ent.riskScore}</span>
            </div>
            <Badge variant={ent.status === 'Active' ? 'success' : 'neutral'}>{ent.status}</Badge>
        </div>
      </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm shrink-0", theme.surface, theme.border.default)}>
            <div className="w-full max-w-md">
                <SearchInputBar 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search entities..." 
                />
            </div>
            <select 
                className={cn("p-2 border rounded text-sm outline-none bg-transparent ml-4", theme.border.default, theme.text.primary)}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="All">All Types</option>
                <option value="Individual">Individuals</option>
                <option value="Corporation">Corporations</option>
                <option value="Law Firm">Law Firms</option>
                <option value="Court">Courts</option>
            </select>
        </div>

        <div className={cn("flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden shadow-sm bg-white", theme.border.default)}>
             {/* Fixed Header */}
             <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
                <div className="w-[35%]">Entity Name</div>
                <div className="w-[15%]">Type</div>
                <div className="w-[20%]">Roles</div>
                <div className="w-[15%]">Location</div>
                <div className="w-[15%]">Risk & Status</div>
             </div>
             
             {/* Virtual Body */}
             <div className="flex-1 relative">
                {filtered.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-sm text-slate-400">No entities found.</div>
                ) : (
                    <VirtualList 
                        items={filtered}
                        height="100%"
                        itemHeight={72}
                        renderItem={renderRow}
                    />
                )}
             </div>
        </div>
    </div>
  );
};
