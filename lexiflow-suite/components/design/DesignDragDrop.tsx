
import React, { useState } from 'react';
import { Move, GripVertical } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignDragDrop = () => {
  const [dropZoneStatus, setDropZoneStatus] = useState('idle');

  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Drag & Drop Interactions" icon={Move} count="DD-01 to DD-30" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="DD-01" name="Draggable List Item" />
                <div 
                    draggable
                    className="bg-white border border-slate-200 rounded p-2 flex items-center shadow-sm cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-all hover:border-blue-300 active:scale-[0.98]"
                >
                    <GripVertical className="h-4 w-4 text-slate-400 mr-2"/>
                    <span className="text-sm text-slate-700 font-medium">Drag Me</span>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="DD-03" name="Drop Zone (Generic)" />
                <div 
                    className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-xs font-medium h-20 transition-all duration-200 ${
                        dropZoneStatus === 'hover' ? 'bg-blue-50 border-blue-400 text-blue-600 scale-[1.02]' :
                        'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDropZoneStatus('hover'); }}
                    onDragLeave={() => setDropZoneStatus('idle')}
                    onDrop={(e) => { e.preventDefault(); setDropZoneStatus('idle'); }}
                >
                    Drop items here
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
