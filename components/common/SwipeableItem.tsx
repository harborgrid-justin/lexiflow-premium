/**
 * @module components/common/SwipeableItem
 * @category Common
 * @description Swipeable list item with left/right actions.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useRef } from 'react';
import { Trash2, Archive, Check } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActionLabel?: string;
  rightActionLabel?: string;
  leftActionColor?: string;
  rightActionColor?: string;
  disabled?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionLabel = 'Archive',
  rightActionLabel = 'Action',
  leftActionColor = 'bg-rose-500 dark:bg-rose-600',
  rightActionColor = 'bg-emerald-500 dark:bg-emerald-600',
  disabled = false
}) => {
  const { theme } = useTheme();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const isScrolling = useRef(false);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0; // Reset delta
    isDragging.current = true;
    isScrolling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || disabled) return;
    
    // If we've already determined this is a scroll interaction, ignore swipe logic
    if (isScrolling.current) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - startX.current;
    const diffY = touchY - startY.current;

    // Detect if the user is scrolling vertically
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
      isScrolling.current = true;
      return;
    }

    // It's a horizontal swipe
    if (e.cancelable) {
        e.preventDefault(); // Prevent scrolling only if we are sure it's a swipe
    }
    
    // Limit the swipe distance for better UX
    if (Math.abs(diffX) < 150) {
        setOffsetX(diffX);
        currentX.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || disabled || isScrolling.current) {
        isDragging.current = false;
        return;
    }
    
    isDragging.current = false;

    // Threshold for triggering action
    if (currentX.current > 80 && onSwipeRight) {
        // Swiped Right
        onSwipeRight();
        setOffsetX(0); 
    } else if (currentX.current < -80 && onSwipeLeft) {
        // Swiped Left
        onSwipeLeft();
        setOffsetX(0);
    } else {
        // Snap back
        setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl touch-pan-y">
      {/* Background Actions */}
      <div className={cn("absolute inset-0 flex justify-between items-center px-4 font-bold text-xs z-0", theme.text.inverse)}>
        <div className={cn("absolute left-0 top-0 bottom-0 w-full flex items-center justify-start pl-4 transition-opacity", rightActionColor, offsetX > 0 ? 'opacity-100' : 'opacity-0')}>
           <Check className="h-5 w-5 mr-2" /> {rightActionLabel}
        </div>
        <div className={cn("absolute right-0 top-0 bottom-0 w-full flex items-center justify-end pr-4 transition-opacity", leftActionColor, offsetX < 0 ? 'opacity-100' : 'opacity-0')}>
           {leftActionLabel} <Trash2 className="h-5 w-5 ml-2" />
        </div>
      </div>

      {/* Foreground Content */}
      <div
        className={cn("relative z-10 transition-transform duration-200 ease-out", theme.surface.default)}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};