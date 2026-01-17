/**
 * minimapUtils.ts
 *
 * Utility functions for minimap viewport calculations and transformations.
 *
 * @module components/litigation/utils/minimapUtils
 */

import { type WorkflowNode } from '@/types/workflow-types';

export interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MinimapScale {
  bounds: MinimapBounds;
  scale: number;
}

export const MINIMAP_WIDTH = 200;
export const MINIMAP_HEIGHT = 150;
export const MINIMAP_PADDING = 10;

/**
 * Calculates the bounding box and scale for the minimap based on all nodes
 */
export const calculateMinimapBoundsAndScale = (
  nodes: WorkflowNode[],
  minimapWidth: number = MINIMAP_WIDTH,
  minimapHeight: number = MINIMAP_HEIGHT,
  padding: number = MINIMAP_PADDING
): MinimapScale => {
  if (nodes.length === 0) {
    return { 
      bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, 
      scale: 0.1 
    };
  }
  
  const minX = Math.min(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxX = Math.max(...nodes.map(n => n.x + (n.width || 150)));
  const maxY = Math.max(...nodes.map(n => n.y + (n.height || 100)));
  
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  
  const scaleX = (minimapWidth - padding * 2) / contentWidth;
  const scaleY = (minimapHeight - padding * 2) / contentHeight;
  
  return { 
    bounds: { minX, minY, maxX, maxY }, 
    scale: Math.min(scaleX, scaleY) 
  };
};

/**
 * Converts minimap coordinates to canvas coordinates
 */
export const minimapToCanvasCoordinates = (
  mapX: number,
  mapY: number,
  bounds: MinimapBounds,
  scale: number,
  padding: number = MINIMAP_PADDING
): { x: number; y: number } => {
  const targetX = (mapX - padding) / scale + bounds.minX;
  const targetY = (mapY - padding) / scale + bounds.minY;
  
  return { x: targetX, y: targetY };
};

/**
 * Calculates the pan offset to center the viewport on a target position
 */
export const calculateCenterPan = (
  targetX: number,
  targetY: number,
  viewport: { width: number; height: number; scale: number }
): { x: number; y: number } => {
  return {
    x: -(targetX - viewport.width / (2 * viewport.scale)) * viewport.scale,
    y: -(targetY - viewport.height / (2 * viewport.scale)) * viewport.scale
  };
};

/**
 * Transforms node position to minimap coordinates
 */
export const nodeToMinimapPosition = (
  node: WorkflowNode,
  bounds: MinimapBounds,
  scale: number,
  padding: number = MINIMAP_PADDING
): { x: number; y: number; width: number; height: number } => {
  const x = (node.x - bounds.minX) * scale + padding;
  const y = (node.y - bounds.minY) * scale + padding;
  const width = (node.width || 150) * scale;
  const height = (node.height || 100) * scale;
  
  return { x, y, width, height };
};

/**
 * Transforms viewport to minimap coordinates
 */
export const viewportToMinimapPosition = (
  viewport: { x: number; y: number; width: number; height: number; scale: number },
  bounds: MinimapBounds,
  minimapScale: number,
  padding: number = MINIMAP_PADDING
): { x: number; y: number; width: number; height: number } => {
  const x = (-viewport.x / viewport.scale - bounds.minX) * minimapScale + padding;
  const y = (-viewport.y / viewport.scale - bounds.minY) * minimapScale + padding;
  const width = (viewport.width / viewport.scale) * minimapScale;
  const height = (viewport.height / viewport.scale) * minimapScale;
  
  return { x, y, width, height };
};
