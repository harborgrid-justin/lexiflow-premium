import { useCallback, useRef, useState } from "react";

import { useNotify } from "@/hooks/useNotify";
import { queryClient, useMutation } from "@/hooks/useQueryHooks";
import { useWindow } from "@/providers";
import { DataService } from "@/services/data/data-service.service";
import { type LegalDocument, type WorkflowTask } from "@/types";
import { queryKeys } from "@/utils/queryKeys";

export function useCaseDocuments(
  documents: LegalDocument[],
  onDocumentCreated?: (doc: LegalDocument) => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();

  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  const [logAsEvidence, setLogAsEvidence] = useState(false);

  // Use standardized useMutation for document upload
  const { mutate: uploadDocument, isLoading: isUploading } = useMutation(
    async (formData: FormData) => {
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const logEvidence = formData.get("logAsEvidence") === "true";

      // Upload document through DataService
      const result = await DataService.documents.add({
        title,
        file,
        category: "Case Document",
        tags: logEvidence ? ["evidence"] : [],
      });

      return { document: result, logEvidence };
    },
    {
      onSuccess: ({ document, logEvidence }) => {
        notify.success("Document uploaded successfully");
        if (logEvidence) {
          notify.success("Document logged to Evidence Vault.");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLogAsEvidence(false);
        if (onDocumentCreated && document) {
          onDocumentCreated(document as LegalDocument);
        }
        queryClient.invalidate(queryKeys.documents.all());
      },
      onError: (error) => {
        notify.error("Failed to upload document");
        console.error("Document upload error:", error);
      },
    },
  );

  const handleTaskSaved = useCallback(
    (task: WorkflowTask) => {
      DataService.tasks.add(task);
      queryClient.invalidate(queryKeys.tasks.all());
      queryClient.invalidate(queryKeys.dashboard.stats());
      notify.success(`Task "${task.title}" created.`);
    },
    [notify],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        formData.append("logAsEvidence", String(logAsEvidence));

        uploadDocument(formData);
      }
    },
    [uploadDocument, logAsEvidence],
  );

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
    closeWindow,
  };
}
