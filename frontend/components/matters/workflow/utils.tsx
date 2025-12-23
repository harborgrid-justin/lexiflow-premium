/**
 * Utility functions for Workflow components
 * Extracted from individual component files for better organization and reusability
 * 
 * NOTE: Pure utility functions only. React components moved to separate files.
 * For ProcessIcon component, import from './ProcessIcon' instead.
 */

import { WorkflowTask } from '../../../types';

/**
 * @deprecated Use ProcessIcon component instead
 * @see ProcessIcon in './ProcessIcon.tsx'
 */
export const getProcessIcon = (name: string): unknown => {
  console.warn('getProcessIcon is deprecated. Use <ProcessIcon processName={name} /> instead.');
  return null;
};

/**
 * Format deadline time remaining in human-readable format
 * @param dueTime - Timestamp of the deadline
 * @returns Formatted string like "2d 4h" or "OVERDUE"
 */
export const formatDeadline = (dueTime: number): string => {
  const diff = dueTime - Date.now();
  if (diff < 0) return 'OVERDUE';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m ${secs}s`;
};

/**
 * Calculate case progress percentage based on task completion
 * @param caseId - The case ID to calculate progress for
 * @param tasks - Array of all tasks
 * @returns Progress percentage (0-100)
 */
export const getCaseProgress = (caseId: string, tasks: WorkflowTask[]): number => {
  const caseTasks = tasks.filter(t => t.caseId === caseId);
  if (caseTasks.length === 0) return 0;
  const completed = caseTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
  return Math.round((completed / caseTasks.length) * 100);
};

/**
 * Get the next pending task for a case
 * @param caseId - The case ID to get next task for
 * @param tasks - Array of all tasks
 * @returns Description of next task or completion message
 */
export const getNextTask = (caseId: string, tasks: WorkflowTask[]): string => {
  const caseTasks = tasks.filter(t => t.caseId === caseId && t.status !== 'Done' && t.status !== 'Completed');
  if (caseTasks.length === 0) return "All tasks completed";
  // Sort by due date
  caseTasks.sort((a: WorkflowTask, b: WorkflowTask) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateA - dateB;
  });
  return caseTasks[0].title;
};
