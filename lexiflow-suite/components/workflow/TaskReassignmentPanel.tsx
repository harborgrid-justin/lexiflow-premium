
import React, { useTransition } from 'react';
import { User, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const TaskReassignmentPanel: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  const handleTransfer = () => {
      startTransition(() => {
          // Simulate bulk update
          alert("Tasks transferred successfully.");
      });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
        <RefreshCcw className="h-5 w-5 mr-2 text-slate-500"/> Bulk Reassignment
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From User</label>
          <div className="flex items-center bg-white border border-slate-300 rounded-md px-3 py-2">
            <User className="h-4 w-4 mr-2 text-slate-400"/>
            <select className="bg-transparent w-full text-sm outline-none">
              <option>James Doe</option>
              <option>Sarah Jenkins</option>
            </select>
          </div>
        </div>
        
        <ArrowRight className="h-6 w-6 text-slate-400 hidden md:block mt-5" />
        
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To User</label>
          <div className="flex items-center bg-white border border-slate-300 rounded-md px-3 py-2">
            <User className="h-4 w-4 mr-2 text-slate-400"/>
            <select className="bg-transparent w-full text-sm outline-none">
              <option>Alexandra H.</option>
              <option>Paralegal Pool</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-slate-500">Will move <strong>5 active tasks</strong>.</p>
        <Button variant="primary" size="sm" onClick={handleTransfer} isLoading={isPending}>Transfer Tasks</Button>
      </div>
    </div>
  );
};
