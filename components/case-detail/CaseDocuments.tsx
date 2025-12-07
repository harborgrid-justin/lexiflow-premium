import React, { useState, useRef } from 'react';
import { LegalDocument, EvidenceItem, WorkflowTask } from '../../types';
import { FileText, Sparkles, Bot, Plus, Wand2, Eye, CheckSquare, Cpu, Loader2, ShieldCheck } from 'lucide-react';
import { DocumentAssembly } from '../DocumentAssembly';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { DocumentService } from '../../services/documentService';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';
import { queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';

interface CaseDocumentsProps {
  documents: LegalDocument[];
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onDocumentCreated?: (doc: LegalDocument) => void;
}

export const CaseDocuments: React.FC<CaseDocumentsProps> = ({ documents, analyzingId, onAnalyze, onDocumentCreated }) => {
  const { theme } = useTheme();
  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  const { openWindow, closeWindow } = useWindow();
  const [isUploading, setIsUploading] = useState(false);
  const [logAsEvidence, setLogAsEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notify = useNotify();

  const handleOpenWizard = () => {
      const id = 'doc-assembly-wizard';
      openWindow(
          id, 
          'Drafting Wizard', 
          <DocumentAssembly 
            windowId={id}
            caseTitle="Current Case" 
            onClose={() => closeWindow(id)} 
            onSave={(doc) => {
                if (onDocumentCreated) onDocumentCreated(doc);
                closeWindow(id);
            }}
          />
      );
  };

  const handleTaskSaved = (task: WorkflowTask) => {
      DataService.tasks.add(task);
      queryClient.invalidate([STORES.TASKS, 'all']);
      queryClient.invalidate(['dashboard', 'stats']);
      notify.success(`Task "${task.title}" created.`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onDocumentCreated) {
        setIsUploading(true);
        try {
            const file = e.target.files[0];
            // Upload to IDB via DocumentService
            const savedDoc = await DocumentService.uploadDocument(file, {
                caseId: documents.length > 0 ? documents[0].caseId : 'General',
                sourceModule: 'General',
                tags: logAsEvidence ? ['Evidence'] : []
            });
            
            if (logAsEvidence) {
                // Auto-create Evidence Item
                const evidence: EvidenceItem = {
                    id: `ev-${Date.now()}`,
                    trackingUuid: crypto.randomUUID(),
                    caseId: savedDoc.caseId,
                    title: savedDoc.title,
                    type: 'Document',
                    description: 'Auto-logged via Document Upload',
                    collectionDate: new Date().toISOString().split('T')[0],
                    collectedBy: 'System',
                    custodian: 'Firm DMS',
                    location: 'Evidence Vault',
                    admissibility: 'Pending',
                    chainOfCustody: [{
                        id: `cc-${Date.now()}`,
                        date: new Date().toISOString(),
                        action: 'Intake from DMS',
                        actor: 'System',
                        notes: 'Linked from Case Documents'
                    }],
                    tags: ['Document'],
                    fileSize: savedDoc.fileSize
                };
                await DataService.evidence.add(evidence);
                notify.success("Document uploaded and logged to Evidence Vault.");
            } else {
                notify.success(`Uploaded ${file.name} successfully.`);
            }
            
            onDocumentCreated(savedDoc);
        } catch (error) {
            notify.error("Failed to upload document.");
            console.error(error);
        } finally {
            setIsUploading(false);
            setLogAsEvidence(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
  };

  return (
    <div className="space-y-6 relative">
      {taskModalDoc && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setTaskModalDoc(null)} 
            onSave={handleTaskSaved}
            initialTitle={`Review Document: ${taskModalDoc.title}`}
            relatedModule="Documents"
            relatedItemId={taskModalDoc.id}
            relatedItemTitle={taskModalDoc.title}
        />
      )}
      
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex gap-2">
          <input 
            placeholder="Search documents..." 
            className={cn("px-4 py-2 border rounded-md text-sm w-full md:w-64 outline-none focus:ring-2", theme.surface, theme.border.default, theme.text.primary, "focus:ring-blue-500")} 
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
          <label className={cn("flex items-center text-sm cursor-pointer select-none", theme.text.secondary)}>
             <input 
               type="checkbox" 
               className="mr-2 rounded text-blue-600 focus:ring-blue-500"
               checked={logAsEvidence}
               onChange={(e) => setLogAsEvidence(e.target.checked)}
             />
             <ShieldCheck className={cn("h-4 w-4 mr-1", logAsEvidence ? "text-blue-600" : theme.text.tertiary)}/>
             Log as Evidence
          </label>
          <button onClick={handleOpenWizard} className={cn("flex-1 md:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow", theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover)}>
            <Wand2 className="h-4 w-4 mr-2" /> Assemble Doc
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className={cn("flex-1 md:flex-none flex items-center justify-center px-4 py-2 text-white rounded-md text-sm font-medium transition-colors", theme.primary.DEFAULT, theme.primary.hover, isUploading ? "opacity-70 cursor-not-allowed" : "")}
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Plus className="h-4 w-4 mr-2" />} 
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className={cn("p-4 rounded-lg shadow-sm border animate-fade-in-up group transition-all hover:border-blue-300", theme.surface, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="bg-red-50 p-3 rounded-lg"><FileText className="h-6 w-6 text-red-600" /></div>
                <div>
                  <h4 className={cn("font-semibold", theme.text.primary)}>{doc.title}</h4>
                  <div className={cn("text-xs mt-1", theme.text.secondary)}>{doc.type} • {doc.uploadDate} • {doc.fileSize}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                    onClick={() => setTaskModalDoc(doc)}
                    className={cn("px-3 py-1.5 rounded-md text-sm font-medium border flex items-center transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`, `hover:${theme.primary.text}`)}
                    title="Create Task"
                >
                    <CheckSquare className="h-4 w-4 mr-1.5"/> Task
                </button>
                <button 
                    onClick={() => onAnalyze(doc)} 
                    disabled={analyzingId === doc.id} 
                    className={cn("px-3 py-1.5 rounded-md text-sm font-medium border flex items-center", analyzingId === doc.id ? "opacity-50 cursor-not-allowed" : "", "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100")}
                >
                    {analyzingId === doc.id ? <Cpu className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>} <span className="ml-2">Analyze</span>
                </button>
              </div>
            </div>
            
            {doc.content && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Eye className={cn("h-3 w-3", theme.text.tertiary)}/>
                        <p className={cn("text-xs font-semibold uppercase", theme.text.tertiary)}>Content Preview</p>
                    </div>
                    <div className={cn("p-3 rounded border text-sm font-serif italic line-clamp-3", theme.surfaceHighlight, theme.border.light, theme.text.secondary)}>
                        "{doc.content.length > 250 ? doc.content.substring(0, 250) + '...' : doc.content}"
                    </div>
                </div>
            )}

            {doc.summary && (
              <div className="bg-indigo-50/50 rounded p-4 border border-indigo-100 mt-4 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l"></div>
                <div className="flex justify-between mb-2"><h5 className="text-sm font-bold text-indigo-900 flex items-center"><Bot className="h-4 w-4 mr-2"/> Summary</h5></div>
                <p className="text-sm text-slate-700">{doc.summary}</p>
              </div>
            )}
            <div className="flex gap-2 mt-3">
                {doc.tags.map(t => <span key={t} className={cn("px-2 py-0.5 text-xs rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
