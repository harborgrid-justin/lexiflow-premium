
import React from 'react';
import { CheckSquare } from 'lucide-react';

export const MyTasksWidget: React.FC = () => (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-3 border-b bg-slate-50 font-bold text-sm text-slate-800">My Tasks</div>
        <div className="divide-y">
            {[1,2,3].map(i => (
                <div key={i} className="p-3 hover:bg-slate-50 flex items-start gap-3">
                    <input type="checkbox" className="mt-1"/>
                    <div>
                        <div className="text-sm font-medium">Review Discovery Docs</div>
                        <div className="text-xs text-slate-500">Due: Tomorrow</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
