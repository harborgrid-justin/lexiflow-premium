
import React, { useState } from 'react';
import { Table, Settings, List } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignDataGrid = () => {
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Data Grids & Tables" icon={Table} count="DG-01 to DG-50" />
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DemoContainer>
                    <ComponentLabel id="DG-01" name="Density Toggle" />
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
                        <button onClick={() => setDensity('compact')} className={`p-1.5 rounded-md ${density === 'compact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><List size={14} className="scale-y-75"/></button>
                        <button onClick={() => setDensity('normal')} className={`p-1.5 rounded-md ${density === 'normal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><List size={14}/></button>
                        <button onClick={() => setDensity('comfortable')} className={`p-1.5 rounded-md ${density === 'comfortable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><List size={14} className="scale-y-125"/></button>
                    </div>
                </DemoContainer>
                <DemoContainer>
                    <ComponentLabel id="DG-05" name="Filter Pill" />
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full pl-3 pr-1 py-1 shadow-sm w-fit">
                        <span className="text-[10px] text-slate-500">Status:</span>
                        <span className="text-[10px] font-bold text-slate-800">Active</span>
                        <button className="ml-1 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500">
                            <Settings size={10} className="rotate-45"/>
                        </button>
                    </div>
                </DemoContainer>
            </div>
        </div>
    </div>
  );
};
