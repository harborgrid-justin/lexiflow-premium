
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { NODE_STRIDE } from '../../utils/nexusPhysics';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Case, Party, EvidenceItem } from '../../types';
import { GraphOverlay } from './GraphOverlay';
import { useNexusGraph } from '../../hooks/useNexusGraph';

interface NexusGraphProps {
  caseData: Case;
  parties: Party[];
  evidence: EvidenceItem[];
}

export const NexusGraph: React.FC<NexusGraphProps> = ({ caseData, parties, evidence }) => {
  const { theme, mode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Conflict 12: Resize Observer for precise dimensions
  useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const nodes = [
        { id: 'root', type: 'root', label: caseData.title.substring(0, 20) + '...' },
        ...parties.map(p => ({ id: p.id, type: p.type === 'Corporation' ? 'org' : 'party', label: p.name })),
        ...evidence.map(e => ({ id: e.id, type: 'evidence', label: e.title.substring(0, 15) + '...' }))
    ];
    const links = [
        ...parties.map(p => ({ source: 'root', target: p.id, strength: 0.8 })),
        ...evidence.map(e => ({ source: 'root', target: e.id, strength: 0.3 }))
    ];
    return { nodes, links };
  }, [caseData, parties, evidence]);

  // Hook receives updated dimensions to recenter physics
  const { nodesMeta, isStable, reheat, physicsState } = useNexusGraph(containerRef, graphData);

  const domRefs = useRef<Map<string, SVGGElement>>(new Map());
  const linkRefs = useRef<SVGLineElement[]>([]);

  useEffect(() => {
      let frameId: number;
      const syncDOM = () => {
          const state = physicsState.current;
          if (!state.buffer) return;

          for (let i = 0; i < state.count; i++) {
            const idx = i * NODE_STRIDE;
            const x = state.buffer[idx];
            const y = state.buffer[idx + 1];
            const el = domRefs.current.get(nodesMeta[i]?.id);
            if (el) el.setAttribute('transform', `translate(${x},${y})`);
          }
          
          for (let i = 0; i < state.links.length; i++) {
            const link = state.links[i];
            const idxS = link.sourceIndex * NODE_STRIDE;
            const idxT = link.targetIndex * NODE_STRIDE;
            const line = linkRefs.current[i];
            if (line) {
                line.setAttribute('x1', state.buffer[idxS].toString());
                line.setAttribute('y1', state.buffer[idxS + 1].toString());
                line.setAttribute('x2', state.buffer[idxT].toString());
                line.setAttribute('y2', state.buffer[idxT + 1].toString());
            }
          }
          if (!isStable) frameId = requestAnimationFrame(syncDOM);
      };
      if (!isStable) frameId = requestAnimationFrame(syncDOM);
      return () => cancelAnimationFrame(frameId);
  }, [isStable, nodesMeta]);

  const getStroke = (type: string) => {
      if (type === 'party') return '#3b82f6';
      if (type === 'org') return '#8b5cf6';
      if (type === 'evidence') return '#f59e0b';
      return mode === 'dark' ? '#f8fafc' : '#1e293b';
  };

  return (
    <div ref={containerRef} className={cn("h-full flex flex-col relative overflow-hidden rounded-xl border shadow-inner", theme.surface, theme.border.default)}>
        <GraphOverlay scale={scale} setScale={setScale} onReheat={reheat} isStable={isStable} nodeCount={nodesMeta.length} />
        <div className="flex-1 overflow-hidden cursor-move">
            <svg 
                className="w-full h-full touch-none"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
                <g transform={`scale(${scale})`}>
                    {physicsState.current.links.map((_, i) => (
                        <line key={`link-${i}`} ref={el => { if(el) linkRefs.current[i] = el; }} stroke={mode === 'dark' ? '#475569' : '#cbd5e1'} strokeWidth="1.5" strokeOpacity="0.4" />
                    ))}
                    {nodesMeta.map((node) => (
                        <g key={node.id} ref={el => { if (el) domRefs.current.set(node.id, el); }} className="cursor-pointer hover:opacity-80">
                            <circle r={node.type === 'root' ? 40 : node.type === 'org' ? 30 : 18} fill={node.type === 'root' ? getStroke('root') : (mode === 'dark' ? '#0f172a' : "white")} stroke={getStroke(node.type)} strokeWidth={node.type === 'root' ? 0 : 3} />
                            <text y={node.type === 'root' ? 46 : 32} textAnchor="middle" className={cn("text-[10px] font-bold uppercase", mode === 'dark' ? "fill-slate-300" : "fill-slate-600")}>{node.label}</text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    </div>
  );
};
