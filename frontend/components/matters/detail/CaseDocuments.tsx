/**
 * CaseDocuments.tsx
 * 
 * Document management interface with AI analysis, task creation, compliance scanning,
 * and lazy-loaded document assembly integration.
 * 
 * @module components/case-detail/CaseDocuments
 * @category Case Management - Documents & Analysis
 */

// External Dependencies
import React, { useState, useRef, lazy, Suspense } from 'react';
import { FileText, Plus, Wand2, Cpu, Loader2, ShieldCheck, Eye } from 'lucide-react';

// Internal Dependencies - Components
import { TaskCreationModal } from '../../common/TaskCreationModal';
import { CaseDocumentItem } from './documents/CaseDocumentItem';
import { Button } from '../../common/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';
import { useWindow } from '../../../context/WindowContext';
import { useNotify } from '../../../hooks/useNotify';

// Internal Dependencies - Services & Utils
import { DocumentService } from '../../../services/features/documents/documentService';
import { DataService } from '../../../services/data/dataService';
import { queryClient } from '../../../hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '../../../utils/queryKeys';
import { IntegrationOrchestrator } from '../../../services/integration/integrationOrchestrator';
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { LegalDocument, EvidenceItem, WorkflowTask, CaseId, EvidenceId } from '../../../types';
import { SystemEventType } from '../../../types/integration-types';

const DocumentAssembly = lazy(() => import('../../operations/documents/DocumentAssembly').then(m => ({ default: m.DocumentAssembly })));

interface CaseDocumentsProps {
  documents: LegalDocument[];
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onDocumentCreated?: (doc: LegalDocument) => void;
}

export const CaseDocuments: React.FC<CaseDocumentsProps> = ({ documents, analyzingId, onAnalyze, onDocumentCreated }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logAsEvidence, setLogAsEvidence] = useState(false);

  const handleOpenWizard = () => {
    const id = 'doc-assembly-wizard';
    openWindow(
      id,
      'Drafting Wizard',
      <Suspense fallback={<Loader2 className={cn("animate-spin h-8 w-8", theme.text.link)} />}>
        <DocumentAssembly
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
    queryClient.invalidate(queryKeys.tasks.all());
    queryClient.invalidate(queryKeys.dashboard.stats());
    notify.success(`Task "${task.title}" created.`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onDocumentCreated) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        // Upload to IDB via DocumentService
        const savedDoc = await DocumentService.uploadDocument(file, {
          caseId: (documents.length > 0 ? documents[0].caseId : 'General') as CaseId,
          sourceModule: 'General',
          tags: logAsEvidence ? ['Evidence'] : []
        });

        // INTEGRATION POINT: Trigger orchestrator
        IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, { document: savedDoc });

        if (logAsEvidence) {
          // Auto-create Evidence Item
          const evidence: EvidenceItem = {
            id: `ev-${Date.now()}` as EvidenceId,
            trackingUuid: crypto.randomUUID() as any,
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
          // INVALIDATE EVIDENCE CACHE
          queryClient.invalidate(queryKeys.evidence.all());
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

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} aria-label="Upload document" />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex gap-2">
          <input
            placeholder="Search documents..."
            className={cn("px-4 py-2 border rounded-md text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
          <label className={cn("flex items-center text-sm cursor-pointer select-none", theme.text.secondary)}>
            <input
              type="checkbox"
              className={cn("mr-2 rounded focus:ring-2 focus:ring-blue-500", theme.action.primary.text)}
              checked={logAsEvidence}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogAsEvidence(e.target.checked)}
            />
            <ShieldCheck className={cn("h-4 w-4 mr-1", logAsEvidence ? theme.text.link : theme.text.tertiary)} />
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


