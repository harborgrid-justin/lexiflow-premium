/**
 * CitationLibrary.tsx
 * 
 * Searchable citation database with virtual scrolling and Shepardization indicators.
 * Provides quick access to case citations with validation status and related cases.
 * 
 * @module components/citation/CitationLibrary
 * @category Legal Research - Citation Database
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { ExternalLink, Loader2, BookOpen } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { VirtualList } from '../common/VirtualList';
import { CitationDetail } from './CitationDetail';
import { EmptyState } from '../common/EmptyState';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '../../services/queryClient';
import { useWindow } from '../../context/WindowContext';
import { useWorkerSearch } from '../../hooks/useWorkerSearch';

// Services & Utils
import { DataService } from '../../services/dataService';
import { cn } from '../../utils/cn';
import { STORES } from '../../services/db';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Citation } from '../../types';
import { CitationLibraryProps } from './types';
import { getSignalIcon, getTypeIcon } from './utils';

export const CitationLibrary: React.FC<CitationLibraryProps> = ({ onSelect }) => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: citations = [], isLoading } = useQuery<Citation[]>(
        [STORES.CITATIONS, 'all'],
        DataService.citations.getAll
    );

    const { filteredItems: filteredCitations, isSearching } = useWorkerSearch({
        items: citations,
        query: searchTerm,
        fields: ['citation', 'title', 'description', 'type']
    });

    const handleOpenDetail = (citation: Citation) => {
        const winId = `citation-${citation.id}`;
        openWindow(
            winId,
            `Authority: ${citation.citation}`,
            <CitationDetail 
               citation={citation} 
               onClose={() => closeWindow(winId)} 
            />
        );
    };

    const renderRow = (cit: Citation) => (
      <div 
        key={cit.id} 
        onClick={() => onSelect(cit)} 
        className={cn("flex items-center border-b h-[64px] px-6 cursor-pointer hover:bg-slate-50 transition-colors group", theme.border.default)}
      >
          <div className="w-16 flex justify-center" title={cit.shepardsSignal}>{getSignalIcon(cit.shepardsSignal)}</div>
          <div className="w-48"><span className={cn("font-bold font-mono text-xs", theme.primary.text)}>{cit.citation}</span></div>
          <div className="flex-1 min-w-0 pr-4">
               <div className={cn("font-medium text-sm truncate", theme.text.primary)} title={cit.title}>{cit.title}</div>
          </div>
          <div className="w-32 flex items-center gap-2">{getTypeIcon(cit.type, theme)}<span className="text-xs">{cit.type}</span></div>
          <div className="w-24">
              <Badge variant={cit.relevance === 'High' ? 'success' : cit.relevance === 'Medium' ? 'info' : 'neutral'}>{cit.relevance}</Badge>
          </div>
          <div className="w-20 text-right">
              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleOpenDetail(cit); }} title="Open Details">
                  <ExternalLink className="h-4 w-4"/>
              </Button>
          </div>
      </div>
    );

    const renderMobileRow = (cit: Citation) => (
        <div className="px-2 py-1.5 h-[110px]">
            <div key={cit.id} onClick={() => onSelect(cit)} className={cn("p-4 rounded-lg shadow-sm border h-full flex flex-col justify-between", theme.surface.default, theme.border.default)}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {getSignalIcon(cit.shepardsSignal)}
                        <span className={cn("font-bold font-mono text-xs", theme.primary.text)}>{cit.citation}</span>
                    </div>
                    <Badge variant="neutral">{cit.type}</Badge>
                </div>
                <h4 className={cn("font-medium text-sm line-clamp-2", theme.text.primary)}>{cit.title}</h4>
                <div className="flex justify-between items-center text-xs mt-1">
                    <span className={cn("font-medium", cit.relevance === 'High' ? 'text-green-600' : 'text-slate-500')}>{cit.relevance} Relevance</span>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenDetail(cit); }}>Details</Button>
                </div>
            </div>
        </div>
    );

    const content = (
        <>
            {/* Desktop */}
            <div className="hidden md:flex flex-col h-full">
                <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
                    <div className="w-16 text-center">Signal</div>
                    <div className="w-48">Citation</div>
                    <div className="flex-1">Title</div>
                    <div className="w-32">Type</div>
                    <div className="w-24">Relevance</div>
                    <div className="w-20 text-right">Action</div>
                </div>
                <div className="flex-1 relative">
                    <VirtualList items={filteredCitations} height="100%" itemHeight={64} renderItem={renderRow} />
                </div>
            </div>
             {/* Mobile */}
            <div className="md:hidden flex-1 relative">
                <VirtualList items={filteredCitations} height="100%" itemHeight={110} renderItem={renderMobileRow} />
            </div>
        </>
    );

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b shrink-0 flex items-center gap-4", theme.border.default)}>
                <div className="flex-1 relative">
                    <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Search citation, title, or description..." className="border-none shadow-none p-0 w-full" />
                    {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-blue-500"/></div>}
                </div>
            </div>
            
            <div className={cn("flex-1 min-h-0 flex flex-col bg-white border-t", theme.border.default)}>
                {isLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
                : filteredCitations.length > 0 ? content
                : <div className="pt-10"><EmptyState icon={BookOpen} title="No Citations Found" description={isSearching ? "Searching..." : "Your firm's citation library is empty or your search returned no results."}/></div>
                }
            </div>
        </div>
    );
};
export default CitationLibrary;
