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
type DragType = 'pan' | 'item';

interface DragState {
  type: DragType;
  id?: string;
  startX: number;
  startY: number;
  initialPos: { x: number; y: number };
}

interface UseCanvasDragProps {
  onUpdateItemPos?: (id: string, pos: { x: number, y: number }) => void;
  zoom?: number;
}

// ========================================
// HOOK
// ========================================
export const useCanvasDrag = ({ onUpdateItemPos, zoom = 1 }: UseCanvasDragProps = {}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<DragState | null>(null);
  const onUpdateItemPosRef = useRef(onUpdateItemPos);
  
  useEffect(() => {
    onUpdateItemPosRef.current = onUpdateItemPos;
  }, [onUpdateItemPos]);

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
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }, [pan, zoom]);

  return { pan, setPan, handleMouseDown };
};
