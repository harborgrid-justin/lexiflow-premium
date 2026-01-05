
import React from 'react';
import { Card } from '../common/Card.tsx';
import { GitMerge, MoreHorizontal, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { TaskWorkflowBadges } from './TaskWorkflowBadges.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

const PARALLEL_TASKS = [
  { id: 't1', title: 'Review Discovery Docs', assignee: 'James Doe', status: 'In Progress', branch: 'Discovery Track', due: '2d left', priority: 'High' },
  { id: 't2', title: 'Draft Motion to Compel', assignee: 'Sarah Jenkins', status: 'Pending', branch: 'Motion Track', due: '5d left', priority: 'Medium' },
  { id: 't3', title: 'Interview Witnesses', assignee: 'Investigator', status: 'In Progress', branch: 'Investigation Track', due: 'Today', priority: 'Critical' },
];

export const ParallelTasksManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-black text-slate-800 flex items-center text-sm uppercase tracking-wide">
          <GitMerge className="h-5 w-5 mr-3 text-indigo-600" /> Active Parallel Tracks
        </h3>
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
            3 Active Branches
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARALLEL_TASKS.map(task => (
          <div 
            key={task.id} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
          >
            {/* Status Line */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${task.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
            
            <div className="flex justify-between items-start mb-3 pl-2">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded-md">
                {task.branch}
              </span>
              <button className="text-slate-300 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded">
                <MoreHorizontal className="h-4 w-4"/>
              </button>
            </div>
            
            <h4 className="font-bold text-sm text-slate-900 mb-4 pl-2 leading-snug">{task.title}</h4>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 pl-2">
              <div className="flex items-center gap-2">
                <UserAvatar name={task.assignee} size="sm" className="ring-2 ring-white shadow-sm"/>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 leading-none">{task.assignee}</span>
                    <span className={`text-[9px] font-medium leading-none mt-1 flex items-center ${task.priority === 'Critical' ? 'text-red-600' : 'text-slate-400'}`}>
                        {task.priority === 'Critical' && <AlertTriangle size={8} className="mr-1"/>}
                        {task.due}
                    </span>
                </div>
              </div>
              <TaskWorkflowBadges status={task.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
