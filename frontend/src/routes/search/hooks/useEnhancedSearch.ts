import { Search } from "lucide-react";
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SEARCH_CONFIG } from "@/config/search.config";

import {
  useKeyboardNav,
  useSearchHandlers,
} from "../components/components/advanced/hooks";
import {
  getRecentSearches,
  parseSearchSyntax,
} from "../components/components/advanced/storage";
import {
  filterSuggestions,
  highlightMatch,
} from "../components/components/advanced/utils";

import type {
  EnhancedSearchProps,
  SearchCategory,
  SearchResult,
  SearchSuggestion,
} from "../components/components/advanced/types";

export const useEnhancedSearch = ({
  onSearch,
  onSuggestionSelect,
  suggestions = [] as SearchSuggestion[],
  debounceDelay = SEARCH_CONFIG.debounceDelay,
}: Pick<
  EnhancedSearchProps,
  "onSearch" | "onSuggestionSelect" | "suggestions" | "debounceDelay"
>) => {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<SearchCategory>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Custom hooks for handlers
  const {
    handleSearch: performSearch,
    handleSuggestionClick: selectSuggestion,
  } = useSearchHandlers(onSearch, onSuggestionSelect, debounceDelay);

  // Filter and highlight suggestions
  const filteredSuggestions = useMemo(() => {
    const categoryFiltered =
      category === "all"
        ? suggestions
        : suggestions.filter((s) => s.category === category);
    return filterSuggestions(
      categoryFiltered,
      deferredQuery,
      SEARCH_CONFIG.maxSuggestions,
    );
  }, [suggestions, deferredQuery, category]);

  const displayItems = useMemo(() => {
    if (!deferredQuery) {
      return recentSearches.map((text) => ({
        id: `recent-${text}`,
        text,
        category: "all" as SearchCategory,
        icon: React.createElement(Search, { className: "h-4 w-4" }),
        score: 1.0,
      }));
    }
    return filteredSuggestions.map((item) => ({
      ...item,
      highlightedText: highlightMatch(item.text, deferredQuery),
    }));
  }, [deferredQuery, filteredSuggestions, recentSearches]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(true);
      setSelectedIndex(-1);

      // Parse syntax (e.g., "case:12345")
      const parsed = parseSearchSyntax(value);
      const parsedCategory = parsed.filters["category"];
      if (parsedCategory && parsedCategory !== category) {
        setCategory(parsedCategory as SearchCategory);
      }

      performSearch(value, category);
    },
    [category, performSearch],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SearchResult) => {
      selectSuggestion(
        suggestion,
        setQuery,
        setRecentSearches,
        setIsOpen,
        setSelectedIndex,
      );
    },
    [selectSuggestion],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useKeyboardNav(
    isOpen,
    displayItems.length,
    () => performSearch(query, category),
    () => {
      if (selectedIndex >= 0) {
        const item = displayItems[selectedIndex];
        if (item) handleSuggestionClick(item);
      }
    },
  );

  return {
    query,
    setQuery,
    category,
    setCategory,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    containerRef,
    dropdownRef,
    displayItems,
    handleInputChange,
    handleSuggestionClick,
    handleClear,
    handleKeyDown,
  };
};
