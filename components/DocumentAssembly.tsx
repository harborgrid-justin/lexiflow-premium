
import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronRight, Check, Save, Wand2, Activity, Minus } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { LegalDocument } from '../types';
import { useWindow } from '../context/WindowContext';
import { DataService } from '../services/dataService';
import { useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useNotify } from '../hooks/useNotify';

interface DocumentAssemblyProps {
  onClose: () => void;
  caseTitle: string;
  onSave?: (doc: LegalDocument) => void;
  windowId?: string; // Optional ID for window management
}

export const DocumentAssembly: React.FC<DocumentAssemblyProps> = ({ onClose, caseTitle, onSave, windowId }) => {
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
        id: `gen-${Date.now()}`, // Temporary ID, DB will likely re-assign or use this
        caseId: 'current', // Needs proper case context injection in real app, using 'current' placeholder
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

  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 drag-handle cursor-move">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-purple-600" /> Document Ghostwriter
          </h3>
          <div className="flex items-center gap-2">
            {windowId && (
                <button onClick={handleMinimize} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
                    <Minus className="h-5 w-5" />
                </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Select a Template</h4>
              {['NDA', 'Engagement Letter', 'Motion to Dismiss', 'Settlement Agreement'].map(t => (
                <button key={t} onClick={() => { setTemplate(t); setStep(2); }} 
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all flex justify-between items-center group">
                  <span className="font-medium text-slate-700 group-hover:text-purple-700">{t}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500" />
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Configure {template}</h4>
              <input placeholder="Recipient Name" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none" 
                value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} />
              <input placeholder="Key Terms / Main Point" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none" 
                value={formData.mainPoint} onChange={e => setFormData({...formData, mainPoint: e.target.value})} />
              <button onClick={generate} className="w-full py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 flex justify-center transition-colors shadow-md">
                 Start Generation
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                  <h4 className="text-base font-semibold flex items-center text-green-600">
                     {isStreaming ? <Activity className="h-4 w-4 mr-2 animate-pulse"/> : <Check className="h-4 w-4 mr-2"/>} 
                     {isStreaming ? 'Ghostwriting...' : 'Draft Generated'}
                  </h4>
                  {isStreaming && <span className="text-xs text-slate-400 animate-pulse">Streaming tokens...</span>}
              </div>
              
              <div className="flex-1 relative">
                  <textarea 
                    className="w-full h-full p-6 bg-slate-50 border rounded-md font-mono text-sm min-h-[350px] resize-none outline-none focus:ring-2 focus:ring-purple-500 shadow-inner" 
                    value={result} 
                    readOnly 
                  />
                  {isStreaming && (
                      <div className="absolute bottom-4 right-4">
                          <div className="h-2 w-2 bg-purple-600 rounded-full animate-ping"></div>
                      </div>
                  )}
              </div>

              <button 
                onClick={handleSave} 
                disabled={isStreaming || isSaving}
                className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Save className="h-4 w-4 mr-2"/> {isSaving ? 'Saving...' : 'Save to Case Documents'}
              </button>
            </div>
          )}
        </div>
    </div>
  );
};
