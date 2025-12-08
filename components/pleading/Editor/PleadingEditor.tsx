
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Layout, Settings, FileText, Download } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { PleadingDocument, PleadingSection } from '../../../types/pleadingTypes';
import { SidebarLibrary } from './SidebarLibrary';
import { DocumentCanvas } from './DocumentCanvas';
import { PropertyPanel } from './PropertyPanel';
import { DataService } from '../../../services/dataService';
import { useNotify } from '../../../hooks/useNotify';
import { useMutation, queryClient } from '../../../services/queryClient';
import { STORES } from '../../../services/db';

interface PleadingEditorProps {
  document: PleadingDocument;
  onClose: () => void;
}

export const PleadingEditor: React.FC<PleadingEditorProps> = ({ document: initialDoc, onClose }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [document, setDocument] = useState<PleadingDocument>(initialDoc);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<'properties' | 'context'>('properties');
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: saveDocument } = useMutation(
      (doc: PleadingDocument) => DataService.pleadings.update(doc.id, doc),
      {
          onSuccess: () => {
              setIsSaving(false);
              queryClient.invalidate([STORES.PLEADINGS]);
              notify.success("Document saved.");
          },
          onError: () => {
              setIsSaving(false);
              notify.error("Failed to save.");
          }
      }
  );

  const handleSave = () => {
      setIsSaving(true);
      saveDocument({ ...document, lastAutoSaved: new Date().toISOString() });
  };

  const handleUpdateSection = (id: string, updates: Partial<PleadingSection>) => {
      const newSections = document.sections.map(s => s.id === id ? { ...s, ...updates } : s);
      setDocument({ ...document, sections: newSections });
  };

  const handleReorderSections = (newSections: PleadingSection[]) => {
      setDocument({ ...document, sections: newSections });
  };

  const handleAddSection = (type: string, index?: number) => {
      const newSection: PleadingSection = {
          id: `sec-${Date.now()}`,
          type: type as any,
          content: type === 'Heading' ? 'NEW HEADING' : type === 'Caption' ? '[Case Caption Placeholder]' : 'Enter text...',
          meta: { alignment: 'left' }
      };
      
      const sections = [...document.sections];
      if (typeof index === 'number') {
          sections.splice(index, 0, newSection);
      } else {
          sections.push(newSection);
      }
      setDocument({ ...document, sections });
      setSelectedSectionId(newSection.id);
  };

  const handleDeleteSection = (id: string) => {
      setDocument({ ...document, sections: document.sections.filter(s => s.id !== id) });
      setSelectedSectionId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className={cn("h-14 border-b flex justify-between items-center px-4 shrink-0 bg-white", theme.border.default)}>
            <div className="flex items-center gap-4">
                <Button variant="ghost" icon={ArrowLeft} onClick={onClose} size="sm">Back</Button>
                <div className="h-6 w-px bg-slate-200"></div>
                <div>
                    <h2 className={cn("text-sm font-bold", theme.text.primary)}>{document.title}</h2>
                    <p className={cn("text-xs", theme.text.secondary)}>{document.status} • {document.caseId}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Download}>Export PDF</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={handleSave} isLoading={isSaving}>Save</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Left Library */}
            <div className={cn("w-64 border-r flex flex-col shrink-0 bg-slate-50", theme.border.default)}>
                <SidebarLibrary onAddSection={handleAddSection} />
            </div>

            {/* Center Canvas */}
            <div className={cn("flex-1 bg-slate-100 overflow-y-auto p-8 flex justify-center", theme.background)}>
                 <DocumentCanvas 
                    sections={document.sections}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={setSelectedSectionId}
                    onUpdateSection={handleUpdateSection}
                    onReorderSections={handleReorderSections}
                    onDeleteSection={handleDeleteSection}
                    caseId={document.caseId}
                 />
            </div>

            {/* Right Inspector */}
            <div className={cn("w-80 border-l flex flex-col shrink-0 bg-white", theme.border.default)}>
                 <div className={cn("flex border-b", theme.border.default)}>
                     <button 
                        onClick={() => setRightPanel('properties')} 
                        className={cn("flex-1 py-3 text-xs font-bold uppercase border-b-2 transition-colors", rightPanel === 'properties' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                     >
                         Properties
                     </button>
                     <button 
                        onClick={() => setRightPanel('context')} 
                        className={cn("flex-1 py-3 text-xs font-bold uppercase border-b-2 transition-colors", rightPanel === 'context' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                     >
                         Case Context
                     </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4">
                     {rightPanel === 'properties' && (
                         <PropertyPanel 
                            section={document.sections.find(s => s.id === selectedSectionId)}
                            onUpdate={(updates) => selectedSectionId && handleUpdateSection(selectedSectionId, updates)}
                         />
                     )}
                     {rightPanel === 'context' && (
                         <div className="text-sm text-slate-500">
                             <p>Case ID: {document.caseId}</p>
                             <p className="mt-2 text-xs italic">Drag evidence or citations from here in future update.</p>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    </div>
  );
};
