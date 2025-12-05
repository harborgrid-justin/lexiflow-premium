
import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type NodeType = 'Start' | 'Task' | 'Decision' | 'Parallel' | 'Delay' | 'End';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

export const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'Start': return React.createElement(Play, { className: "h-4 w-4 text-green-600" });
    case 'End': return React.createElement(Square, { className: "h-4 w-4 text-red-600" });
    case 'Task': return React.createElement(Layout, { className: "h-4 w-4 text-blue-600" });
    case 'Decision': return React.createElement(GitBranch, { className: "h-4 w-4 text-purple-600" });
    case 'Delay': return React.createElement(Clock, { className: "h-4 w-4 text-amber-600" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-slate-600" });
  }
};

export const getNodeStyles = (type: NodeType, isSelected: boolean, theme: any) => {
  const base = cn("absolute flex flex-col items-center justify-center p-3 rounded-xl border-2 shadow-sm cursor-pointer transition-all hover:shadow-md select-none", theme.surface);
  const selected = isSelected ? "ring-2 ring-blue-500 ring-offset-2 z-10" : "z-0";
  
  let color = theme.border.default;
  let size = "w-40 h-20";

  switch (type) {
    case 'Start': 
      color = "border-green-200 dark:border-green-800";
      size = "w-32 h-16 rounded-full";
      break;
    case 'End': 
      color = "border-red-200 dark:border-red-800";
      size = "w-32 h-16 rounded-full";
      break;
    case 'Decision': 
      color = "border-purple-200 dark:border-purple-800";
      size = "w-32 h-32 rotate-45"; 
      break;
    case 'Task':
      color = "border-blue-200 border-l-4 border-l-blue-500 dark:border-blue-800";
      break;
    case 'Delay':
      color = "border-amber-200 dashed-border dark:border-amber-800";
      break;
  }

  return `${base} ${color} ${size} ${selected}`;
};
