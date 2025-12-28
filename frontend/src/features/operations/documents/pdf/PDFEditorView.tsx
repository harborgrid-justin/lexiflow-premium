
import React, { useState, useEffect } from 'react';
import { LegalDocument } from '@/types';
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { DocumentService } from '@/services/features/documents/documentService';
import { PDFViewer } from '@/components/organisms/PDFViewer';
import { AcrobatToolbar, PDFTool } from '../preview/AcrobatToolbar';
import { InteractiveOverlay, Field } from '../preview/InteractiveOverlay';
import { Modal } from '@/components/molecules/Modal';
import { SignaturePad } from '@/components/organisms/SignaturePad';
import { Button } from '@/components/atoms/Button';
import { FileText, Loader2 } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useBlobRegistry } from '@/hooks/useBlobRegistry';
import { useSingleSelection } from '@/hooks/useMultiSelection';
import { ErrorState } from '@/components/molecules/ErrorState';

export function PDFEditorView() {
    const { theme } = useTheme();
    const documentSelection = useSingleSelection<LegalDocument>(null, (a, b) => a.id === b.id);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Registry hook for managing blob lifecycle
    const { register } = useBlobRegistry();
    
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

    // PDF viewer state
    const [activeTool, setActiveTool] = useState<PDFTool>('select');
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
    const [signModalOpen, setSignModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<Field | null>(null);

    // Select first PDF document when documents load
    useEffect(() => {
        if (documents.length > 0 && !documentSelection.selected) {
            documentSelection.select(documents[0]);
        }
    }, [documents, documentSelection.selected]);

    useEffect(() => {
        let isMounted = true;
        if (documentSelection.selected) {
            const loadUrl = async () => {
                const blob = await DataService.documents.getFile(documentSelection.selected!.id);
                if (isMounted && blob) {
                    const url = register(blob);
                    setPreviewUrl(url);
                } else if (isMounted) {
                    setPreviewUrl(null);
                }
            };
            loadUrl();
        } else {
             setPreviewUrl(null);
        }
        return () => { isMounted = false; };
    }, [documentSelection.selected, register]);
    
    const handleFieldClick = (field: Field) => {
        if (field.type === 'signature' || field.type === 'initials') {
            setActiveField(field);
            setSignModalOpen(true);
        }
    };
    
    const handleSignatureSave = (signed: boolean) => {
        if (signed && activeField) {
            activeField.value = "Signed by User";
            setSignModalOpen(false);
            setActiveField(null);
        }
    };

    if (error) {
        return <ErrorState message="Failed to load documents" onRetry={refetch} />;
    }

    return (
        <div className="flex h-full">
            {/* Document List Sidebar */}
            <div className={cn("w-72 border-r flex flex-col shrink-0", theme.border.default, theme.surface.highlight)}>
                <div className={cn("p-4 border-b font-bold", theme.text.primary)}>PDF Documents</div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <Loader2 className="animate-spin m-4"/> : documents.map(doc => (
                        <button key={doc.id} onClick={() => documentSelection.select(doc)} className={cn(
                            "w-full text-left p-3 border-b text-sm transition-colors",
                            theme.border.default,
                            documentSelection.selected?.id === doc.id ? cn(theme.primary.light, theme.primary.text) : `hover:${theme.surface.default}`
                        )}>
                            <div className="font-medium truncate">{doc.title}</div>
                            <div className={cn("text-xs opacity-70", documentSelection.selected?.id === doc.id ? "" : theme.text.secondary)}>{doc.fileSize}</div>
                        </button>
                    ))}
                </div>
            </div>
            {/* Editor View */}
            <div className={cn("flex-1 flex flex-col", theme.surface.default)}>
                {documentSelection.selected ? (
                    <>
                        <AcrobatToolbar 
                            activeTool={activeTool} setActiveTool={setActiveTool}
                            scale={scale} setScale={setScale}
                            rotation={rotation} setRotation={setRotation}
                            pageNum={pageNum} setPageNum={setPageNum}
                            totalPages={10} // Mock
                        />
                        <div className={cn("flex-1 relative overflow-auto", theme.surface.highlight)}>
                            <PDFViewer url={previewUrl} scale={scale} rotation={rotation} onPageLoad={setPageDims}>
                                <InteractiveOverlay activeTool={activeTool} dimensions={pageDims} onFieldClick={handleFieldClick} />
                            </PDFViewer>
                        </div>
                    </>
                ) : (
                    <div className={cn("flex-1 flex items-center justify-center", theme.text.tertiary)}>Select a document to begin.</div>
                )}
            </div>
            {/* Modals */}
             <Modal isOpen={signModalOpen} onClose={() => setSignModalOpen(false)} title="Sign Document" size="sm">
                <div className="p-6">
                    <p className={cn("text-sm mb-4", theme.text.secondary)}>Draw your signature below to sign this field.</p>
                    <SignaturePad value={false} onChange={handleSignatureSave} label="Draw Signature" subtext="I certify this signature is valid."/>
                    <div className="mt-4 flex justify-end"> <Button variant="secondary" onClick={() => setSignModalOpen(false)}>Cancel</Button> </div>
                </div>
            </Modal>
        </div>
    );
};
