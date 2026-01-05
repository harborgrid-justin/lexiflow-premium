
import React from 'react';
import { Map, Home, ChevronRight } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignNavigation = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Navigation" icon={Map} count="NV-01 to NV-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="NV-01" name="Breadcrumbs" />
                <div className="flex items-center text-xs text-slate-500">
                    <span className="hover:text-blue-600 cursor-pointer flex items-center"><Home className="w-3 h-3 mr-1"/> Home</span> 
                    <ChevronRight className="w-3 h-3 mx-1"/> 
                    <span className="font-bold text-slate-800 cursor-default">Detail</span>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
