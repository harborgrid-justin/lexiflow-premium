/**
 * @module components/visual/NexusGraph
 * @category Visual
 * @description Interactive force-directed graph with physics simulation.
 *
 * BEST PRACTICES APPLIED:
 * - Component isolation with pure logic extracted (Practice #1)
 * - Custom hooks for reusability (Practice #3)
 * - Memoization for expensive computations (Practice #4)
 * - Type-safe architecture (Practice #5)
 * - Strict effect management (Practice #9)
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme and useChartTheme hooks for node colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useNexusGraph } from '@/hooks/useNexusGraph';
import { useChartTheme } from '@/components/organisms/ChartHelpers/ChartHelpers';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useViewportTransform } from '@/hooks/useViewportTransform';

// Components
import { GraphOverlay } from './GraphOverlay';

// Utils & Constants
import { cn } from '@/utils/cn';
import { NODE_STRIDE } from '@/utils/nexusPhysics';
import { buildGraphData, getNodeStrokeColor, getNodeRadius, getNodeLabelYOffset } from './utils/graphData';

// Types
import { Case, Party, EvidenceItem, NexusNodeData } from '@/types';

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

/**
 * Pure presentational component for graph visualization
 * State and logic delegated to custom hooks
 */
export const NexusGraph = React.memo<NexusGraphProps>(({
  caseData,
  parties,
  evidence,
  onNodeClick
}) => {
  const { theme, mode } = useTheme();
  const chartTheme = useChartTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state management (Practice #3)
  const dimensions = useResizeObserver(containerRef as React.RefObject<HTMLElement>);
  const panZoom = useViewportTransform(0.8);
  const { scale, pan } = panZoom.state;

  // Wrap setZoom to match React.Dispatch signature expected by GraphOverlay
  const setScale: React.Dispatch<React.SetStateAction<number>> = useCallback((action) => {
    if (typeof action === 'function') {
      panZoom.setZoom(action(scale));
    } else {
      panZoom.setZoom(action);
    }
  }, [panZoom, scale]);

  // Memoized graph data computation (Practice #4)
  const graphData = useMemo(
    () => buildGraphData(caseData, parties, evidence),
    [caseData, parties, evidence]
  );

  // Hook receives updated dimensions to recenter physics
  const { nodesMeta, isStable, reheat, physicsState } = useNexusGraph(
    containerRef as React.RefObject<HTMLDivElement>,
    graphData
  );

  const domRefs = useRef<Map<string, SVGGElement>>(new Map());
  const linkRefs = useRef<SVGLineElement[]>([]);

  // DOM synchronization effect (Practice #9: Strict effect management)
  useEffect(() => {
    if (isStable) return; // Early return when stable

    let frameId: number;

    const syncDOM = () => {
      const state = physicsState.current;
      if (!state.buffer) return;

      // Update node positions
      for (let i = 0; i < state.count; i++) {
        const idx = i * NODE_STRIDE;
        const x = state.buffer[idx];
        const y = state.buffer[idx + 1];
        const el = domRefs.current.get(nodesMeta[i]?.id);
        if (el) {
          el.setAttribute('transform', `translate(${x},${y})`);
        }
      }

      // Update link positions
      for (let i = 0; i < state.links.length; i++) {
        const link = state.links[i];
        const idxS = link.sourceIndex * NODE_STRIDE;
        const idxT = link.targetIndex * NODE_STRIDE;
        const line = linkRefs.current[i];

        // Safety check: ensure buffer indices are valid
        if (
          line &&
          state.buffer[idxS] !== undefined &&
          state.buffer[idxS + 1] !== undefined &&
          state.buffer[idxT] !== undefined &&
          state.buffer[idxT + 1] !== undefined
        ) {
          line.setAttribute('x1', state.buffer[idxS].toString());
          line.setAttribute('y1', state.buffer[idxS + 1].toString());
          line.setAttribute('x2', state.buffer[idxT].toString());
          line.setAttribute('y2', state.buffer[idxT + 1].toString());
        }
      }

      if (!isStable) {
        frameId = requestAnimationFrame(syncDOM);
      }
    };

    frameId = requestAnimationFrame(syncDOM);

    // Cleanup on unmount or when stable
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isStable, nodesMeta, physicsState]); // Exact dependencies

  // Memoized stroke color getter (Practice #4)
  const getStroke = useCallback(
    (type: string) => getNodeStrokeColor(type, chartTheme as { primary?: string; secondary?: string; accent?: string }, theme.chart.text),
    [chartTheme, theme.chart.text]
  );

  // Memoized node click handler (Practice #4)
  const handleNodeClick = useCallback(
    (index: number) => {
      onNodeClick(graphData.nodes[index]);
    },
    [graphData.nodes, onNodeClick]
  );

  // Render (Practice #8: Semantic HTML and accessibility)
  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full flex flex-col relative overflow-hidden rounded-xl border shadow-inner",
        theme.surface.default,
        theme.border.default
      )}
      role="img"
      aria-label={`Graph visualization of ${caseData.title} with ${nodesMeta.length} nodes`}
    >
      <GraphOverlay
        scale={scale}
        setScale={setScale}
        onReheat={reheat}
        isStable={isStable}
        nodeCount={nodesMeta.length}
      />
      <div className="flex-1 overflow-hidden cursor-move">
        <svg
          className="w-full h-full touch-none"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          aria-hidden="true"
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
            {/* Links */}
            {physicsState.current.links.map((link, i) => (
              <line
                key={`link-${link.sourceIndex}-${link.targetIndex}-${i}`}
                ref={el => { if (el) linkRefs.current[i] = el; }}
                stroke={theme.chart.grid}
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            ))}

            {/* Nodes */}
            {nodesMeta.map((node, i) => (
              // Use stable node ID for key (not index) for proper React reconciliation
              <g
                key={node.id}
                ref={el => { if (el) domRefs.current.set(node.id, el); }}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleNodeClick(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(i);
                  }
                }}
                aria-label={`${node.type} node: ${node.label}`}
              >
                <circle
                  r={getNodeRadius(node.type)}
                  fill={node.type === 'root' ? getStroke('root') : theme.surface.default}
                  stroke={getStroke(node.type)}
                  strokeWidth={node.type === 'root' ? 0 : 3}
                />
                <text
                  y={getNodeLabelYOffset(node.type)}
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] font-bold uppercase pointer-events-none",
                    mode === 'dark' ? "fill-slate-300" : "fill-slate-600"
                  )}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
});
