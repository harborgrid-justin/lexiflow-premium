/**
 * ganttTransformUtils.ts
 * 
 * Utility functions for transforming litigation strategy nodes into Gantt timeline data.
 * 
 * @module components/litigation/utils/ganttTransformUtils
 */

import { CasePhase, WorkflowTask, TaskId, CaseId, TaskStatusBackend, TaskPriorityBackend } from '../../../../types';
import { WorkflowNode, WorkflowConnection } from '../../../matters/workflow/builder/types';
import { GANTT_ZOOM_SCALE, NODE_DURATION_MAP, CANVAS_CONSTANTS } from '../canvasConstants';
import { DateCalculationService } from '@/services/features/calculations/dateCalculationService';

export interface TransformedGanttData {
  phases: CasePhase[];
  tasks: WorkflowTask[];
}

/**
 * Calculates pixels per day based on zoom level
 */
export const calculatePixelsPerDay = (zoom: 'Day' | 'Week' | 'Month' | 'Quarter'): number => {
  return GANTT_ZOOM_SCALE[zoom] || GANTT_ZOOM_SCALE.Month;
};

/**
 * Gets duration in days based on node type
 */
export const getNodeDurationDays = (nodeType: string): number => {
  return NODE_DURATION_MAP[nodeType as keyof typeof NODE_DURATION_MAP] || CANVAS_CONSTANTS.DEFAULT_TASK_DURATION;
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
      const startDate = DateCalculationService.calculateStartDateFromPosition(
        node.x,
        CANVAS_CONSTANTS.PIXELS_PER_DAY,
        minX,
        today
      );
      
      const durationDays = getNodeDurationDays(node.type);
      const dueDate = DateCalculationService.calculateDueDate(startDate, durationDays);
      
      const dependencies = connections
        .filter(c => c.to === node.id)
        .map(c => c.from as TaskId);

      ganttTasks.push({
        id: node.id as TaskId,
        caseId: 'strategy-plan' as CaseId,
        title: node.label,
        startDate: DateCalculationService.formatToISO(startDate),
        dueDate: DateCalculationService.formatToISO(dueDate),
        status: TaskStatusBackend.TODO,
        assignee: node.config.assignee || 'Unassigned',
        priority: TaskPriorityBackend.MEDIUM,
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
  const startDate = DateCalculationService.parseFromISO(startDateStr);
  return DateCalculationService.calculatePositionFromDate(
    startDate,
    referenceDate,
    CANVAS_CONSTANTS.PIXELS_PER_DAY,
    50
  );
};
