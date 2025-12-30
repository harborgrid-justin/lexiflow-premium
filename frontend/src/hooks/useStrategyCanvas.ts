/**
 * useStrategyCanvas.ts
 *
 * Custom hook encapsulating all Strategy Canvas interaction logic.
 * Manages drag, pan, zoom, context menu, and keyboard shortcuts.
 *
 * @module hooks/useStrategyCanvas
 */

import { ContextMenuItem } from "@/components/ui/molecules/ContextMenu/ContextMenu";
import {
  AddConnectionCommand,
  AddNodeCommand,
  DeleteConnectionCommand,
  DeleteNodeCommand,
  MoveNodeCommand,
  UpdateNodeCommand,
} from "@/services/infrastructure/commandHistory";
import { CANVAS_CONSTANTS } from "@/types/canvas-constants";
import {
  createTypedNode,
  NodeType,
  TypedWorkflowNode,
  WorkflowConnection,
} from "@/types/workflow-types";
import {
  calculateCanvasMousePosition,
  calculateDropPosition,
  generateCanvasContextMenuItems,
  generateNodeContextMenuItems,
} from "@features/litigation/strategy/utils";
import React, { useCallback, useRef, useState } from "react";
import { useCommandHistory } from "./useCommandHistory";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

export interface UseStrategyCanvasProps {
  initialNodes?: TypedWorkflowNode[];
  initialConnections?: WorkflowConnection[];
  onNodesChange?: (nodes: TypedWorkflowNode[]) => void;
  onConnectionsChange?: (connections: WorkflowConnection[]) => void;
}

export interface UseStrategyCanvasReturn {
  // State
  nodes: TypedWorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  scale: number;
  pan: { x: number; y: number };
  isSidebarOpen: boolean;
  isPropertiesOpen: boolean;
  draggingNodeId: string | null;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;

  // Actions
  addNode: (
    type: NodeType,
    x: number,
    y: number,
    label?: string,
    litType?: string
  ) => string;
  updateNode: (id: string, updates: Partial<TypedWorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addConnection: (from: string, to: string, fromPort?: string) => void;
  updateConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  deleteConnection: (id: string) => void;

  setSelectedNodeId: (id: string | null) => void;
  setSelectedConnectionId: (id: string | null) => void;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  setPan: (pan: { x: number; y: number }) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsPropertiesOpen: (open: boolean) => void;
  setContextMenu: (
    menu: { x: number; y: number; items: ContextMenuItem[] } | null
  ) => void;

  // Event Handlers
  onDrop: (event: React.DragEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseDownNode: (e: React.MouseEvent, id: string) => void;
  handleSelectConnection: (id: string) => void;
  handleBackgroundClick: () => void;
  handleDeleteNode: (id: string) => void;
  handleContextMenu: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Refs
  canvasRef: React.RefObject<HTMLDivElement | null>;
  dragOffset: { x: number; y: number };
}

/**
 * Strategy Canvas hook with full interaction logic
 */
export function useStrategyCanvas({
  initialNodes = [],
  initialConnections = [],
  onNodesChange,
  onConnectionsChange,
}: UseStrategyCanvasProps = {}): UseStrategyCanvasReturn {
  const [nodes, setNodes] = useState<TypedWorkflowNode[]>(initialNodes);
  const [connections, setConnections] =
    useState<WorkflowConnection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [scale, setScale] = useState<number>(CANVAS_CONSTANTS.DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { execute, undo, redo, canUndo, canRedo } = useCommandHistory();

  // Internal setters that trigger callbacks
  const updateNodes = useCallback(
    (
      updater:
        | TypedWorkflowNode[]
        | ((prev: TypedWorkflowNode[]) => TypedWorkflowNode[])
    ) => {
      setNodes((prev) => {
        const newNodes =
          typeof updater === "function" ? updater(prev) : updater;
        onNodesChange?.(newNodes);
        return newNodes;
      });
    },
    [onNodesChange]
  );

  const updateConnections = useCallback(
    (
      updater:
        | WorkflowConnection[]
        | ((prev: WorkflowConnection[]) => WorkflowConnection[])
    ) => {
      setConnections((prev) => {
        const newConns =
          typeof updater === "function" ? updater(prev) : updater;
        onConnectionsChange?.(newConns);
        return newConns;
      });
    },
    [onConnectionsChange]
  );

  // Node Operations
  const addNode = useCallback(
    (
      type: NodeType,
      x: number,
      y: number,
      label?: string,
      litType?: string
    ): string => {
      const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNode = createTypedNode(type, label || type, x, y, id);

      if (litType && newNode.type === "Decision") {
        newNode.config.litigationType = litType;
      }

      const command = new AddNodeCommand(
        newNode,
        (node) => updateNodes((prev) => [...prev, node]),
        (id) => updateNodes((prev) => prev.filter((n) => n.id !== id))
      );

      execute(command);
      return id;
    },
    [execute, updateNodes]
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<TypedWorkflowNode>) => {
      const oldNode = nodes.find((n) => n.id === id);
      if (!oldNode) return;

      const command = new UpdateNodeCommand(
        id,
        { ...oldNode },
        updates,
        (nodeId, upd) =>
          updateNodes(
            (prev) =>
              prev.map((n) =>
                n.id === nodeId ? ({ ...n, ...upd } as TypedWorkflowNode) : n
              ) as TypedWorkflowNode[]
          )
      );

      execute(command);
    },
    [nodes, execute, updateNodes]
  );

  const deleteNode = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      const relatedConnections = connections.filter(
        (c) => c.from === id || c.to === id
      );

      const command = new DeleteNodeCommand(
        node,
        relatedConnections,
        (n) => updateNodes((prev) => [...prev, n]),
        (nodeId) => updateNodes((prev) => prev.filter((n) => n.id !== nodeId)),
        (conn) => updateConnections((prev) => [...prev, conn]),
        (connId) =>
          updateConnections((prev) => prev.filter((c) => c.id !== connId))
      );

      execute(command);

      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [
      nodes,
      connections,
      selectedNodeId,
      execute,
      updateNodes,
      updateConnections,
    ]
  );

  // Connection Operations
  const addConnection = useCallback(
    (from: string, to: string, fromPort?: string) => {
      const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newConnection: WorkflowConnection = { id, from, to, fromPort };

      const command = new AddConnectionCommand(
        newConnection,
        (conn) => updateConnections((prev) => [...prev, conn]),
        (connId) =>
          updateConnections((prev) => prev.filter((c) => c.id !== connId))
      );

      execute(command);
    },
    [execute, updateConnections]
  );

  const updateConnection = useCallback(
    (id: string, updates: Partial<WorkflowConnection>) => {
      updateConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    [updateConnections]
  );

  const deleteConnection = useCallback(
    (id: string) => {
      const conn = connections.find((c) => c.id === id);
      if (!conn) return;

      const command = new DeleteConnectionCommand(
        conn,
        (c) => updateConnections((prev) => [...prev, c]),
        (connId) =>
          updateConnections((prev) => prev.filter((c) => c.id !== connId))
      );

      execute(command);

      if (selectedConnectionId === id) setSelectedConnectionId(null);
    },
    [connections, selectedConnectionId, execute, updateConnections]
  );

  // Event Handlers
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      const litType = event.dataTransfer.getData("application/litigation-node");

      if (!type && !litType) return;
      if (!canvasRef.current) return;

      const { x, y } = calculateDropPosition(
        event,
        canvasRef.current,
        pan,
        scale
      );
      const finalType: NodeType = (type || "Task") as NodeType;
      const id = addNode(finalType, x, y, litType || finalType);

      setSelectedNodeId(id);
      setSelectedConnectionId(null);
      setIsPropertiesOpen(true);
    },
    [pan, scale, addNode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNodeId && canvasRef.current && dragStartPos) {
        const pos = calculateCanvasMousePosition(
          e,
          canvasRef.current,
          pan,
          scale
        );
        updateNode(draggingNodeId, {
          x: pos.x - dragOffset.x,
          y: pos.y - dragOffset.y,
        });
      }
    },
    [draggingNodeId, dragOffset, scale, pan, updateNode, dragStartPos]
  );

  const handleMouseDownNode = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === id);
      if (node && canvasRef.current) {
        const mousePos = calculateCanvasMousePosition(
          e,
          canvasRef.current,
          pan,
          scale
        );
        setDragOffset({ x: mousePos.x - node.x, y: mousePos.y - node.y });
        setDragStartPos({ x: node.x, y: node.y });
        setDraggingNodeId(id);
        setSelectedNodeId(id);
        setSelectedConnectionId(null);
        setIsPropertiesOpen(true);
      }
    },
    [nodes, pan, scale]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingNodeId && dragStartPos) {
      const node = nodes.find((n) => n.id === draggingNodeId);
      if (node && (node.x !== dragStartPos.x || node.y !== dragStartPos.y)) {
        // Create move command for undo/redo
        const command = new MoveNodeCommand(
          draggingNodeId,
          dragStartPos,
          { x: node.x, y: node.y },
          (id, updates) =>
            updateNodes(
              (prev) =>
                prev.map((n) =>
                  n.id === id ? ({ ...n, ...updates } as TypedWorkflowNode) : n
                ) as TypedWorkflowNode[]
            )
        );
        execute(command);
      }
    }
    setDraggingNodeId(null);
    setDragStartPos(null);
  }, [draggingNodeId, dragStartPos, nodes, execute, updateNodes]);

  const handleSelectConnection = useCallback((id: string) => {
    setSelectedNodeId(null);
    setSelectedConnectionId(id);
    setIsPropertiesOpen(true);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setContextMenu(null);
  }, []);

  const handleDeleteNode = useCallback(
    (id: string) => {
      deleteNode(id);
    },
    [deleteNode]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const nodeId = target
        .closest("[data-drag-id]")
        ?.getAttribute("data-drag-id");

      if (nodeId) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const items = generateNodeContextMenuItems(
          nodeId,
          (id) => {
            setSelectedNodeId(id);
            setIsPropertiesOpen(true);
          },
          (id) => {
            const n = nodes.find((n) => n.id === id);
            if (n)
              addNode(
                n.type,
                n.x + CANVAS_CONSTANTS.DUPLICATE_OFFSET,
                n.y + CANVAS_CONSTANTS.DUPLICATE_OFFSET,
                n.label
              );
          },
          deleteNode
        );
        setContextMenu({ x: e.clientX, y: e.clientY, items });
      } else {
        if (!canvasRef.current) return;
        const position = calculateCanvasMousePosition(
          e,
          canvasRef.current,
          pan,
          scale
        );
        const items = generateCanvasContextMenuItems(position, addNode);
        setContextMenu({ x: e.clientX, y: e.clientY, items });
      }
    },
    [nodes, pan, scale, addNode, deleteNode]
  );

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: () => selectedNodeId && deleteNode(selectedNodeId),
    onDuplicate: () => {
      if (selectedNodeId) {
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          addNode(
            node.type,
            node.x + CANVAS_CONSTANTS.DUPLICATE_OFFSET,
            node.y + CANVAS_CONSTANTS.DUPLICATE_OFFSET,
            node.label
          );
        }
      }
    },
    onZoomIn: () =>
      setScale((s) =>
        Math.min(CANVAS_CONSTANTS.MAX_ZOOM, s + CANVAS_CONSTANTS.ZOOM_STEP)
      ),
    onZoomOut: () =>
      setScale((s) =>
        Math.max(CANVAS_CONSTANTS.MIN_ZOOM, s - CANVAS_CONSTANTS.ZOOM_STEP)
      ),
    onZoomReset: () => setScale(CANVAS_CONSTANTS.DEFAULT_ZOOM),
  });

  return {
    // State
    nodes,
    connections,
    selectedNodeId,
    selectedConnectionId,
    scale,
    pan,
    isSidebarOpen,
    isPropertiesOpen,
    draggingNodeId,
    contextMenu,
    dragOffset,

    // Actions
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    updateConnection,
    deleteConnection,

    setSelectedNodeId,
    setSelectedConnectionId,
    setScale,
    setPan,
    setIsSidebarOpen,
    setIsPropertiesOpen,
    setContextMenu,

    // Event Handlers
    onDrop,
    handleMouseMove,
    handleMouseDownNode,
    handleSelectConnection,
    handleBackgroundClick,
    handleDeleteNode,
    handleContextMenu,
    handleMouseUp,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,

    // Refs
    canvasRef,
  };
}
