/**
 * @module hooks/useCanvasDrag
 * @category Hooks - Canvas Interaction
 * @description Canvas drag-and-drop hook supporting pan (with middle mouse, shift, or meta keys)
 * and item dragging. Provides pan state management, zoom-aware coordinate transformation, and
 * drag event handlers with window-level mouse tracking.
 * 
 * NO THEME USAGE: Utility hook for drag-and-drop logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';

// ========================================
// TYPES & INTERFACES
// ========================================

/**
 * Drag type
 */
type DragType = 'pan' | 'item';

/**
 * Drag state
 */
interface DragState {
  type: DragType;
  id?: string;
  startX: number;
  startY: number;
  initialPos: { x: number; y: number };
}

/**
 * Props for useCanvasDrag
 */
interface UseCanvasDragProps {
  /** Callback when item position updates */
  onUpdateItemPos?: (id: string, pos: { x: number, y: number }) => void;
  /** Current zoom level */
  zoom?: number;
}

/**
 * Return type for useCanvasDrag hook
 */
export interface UseCanvasDragReturn {
  /** Current pan state */
  pan: { x: number; y: number };
  /** Set pan state */
  setPan: (pan: { x: number; y: number }) => void;
  /** Handle mouse down */
  handleMouseDown: (e: React.MouseEvent, type: DragType, itemId?: string, currentItemPos?: { x: number, y: number }) => void;
}

// ========================================
// HOOK
// ========================================

/**
 * Canvas drag-and-drop with pan and item dragging.
 * 
 * @param props - Configuration options
 * @returns Object with pan state and drag handler
 */
export function useCanvasDrag({ onUpdateItemPos, zoom = 1 }: UseCanvasDragProps = {}): UseCanvasDragReturn {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<DragState | null>(null);
  const onUpdateItemPosRef = useRef(onUpdateItemPos);
  const activeListenersRef = useRef<{
    move: ((e: MouseEvent) => void) | null;
    up: ((e: MouseEvent) => void) | null;
  }>({ move: null, up: null });

  useEffect(() => {
    onUpdateItemPosRef.current = onUpdateItemPos;
  }, [onUpdateItemPos]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (activeListenersRef.current.move) {
        window.removeEventListener('mousemove', activeListenersRef.current.move);
      }
      if (activeListenersRef.current.up) {
        window.removeEventListener('mouseup', activeListenersRef.current.up);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: DragType, itemId?: string, currentItemPos?: { x: number, y: number }) => {
    // Middle mouse, shift, or meta/cmd for panning, or explicit pan type
    if (type === 'pan' || e.button === 1 || e.shiftKey || e.metaKey) {
        e.preventDefault();
        dragState.current = { 
            type: 'pan', 
            startX: e.clientX, 
            startY: e.clientY, 
            initialPos: { ...pan } 
        };
    } else if (type === 'item' && itemId && currentItemPos) {
        e.stopPropagation();
        dragState.current = { 
            type: 'item', 
            id: itemId, 
            startX: e.clientX / zoom, 
            startY: e.clientY / zoom, 
            initialPos: { ...currentItemPos }
        };
    }

    const handleWindowMouseMove = (e: MouseEvent) => {
        if (!dragState.current) return;
        e.preventDefault();
        const state = dragState.current;
        
        if (state.type === 'pan') {
          setPan({ 
              x: state.initialPos.x + (e.clientX - state.startX), 
              y: state.initialPos.y + (e.clientY - state.startY) 
          });
        } else if (state.type === 'item' && state.id) {
            const newX = state.initialPos.x + (e.clientX / zoom - state.startX);
            const newY = state.initialPos.y + (e.clientY / zoom - state.startY);
            
            const el = document.querySelector(`[data-drag-id="${state.id}"]`) as HTMLElement;
            if(el) el.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
        if (dragState.current?.type === 'item' && dragState.current.id && onUpdateItemPosRef.current) {
             const { id, startX, startY, initialPos } = dragState.current;
             const newX = initialPos.x + (e.clientX / zoom - startX);
             const newY = initialPos.y + (e.clientY / zoom - startY);
             onUpdateItemPosRef.current(id, { x: newX, y: newY });
        }
        dragState.current = null;
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
        activeListenersRef.current = { move: null, up: null };
    };

    // Store listeners in ref for cleanup
    activeListenersRef.current = { move: handleWindowMouseMove, up: handleWindowMouseUp };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }, [pan, zoom]);

  return { pan, setPan, handleMouseDown };
};
