
import React, { useState, useRef, useCallback } from 'react';

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

export const useCanvasDrag = ({ onUpdateItemPos, zoom = 1 }: UseCanvasDragProps = {}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<DragState | null>(null);

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
            
            // DOM manipulation for performance (optional, usually handled by React state in parent, 
            // but for high freq drag, direct DOM or specialized libs are better. 
            // Here we assume parent updates state or we update a ref).
            // For this hook, we'll return the handler to be attached.
             const el = document.querySelector(`[data-drag-id="${state.id}"]`) as HTMLElement;
             if(el) el.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
        if (dragState.current?.type === 'item' && dragState.current.id && onUpdateItemPos) {
             const { id, startX, startY, initialPos } = dragState.current;
             const newX = initialPos.x + (e.clientX / zoom - startX);
             const newY = initialPos.y + (e.clientY / zoom - startY);
             onUpdateItemPos(id, { x: newX, y: newY });
        }
        dragState.current = null;
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }, [pan, zoom, onUpdateItemPos]);

  return { pan, setPan, handleMouseDown };
};
