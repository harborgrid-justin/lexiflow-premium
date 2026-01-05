
import React from 'react';
import { Clock } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignTimeline = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
        <SectionHeading title="Timelines & History" icon={Clock} count="TL-01 to TL-150" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="TL-01" name="Vertical Dot (Std)" />
                <div className="relative pl-4 border-l-2 border-slate-200 py-2">
                    <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white"></div>
                    <div className="text-xs text-slate-500">Event Occurred</div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
