/**
 * Re-export shared workflow types from central location
 * Maintains backward compatibility for component imports
 */
export * from '../../../types/workflow-types';

// Legacy export for backward compatibility
import { getNodeIcon as _getNodeIcon, NodeType } from '../../../types/workflow-types';
import React from 'react';
import { Play, Square, Layout, GitBranch, Clock, CheckCircle, BoxSelect, Calendar, Milestone, MessageSquare } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const getNodeIcon = _getNodeIcon;

// Component-specific node styling function
export const getNodeIconLocal = (type: NodeType) => {
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

interface ThemeColors {
  background: string;
  surface: {
    default: string;
    raised: string;
    highlight: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  border: {
    default: string;
    focused: string;
  };
  primary: {
    DEFAULT: string;
    text: string;
    border: string;
  };
  status: {
    success: {
      bg: string;
      text: string;
      border: string;
    };
    error: {
      bg: string;
      text: string;
      border: string;
    };
    warning: {
      bg: string;
      text: string;
      border: string;
    };
    info: {
      bg: string;
      text: string;
      border: string;
    };
  };
  action: {
    ghost: {
      hover: string;
    };
  };
}

export const getNodeStyles = (type: NodeType, isSelected: boolean, theme: ThemeColors) => {
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
