/**
 * Sidebar Context
 * Manages sidebar state, navigation, and collapsed sections
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface SidebarSection {
  id: string;
  label: string;
  icon?: string;
  collapsed: boolean;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface SidebarContextType {
  // Sidebar visibility
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;

  // Sections
  sections: SidebarSection[];
  setSections: (sections: SidebarSection[]) => void;
  toggleSection: (sectionId: string) => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  expandAllSections: () => void;
  collapseAllSections: () => void;

  // Active item
  activeItemId: string | null;
  setActiveItemId: (itemId: string | null) => void;

  // Navigation
  navigate: (path: string, itemId?: string) => void;

  // Pinned items
  pinnedItems: string[];
  pinItem: (itemId: string) => void;
  unpinItem: (itemId: string) => void;
  togglePinItem: (itemId: string) => void;
  isPinned: (itemId: string) => boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist sidebar state
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>('sidebar-collapsed', false);
  const [pinnedItems, setPinnedItems] = useLocalStorage<string[]>('sidebar-pinned-items', []);
  const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>('sidebar-collapsed-sections', []);

  // Runtime state
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sections, setSections] = useState<SidebarSection[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, [setIsCollapsed]);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, [setIsCollapsed]);

  // Section management
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      }
      return [...prev, sectionId];
    });
  }, [setCollapsedSections]);

  const expandSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => prev.filter(id => id !== sectionId));
  }, [setCollapsedSections]);

  const collapseSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
  }, [setCollapsedSections]);

  const expandAllSections = useCallback(() => {
    setCollapsedSections([]);
  }, [setCollapsedSections]);

  const collapseAllSections = useCallback(() => {
    setCollapsedSections(sections.map(s => s.id));
  }, [sections, setCollapsedSections]);

  // Update sections with collapsed state
  useEffect(() => {
    setSections(prev =>
      prev.map(section => ({
        ...section,
        collapsed: collapsedSections.includes(section.id),
      }))
    );
  }, [collapsedSections]);

  // Pin management
  const pinItem = useCallback((itemId: string) => {
    setPinnedItems(prev => {
      if (!prev.includes(itemId)) {
        return [...prev, itemId];
      }
      return prev;
    });
  }, [setPinnedItems]);

  const unpinItem = useCallback((itemId: string) => {
    setPinnedItems(prev => prev.filter(id => id !== itemId));
  }, [setPinnedItems]);

  const togglePinItem = useCallback((itemId: string) => {
    setPinnedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, [setPinnedItems]);

  const isPinned = useCallback((itemId: string): boolean => {
    return pinnedItems.includes(itemId);
  }, [pinnedItems]);

  // Navigation
  const navigate = useCallback((path: string, itemId?: string) => {
    if (itemId) {
      setActiveItemId(itemId);
    }

    // Dispatch navigation event
    window.dispatchEvent(
      new CustomEvent('sidebar:navigate', {
        detail: { path, itemId },
      })
    );

    // Close sidebar on mobile after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Memoize context value
  const value = useMemo<SidebarContextType>(() => ({
    isOpen,
    isMobile,
    isCollapsed,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleCollapsed,
    setCollapsed,
    sections,
    setSections,
    toggleSection,
    expandSection,
    collapseSection,
    expandAllSections,
    collapseAllSections,
    activeItemId,
    setActiveItemId,
    navigate,
    pinnedItems,
    pinItem,
    unpinItem,
    togglePinItem,
    isPinned,
  }), [
    isOpen,
    isMobile,
    isCollapsed,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleCollapsed,
    setCollapsed,
    sections,
    setSections,
    toggleSection,
    expandSection,
    collapseSection,
    expandAllSections,
    collapseAllSections,
    activeItemId,
    setActiveItemId,
    navigate,
    pinnedItems,
    pinItem,
    unpinItem,
    togglePinItem,
    isPinned,
  ]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
