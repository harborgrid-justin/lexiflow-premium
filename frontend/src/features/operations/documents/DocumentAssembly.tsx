// components/DocumentAssembly.tsx
import { useState } from 'react';
import { X, Wand2, Minus } from 'lucide-react';
import { GeminiService } from '@/services/features/research/geminiService';
import { LegalDocument, DocumentId, CaseId } from '@/types';
import { useWindow } from '@/providers/WindowContext';
import { DataService } from '@/services/data/dataService';
import { useMutation, queryClient } from '@/hooks/backend';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { useNotify } from '@/hooks/core';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { getTodayString } from '@/utils/dateUtils';
import { Step1TemplateSelection, Step2FormConfiguration, Step3DraftReview } from '@features/document-assembly';

interface DocumentAssemblyProps {
  onClose: () => void;
  caseTitle: string;
  onSave?: (doc: LegalDocument) => void;
  windowId?: string; // Optional ID for window management
}

export function DocumentAssembly({ onClose, caseTitle, onSave, windowId }: DocumentAssemblyProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('');
  const [formData, setFormData] = useState({ recipient: '', date: '', mainPoint: '' });
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { minimizeWindow } = useWindow();
  const notify = useNotify();

  const generate = async () => {
    setStep(3);
    setIsStreaming(true);
    setResult('');

    const context = `Template: ${template}. Case: ${caseTitle}. Recipient: ${formData.recipient}. Point: ${formData.mainPoint}.`;

    const stream = GeminiService.streamDraft(context, 'Document');

    for await (const chunk of stream) {
        setResult(prev => prev + chunk);
    }
    setIsStreaming(false);
  };

  const { mutate: saveDocument, isLoading: isSaving } = useMutation(
      DataService.documents.add,
      {
          onSuccess: (newDoc) => {
              const doc = newDoc as LegalDocument;
              notify.success(`Draft saved to case file: ${doc.title}`);
              if (onSave) onSave(doc);
              queryClient.invalidate(queryKeys.documents.all());
              onClose();
          },
          onError: () => notify.error("Failed to save document.")
      }
  );

  const handleSave = () => {
    if (result) {
      const newDoc: LegalDocument = {
        id: `gen-${Date.now()}` as DocumentId,
        caseId: 'current' as CaseId,
        title: `${template} - ${new Date().toLocaleDateString()}`,
        type: 'Generated',
        content: result,
        uploadDate: getTodayString(),
        lastModified: getTodayString(),
        tags: ['AI Generated', template],
        versions: [],
        sourceModule: 'Drafting'
      };
      saveDocument(newDoc);
    }
  };

  const handleMinimize = () => {
    if (windowId) {
        minimizeWindow(windowId);
    }
  };

  const handleSelectTemplate = (templateName: string) => {
    setTemplate(templateName);
    setStep(2);
  };

  const handleFormChange = (data: typeof formData) => {
    setFormData(data);
  };

  return (
    <div className={cn("flex flex-col h-full", theme.surface.default, theme.text.primary)}>
        <div className={cn("p-4 border-b flex justify-between items-center drag-handle cursor-move", theme.border.default, theme.surface.highlight)}>
          <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
            <Wand2 className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" /> Document Ghostwriter
          </h3>
          <div className="flex items-center gap-2">
            {windowId && (
                <button title="Minimize window" onClick={handleMinimize} className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
                    <Minus className="h-5 w-5" />
                </button>
            )}
            <button title="Close window" onClick={onClose} className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && <Step1TemplateSelection onSelectTemplate={handleSelectTemplate} />}

          {step === 2 && <Step2FormConfiguration template={template} formData={formData} onFormDataChange={handleFormChange} onGenerate={generate} />}

          {step === 3 && <Step3DraftReview result={result} isStreaming={isStreaming} isSaving={isSaving} onSave={handleSave} />}
        </div>
    </div>
  );
}


