
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { WorkflowNode } from '../workflow/builder/types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface MinimapProps {
  nodes: WorkflowNode[];
  viewport: { x: number; y: number; width: number; height: number; scale: number };
  onPan: (pos: { x: number; y: number }) => void;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const PADDING = 10;

export const Minimap: React.FC<MinimapProps> = ({ nodes, viewport, onPan }) => {
  const { theme } = useTheme();
  const isDragging = useRef(false);

  const { bounds, scale } = useMemo(() => {
    if (nodes.length === 0) {
      return { bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, scale: 0.1 };
    }
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + (n.width || 150)));
    const maxY = Math.max(...nodes.map(n => n.y + (n.height || 100)));
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const scaleX = (MINIMAP_WIDTH - PADDING * 2) / contentWidth;
    const scaleY = (MINIMAP_HEIGHT - PADDING * 2) / contentHeight;
    
    return { bounds: { minX, minY, maxX, maxY }, scale: Math.min(scaleX, scaleY) };
  }, [nodes]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const mapX = clientX - rect.left;
    const mapY = clientY - rect.top;

    const targetX = (mapX - PADDING) / scale + bounds.minX;
    const targetY = (mapY - PADDING) / scale + bounds.minY;
    
    // Center viewport on click
    onPan({
        x: - (targetX - viewport.width / (2 * viewport.scale)) * viewport.scale,
        y: - (targetY - viewport.height / (2 * viewport.scale)) * viewport.scale
    });
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
                const x = (node.x - bounds.minX) * scale + PADDING;
                const y = (node.y - bounds.minY) * scale + PADDING;
                const w = (node.width || 150) * scale;
                const h = (node.height || 100) * scale;
                
                return <rect key={node.id} x={x} y={y} width={w} height={h} fill={theme.chart.colors.neutral} opacity="0.6" />;
            })}

            {/* Viewport Rectangle */}
            <rect 
                x={(-viewport.x / viewport.scale - bounds.minX) * scale + PADDING}
                y={(-viewport.y / viewport.scale - bounds.minY) * scale + PADDING}
                width={(viewport.width / viewport.scale) * scale}
                height={(viewport.height / viewport.scale) * scale}
                fill="none"
                stroke={theme.chart.colors.primary}
                strokeWidth="2"
            />
        </svg>
    </div>
  );
};