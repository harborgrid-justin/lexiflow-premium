
import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { NODE_STRIDE } from '../../../../utils/nexusPhysics';
import { useNexusGraph } from '../../../../hooks/useNexusGraph';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { LineageNode, LineageLink } from '../../../../types';
import { SimulationNode } from '../../../../utils/nexusPhysics';

interface LineageCanvasProps {
    data?: { nodes: LineageNode[], links: LineageLink[] };
}

export const LineageCanvas: React.FC<LineageCanvasProps> = ({ data }) => {
    const { theme, mode } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnimating, setIsAnimating] = useState(true);

    // Default mock data if no props provided (Fallthrough safety)
    const [graphData, setGraphData] = useState<{ nodes: SimulationNode[], links: { source: string; target: string; strength?: number }[] }>({
        nodes: [
            { id: 'src1', label: 'Salesforce CRM', type: 'root' },
            { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
            { id: 'wh1', label: 'Data Warehouse', type: 'org' },
            { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
        ],
        links: [
            { source: 'src1', target: 'stg1', strength: 0.8 },
            { source: 'stg1', target: 'wh1', strength: 0.8 },
            { source: 'wh1', target: 'rpt1', strength: 0.8 },
        ]
    });

    useEffect(() => {
        if (data && data.nodes.length > 0) {
            setGraphData(data as { nodes: SimulationNode[], links: { source: string; target: string; strength?: number }[] });
        }
    }, [data]);

    // Use Worker-based physics hook
    const { nodesMeta, physicsState, reheat } = useNexusGraph(containerRef, graphData as { nodes: SimulationNode[], links: { source: string; target: string }[] });

    useEffect(() => {
        let frameId: number;
        let isMounted = true;
        
        const render = () => {
            if (!isMounted || !canvasRef.current || !containerRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const state = physicsState.current;
            if (!state || !state.buffer) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            // Handle high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            
            // Only resize if dimensions changed to avoid clearing too often
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
            }

            ctx.clearRect(0, 0, width, height);
            
            // Draw Links
            ctx.lineWidth = 2;
            ctx.strokeStyle = theme.chart.grid; 

            for (let i = 0; i < state.links.length; i++) {
                const link = state.links[i];
                const idxS = link.sourceIndex * NODE_STRIDE;
                const idxT = link.targetIndex * NODE_STRIDE;
                
                // Bounds checks
                if (idxS >= state.buffer.length || idxT >= state.buffer.length) continue;

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
                if (idx >= state.buffer.length) continue;

                const x = state.buffer[idx];
                const y = state.buffer[idx+1];
                const type = state.buffer[idx+5];
                
                ctx.beginPath();
                ctx.arc(x, y, type === 0 ? 30 : 20, 0, Math.PI * 2);
                ctx.fillStyle = type === 0 ? theme.chart.colors.primary : type === 1 ? theme.chart.colors.secondary : type === 2 ? theme.chart.colors.success : theme.chart.colors.warning;
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = theme.surface.default.includes('slate-900') ? '#1e293b' : '#fff';
                ctx.stroke();
                
                if (nodesMeta && nodesMeta[i]) {
                    ctx.fillStyle = theme.chart.text;
                    ctx.font = '10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(nodesMeta[i].label, x, y + 40);
                }
            }

            if (isAnimating) {
                frameId = requestAnimationFrame(render);
            }
        };

        if (isAnimating) {
            frameId = requestAnimationFrame(render);
        }

        return () => {
            isMounted = false;
            cancelAnimationFrame(frameId);
        };
    }, [isAnimating, physicsState, nodesMeta, mode, theme]);

    return (
        <div ref={containerRef} className={cn("w-full h-full relative", theme.surface.highlight)}>
            <canvas ref={canvasRef} className="block w-full h-full"/>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => reheat()} className={cn("p-2 border rounded-lg shadow-sm transition-colors", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)}>
                    <RefreshCw className="h-5 w-5"/>
                </button>
                <button onClick={() => setIsAnimating(!isAnimating)} className={cn("p-2 border rounded-lg shadow-sm transition-colors", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)}>
                    {isAnimating ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
                </button>
            </div>
            <div className={cn("absolute bottom-6 left-6 p-4 backdrop-blur-sm rounded-lg border shadow-sm text-xs space-y-2 pointer-events-none bg-opacity-90", theme.surface.default, theme.border.default)}>
                <div className={cn("font-bold uppercase mb-1", theme.text.tertiary)}>Legend</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full" style={{backgroundColor: theme.chart.colors.primary}}></div> Source System</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full" style={{backgroundColor: theme.chart.colors.secondary}}></div> Storage / Warehouse</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full" style={{backgroundColor: theme.chart.colors.success}}></div> Transformation</div>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full" style={{backgroundColor: theme.chart.colors.warning}}></div> Report / Output</div>
            </div>
        </div>
    );
};
