/**
 * Minimap.tsx
 * 
 * Minimap navigation for the Strategy Canvas.
 * 
 * @module components/litigation/Minimap
 */

import React, { useRef, useMemo, useCallback } from 'react';

import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { MinimapProps } from './types';
import { 
  calculateMinimapBoundsAndScale,
  minimapToCanvasCoordinates,
  calculateCenterPan,
  nodeToMinimapPosition,
  viewportToMinimapPosition,
  MINIMAP_WIDTH,
  MINIMAP_HEIGHT,
  MINIMAP_PADDING as PADDING
} from './utils';

export const Minimap: React.FC<MinimapProps> = ({ nodes, viewport, onPan }) => {
  const { theme } = useTheme();
  const isDragging = useRef(false);

  const { bounds, scale } = useMemo(() => calculateMinimapBoundsAndScale(nodes), [nodes]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const mapX = clientX - rect.left;
    const mapY = clientY - rect.top;

    const { x: targetX, y: targetY } = minimapToCanvasCoordinates(mapX, mapY, bounds, scale);
    const panOffset = calculateCenterPan(targetX, targetY, viewport);
    
    onPan(panOffset);
  }, [scale, bounds, viewport, onPan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleInteraction(e);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
        handleInteraction(e);
    }
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
        className={cn("absolute bottom-4 right-4 w-52 h-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg shadow-2xl border transition-all hover:shadow-cyan-500/10", theme.border.default)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        <svg width="100%" height="100%">
            {nodes.map(node => {
                const pos = nodeToMinimapPosition(node, bounds, scale);
                return <rect key={node.id} x={pos.x} y={pos.y} width={pos.width} height={pos.height} fill={theme.chart.colors.neutral} opacity="0.6" />;
            })}

            {/* Viewport Rectangle */}
            {(() => {
                const viewportPos = viewportToMinimapPosition(viewport, bounds, scale);
                return <rect 
                    x={viewportPos.x}
                    y={viewportPos.y}
                    width={viewportPos.width}
                    height={viewportPos.height}
                    fill="none"
                    stroke={theme.chart.colors.primary}
                    strokeWidth="2"
                />;
            })()}
        </svg>
    </div>
  );
};
