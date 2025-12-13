
import React, { useEffect, useRef, useState } from 'react';
import { Map, RefreshCw, Layers, Navigation } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useWindow } from '../../context/WindowContext';

interface MapNode {
  x: number;
  y: number;
  label: string;
  type: 'federal' | 'state';
  radius: number;
  vx: number;
  vy: number;
}

export const JurisdictionGeoMap: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const nodesRef = useRef<MapNode[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
      const loadNodes = async () => {
          const nodes = await DataService.jurisdiction.getMapNodes();
          if (nodes.length > 0) {
            nodesRef.current = nodes.map((n: any) => ({ ...n, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 }));
          }
      };
      loadNodes();
  }, []);

  const handleNodeClick = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = nodesRef.current.find(node => {
          const dx = node.x - x;
          const dy = node.y - y;
          return Math.sqrt(dx*dx + dy*dy) < node.radius + 5;
      });

      if (clickedNode) {
          const winId = `geo-${clickedNode.label}`;
          openWindow(
              winId,
              `Jurisdiction: ${clickedNode.label}`,
              <div className={cn("p-6", theme.text.primary)}>
                  <h3 className="text-xl font-bold mb-2">{clickedNode.label}</h3>
                  <p className={cn("text-sm", theme.text.secondary)}>Type: {clickedNode.type === 'federal' ? 'Federal Circuit' : 'State Court'}</p>
                  <div className={cn("mt-4 p-4 rounded border", theme.surface.highlight, theme.border.default)}>
                      <h4 className="font-bold text-sm mb-2">Local Rules</h4>
                      <p className="text-xs">L.R. 7-1 applies to all civil motions.</p>
                  </div>
              </div>
          );
      }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!canvas) return;
      
      // 1. Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 2. Update Physics (Imperative)
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 20 || node.x > canvas.width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > canvas.height - 20) node.vy *= -1;
      });

      // 3. Draw Connections
      ctx.lineWidth = 1;
      nodesRef.current.forEach((nodeA, i) => {
        nodesRef.current.slice(i + 1).forEach(nodeB => {
           const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
           if (dist < 300) {
             ctx.beginPath();
             ctx.moveTo(nodeA.x, nodeA.y);
             ctx.lineTo(nodeB.x, nodeB.y);
             ctx.strokeStyle = `rgba(148, 163, 184, ${1 - dist / 300})`; // Fade by distance
             ctx.stroke();
           }
        });
      });

      // 4. Draw Nodes
      nodesRef.current.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.type === 'federal' ? '#3b82f6' : '#10b981'; // Blue vs Emerald
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#475569';
        ctx.font = '10px Inter';
        ctx.fillText(node.label, node.x + 12, node.y + 3);
      });

      if (isAnimating) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    // Handle Resize
    const resize = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth || 800;
            canvas.height = canvas.parentElement.clientHeight || 500;
        }
    };
    window.addEventListener('resize', resize);
    resize(); // Initial size

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isAnimating]);

  return (
    <div className={cn("h-full flex flex-col rounded-lg shadow-sm border overflow-hidden min-h-[500px]", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
        <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Map className={cn("h-5 w-5 mr-2", theme.primary.text)}/> Jurisdiction Map
        </h3>
        <div className="flex items-center gap-3">
            <div className="flex gap-2 text-xs">
                <span className={cn("flex items-center", theme.text.secondary)}><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Federal</span>
                <span className={cn("flex items-center", theme.text.secondary)}><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> State</span>
            </div>
            <button 
                onClick={() => setIsAnimating(!isAnimating)}
                className={cn("p-1.5 rounded hover:bg-slate-100", theme.text.secondary)}
                title={isAnimating ? "Pause Simulation" : "Resume"}
            >
                {isAnimating ? <Navigation className="h-4 w-4"/> : <RefreshCw className="h-4 w-4"/>}
            </button>
        </div>
      </div>
      
      <div className={cn("flex-1 relative bg-slate-50/50")}>
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full block cursor-pointer"
            onClick={handleNodeClick}
        />
        
        {/* HUD Overlay */}
        <div className={cn("absolute bottom-4 left-4 p-3 backdrop-blur rounded-lg border shadow-sm text-xs pointer-events-none bg-opacity-90", theme.surface.default, theme.border.default)}>
            <div className={cn("flex items-center gap-2 mb-1", theme.text.secondary)}>
                <Layers className="h-3 w-3"/>
                <span>Active Nodes: {nodesRef.current.length}</span>
            </div>
            <div className={cn("text-[10px]", theme.text.tertiary)}>
                Rendering via Canvas API (60FPS)
            </div>
        </div>
      </div>
    </div>
  );
};
