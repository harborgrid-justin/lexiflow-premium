import React, { useState } from 'react';
import { ResearchSession } from '@/types';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { DataService } from '@/services/data/dataService';
import { ResearchSidebar } from './ResearchSidebar';
import { ResearchResults } from './ResearchResults';
import { ResearchInput } from './ResearchInput';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { performSearch } from './research.utils';
import { useWindow } from '@/providers';
import { queryClient } from '@/services/infrastructure/queryClient';

export const ActiveResearch: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Load research history from IndexedDB via useQuery for accurate, cached data
  const { data: history = [] } = useQuery<ResearchSession[]>(
    queryKeys.research.history(),
    () => DataService.research.getHistory()
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const { newSession } = await performSearch(query, history);
        queryClient.invalidate(queryKeys.research.history());
        setActiveSessionId(newSession.id);
        setQuery('');
    } catch (error) {
        console.error("Search failed:", error);
        // Optionally, set an error state to show in the UI
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleViewSource = (url: string, title: string) => {
      const winId = `source-${Date.now()}`;
      openWindow(
          winId,
          `Source: ${title}`,
          <div className="h-full w-full flex flex-col">
              <div className="p-2 border-b bg-slate-100 flex items-center gap-2 text-xs truncate">
                  <span className="font-bold">URL:</span> {url}
              </div>
              <iframe src={url} className="flex-1 w-full h-full border-0 bg-white" title={title} sandbox="allow-scripts allow-same-origin" />
          </div>
      );
  };

  const activeSession = history.find(s => s.id === activeSessionId) || history[0];

  return (
    <div className={cn("flex flex-col h-full rounded-lg border overflow-hidden shadow-sm", theme.surface.default, theme.border.default)}>
      <ResearchInput 
        query={query} 
        setQuery={setQuery} 
        onSearch={handleSearch} 
        isLoading={isLoading} 
      />
      <div className="flex-1 flex overflow-hidden">
        <ResearchSidebar 
          history={history} 
          activeSessionId={activeSessionId} 
          onSelectSession={setActiveSessionId} 
        />
        <div className={cn("flex-1 overflow-y-auto p-6 transition-colors", theme.surface.highlight)}>
            <ResearchResults session={activeSession} onViewSource={handleViewSource} />
        </div>
      </div>
    </div>
  );
};

