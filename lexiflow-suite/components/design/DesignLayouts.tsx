
import React, { useState } from 'react';
import { 
  LayoutTemplate, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignLayouts = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Layouts & Grids" icon={LayoutTemplate} count="LO-01 to LO-70" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DemoContainer>
                <ComponentLabel id="LO-01" name="App Shell (Sidebar)" />
                <div className="h-32 border border-slate-200 rounded flex overflow-hidden group relative bg-white">
                    <div className={`bg-slate-900 h-full transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-4' : 'w-12'}`}>
                        <div className="h-4 w-4 bg-blue-500 m-2 rounded-full"></div>
                        <div className="flex-1 space-y-1 p-2">
                            <div className="h-1 bg-slate-700 rounded w-full"></div>
                            <div className="h-1 bg-slate-700 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="h-8 border-b bg-white flex items-center px-2 justify-between">
                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-400 hover:text-slate-600">
                                {sidebarCollapsed ? <PanelLeftOpen size={10}/> : <PanelLeftClose size={10}/>}
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-50 p-2">
                            <div className="h-full bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400">Main Content</div>
                        </div>
                    </div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
