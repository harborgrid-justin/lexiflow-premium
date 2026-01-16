/**
 * CaseDocuments.tsx
 *
 * Document management interface with AI analysis, task creation, compliance scanning,
 * and lazy-loaded document assembly integration.
 *
 * @module components/case-detail/CaseDocuments
 * @category Case Management - Documents & Analysis
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with lazy-loaded modules
 * - Guideline 28: Theme usage is pure function of context
 * - Guideline 29: Suspense boundaries for DocumentAssembly (lazy loading)
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for document list transitions
 */

// External Dependencies
import { Loader2, Plus, ShieldCheck, Wand2 } from 'lucide-react';
import React, { lazy, Suspense } from 'react';

// Internal Dependencies - Components
import { TaskCreationModal } from '@/routes/cases/ui/components/TaskCreationModal/TaskCreationModal';
import { CaseDocumentItem } from './documents/CaseDocumentItem';

// Internal Dependencies - Hooks & Context
import { useCaseDocuments } from '@/routes/cases/hooks/useCaseDocuments';
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

// Types & Interfaces
import { LegalDocument } from '@/types';

const DocumentAssembly = lazy(() => import('@/routes/documents/components/DocumentAssembly').then(m => ({ default: m.DocumentAssembly })));

interface CaseDocumentsProps {
  documents: LegalDocument[];
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onDocumentCreated?: (doc: LegalDocument) => void;
}

export const CaseDocuments: React.FC<CaseDocumentsProps> = ({ documents, analyzingId, onAnalyze, onDocumentCreated }) => {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const {
    fileInputRef,
    taskModalDoc,
    setTaskModalDoc,
    isUploading,
    logAsEvidence,
    setLogAsEvidence,
    handleTaskSaved,
    handleFileSelect,
    openWindow,
    closeWindow
  } = useCaseDocuments(documents, onDocumentCreated);

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
            onAddTask={() => setTaskModalDoc(doc)}
          />
        ))}
        {documents.length === 0 && (
          <div className={cn("text-center py-12 rounded-lg border border-dashed", theme.border.default, theme.text.tertiary)}>
            No documents found. Upload new or assemble from template.
          </div>
        )}
      </div>
    </div>
  );
};
