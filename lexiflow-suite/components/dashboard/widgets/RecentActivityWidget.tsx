
import React from 'react';
import { Activity } from 'lucide-react';

export const RecentActivityWidget: React.FC = () => (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-3 border-b bg-slate-50 font-bold text-sm text-slate-800 flex items-center gap-2">
            <Activity size={14}/> Activity Feed
        </div>
        <div className="p-4 space-y-4">
            {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                        <p className="text-slate-800"><span className="font-bold">Alex</span> uploaded 3 documents to <em>Case 101</em>.</p>
                        <span className="text-slate-400">2 mins ago</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
