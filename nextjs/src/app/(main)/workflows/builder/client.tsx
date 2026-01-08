'use client';

/**
 * Workflow Builder Client Component
 *
 * Interactive drag-and-drop workflow designer.
 * Features:
 * - Drag-and-drop node placement
 * - Connection drawing between nodes
 * - Node configuration panel
 * - Zoom and pan controls
 *
 * @module app/(main)/workflows/builder/client
 */

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Copy,
  Settings,
  Plus,
  CheckCircle,
  Circle,
  GitBranch,
  Clock,
  Users,
  Bell,
  Mail,
  Webhook,
  FileText,
  Repeat,
  Zap,
  GripVertical,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowTemplate, WorkflowStep, WorkflowStepType } from '@/types/workflow-schemas';
import { STEP_TYPE_LABELS } from '@/types/workflow-schemas';

// =============================================================================
// Types
// =============================================================================

interface WorkflowBuilderClientProps {
  template: WorkflowTemplate | null;
}

interface NodePosition {
  x: number;
  y: number;
}

interface BuilderNode {
  id: string;
  type: WorkflowStepType;
  name: string;
  position: NodePosition;
  config: Record<string, unknown>;
}

interface BuilderConnection {
  id: string;
  from: string;
  to: string;
}

// =============================================================================
// Node Palette Items
// =============================================================================

const NODE_PALETTE: { type: WorkflowStepType; icon: React.ReactNode; color: string }[] = [
  { type: 'task', icon: <CheckCircle className="h-4 w-4" />, color: 'blue' },
  { type: 'approval', icon: <Users className="h-4 w-4" />, color: 'purple' },
  { type: 'notification', icon: <Bell className="h-4 w-4" />, color: 'amber' },
  { type: 'condition', icon: <GitBranch className="h-4 w-4" />, color: 'indigo' },
  { type: 'delay', icon: <Clock className="h-4 w-4" />, color: 'slate' },
  { type: 'parallel', icon: <Zap className="h-4 w-4" />, color: 'orange' },
  { type: 'email', icon: <Mail className="h-4 w-4" />, color: 'green' },
  { type: 'webhook', icon: <Webhook className="h-4 w-4" />, color: 'red' },
  { type: 'document_generation', icon: <FileText className="h-4 w-4" />, color: 'cyan' },
  { type: 'loop', icon: <Repeat className="h-4 w-4" />, color: 'pink' },
];

// =============================================================================
// Palette Item Component
// =============================================================================

function PaletteItem({
  type,
  icon,
  color,
  onDragStart,
}: {
  type: WorkflowStepType;
  icon: React.ReactNode;
  color: string;
  onDragStart: (type: WorkflowStepType) => void;
}) {
  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50',
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(type)}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab transition-colors',
        colorStyles[color]
      )}
    >
      <GripVertical className="h-4 w-4 opacity-50" />
      {icon}
      <span className="text-sm font-medium">{STEP_TYPE_LABELS[type]}</span>
    </div>
  );
}

// =============================================================================
// Canvas Node Component
// =============================================================================

function CanvasNode({
  node,
  selected,
  onSelect,
  onDelete,
}: {
  node: BuilderNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const typeColors: Record<WorkflowStepType, string> = {
    task: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    approval: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    notification: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    condition: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    delay: 'border-slate-500 bg-slate-50 dark:bg-slate-800',
    parallel: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    email: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    webhook: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    document_generation: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    loop: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20',
    automation: 'border-slate-500 bg-slate-50 dark:bg-slate-800',
  };

  return (
    <div
      className={cn(
        'absolute rounded-lg border-2 shadow-md transition-all cursor-pointer min-w-[160px]',
        typeColors[node.type],
        selected && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
            {STEP_TYPE_LABELS[node.type]}
          </span>
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{node.name}</p>
      </div>
      {/* Connection points */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />
    </div>
  );
}

// =============================================================================
// Properties Panel Component
// =============================================================================

function PropertiesPanel({
  node,
  onUpdate,
  onClose,
}: {
  node: BuilderNode;
  onUpdate: (updates: Partial<BuilderNode>) => void;
  onClose: () => void;
}) {
  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Properties</h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Step Name
          </label>
          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        {/* Type Info */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-400">{STEP_TYPE_LABELS[node.type]}</p>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={Math.round(node.position.x)}
              onChange={(e) =>
                onUpdate({ position: { ...node.position, x: Number(e.target.value) } })
              }
              className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={Math.round(node.position.y)}
              onChange={(e) =>
                onUpdate({ position: { ...node.position, y: Number(e.target.value) } })
              }
              className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Type-specific config */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Configuration
          </h4>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Additional configuration options for {STEP_TYPE_LABELS[node.type]} steps would appear here.
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Builder Component
// =============================================================================

export function WorkflowBuilderClient({ template }: WorkflowBuilderClientProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  // State
  const [nodes, setNodes] = useState<BuilderNode[]>(() => {
    if (template?.steps) {
      return template.steps.map((step) => ({
        id: step.id,
        type: step.type,
        name: step.name,
        position: step.position,
        config: step.config as Record<string, unknown>,
      }));
    }
    return [];
  });

  const [connections, setConnections] = useState<BuilderConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<WorkflowStepType | null>(null);
  const [zoom, setZoom] = useState(100);
  const [workflowName, setWorkflowName] = useState(template?.name || 'Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);

  // Handlers
  const handleDragStart = useCallback((type: WorkflowStepType) => {
    setDraggingType(type);
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggingType || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 80; // Offset for node width
      const y = e.clientY - rect.top - 30; // Offset for node height

      const newNode: BuilderNode = {
        id: `node-${Date.now()}`,
        type: draggingType,
        name: `New ${STEP_TYPE_LABELS[draggingType]}`,
        position: { x: Math.max(0, x), y: Math.max(0, y) },
        config: {},
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
      setDraggingType(null);
    },
    [draggingType]
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<BuilderNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setConnections((prev) =>
      prev.filter((conn) => conn.from !== nodeId && conn.to !== nodeId)
    );
    setSelectedNodeId(null);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows/templates"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-4 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Undo className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Redo className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Step Types
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Drag and drop steps onto the canvas
          </p>
          <div className="space-y-2">
            {NODE_PALETTE.map((item) => (
              <PaletteItem
                key={item.type}
                type={item.type}
                icon={item.icon}
                color={item.color}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <div
            ref={canvasRef}
            className="min-w-[2000px] min-h-[2000px] relative"
            style={{
              backgroundImage:
                'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: '0 0',
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onClick={() => setSelectedNodeId(null)}
          >
            {nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Start Building
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Drag and drop steps from the left panel to create your workflow
                  </p>
                </div>
              </div>
            ) : (
              nodes.map((node) => (
                <CanvasNode
                  key={node.id}
                  node={node}
                  selected={node.id === selectedNodeId}
                  onSelect={() => handleNodeSelect(node.id)}
                  onDelete={() => handleNodeDelete(node.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onUpdate={(updates) => handleNodeUpdate(selectedNode.id, updates)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
