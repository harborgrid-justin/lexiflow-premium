
import React, { useState, useEffect } from 'react';
import { Search, Loader2, BookOpen, Filter, Sparkles } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

interface ResearchInputProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({ query, setQuery, onSearch, isLoading }) => {
  const { theme } = useTheme();
  const [intent, setIntent] = useState<'general' | 'caselaw' | 'statute'>('general');
  const [isDetecting, setIsDetecting] = useState(false);

  // Simple heuristic-based neural intent detection (simulated)
  useEffect(() => {
      if (query.length > 5) {
          setIsDetecting(true);
          const timer = setTimeout(() => {
              if (/section|code|statute|act|usc/i.test(query)) {
                  setIntent('statute');
              } else if (/v\.|versus|holding|precedent|court/i.test(query)) {
                  setIntent('caselaw');
              } else {
                  setIntent('general');
              }
              setIsDetecting(false);
          }, 600);
          return () => clearTimeout(timer);
      } else {
          setIntent('general');
      }
  }, [query]);

  return (
    <div className={cn("border-b px-6 py-4 shadow-sm z-10 shrink-0", theme.surface.default, theme.border.default)}>
      <h2 className={cn("text-xl font-bold mb-4 flex items-center", theme.text.primary)}>
          <BookOpen className={cn("h-6 w-6 mr-2", theme.primary.text)}/> Legal Research Center
      </h2>
      <form onSubmit={onSearch} className="relative max-w-4xl">
        <div className="relative flex items-center">
          <input
              type="text"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Enter natural language query (e.g., 'Standard for piercing corporate veil in Delaware')..."
              className={cn(
                "w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-all text-sm shadow-inner",
                theme.surface.highlight,
                theme.border.default,
                theme.text.primary,
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
          />
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", theme.text.tertiary)} />
          
          {/* Intent Badge */}
          {query.length > 0 && (
             <div className={cn(
                 "absolute right-24 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center transition-all",
                 isDetecting ? "opacity-50" : "opacity-100",
                 intent === 'caselaw' ? "bg-blue-100 text-blue-700" : 
                 intent === 'statute' ? "bg-purple-100 text-purple-700" : 
                 "bg-slate-100 text-slate-500"
             )}>
                 {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1"/>}
                 {intent === 'general' ? 'General Search' : intent}
             </div>
          )}

          <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors text-sm shadow-sm",
                theme.primary.DEFAULT,
                theme.text.inverse,
                theme.primary.hover
              )}
          >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Search'}
          </button>
        </div>
        <div className={cn("flex gap-4 mt-2 text-xs px-2", theme.text.secondary)}>
           <button type="button" onClick={() => setIntent('general')} className={cn("flex items-center cursor-pointer transition-colors", intent === 'general' ? theme.primary.text : `hover:${theme.primary.text}`)}><Filter className="h-3 w-3 mr-1"/> All Jurisdictions</button>
           <button type="button" onClick={() => setIntent('caselaw')} className={cn("flex items-center cursor-pointer transition-colors", intent === 'caselaw' ? theme.primary.text : `hover:${theme.primary.text}`)}><Filter className="h-3 w-3 mr-1"/> Case Law Only</button>
           <button type="button" onClick={() => setIntent('statute')} className={cn("flex items-center cursor-pointer transition-colors", intent === 'statute' ? theme.primary.text : `hover:${theme.primary.text}`)}><Filter className="h-3 w-3 mr-1"/> Statutes</button>
        </div>
      </form>
    </div>
  );
};
