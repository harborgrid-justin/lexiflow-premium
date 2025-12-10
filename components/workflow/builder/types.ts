import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle, BoxSelect, Calendar, Layers, Milestone } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type NodeType = 'Start' | 'Task' | 'Decision' | 'Parallel' | 'Delay' | 'End' | 'Phase' | 'Event' | 'Milestone';

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
    case 'Milestone': return React.createElement(Milestone, { className: "h-4 w-4 text-teal-600" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-slate-600" });
  }
};

export const getNodeStyles = (type: NodeType, isSelected: boolean, theme: any) => {
  const base = cn("absolute flex flex-col rounded-xl border-2 shadow-md cursor-pointer transition-all duration-200 select-none", `hover:shadow-xl hover:-translate-y-0.5`);
  const selected = isSelected ? "ring-4 ring-blue-500/40 ring-offset-2 dark:ring-offset-slate-900 z-20" : "z-10";
  
  let color = theme.border.default;
  let size = "";
  let padding = "";

  switch (type) {
    case 'Start': 
      color = "border-green-300 dark:border-green-700 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-green-900/30";
      size = "w-32 h-14";
      padding = "p-3 items-center justify-center rounded-full";
      break;
    case 'End': 
      color = "border-red-300 dark:border-red-700 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-red-900/30";
      size = "w-32 h-14";
      padding = "p-3 items-center justify-center rounded-full";
      break;
    case 'Decision': 
      color = "border-purple-300 dark:border-purple-700 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/30";
      size = "w-28 h-28 rotate-45 !rounded-2xl"; 
      break;
    case 'Milestone':
        color = "border-teal-300 dark:border-teal-700 bg-gradient-to-br from-white to-teal-50 dark:from-slate-800 dark:to-teal-900/30";
        size = "w-32 h-32 rotate-45 !rounded-3xl";
        break;
    case 'Task':
      color = cn("border-slate-200 dark:border-slate-700", "bg-white dark:bg-slate-800");
      size = "w-48 !rounded-lg";
      padding = "p-0"; // Internal padding
      break;
    case 'Delay':
      color = "border-amber-300 dark:border-amber-700 border-dashed bg-amber-50/30";
      size = "w-40 h-20";
      padding = "p-3 items-center justify-center";
      break;
    case 'Event':
        color = "border-pink-300 dark:border-pink-700 bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-pink-900/30";
        size = "w-40 h-16";
        padding = "p-3 items-center justify-center rounded-full";
        break;
    case 'Phase':
      color = "border-slate-300/80 dark:border-slate-700/80 bg-slate-100/20 dark:bg-slate-900/20 backdrop-blur-sm !rounded-2xl";
      size = "w-[600px] h-[400px]"; // Large box
      padding = "p-0 justify-start items-start";
      return `absolute flex flex-col cursor-pointer transition-all select-none ${color} ${size} ${padding} ${isSelected ? 'ring-2 ring-indigo-400 z-0' : 'z-0'}`;
  }

  return `${base} ${color} ${size} ${padding} ${selected}`;
};