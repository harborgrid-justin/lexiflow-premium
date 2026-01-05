
import React from 'react';
import { GitBranch, Play, User, ChevronRight } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignWorkflow = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Workflow Engine" icon={GitBranch} count="WF-01 to WF-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="WF-01" name="Flow Start Event" />
                <div className="flex items-center justify-center py-2">
                    <div className="w-12 h-12 rounded-full border-4 border-green-500 bg-green-50 flex items-center justify-center shadow-sm relative group cursor-pointer hover:scale-105 transition-transform hover:shadow-green-100">
                        <Play size={16} className="text-green-600 ml-1 fill-green-600"/>
                        <div className="absolute -bottom-8 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-1 rounded shadow border">Trigger</div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="WF-02" name="User Task Node" />
                <div className="w-full bg-white border-2 border-blue-500 rounded-xl p-3 shadow-sm relative hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-blue-100 rounded text-blue-600"><User size={12}/></div>
                        <span className="text-sm font-bold text-slate-800">Review Contract</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pl-1">
                        <span>Legal Team</span>
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">SLA: 2d</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="WF-09" name="Sequence Flow" />
                <div className="h-10 flex items-center justify-center w-full relative px-4">
                    <div className="h-0.5 w-full bg-slate-400 relative">
                            <div className="absolute right-0 -top-2 text-slate-400">
                                <ChevronRight size={18} strokeWidth={3}/>
                            </div>
                    </div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
