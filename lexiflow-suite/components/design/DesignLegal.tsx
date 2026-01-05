
import React from 'react';
import { Scale } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignLegal = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Legal Patterns" icon={Scale} count="LG-01 to LG-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="LG-01" name="Pleading Caption" />
                <div className="border border-black p-2 flex text-[9px] font-serif">
                    <div className="w-1/2 border-r border-black pr-1">John Doe,<br/>Plaintiff,</div>
                    <div className="w-1/2 pl-1 text-center">Case No. 123</div>
                </div>
            </DemoContainer>
            <DemoContainer>
                <ComponentLabel id="LG-02" name="Redaction" />
                <div className="text-xs">
                    Name: <span className="bg-black text-black select-none rounded-sm px-1">HIDDEN</span>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
