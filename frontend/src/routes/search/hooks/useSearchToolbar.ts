import { useEffect, useId, useRef, useState } from "react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { SearchService } from "@/services/search/search.service";

interface UseSearchToolbarProps {
  value: string;
  onChange: (val: string) => void;
}

export function useSearchToolbar({ value, onChange }: UseSearchToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const history = SearchService.getHistory();

  useClickOutside(containerRef as React.RefObject<HTMLElement>, () =>
    setShowHistory(false)
  );

  // Set mounted flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only attach keyboard listener after mount
  useEffect(() => {
    if (!isMounted || typeof document === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMounted]);

  const handleFocus = () => {
    if (history.length > 0) setShowHistory(true);
  };

  const handleHistorySelect = (term: string) => {
    onChange(term);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      SearchService.saveHistory(value);
      setShowHistory(false);
    }
  };

  return {
    inputRef,
    containerRef,
    inputId,
    showHistory,
    history,
    handleFocus,
    handleHistorySelect,
    handleKeyUp,
  };
}
