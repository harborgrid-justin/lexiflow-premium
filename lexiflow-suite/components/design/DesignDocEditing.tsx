
import React from 'react';
import { PenTool, Bold, Italic, Underline } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignDocEditing = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Document Editor" icon={PenTool} count="DE-01 to DE-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="DE-01" name="Format Group" />
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit items-center">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-all hover:text-blue-600"><Bold size={14}/></button>
                    <button className="p-1.5 bg-blue-50 text-blue-600 rounded shadow-inner transition-all"><Italic size={14}/></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-all hover:text-blue-600"><Underline size={14}/></button>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
