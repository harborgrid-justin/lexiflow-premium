/**
 * canvasUtils.ts
 * 
 * Utility functions for Strategy Canvas interaction logic.
 * 
 * @module components/litigation/utils/canvasUtils
 */

import { LucideIcon, Edit2, Copy, Trash2, Layout, GitBranch, BoxSelect } from 'lucide-react';
import { NodeType } from '../../../matters/workflow/builder/types';
import { ContextMenuItem } from '../../components/molecules/ContextMenu';
import { CANVAS_CONSTANTS } from '../canvasConstants';

/**
 * Calculates canvas position from drop event
 */
export const calculateDropPosition = (
  event: React.DragEvent,
  canvasElement: HTMLElement,
  pan: { x: number; y: number },
  scale: number
): { x: number; y: number } => {
  const rect = canvasElement.getBoundingClientRect();
  const x = (event.clientX - rect.left - pan.x) / scale - CANVAS_CONSTANTS.NODE_WIDTH_HALF;
  const y = (event.clientY - rect.top - pan.y) / scale - CANVAS_CONSTANTS.NODE_HEIGHT_HALF;
  return { x, y };
};

/**
 * Calculates mouse position on canvas
 */
export const calculateCanvasMousePosition = (
  event: React.MouseEvent,
  canvasElement: HTMLElement,
  pan: { x: number; y: number },
  scale: number
): { x: number; y: number } => {
  const rect = canvasElement.getBoundingClientRect();
  const x = (event.clientX - rect.left - pan.x) / scale;
  const y = (event.clientY - rect.top - pan.y) / scale;
  return { x, y };
};

/**
 * Generates context menu items for a node
 */
export const generateNodeContextMenuItems = (
  nodeId: string,
  onEdit: (id: string) => void,
  onDuplicate: (id: string) => void,
  onDelete: (id: string) => void
): ContextMenuItem[] => {
  return [
    { 
      label: 'Edit Properties', 
      icon: Edit2, 
      action: () => onEdit(nodeId)
    },
    { 
      label: 'Duplicate Node', 
      icon: Copy, 
      action: () => onDuplicate(nodeId)
    },
    { 
      label: 'Delete Node', 
      icon: Trash2, 
      danger: true, 
      action: () => onDelete(nodeId)
    }
  ];
};

/**
 * Generates context menu items for canvas background
 */
export const generateCanvasContextMenuItems = (
  position: { x: number; y: number },
  onAddNode: (type: NodeType, x: number, y: number) => void
): ContextMenuItem[] => {
  return [
    { 
      label: 'Add Task Node', 
      icon: Layout, 
      action: () => onAddNode('Task', position.x - CANVAS_CONSTANTS.NODE_WIDTH_HALF, position.y - CANVAS_CONSTANTS.NODE_HEIGHT_HALF)
    },
    { 
      label: 'Add Decision Node', 
      icon: GitBranch, 
      action: () => onAddNode('Decision', position.x - CANVAS_CONSTANTS.DECISION_NODE_SIZE, position.y - CANVAS_CONSTANTS.DECISION_NODE_SIZE)
    },
    { 
      label: 'Add Phase Container', 
      icon: BoxSelect, 
      action: () => onAddNode('Phase', position.x - CANVAS_CONSTANTS.PHASE_WIDTH, position.y - CANVAS_CONSTANTS.PHASE_HEIGHT)
    }
  ];
};
