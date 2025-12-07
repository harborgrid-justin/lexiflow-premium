
import React, { useState, useRef, lazy, Suspense } from 'react';
import { LegalDocument, EvidenceItem, WorkflowTask } from '../../types';
import { FileText, Plus, Wand2, Cpu, Loader2, ShieldCheck, Eye } from 'lucide-react';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { useTheme } from '../../context/ThemeContext';
// FIX: Corrected import path for cn utility
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { DocumentService } from '../../services/documentService';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';
import { queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { CaseDocumentItem } from './documents/CaseDocumentItem'; // Updated import path
import { Button } from '../common/Button'; // Ensure Button is imported

// FIX: Lazy load DocumentAssembly
const DocumentAssembly = lazy(() => import('../DocumentAssembly').then(m => ({ default: m.DocumentAssembly })));

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
      // FIX: Wrap lazy-loaded component in Suspense
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600 h-8 w-8" />}>
        <DocumentAssembly
          windowId={id}
          caseTitle="Current Case"
          onClose={() => closeWindow(id)}
          onSave={(doc) => {
            if (onDocumentCreated) onDocumentCreated(doc);
            closeWindow(id);
          }}
        />
      </Suspense>
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
            className={cn("px-4 py-2 border rounded-md text-sm w-full md:w-64 outline-none focus:ring-2", theme.surface.default, theme.border.default, theme.text.primary, "focus:ring-blue-500")}
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
            <ShieldCheck className={cn("h-4 w-4 mr-1", logAsEvidence ? "text-blue-600" : theme.text.tertiary)} />
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
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <CaseDocumentItem
            key={doc.id}
            doc={doc}
            analyzingId={analyzingId}
            onAnalyze={onAnalyze}
            onTaskClick={setTaskModalDoc}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};