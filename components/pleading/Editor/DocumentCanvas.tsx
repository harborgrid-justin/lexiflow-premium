
import React, { useRef, useState } from 'react';
import { PleadingSection, PleadingSectionType } from '../../../types/pleadingTypes';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { CaseId } from '../../../types';

interface DocumentCanvasProps {
  sections: PleadingSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onUpdateSection: (id: string, updates: Partial<PleadingSection>) => void;
  onReorderSections: (sections: PleadingSection[]) => void;
  onDeleteSection: (id: string) => void;
  caseId: CaseId;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  sections, selectedSectionId, onSelectSection, onUpdateSection, onReorderSections, onDeleteSection, caseId
}) => {
  const { theme } = useTheme();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverIndex(null);
      const type = e.dataTransfer.getData('pleading/section-type');
      if (type) {
          // Add new section logic handled by parent if needed, 
          // but for reordering internal or adding new we need to lift state.
          // For simplicity in this demo, assume we just log it or handle via a prop callback 
          // if we wanted drag-to-insert.
          // Real implementation would call onAddSection(type, index) passed from parent.
          console.log("Dropped type", type, "at index", index);
      }
  };

  // Renderers for different section types
  const renderSectionContent = (section: PleadingSection) => {
      switch (section.type) {
          case 'Caption':
              return (
                  <div className="border border-slate-300 p-4 mb-4 grid grid-cols-2 text-sm font-serif">
                      <div className="border-r border-slate-300 pr-4">
                          <p>JUSTIN SAADEIN-MORALES</p>
                          <p>Plaintiff,</p>
                          <p className="my-4">v.</p>
                          <p>WESTRIDGE SWIM & RACQUET CLUB, INC.</p>
                          <p>Defendant.</p>
                      </div>
                      <div className="pl-4">
                          <p>Case No. {caseId}</p>
                          <p className="font-bold mt-4 underline">COMPLAINT FOR DAMAGES</p>
                      </div>
                  </div>
              );
          case 'Heading':
              return (
                  <input
                    className="w-full text-center font-bold font-serif text-lg outline-none bg-transparent placeholder:text-slate-300 uppercase underline"
                    value={section.content}
                    onChange={(e) => onUpdateSection(section.id, { content: e.target.value })}
                  />
              );
          case 'Signature':
              return (
                  <div className="mt-8">
                      <p className="mb-8">Respectfully submitted,</p>
                      <div className="border-t border-black w-64 pt-1">
                          <p>Justin Saadein-Morales</p>
                          <p>Pro Se Plaintiff</p>
                      </div>
                  </div>
              );
          default:
              return (
                  <textarea
                    className="w-full resize-none overflow-hidden bg-transparent outline-none font-serif text-base leading-relaxed h-auto min-h-[4rem]"
                    value={section.content}
                    onChange={(e) => {
                        onUpdateSection(section.id, { content: e.target.value });
                        // Auto-grow
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Type legal content here..."
                  />
              );
      }
  };

  return (
    <div 
        className="w-[8.5in] min-h-[11in] bg-white shadow-2xl p-[1in] relative transition-all"
        onClick={() => onSelectSection(null)}
    >
        {sections.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-slate-300 text-lg font-bold uppercase">Drag components here to build pleading</p>
            </div>
        )}

        {sections.map((section, idx) => (
            <div 
                key={section.id}
                onClick={(e) => { e.stopPropagation(); onSelectSection(section.id); }}
                className={cn(
                    "relative group mb-4 p-2 transition-all border-2 border-transparent rounded",
                    selectedSectionId === section.id ? "border-blue-400 bg-blue-50/20" : "hover:border-slate-200"
                )}
            >
                {/* Controls Overlay */}
                {selectedSectionId === section.id && (
                    <div className="absolute -right-10 top-0 flex flex-col gap-1">
                         <button onClick={() => onDeleteSection(section.id)} className="p-2 bg-white shadow rounded-full text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                         <button className="p-2 bg-white shadow rounded-full text-slate-500 cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4"/></button>
                    </div>
                )}
                
                {renderSectionContent(section)}
            </div>
        ))}
    </div>
  );
};
