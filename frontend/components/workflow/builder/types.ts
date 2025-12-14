
import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle, BoxSelect, Calendar, Milestone, MessageSquare } from 'lucide-react';
import { cn } from '../../../utils/cn';

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
  config: Record<string, any>;
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
    case 'Delay': return React.createElement(Clock, { className: "h-4 w-4 text-amber-600" });
    case 'Phase': return React.createElement(BoxSelect, { className: "h-4 w-4 text-indigo-600" });
    case 'Event': return React.createElement(Calendar, { className: "h-4 w-4 text-pink-600" });
    case 'Milestone': return React.createElement(Milestone, { className: "h-4 w-4 text-teal-600" });
    case 'Comment': return React.createElement(MessageSquare, { className: "h-4 w-4 text-gray-500" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-slate-600" });
  }
};

export const getNodeStyles = (type: NodeType, isSelected: boolean, theme: any) => {
  const base = cn("absolute flex flex-col rounded-xl border-2 shadow-md cursor-pointer transition-all duration-200 select-none", `hover:shadow-xl hover:-translate-y-0.5`);
  const selected = isSelected ? "ring-4 ring-offset-2 z-20" : "z-10";
  // Dynamically injecting ring color class requires safelisting or careful construction. 
  // For now, relying on theme token mapping via `cn`.
  const selectedRingColor = theme.border.focused; 

  let color = theme.border.default;
  let size = "";
  let padding = "";

  switch (type) {
    case 'Start': 
      color = cn(theme.status.success.border, theme.status.success.bg);
      size = "w-32 h-14";
      padding = "p-3 items-center justify-center rounded-full";
      break;
    case 'End': 
      color = cn(theme.status.error.border, theme.status.error.bg);
      size = "w-32 h-14";
      padding = "p-3 items-center justify-center rounded-full";
      break;
    case 'Decision': 
      color = cn(theme.border.default, "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800");
      size = "w-32 h-32 rotate-45 !rounded-2xl"; 
      break;
    case 'Milestone':
        color = cn(theme.border.default, "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800");
        size = "w-32 h-32 rotate-45 !rounded-3xl";
        break;
    case 'Task':
      color = cn(theme.border.default, theme.surface.default);
      size = "w-48 h-22 !rounded-lg"; // Height changed to h-22
      padding = "p-0"; // Internal padding
      break;
    case 'Delay':
      color = cn(theme.status.warning.border, theme.status.warning.bg, "border-dashed");
      size = "w-40 h-20";
      padding = "p-3 items-center justify-center";
      break;
    case 'Event':
        color = cn(theme.border.default, "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800");
        size = "w-40 h-16";
        padding = "p-3 items-center justify-center rounded-full";
        break;
    case 'Phase':
      color = cn(theme.border.default, theme.surface.highlight, "backdrop-blur-sm !rounded-2xl");
      // Size will be dynamic
      padding = "p-0 justify-start items-start";
      return `absolute flex flex-col cursor-pointer transition-all select-none ${color} ${padding} ${isSelected ? 'ring-2 z-0' : 'z-0'}`;
    case 'Comment':
        color = cn(theme.status.warning.bg, "border-yellow-300 dark:border-yellow-700 shadow-none");
        size = "w-48 h-auto";
        padding = "p-3";
        break;
  }

  return `${base} ${color} ${size} ${padding} ${selected} ${isSelected ? selectedRingColor : ''}`;
};
