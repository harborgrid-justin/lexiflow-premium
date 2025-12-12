/**
 * Breadcrumb Context
 * Global navigation breadcrumb management with automatic route tracking
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';

export interface Breadcrumb {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbContextType {
  // Breadcrumbs
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  addBreadcrumb: (breadcrumb: Omit<Breadcrumb, 'id'>) => void;
  removeBreadcrumb: (id: string) => void;
  updateBreadcrumb: (id: string, updates: Partial<Breadcrumb>) => void;
  clearBreadcrumbs: () => void;

  // Navigation
  navigateToBreadcrumb: (id: string) => void;

  // Auto-generate from path
  generateFromPath: (path: string, customLabels?: Record<string, string>) => void;

  // Configuration
  separator: string;
  setSeparator: (separator: string) => void;
  maxItems: number;
  setMaxItems: (max: number) => void;
  showHome: boolean;
  setShowHome: (show: boolean) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const useBreadcrumbContext = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
  }
  return context;
};

interface BreadcrumbProviderProps {
  children: ReactNode;
  defaultSeparator?: string;
  defaultMaxItems?: number;
  defaultShowHome?: boolean;
  homeLabel?: string;
  homePath?: string;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({
  children,
  defaultSeparator = '/',
  defaultMaxItems = 5,
  defaultShowHome = true,
  homeLabel = 'Home',
  homePath = '/',
}) => {
  const [breadcrumbs, setBreadcrumbsState] = useState<Breadcrumb[]>([]);
  const [separator, setSeparator] = useState(defaultSeparator);
  const [maxItems, setMaxItems] = useState(defaultMaxItems);
  const [showHome, setShowHome] = useState(defaultShowHome);

  // Initialize with home breadcrumb if needed
  useEffect(() => {
    if (showHome && breadcrumbs.length === 0) {
      setBreadcrumbsState([
        {
          id: 'home',
          label: homeLabel,
          path: homePath,
          icon: 'home',
          isActive: false,
        },
      ]);
    }
  }, [showHome, homeLabel, homePath, breadcrumbs.length]);

  // Set breadcrumbs
  const setBreadcrumbs = useCallback((newBreadcrumbs: Breadcrumb[]) => {
    let crumbs = newBreadcrumbs;

    // Add home breadcrumb if showHome is true and not already present
    if (showHome && !newBreadcrumbs.some(b => b.id === 'home')) {
      crumbs = [
        {
          id: 'home',
          label: homeLabel,
          path: homePath,
          icon: 'home',
          isActive: false,
        },
        ...newBreadcrumbs,
      ];
    }

    // Limit to maxItems
    if (crumbs.length > maxItems) {
      // Keep first (home) and last items, add ellipsis in between
      const first = crumbs[0];
      const last = crumbs.slice(-Math.max(maxItems - 2, 1));
      crumbs = [
        first,
        {
          id: 'ellipsis',
          label: '...',
          isActive: false,
        },
        ...last,
      ];
    }

    // Mark last breadcrumb as active
    if (crumbs.length > 0) {
      crumbs = crumbs.map((crumb, index) => ({
        ...crumb,
        isActive: index === crumbs.length - 1,
      }));
    }

    setBreadcrumbsState(crumbs);
  }, [showHome, homeLabel, homePath, maxItems]);

  // Add breadcrumb
  const addBreadcrumb = useCallback((breadcrumb: Omit<Breadcrumb, 'id'>) => {
    const newBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      id: `breadcrumb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setBreadcrumbs([...breadcrumbs.filter(b => !b.isActive), newBreadcrumb]);
  }, [breadcrumbs, setBreadcrumbs]);

  // Remove breadcrumb
  const removeBreadcrumb = useCallback((id: string) => {
    setBreadcrumbs(breadcrumbs.filter(b => b.id !== id));
  }, [breadcrumbs, setBreadcrumbs]);

  // Update breadcrumb
  const updateBreadcrumb = useCallback((id: string, updates: Partial<Breadcrumb>) => {
    setBreadcrumbs(
      breadcrumbs.map(b => b.id === id ? { ...b, ...updates } : b)
    );
  }, [breadcrumbs, setBreadcrumbs]);

  // Clear breadcrumbs
  const clearBreadcrumbs = useCallback(() => {
    if (showHome) {
      setBreadcrumbs([
        {
          id: 'home',
          label: homeLabel,
          path: homePath,
          icon: 'home',
          isActive: true,
        },
      ]);
    } else {
      setBreadcrumbsState([]);
    }
  }, [showHome, homeLabel, homePath, setBreadcrumbs]);

  // Navigate to breadcrumb
  const navigateToBreadcrumb = useCallback((id: string) => {
    const breadcrumb = breadcrumbs.find(b => b.id === id);
    if (breadcrumb) {
      if (breadcrumb.onClick) {
        breadcrumb.onClick();
      } else if (breadcrumb.path) {
        // Use native navigation or router
        window.location.href = breadcrumb.path;
      }

      // Update breadcrumbs to make clicked one active and remove everything after
      const index = breadcrumbs.findIndex(b => b.id === id);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    }
  }, [breadcrumbs, setBreadcrumbs]);

  // Generate breadcrumbs from path
  const generateFromPath = useCallback((
    path: string,
    customLabels: Record<string, string> = {}
  ) => {
    const segments = path.split('/').filter(Boolean);
    const generated: Breadcrumb[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Format label: replace hyphens/underscores with spaces and capitalize
      const defaultLabel = segment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

      const label = customLabels[segment] || customLabels[currentPath] || defaultLabel;

      generated.push({
        id: `breadcrumb-${index}`,
        label,
        path: currentPath,
        isActive: index === segments.length - 1,
      });
    });

    setBreadcrumbs(generated);
  }, [setBreadcrumbs]);

  const value = useMemo<BreadcrumbContextType>(() => ({
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    clearBreadcrumbs,
    navigateToBreadcrumb,
    generateFromPath,
    separator,
    setSeparator,
    maxItems,
    setMaxItems,
    showHome,
    setShowHome,
  }), [
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    clearBreadcrumbs,
    navigateToBreadcrumb,
    generateFromPath,
    separator,
    maxItems,
    showHome,
  ]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default BreadcrumbContext;
