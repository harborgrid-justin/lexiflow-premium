
import React from 'react';
import { Calendar } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignCalendar = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Calendar & Scheduling" icon={Calendar} count="CAL-01 to CAL-55" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <DemoContainer>
                <ComponentLabel id="CAL-01" name="Month Cell (Std)" />
                <div className="w-full aspect-square border border-slate-200 bg-white p-1 relative">
                    <span className="text-xs font-medium text-slate-700">14</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="CAL-02" name="Month Cell (Today)" />
                <div className="w-full aspect-square border border-slate-200 bg-white p-1 relative">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">14</span>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
