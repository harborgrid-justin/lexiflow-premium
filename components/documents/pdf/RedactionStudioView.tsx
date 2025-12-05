
import React, { useState, useEffect } from 'react';
import { LegalDocument } from '../../../types';
import { DataService } from '../../../services/dataService';
import { DocumentService } from '../../../services/documentService';
import { PDFViewer } from '../../common/PDFViewer';
import { PIIPanel } from '../../document/preview/PIIPanel';
import { Loader2, Eraser } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export const RedactionStudioView: React.FC = () => {
    const { theme } = useTheme();
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            const allDocs = await DataService.documents.getAll();
            const pdfDocs = allDocs.filter(d => d.type.toUpperCase().includes('PDF') || d.title.toLowerCase().endsWith('.pdf'));
            setDocuments(pdfDocs);
            if (pdfDocs.length > 0) {
                setSelectedDoc(pdfDocs[0]);
            }
            setIsLoading(false);
        };
        loadDocs();
    }, []);

    useEffect(() => {
        if (selectedDoc) {
            const loadUrl = async () => {
                const url = await DocumentService.getDocumentUrl(selectedDoc.id);
                setPreviewUrl(url);
            };
            loadUrl();
        }
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [selectedDoc]);

    return (
        <div className="flex h-full">
            {/* Document List Sidebar */}
            <div className={cn("w-72 border-r flex flex-col shrink-0", theme.border.default, theme.surfaceHighlight)}>
                <div className={cn("p-4 border-b font-bold", theme.text.primary)}>Documents to Redact</div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <Loader2 className="animate-spin m-4"/> : documents.map(doc => (
                        <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={cn(
                            "w-full text-left p-3 border-b text-sm transition-colors",
                            theme.border.light,
                            selectedDoc?.id === doc.id ? cn(theme.primary.light, theme.primary.text) : `hover:${theme.surface}`
                        )}>
                            <div className="font-medium truncate">{doc.title}</div>
                        </button>
                    ))}
                </div>
            </div>
            {/* Editor View */}
            <div className={cn("flex-1 flex", theme.surface)}>
                {selectedDoc ? (
                    <>
                        <div className="flex-1 relative bg-slate-200 dark:bg-slate-800 overflow-auto">
                            <PDFViewer url={previewUrl} />
                        </div>
                        <PIIPanel content={selectedDoc.content} onApplyRedactions={() => alert("Redacted!")} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Eraser className="h-12 w-12 mb-4 opacity-50"/>
                        Select a document to begin PII scan.
                    </div>
                )}
            </div>
        </div>
    );
};
