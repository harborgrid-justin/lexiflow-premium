/**
 * @module hooks/usePanZoom
 * @category Hooks - UI Interactions
 * 
 * Provides pan and zoom state management with intent-based controls.
 * Useful for canvas, maps, and zoomable diagrams.
 * 
 * @example
 * ```typescript
 * const panZoom = usePanZoom(1.0);
 * 
 * <div style={{
 *   transform: `scale(${panZoom.state.scale}) translate(${panZoom.state.pan.x}px, ${panZoom.state.pan.y}px)`
 * }}>
 *   Zoomable content
 * </div>
 * 
 * <button onClick={panZoom.zoomIn}>+</button>
 * <button onClick={panZoom.zoomOut}>-</button>
 * <button onClick={panZoom.reset}>Reset</button>
 * ```
 */

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Pan and zoom state
 */
export interface PanZoomState {
  /** Current zoom scale */
  scale: number;
  /** Current pan offset */
  pan: { x: number; y: number };
}

/**
 * Return type for usePanZoom hook
 */
export interface PanZoomControls {
  /** Current pan/zoom state */
  state: PanZoomState;
  /** Zoom in by step amount */
  zoomIn: () => void;
  /** Zoom out by step amount */
  zoomOut: () => void;
  /** Set zoom to specific value */
  setZoom: (scale: number) => void;
  /** Pan to specific offset */
  panTo: (x: number, y: number) => void;
  /** Reset to initial state */
  reset: () => void;
}

const DEFAULT_SCALE = 0.8;
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages pan and zoom state with intent-based controls.
 * 
 * @param initialScale - Initial zoom scale (default: 0.8)
 * @returns Object with state and control methods
 */
export function usePanZoom(initialScale: number = DEFAULT_SCALE): PanZoomControls {
  const [scale, setScale] = useState(initialScale);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const reset = useCallback(() => {
    setScale(initialScale);
    setPan({ x: 0, y: 0 });
  }, [initialScale]);
  
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);
  
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  }, []);
  
  const setZoom = useCallback((scale: number) => {
    setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)));
  }, []);
  
  const panTo = useCallback((x: number, y: number) => {
    setPan({ x, y });
  }, []);
  
  return {
    state: { scale, pan },
    zoomIn,
    zoomOut,
    setZoom,
    panTo,
    reset
  };
};
