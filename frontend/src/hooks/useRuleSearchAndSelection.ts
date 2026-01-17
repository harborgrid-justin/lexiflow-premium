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
import { useEffect, useMemo, useState, useTransition } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { SEARCH_DEBOUNCE_MS } from "@/config/features/search.config";
import { type LegalRule } from "@/types";

import { useDebounce } from "./useDebounce";

// Types

// Config

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UseRuleSearchAndSelectionReturn {
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

export function useRuleSearchAndSelection(
  rules: LegalRule[]
): UseRuleSearchAndSelectionReturn {
  const [searchTerm, _setSearchTerm] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  const fullHierarchy = useMemo(() => {
    const root: LegalRule[] = [];
    const map = new Map<string, LegalRule>();

    const rulesCopy = JSON.parse(JSON.stringify(rules)) as LegalRule[];

    rulesCopy.forEach((r) => {
      r.children = [];
      map.set(r.id, r);
    });

    rulesCopy.forEach((r) => {
      if (r.parentId && map.has(r.parentId)) {
        map.get(r.parentId)!.children!.push(r);
      } else {
        root.push(r);
      }
    });
    return root;
  }, [rules]);

  const { displayHierarchy, searchExpandedIds } = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return { displayHierarchy: fullHierarchy, searchExpandedIds: null };
    }

    const lowerTerms = debouncedSearchTerm
      .toLowerCase()
      .split(" ")
      .filter(Boolean);
    const expanded = new Set<string>();

    const filterRecursive = (nodes: LegalRule[]): LegalRule[] => {
      return nodes
        .map((node) => {
          const nodeText = `${node.code} ${node.name} ${node.type} ${
            node.summary || ""
          } ${node.text || ""}`.toLowerCase();
          const matchesSelf = lowerTerms.every((term) =>
            nodeText.includes(term)
          );

          const filteredChildren = filterRecursive(node.children || []);

          if (matchesSelf || filteredChildren.length > 0) {
            if (filteredChildren.length > 0) {
              expanded.add(node.id);
            }
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean) as LegalRule[];
    };

    const filtered = filterRecursive(fullHierarchy);
    return { displayHierarchy: filtered, searchExpandedIds: expanded };
  }, [fullHierarchy, debouncedSearchTerm]);

  const currentExpandedIds = debouncedSearchTerm
    ? searchExpandedIds!
    : expandedIds;

  useEffect(() => {
    if (
      !debouncedSearchTerm &&
      fullHierarchy.length > 0 &&
      expandedIds.size === 0 &&
      fullHierarchy[0]
    ) {
      setExpandedIds(new Set([fullHierarchy[0].id]));
    }
  }, [fullHierarchy, debouncedSearchTerm, expandedIds]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const setSearchTerm = (term: string) => {
    startTransition(() => {
      _setSearchTerm(term);
    });
  };

  const selectedRule = rules.find((r) => r.id === selectedRuleId);

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
    selectedRule,
  };
}
