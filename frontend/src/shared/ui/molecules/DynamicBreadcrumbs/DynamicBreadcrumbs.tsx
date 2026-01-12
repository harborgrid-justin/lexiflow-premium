/**
 * @module components/common/DynamicBreadcrumbs
 * @category Components
 * @description Intelligent breadcrumb navigation with dropdown menus and recent paths tracking.
 */

import { useTheme } from '@/features/theme';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/cn';
import { ChevronDown, ChevronRight, Clock, Home } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Breadcrumb item definition
 */
export interface DynamicBreadcrumbItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: DynamicBreadcrumbItem[]; // For dropdown navigation
  metadata?: Record<string, unknown>;
}

/**
 * Recent path entry
 */
interface RecentPath {
  id: string;
  items: DynamicBreadcrumbItem[];
  timestamp: Date;
  accessCount: number;
}

/**
 * Props for DynamicBreadcrumbs component
 */
export interface DynamicBreadcrumbsProps {
  items: DynamicBreadcrumbItem[];
  maxVisible?: number; // Maximum visible items before collapsing
  maxRecent?: number; // Maximum recent paths to store
  showHome?: boolean;
  onNavigate?: (path: string) => void;
  className?: string;
}

/**
 * Dynamic Breadcrumbs Component
 *
 * Features:
 * - Collapsible breadcrumb trail with dropdown
 * - Recent paths tracking in localStorage
 * - Keyboard shortcuts (Ctrl+Home, Ctrl+←/→)
 * - Dropdown navigation for items with children
 * - Automatic truncation for long trails
 *
 * @example
 * ```tsx
 * <DynamicBreadcrumbs
 *   items={[
 *     { id: '1', label: 'Cases', path: '/cases' },
 *     { id: '2', label: 'Smith v. Jones', path: '/cases/123' },
 *     { id: '3', label: 'Documents', path: '/cases/123/documents' }
 *   ]}
 *   maxVisible={4}
 *   showHome
 * />
 * ```
 */
export const DynamicBreadcrumbs: React.FC<DynamicBreadcrumbsProps> = ({
  items,
  maxVisible = 4,
  maxRecent = 10,
  showHome = true,
  onNavigate,
  className
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  console.log('useNavigate:', navigate);
  const [recentPaths, setRecentPaths] = useState<RecentPath[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent paths from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('breadcrumb-recent-paths');
      if (stored) {
        const parsed = JSON.parse(stored);
        const paths = parsed.map((p: unknown) => {
          if (typeof p === 'object' && p !== null && 'timestamp' in p) {
            return {
              ...p,
              timestamp: new Date(p.timestamp as string)
            };
          }
          return p;
        });
        setRecentPaths(paths);
      }
    } catch (error) {
      console.error('Failed to load recent paths:', error);
    }
  }, []);

  // Save current path to recent paths
  useEffect(() => {
    if (items.length === 0) return;

    const pathKey = items.map(i => i.id).join('/');

    setRecentPaths(prev => {
      // Check if path already exists
      const existingIndex = prev.findIndex(p =>
        p.items.map(i => i.id).join('/') === pathKey
      );

      let updated: RecentPath[];

      if (existingIndex >= 0) {
        // Update existing path
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex]!,
          timestamp: new Date(),
          accessCount: updated[existingIndex]!.accessCount + 1
        };
      } else {
        // Add new path
        const newPath: RecentPath = {
          id: `recent-${Date.now()}`,
          items: [...items],
          timestamp: new Date(),
          accessCount: 1
        };
        updated = [newPath, ...prev].slice(0, maxRecent);
      }

      // Sort by access count and recency
      updated.sort((a: unknown, b: unknown) => {
        const typedA = a as { accessCount: number; timestamp: Date };
        const typedB = b as { accessCount: number; timestamp: Date };
        const scoreDiff = (typedB.accessCount * 2 + typedB.timestamp.getTime() / 1000000) -
          (typedA.accessCount * 2 + typedA.timestamp.getTime() / 1000000);
        return scoreDiff;
      });

      // Save to localStorage
      try {
        localStorage.setItem('breadcrumb-recent-paths', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent paths:', error);
      }

      return updated;
    });
  }, [items, maxRecent]);

  // Handle navigation
  const handleNavigate = useCallback((path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
    setActiveDropdown(null);
    setShowRecentDropdown(false);
  }, [onNavigate, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Home - Navigate to home
      if (e.ctrlKey && e.key === 'Home' && items.length > 0) {
        e.preventDefault();
        handleNavigate(items[0]!.path);
      }

      // Ctrl+Left - Navigate back one level
      if (e.ctrlKey && e.key === 'ArrowLeft' && items.length > 1) {
        e.preventDefault();
        handleNavigate(items[items.length - 2]!.path);
      }

      // Ctrl+Right - Show dropdown of forward paths (if any)
      if (e.ctrlKey && e.key === 'ArrowRight' && items.length > 0) {
        e.preventDefault();
        const current = items[items.length - 1];
        if (current?.children && current.children.length > 0) {
          setActiveDropdown(current.id);
        }
      }

      // Escape - Close dropdowns
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setShowRecentDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, handleNavigate]);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => {
    setActiveDropdown(null);
    setShowRecentDropdown(false);
  });

  /**
   * Render a single breadcrumb item
   */
  const renderBreadcrumbItem = (item: DynamicBreadcrumbItem, _index: number, isLast: boolean) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.id;

    return (
      <div key={item.id} className="flex items-center gap-2">
        <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
          <button
            onClick={() => {
              if (hasChildren) {
                setActiveDropdown(isDropdownOpen ? null : item.id);
              } else {
                handleNavigate(item.path);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
              isLast ? cn(theme.text.primary, "font-medium") : theme.text.secondary,
              !isLast && "hover:bg-slate-100 dark:hover:bg-slate-800",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-current={isLast ? 'page' : undefined}
            title={item.label}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="truncate max-w-[150px]">{item.label}</span>
            {hasChildren && (
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                isDropdownOpen && "rotate-180"
              )} />
            )}
          </button>

          {/* Dropdown Menu */}
          {hasChildren && isDropdownOpen && (
            <div
              className={cn(
                "absolute top-full left-0 mt-1 py-2 rounded-lg border shadow-lg z-50 min-w-[200px]",
                theme.surface.default,
                theme.border.default
              )}
            >
              {item.children!.map(child => (
                <button
                  key={child.id}
                  onClick={() => handleNavigate(child.path)}
                  className={cn(
                    "w-full px-4 py-2 text-left flex items-center gap-2 transition-colors",
                    theme.text.primary,
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {child.icon && <span className="flex-shrink-0">{child.icon}</span>}
                  <span className="truncate">{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!isLast && (
          <ChevronRight className={cn("h-4 w-4 flex-shrink-0", theme.text.tertiary)} />
        )}
      </div>
    );
  };

  /**
   * Render collapsed items dropdown
   */
  const renderCollapsedDropdown = (collapsedItems: DynamicBreadcrumbItem[]) => {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'collapsed' ? null : 'collapsed')}
          className={cn(
            "px-2 py-1 rounded-md transition-colors",
            theme.text.secondary,
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          title="Show hidden items"
        >
          ...
        </button>

        {activeDropdown === 'collapsed' && (
          <div
            className={cn(
              "absolute top-full left-0 mt-1 py-2 rounded-lg border shadow-lg z-50 min-w-[200px]",
              theme.surface.default,
              theme.border.default
            )}
          >
            {collapsedItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "w-full px-4 py-2 text-left flex items-center gap-2 transition-colors",
                  theme.text.primary,
                  "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render recent paths dropdown
   */
  const renderRecentPaths = () => {
    if (recentPaths.length === 0) return null;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowRecentDropdown(!showRecentDropdown)}
          className={cn(
            "p-1 rounded-md transition-colors",
            theme.text.secondary,
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          title="Recent paths"
          aria-label="Show recent paths"
        >
          <Clock className="h-4 w-4" />
        </button>

        {showRecentDropdown && (
          <div
            className={cn(
              "absolute top-full right-0 mt-1 py-2 rounded-lg border shadow-lg z-50 w-80",
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className={cn("px-4 py-2 font-semibold text-sm border-b", theme.border.default)}>
              Recent Paths
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recentPaths.map(recent => {
                const pathLabel = recent.items.map(i => i.label).join(' / ');
                return (
                  <button
                    key={recent.id}
                    onClick={() => handleNavigate(recent.items[recent.items.length - 1]!.path)}
                    className={cn(
                      "w-full px-4 py-2 text-left transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className={cn("text-sm truncate", theme.text.primary)}>
                      {pathLabel}
                    </div>
                    <div className={cn("text-xs mt-1", theme.text.tertiary)}>
                      {recent.accessCount} {recent.accessCount === 1 ? 'visit' : 'visits'}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className={cn("px-4 py-2 border-t", theme.border.default)}>
              <button
                onClick={() => {
                  setRecentPaths([]);
                  localStorage.removeItem('breadcrumb-recent-paths');
                  setShowRecentDropdown(false);
                }}
                className={cn(
                  "text-xs font-medium transition-colors",
                  theme.text.secondary,
                  "hover:underline"
                )}
              >
                Clear recent paths
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine which items to show
  let visibleItems: DynamicBreadcrumbItem[];
  let collapsedItems: DynamicBreadcrumbItem[] = [];

  if (items.length <= maxVisible) {
    visibleItems = items;
  } else {
    // Always show first and last items, collapse middle
    const firstItem = items[0]!;
    const lastItems = items.slice(-(maxVisible - 2));
    collapsedItems = items.slice(1, -(maxVisible - 2));
    visibleItems = [firstItem, ...lastItems];
  }

  return (
    <nav
      className={cn("flex items-center gap-2 flex-wrap", className)}
      aria-label="Breadcrumb"
    >
      {/* Home Button */}
      {showHome && (
        <>
          <button
            onClick={() => handleNavigate('/')}
            className={cn(
              "p-1 rounded-md transition-colors",
              theme.text.secondary,
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            title="Home"
            aria-label="Go to home"
          >
            <Home className="h-4 w-4" />
          </button>
          {items.length > 0 && (
            <ChevronRight className={cn("h-4 w-4 flex-shrink-0", theme.text.tertiary)} />
          )}
        </>
      )}

      {/* First Item */}
      {visibleItems.length > 0 && renderBreadcrumbItem(visibleItems[0]!, 0, items.length === 1)}

      {/* Collapsed Items Dropdown */}
      {collapsedItems.length > 0 && (
        <>
          <ChevronRight className={cn("h-4 w-4 flex-shrink-0", theme.text.tertiary)} />
          {renderCollapsedDropdown(collapsedItems)}
        </>
      )}

      {/* Remaining Visible Items */}
      {visibleItems.slice(1).map((item, idx) => (
        <React.Fragment key={item.id}>
          <ChevronRight className={cn("h-4 w-4 flex-shrink-0", theme.text.tertiary)} />
          {renderBreadcrumbItem(item, idx + 1, idx === visibleItems.length - 2)}
        </React.Fragment>
      ))}

      {/* Recent Paths Button */}
      <div className="ml-auto">
        {renderRecentPaths()}
      </div>
    </nav>
  );
};

export default DynamicBreadcrumbs;
