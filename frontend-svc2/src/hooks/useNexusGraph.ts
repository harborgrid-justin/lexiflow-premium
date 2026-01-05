/**
 * @module hooks/useNexusGraph
 * @category Hooks - Graph Visualization
 * @description Force-directed graph physics hook using Web Worker for non-blocking simulation. Creates blob
 * worker with inlined physics code (repulsion, spring forces, damping, center pull, alpha decay) for
 * zero-copy ArrayBuffer transfers. Manages node positions via SharedArrayBuffer pattern, provides reheat
 * for re-animation, and tracks stability with isStable flag when alpha decays below threshold.
 *
 * SYSTEMS ENGINEERING INNOVATION:
 * Uses "blob worker" pattern to inject physics code directly into worker thread without separate file
 * build steps. This keeps the physics calculation completely non-blocking while avoiding CORS issues
 * with worker imports.
 *
 * NO THEME USAGE: Graph physics simulation utility hook
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import {
  NODE_STRIDE,
  NexusLink,
  NexusPhysics,
  SerializedNode,
  SimulationNode,
} from "@/utils/nexusPhysics";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a blob-based Web Worker with inlined physics simulation code.
 * This pattern avoids CORS issues with worker imports and keeps physics non-blocking.
 * @returns Worker instance ready to receive simulation messages
 */
const createPhysicsWorker = (): Worker | null => {
  // Check if Worker API is available (not available in SSR)
  if (typeof Worker === "undefined") {
    console.warn("[PhysicsWorker] Worker API not available (SSR mode)");
    return null;
  }

  const code = `
    const NODE_STRIDE = ${NODE_STRIDE};

    // Inlined simplified physics for worker context
    const REPULSION = 1000;
    const SPRING_LENGTH = 180;
    const SPRING_STRENGTH = 0.05;
    const DAMPING = 0.85;
    const CENTER_PULL = 0.02;
    const ALPHA_DECAY = 0.01;

    self.onmessage = function(e) {
      const { buffer, links, count, width, height, alpha } = e.data;
      const f32 = new Float32Array(buffer);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Repulsion
      for (let i = 0; i < count; i++) {
        const idxI = i * NODE_STRIDE;
        const dxCenter = centerX - f32[idxI];
        const dyCenter = centerY - f32[idxI + 1];
        f32[idxI + 2] += dxCenter * CENTER_PULL * alpha;
        f32[idxI + 3] += dyCenter * CENTER_PULL * alpha;

        for (let j = i + 1; j < count; j++) {
          const idxJ = j * NODE_STRIDE;
          const dx = f32[idxI] - f32[idxJ];
          const dy = f32[idxI + 1] - f32[idxJ + 1];
          let distSq = dx * dx + dy * dy;
          if (distSq < 0.1) distSq = 0.1;

          const force = (REPULSION / distSq) * alpha;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          f32[idxI + 2] += fx;
          f32[idxI + 3] += fy;
          f32[idxJ + 2] -= fx;
          f32[idxJ + 3] -= fy;
        }
      }

      // 2. Links
      for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const idxS = link.sourceIndex * NODE_STRIDE;
          const idxT = link.targetIndex * NODE_STRIDE;
          const dx = f32[idxT] - f32[idxS];
          const dy = f32[idxT + 1] - f32[idxS + 1];
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const stretch = dist - SPRING_LENGTH;
          const force = stretch * SPRING_STRENGTH * link.strength * alpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          f32[idxS + 2] += fx;
          f32[idxS + 3] += fy;
          f32[idxT + 2] -= fx;
          f32[idxT + 3] -= fy;
      }

      // 3. Integration
      for (let i = 0; i < count; i++) {
          const idx = i * NODE_STRIDE;
          f32[idx + 2] *= DAMPING;
          f32[idx + 3] *= DAMPING;
          f32[idx] += f32[idx + 2];
          f32[idx + 1] += f32[idx + 3];

          // Bounds
          const r = f32[idx + 4];
          if (f32[idx] < r) { f32[idx] = r; f32[idx + 2] *= -0.5; }
          if (f32[idx] > width - r) { f32[idx] = width - r; f32[idx + 2] *= -0.5; }
          if (f32[idx + 1] < r) { f32[idx + 1] = r; f32[idx + 3] *= -0.5; }
          if (f32[idx + 1] > height - r) { f32[idx + 1] = height - r; f32[idx + 3] *= -0.5; }
      }

      const nextAlpha = Math.max(0, alpha * (1 - ALPHA_DECAY));

      // Transfer buffer back
      self.postMessage({ buffer, alpha: nextAlpha }, [buffer]);
    };
  `;

  try {
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url); // Immediate cleanup
    return worker;
  } catch (error) {
    console.error("[PhysicsWorker] Failed to create worker:", error);
    return null;
  }
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useNexusGraph hook
 */
export interface UseNexusGraphReturn {
  /** Serialized node positions for rendering */
  nodesMeta: SerializedNode[];
  /** Whether physics simulation is stable */
  isStable: boolean;
  /** Reheat simulation for re-animation */
  reheat: () => void;
  /** Physics state ref */
  physicsState: React.MutableRefObject<{
    buffer: Float32Array;
    links: NexusLink[];
    idMap: Map<string, number>;
    count: number;
    alpha: number;
    width: number;
    height: number;
  }>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Force-directed graph physics using Web Worker.
 *
 * @param containerRef - Ref to container element
 * @param initialData - Initial nodes and links
 * @returns Object with node positions and stability state
 */
export function useNexusGraph(
  containerRef: React.RefObject<HTMLDivElement>,
  initialData: {
    nodes: SimulationNode[];
    links: { source: string; target: string }[];
  }
): UseNexusGraphReturn {
  const physicsState = useRef({
    buffer: new Float32Array(0),
    links: [] as NexusLink[],
    idMap: new Map<string, number>(),
    count: 0,
    alpha: 0,
    width: 800,
    height: 600,
  });

  const workerRef = useRef<Worker | null>(null);
  const [nodesMeta, setNodesMeta] = useState<SerializedNode[]>([]);
  const [isStable, setIsStable] = useState(false);
  const requestRef = useRef<number>(0);

  const tickWorker = useCallback(() => {
    if (!workerRef.current) return;
    const state = physicsState.current;

    // Transfer ownership of the buffer to the worker (Zero-Copy)
    workerRef.current.postMessage(
      {
        buffer: state.buffer.buffer, // Transfer the ArrayBuffer
        links: state.links,
        count: state.count,
        width: state.width,
        height: state.height,
        alpha: state.alpha,
      },
      [state.buffer.buffer]
    );
  }, []);

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // 1. Initialize System State
    const { buffer, idMap, meta } = NexusPhysics.initSystem(
      initialData.nodes,
      width,
      height
    );

    // 2. Map Links
    const processedLinks: NexusLink[] = initialData.links
      .map((l) => {
        const sIdx = idMap.get(l.source);
        const tIdx = idMap.get(l.target);
        if (sIdx !== undefined && tIdx !== undefined) {
          return {
            sourceIndex: sIdx,
            targetIndex: tIdx,
            strength: (l as Record<string, unknown>).strength || 1,
          };
        }
        return null;
      })
      .filter((l): l is NexusLink => l !== null);

    physicsState.current = {
      buffer,
      links: processedLinks,
      idMap,
      count: meta.length,
      alpha: 1,
      width,
      height,
    };
    setNodesMeta(meta);
    setIsStable(false);

    // 3. Spawn Worker
    const worker = createPhysicsWorker();
    if (!worker) {
      console.warn(
        "[useNexusGraph] Worker not available, physics simulation disabled"
      );
      setIsStable(true);
      return;
    }

    workerRef.current = worker;
    workerRef.current.onmessage = (e) => {
      const { buffer: newBuffer, alpha: newAlpha } = e.data;
      physicsState.current.buffer = new Float32Array(newBuffer);
      physicsState.current.alpha = newAlpha;

      if (newAlpha > NexusPhysics.MIN_ALPHA) {
        requestRef.current = requestAnimationFrame(tickWorker);
      } else {
        setIsStable(true);
      }
    };

    // Kickoff
    tickWorker();

    return () => {
      workerRef.current?.terminate();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [initialData, containerRef, tickWorker]);

  const reheat = useCallback(() => {
    physicsState.current.alpha = 0.5;
    setIsStable(false);
    if (workerRef.current) tickWorker();
  }, [tickWorker]);

  return { nodesMeta, isStable, reheat, physicsState };
}
