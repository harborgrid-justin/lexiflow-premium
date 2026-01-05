
import React from 'react';
import { Box, User, FileText, Download } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignCards = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
        <SectionHeading title="Cards & Containers" icon={Box} count="CD-01 to CD-103" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="CD-01" name="Standard Card" />
                <div className="border rounded shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer bg-white">
                    <div className="font-bold text-sm mb-1 text-slate-900">Card Title</div>
                    <div className="text-xs text-slate-500">Content goes here... (Hover me)</div>
                </div>
            </DemoContainer>
            
            <DemoContainer>
                <ComponentLabel id="CD-02" name="User Profile" />
                <div className="flex items-center gap-3 p-3 border rounded bg-white hover:border-blue-300 transition-colors">
                    <UserAvatar name="Sarah J." size="md"/>
                    <div>
                        <div className="font-bold text-sm text-slate-900">Sarah J.</div>
                        <div className="text-xs text-slate-500">Paralegal</div>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="CD-03" name="File Attachment" />
                <div className="flex items-center border rounded p-2 gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer group transition-colors">
                    <div className="bg-red-100 p-1.5 rounded group-hover:bg-red-200 transition-colors"><FileText size={16} className="text-red-500"/></div>
                    <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold truncate text-slate-700">contract_v1.pdf</div>
                        <div className="text-[10px] text-slate-400">2.4 MB</div>
                    </div>
                    <Download size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
