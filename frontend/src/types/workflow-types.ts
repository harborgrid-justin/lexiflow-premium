/**
 * workflow-types.ts
 *
 * Shared workflow and litigation types used across services, hooks, and components.
 * Extracted from components to avoid circular dependencies.
 *
 * @module types/workflow-types
 */

import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle, BoxSelect, Calendar, Milestone, MessageSquare } from 'lucide-react';
import { MetadataRecord } from './primitives';

export type NodeType = 'Start' | 'Task' | 'Decision' | 'Parallel' | 'Delay' | 'End' | 'Phase' | 'Event' | 'Milestone' | 'Comment';

export interface Port {
  id: string;
  label: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  config: MetadataRecord;
  ports?: Port[];
  parentId?: string; // For grouping
  linkedEntityId?: string;
  status?: 'complete' | 'in_progress' | 'blocked';
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  fromPort?: string;
  toPort?: string;
  style?: 'solid' | 'dashed';
}

export const LITIGATION_PORTS: Record<string, Port[]> = {
    'Rule 12(b)(6)': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Rule 56': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Motion in Limine': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Default': [{ id: 'success', label: 'Success' }, { id: 'failure', label: 'Failure' }],
};

export const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'Start': return React.createElement(Play, { className: "h-4 w-4 text-green-600" });
    case 'End': return React.createElement(Square, { className: "h-4 w-4 text-red-600" });
    case 'Task': return React.createElement(Layout, { className: "h-4 w-4 text-blue-600" });
    case 'Decision': return React.createElement(GitBranch, { className: "h-4 w-4 text-purple-600" });
    case 'Parallel': return React.createElement(BoxSelect, { className: "h-4 w-4 text-orange-600" });
    case 'Delay': return React.createElement(Clock, { className: "h-4 w-4 text-amber-600" });
    case 'Phase': return React.createElement(Calendar, { className: "h-4 w-4 text-indigo-600" });
    case 'Event': return React.createElement(CheckCircle, { className: "h-4 w-4 text-emerald-600" });
    case 'Milestone': return React.createElement(Milestone, { className: "h-4 w-4 text-rose-600" });
    case 'Comment': return React.createElement(MessageSquare, { className: "h-4 w-4 text-slate-500" });
    default: return React.createElement(Layout, { className: "h-4 w-4 text-blue-600" });
  }
};

/**
 * Base node properties shared by all node types
 */
export interface BaseNodeProps {
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
    deadline?: string;
    estimatedHours?: number;
    motionType?: string;
    filingDeadline?: string;
  };
}

/**
 * Decision Node - Branching point
 */
export interface DecisionNode extends BaseNodeProps {
  type: 'Decision';
  config: {
    question?: string;
    criteria?: string[];
    motionType?: string;
    litigationType?: string;
    ports?: Port[];
  };
  ports?: Port[];
}

/**
 * Parallel Node - Concurrent execution
 */
export interface ParallelNode extends BaseNodeProps {
  type: 'Parallel';
  config: {
    description?: string;
    joinCondition?: 'all' | 'any';
  };
}

/**
 * Delay Node - Time-based wait
 */
export interface DelayNode extends BaseNodeProps {
  type: 'Delay';
  config: {
    duration?: number;
    unit?: 'days' | 'weeks' | 'months';
  };
}

/**
 * Phase Node - Logical grouping
 */
export interface PhaseNode extends BaseNodeProps {
  type: 'Phase';
  config: {
    description?: string;
    startDate?: string;
    endDate?: string;
    childNodes?: string[];
  };
}

/**
 * Event Node - External trigger point
 */
export interface EventNode extends BaseNodeProps {
  type: 'Event';
  config: {
    eventType?: string;
    description?: string;
  };
}

/**
 * Milestone Node - Progress marker
 */
export interface MilestoneNode extends BaseNodeProps {
  type: 'Milestone';
  config: {
    description?: string;
    targetDate?: string;
  };
}

/**
 * Comment Node - Annotation
 */
export interface CommentNode extends BaseNodeProps {
  type: 'Comment';
  config: {
    text?: string;
  };
}

/**
 * Discriminated union of all typed nodes
 */
export type TypedWorkflowNode =
  | StartNode
  | EndNode
  | TaskNode
  | DecisionNode
  | ParallelNode
  | DelayNode
  | PhaseNode
  | EventNode
  | MilestoneNode
  | CommentNode;

/**
 * Type guard to check if node is a specific type
 */
export function isNodeType<T extends TypedWorkflowNode['type']>(
  node: TypedWorkflowNode,
  type: T
): node is Extract<TypedWorkflowNode, { type: T }> {
  return node.type === type;
}

/**
 * Factory function to create typed nodes with default config
 */
export function createTypedNode(
  type: NodeType,
  label: string,
  x: number,
  y: number,
  id?: string
): TypedWorkflowNode {
  const baseProps = {
    id: id || `node-${Date.now()}`,
    label,
    x,
    y,
  };

  switch (type) {
    case 'Start':
      return { ...baseProps, type: 'Start', config: {} };
    case 'End':
      return { ...baseProps, type: 'End', config: {} };
    case 'Task':
      return { ...baseProps, type: 'Task', config: {} };
    case 'Decision':
      return { ...baseProps, type: 'Decision', config: {}, ports: LITIGATION_PORTS['Default'] };
    case 'Parallel':
      return { ...baseProps, type: 'Parallel', config: { joinCondition: 'all' } };
    case 'Delay':
      return { ...baseProps, type: 'Delay', config: { duration: 7, unit: 'days' } };
    case 'Phase':
      return { ...baseProps, type: 'Phase', config: {} };
    case 'Event':
      return { ...baseProps, type: 'Event', config: {} };
    case 'Milestone':
      return { ...baseProps, type: 'Milestone', config: {} };
    case 'Comment':
      return { ...baseProps, type: 'Comment', config: {} };
    default:
      return { ...baseProps, type: 'Task', config: {} };
  }
}
