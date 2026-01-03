/**
 * @module components/knowledge/WikiView
 * @category Knowledge
 * @description Firm wiki with article browser and sanitized content.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Book, Loader2, Search, Star } from 'lucide-react';
import React, { useCallback, useMemo, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';
import { useTheme } from '@/providers';

// Components
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { WikiArticle } from '@/types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const sanitizeHtml = (html: string) => {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
    .replace(/on\w+="[^"]*"/g, "");
};

export const WikiView: React.FC = () => {
  const { theme, mode } = useTheme();
  const [activeArticleId, setActiveArticleId] = useState('ca-employment');
  const [isPending, startTransition] = useTransition();

  const { data: articles = [], isLoading } = useQuery<WikiArticle[]>(
    ['wiki', 'all'],
    DataService.knowledge.getWikiArticles
  );

  const { filteredItems, searchQuery, setSearchQuery } = useFilterAndSearch({
    items: articles as unknown as Record<string, unknown>[],
    config: {
      searchFields: ['title', 'category']
    }
  });

  const filteredArticles = filteredItems as unknown as WikiArticle[];

  const activeArticle = useMemo(
    () => articles.find(a => a.id === activeArticleId),
    [articles, activeArticleId]
  );

  const handleSelectArticle = useCallback((id: string) => {
    startTransition(() => {
      setActiveArticleId(id);
    });
  }, []);

  if (isLoading) {
    return <AdaptiveLoader contentType="document" shimmer message="Loading wiki articles..." />;
  }

  return (
    <div className={cn("flex h-full rounded-lg border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Sidebar */}
      <div className={cn("w-80 border-r flex flex-col shrink-0", theme.surface.highlight, theme.border.default)}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
            <input
              className={cn("w-full pl-8 pr-3 py-1.5 text-sm border rounded-md outline-none", theme.surface.default, theme.border.default)}
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && <div className="p-4 text-center"><Loader2 className="animate-spin" /></div>}
          {filteredArticles.map(article => (
            <button
              key={article.id}
              onClick={() => handleSelectArticle(article.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors",
                activeArticleId === article.id ? "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : `hover:${theme.surface.default}`
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{article.title}</p>
                <p className="text-xs text-slate-500">{article.category}</p>
              </div>
              {article.isFavorite && <Star className="h-4 w-4 text-amber-400 fill-current ml-2 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto p-8 md:p-12", isPending ? "opacity-50" : "")}>
        {activeArticle ? (
          <div className={cn("prose max-w-none", mode === 'dark' ? "prose-invert" : "")}>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="neutral">{activeArticle.category}</Badge>
              <span className={cn("text-xs", theme.text.secondary)}>Last Updated: {activeArticle.lastUpdated} by {activeArticle.author}</span>
            </div>
            <h1 className="mb-2">{activeArticle.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeArticle.content) }} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Book className="h-16 w-16 text-slate-300 mb-4" />
            <p className={cn("font-medium", theme.text.secondary)}>Select an article to read</p>
          </div>
        )}
      </div>
    </div>
  );
};
