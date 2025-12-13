/**
 * ganttTransformUtils.ts
 * 
 * Utility functions for transforming litigation strategy nodes into Gantt timeline data.
 * 
 * @module components/litigation/utils/ganttTransformUtils
 */

import { CasePhase, WorkflowTask, TaskId, CaseId } from '../../../types';
import { WorkflowNode, WorkflowConnection } from '../../workflow/builder/types';

export interface TransformedGanttData {
  phases: CasePhase[];
  tasks: WorkflowTask[];
}

/**
 * Calculates pixels per day based on zoom level
 */
export const calculatePixelsPerDay = (zoom: 'Day' | 'Week' | 'Month' | 'Quarter'): number => {
  switch(zoom) {
    case 'Day': return 60;
    case 'Week': return 20;
    case 'Month': return 5;
    case 'Quarter': return 2;
    default: return 5;
  }
};

/**
 * Gets duration in days based on node type
 */
export const getNodeDurationDays = (nodeType: string): number => {
  switch(nodeType) {
    case 'Decision': return 14;
    case 'Event': return 1;
    default: return 7; // Task or other types
  }
};

/**
 * Transforms workflow nodes and connections into Gantt chart format
 */
export const transformNodesToGantt = (
  nodes: WorkflowNode[], 
  connections: WorkflowConnection[]
): TransformedGanttData => {
  const ganttPhases: CasePhase[] = [];
  const ganttTasks: WorkflowTask[] = [];

  if (nodes.length === 0) {
    return { phases: [], tasks: [] };
  }
  
  const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);
  const minX = sortedNodes.length > 0 ? Math.min(...sortedNodes.map(n => n.x)) : 0;
  const today = new Date();

  sortedNodes.forEach(node => {
    if (node.type === 'Phase') {
      ganttPhases.push({
        id: node.id,
        caseId: 'strategy-plan' as CaseId,
        name: node.label,
        startDate: '', // Will be calculated based on child tasks
        duration: 0,   // Will be calculated based on child tasks
        status: 'Active',
        color: 'bg-indigo-500'
      });
    } else if (node.type !== 'Comment' && node.type !== 'Start' && node.type !== 'End') {
      const startOffsetDays = Math.max(0, Math.floor((node.x - minX) / 20)); // 20px per day
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + startOffsetDays);
      
      const durationDays = getNodeDurationDays(node.type);
      const dueDate = new Date(startDate);
      dueDate.setDate(startDate.getDate() + durationDays);
      
      const dependencies = connections
        .filter(c => c.to === node.id)
        .map(c => c.from as TaskId);

      ganttTasks.push({
        id: node.id as TaskId,
        caseId: 'strategy-plan' as CaseId,
        title: node.label,
        startDate: startDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Pending',
        assignee: node.config.assignee || 'Unassigned',
        priority: 'Medium',
        dependencies
      });
    }
  });

  return { phases: ganttPhases, tasks: ganttTasks };
};

/**
 * Updates node position based on Gantt task date changes
 */
export const calculateNodePositionFromDate = (
  startDateStr: string, 
  referenceDate: Date = new Date()
): number => {
  const newStartDate = new Date(startDateStr);
  const startOffsetDays = (newStartDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24);
  return 50 + startOffsetDays * 20; // 20px per day, starting at x=50
};
