
import React, { useState, useCallback } from 'react';
import { Badge } from '../../common/Badge';
import { WorkflowNode, WorkflowConnection, getNodeIcon, getNodeStyles } from './types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface BuilderCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  scale: number;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onMouseDownNode: (e: React.MouseEvent, id: string) => void;
  onBackgroundClick: () => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  nodes, connections, selectedNodeId, scale, pan, setPan, canvasRef, onMouseDownNode, onBackgroundClick
}) => {
  const { theme, mode } = useTheme();
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Connection Path Logic - Smooth Bezier Curves
  const getConnectorPath = (conn: WorkflowConnection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    // Adjust anchor points based on node shape
    const w = fromNode.type === 'Decision' ? 100 : 160;
    const h = fromNode.type === 'Decision' ? 100 : 80;
    
    const startX = fromNode.x + w; 
    const startY = fromNode.y + (h/2);
    const endX = toNode.x;
    const endY = toNode.y + (h/2); // Default to left center

    // Calculate curvature based on distance
    const dist = Math.abs(endX - startX);
    const curvature = Math.max(dist * 0.5, 50);

    return `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Spacebar or Middle Click triggers Pan
    if (e.button === 1 || e.shiftKey || e.metaKey) {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault(); // Prevent text selection
    } else {
        onBackgroundClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPan({ x: pan.x + dx, y: pan.y + dy });
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const gridColor = mode === 'dark' ? '#334155' : '#cbd5e1';
  const bgColor = mode === 'dark' ? '#0f172a' : '#f8fafc'; // Slate-950 or Slate-50

  return (
    <div 
      ref={canvasRef}
      className={cn("flex-1 relative overflow-hidden outline-none", isPanning ? "cursor-grabbing" : "cursor-default")}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ backgroundColor: bgColor }}
    >
      {/* Infinite Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
            backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`, 
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.5
        }}
      />

      {/* Transform Container */}
      <div 
        className="absolute top-0 left-0 w-full h-full transform-gpu"
        style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
        }}
      >
        {/* Connections Layer (SVG) */}
        <svg className="absolute -top-[10000px] -left-[10000px] w-[20000px] h-[20000px] pointer-events-none overflow-visible z-0">
          {connections.map(conn => (
            <g key={conn.id}>
              <path 
                d={getConnectorPath(conn)} 
                stroke={mode === 'dark' ? '#64748b' : '#94a3b8'} 
                strokeWidth="2" 
                fill="none" 
                markerEnd={`url(#arrow-${conn.id})`}
                className="transition-all duration-300"
              />
              <defs>
                <marker id={`arrow-${conn.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={mode === 'dark' ? '#64748b' : '#94a3b8'} />
                </marker>
              </defs>
            </g>
          ))}
        </svg>

        {/* Nodes Layer (HTML) */}
        {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => onMouseDownNode(e, node.id)}
                className={getNodeStyles(node.type, isSelected, theme)}
                style={{ 
                    transform: `translate(${node.x}px, ${node.y}px)`,
                }}
              >
                {/* Input Port */}
                {node.type !== 'Start' && (
                    <div className={cn("absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 rounded-full transition-colors hover:border-blue-500", theme.surface, theme.border.default)} />
                )}

                <div className="mb-2 pointer-events-none">{getNodeIcon(node.type)}</div>
                <span className={cn("text-xs font-bold text-center leading-tight line-clamp-2 w-full px-2 pointer-events-none", theme.text.primary)}>
                    {node.label}
                </span>
                
                {node.type === 'Task' && (
                    <div className="mt-2 flex gap-1 pointer-events-none">
                        {node.config.assignee && <Badge variant="neutral" className="text-[8px] px-1 h-4">{node.config.assignee}</Badge>}
                        {node.config.sla && <span className={cn("text-[8px] border px-1 rounded h-4 flex items-center", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}>{node.config.sla}h</span>}
                    </div>
                )}

                {/* Output Port */}
                {node.type !== 'End' && (
                     <div className={cn("absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 rounded-full transition-colors hover:bg-blue-500 hover:border-blue-500 cursor-crosshair", theme.surface, theme.border.default)} />
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};
