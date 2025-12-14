/**
 * MemoizedComponents.tsx
 * 
 * Memoized node and connection components for performance optimization.
 * Prevents unnecessary re-renders when pan/zoom changes.
 * 
 * @module components/litigation/MemoizedComponents
 */

import React, { memo } from 'react';
import { TypedWorkflowNode } from './nodeTypes';
import { WorkflowConnection } from '../workflow/builder/types';

interface MemoizedNodeProps {
  node: TypedWorkflowNode;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  theme: any;
}

/**
 * Memoized Node Component
 * Only re-renders when node data, selection state, or dragging state changes
 */
export const MemoizedNode = memo<MemoizedNodeProps>(
  ({ node, isSelected, isDragging, onMouseDown, theme }) => {
    return (
      <div
        data-drag-id={node.id}
        onMouseDown={(e) => onMouseDown(e, node.id)}
        style={{
          position: 'absolute',
          left: node.x,
          top: node.y,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Node rendering implementation */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom equality check - only re-render if these change
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.node.x === nextProps.node.x &&
      prevProps.node.y === nextProps.node.y &&
      prevProps.node.label === nextProps.node.label &&
      prevProps.node.type === nextProps.node.type &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isDragging === nextProps.isDragging &&
      JSON.stringify(prevProps.node.config) === JSON.stringify(nextProps.node.config)
    );
  }
);

MemoizedNode.displayName = 'MemoizedNode';

interface MemoizedConnectionProps {
  connection: WorkflowConnection;
  isSelected: boolean;
  fromNode: TypedWorkflowNode | undefined;
  toNode: TypedWorkflowNode | undefined;
  onSelect: (id: string) => void;
  theme: any;
}

/**
 * Memoized Connection Component
 * Only re-renders when connection data or connected nodes change
 */
export const MemoizedConnection = memo<MemoizedConnectionProps>(
  ({ connection, isSelected, fromNode, toNode, onSelect, theme }) => {
    if (!fromNode || !toNode) return null;

    return (
      <g onClick={() => onSelect(connection.id)}>
        {/* Connection path rendering */}
      </g>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.connection.id === nextProps.connection.id &&
      prevProps.connection.from === nextProps.connection.from &&
      prevProps.connection.to === nextProps.connection.to &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.fromNode?.x === nextProps.fromNode?.x &&
      prevProps.fromNode?.y === nextProps.fromNode?.y &&
      prevProps.toNode?.x === nextProps.toNode?.x &&
      prevProps.toNode?.y === nextProps.toNode?.y
    );
  }
);

MemoizedConnection.displayName = 'MemoizedConnection';

/**
 * Memoized Properties Panel
 */
interface MemoizedPropertiesPanelProps {
  isOpen: boolean;
  selectedNode: TypedWorkflowNode | null;
  selectedConnection: WorkflowConnection | null;
  onUpdateNode: (id: string, updates: Partial<TypedWorkflowNode>) => void;
  onUpdateConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onClose: () => void;
}

export const MemoizedPropertiesPanel = memo<MemoizedPropertiesPanelProps>(
  (props) => {
    // Properties panel implementation
    return null;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.selectedNode?.id === nextProps.selectedNode?.id &&
      prevProps.selectedConnection?.id === nextProps.selectedConnection?.id &&
      JSON.stringify(prevProps.selectedNode?.config) === JSON.stringify(nextProps.selectedNode?.config)
    );
  }
);

MemoizedPropertiesPanel.displayName = 'MemoizedPropertiesPanel';
