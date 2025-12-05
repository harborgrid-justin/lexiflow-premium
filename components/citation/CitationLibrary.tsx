
import React, { useState } from 'react';
import { Citation } from '../../types';
import { DataService } from '../../services/dataService';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { CheckCircle, AlertTriangle, X, Book, Scale, FileText, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';
import { CitationDetail } from './CitationDetail';

interface CitationLibraryProps {
  onSelect: (citation: Citation) => void;
}

export const CitationLibrary: React.FC<CitationLibraryProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');

  // Enterprise Data Access
  const { data: citations = [] } = useQuery<Citation[]>(
      [STORES.CITATIONS, 'all'],
      DataService.citations.getAll
  );

  const filteredCitations = citations.filter(c => 
      c.citation.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getSignalIcon = (signal?: string) => {
      switch(signal) {
          case 'Positive': return <CheckCircle className="h-4 w-4 text-green-500"/>;
          case 'Caution': return <AlertTriangle className="h-4 w-4 text-amber-500"/>;
          case 'Negative': return <X className="h-4 w-4 text-red-500"/>;
          default: return <Book className="h-4 w-4 text-slate-400"/>;
      }
  };

  const getTypeIcon = (type: string) => {
      if (type === 'Case Law') return <Scale className={cn("h-4 w-4", theme.text.secondary)}/>;
      if (type === 'Statute') return <FileText className={cn("h-4 w-4", theme.text.secondary)}/>;
      return <Book className={cn("h-4 w-4", theme.text.secondary)}/>;
  };

  const renderRow = (cit: Citation) => (
      <div 
        key={cit.id} 
        onClick={() => onSelect(cit)} 
        className={cn("flex items-center border-b h-[64px] px-6 cursor-pointer hover:bg-slate-50 transition-colors group", theme.border.light)}
      >
          <div className="w-16 flex justify-center" title={cit.shepardsSignal}>
              {getSignalIcon(cit.shepardsSignal)}
          </div>
          <div className="w-32">
              <span className={cn("font-bold font-mono text-xs", theme.primary.text)}>{cit.citation}</span>
          </div>
          <div className="flex-1 min-w-0 pr-4">
               <div className={cn("font-medium text-sm truncate", theme.text.primary)} title={cit.title}>{cit.title}</div>
               <div className={cn("text-xs truncate mt-0.5", theme.text.secondary)}>{cit.description}</div>
          </div>
          <div className="w-32 flex items-center gap-2">
              {getTypeIcon(cit.type)}
              <span className="text-xs">{cit.type}</span>
          </div>
          <div className="w-24">
              <Badge variant={cit.relevance === 'High' ? 'success' : cit.relevance === 'Medium' ? 'info' : 'neutral'}>
                  {cit.relevance}
              </Badge>
          </div>
          <div className="w-20 text-right">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => { e.stopPropagation(); handleOpenDetail(cit); }}
                title="Open in New Window"
              >
                  <ExternalLink className="h-4 w-4"/>
              </Button>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full">
        <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
            <SearchToolbar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search citation, title, or description..." 
                className="border-none shadow-none p-0"
            />
        </div>
        
        <div className={cn("flex-1 min-h-0 flex flex-col bg-white border-t", theme.border.light)}>
            {/* Header */}
            <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
                <div className="w-16 text-center">Signal</div>
                <div className="w-32">Citation</div>
                <div className="flex-1">Title</div>
                <div className="w-32">Type</div>
                <div className="w-24">Relevance</div>
                <div className="w-20 text-right">Action</div>
            </div>

            <div className="flex-1 relative">
                <VirtualList 
                    items={filteredCitations}
                    height="100%"
                    itemHeight={64}
                    renderItem={renderRow}
                    emptyMessage="No citations found."
                />
            </div>
        </div>
    </div>
  );
};
