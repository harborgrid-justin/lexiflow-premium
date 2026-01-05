
import React from 'react';
import { Database, UploadCloud, FileText, X } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignDataManagement = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Data Management" icon={Database} count="DMT-01 to DMT-55" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="DMT-01" name="Upload Zone (Hero)" />
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all group">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6 text-blue-500"/>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Click to Upload</span>
                    <span className="text-[10px] text-slate-500 mt-1">CSV, JSON, or XML (Max 50MB)</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DMT-02" name="File Queue Item" />
                <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="bg-slate-100 p-2 rounded text-slate-500"><FileText size={16}/></div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">contacts_v2.csv</div>
                        <div className="text-[10px] text-slate-400">2.4 MB • Queued</div>
                    </div>
                    <button className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
