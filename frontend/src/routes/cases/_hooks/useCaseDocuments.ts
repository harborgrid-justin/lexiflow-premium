import { useState, useRef, useCallback, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers';
import { queryClient } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { queryKeys } from '@/utils/queryKeys';
import { WorkflowTask, LegalDocument } from '@/types';
import { useFetcher } from 'react-router';

export function useCaseDocuments(
  documents: LegalDocument[], 
  onDocumentCreated?: (doc: LegalDocument) => void
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();
  const fetcher = useFetcher<{ success: boolean; message?: string; error?: string; document?: LegalDocument }>();

  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  const isUploading = fetcher.state !== "idle";
  const [logAsEvidence, setLogAsEvidence] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        notify.success(fetcher.data.message || "Document uploaded successfully");
        if (logAsEvidence) {
          notify.success("Document logged to Evidence Vault.");
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLogAsEvidence(false);
        if (onDocumentCreated && fetcher.data.document) {
          onDocumentCreated(fetcher.data.document);
        }
      } else {
        notify.error(fetcher.data.error || "Failed to upload document");
      }
    }
  }, [fetcher.state, fetcher.data, notify, logAsEvidence, onDocumentCreated]);

  const handleTaskSaved = useCallback((task: WorkflowTask) => {
    DataService.tasks.add(task);
    queryClient.invalidate(queryKeys.tasks.all());
    queryClient.invalidate(queryKeys.dashboard.stats());
    notify.success(`Task "${task.title}" created.`);
  }, [notify]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("intent", "add-document");
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("logAsEvidence", String(logAsEvidence));

      fetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    }
  }, [fetcher, logAsEvidence]);

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
