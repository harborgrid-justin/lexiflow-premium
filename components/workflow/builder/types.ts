
import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle, BoxSelect, Calendar, Layers } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type NodeType = 'Start' | 'Task' | 'Decision' | 'Parallel' | 'Delay' | 'End' | 'Phase' | 'Event';

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
  config: Record<string, any>;
  ports?: Port[];
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  fromPort?: string;
  toPort?: string;
}

export const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'Start': return React.createElement(Play, { className: "h-4 w-4 text-green-600" });
    case 'End': return React.createElement(Square, { className: "h-4 w-4 text-red-600" });
    case 'Task': return React.createElement(Layout, { className: "h-4 w-4 text-blue-600" });
    case 'Decision': return React.createElement(GitBranch, { className: "h-4 w-4 text-purple-600" });
    case 'Delay': return React.createElement(Clock, { className: "h-4 w-4 text-amber-600" });
    case 'Phase': return React.createElement(BoxSelect, { className: "h-4 w-4 text-indigo-600" });
    case 'Event': return React.createElement(Calendar, { className: "h-4 w-4 text-pink-600" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-slate-600" });
  }
};

export const getNodeStyles = (type: NodeType, isSelected: boolean, theme: any) => {
  const base = cn("absolute flex flex-col items-center justify-center p-3 rounded-xl border-2 shadow-sm cursor-pointer transition-all select-none", theme.surface);
  const selected = isSelected ? "ring-2 ring-blue-500 ring-offset-2 z-20" : "z-10";
  const hover = "hover:shadow-md hover:-translate-y-0.5";
  
  let color = theme.border.default;
  let size = "w-40 h-20";
  let extra = "";

  switch (type) {
    case 'Start': 
      color = "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10";
      size = "w-32 h-14 rounded-full";
      break;
    case 'End': 
      color = "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10";
      size = "w-32 h-14 rounded-full";
      break;
    case 'Decision': 
      color = "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10";
      size = "w-28 h-28 rotate-45"; 
      extra = "decision-node"; // CSS class hook for rotation correction on inner content
      break;
    case 'Task':
      color = "border-blue-200 border-l-4 border-l-blue-500 dark:border-blue-800";
      break;
    case 'Delay':
      color = "border-amber-200 dashed-border dark:border-amber-800 bg-amber-50/30";
      break;
    case 'Phase':
      color = "border-indigo-300 border-2 border-dashed bg-indigo-50/20 dark:bg-indigo-900/10 dark:border-indigo-700";
      size = "w-[600px] h-[400px] justify-start items-start pt-4 px-4"; // Large box
      return `absolute flex flex-col p-3 rounded-xl cursor-pointer transition-all select-none ${color} ${size} ${isSelected ? 'ring-2 ring-indigo-400 z-0' : 'z-0'}`;
    case 'Event':
      color = "border-pink-200 border-l-4 border-l-pink-500 dark:border-pink-800";
      size = "w-40 h-16 rounded-r-full";
      break;
  }

  return `${base} ${color} ${size} ${selected} ${hover} ${extra}`;
};
