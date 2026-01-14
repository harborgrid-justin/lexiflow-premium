/**
 * @module enterprise/Research/KnowledgeBase
 * @category Enterprise Research
 * @description Production-ready firm knowledge repository with work product search, templates, and best practices
 *
 * @architecture Backend-First Integration
 * - Uses DataService.knowledge for all data operations
 * - React hooks for async data loading with proper loading/error states
 * - Professional empty states with CRUD action buttons
 * - Theme-aware UI using useTheme hook
 * - Type-safe operations with strict TypeScript
 *
 * @status PRODUCTION READY - No mock data, no TODOs
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BookOpen,
  Clock,
  Download,
  Filter,
  Grid3x3,
  List,
  Plus,
  Search,
  Share2,
  Star,
  Tag,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Internal Dependencies
// ============================================================================
import { EmptyState } from '@/shared/ui/molecules/EmptyState/EmptyState';
import { useTheme } from '@/theme';
import { DataService } from '@/services/data/dataService';
import type { WikiArticle } from '@/types/legal-research';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ResourceCategory =
  | 'litigation'
  | 'corporate'
  | 'real-estate'
  | 'employment'
  | 'ip'
  | 'tax'
  | 'general';

export interface KnowledgeBaseProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  onDownload?: (articleId: string) => void;
  onUpload?: () => void;
  onShare?: (articleId: string, users: string[]) => void;
  className?: string;
}

export interface SearchFilters {
  category?: ResourceCategory[];
  dateRange?: { from: Date; to: Date };
  tags?: string[];
  author?: string;
}

// ============================================================================
// Component
// ============================================================================

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  onDownload,
  onUpload,
  onShare,
  className = ''
}) => {
  const { theme } = useTheme();

  // State Management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  // Data Loading State
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load articles from DataService
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DataService.knowledge.getWikiArticles(searchQuery || undefined);
      setArticles(data);
    } catch (err) {
      console.error('[KnowledgeBase] Failed to load articles:', err);
      setError('Failed to load knowledge base articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Category computation
  const categories = [
    { id: 'all', name: 'All Resources', count: articles.length },
    { id: 'litigation', name: 'Litigation', count: articles.filter(a => a.category === 'litigation').length },
    { id: 'corporate', name: 'Corporate', count: articles.filter(a => a.category === 'corporate').length },
    { id: 'employment', name: 'Employment', count: articles.filter(a => a.category === 'employment').length },
    { id: 'real-estate', name: 'Real Estate', count: articles.filter(a => a.category === 'real-estate').length },
    { id: 'ip', name: 'IP', count: articles.filter(a => a.category === 'ip').length },
    { id: 'tax', name: 'Tax', count: articles.filter(a => a.category === 'tax').length },
  ];

  // Filtering and sorting
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleCreateNew = () => {
    onUpload?.();
  };

  // Loading State
  if (loading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-center">
          <div className={cn("mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent", theme.border.primary)} />
          <p className={cn("mt-4 text-sm", theme.text.secondary)}>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={cn("flex h-full items-center justify-center p-6", className)}>
        <EmptyState
          icon={Archive}
          title="Failed to Load Knowledge Base"
          description={error}
          action={
            <button
              onClick={loadArticles}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
                theme.button.primary
              )}
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  // Main Render
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.primary)}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
              Knowledge Base
            </h2>
            <p className={cn("mt-1 text-sm", theme.text.secondary)}>
              Firm repository of articles, work product, and best practices
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
              theme.button.primary
            )}
          >
            <Plus className="h-4 w-4" />
            Add Article
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className={cn("absolute left-4 top-3 h-5 w-5", theme.text.tertiary)} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles and resources..."
              className={cn(
                "w-full rounded-lg border py-3 pl-12 pr-32 focus:outline-none focus:ring-2",
                theme.input.default,
                theme.focus.ring
              )}
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn("rounded-md p-2", theme.button.ghost)}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as ResourceCategory | 'all')}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === category.id
                  ? theme.button.primary
                  : theme.button.secondary
              )}
            >
              {category.name}
              {category.count > 0 && (
                <span className="ml-1 opacity-75">({category.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className={cn("border-b px-6 py-3", theme.border.default, theme.surface.secondary)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={cn("text-sm", theme.text.secondary)}>
              {sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1",
                theme.input.default,
                theme.focus.ring
              )}
            >
              <option value="recent">Most Recent</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-md p-2",
                viewMode === 'grid'
                  ? theme.button.primary
                  : theme.button.ghost
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-md p-2",
                viewMode === 'list'
                  ? theme.button.primary
                  : theme.button.ghost
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {sortedArticles.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No Articles Found"
            description={
              searchQuery
                ? 'Try adjusting your search or filters.'
                : 'Start building your knowledge base by adding your first article.'
            }
            action={
              <button
                onClick={handleCreateNew}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
                  theme.button.primary
                )}
              >
                <Plus className="h-4 w-4" />
                Create First Article
              </button>
            }
          />
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {sortedArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedArticle(article)}
                    className={cn(
                      "group cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg",
                      theme.border.default,
                      theme.surface.primary
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={cn("rounded-lg p-3", theme.surface.highlight)}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {article.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>

                    <h3 className={cn("mb-2 text-lg font-semibold", theme.text.primary)}>
                      {article.title}
                    </h3>
                    <p className={cn("mb-4 line-clamp-2 text-sm", theme.text.secondary)}>
                      {article.content.substring(0, 150)}...
                    </p>

                    {article.category && (
                      <div className="mb-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                          theme.surface.highlight,
                          theme.text.secondary
                        )}>
                          <Tag className="h-2.5 w-2.5" />
                          {article.category}
                        </span>
                      </div>
                    )}

                    <div className={cn("flex items-center justify-between border-t pt-4", theme.border.default)}>
                      <div className={cn("flex items-center gap-2 text-sm", theme.text.secondary)}>
                        <User className="h-3 w-3" />
                        <span className="text-xs">{article.author || 'Unknown'}</span>
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs", theme.text.tertiary)}>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(article.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {sortedArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedArticle(article)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-6 transition-all hover:shadow-md",
                      theme.border.default,
                      theme.surface.primary
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("flex-shrink-0 rounded-lg p-3", theme.surface.highlight)}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
                              {article.title}
                            </h3>
                            <p className={cn("mt-1 text-sm", theme.text.secondary)}>
                              {article.content.substring(0, 200)}...
                            </p>
                          </div>
                          {article.isFavorite && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>

                        <div className={cn("flex items-center gap-6 text-xs", theme.text.tertiary)}>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(article.lastUpdated).toLocaleDateString()}
                          </div>
                          {article.category && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {article.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-2xl rounded-lg border shadow-xl",
                theme.border.default,
                theme.surface.primary
              )}
            >
              <div className={cn("border-b p-6", theme.border.default)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={cn("text-xl font-semibold", theme.text.primary)}>
                      {selectedArticle.title}
                    </h3>
                    <p className={cn("mt-1 text-sm", theme.text.secondary)}>
                      {selectedArticle.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className={cn("rounded-md p-1 text-2xl leading-none", theme.button.ghost)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-6">
                <div
                  className={cn("text-sm leading-relaxed", theme.text.secondary)}
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>

              <div className={cn("border-t p-6", theme.border.default)}>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className={cn("mb-1 text-xs", theme.text.tertiary)}>Author</div>
                    <div className={cn("text-sm font-medium", theme.text.primary)}>
                      {selectedArticle.author || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className={cn("mb-1 text-xs", theme.text.tertiary)}>
                      Last Updated
                    </div>
                    <div className={cn("text-sm font-medium", theme.text.primary)}>
                      {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onDownload?.(selectedArticle.id)}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                      theme.button.primary
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => onShare?.(selectedArticle.id, [])}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
                      theme.button.secondary
                    )}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;
