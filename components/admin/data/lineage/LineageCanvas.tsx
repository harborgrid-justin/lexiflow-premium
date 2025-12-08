
import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { NexusPhysics, NODE_STRIDE } from '../../../../utils/nexusPhysics';
import { Pause, Play } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface LineageCanvasProps {
    isAnimating: boolean;
    setIsAnimating: (v: boolean) => void;
    physicsState: React.MutableRefObject<{
        buffer: Float32Array;
        links: {sourceIndex: number, targetIndex: number, strength: number}[];
        count: number;
        alpha: number;
    }>;
    nodeLabels: any[];
}

export const LineageCanvas: React.FC<LineageCanvasProps> = ({ isAnimating, setIsAnimating, physicsState, nodeLabels }) => {
    const { theme, mode } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const modeRef = useRef(mode);

    // Keep mode ref sync to avoid stale closure in tick
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    const tick = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const state = physicsState.current;

      if (state.alpha > 0.001 && isAnimating) {
          state.alpha = NexusPhysics.simulate(state.buffer, state.links, state.count, width, height, state.alpha);
      }

      ctx.clearRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      const currentMode = modeRef.current;
      const isDark = currentMode === 'dark';
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1'; 
      
      state.links.forEach(link => {
          const idxS = link.sourceIndex * NODE_STRIDE;
          const idxT = link.targetIndex * NODE_STRIDE;
          ctx.beginPath();
          ctx.moveTo(state.buffer[idxS], state.buffer[idxS+1]);
          ctx.lineTo(state.buffer[idxT], state.buffer[idxT+1]);
          ctx.stroke();
      });

      for (let i = 0; i < state.count; i++) {
          const idx = i * NODE_STRIDE;
          const x = state.buffer[idx];
          const y = state.buffer[idx+1];
          const type = state.buffer[idx+5];
          
          ctx.beginPath();
          ctx.arc(x, y, type === 0 ? 30 : 20, 0, Math.PI * 2);
          ctx.fillStyle = type === 0 ? '#3b82f6' : type === 1 ? '#8b5cf6' : type === 2 ? '#10b981' : '#f59e0b';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = isDark ? '#1e293b' : '#fff';
          ctx.stroke();
          
          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(nodeLabels[i]?.label || '', x, y + 40);
      }

      if (isAnimating) requestRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(tick);

        const resizeObserver = new ResizeObserver(() => {
             physicsState.current.alpha = 0.8;
        });
        if(containerRef.current) resizeObserver.observe(containerRef.current);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            resizeObserver.disconnect();
        };
    }, [isAnimating]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <canvas ref={canvasRef} className="block w-full h-full"/>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => setIsAnimating(!isAnimating)} className={cn("p-2 border rounded-lg shadow-sm transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>
                    {isAnimating ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
                </button>
            </div>
            <div className={cn("absolute bottom-6 left-6 p-4 backdrop-blur rounded-lg border shadow-sm text-xs space-y-2 pointer-events-none bg-opacity-90", theme.surface, theme.border.default)}>
                <div className={cn("font-bold uppercase mb-1", theme.text.tertiary)}>Legend</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-blue-500"></div> Source System</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-purple-500"></div> Storage / Warehouse</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-green-500"></div> Transformation</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-amber-500"></div> Report / Output</div>
            </div>
        </div>
    );
};
