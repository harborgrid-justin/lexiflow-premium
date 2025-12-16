/**
 * nodeTypes.ts
 * 
 * Re-exports shared workflow node types from central location.
 * Maintains backward compatibility for component imports.
 * 
 * @module components/litigation/nodeTypes
 */

export * from '../../types/workflow-types';

// Component-specific extensions can be added below if needed
import { BaseNodeProps, Port, NodeType } from '../../types/workflow-types';

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
 * Default config factory for each node type (component-specific)
 */
import { StartNode, EndNode } from '../../types/workflow-types';
export const DEFAULT_NODE_CONFIG: Record<NodeType, any> = {
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
