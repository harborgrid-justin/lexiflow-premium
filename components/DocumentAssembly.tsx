
// components/DocumentAssembly.tsx
import React, { useState, useEffect } from 'react';
import { X, Wand2, Activity, Minus } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { LegalDocument, DocumentId, CaseId } from '../types';
import { useWindow } from '../context/WindowContext';
import { DataService } from '../services/dataService';
import { useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useNotify } from '../hooks/useNotify';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { Step1TemplateSelection } from './document-assembly/Step1TemplateSelection'; // Updated import path
import { Step2FormConfiguration } from './document-assembly/Step2FormConfiguration'; // Updated import path
import { Step3DraftReview } from './document-assembly/Step3DraftReview'; // Updated import path

interface DocumentAssemblyProps {
  onClose: () => void;
  caseTitle: string;
  onSave?: (doc: LegalDocument) => void;
  windowId?: string; // Optional ID for window management
}

export const DocumentAssembly: React.FC<DocumentAssemblyProps> = ({ onClose, caseTitle, onSave, windowId }) => {
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
              notify.success(`Draft saved to case file: ${newDoc.title}`);
              if (onSave) onSave(newDoc);
              queryClient.invalidate([STORES.DOCUMENTS, 'all']);
              onClose();
          },
          onError: () => notify.error("Failed to save document.")
      }
  );

  const handleSave = () => {
    if (result) {
      const newDoc: LegalDocument = {
        // FIX: Cast string to branded type DocumentId
        id: `gen-${Date.now()}` as DocumentId,
        // FIX: Cast string to branded type CaseId
        caseId: 'current' as CaseId,
        title: `${template} - ${new Date().toLocaleDateString()}`,
        type: 'Generated',
        content: result,
        uploadDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
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
                <button onClick={handleMinimize} className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
                    <Minus className="h-5 w-5" />
                </button>
            )}
            <button onClick={onClose} className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
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
};
