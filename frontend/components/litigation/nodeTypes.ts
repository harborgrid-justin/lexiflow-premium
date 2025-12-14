/**
 * nodeTypes.ts
 * 
 * Type-safe discriminated union types for workflow nodes.
 * Provides proper typing for node-specific configuration.
 * 
 * @module components/litigation/nodeTypes
 */

import { NodeType, Port } from '../workflow/builder/types';

/**
 * Base node properties shared by all node types
 */
interface BaseNodeProps {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string;
  linkedEntityId?: string;
  status?: 'complete' | 'in_progress' | 'blocked';
}

/**
 * Start Node - Entry point of workflow
 */
export interface StartNode extends BaseNodeProps {
  type: 'Start';
  config: {
    description?: string;
    triggerCondition?: string;
  };
}

/**
 * End Node - Exit point of workflow
 */
export interface EndNode extends BaseNodeProps {
  type: 'End';
  config: {
    outcome?: 'success' | 'failure' | 'settled';
    description?: string;
  };
}

/**
 * Task Node - Standard work item
 */
export interface TaskNode extends BaseNodeProps {
  type: 'Task';
  config: {
    description?: string;
    assignee?: string;
    estimatedHours?: number;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    checklist?: string[];
    dependencies?: string[];
  };
}

/**
 * Decision Node - Branching logic with multiple outcomes
 */
export interface DecisionNode extends BaseNodeProps {
  type: 'Decision';
  config: {
    description?: string;
    litigationType?: string;
    probability?: number; // 0-100
    decisionCriteria?: string;
    ports?: Port[];
    estimatedDays?: number;
  };
}

/**
 * Phase Node - Container for grouping related nodes
 */
export interface PhaseNode extends BaseNodeProps {
  type: 'Phase';
  config: {
    description?: string;
    litigationType?: string;
    color?: string;
    collapsed?: boolean;
    childNodes?: string[]; // IDs of nodes within phase
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Event Node - Time-bound milestone
 */
export interface EventNode extends BaseNodeProps {
  type: 'Event';
  config: {
    description?: string;
    litigationType?: string;
    eventDate?: string;
    location?: string;
    participants?: string[];
    isDeadline?: boolean;
  };
}

/**
 * Milestone Node - Checkpoint in workflow
 */
export interface MilestoneNode extends BaseNodeProps {
  type: 'Milestone';
  config: {
    description?: string;
    completionCriteria?: string;
    deliverables?: string[];
  };
}

/**
 * Delay Node - Wait/pause in workflow
 */
export interface DelayNode extends BaseNodeProps {
  type: 'Delay';
  config: {
    description?: string;
    delayType: 'fixed' | 'until_date' | 'until_condition';
    durationDays?: number;
    untilDate?: string;
    condition?: string;
  };
}

/**
 * Parallel Node - Concurrent execution
 */
export interface ParallelNode extends BaseNodeProps {
  type: 'Parallel';
  config: {
    description?: string;
    branches?: string[]; // IDs of parallel branches
    joinType?: 'all' | 'any' | 'first';
  };
}

/**
 * Comment Node - Annotation/note
 */
export interface CommentNode extends BaseNodeProps {
  type: 'Comment';
  config: {
    text: string;
    author?: string;
    createdAt?: string;
    color?: string;
  };
}

/**
 * Discriminated Union of all node types
 * This provides compile-time type safety for node operations
 */
export type TypedWorkflowNode = 
  | StartNode 
  | EndNode 
  | TaskNode 
  | DecisionNode 
  | PhaseNode 
  | EventNode 
  | MilestoneNode 
  | DelayNode 
  | ParallelNode 
  | CommentNode;

/**
 * Type guard to check node type
 */
export function isNodeOfType<T extends TypedWorkflowNode['type']>(
  node: TypedWorkflowNode,
  type: T
): node is Extract<TypedWorkflowNode, { type: T }> {
  return node.type === type;
}

/**
 * Helper to create a properly typed node
 */
export function createTypedNode<T extends NodeType>(
  type: T,
  id: string,
  label: string,
  x: number,
  y: number,
  config: Extract<TypedWorkflowNode, { type: T }>['config'] = {} as any
): Extract<TypedWorkflowNode, { type: T }> {
  return {
    id,
    type,
    label,
    x,
    y,
    config,
  } as Extract<TypedWorkflowNode, { type: T }>;
}

/**
 * Type-safe node config getter
 * Returns any config type since discriminated unions make precise typing complex
 */
export function getNodeConfig<T extends NodeType>(
  node: TypedWorkflowNode,
  type: T
): any {
  if (isNodeOfType(node, type)) {
    return node.config;
  }
  return null;
}

/**
 * Default config factory for each node type
 */
export const DEFAULT_NODE_CONFIG: Record<NodeType, Partial<TypedWorkflowNode['config']>> = {
  Start: { description: 'Workflow start point' },
  End: { outcome: 'success', description: 'Workflow end point' },
  Task: { priority: 'Medium', estimatedHours: 8, checklist: [] },
  Decision: { probability: 50, ports: [] },
  Phase: { collapsed: false, childNodes: [] },
  Event: { isDeadline: false, participants: [] },
  Milestone: { deliverables: [] },
  Delay: { delayType: 'fixed', durationDays: 1 },
  Parallel: { branches: [], joinType: 'all' },
  Comment: { text: '', color: 'yellow' },
};
