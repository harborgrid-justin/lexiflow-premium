
import React, { useState, useMemo, useTransition } from 'react';
import { Clause } from '../../types';
import { ShieldAlert, FileText, History, Filter, Star, Copy, Check, Loader2 } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { SearchToolbar } from '../common/SearchToolbar';
import { Button } from '../common/Button';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { VirtualList } from '../common/VirtualList';

interface ClauseListProps {
  onSelectClause: (clause: Clause) => void;
}

export const ClauseList: React.FC<ClauseListProps> = ({ onSelectClause }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Performance Engine: useQuery
  const { data: clauses = [], isLoading } = useQuery<Clause[]>(
      [STORES.CLAUSES, 'all'],
      DataService.clauses.getAll
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchChange = (term: string) => {
      startTransition(() => {
          setSearchTerm(term);
      });
  };

  const filteredClauses = useMemo(() => {
    return clauses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'All' || c.riskRating === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [searchTerm, filterRisk, clauses]);

  // Virtual Row Renderer
  const renderRow = (clause: Clause) => (
    <div key={clause.id} className="px-2 py-2">
        <div 
            className={cn(
                "rounded-lg border shadow-sm flex flex-col transition-all hover:shadow-md group bg-white", 
                theme.border.default,
                `hover:${theme.primary.border}`
            )}
        >
            <div className={cn("p-4 border-b flex justify-between items-start", theme.border.light, theme.surfaceHighlight)}>
            <div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 inline-block", theme.surface, theme.border.default, theme.text.secondary)}>
                    {clause.category}
                </span>
                <h3 className={cn("text-lg font-bold leading-tight", theme.text.primary)}>{clause.name}</h3>
            </div>
            <div className="flex gap-2">
                {clause.riskRating === 'High' && (
                    <div title="High Risk" className="p-1.5 rounded bg-red-50 text-red-600">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                )}
                <button className={cn("p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-yellow-500 transition-colors")}>
                    <Star className="h-4 w-4"/>
                </button>
            </div>
            </div>
            
            <div className="p-4 flex-1">
            <div className={cn("text-sm leading-relaxed p-3 rounded border italic font-serif relative min-h-[100px]", theme.surface, theme.border.light, theme.text.secondary)}>
                "{clause.content}"
                <button 
                    onClick={(e) => { e.stopPropagation(); handleCopy(clause.content, clause.id); }}
                    className={cn("absolute bottom-2 right-2 p-1.5 rounded shadow-sm border opacity-0 group-hover:opacity-100 transition-all", theme.surface, theme.border.default, theme.text.primary)}
                    title="Copy to Clipboard"
                >
                    {copiedId === clause.id ? <Check className="h-3 w-3 text-green-600"/> : <Copy className="h-3 w-3"/>}
                </button>
            </div>
            </div>

            <div className={cn("p-3 border-t flex justify-between items-center text-xs", theme.border.light, theme.surfaceHighlight)}>
            <div className={cn("flex gap-3", theme.text.tertiary)}>
                <span className="flex items-center"><FileText className="h-3 w-3 mr-1"/> v{clause.version}</span>
                <span className="flex items-center"><History className="h-3 w-3 mr-1"/> Used {clause.usageCount}x</span>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                className={cn("text-xs h-7", theme.primary.text)}
                onClick={() => onSelectClause(clause)}
            >
                View History
            </Button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className={cn("p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center shrink-0", theme.surface, theme.border.default)}>
        <div className="w-full md:max-w-xl">
             <SearchToolbar 
                value={searchTerm} 
                onChange={handleSearchChange}
                placeholder="Search clauses by name, content, or category..."
                className="border-0 shadow-none p-0"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            {(isPending || isLoading) && <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>}
            <div className={cn("flex items-center px-3 py-2 border rounded-md", theme.surfaceHighlight, theme.border.default)}>
                <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                <select 
                    className={cn("bg-transparent text-sm outline-none cursor-pointer", theme.text.primary)}
                    value={filterRisk}
                    onChange={(e) => startTransition(() => setFilterRisk(e.target.value))}
                >
                    <option value="All">All Risks</option>
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                </select>
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {filteredClauses.length === 0 ? (
             <div className={cn("col-span-full py-12 text-center border-2 border-dashed rounded-lg h-full flex items-center justify-center", theme.border.default, theme.text.tertiary)}>
                <p>No clauses found matching your filters.</p>
             </div>
        ) : (
            <VirtualList 
                items={filteredClauses}
                height="100%"
                itemHeight={320} // Taller for Card view
                renderItem={renderRow}
            />
        )}
      </div>
    </div>
  );
};
