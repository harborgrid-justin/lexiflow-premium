/**
 * Type definitions for Workflow components
 * Extracted from individual component files for better organization and reusability
 */

export interface WorkflowAnalyticsData {
  completion: { name: string; completed: number }[];
  status: { name: string; value: number; color: string }[];
}

export interface SLAItem {
  id: string;
  task: string;
  dueTime: number; // Timestamp
  status: 'On Track' | 'At Risk' | 'Breached';
  progress: number;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  requester: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
  type: 'success' | 'warning' | 'info';
}

export interface Process {
  id: string;
  name: string;
  status: string;
  triggers: string;
  tasks: number;
  completed: number;
  owner: string;
}

export type WorkflowView = 'templates' | 'cases' | 'firm' | 'ops_center' | 'analytics' | 'settings';
