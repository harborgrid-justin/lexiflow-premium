
import React from 'react';

interface TaskWorkflowBadgesProps {
  status: string | 'Pending' | 'In Progress' | 'Review' | 'Done';
}

export const TaskWorkflowBadges: React.FC<TaskWorkflowBadgesProps> = ({ status }) => {
  let styles = "bg-slate-100 text-slate-600 border-slate-200";
  
  switch(status) {
    case 'In Progress':
      styles = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case 'Review':
      styles = "bg-purple-100 text-purple-700 border-purple-200";
      break;
    case 'Done':
      styles = "bg-green-100 text-green-700 border-green-200";
      break;
    case 'Pending':
      styles = "bg-amber-100 text-amber-700 border-amber-200";
      break;
  }

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${styles}`}>
      {status}
    </span>
  );
};
