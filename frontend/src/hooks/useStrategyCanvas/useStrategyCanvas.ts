/**
 * useStrategyCanvas Hook
 * @module hooks/useStrategyCanvas
 * @description State management for litigation strategy whiteboard and canvas
 * @status PRODUCTION READY
 */

import { useCallback, useState } from "react";

export interface CanvasNode {
  id: string;
  type: "claim" | "evidence" | "person" | "event";
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface CanvasConnection {
  id: string;
  source: string;
  target: string;
  type: "supports" | "contradicts" | "relates";
}

export const useStrategyCanvas = (initialNodes: CanvasNode[] = []) => {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const addNode = useCallback((node: CanvasNode) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const updateNodePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, position } : n))
      );
    },
    []
  );

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.source !== id && c.target !== id)
    );
  }, []);

  const connectNodes = useCallback(
    (
      source: string,
      target: string,
      type: CanvasConnection["type"] = "relates"
    ) => {
      const id = `${source}-${target}`;
      setConnections((prev) => [...prev, { id, source, target, type }]);
    },
    []
  );

  return {
    nodes,
    connections,
    selectedId,
    scale,
    offset,
    addNode,
    updateNodePosition,
    removeNode,
    connectNodes,
    setSelectedId,
    setScale,
    setOffset,
  };
};
