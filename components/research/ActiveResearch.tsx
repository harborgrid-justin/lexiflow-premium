
import React, { useState } from 'react';
import { GeminiService } from '../../services/geminiService';
import { ResearchSession } from '../../types';
import { ResearchSidebar } from './ResearchSidebar';
import { ResearchResults } from './ResearchResults';
import { ResearchInput } from './ResearchInput';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';

export const ActiveResearch: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const result = await GeminiService.conductResearch(query);
    
    const newSession: ResearchSession = {
      id: Date.now().toString(),
      userId: 'current-user', 
      query,
      response: result.text,
      sources: result.sources,
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory([newSession, ...history]);
    setActiveSessionId(newSession.id);
    setIsLoading(false);
    setQuery('');
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
    <div className={cn("flex flex-col h-full rounded-lg border overflow-hidden shadow-sm", theme.surface, theme.border.default)}>
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
        <div className={cn("flex-1 overflow-y-auto p-6 transition-colors", theme.surfaceHighlight)}>
            <ResearchResults session={activeSession} onViewSource={handleViewSource} />
        </div>
      </div>
    </div>
  );
};
