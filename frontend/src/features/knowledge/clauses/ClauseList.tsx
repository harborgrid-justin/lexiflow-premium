
import React, { useState, useMemo } from 'react';
import { Clause } from '@/types';
import { DataService } from '@/services/data/dataService';
import { Button } from '@/components/atoms';
import { SearchToolbar } from '@/components/organisms';
import { Copy, History, Loader2, BookOpen, Check } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { filterClauses } from './clauseList.utils';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { VirtualList } from '@/components/organisms';
import { EmptyState } from '@/components/molecules';
import { NOTIFICATION_AUTO_DISMISS_MS } from '@/config/master.config';

interface ClauseListProps {
  onSelectClause: (clause: Clause) => void;
}

export const ClauseList: React.FC<ClauseListProps> = ({ onSelectClause }) => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: clauses = [], isLoading } = useQuery<Clause[]>(
        ['clauses', 'all'],
        DataService.clauses.getAll
    );

    const filteredClauses = useMemo(() => filterClauses(clauses, searchTerm), [clauses, searchTerm]);
    
    const handleCopy = (content: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), NOTIFICATION_AUTO_DISMISS_MS);
    };

    const renderRow = (clause: Clause) => (
      <div 
        key={clause.id} 
        onClick={() => onSelectClause(clause)} 
        className={cn("flex items-center border-b h-[64px] px-6 cursor-pointer hover:bg-slate-50 transition-colors group", theme.border.default)}
      >
          <div className="flex-1 min-w-0 pr-4">
               <div className={cn("font-bold text-sm truncate", theme.text.primary)}>{clause.name}</div>
               <p className={cn("text-xs truncate", theme.text.secondary)}>{clause.category}</p>
          </div>
          <div className="w-32">
              <span className="text-xs">v{clause.version} • {clause.usageCount} uses</span>
          </div>
          <div className="w-48 text-right">
              <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => handleCopy(clause.content, clause.id, e)}>
                {copiedId === clause.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4"/>}
              </Button>
              <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelectClause(clause); }}>
                <History className="h-4 w-4"/>
              </Button>
          </div>
      </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Search clauses..." className="border-none shadow-none p-0" />
            </div>
            
            <div className={cn("flex-1 min-h-0 flex flex-col bg-white border-t", theme.border.default)}>
                <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
                    <div className="flex-1">Clause Name & Category</div>
                    <div className="w-32">Version & Usage</div>
                    <div className="w-48 text-right">Actions</div>
                </div>
                <div className="flex-1 relative">
                    {isLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
                    : filteredClauses.length > 0 ? (
                        <VirtualList items={filteredClauses} height="100%" itemHeight={64} renderItem={renderRow} />
                    ) : (
                        <div className="pt-10"><EmptyState icon={BookOpen} title="No Clauses Found" description="The clause library is empty or your search returned no results."/></div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ClauseList;


