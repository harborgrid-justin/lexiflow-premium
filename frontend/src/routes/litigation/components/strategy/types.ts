/**
 * types.ts
 *
 * Shared types for the Litigation module.
 *
 * @module components/litigation/types
 */

import { type Playbook } from "@/types/playbook";
import {
  type NodeType,
  type WorkflowConnection,
  type WorkflowNode,
} from "@/types/workflow-types";

export type ZoomLevel = "Quarter" | "Month" | "Week" | "Day";

export interface StrategyCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  addNode: (
    type: NodeType,
    x: number,
    y: number,
    label?: string,
    litType?: string
  ) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addConnection: (from: string, to: string, fromPort?: string) => void;
  updateConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  deleteConnection: (id: string) => void;
}

export interface LitigationScheduleViewProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  addNode: (type: NodeType, x: number, y: number, label?: string) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
}

export interface LitigationPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LitigationPropertiesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: WorkflowNode | null;
  selectedConnection: WorkflowConnection | null;
  onUpdateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  onDeleteNode: (id: string) => void;
  onUpdateConnection: (
    id: string,
    updates: Partial<WorkflowConnection>
  ) => void;
  onDeleteConnection: (id: string) => void;
}

export interface LitigationBuilderProps {
  navigateToCaseTab: (caseId: string, tab: string) => void;
}

export interface PlaybookLibraryProps {
  onApply: (playbook: Playbook) => void;
}

export interface PlaybookDetailProps {
  playbook: Playbook;
  onClose: () => void;
  onApply: (playbook: Playbook) => void;
}

export interface StrategyToolbarProps {
  scale: number;
  setScale: (scale: number | ((s: number) => number)) => void;
  onToggleSidebar: () => void;
  onZoomToFit: () => void;
  onExport: (format: "svg" | "markdown") => void;
}

export interface AICommandBarProps {
  onGenerate: (graph: { nodes: unknown[]; connections: unknown[] }) => void;
}

export interface MinimapProps {
  nodes: WorkflowNode[];
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  };
  onPan: (pos: { x: number; y: number }) => void;
}
