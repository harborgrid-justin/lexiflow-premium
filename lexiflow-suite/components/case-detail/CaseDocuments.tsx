
import React, { useState, useTransition, useCallback } from 'react';
import { LegalDocument } from '../../types.ts';
import { FileText, CheckSquare, UploadCloud, MoreVertical, ShieldCheck, Download, Wand2 } from 'lucide-react';
import { DocumentAssembly } from '../DocumentAssembly.tsx';
import { TaskCreationModal } from '../common/TaskCreationModal.tsx';
import { FileIcon, TagList } from '../common/Primitives.tsx';
import { Badge } from '../common/Badge.tsx';

interface CaseDocumentsProps {
  documents: LegalDocument[];
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onDocumentCreated?: (doc: LegalDocument) => void;
}

export const CaseDocuments: React.FC<CaseDocumentsProps> = ({ documents, analyzingId, onAnalyze, onDocumentCreated }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [taskModalDoc, setTaskModalDoc] = useState<LegalDocument | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const handleUpload = useCallback(() => {
    if (onDocumentCreated) {
        startTransition(() => {
            const newDoc: LegalDocument = {
                id: `doc-${crypto.randomUUID()}`, 
                caseId: 'current',
                title: `Uploaded Document ${documents.length + 1}`,
                type: 'Upload',
                content: 'Mock content...',
                uploadDate: new Date().toISOString().split('T')[0],
                lastModified: new Date().toISOString().split('T')[0],
                tags: ['Uploaded'],
                versions: []
            };
            onDocumentCreated(newDoc);
        });
    }
  }, [onDocumentCreated, documents.length]);

  return (
    <div className={`space-y-6 relative transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {showWizard && (
        <DocumentAssembly 
          caseTitle="Current Case" 
          onClose={() => setShowWizard(false)} 
          onSave={(doc) => onDocumentCreated && startTransition(() => onDocumentCreated(doc))}
        />
      )}

      {taskModalDoc && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setTaskModalDoc(null)} 
            initialTitle={`Review Document: ${taskModalDoc.title}`}
            relatedModule="Documents"
            relatedItemId={taskModalDoc.id}
            relatedItemTitle={taskModalDoc.title}
        />
      )}
      
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-blue-200 rounded-xl py-8 flex flex-col items-center justify-center text-blue-500 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer gap-3 group relative overflow-hidden"
        onClick={handleUpload}
      >
        <div className="absolute inset-0 bg-blue-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform relative z-10 border border-blue-100">
            <UploadCloud className="h-6 w-6 text-blue-600"/>
        </div>
        <div className="text-center relative z-10">
            <span className="text-sm font-bold block text-blue-700">Click to upload</span>
            <span className="text-[10px] text-blue-400 font-medium">or drag and drop files here</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <FileText className="h-4 w-4 mr-2 text-slate-500"/> Repository ({documents.length})
        </h3>
        <button onClick={() => setShowWizard(true)} className="w-full sm:w-auto text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm hover:shadow">
            <Wand2 className="h-3.5 w-3.5 mr-2"/> Assemble New
        </button>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc) => (
          <div key={doc.id} className="group flex flex-col sm:flex-row sm:items-center p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
            <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
                    <FileIcon type={doc.type} className="h-6 w-6" />
                </div>
                
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{doc.title}</h4>
                        {doc.isEncrypted && <ShieldCheck size={12} className="text-green-600 shrink-0" title="Encrypted"/>}
                        {doc.status && (
                            <Badge variant={doc.status === 'Signed' ? 'success' : doc.status === 'Draft' ? 'warning' : 'neutral'} className="text-[9px] py-0 px-1.5 h-4 flex items-center">
                                {doc.status}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600 bg-slate-50 px-1.5 rounded">{doc.type}</span>
                        <span className="hidden xs:inline">•</span>
                        <span>{doc.uploadDate}</span>
                        <div className="hidden sm:flex gap-1 ml-2">
                            {doc.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-1 mt-3 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onAnalyze(doc); }}
                    className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors border border-transparent hover:border-indigo-100" 
                    title="AI Analyze"
                >
                    {analyzingId === doc.id ? <Wand2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4"/>}
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setTaskModalDoc(doc); }}
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                    title="Create Task"
                >
                    <CheckSquare className="h-4 w-4"/>
                </button>
                <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                    <Download className="h-4 w-4"/>
                </button>
                <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4"/>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
