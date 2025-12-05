
import React, { useState, useTransition } from 'react';
import { Search, ChevronRight, Book, Star, Loader2 } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { WikiArticle } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const WikiView: React.FC = () => {
  const { theme, mode } = useTheme();
  const [activeArticleId, setActiveArticleId] = useState('ca-employment');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // Enterprise Query
  const { data: articles = [] } = useQuery<WikiArticle[]>(
      [STORES.WIKI, 'all'],
      DataService.knowledge.getArticles
  );

  const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0];
  
  // Filtering logic inside render, but input updates are prioritized
  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      startTransition(() => {
          setSearch(e.target.value);
      });
  };

  return (
    <div className={cn("h-full flex border-t shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
      {/* Wiki Sidebar */}
      <div className={cn("w-72 border-r flex flex-col shrink-0 h-full", theme.border.default, theme.surfaceHighlight)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
          <div className="relative">
            {isPending ? (
                <Loader2 className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin", theme.text.tertiary)}/>
            ) : (
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
            )}
            <input 
              className={cn("w-full pl-9 pr-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500", theme.surface, theme.border.default, theme.text.primary)} 
              placeholder="Search wiki..."
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className={cn("flex-1 overflow-y-auto p-3 space-y-6", isPending ? "opacity-50" : "")}>
          <div>
            <h4 className={cn("px-3 text-xs font-bold uppercase tracking-wide mb-2", theme.text.tertiary)}>Practice Guides</h4>
            <ul className="space-y-0.5">
              {filteredArticles.map(article => (
                <li key={article.id}>
                    <button 
                    onClick={() => setActiveArticleId(article.id)}
                    className={cn(
                        "w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between transition-colors text-left",
                        activeArticleId === article.id 
                        ? cn(theme.primary.light, theme.primary.text) 
                        : cn(theme.text.secondary, `hover:${theme.surface}`, `hover:${theme.text.primary}`)
                    )}
                    >
                    <span className="truncate">{article.title}</span> 
                    {activeArticleId === article.id && <ChevronRight className="h-4 w-4 opacity-50 shrink-0"/>}
                    </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={cn("px-3 text-xs font-bold uppercase tracking-wide mb-2", theme.text.tertiary)}>Internal Ops</h4>
            <ul className="space-y-0.5">
              {['Billing Codes', 'IT Security Policy', 'Remote Work Guidelines'].map(item => (
                <li key={item}>
                  <button className={cn("w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors", theme.text.secondary, `hover:${theme.surface}`, `hover:${theme.text.primary}`)}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn("flex-1 overflow-y-auto p-8", theme.surface)}>
        {activeArticle ? (
            <div className="max-w-4xl mx-auto w-full animate-fade-in">
            <div className={cn("mb-6 flex items-center gap-2 text-sm", theme.text.secondary)}>
                <span>Library</span> <ChevronRight className="h-3 w-3"/> 
                <span>{activeArticle.category}</span> <ChevronRight className="h-3 w-3"/> 
                <span className={cn("font-semibold", theme.text.primary)}>{activeArticle.title}</span>
            </div>
            
            <h1 className={cn("text-3xl font-bold mb-4", theme.text.primary)}>{activeArticle.title}</h1>
            
            <div className={cn("flex gap-4 mb-8 text-sm border-b pb-4", theme.border.light, theme.text.secondary)}>
                <span className="flex items-center"><Book className="h-4 w-4 mr-1"/> Last updated: {activeArticle.lastUpdated}</span>
                {activeArticle.isFavorite && <span className="flex items-center text-yellow-500"><Star className="h-4 w-4 mr-1 fill-current"/> Favorite</span>}
            </div>

            <div className={cn("prose max-w-none", mode === 'dark' ? "prose-invert" : "prose-slate")}>
                <p className="lead">{activeArticle.content}</p>
                {/* Placeholder content for demo */}
                <h3>1. Initial Case Assessment</h3>
                <p>When a new matter is assigned, the following steps must be taken within 48 hours:</p>
                <ul>
                <li>Conflict check (Global)</li>
                <li>Preservation Letter to Client (Litigation Hold)</li>
                <li>Review of regulatory notices</li>
                </ul>

                <h3>2. Responsive Pleading Strategy</h3>
                <p>Strategic consideration is required before filing responsive pleadings. Evaluate jurisdiction and venue.</p>
                
                <div className={cn("p-4 my-4 border-l-4 rounded-r-md text-sm", theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)}>
                <strong>Tip:</strong> Always check the local rules of the specific department.
                </div>
            </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-slate-400">Select an article to view</div>
        )}
      </div>
    </div>
  );
};
