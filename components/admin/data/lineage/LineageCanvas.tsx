import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { NODE_STRIDE } from '../../../../utils/nexusPhysics';
import { useNexusGraph } from '../../../../hooks/useNexusGraph';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { LineageNode, LineageLink } from '../../../../types';

interface LineageCanvasProps {
    isAnimating: boolean;
    setIsAnimating: (v: boolean) => void;
    // Props changed to accept data directly, hook handles physics state
    physicsState?: any; // kept for legacy compat signature but ignored
    nodeLabels?: any[]; // legacy
    data?: { nodes: LineageNode[], links: LineageLink[] }; // New prop for direct data injection
}

export const LineageCanvas: React.FC<LineageCanvasProps> = ({ isAnimating, setIsAnimating }) => {
    const { theme, mode } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });

    // Mock data fetch (replace with React Query prop in real usage)
    useEffect(() => {
        // Simulating data prop for self-containment if not provided
        const nodes = [
            { id: 'src1', label: 'Salesforce CRM', type: 'root' },
            { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
            { id: 'wh1', label: 'Data Warehouse', type: 'org' },
            { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
            { id: 'src2', label: 'Stripe API', type: 'root' },
            { id: 'stg2', label: 'Payments Raw', type: 'org' },
            { id: 'wh2', label: 'Reconciliation', type: 'evidence' }
        ];
        const links = [
            { source: 'src1', target: 'stg1', strength: 0.8 },
            { source: 'stg1', target: 'wh1', strength: 0.8 },
            { source: 'wh1', target: 'rpt1', strength: 0.8 },
            { source: 'src2', target: 'stg2', strength: 0.8 },
            { source: 'stg2', target: 'wh2', strength: 0.8 },
            { source: 'wh2', target: 'wh1', strength: 0.5 }
        ];
        setGraphData({ nodes, links });
    }, []);

    // Use Worker-based physics hook
    const { nodesMeta, physicsState, reheat } = useNexusGraph(containerRef, graphData);

    useEffect(() => {
        let frameId: number;
        
        const render = () => {
            if (!canvasRef.current || !containerRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const state = physicsState.current;
            if (!state.buffer) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            // Handle high-DPI
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.clearRect(0, 0, width, height);
            
            // Draw Links
            ctx.lineWidth = 2;
            const isDark = mode === 'dark';
            ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1'; 

            for (let i = 0; i < state.links.length; i++) {
                const link = state.links[i];
                const idxS = link.sourceIndex * NODE_STRIDE;
                const idxT = link.targetIndex * NODE_STRIDE;
                
                const x1 = state.buffer[idxS];
                const y1 = state.buffer[idxS+1];
                const x2 = state.buffer[idxT];
                const y2 = state.buffer[idxT+1];

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            // Draw Nodes
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
                ctx.fillText(nodesMeta[i]?.label || '', x, y + 40);
            }

            if (isAnimating) {
                frameId = requestAnimationFrame(render);
            }
        };

        if (isAnimating) {
            frameId = requestAnimationFrame(render);
        }

        return () => cancelAnimationFrame(frameId);
    }, [isAnimating, physicsState, nodesMeta, mode]);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-slate-50 dark:bg-slate-900/50">
            <canvas ref={canvasRef} className="block w-full h-full"/>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => reheat()} className={cn("p-2 border rounded-lg shadow-sm transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>
                    <RefreshCw className="h-5 w-5"/>
                </button>
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