
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, LayoutTemplate, Link, BookOpen, MessageSquare, UploadCloud, Download, FileText } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { PleadingDocument, PleadingSection, PleadingComment, PleadingVariable } from '../../../types/pleading-types';
import { DocumentCanvas } from './DocumentCanvas';
import { PropertyPanel } from './PropertyPanel';
import { DataService } from '../../../services/dataService';
import { useNotify } from '../../../hooks/useNotify';
import { useMutation, queryClient } from '../../../services/queryClient';
import { STORES } from '../../../services/db';

// Module Imports
import { TemplateArchitect } from '../modules/TemplateArchitect';
import { FactIntegrator } from '../modules/FactIntegrator';
import { CitationAssistant } from '../modules/CitationAssistant';
import { ReviewPanel } from '../modules/ReviewPanel';
import { FilingCenter } from '../modules/FilingCenter';

interface PleadingEditorProps {
  document: PleadingDocument;
  onClose: () => void;
}

type EditorTool = 'properties' | 'template' | 'facts' | 'research' | 'review' | 'filing';

export const PleadingEditor: React.FC<PleadingEditorProps> = ({ document: initialDoc, onClose }) => {
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

  const handleUpdateSection = useCallback((id: string, updates: Partial<PleadingSection>) => {
      setDocument(prev => ({
          ...prev,
          sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
      }));
  }, []);

  const handleReorderSections = useCallback((newSections: PleadingSection[]) => {
      setDocument(prev => ({ ...prev, sections: newSections }));
  }, []);

  const handleDeleteSection = useCallback((id: string) => {
      setDocument(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
      setSelectedSectionId(null);
  }, []);

  // Module Handlers
  const handleInsertText = (text: string) => {
      // Append to currently selected section or create new one
      if (selectedSectionId) {
          const section = document.sections.find(s => s.id === selectedSectionId);
          if (section) handleUpdateSection(selectedSectionId, { content: section.content + ' ' + text });
      } else {
          // Add new paragraph
           const newSection: PleadingSection = {
              id: `sec-${Date.now()}`,
              type: 'Paragraph',
              content: text,
              meta: { alignment: 'left' },
              order: document.sections.length
          };
          setDocument({ ...document, sections: [...document.sections, newSection] });
      }
  };

  const handleUpdateVariable = (id: string, val: string) => {
      setVariables(vars => vars.map(v => v.id === id ? { ...v, value: val } : v));
  };

  const handleAddComment = (text: string) => {
      const comment: PleadingComment = {
          id: `c-${Date.now()}`,
          sectionId: selectedSectionId || 'general',
          authorId: 'me',
          authorName: 'Current User',
          text,
          timestamp: new Date().toISOString(),
          resolved: false
      };
      setComments([...comments, comment]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className={cn("h-14 border-b flex justify-between items-center px-4 shrink-0", theme.surface.default, theme.border.default)}>
            <div className="flex items-center gap-4">
                <Button variant="ghost" icon={ArrowLeft} onClick={onClose} size="sm">Back</Button>
                <div className={cn("h-6 w-px", theme.border.default)}></div>
                <div>
                    <h2 className={cn("text-sm font-bold", theme.text.primary)}>{document.title}</h2>
                    <div className={cn("flex items-center text-xs gap-2", theme.text.secondary)}>
                        <span className={cn("px-1.5 rounded", theme.surface.highlight)}>{document.status}</span>
                        <span>Autosaved: {document.lastAutoSaved ? new Date(document.lastAutoSaved).toLocaleTimeString() : 'Just now'}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Download}>Export PDF</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={handleSave} isLoading={isSaving}>Save</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Center Canvas */}
            <div className={cn("flex-1 overflow-y-auto p-8 flex justify-center relative", theme.surface.highlight)}>
                 <DocumentCanvas 
                    sections={document.sections}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={(id) => {
                        setSelectedSectionId(id);
                        if(activeTool !== 'review') setActiveTool('properties');
                    }}
                    onUpdateSection={handleUpdateSection}
                    onReorderSections={handleReorderSections}
                    onDeleteSection={handleDeleteSection}
                    caseId={document.caseId}
                 />
            </div>

            {/* Right Multi-Module Sidebar */}
            <div className={cn("w-80 border-l flex flex-col shrink-0 shadow-xl z-10", theme.surface.default, theme.border.default)}>
                 {/* Module Switcher Tabs */}
                 <div className={cn("flex border-b overflow-x-auto no-scrollbar", theme.border.default)}>
                     {[
                         { id: 'properties', icon: FileText, title: 'Props' },
                         { id: 'template', icon: LayoutTemplate, title: 'Template' },
                         { id: 'facts', icon: Link, title: 'Facts' },
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
                                    ? cn("border-blue-600 text-blue-600", theme.surface.highlight) 
                                    : cn("border-transparent text-slate-400 hover:text-slate-600", `hover:${theme.surface.highlight}`)
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
                             onUpdateVariable={handleUpdateVariable} 
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
                             onAddComment={handleAddComment}
                             onResolveComment={(cid) => setComments(comments.map(c => c.id === cid ? { ...c, resolved: true } : c))}
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
