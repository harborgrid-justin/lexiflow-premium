/**
 * @module hooks/useRuleSearchAndSelection
 * @category Hooks - Rules Platform
 * @description Complex rule search and hierarchical navigation hook with debounced search, auto-expansion
 * of matching paths, and user-controlled tree expansion. Rebuilds hierarchy from flat rule list, filters
 * by multi-term search across code/name/text, and manages search vs. user-expanded state with useTransition
 * for non-blocking UI updates.
 * 
 * NO THEME USAGE: Business logic hook for rule search and tree navigation
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect, useMemo, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useDebounce } from './useDebounce';

// Types
import { LegalRule } from '../types';

// Config
import { SEARCH_DEBOUNCE_MS } from '../config/master.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface UseRuleSearchAndSelectionResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRuleId: string | null;
  setSelectedRuleId: (id: string | null) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  displayHierarchy: LegalRule[];
  currentExpandedIds: Set<string>;
  isLoadingSearch: boolean;
  selectedRule: LegalRule | undefined;
}

// ============================================================================
// HOOK
// ============================================================================
export const useRuleSearchAndSelection = (rules: LegalRule[]): UseRuleSearchAndSelectionResult => {
  const [searchTerm, _setSearchTerm] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Memoize full hierarchy building (expensive operation)
  const fullHierarchy = useMemo(() => {
    const root: LegalRule[] = [];
    const map = new Map<string, LegalRule>();

    const rulesCopy = JSON.parse(JSON.stringify(rules)) as LegalRule[];

    rulesCopy.forEach(r => {
      r.children = [];
      map.set(r.id, r);
    });

    rulesCopy.forEach(r => {
      if (r.parentId && map.has(r.parentId)) {
        map.get(r.parentId)!.children!.push(r);
      } else {
        root.push(r);
      }
    });
    return root;
  }, [rules]);

  // Filter & Search Logic
  const { displayHierarchy, searchExpandedIds } = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return { displayHierarchy: fullHierarchy, searchExpandedIds: null };
    }

    const lowerTerms = debouncedSearchTerm.toLowerCase().split(' ').filter(Boolean);
    const expanded = new Set<string>();

    const filterRecursive = (nodes: LegalRule[]): LegalRule[] => {
      return nodes.map(node => {
        const nodeText = `${node.code} ${node.name} ${node.type} ${node.summary || ''} ${node.text || ''}`.toLowerCase();
        const matchesSelf = lowerTerms.every(term => nodeText.includes(term));

        const filteredChildren = filterRecursive(node.children || []);

        if (matchesSelf || filteredChildren.length > 0) {
          if (filteredChildren.length > 0) {
            expanded.add(node.id);
          }
          return { ...node, children: filteredChildren };
        }
        return null;
      }).filter(Boolean) as LegalRule[];
    };

    const filtered = filterRecursive(fullHierarchy);
    return { displayHierarchy: filtered, searchExpandedIds: expanded };
  }, [fullHierarchy, debouncedSearchTerm]);

  // Determine which set of expanded IDs to use (search-driven or user-expanded)
  const currentExpandedIds = debouncedSearchTerm ? searchExpandedIds! : expandedIds;

  // Initial Auto-expand first article if no search and no user expansion
  useEffect(() => {
    if (!debouncedSearchTerm && fullHierarchy.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([fullHierarchy[0].id]));
    }
  }, [fullHierarchy, debouncedSearchTerm, expandedIds]);

  // Toggle expansion for tree view
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Set search term with a transition to avoid blocking UI
  const setSearchTerm = (term: string) => {
    startTransition(() => {
      _setSearchTerm(term);
    });
  };

  const selectedRule = rules.find(r => r.id === selectedRuleId);

  return {
    searchTerm,
    setSearchTerm,
    selectedRuleId,
    setSelectedRuleId,
    expandedIds,
    toggleExpand,
    displayHierarchy,
    currentExpandedIds,
    isLoadingSearch: isPending,
    selectedRule
  };
};
