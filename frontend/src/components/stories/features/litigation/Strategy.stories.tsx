import { ToastProvider } from '@/providers';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import type { NodeType, WorkflowConnection, WorkflowNode } from '../../../../features/cases/components/workflow/builder/types';
import { StrategyCanvas } from '../../../../features/litigation/strategy/StrategyCanvas';

/**
 * Litigation Strategy components provide visual strategy planning tools including
 * node-based canvas, Gantt charts, outcome simulation, and playbook management.
 *
 * ## Features
 * - Visual strategy canvas with drag-and-drop
 * - Timeline and Gantt view
 * - Outcome simulation and probability modeling
 * - Playbook templates and library
 * - Strategic planning tools
 */

// ============================================================================
// STRATEGY CANVAS
// ============================================================================

const metaCanvas = {
  title: 'Litigation/Strategy/Canvas',
  component: StrategyCanvas,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: 'Node-based strategy canvas with drag-and-drop interface for visual litigation planning.',
      },
    },
  },
  tags: ['autodocs']
} satisfies Meta<typeof StrategyCanvas>;

export default metaCanvas;

type Story = StoryObj<typeof StrategyCanvas>;

// Mock data and handlers for StrategyCanvas
const mockInitialNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'Task' as NodeType,
    label: 'Discovery Phase',
    x: 100,
    y: 100,
    config: {
      litigationType: 'discovery',
      description: 'Initial discovery and evidence collection',
    },
  },
  {
    id: 'node-2',
    type: 'Decision' as NodeType,
    label: 'Motion Decision',
    x: 300,
    y: 100,
    config: {
      litigationType: 'motion',
      description: 'File motion or continue discovery',
    },
  },
];

const mockInitialConnections: WorkflowConnection[] = [
  {
    id: 'conn-1',
    from: 'node-1',
    to: 'node-2',
    label: 'Next Step',
  },
];

const StrategyCanvasStory = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(mockInitialNodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(mockInitialConnections);

  const addNode = (type: NodeType, x: number, y: number, label?: string, litType?: string): string => {
    const id = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id,
      type,
      label: label || type,
      x,
      y,
      config: litType ? { litigationType: litType } : {},
    };
    setNodes((prev) => [...prev, newNode]);
    return id;
  };

  const updateNode = (id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setConnections((prev) =>
      prev.filter((conn) => conn.from !== id && conn.to !== id)
    );
  };

  const addConnection = (from: string, to: string, fromPort?: string) => {
    const id = `conn-${Date.now()}`;
    const newConnection: WorkflowConnection = {
      id,
      from,
      to,
      label: fromPort || '',
    };
    setConnections((prev) => [...prev, newConnection]);
  };

  const updateConnection = (id: string, updates: Partial<WorkflowConnection>) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, ...updates } : conn))
    );
  };

  const deleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  };

  return (
    <StrategyCanvas
      nodes={nodes}
      connections={connections}
      addNode={addNode}
      updateNode={updateNode}
      deleteNode={deleteNode}
      addConnection={addConnection}
      updateConnection={updateConnection}
      deleteConnection={deleteConnection}
    />
  );
};

export const Default: Story = {
  render: () => <StrategyCanvasStory />,
};
