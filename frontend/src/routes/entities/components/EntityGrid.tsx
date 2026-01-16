/**
 * @module components/entities/EntityGrid
 * @category Entities
 * @description Virtual list grid for entities with worker-based search.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo, useState } from 'react';
import { Building2, User, Gavel, Briefcase, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";
import { useWorkerSearch } from '@/hooks/useWorkerSearch';

// Components
import { Badge } from '@/components/atoms/Badge';
import { SearchInputBar } from '@/components/organisms/_legacy/RefactoredCommon';
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';

// Utils & Constants
import { cn } from '@/lib/cn';

// Types
import { LegalEntity } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityGridProps {
  /** List of entities. */
  entities: LegalEntity[];
  /** Callback when entity is selected. */
  onSelect: (entity: LegalEntity) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

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

  // 1. First Pass: Cheap Filter (Type)
  const typeFiltered = useMemo(() => {
      return filterType === 'All' ? entities : entities.filter(e => e.type === filterType);
  }, [entities, filterType]);

  // 2. Second Pass: Heavy Search (Worker)
  const { filteredItems: filtered, isSearching } = useWorkerSearch({
      items: typeFiltered,
      query: searchTerm,
      fields: ['name', 'email', 'roles', 'city', 'state']
  });

  const renderRow = (ent: LegalEntity) => (
      <div
        key={ent.id}
        onClick={() => onSelect(ent)}
        className={cn("flex items-center border-b h-[72px] px-6 transition-colors cursor-pointer group", theme.border.default, `hover:${theme.surface.highlight}`)}
      >
        <div className="w-[35%] flex items-center gap-3 pr-4">
            <div className={cn("p-2 rounded-lg border shadow-sm", theme.surface.highlight, theme.border.default)}>
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
                {ent.roles.map(r => <span key={r} className={cn("text-[10px] px-1.5 py-0.5 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>{r}</span>)}
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
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm shrink-0", theme.surface.default, theme.border.default)}>
            <div className="w-full max-w-md relative">
                <SearchInputBar
                    value={searchTerm}
                    onChange={(value: string) => setSearchTerm(value)}
                    placeholder="Search entities..."
                />
                {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-blue-500"/></div>}
            </div>
            <select
                className={cn("p-2 border rounded text-sm outline-none bg-transparent ml-4", theme.border.default, theme.text.primary)}
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
            >
                <option value="All">All Types</option>
                <option value="Individual">Individuals</option>
                <option value="Corporation">Corporations</option>
                <option value="Law Firm">Law Firms</option>
                <option value="Court">Courts</option>
            </select>
        </div>

        <div className={cn("flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden shadow-sm", theme.surface.default, theme.border.default)}>
             {/* Fixed Header */}
             <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider", theme.border.default, theme.surface.highlight, theme.text.secondary)}>
                <div className="w-[35%]">Entity Name</div>
                <div className="w-[15%]">Type</div>
                <div className="w-[20%]">Roles</div>
                <div className="w-[15%]">Location</div>
                <div className="w-[15%]">Risk & Status</div>
             </div>

             {/* Virtual Body */}
             <div className="flex-1 relative">
                {filtered.length === 0 ? (
                     <div className={cn("flex items-center justify-center h-full text-sm", theme.text.tertiary)}>
                         {isSearching ? "Searching..." : "No entities found."}
                     </div>
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
