/**
 * Filter Context
 * Global filter state management with persistence and presets
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type FilterValue = string | number | boolean | string[] | number[] | Date | null;

export interface Filter {
  key: string;
  value: FilterValue;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  label?: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: Filter[];
  logic?: 'AND' | 'OR';
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: Filter[];
  isDefault?: boolean;
  createdAt: number;
}

interface FilterContextType {
  // Active filters
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (key: string) => void;
  updateFilter: (key: string, value: FilterValue, operator?: Filter['operator']) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  getFilter: (key: string) => Filter | undefined;

  // Filter groups
  groups: FilterGroup[];
  setGroups: (groups: FilterGroup[]) => void;
  addGroup: (group: FilterGroup) => void;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<FilterGroup>) => void;
  applyGroup: (groupId: string) => void;

  // Presets
  presets: FilterPreset[];
  savePreset: (name: string, description?: string, isDefault?: boolean) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;

  // Quick filters
  quickFilters: Record<string, Filter[]>;
  saveQuickFilter: (name: string, filters: Filter[]) => void;
  applyQuickFilter: (name: string) => void;
  removeQuickFilter: (name: string) => void;

  // Filter history
  history: Filter[][];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Comparison
  compareFilters: (filters1: Filter[], filters2: Filter[]) => boolean;
  hasFilterChanged: (key: string) => boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50;

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist filter presets and quick filters
  const [presets, setPresets] = useLocalStorage<FilterPreset[]>('filter-presets', []);
  const [quickFilters, setQuickFilters] = useLocalStorage<Record<string, Filter[]>>('quick-filters', {});

  // Runtime state
  const [filters, setFiltersState] = useState<Filter[]>([]);
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [history, setHistory] = useState<Filter[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [initialFilters, setInitialFilters] = useState<Filter[]>([]);

  // Initialize with default preset if available
  useEffect(() => {
    const defaultPreset = presets.find(p => p.isDefault);
    if (defaultPreset && filters.length === 0) {
      setFiltersState(defaultPreset.filters);
      setInitialFilters(defaultPreset.filters);
    }
  }, []);

  // Add to history when filters change
  useEffect(() => {
    if (filters.length > 0 || historyIndex >= 0) {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push([...filters]);
        return newHistory.slice(-MAX_HISTORY_SIZE);
      });
      setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    }
  }, [filters]);

  // Set filters with history tracking
  const setFilters = useCallback((newFilters: Filter[]) => {
    setFiltersState(newFilters);
  }, []);

  // Add a filter
  const addFilter = useCallback((filter: Filter) => {
    setFiltersState(prev => {
      const existing = prev.find(f => f.key === filter.key);
      if (existing) {
        return prev.map(f => f.key === filter.key ? filter : f);
      }
      return [...prev, filter];
    });
  }, []);

  // Remove a filter
  const removeFilter = useCallback((key: string) => {
    setFiltersState(prev => prev.filter(f => f.key !== key));
  }, []);

  // Update a filter
  const updateFilter = useCallback((key: string, value: FilterValue, operator?: Filter['operator']) => {
    setFiltersState(prev =>
      prev.map(f =>
        f.key === key
          ? { ...f, value, ...(operator && { operator }) }
          : f
      )
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState([]);
  }, []);

  // Check if has active filters
  const hasFilters = useMemo(() => filters.length > 0, [filters]);

  // Get a specific filter
  const getFilter = useCallback((key: string): Filter | undefined => {
    return filters.find(f => f.key === key);
  }, [filters]);

  // Add group
  const addGroup = useCallback((group: FilterGroup) => {
    setGroups(prev => [...prev, group]);
  }, []);

  // Remove group
  const removeGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  // Update group
  const updateGroup = useCallback((groupId: string, updates: Partial<FilterGroup>) => {
    setGroups(prev =>
      prev.map(g => g.id === groupId ? { ...g, ...updates } : g)
    );
  }, []);

  // Apply group filters
  const applyGroup = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setFiltersState(group.filters);
    }
  }, [groups]);

  // Save preset
  const savePreset = useCallback((name: string, description?: string, isDefault?: boolean) => {
    const preset: FilterPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      filters: [...filters],
      isDefault,
      createdAt: Date.now(),
    };

    setPresets(prev => {
      // If marking as default, unmark others
      if (isDefault) {
        return [...prev.map(p => ({ ...p, isDefault: false })), preset];
      }
      return [...prev, preset];
    });
  }, [filters, setPresets]);

  // Load preset
  const loadPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFiltersState(preset.filters);
    }
  }, [presets]);

  // Delete preset
  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  }, [setPresets]);

  // Update preset
  const updatePreset = useCallback((presetId: string, updates: Partial<FilterPreset>) => {
    setPresets(prev =>
      prev.map(p => p.id === presetId ? { ...p, ...updates } : p)
    );
  }, [setPresets]);

  // Save quick filter
  const saveQuickFilter = useCallback((name: string, filterList: Filter[]) => {
    setQuickFilters(prev => ({ ...prev, [name]: filterList }));
  }, [setQuickFilters]);

  // Apply quick filter
  const applyQuickFilter = useCallback((name: string) => {
    const quickFilter = quickFilters[name];
    if (quickFilter) {
      setFiltersState(quickFilter);
    }
  }, [quickFilters]);

  // Remove quick filter
  const removeQuickFilter = useCallback((name: string) => {
    setQuickFilters(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, [setQuickFilters]);

  // History navigation
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history]);

  const undo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(prev => prev - 1);
      setFiltersState(history[historyIndex - 1]);
    }
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
      setFiltersState(history[historyIndex + 1]);
    }
  }, [canRedo, history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Compare filters
  const compareFilters = useCallback((filters1: Filter[], filters2: Filter[]): boolean => {
    if (filters1.length !== filters2.length) return false;

    return filters1.every(f1 => {
      const f2 = filters2.find(f => f.key === f1.key);
      if (!f2) return false;
      return JSON.stringify(f1) === JSON.stringify(f2);
    });
  }, []);

  // Check if filter has changed from initial
  const hasFilterChanged = useCallback((key: string): boolean => {
    const current = filters.find(f => f.key === key);
    const initial = initialFilters.find(f => f.key === key);

    if (!current && !initial) return false;
    if (!current || !initial) return true;

    return JSON.stringify(current) !== JSON.stringify(initial);
  }, [filters, initialFilters]);

  // Memoize context value
  const value = useMemo<FilterContextType>(() => ({
    filters,
    setFilters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilters,
    getFilter,
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    applyGroup,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    quickFilters,
    saveQuickFilter,
    applyQuickFilter,
    removeQuickFilter,
    history,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    compareFilters,
    hasFilterChanged,
  }), [
    filters,
    setFilters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilters,
    getFilter,
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    applyGroup,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    quickFilters,
    saveQuickFilter,
    applyQuickFilter,
    removeQuickFilter,
    history,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    compareFilters,
    hasFilterChanged,
  ]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext;
