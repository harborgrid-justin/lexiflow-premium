
import React, { useState, useEffect, useRef } from 'react';
import { Network, Database, FileText, ArrowRight, X, User, Clock, Code, RefreshCw, ZoomIn, ZoomOut, Play, Pause, Layers, Search } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { NexusPhysics, NODE_STRIDE } from '../../../utils/nexusPhysics';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';

interface LineageGraphProps {
    initialTab?: string;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({ initialTab = 'graph' }) => {
  const { theme, mode } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const requestRef = useRef<number>(0);

  // Physics State
  const physicsState = useRef({
      buffer: new Float32Array(0),
      links: [] as {sourceIndex: number, targetIndex: number, strength: number}[],
      count: 0,
      alpha: 1
  });
  const [nodeLabels, setNodeLabels] = useState<any[]>([]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Initialize Graph Data
  useEffect(() => {
      if (activeTab !== 'graph' || !containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Mock Lineage Data
      const nodes = [
          { id: 'src1', label: 'Salesforce CRM', type: 'root' },
          { id: 'src2', label: 'Website Logs', type: 'root' },
          { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
          { id: 'etl1', label: 'Cleaning Job', type: 'party' },
          { id: 'wh1', label: 'Data Warehouse', type: 'org' },
          { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
          { id: 'rpt2', label: 'User Activity Report', type: 'evidence' }
      ];

      const { buffer, idMap, meta } = NexusPhysics.initSystem(nodes, width, height);
      setNodeLabels(meta);

      const links = [
          { source: 'src1', target: 'stg1' },
          { source: 'src2', target: 'stg1' },
          { source: 'stg1', target: 'etl1' },
          { source: 'etl1', target: 'wh1' },
          { source: 'wh1', target: 'rpt1' },
          { source: 'wh1', target: 'rpt2' }
      ].map(l => ({
          sourceIndex: idMap.get(l.source)!,
          targetIndex: idMap.get(l.target)!,
          strength: 0.5
      }));

      physicsState.current = { buffer, links, count: nodes.length, alpha: 1 };
      
      // Start Loop
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(tick);

      // Handle Resize properly
      const resizeObserver = new ResizeObserver(() => {
         // Just wake up physics, exact resizing happens in tick via clientWidth
         physicsState.current.alpha = 0.8;
      });
      resizeObserver.observe(containerRef.current);

      return () => {
          cancelAnimationFrame(requestRef.current);
          resizeObserver.disconnect();
      };
  }, [activeTab]);

  // Effect to wake up physics on Theme Change
  useEffect(() => {
      physicsState.current.alpha = 0.1; // Trigger a few frames to repaint colors
  }, [mode]);

  const tick = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      // Get logical size
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      // Set physical size
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Normalize scale
      ctx.scale(dpr, dpr);

      // CSS styling for proper display size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const state = physicsState.current;

      // Update Physics
      if (state.alpha > 0.001 && isAnimating) {
          state.alpha = NexusPhysics.simulate(state.buffer, state.links, state.count, width, height, state.alpha);
      }

      // Draw
      ctx.clearRect(0, 0, width, height);
      
      // Links - Dynamic Theme Color
      ctx.lineWidth = 2;
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1'; // slate-600 vs slate-300
      
      state.links.forEach(link => {
          const idxS = link.sourceIndex * NODE_STRIDE;
          const idxT = link.targetIndex * NODE_STRIDE;
          ctx.beginPath();
          ctx.moveTo(state.buffer[idxS], state.buffer[idxS+1]);
          ctx.lineTo(state.buffer[idxT], state.buffer[idxT+1]);
          ctx.stroke();
      });

      // Nodes
      for (let i = 0; i < state.count; i++) {
          const idx = i * NODE_STRIDE;
          const x = state.buffer[idx];
          const y = state.buffer[idx+1];
          const type = state.buffer[idx+5];
          
          ctx.beginPath();
          ctx.arc(x, y, type === 0 ? 30 : 20, 0, Math.PI * 2);
          // Colors: root=blue, org=purple, party=green, evidence=amber
          ctx.fillStyle = type === 0 ? '#3b82f6' : type === 1 ? '#8b5cf6' : type === 2 ? '#10b981' : '#f59e0b';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = isDark ? '#1e293b' : '#fff';
          ctx.stroke();
          
          // Label
          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(nodeLabels[i]?.label || '', x, y + 40);
      }

      if (isAnimating) requestRef.current = requestAnimationFrame(tick);
  };

  const handleReheat = () => {
      physicsState.current.alpha = 1;
      if (!isAnimating) {
          setIsAnimating(true);
          requestRef.current = requestAnimationFrame(tick);
      }
  };

  return (
    <div className="flex flex-col h-full">
        <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>Data Lineage Explorer</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleReheat}>Refresh Layout</Button>
                </div>
            </div>
            <Tabs 
                tabs={['graph', 'impact', 'history']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className={cn("flex-1 overflow-hidden relative", theme.surfaceHighlight)}>
            {activeTab === 'graph' && (
                <div ref={containerRef} className="w-full h-full relative">
                    <canvas ref={canvasRef} className="block w-full h-full"/>
                    
                    <div className={cn("absolute bottom-6 left-6 p-4 backdrop-blur rounded-lg border shadow-sm text-xs space-y-2 pointer-events-none bg-opacity-90", theme.surface, theme.border.default)}>
                        <div className={cn("font-bold uppercase mb-1", theme.text.tertiary)}>Legend</div>
                        <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-blue-500"></div> Source System</div>
                        <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-purple-500"></div> Storage / Warehouse</div>
                        <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-green-500"></div> Transformation</div>
                        <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-amber-500"></div> Report / Output</div>
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button onClick={() => setIsAnimating(!isAnimating)} className={cn("p-2 border rounded-lg shadow-sm transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>
                            {isAnimating ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'impact' && (
                <div className={cn("p-6 flex items-center justify-center h-full", theme.text.tertiary)}>
                    <div className="text-center">
                        <Layers className="h-16 w-16 mx-auto mb-4 opacity-20"/>
                        <h3 className={cn("text-lg font-bold", theme.text.secondary)}>Impact Analysis</h3>
                        <p className="text-sm mt-2">Select a node in the graph to view downstream dependencies.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
