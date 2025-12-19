
import React, { useState, useEffect } from 'react';
import { LegalDocument } from '../../../types';
import { DataService } from '../../../services/data/dataService';
import { useQuery } from '../../../hooks/useQueryHooks';
import { queryKeys } from '../../../utils/queryKeys';
import { DocumentService } from '../../../services/features/documents/documentService';
import { BlobManager } from '../../../services/infrastructure/blobManager';
import { PDFViewer } from '../../common/PDFViewer';
import { PIIPanel } from '../preview/PIIPanel';
import { Loader2, Eraser } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useSingleSelection } from '../../../hooks/useMultiSelection';
import { ErrorState } from '../../common/ErrorState';

export const RedactionStudioView: React.FC = () => {
    const { theme } = useTheme();
    const documentSelection = useSingleSelection<LegalDocument>(null, (a, b) => a.id === b.id);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Load documents from IndexedDB via useQuery for accurate, cached data
    const { data: allDocs = [], isLoading, error, refetch } = useQuery(
        queryKeys.documents.all(),
        () => DataService.documents.getAll()
    );
    
    // Filter PDF documents
    const documents = React.useMemo(() => 
        Array.isArray(allDocs) ? allDocs.filter(d => d.type.toUpperCase().includes('PDF') || d.title.toLowerCase().endsWith('.pdf')) : [],
        [allDocs]
    );
    
    // Set initial document
    useEffect(() => {
        if (documents.length > 0 && !documentSelection.selected) {
            documentSelection.select(documents[0]);
        }
    }, [documents, documentSelection.selected]);

    useEffect(() => {
        if (documentSelection.selected) {
            const loadUrl = async () => {
                const url = await DocumentService.getDocumentUrl(documentSelection.selected.id);
                setPreviewUrl(url);
            };
            loadUrl();
        }
        return () => {
            if (previewUrl) {
                BlobManager.revoke(previewUrl);
            }
        };
    }, [documentSelection.selected]);

    if (error) {
        return <ErrorState message="Failed to load documents" onRetry={refetch} />;
    }

    return (
        <div className="flex h-full">
            {/* Document List Sidebar */}
            <div className={cn("w-72 border-r flex flex-col shrink-0", theme.border.default, theme.surface.highlight)}>
                <div className={cn("p-4 border-b font-bold", theme.text.primary)}>Documents to Redact</div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <Loader2 className="animate-spin m-4"/> : documents.map(doc => (
                        <button key={doc.id} onClick={() => documentSelection.select(doc)} className={cn(
                            "w-full text-left p-3 border-b text-sm transition-colors",
                            theme.border.default,
                            documentSelection.selected?.id === doc.id ? cn(theme.primary.light, theme.primary.text) : `hover:${theme.surface.default}`
                        )}>
                            <div className="font-medium truncate">{doc.title}</div>
                        </button>
                    ))}
                </div>
            </div>
            {/* Editor View */}
            <div className={cn("flex-1 flex", theme.surface.default)}>
                {documentSelection.selected ? (
                    <>
                        <div className={cn("flex-1 relative overflow-auto", theme.surface.highlight)}>
                            <PDFViewer url={previewUrl} />
                        </div>
                        <PIIPanel content={documentSelection.selected.content} onApplyRedactions={() => alert("Redacted!")} />
                    </>
                ) : (
                    <div className={cn("flex-1 flex flex-col items-center justify-center", theme.text.tertiary)}>
                        <Eraser className="h-12 w-12 mb-4 opacity-50"/>
                        Select a document to begin PII scan.
                    </div>
                )}
            </div>
        </div>
    );
};
