
import React from 'react';
import { BookOpen, Search, Plus, ExternalLink } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';
import { SignalChecker } from './research/SignalChecker';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { Citation } from '@/types';

interface CitationAssistantProps {
  onInsertCitation: (citation: string) => void;
}

export const CitationAssistant: React.FC<CitationAssistantProps> = ({ onInsertCitation }) => {
  const { theme } = useTheme();

  // Cross-Module Integration: Fetching from Research/Citation Domain
  const { data: citations = [] } = useQuery<Citation[]>(
    ['citations', 'all'],
    DataService.citations.getAll
  );

  const { filteredItems: filtered, searchQuery, setSearchQuery } = useFilterAndSearch<Citation>({
    items: citations,
    config: {
      searchFields: ['citation', 'title', 'description']
    }
  });

  // Helper to map citation status to SignalChecker status
  const getSignalStatus = (citation: Citation): 'Positive' | 'Caution' | 'Negative' | 'Unknown' => {
    const status = (citation.shepardsSignal || citation.status || '').toLowerCase();
    if (status.includes('positive') || status.includes('valid') || status.includes('good')) return 'Positive';
    if (status.includes('caution') || status.includes('warning') || status.includes('distinguished')) return 'Caution';
    if (status.includes('negative') || status.includes('overruled') || status.includes('reversed')) return 'Negative';
    return 'Unknown';
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b", theme.border.default)}>
        <h3 className={cn("text-sm font-bold flex items-center mb-3", theme.text.primary)}>
          <BookOpen className="h-4 w-4 mr-2" /> Authority Assistant
        </h3>
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
                className={cn("w-full pl-8 pr-3 py-1.5 text-xs border rounded-md outline-none focus:ring-1 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                placeholder="Search saved authorities..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filtered.map(c => (
            <div key={c.id} className={cn("p-3 rounded-lg border group", theme.surface.default, theme.border.default)}>
                <div className="flex justify-between items-start mb-1">
                    <span className={cn("font-mono text-xs font-bold hover:underline cursor-pointer", theme.primary.text)}>{c.citation}</span>
                    <SignalChecker citation={c.citation} status={getSignalStatus(c)} />
                </div>
                <p className={cn("text-xs font-medium mb-1", theme.text.primary)}>{c.title}</p>
                <p className={cn("text-[10px] line-clamp-2 italic mb-2", theme.text.secondary)}>{c.description}</p>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => onInsertCitation(c.citation)}
                        className={cn("flex-1 py-1 rounded text-xs font-medium border transition-colors flex items-center justify-center gap-1", theme.surface.highlight, theme.border.default, `hover:${theme.primary.light} hover:text-blue-600`)}
                    >
                        <Plus className="h-3 w-3" /> Insert
                    </button>
                    <button title="Open citation in new tab" className={cn("p-1 rounded text-slate-400 hover:text-blue-600")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

