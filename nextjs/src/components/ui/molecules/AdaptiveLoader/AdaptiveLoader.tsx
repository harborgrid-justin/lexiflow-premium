/**
 * @module components/common/AdaptiveLoader
 * @category Components
 * @description Content-aware loading states with shimmer effects and skeleton screens.
 */

import React, { useMemo } from 'react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

/**
 * Content type for skeleton generation
 */
export type ContentType = 'text' | 'heading' | 'paragraph' | 'avatar' | 'image' | 'card' | 'table' | 'list' | 'button' | 'input';

/**
 * Skeleton item definition
 */
export interface SkeletonItem {
  type: ContentType;
  width?: string | number;
  height?: string | number;
  count?: number; // For repeated items like list entries
  className?: string;
}

/**
 * Loading state configuration
 */
export interface AdaptiveLoaderProps {
  /** Content structure to render skeleton for */
  structure?: SkeletonItem[];
  /** Alternative: Infer structure from content type */
  contentType?: 'profile' | 'document' | 'case-detail' | 'list' | 'table' | 'form' | 'dashboard' | 'custom';
  /** Show shimmer animation */
  shimmer?: boolean;
  /** Loading message */
  message?: string;
  /** Show stale data with loading overlay */
  staleContent?: React.ReactNode;
  /** Stale-while-revalidate strategy */
  showStale?: boolean;
  /** Number of items for list/table types */
  itemCount?: number;
  /** Custom className */
  className?: string;
}

/**
 * Predefined content structures
 */
const CONTENT_STRUCTURES: Record<string, SkeletonItem[]> = {
  profile: [
    { type: 'avatar', width: 80, height: 80 },
    { type: 'heading', width: '60%', height: 24 },
    { type: 'text', width: '40%', height: 16 },
    { type: 'paragraph', count: 3 }
  ],
  document: [
    { type: 'heading', width: '70%', height: 28 },
    { type: 'text', width: '40%', height: 14 },
    { type: 'image', width: '100%', height: 200 },
    { type: 'paragraph', count: 5 }
  ],
  'case-detail': [
    { type: 'heading', width: '80%', height: 32 },
    { type: 'card', count: 3 },
    { type: 'paragraph', count: 4 }
  ],
  list: [
    { type: 'list', count: 5 }
  ],
  table: [
    { type: 'table', count: 8 }
  ],
  form: [
    { type: 'heading', width: '50%', height: 24 },
    { type: 'input', count: 4 },
    { type: 'button', width: 120, height: 40 }
  ],
  dashboard: [
    { type: 'heading', width: '40%', height: 28 },
    { type: 'card', count: 4 },
    { type: 'table', count: 5 }
  ]
};

/**
 * Adaptive Loader Component
 * 
 * Provides intelligent loading states that adapt to content type:
 * - Content-aware skeleton screens
 * - Shimmer animation
 * - Stale-while-revalidate pattern
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // Infer structure from content type
 * <AdaptiveLoader contentType="case-detail" shimmer />
 * 
 * // Custom structure
 * <AdaptiveLoader 
 *   structure={[
 *     { type: 'heading', width: '60%' },
 *     { type: 'paragraph', count: 3 }
 *   ]}
 *   shimmer
 * />
 * 
 * // Stale-while-revalidate
 * <AdaptiveLoader
 *   showStale
 *   staleContent={<OldData />}
 *   message="Updating..."
 * />
 * ```
 */
export const AdaptiveLoader: React.FC<AdaptiveLoaderProps> = ({
  structure,
  contentType = 'custom',
  shimmer = true,
  message,
  staleContent,
  showStale = false,
  itemCount = 5,
  className
}) => {
  const { theme } = useTheme();

  // Determine structure to render
  const skeletonStructure = useMemo(() => {
    if (structure) return structure;
    
    const baseStructure = CONTENT_STRUCTURES[contentType];
    if (!baseStructure) return [];
    
    // Apply itemCount to list/table types
    return baseStructure.map(item => {
      if (item.type === 'list' || item.type === 'table') {
        return { ...item, count: itemCount };
      }
      return item;
    });
  }, [structure, contentType, itemCount]);

  /**
   * Render skeleton for a specific content type
   */
  const renderSkeletonItem = (item: SkeletonItem, index: number): React.ReactNode => {
    const baseClasses = cn(
      "animate-pulse rounded",
      theme.surface.input,
      shimmer && "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      item.className
    );

    const style: React.CSSProperties = {
      width: typeof item.width === 'number' ? `${item.width}px` : item.width,
      height: typeof item.height === 'number' ? `${item.height}px` : item.height
    };

    switch (item.type) {
      case 'avatar':
        return (
          <div
            key={index}
            className={cn(baseClasses, "rounded-full")}
            style={{ width: item.width || 48, height: item.height || 48 }}
            role="status"
            aria-label="Loading avatar"
          />
        );

      case 'heading':
        return (
          <div
            key={index}
            className={cn(baseClasses, "h-8")}
            style={{ width: item.width || '60%' }}
            role="status"
            aria-label="Loading heading"
          />
        );

      case 'text':
        return (
          <div
            key={index}
            className={cn(baseClasses, "h-4")}
            style={{ width: item.width || '80%' }}
            role="status"
            aria-label="Loading text"
          />
        );

      case 'paragraph':
        const lineCount = item.count || 3;
        return (
          <div key={index} className="space-y-2" role="status" aria-label="Loading paragraph">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div
                key={i}
                className={cn(baseClasses, "h-4")}
                style={{ width: i === lineCount - 1 ? '70%' : '100%' }}
              />
            ))}
          </div>
        );

      case 'image':
        return (
          <div
            key={index}
            className={cn(baseClasses)}
            style={{ width: item.width || '100%', height: item.height || 200 }}
            role="status"
            aria-label="Loading image"
          />
        );

      case 'card':
        return (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border space-y-3",
              theme.border.default,
              theme.surface.default
            )}
            role="status"
            aria-label="Loading card"
          >
            <div className={cn(baseClasses, "h-6")} style={{ width: '70%' }} />
            <div className={cn(baseClasses, "h-4")} style={{ width: '90%' }} />
            <div className={cn(baseClasses, "h-4")} style={{ width: '60%' }} />
          </div>
        );

      case 'list':
        const listCount = item.count || 3;
        return (
          <div key={index} className="space-y-3" role="status" aria-label="Loading list">
            {Array.from({ length: listCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(baseClasses, "rounded-full")} style={{ width: 40, height: 40 }} />
                <div className="flex-1 space-y-2">
                  <div className={cn(baseClasses, "h-4")} style={{ width: '70%' }} />
                  <div className={cn(baseClasses, "h-3")} style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        const rowCount = item.count || 5;
        return (
          <div key={index} className="space-y-2" role="status" aria-label="Loading table">
            {/* Header */}
            <div className={cn("flex gap-4 py-3 px-4 border-b", theme.border.default)}>
              <div className={cn(baseClasses, "h-4 flex-1")} />
              <div className={cn(baseClasses, "h-4 flex-1")} />
              <div className={cn(baseClasses, "h-4 flex-1")} />
              <div className={cn(baseClasses, "h-4 w-20")} />
            </div>
            {/* Rows */}
            {Array.from({ length: rowCount }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2 px-4">
                <div className={cn(baseClasses, "h-4 flex-1")} />
                <div className={cn(baseClasses, "h-4 flex-1")} />
                <div className={cn(baseClasses, "h-4 flex-1")} />
                <div className={cn(baseClasses, "h-4 w-20")} />
              </div>
            ))}
          </div>
        );

      case 'button':
        return (
          <div
            key={index}
            className={cn(baseClasses, "rounded-md")}
            style={{ width: item.width || 100, height: item.height || 36 }}
            role="status"
            aria-label="Loading button"
          />
        );

      case 'input':
        return (
          <div key={index} className="space-y-2" role="status" aria-label="Loading input">
            <div className={cn(baseClasses, "h-4")} style={{ width: '30%' }} />
            <div className={cn(baseClasses, "h-10")} style={{ width: '100%' }} />
          </div>
        );

      default:
        return (
          <div
            key={index}
            className={baseClasses}
            style={style}
            role="status"
            aria-label="Loading content"
          />
        );
    }
  };

  /**
   * Render loading overlay for stale content
   */
  if (showStale && staleContent) {
    return (
      <div className={cn("relative", className)}>
        {/* Stale content with reduced opacity */}
        <div className="opacity-60 pointer-events-none" aria-hidden="true">
          {staleContent}
        </div>

        {/* Loading overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            theme.surface.default,
            "bg-opacity-80 backdrop-blur-sm"
          )}
        >
          <div className="text-center space-y-3">
            <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-full", theme.primary.DEFAULT)}>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            {message && (
              <p className={cn("text-sm font-medium", theme.text.secondary)}>{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render skeleton structure
   */
  return (
    <div className={cn("space-y-4", className)} role="status" aria-live="polite" aria-busy="true">
      {message && (
        <p className={cn("text-sm font-medium mb-4", theme.text.secondary)}>{message}</p>
      )}

      {skeletonStructure.map((item, index) => (
        <React.Fragment key={index}>
          {item.count && item.count > 1 && ['paragraph', 'list', 'table', 'card', 'input'].includes(item.type)
            ? renderSkeletonItem(item, index)
            : Array.from({ length: item.count || 1 }).map((_, i) =>
                renderSkeletonItem({ ...item, count: undefined }, index * 1000 + i)
              )}
        </React.Fragment>
      ))}

      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

/**
 * Shimmer keyframes for tailwind.config.js:
 * 
 * ```js
 * animation: {
 *   shimmer: 'shimmer 2s infinite'
 * },
 * keyframes: {
 *   shimmer: {
 *     '0%': { transform: 'translateX(-100%)' },
 *     '100%': { transform: 'translateX(100%)' }
 *   }
 * }
 * ```
 */

export default AdaptiveLoader;
