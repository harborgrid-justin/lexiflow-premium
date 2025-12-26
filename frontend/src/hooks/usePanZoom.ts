/**
 * @module hooks/usePanZoom
 * @category Hooks - UI Interactions
 * @description Custom hook for pan and zoom functionality
 * 
 * BEST PRACTICES:
 * - Custom hook for reusability (Practice #3)
 * - State minimization - only track necessary state (Practice #2)
 * - Type-safe architecture (Practice #5)
 */

import { useState, useCallback } from 'react';

export interface PanZoomState {
  scale: number;
  pan: { x: number; y: number };
}

export interface PanZoomControls {
  state: PanZoomState;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const DEFAULT_SCALE = 0.8;
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

/**
 * Hook for managing pan and zoom state
 * @param initialScale - Initial zoom scale (default: 0.8)
 * @returns Pan/zoom state and control functions
 */
export const usePanZoom = (initialScale: number = DEFAULT_SCALE): PanZoomControls => {
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
  
  return {
    state: { scale, pan },
    setScale,
    setPan,
    reset,
    zoomIn,
    zoomOut
  };
};
