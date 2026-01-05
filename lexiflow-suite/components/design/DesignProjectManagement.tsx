
import React from 'react';
import { ClipboardList, MoreHorizontal, Clock } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignProjectManagement = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Project Management" icon={ClipboardList} count="PM-01 to PM-103" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="PM-01" name="Kanban Task Card" />
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg"></div>
                    <div className="pl-2">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">LIT-204</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-300 group-hover:text-slate-500"/>
                        </div>
                        <h5 className="text-sm font-semibold text-slate-800 mb-3 leading-snug">Review Production Set 2 for Privilege</h5>
                        <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                <Clock size={10} className="mr-1"/> 2d left
                            </div>
                        </div>
                    </div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
