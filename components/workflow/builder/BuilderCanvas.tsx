
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Badge } from '../../common/Badge';
// FIX: Add missing NodeType import.
import { WorkflowNode, WorkflowConnection, getNodeIcon, getNodeStyles, NodeType } from './types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface BuilderCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  onSelectConnection: (id: string) => void;
  scale: number;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onMouseDownNode: (e: React.MouseEvent, id: string) => void;
  onBackgroundClick: () => void;
  onAddConnection: (from: string, to: string, fromPort?: string) => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  nodes, connections, selectedNodeId, selectedConnectionId, onSelectConnection,
  scale, pan, setPan, canvasRef, onMouseDownNode, onBackgroundClick, onAddConnection
}) => {
  const { theme, mode } = useTheme();
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [drawingConnection, setDrawingConnection] = useState<{ from: string; fromPort: string; x1: number; y1: number; x2: number; y2: number } | null>(null);

  const getNodeDimensions = (type: NodeType) => {
      let w = 160, h = 80;
      if (type === 'Start' || type === 'End') { w=128; h=56; }
      else if (type === 'Decision') { w=112; h=112; }
      else if (type === 'Phase') { w=600; h=400; }
      else if (type === 'Event') { w=160; h=64; }
      return { w, h };
  };

  const getConnectorPath = useCallback((conn: WorkflowConnection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return { path: '', midX: 0, midY: 0 };

    const fromDims = getNodeDimensions(fromNode.type);
    const toDims = getNodeDimensions(toNode.type);
    
    let yOffset = fromDims.h / 2;
    if (fromNode.ports && conn.fromPort) {
        const portIndex = fromNode.ports.findIndex(p => p.id === conn.fromPort);
        if (portIndex !== -1) yOffset = (fromDims.h / (fromNode.ports.length + 1)) * (portIndex + 1);
    }
    
    const startX = fromNode.x + fromDims.w;
    const startY = fromNode.y + yOffset;
    const endX = toNode.x;
    const endY = toNode.y + (toDims.h / 2);

    const dist = Math.abs(endX - startX);
    const curvature = Math.max(dist * 0.5, 50);
    const path = `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`;
    
    // Calculate midpoint for label
    const midX = startX * 0.25 + (startX + curvature) * 0.25 + (endX - curvature) * 0.25 + endX * 0.25;
    const midY = startY * 0.25 + startY * 0.25 + endY * 0.25 + endY * 0.25;

    return { path, midX, midY };
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey || e.metaKey) {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
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
    if (drawingConnection) {
        const rect = canvasRef.current!.getBoundingClientRect();
        setDrawingConnection(prev => ({
            ...prev!,
            x2: (e.clientX - rect.left - pan.x) / scale,
            y2: (e.clientY - rect.top - pan.y) / scale,
        }));
    }
  };

  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portId: string) => {
      e.stopPropagation();
      const fromNode = nodes.find(n => n.id === nodeId);
      if (!fromNode) return;
      
      const { w, h } = getNodeDimensions(fromNode.type);
      let yOffset = h / 2;
      if (fromNode.ports) {
        const portIndex = fromNode.ports.findIndex(p => p.id === portId);
        if (portIndex !== -1) yOffset = (h / (fromNode.ports.length + 1)) * (portIndex + 1);
      }
      
      const rect = canvasRef.current!.getBoundingClientRect();
      const startX = fromNode.x + w;
      const startY = fromNode.y + yOffset;
      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;

      setDrawingConnection({ from: nodeId, fromPort: portId, x1: startX, y1: startY, x2: mouseX, y2: mouseY });
  };
  
  const handlePortMouseUp = (e: React.MouseEvent, toNodeId: string) => {
      if (drawingConnection) {
          e.stopPropagation();
          onAddConnection(drawingConnection.from, toNodeId, drawingConnection.fromPort);
          setDrawingConnection(null);
      }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDrawingConnection(null);
  };

  const gridColor = mode === 'dark' ? '#334155' : '#cbd5e1';
  const bgColor = mode === 'dark' ? '#0f172a' : '#f8fafc';

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
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`, backgroundSize: `${20 * scale}px ${20 * scale}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.5 }}
      />
      
      <div className="absolute top-0 left-0 w-full h-full" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
        <svg className="absolute w-[10000px] h-[10000px] -top-[5000px] -left-[5000px] pointer-events-none overflow-visible z-0">
          {connections.map(conn => {
              const { path, midX, midY } = getConnectorPath(conn);
              const isSelected = selectedConnectionId === conn.id;
              const isDenied = conn.label?.toLowerCase().includes('denied');
              const isGranted = conn.label?.toLowerCase().includes('granted');
              const strokeColor = isSelected ? '#2563eb' : isDenied ? '#ef4444' : isGranted ? '#22c55e' : (mode === 'dark' ? '#64748b' : '#94a3b8');
              return (
                <g key={conn.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectConnection(conn.id); }}>
                  <path d={path} stroke={strokeColor} strokeWidth={isSelected ? 4 : 2} fill="none" className="transition-all" />
                  <path d={path} stroke="transparent" strokeWidth="12" fill="none" />
                  {conn.label && (
                      <text x={midX} y={midY} textAnchor="middle" dy="-5" className={cn("text-[10px] font-bold fill-current", isDenied ? 'text-red-500' : isGranted ? 'text-green-500' : 'text-slate-500')}>{conn.label}</text>
                  )}
                </g>
              );
          })}
          {drawingConnection && <path d={`M ${drawingConnection.x1} ${drawingConnection.y1} L ${drawingConnection.x2} ${drawingConnection.y2}`} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />}
        </svg>

        {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const { h } = getNodeDimensions(node.type);
            return (
              <div
                key={node.id}
                data-drag-id={node.id}
                onMouseDown={(e) => onMouseDownNode(e, node.id)}
                className={getNodeStyles(node.type, isSelected, theme)}
                style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
              >
                {node.type !== 'Start' && node.type !== 'Phase' && (
                    <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full transition-colors hover:border-blue-500 bg-white" data-port-id="input" onMouseUp={(e) => handlePortMouseUp(e, node.id)} />
                )}
                
                {node.type === 'Phase' ? (
                    <div className={cn("text-sm font-bold uppercase tracking-wider pointer-events-none", theme.text.tertiary)}>
                        {node.label}
                    </div>
                ) : (
                    <div className={cn("flex flex-col items-center justify-center w-full h-full", node.type === 'Decision' && "-rotate-45")}>
                        <div className="mb-2 pointer-events-none">{getNodeIcon(node.type)}</div>
                        <span className={cn("text-xs font-bold text-center leading-tight line-clamp-2 w-full px-2 pointer-events-none", theme.text.primary)}>{node.label}</span>
                    </div>
                )}
                
                {node.ports && node.ports.map((port, portIndex, arr) => {
                    const yOffset = (h / (arr.length + 1)) * (portIndex + 1);
                    return (
                        <div key={port.id} className="absolute right-[-7px] w-3.5 h-3.5 border-2 rounded-full transition-colors hover:border-blue-500 bg-white cursor-crosshair" style={{ top: yOffset - 7 }} onMouseDown={(e) => handlePortMouseDown(e, node.id, port.id)} />
                    );
                })}
                {node.type !== 'End' && !node.ports && node.type !== 'Phase' && <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full transition-colors hover:border-blue-500 bg-white cursor-crosshair" onMouseDown={(e) => handlePortMouseDown(e, node.id, 'default')} />}
              </div>
            );
        })}
      </div>
    </div>
  );
};
