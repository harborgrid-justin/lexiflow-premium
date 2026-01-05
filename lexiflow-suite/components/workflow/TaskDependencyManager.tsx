
import React from 'react';
import { ArrowDown, CheckSquare, Lock, Link, GripVertical } from 'lucide-react';

export const TaskDependencyManager: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
         <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2">Dependency Chain</h3>
         <p className="text-slate-500 text-sm">Critical path analysis for Phase 1</p>
      </div>
      
      <div className="relative pl-8">
        {/* Connector Line */}
        <div className="absolute left-[54px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
        
        {/* Task 1 */}
        <div className="flex items-center gap-6 mb-8 group">
          <div className="w-14 h-14 rounded-2xl bg-green-100 border-4 border-white shadow-lg flex items-center justify-center shrink-0 z-10 relative ring-1 ring-slate-200">
            <CheckSquare className="h-6 w-6 text-green-600" />
            <div className="absolute -right-1 -bottom-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">DONE</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 hover:border-green-300 hover:shadow-md transition-all relative">
            <div className="absolute left-0 top-1/2 -translate-x-full w-6 h-0.5 bg-green-200"></div>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-mono text-slate-400">ID: 101</span>
                    <p className="font-bold text-sm text-slate-900 line-through decoration-slate-300">Client Intake Form</p>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">Completed</span>
            </div>
          </div>
        </div>

        {/* Task 2 */}
        <div className="flex items-center gap-6 mb-8 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 border-4 border-white shadow-xl flex items-center justify-center shrink-0 z-10 relative ring-4 ring-blue-50">
            <span className="font-black text-white text-lg">2</span>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-blue-500 shadow-lg flex-1 relative">
            <div className="absolute left-0 top-1/2 -translate-x-full w-6 h-0.5 bg-blue-500"></div>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div> Active Task
                </span>
                <GripVertical className="text-slate-300 cursor-move h-4 w-4"/>
            </div>
            <p className="font-bold text-base text-slate-900">Conflict Check</p>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1.5 bg-blue-50 w-fit px-2 py-1 rounded">
                <Link size={10}/> Blocking Task 3
            </p>
          </div>
        </div>

        {/* Task 3 */}
        <div className="flex items-center gap-6 group opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center shrink-0 z-10 relative ring-1 ring-slate-200">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed flex-1 relative">
            <div className="absolute left-0 top-1/2 -translate-x-full w-6 h-0.5 bg-slate-300 border-b border-dashed border-slate-400"></div>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-mono text-slate-400">ID: 103</span>
                    <p className="font-bold text-sm text-slate-500">Engagement Letter Generation</p>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded flex items-center gap-1">
                    <Lock size={8}/> Locked
                </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Waiting on Task 2 completion...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
