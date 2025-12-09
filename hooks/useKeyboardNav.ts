
import React, { useState, useEffect, useCallback } from 'react';

interface UseKeyboardNavProps<T> {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T) => void;
  onClose: () => void;
}

export const useKeyboardNav = <T>({ items, isOpen, onSelect, onClose }: UseKeyboardNavProps<T>) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Reset index when list changes or closes
  useEffect(() => {
    setActiveIndex(isOpen && items.length > 0 ? 0 : -1);
  }, [isOpen, items]); // Dependency on items ensures we reset if search results change

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, items, activeIndex, onSelect, onClose]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown
  };
};