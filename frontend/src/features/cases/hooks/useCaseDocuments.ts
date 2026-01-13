import { useState, useRef, useCallback } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers';
import { queryClient } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
import { queryKeys } from '@/utils/queryKeys';
import { CaseId, EvidenceId, EvidenceItem, UUID, WorkflowTask, LegalDocument } from '@/types';
import { SystemEventType } from '@/types/integration-types';

export function useCaseDocuments(
  documents: LegalDocument[], 
  onDocumentCreated?: (doc: LegalDocument) => void
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();

  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logAsEvidence, setLogAsEvidence] = useState(false);

  const handleTaskSaved = useCallback((task: WorkflowTask) => {
    DataService.tasks.add(task);
    queryClient.invalidate(queryKeys.tasks.all());
    queryClient.invalidate(queryKeys.dashboard.stats());
    notify.success(`Task "${task.title}" created.`);
  }, [notify]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onDocumentCreated) {
      setIsUploading(true);
      try {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file) return;
        
        // Upload via DataService Facade (Backend API)
        const savedDoc = await DataService.documents.upload(file, {
          caseId: (documents.length > 0 ? documents[0]?.caseId : 'General') as CaseId,
          type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
          title: file.name,
          status: 'Draft',
          tags: logAsEvidence ? ['Evidence'] : []
        });

        // Trigger integration event
        await IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, { document: savedDoc });

        if (logAsEvidence) {
          // Auto-create Evidence Item
          const evidence: EvidenceItem = {
            id: `ev-${Date.now()}` as EvidenceId,
            trackingUuid: crypto.randomUUID() as UUID,
            caseId: savedDoc.caseId,
            title: savedDoc.title,
            type: 'Document',
            description: 'Auto-logged via Document Upload',
            collectionDate: new Date().toISOString().split('T')[0] || '',
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
            fileSize: typeof savedDoc.fileSize === 'string' ? savedDoc.fileSize : String(savedDoc.fileSize)
          };
          await DataService.evidence.add(evidence);
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
  }, [documents, logAsEvidence, onDocumentCreated, notify]);

  const handleCloseTaskModal = useCallback(() => setTaskModalDoc(null), []);

  return {
    fileInputRef,
    taskModalDoc,
    setTaskModalDoc,
    isUploading,
    logAsEvidence,
    setLogAsEvidence,
    handleTaskSaved,
    handleFileSelect,
    handleCloseTaskModal,
    openWindow,
    closeWindow
  };
}
