/**
 * @module enterprise/Research/KnowledgeBase
 * @category Enterprise Research
 * @description Firm knowledge repository with work product search, templates, and best practices
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Folder,
  FileText,
  BookOpen,
  Lightbulb,
  Star,
  Tag,
  Calendar,
  User,
  Download,
  Share2,
  Eye,
  Filter,
  SortAsc,
  Grid3x3,
  List,
  Upload,
  Plus,
  Clock,
  TrendingUp,
  Archive,
  Lock,
  Users,
  Award,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ResourceType = 'template' | 'memo' | 'brief' | 'contract' | 'best-practice' | 'form';
export type ResourceCategory =
  | 'litigation'
  | 'corporate'
  | 'real-estate'
  | 'employment'
  | 'ip'
  | 'tax'
  | 'general';

export interface KnowledgeResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: ResourceCategory;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  views: number;
  rating: number;
  tags: string[];
  fileSize?: string;
  practiceArea: string;
  jurisdiction?: string;
  confidential: boolean;
  access: 'public' | 'firm' | 'team' | 'private';
}

export interface KnowledgeBaseProps {
  resources?: KnowledgeResource[];
  onSearch?: (query: string, filters: SearchFilters) => void;
  onDownload?: (resourceId: string) => void;
  onUpload?: (resource: Partial<KnowledgeResource>) => void;
  onShare?: (resourceId: string, users: string[]) => void;
  className?: string;
}

export interface SearchFilters {
  type?: ResourceType[];
  category?: ResourceCategory[];
  dateRange?: { from: Date; to: Date };
  practiceArea?: string[];
  tags?: string[];
  author?: string;
  minRating?: number;
}

// ============================================================================
// Component
// ============================================================================

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  resources: initialResources = [],
  onSearch,
  onDownload,
  onUpload,
  onShare,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<KnowledgeResource | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');

  // Mock data for demonstration
  const [resources] = useState<KnowledgeResource[]>(
    initialResources.length > 0
      ? initialResources
      : [
          {
            id: '1',
            title: 'Motion for Summary Judgment Template',
            description:
              'Comprehensive template for federal summary judgment motions with annotations and best practices.',
            type: 'template',
            category: 'litigation',
            author: { name: 'Sarah Johnson', avatar: 'SJ' },
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-15'),
            downloads: 245,
            views: 1203,
            rating: 4.8,
            tags: ['summary judgment', 'federal court', 'civil litigation'],
            fileSize: '45 KB',
            practiceArea: 'Civil Litigation',
            jurisdiction: 'Federal',
            confidential: false,
            access: 'firm',
          },
          {
            id: '2',
            title: 'Employment Agreement - Executive Level',
            description:
              'Detailed executive employment agreement with equity provisions and non-compete clauses.',
            type: 'contract',
            category: 'employment',
            author: { name: 'Michael Chen', avatar: 'MC' },
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-12'),
            downloads: 178,
            views: 892,
            rating: 4.6,
            tags: ['employment', 'executive', 'non-compete', 'equity'],
            fileSize: '68 KB',
            practiceArea: 'Employment Law',
            confidential: true,
            access: 'team',
          },
          {
            id: '3',
            title: 'Research Memo: Implied Warranty Analysis',
            description:
              'In-depth analysis of implied warranty claims under UCC Article 2 with recent case law.',
            type: 'memo',
            category: 'corporate',
            author: { name: 'Emily Rodriguez', avatar: 'ER' },
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-05'),
            downloads: 89,
            views: 456,
            rating: 4.9,
            tags: ['UCC', 'warranty', 'contracts', 'commercial law'],
            fileSize: '120 KB',
            practiceArea: 'Commercial Law',
            jurisdiction: 'Multi-State',
            confidential: false,
            access: 'firm',
          },
          {
            id: '4',
            title: 'Best Practices: Discovery Response Protocol',
            description:
              'Firm-wide protocol for responding to discovery requests with quality control checklists.',
            type: 'best-practice',
            category: 'litigation',
            author: { name: 'David Park', avatar: 'DP' },
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-14'),
            downloads: 312,
            views: 1567,
            rating: 5.0,
            tags: ['discovery', 'best practices', 'litigation management'],
            fileSize: '25 KB',
            practiceArea: 'Litigation',
            confidential: false,
            access: 'firm',
          },
        ]
  );

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length },
    { id: 'litigation', name: 'Litigation', count: 2 },
    { id: 'corporate', name: 'Corporate', count: 1 },
    { id: 'employment', name: 'Employment', count: 1 },
    { id: 'real-estate', name: 'Real Estate', count: 0 },
    { id: 'ip', name: 'IP', count: 0 },
    { id: 'tax', name: 'Tax', count: 0 },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'template':
        return <FileText className="h-5 w-5" />;
      case 'memo':
        return <BookOpen className="h-5 w-5" />;
      case 'brief':
        return <FileText className="h-5 w-5" />;
      case 'contract':
        return <FileText className="h-5 w-5" />;
      case 'best-practice':
        return <Lightbulb className="h-5 w-5" />;
      case 'form':
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'template':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'memo':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'brief':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'contract':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'best-practice':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'form':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getAccessIcon = (access: KnowledgeResource['access']) => {
    switch (access) {
      case 'public':
        return <Users className="h-3 w-3" />;
      case 'firm':
        return <Award className="h-3 w-3" />;
      case 'team':
        return <Users className="h-3 w-3" />;
      case 'private':
        return <Lock className="h-3 w-3" />;
    }
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Knowledge Base
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Firm repository of templates, work product, and best practices
            </p>
          </div>
          <button
            onClick={() => onUpload?.({})}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4" />
            Upload Resource
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, memos, and best practices..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-32 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
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
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
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
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {sortedResources.length} resources
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {sortedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedResource(resource)}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`rounded-lg p-3 ${getTypeColor(resource.type)}`}
                    >
                      {getTypeIcon(resource.type)}
                    </div>
                    {resource.confidential && (
                      <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {resource.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {resource.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {resource.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {resource.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {resource.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {resource.author.avatar}
                      </div>
                      <span className="text-xs">{resource.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      {getAccessIcon(resource.access)}
                      <span className="capitalize">{resource.access}</span>
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
              {sortedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedResource(resource)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 rounded-lg p-3 ${getTypeColor(resource.type)}`}
                    >
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {resource.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {resource.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {resource.confidential && (
                            <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1">
                        {resource.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {resource.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {resource.updatedAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {resource.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {resource.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {resource.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          {getAccessIcon(resource.access)}
                          <span className="capitalize">{resource.access}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {sortedResources.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
            >
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No Resources Found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'Upload your first resource to get started.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResource(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {selectedResource.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {selectedResource.practiceArea}
                      {selectedResource.jurisdiction && ` • ${selectedResource.jurisdiction}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {selectedResource.description}
                </p>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Author</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedResource.author.name}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                      Last Updated
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedResource.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Downloads</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedResource.downloads}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Rating</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedResource.rating.toFixed(1)} / 5.0
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onDownload?.(selectedResource.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => onShare?.(selectedResource.id, [])}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
