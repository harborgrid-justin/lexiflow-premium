import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, LayoutTemplate, Link as LinkIcon, BookOpen, MessageSquare, UploadCloud, Download, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PleadingDocument, PleadingSection, PleadingComment, PleadingVariable } from '../../types/pleadingTypes';
import { DocumentCanvas } from './Canvas/DocumentCanvas';
import { PropertyPanel } from './Editor/PropertyPanel';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';
import { useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';

// Module Imports
import { TemplateArchitect } from './modules/TemplateArchitect';
import { FactIntegrator } from './modules/FactIntegrator';
import { CitationAssistant } from './modules/CitationAssistant';
import { ReviewPanel } from './modules/ReviewPanel';
import { FilingCenter } from './modules/FilingCenter';

interface PleadingDesignerProps {
  pleading: PleadingDocument;
  onBack: () => void;
}

type EditorTool = 'properties' | 'template' | 'facts' | 'research' | 'review' | 'filing';

export const PleadingDesigner: React.FC<PleadingDesignerProps> = ({ pleading: initialDoc, onBack }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [document, setDocument] = useState<PleadingDocument>(initialDoc);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('properties');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for comments/variables (normally would be in document object, mocking here for UI flow)
  const [comments, setComments] = useState<PleadingComment[]>(document.comments || []);
  const [variables, setVariables] = useState<PleadingVariable[]>(document.variables || [
      { id: 'v1', key: 'PlaintiffName', label: 'Plaintiff Name', value: 'Justin Saadein-Morales', source: 'Case' },
      { id: 'v2', key: 'DefendantName', label: 'Defendant Name', value: 'Westridge Swim & Racquet Club', source: 'Case' },
      { id: 'v3', key: 'Court', label: 'Court Name', value: 'US District Court', source: 'System' }
  ]);

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
      saveDocument({ ...document, comments, variables, lastAutoSaved: new Date().toISOString() });
  };

  const handleUpdateSection = (id: string, updates: Partial<PleadingSection>) => {
      const newSections = document.sections.map(s => s.id === id ? { ...s, ...updates } : s);
      setDocument({ ...document, sections: newSections });
  };

  // Handler for inserting text into a section
  const handleInsertText = (text: string) => {
      if (selectedSectionId) {
          const section = document.sections.find(s => s.id === selectedSectionId);
          if (section) handleUpdateSection(selectedSectionId, { content: section.content + ' ' + text });
      } else {
           const newSection: PleadingSection = {
              id: `sec-${Date.now()}`,
              type: 'Paragraph',
              content: text,
              order: document.sections.length
          };
          setDocument({ ...document, sections: [...document.sections, newSection] });
      }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className={cn("h-14 border-b flex justify-between items-center px-4 shrink-0", theme.surface, theme.border.default)}>
            <div className="flex items-center gap-4">
                <Button variant="ghost" icon={ArrowLeft} onClick={onBack} size="sm">Back</Button>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Download}>Export PDF</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={handleSave} isLoading={isSaving}>Save</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Center Canvas */}
            <div className={cn("flex-1 overflow-y-auto p-8 flex justify-center relative", theme.surfaceHighlight)}>
                 {/* This would contain the PleadingCanvas component */}
            </div>

            {/* Right Multi-Module Sidebar */}
            <div className={cn("w-80 border-l flex flex-col shrink-0 shadow-xl z-10", theme.surface, theme.border.default)}>
                 {/* Module Switcher Tabs */}
                 <div className={cn("flex border-b overflow-x-auto no-scrollbar", theme.border.default)}>
                     {[
                         { id: 'properties', icon: FileText, title: 'Props' },
                         { id: 'template', icon: LayoutTemplate, title: 'Template' },
                         { id: 'facts', icon: LinkIcon, title: 'Facts' },
                         { id: 'research', icon: BookOpen, title: 'Auth' },
                         { id: 'review', icon: MessageSquare, title: 'Review' },
                         { id: 'filing', icon: UploadCloud, title: 'Filing' },
                     ].map(tool => (
                         <button 
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as EditorTool)} 
                            className={cn(
                                "flex-1 py-3 px-2 flex flex-col items-center justify-center min-w-[50px] border-b-2 transition-colors", 
                                activeTool === tool.id 
                                    ? cn("border-blue-600 text-blue-600", theme.surfaceHighlight) 
                                    : cn("border-transparent text-slate-400 hover:text-slate-600", `hover:${theme.surfaceHighlight}`)
                            )}
                            title={tool.title}
                         >
                             <tool.icon className="h-4 w-4 mb-0.5" />
                             <span className="text-[9px] font-bold uppercase">{tool.title}</span>
                         </button>
                     ))}
                 </div>
                 
                 {/* Module Content Area */}
                 <div className="flex-1 overflow-hidden flex flex-col relative">
                     {activeTool === 'properties' && (
                         <div className="flex-1 overflow-y-auto p-4">
                            <PropertyPanel 
                                section={document.sections.find(s => s.id === selectedSectionId)}
                                onUpdate={(updates) => selectedSectionId && handleUpdateSection(selectedSectionId, updates)}
                            />
                         </div>
                     )}

                     {activeTool === 'template' && (
                         <TemplateArchitect 
                             variables={variables} 
                             jurisdiction="Federal" 
                             onUpdateVariable={() => {}} 
                         />
                     )}

                     {activeTool === 'facts' && (
                         <FactIntegrator 
                             caseId={document.caseId} 
                             onInsertFact={handleInsertText} 
                         />
                     )}

                     {activeTool === 'research' && (
                         <CitationAssistant 
                             onInsertCitation={handleInsertText} 
                         />
                     )}

                     {activeTool === 'review' && (
                         <ReviewPanel 
                             comments={comments} 
                             caseId={document.caseId}
                             docId={document.id}
                             onAddComment={() => {}}
                             onResolveComment={() => {}}
                         />
                     )}

                     {activeTool === 'filing' && (
                         <FilingCenter 
                             onExport={() => alert("Exporting...")}
                             isReady={document.status === 'Final'}
                         />
                     )}
                 </div>
            </div>
        </div>
    </div>
  );
};
