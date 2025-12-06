
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NexusPhysics, SerializedNode, NODE_STRIDE, NexusLink } from '../utils/nexusPhysics';

export const useNexusGraph = (containerRef: React.RefObject<HTMLDivElement>, initialData: { nodes: any[], links: any[] }) => {
  const physicsState = useRef({
    buffer: new Float32Array(0),
    links: [] as NexusLink[],
    idMap: new Map<string, number>(),
    count: 0,
    alpha: 0,
    width: 800,
    height: 600
  });

  const [nodesMeta, setNodesMeta] = useState<SerializedNode[]>([]);
  const [isStable, setIsStable] = useState(false);
  const requestRef = useRef<number>(0);

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const { buffer, idMap, meta } = NexusPhysics.initSystem(initialData.nodes, width, height);
    
    // Ensure links have valid indices
    const processedLinks: NexusLink[] = initialData.links
        .map(l => {
            const sIdx = idMap.get(l.source);
            const tIdx = idMap.get(l.target);
            if (sIdx !== undefined && tIdx !== undefined) {
                return {
                    sourceIndex: sIdx,
                    targetIndex: tIdx,
                    strength: l.strength
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
        height
    };

    setNodesMeta(meta);
    setIsStable(false);
  }, [initialData]);

  const tick = useCallback(() => {
    const state = physicsState.current;
    if (state.alpha > NexusPhysics.MIN_ALPHA) {
        state.alpha = NexusPhysics.simulate(state.buffer, state.links, state.count, state.width, state.height, state.alpha);
        requestRef.current = requestAnimationFrame(tick);
    } else {
        setIsStable(true);
    }
  }, []);

  const reheat = useCallback(() => {
    physicsState.current.alpha = 0.5;
    setIsStable(false);
    cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
      if (!isStable && physicsState.current.count > 0) {
          requestRef.current = requestAnimationFrame(tick);
      }
      return () => cancelAnimationFrame(requestRef.current);
  }, [isStable, tick]);

  return { nodesMeta, isStable, reheat, physicsState };
};
