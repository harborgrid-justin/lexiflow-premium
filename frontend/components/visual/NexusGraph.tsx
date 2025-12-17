/**
 * @module components/visual/NexusGraph
 * @category Visual
 * @description Interactive force-directed graph with physics simulation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme and useChartTheme hooks for node colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef, useState, useEffect, useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNexusGraph } from '../../hooks/useNexusGraph';
import { useChartTheme } from '../common/ChartHelpers';

// Components
import { GraphOverlay } from './GraphOverlay';

// Utils & Constants
import { cn } from '../../utils/cn';
import { NODE_STRIDE, SimulationNode } from '../../utils/nexusPhysics';
import { buildGraphData, getNodeStrokeColor, getNodeRadius, getNodeLabelYOffset } from './utils';

// Types
import { Case, Party, EvidenceItem, NexusNodeData } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface NexusGraphProps {
  /** Case data for graph. */
  caseData: Case;
  /** List of parties. */
  parties: Party[];
  /** List of evidence items. */
  evidence: EvidenceItem[];
  /** Callback when node is clicked. */
  onNodeClick: (node: NexusNodeData) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NexusGraph: React.FC<NexusGraphProps> = ({ caseData, parties, evidence, onNodeClick }) => {
  const { theme, mode } = useTheme();
  const chartTheme = useChartTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.8);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [pan, setPan] = useState({ x: 0, y: 0 }); // New pan state
  
  // Resize Observer for precise dimensions
  useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
          }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => buildGraphData(caseData, parties, evidence), [caseData, parties, evidence]);

  // Hook receives updated dimensions to recenter physics
  const { nodesMeta, isStable, reheat, physicsState } = useNexusGraph(containerRef as React.RefObject<HTMLDivElement>, graphData);

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
            // Safety check: ensure buffer indices are valid
            if (line && state.buffer[idxS] !== undefined && state.buffer[idxS + 1] !== undefined && 
                state.buffer[idxT] !== undefined && state.buffer[idxT + 1] !== undefined) {
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

  const getStroke = (type: string) => getNodeStrokeColor(type, chartTheme, theme.chart.text);

  return (
    <div ref={containerRef} className={cn("h-full flex flex-col relative overflow-hidden rounded-xl border shadow-inner", theme.surface.default, theme.border.default)}>
        <GraphOverlay scale={scale} setScale={setScale} onReheat={reheat} isStable={isStable} nodeCount={nodesMeta.length} />
        <div className="flex-1 overflow-hidden cursor-move">
            <svg 
                className="w-full h-full touch-none"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
                <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
                    {physicsState.current.links.map((_, i) => (
                        <line key={`link-${i}`} ref={el => { if(el) linkRefs.current[i] = el; }} stroke={theme.chart.grid} strokeWidth="1.5" strokeOpacity="0.4" />
                    ))}
                    {nodesMeta.map((node, i) => (
                        <g 
                          key={node.id} 
                          ref={el => { if (el) domRefs.current.set(node.id, el); }} 
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => onNodeClick(graphData.nodes[i])}
                        >
                            <circle 
                                r={getNodeRadius(node.type)} 
                                fill={node.type === 'root' ? getStroke('root') : theme.surface.default} 
                                stroke={getStroke(node.type)}
                                strokeWidth={node.type === 'root' ? 0 : 3} 
                            />
                            <text y={getNodeLabelYOffset(node.type)} textAnchor="middle" className={cn("text-[10px] font-bold uppercase", mode === 'dark' ? "fill-slate-300" : "fill-slate-600")}>{node.label}</text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    </div>
  );
};
