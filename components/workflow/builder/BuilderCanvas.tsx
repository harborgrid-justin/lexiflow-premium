import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Badge } from '../../common/Badge';
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
      else if (type === 'Decision' || type === 'Milestone') { w=128; h=128; }
      else if (type === 'Phase') { w=600; h=400; }
      else if (type === 'Event') { w=160; h=64; }
      else if (type === 'Task') { w = 192; h = 88; }
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
    
    const midX = startX * 0.25 + (startX + curvature) * 0.25 + (endX - curvature) * 0.25 + endX * 0.25;
    const midY = startY * 0.25 + startY * 0.25 + endY * 0.25 + endY * 0.25;

    return { path, midX, midY };
  }, [nodes]);

  // FIX: Robust drag handling with global window event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Panning logic
      if (isPanning) {
        setLastMousePos(prevPos => {
          const dx = e.clientX - prevPos.x;
          const dy = e.clientY - prevPos.y;
          setPan(p => ({ x: p.x + dx, y: p.y + dy }));
          return { x: e.clientX, y: e.clientY };
        });
      }
      
      // Connection drawing logic
      if (drawingConnection && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDrawingConnection(prev => {
          if (!prev) return null;
          return {
            ...prev,
            x2: (e.clientX - rect.left - pan.x) / scale,
            y2: (e.clientY - rect.top - pan.y) / scale,
          };
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsPanning(false);
      // If a connection is being drawn when mouse is released globally, it means
      // it wasn't dropped on a valid port, so we cancel it.
      if (drawingConnection) {
        setDrawingConnection(null);
      }
    };
    
    // Attach listeners only when a drag operation (panning or connecting) is active
    if (isPanning || drawingConnection) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, drawingConnection, pan, scale, lastMousePos, setPan]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey || e.metaKey) {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    } else {
        onBackgroundClick();
    }
  };

  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portId: string) => {
      e.stopPropagation();
      const fromNode = nodes.find(n => n.id === nodeId);
      if (!fromNode || !canvasRef.current) return;
      
      const { w, h } = getNodeDimensions(fromNode.type);
      let yOffset = h / 2;
      if (fromNode.ports) {
        const portIndex = fromNode.ports.findIndex(p => p.id === portId);
        if (portIndex !== -1) yOffset = (h / (fromNode.ports.length + 1)) * (portIndex + 1);
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const startX = fromNode.x + w;
      const startY = fromNode.y + yOffset;
      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;

      setDrawingConnection({ from: nodeId, fromPort: portId, x1: startX, y1: startY, x2: mouseX, y2: mouseY });
  };
  
  const handlePortMouseUp = (e: React.MouseEvent, toNodeId: string) => {
      if (drawingConnection) {
          e.stopPropagation();
          if (drawingConnection.from !== toNodeId) {
            onAddConnection(drawingConnection.from, toNodeId, drawingConnection.fromPort);
          }
          setDrawingConnection(null);
      }
  };

  const gridColor = mode === 'dark' ? '#334155' : '#cbd5e1';
  const bgColor = mode === 'dark' ? '#0f172a' : '#f8fafc';

  return (
    <div 
      ref={canvasRef}
      className={cn("flex-1 relative overflow-hidden outline-none", isPanning ? "cursor-grabbing" : "cursor-default")}
      onMouseDown={handleCanvasMouseDown}
    >
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`, backgroundSize: `${20 * scale}px ${20 * scale}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.5 }}
      />
      
      <div className="absolute top-0 left-0 w-full h-full" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
        <svg className="absolute w-[10000px] h-[10000px] -top-[5000px] -left-[5000px] pointer-events-none overflow-visible z-0">
            <defs>
                <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={mode === 'dark' ? '#64748b' : '#94a3b8'} />
                </marker>
                 <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                </marker>
                 <marker id="arrow-denied" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                 <marker id="arrow-granted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                </marker>
            </defs>

          {connections.map(conn => {
              const { path, midX, midY } = getConnectorPath(conn);
              if (!path) return null;
              const isSelected = selectedConnectionId === conn.id;
              const isDenied = conn.label?.toLowerCase().includes('denied');
              const isGranted = conn.label?.toLowerCase().includes('granted');
              const strokeColor = isSelected ? '#2563eb' : isDenied ? '#ef4444' : isGranted ? '#22c55e' : (mode === 'dark' ? '#64748b' : '#94a3b8');
              const markerId = isSelected ? 'arrow-selected' : isDenied ? 'arrow-denied' : isGranted ? 'arrow-granted' : 'arrow-default';

              return (
                <g key={conn.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectConnection(conn.id); }}>
                  <path d={path} stroke={strokeColor} strokeWidth={isSelected ? 4 : 2} fill="none" className="transition-all" markerEnd={`url(#${markerId})`} />
                  <path d={path} stroke="transparent" strokeWidth="12" fill="none" />
                  {conn.label && (
                      <text x={midX} y={midY} textAnchor="middle" dy="-5" className={cn("text-[10px] font-bold fill-current", isDenied ? 'text-red-500' : isGranted ? 'text-green-500' : 'text-slate-500')}>{conn.label}</text>
                  )}
                </g>
              );
          })}
          {(() => {
              if (!drawingConnection) return null;
              const { x1, y1, x2, y2 } = drawingConnection;
              const dist = Math.abs(x2 - x1);
              const curvature = Math.max(dist * 0.5, 50);
              const path = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
              return <path d={path} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrow-selected)" />;
          })()}
        </svg>

        {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const { h } = getNodeDimensions(node.type);

            let nodeContent;
            switch (node.type) {
                case 'Task':
                    nodeContent = (
                        <>
                            <div className={cn("flex items-center gap-2 px-3 py-1.5 border-b rounded-t-lg", theme.border.light)}>
                                {getNodeIcon(node.type)}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{node.type}</span>
                            </div>
                            <div className="p-3 text-center flex-1 flex items-center justify-center">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{node.label}</p>
                            </div>
                        </>
                    );
                    break;
                case 'Decision':
                case 'Milestone':
                    nodeContent = (
                        <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 pointer-events-none text-center p-2">
                            <div className={cn("p-2 mb-1 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-sm")}>
                                {getNodeIcon(node.type)}
                            </div>
                            <p className={cn("text-xs font-bold leading-tight", theme.text.primary)}>{node.label}</p>
                        </div>
                    );
                    break;
                case 'Phase':
                    nodeContent = (
                        <div className={cn("h-10 px-4 flex items-center border-b rounded-t-2xl backdrop-blur-sm", theme.surface.default, theme.border.default, "bg-opacity-80 dark:bg-opacity-60")}>
                            <span className={cn("font-bold text-xs uppercase tracking-wider", theme.text.secondary)}>{node.label}</span>
                        </div>
                    );
                    break;
                default: // Start, End, Delay, Event
                    nodeContent = (
                        <>
                            <div className="mb-1 pointer-events-none">{getNodeIcon(node.type)}</div>
                            <p className={cn("text-sm font-bold text-center leading-tight w-full px-2 pointer-events-none", theme.text.primary)}>{node.label}</p>
                        </>
                    );
            }
            
            return (
              <div
                key={node.id}
                data-drag-id={node.id}
                onMouseDown={(e) => onMouseDownNode(e, node.id)}
                className={getNodeStyles(node.type, isSelected, theme)}
                style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
              >
                {nodeContent}
                
                {/* Ports */}
                {node.type !== 'Start' && node.type !== 'Phase' && (
                    <div className={cn("absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 border-2 rounded-full transition-all bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 hover:!border-blue-500 dark:border-slate-600 dark:hover:!border-blue-400 flex items-center justify-center z-10")} data-port-id="input" onMouseUp={(e) => handlePortMouseUp(e, node.id)}>
                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors"/>
                    </div>
                )}
                
                {node.ports && node.ports.map((port, portIndex, arr) => {
                    const yOffset = (h / (arr.length + 1)) * (portIndex + 1);
                    return (
                        <div key={port.id} className={cn("absolute -right-3 w-6 h-6 border-2 rounded-full transition-all bg-white dark:bg-slate-800 shadow-sm hover:scale-110 hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-400 cursor-crosshair flex items-center justify-center z-10")} style={{ top: yOffset - 12 }} onMouseDown={(e) => handlePortMouseDown(e, node.id, port.id)}>
                            <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors"/>
                        </div>
                    );
                })}
                {node.type !== 'End' && !node.ports && node.type !== 'Phase' && (
                    <div className={cn("absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 border-2 rounded-full transition-all bg-white dark:bg-slate-800 shadow-sm hover:scale-110 hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-400 cursor-crosshair flex items-center justify-center z-10")} onMouseDown={(e) => handlePortMouseDown(e, node.id, 'default')}>
                       <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors"/>
                    </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};